const pool = require('../db');

/**
 * POST /api/stock-movements
 * Registra un movimiento de stock con múltiples productos
 */
const createStockMovement = async (req, res) => {
  const { from_branch_id, to_branch_id, movement_type, reason, items } = req.body;

  // Paso 1: Extraer todos los product_id del payload
const productIds = items.map(item => item.product_id);

// Paso 2: Verificar si existen en la tabla products
const verifyQuery = `
  SELECT id FROM products WHERE id = ANY($1)
`;
const verifyResult = await pool.query(verifyQuery, [productIds]);

const foundIds = verifyResult.rows.map(row => row.id);

// Paso 3: Comparar: ¿faltan algunos?
const missingIds = productIds.filter(id => !foundIds.includes(id));

if (missingIds.length > 0) {
  return res.status(400).json({
    error: 'Uno o más productos no existen',
    missing_product_ids: missingIds
  });
}

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'No items provided' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Insertar encabezado
    const insertMovementQuery = `
      INSERT INTO stock_movements (from_branch_id, to_branch_id, movement_type, reason)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;
    const { rows } = await client.query(insertMovementQuery, [
      from_branch_id, to_branch_id, movement_type, reason,
    ]);
    const movementId = rows[0].id;

    // 2. Insertar ítems y actualizar stock
    for (const item of items) {
      const { product_id, quantity } = item;

      // 2a. Insertar ítem del movimiento
      await client.query(`
        INSERT INTO stock_movement_items (movement_id, product_id, quantity)
        VALUES ($1, $2, $3);
      `, [movementId, product_id, quantity]);

      // 2b. Restar del stock de origen
      await client.query(`
        UPDATE stock
        SET
          big_chamber = GREATEST(big_chamber - $3, 0),
          updated_at = CURRENT_TIMESTAMP
        WHERE product_id = $1 AND branch_id = $2;
      `, [product_id, from_branch_id, quantity]);

      // 2c. Sumar al stock de destino (crear si no existe)
      const upsertStock = `
        INSERT INTO stock (product_id, branch_id, big_chamber, updated_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT (product_id, branch_id) DO UPDATE
        SET big_chamber = stock.big_chamber + EXCLUDED.big_chamber,
            updated_at = CURRENT_TIMESTAMP;
      `;
      await client.query(upsertStock, [product_id, to_branch_id, quantity]);
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Stock movement created', movement_id: movementId });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating stock movement:', err);
    res.status(500).json({ error: 'Error creating stock movement' });
  } finally {
    client.release();
  }
};
/**
 * GET /api/stock-movements
 * Devuelve movimientos de stock con filtros opcionales:
 * - branch_id (como origen o destino)
 * - type
 * - from / to (rango de fechas)
 */
const getStockMovements = async (req, res) => {
  const { branch_id, type, from, to } = req.query;
  const values = [];
  const conditions = [];

  // Si se pasa branch_id, filtramos por origen o destino
  if (branch_id) {
    conditions.push('(m.from_branch_id = $1 OR m.to_branch_id = $1)');
    values.push(branch_id);
  }

  // Si se pasa type (TRANSFER, ADJUSTMENT...), lo filtramos
  if (type) {
    conditions.push(`m.movement_type = $${values.length + 1}`);
    values.push(type);
  }

  // Filtrar desde una fecha específica (inclusive)
  if (from) {
    conditions.push(`m.created_at >= $${values.length + 1}`);
    values.push(from);
  }

  // Filtrar hasta una fecha específica (inclusive, todo el día)
  if (to) {
    // Esta línea hace que el filtro incluya todo el día (hasta las 23:59:59)
    conditions.push(`m.created_at < $${values.length + 1}::date + interval '1 day'`);
    values.push(to);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT 
      m.id AS movement_id,
      m.from_branch_id,
      m.to_branch_id,
      m.movement_type,
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

    // Agrupar por movimiento
    const grouped = {};

    result.rows.forEach(row => {
      const id = row.movement_id;
      if (!grouped[id]) {
        grouped[id] = {
          id,
          from_branch_id: row.from_branch_id,
          to_branch_id: row.to_branch_id,
          movement_type: row.movement_type,
          reason: row.reason,
          created_at: row.created_at,
          items: []
        };
      }

      grouped[id].items.push({
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
 */
const getStockMovementById = async (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      m.id,
      m.from_branch_id,
      from_b.name as from_branch_name,
      m.to_branch_id,
      to_b.name as to_branch_name,
      m.movement_type,
      m.reason,
      m.created_at,
      json_agg(json_build_object(
        'product_id', i.product_id,
        'product_name', p.name,
        'quantity', i.quantity
      )) as items
    FROM stock_movements m
    LEFT JOIN branches from_b ON from_b.id = m.from_branch_id
    LEFT JOIN branches to_b ON to_b.id = m.to_branch_id
    JOIN stock_movement_items i ON i.movement_id = m.id
    JOIN products p ON p.id = i.product_id
    WHERE m.id = $1
    GROUP BY m.id, from_b.name, to_b.name;
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

console.log('✅ stockMovements routes loaded');

module.exports = {
  createStockMovement,
  getStockMovements,
  getStockMovementById,
};