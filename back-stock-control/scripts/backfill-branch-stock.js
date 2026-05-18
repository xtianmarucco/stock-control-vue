const prisma = require('../src/lib/prisma')

async function main() {
  const branches = await prisma.branches.findMany({ where: { is_active: true }, select: { id: true, name: true } })
  const products = await prisma.products.findMany({ select: { id: true, name: true } })

  console.log(`Sucursales activas: ${branches.length}`)
  console.log(`Productos totales: ${products.length}`)

  let inserted = 0
  for (const product of products) {
    const result = await prisma.branch_stock.createMany({
      data: branches.map(b => ({ product_id: product.id, branch_id: b.id, total: 0 })),
      skipDuplicates: true
    })
    inserted += result.count
  }

  console.log(`Registros insertados: ${inserted}`)
  console.log('Backfill completado.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
