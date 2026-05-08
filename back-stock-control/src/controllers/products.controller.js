const prisma = require('../lib/prisma')

const getProductById = async (req, res) => {
  const id = Number(req.params.id)
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' })
  try {
    const product = await prisma.products.findUnique({ where: { id } })
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' })
    res.json({ data: product })
  } catch (error) {
    console.error('❌ Error fetching product by id:', error)
    res.status(500).json({ error: 'Error al obtener el producto' })
  }
}

module.exports = { getProductById }
