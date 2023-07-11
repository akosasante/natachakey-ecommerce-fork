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
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updatePaymentStatus ,
} = require('../controllers/orderController');

router
  .route('/')
  .post(authenticateUser, createOrder)
  .get(authenticateUser, authorizePermissions('admin'), getAllOrders);

router.route('/showAllMyOrders').get(authenticateUser, getCurrentUserOrders);

router
  .route('/:id')
  .get(authenticateUser,checkPermissions, getSingleOrder)
  .patch(authenticateUser, checkPermissions, updatePaymentStatus );

  router
  .route('/:id/pay')
  .patch(authenticateUser, checkPermissions, updatePaymentStatus );
module.exports = router;
