const service = require('../services/products.service')
const { handleError } = require('../utils/handleError')

const getAll = async (req, res) => {
  try {
    const { category, showInactive } = req.query
    const products = await service.getAll({ category, showInactive: showInactive === 'true' })
    res.json({ success: true, data: products })
  } catch (err) {
    handleError(res, err)
  }
}

const getCategories = async (req, res) => {
  try {
    const categories = await service.getCategories()
    res.json({ success: true, data: categories })
  } catch (err) {
    handleError(res, err)
  }
}

const getProductById = async (req, res) => {
  try {
    const product = await service.getById(Number(req.params.id))
    res.json({ success: true, data: product })
  } catch (err) {
    handleError(res, err)
  }
}

const create = async (req, res) => {
  try {
    const product = await service.create(req.body)
    res.status(201).json({ success: true, data: product })
  } catch (err) {
    handleError(res, err)
  }
}

const update = async (req, res) => {
  try {
    const product = await service.update(Number(req.params.id), req.body)
    res.json({ success: true, data: product })
  } catch (err) {
    handleError(res, err)
  }
}

const remove = async (req, res) => {
  try {
    await service.remove(Number(req.params.id))
    res.json({ success: true })
  } catch (err) {
    handleError(res, err)
  }
}

const restore = async (req, res) => {
  try {
    const product = await service.restore(Number(req.params.id))
    res.json({ success: true, data: product })
  } catch (err) {
    handleError(res, err)
  }
}

const destroy = async (req, res) => {
  try {
    await service.destroy(Number(req.params.id))
    res.json({ success: true })
  } catch (err) {
    handleError(res, err)
  }
}

module.exports = { getAll, getCategories, getProductById, create, update, remove, restore, destroy }
