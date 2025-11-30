const pool = require('../db');

/**
 * Razones permitidas por tipo de movimiento
 */
const allowedReasons = {
  ADJUSTMENT: ['EXPIRED', 'BROKEN', 'BOX_FINISHED'],
  INTERNAL: ['SUPPLIER_UNLOAD', 'OTHER_INCOME'],
  TRANSFER: [] // no aplica
};

/**
 * POST /api/stock-movements
 * Registra un movimiento de stock con múltiples productos
 */
const createStockMovement = async (req, res) => {
  const {
    from_branch_id,
    to_branch_id,
    movement_type,
    reason_category,
    reason,
    items
  } = req.body;

  // Validación básica
  if (!movement_type || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      error: 'Movement type and at least one item are required.'
    });
  }

  // Validación de tipo
  const allowed = allowedReasons[movement_type];
  if (!allowed && allowed !== []) {
    return res.status(400).json({ error: `Invalid movement_type: ${movement_type}` });
  }

  // Validación de reason_category para TRANSFER
  if (movement_type === 'TRANSFER' && reason_category) {
    return res.status(400).json({
      error: 'reason_category should not be provided for TRANSFER movements.'
    });
  }

  // Validación reason_category para ADJUSTMENT o INTERNAL
  if ((movement_type === 'ADJUSTMENT' || movement_type === 'INTERNAL') &&
    !allowed.includes(reason_category)) {
    return res.status(400).json({
      error: `Invalid reason_category for movement type ${movement_type}. Allowed: ${allowed.join(', ')}`
    });
  }

  try {
    await pool.query('BEGIN');

    // Insertar movimiento (con reason_category agregado)
    const movementInsertQuery = `
      INSERT INTO stock_movements (from_branch_id, to_branch_id, movement_type, reason_category, reason)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    const result = await pool.query(movementInsertQuery, [
      from_branch_id,
      to_branch_id,
      movement_type,
      reason_category || null,
      reason || null
    ]);

    const movementId = result.rows[0].id;

    // Procesar cada item
    for (const item of items) {
      const { product_id, quantity } = item;

      // Validar producto
      const checkProduct = await pool.query(
        'SELECT id FROM products WHERE id = $1',
        [product_id]
      );
      if (checkProduct.rowCount === 0) {
        await pool.query('ROLLBACK');
        return res.status(400).json({
          error: `Product ID ${product_id} does not exist`
        });
      }

      // Insertar ítem
      await pool.query(
        `INSERT INTO stock_movement_items (movement_id, product_id, quantity)
         VALUES ($1, $2, $3)`,
        [movementId, product_id, quantity]
      );

      /**
       * Actualizar stock
       * ________________________________________
       * TRANSFER: restar origen, sumar destino
       * ADJUSTMENT: restar en sucursal origen
       * INTERNAL: sumar en sucursal destino
       */

      if (movement_type === 'TRANSFER') {
        // restar origen
        await pool.query(`
          INSERT INTO stock (branch_id, product_id, total)
          VALUES ($1, $2, 0)
          ON CONFLICT (branch_id, product_id)
          DO UPDATE SET total = GREATEST(stock.total - $3, 0)
        `, [from_branch_id, product_id, quantity]);

        // sumar destino
        await pool.query(`
          INSERT INTO stock (branch_id, product_id, total)
          VALUES ($1, $2, $3)
          ON CONFLICT (branch_id, product_id)
          DO UPDATE SET total = stock.total + $3
        `, [to_branch_id, product_id, quantity]);
      }

      else if (movement_type === 'ADJUSTMENT') {
        // ajustes restan stock (por EXPIRED, BROKEN, etc.)
        await pool.query(`
          INSERT INTO stock (branch_id, product_id, total)
          VALUES ($1, $2, 0)
          ON CONFLICT (branch_id, product_id)
          DO UPDATE SET total = GREATEST(stock.total - $3, 0)
        `, [from_branch_id, product_id, quantity]);
      }

      else if (movement_type === 'INTERNAL') {
        // INTERNAL suma stock (descarga proveedor, ingresos internos)
        await pool.query(`
          INSERT INTO stock (branch_id, product_id, total)
          VALUES ($1, $2, $3)
          ON CONFLICT (branch_id, product_id)
          DO UPDATE SET total = stock.total + $3
        `, [to_branch_id, product_id, quantity]);
      }
    }

    await pool.query('COMMIT');
    res.status(201).json({ message: 'Stock movement registered successfully.', movement_id: movementId });

  } catch (error) {
    console.error('❌ Error creating stock movement:', error.message);
    await pool.query('ROLLBACK');
    res.status(500).json({ error: 'Error creating stock movement' });
  }
};

/**
 * GET /api/stock-movements
 * Devuelve movimientos agrupados con support para filtros
 */
const getStockMovements = async (req, res) => {
  const { branch_id, type, from, to } = req.query;
  const values = [];
  const conditions = [];

  if (branch_id) {
    conditions.push('(m.from_branch_id = $1 OR m.to_branch_id = $1)');
    values.push(branch_id);
  }

  if (type) {
    conditions.push(`m.movement_type = $${values.length + 1}`);
    values.push(type);
  }

  if (from) {
    conditions.push(`m.created_at >= $${values.length + 1}`);
    values.push(from);
  }

  if (to) {
    // incluir todo el día
    conditions.push(`m.created_at < $${values.length + 1}::date + interval '1 day'`);
    values.push(to);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT 
      m.id AS movement_id,
      m.from_branch_id,
      m.to_branch_id,
      m.movement_type,
      m.reason_category,
      m.reason,
      m.created_at,
      i.product_id,
      p.name AS product_name,
      i.quantity
    FROM stock_movements m
    JOIN stock_movement_items i ON i.movement_id = m.id
    JOIN products p ON p.id = i.product_id
    ${whereClause}
    ORDER BY m.created_at DESC;
  `;

  try {
    const result = await pool.query(query, values);

    // AGRUPAR POR movement_id
    const grouped = {};

    result.rows.forEach(row => {
      if (!grouped[row.movement_id]) {
        grouped[row.movement_id] = {
          id: row.movement_id,
          from_branch_id: row.from_branch_id,
          to_branch_id: row.to_branch_id,
          movement_type: row.movement_type,
          reason_category: row.reason_category,
          reason: row.reason,
          created_at: row.created_at,
          items: []
        };
      }

      grouped[row.movement_id].items.push({
        product_id: row.product_id,
        product_name: row.product_name,
        quantity: row.quantity
      });
    });

    res.json(Object.values(grouped));

  } catch (error) {
    console.error('❌ Error fetching stock movements:', error.message);
    res.status(500).json({ error: 'Error fetching stock movements' });
  }
};
/**
 * GET /api/stock-movements/:id
 * Devuelve un movimiento de stock específico por su ID.
 * Incluye reason_category y items agrupados.
 */
const getStockMovementById = async (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      m.id,
      m.from_branch_id,
      from_b.name AS from_branch_name,
      m.to_branch_id,
      to_b.name AS to_branch_name,
      m.movement_type,
      m.reason_category,
      m.reason,
      m.created_at,
      json_agg(
        json_build_object(
          'product_id', i.product_id,
          'product_name', p.name,
          'quantity', i.quantity
        )
      ) AS items
    FROM stock_movements m
    LEFT JOIN branches from_b ON from_b.id = m.from_branch_id
    LEFT JOIN branches to_b ON to_b.id = m.to_branch_id
    JOIN stock_movement_items i ON i.movement_id = m.id
    JOIN products p ON p.id = i.product_id
    WHERE m.id = $1
    GROUP BY 
      m.id, from_b.name, to_b.name;
  `;

  try {
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Stock movement not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('❌ Error fetching stock movement by ID:', error.message);
    res.status(500).json({ error: 'Error fetching stock movement' });
  }
};

module.exports = {
  createStockMovement,
  getStockMovements,
  getStockMovementById,

};