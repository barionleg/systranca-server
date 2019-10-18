const express = require('express')
const userController = require('../controllers/UserController')
const phoneController = require('../controllers/PhoneController')
const pinController = require('../controllers/PinCodeController')

const router = express.Router()

/* Creates a new user. */
router.post(
  '/',
  userController.validate('createUser'),
  userController.createUser
)

/* GET users listing. */
router.get(
  '/',
  userController.listUsers
)

/* GET a user. */
router.get(
  '/:userId',
  userController.validate('getUser'),
  userController.getUser
)

/* Update a user. */
router.put(
  '/:userId',
  userController.validate('updateUser'),
  userController.updateUser
)

router.post(
  '/:userId/phones',
  phoneController.validate('setUserPhones'),
  phoneController.setUserPhones
)

router.post(
  '/:userId/createPin',
  pinController.createPinCode
)

router.post(
  '/:userId/updatePin',
  pinController.updatePinCode
)

router.post(
  '/:userId/deletePin',
  pinController.deletePinCode
)

module.exports = router
