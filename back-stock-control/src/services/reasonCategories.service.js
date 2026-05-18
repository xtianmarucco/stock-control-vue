const repo = require('../repositories/reasonCategories.repository')

const getAll = async () => {
  const categories = await repo.findAll()

  return categories.map(category => ({
    id: category.id,
    code: category.code,
    label: category.label,
    movement_type: category.movement_type
  }))
}

module.exports = { getAll }
