const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

const {
  checkPermissions,
} = require('../middleware/checkPermissions');

const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require('../controllers/userController');

router
  .route('/')
  .get(authenticateUser, authorizePermissions('admin'), getAllUsers);

router.route('/showMe').get(authenticateUser, showCurrentUser);
router.route('/updateUser').patch(authenticateUser, checkPermissions, updateUser);
router.route('/updateUserPassword').patch(authenticateUser, checkPermissions, updateUserPassword);

router.route('/:id').get(authenticateUser,checkPermissions, getSingleUser);

module.exports = router;
