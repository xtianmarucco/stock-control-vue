const fs = require('fs');
const path = require('path');
const pool = require('./src/db'); // Usa tu conexión existente a PostgreSQL
require('dotenv').config();

// Ruta de la carpeta donde están los archivos .json por categoría
const folderPath = path.join(__dirname, 'json-data');

// Inserta un solo producto en la base
async function insertProduct(product) {
  const {
    productPresentationId: id,
    productSKU: sku,
    productTitle: name,
    productSummary: summary,
    categoryId,
    categoryName,
    brandName,
    supplierName,
    distributorSupplierName: distributorName,
    imgSmall: image_url,
    weight,
    volume,
    isCombo,
    isMonoproduct,
    quantityPackagePallets: pallet_units,
    baseId,
    volumeBases: volume_base,
    purchaseType
  } = product;

  const query = `
    INSERT INTO products (
      id, sku, name, summary,
      category_id, category_name,
      brand_name, supplier_name, distributor_name,
      image_url, weight, volume,
      is_combo, is_monoproduct, pallet_units,
      base_id, volume_base,
      purchase_type_json, is_available
    ) VALUES (
      $1, $2, $3, $4,
      $5, $6,
      $7, $8, $9,
      $10, $11, $12,
      $13, $14, $15,
      $16, $17,
      $18, TRUE
    )
    ON CONFLICT (id) DO NOTHING;
  `;

  const values = [
    id, sku, name, summary,
    categoryId, categoryName,
    brandName, supplierName, distributorName,
    image_url, weight, volume,
    !!isCombo, !!isMonoproduct, pallet_units,
    baseId, volume_base,
    JSON.stringify(purchaseType)
  ];

  await pool.query(query, values);
}

// Lee todos los archivos .json y ejecuta insert por producto
async function importAllProducts() {
  const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.json'));

  for (const file of files) {
    const fullPath = path.join(folderPath, file);
    const rawData = fs.readFileSync(fullPath, 'utf-8');
    const products = JSON.parse(rawData);

    console.log(`📥 Importing from ${file} (${products.length} products)`);

    for (const product of products) {
      try {
        await insertProduct(product);
      } catch (err) {
        console.error(`❌ Error inserting product ${product.productTitle} (${product.productPresentationId})`, err.message);
      }
    }
  }

  console.log('✅ Import complete.');
  process.exit();
}

importAllProducts();