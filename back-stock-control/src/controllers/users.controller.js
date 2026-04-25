const service = require('../services/users.service')
const { handleError } = require('../utils/handleError')

const getAllUsers = async (req, res) => {
  try {
    const data = await service.getAll()
    res.json({ success: true, data })
  } catch (err) {
    handleError(res, err)
  }
}

const createUser = async (req, res) => {
  try {
    const data = await service.create(req.body)
    res.status(201).json({ success: true, data })
  } catch (err) {
    handleError(res, err)
  }
}

const updateUser = async (req, res) => {
  try {
    const data = await service.update(Number(req.params.id), req.body)
    res.json({ success: true, data })
  } catch (err) {
    handleError(res, err)
  }
}

const deleteUser = async (req, res) => {
  try {
    await service.remove(Number(req.params.id), req.session.userId)
    res.json({ success: true })
  } catch (err) {
    handleError(res, err)
  }
}

module.exports = { getAllUsers, createUser, updateUser, deleteUser }
