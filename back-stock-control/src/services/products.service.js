const repo = require('../repositories/products.repository')
const { createError } = require('../utils/handleError')

const getAll = (filters) => repo.findAll(filters)

const getCategories = () => repo.findCategories()

const getById = async (id) => {
  const product = await repo.findById(id)
  if (!product) throw createError('Product not found', 'NOT_FOUND', 404)
  return product
}

const create = async (body) => {
  const { name, category_name, unidades_x_pack, cajas_x_pack, unidades_x_caja } = body

  if (!name?.trim()) throw createError('name is required', 'VALIDATION_ERROR', 400)
  if (!category_name?.trim()) throw createError('category_name is required', 'VALIDATION_ERROR', 400)

  const existing = await repo.findByName(name.trim())
  if (existing) throw createError('Ya existe un producto con ese nombre', 'CONFLICT', 409)

  const pack = Number(unidades_x_pack)
  if (!Number.isInteger(pack) || pack < 1)
    throw createError('unidades_x_pack must be a positive integer', 'VALIDATION_ERROR', 400)

  const cajas = cajas_x_pack != null ? Number(cajas_x_pack) : null
  const uXCaja = unidades_x_caja != null ? Number(unidades_x_caja) : null

  if (cajas !== null && (!Number.isInteger(cajas) || cajas < 1))
    throw createError('cajas_x_pack must be a positive integer', 'VALIDATION_ERROR', 400)

  if (uXCaja !== null && (!Number.isInteger(uXCaja) || uXCaja < 1))
    throw createError('unidades_x_caja must be a positive integer', 'VALIDATION_ERROR', 400)

  if ((cajas !== null) !== (uXCaja !== null))
    throw createError('cajas_x_pack and unidades_x_caja must both be set or both be null', 'VALIDATION_ERROR', 400)

  return repo.create({
    name: name.trim(),
    category_name: category_name.trim(),
    unidades_x_pack: pack,
    cajas_x_pack: cajas,
    unidades_x_caja: uXCaja
  })
}

const update = async (id, body) => {
  const existing = await repo.findById(id)
  if (!existing) throw createError('Product not found', 'NOT_FOUND', 404)

  const { name, category_name, unidades_x_pack, cajas_x_pack, unidades_x_caja, is_available } = body
  const data = {}

  if (name !== undefined) {
    if (!name?.trim()) throw createError('name cannot be empty', 'VALIDATION_ERROR', 400)
    const conflict = await repo.findByName(name.trim())
    if (conflict && conflict.id !== id) throw createError('Ya existe un producto con ese nombre', 'CONFLICT', 409)
    data.name = name.trim()
  }

  if (category_name !== undefined) {
    if (!category_name?.trim()) throw createError('category_name cannot be empty', 'VALIDATION_ERROR', 400)
    data.category_name = category_name.trim()
  }

  if (unidades_x_pack !== undefined) {
    const pack = Number(unidades_x_pack)
    if (!Number.isInteger(pack) || pack < 1)
      throw createError('unidades_x_pack must be a positive integer', 'VALIDATION_ERROR', 400)
    data.unidades_x_pack = pack
  }

  if (cajas_x_pack !== undefined) data.cajas_x_pack = cajas_x_pack != null ? Number(cajas_x_pack) : null
  if (unidades_x_caja !== undefined) data.unidades_x_caja = unidades_x_caja != null ? Number(unidades_x_caja) : null
  if (is_available !== undefined) data.is_available = Boolean(is_available)

  return repo.update(id, data)
}

const remove = async (id) => {
  const existing = await repo.findById(id)
  if (!existing) throw createError('Product not found', 'NOT_FOUND', 404)
  return repo.softDelete(id)
}

const restore = async (id) => {
  const existing = await repo.findById(id)
  if (!existing) throw createError('Product not found', 'NOT_FOUND', 404)
  return repo.update(id, { is_available: true })
}

module.exports = { getAll, getCategories, getById, create, update, remove, restore }
