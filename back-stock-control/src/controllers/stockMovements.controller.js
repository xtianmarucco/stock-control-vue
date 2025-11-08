const pool = require('../db');

/**
 * POST /api/stock-movements
 * Registra un movimiento de stock con múltiples productos
 */
const createStockMovement = async (req, res) => {
  const { from_branch_id, to_branch_id, movement_type, reason, items } = req.body;

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

console.log('✅ stockMovements routes loaded');

module.exports = {
  createStockMovement,
};