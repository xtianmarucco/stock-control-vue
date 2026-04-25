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
    const { email, full_name, dni, password, role } = req.body
    const data = await service.create({ email, fullName: full_name, dni, password, role })
    res.status(201).json({ success: true, data })
  } catch (err) {
    handleError(res, err)
  }
}

const updateUser = async (req, res) => {
  try {
    const { email, full_name, dni, password, role } = req.body
    const data = await service.update(Number(req.params.id), { email, fullName: full_name, dni, password, role })
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
