const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

const {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
} = require('../controllers/productController');

//const { getSingleProductReviews } = require('../controllers/reviewController');

router
  .route('/')
  .post([authenticateUser, authorizePermissions('admin')], createProduct) //only admin can create product
  .get(getAllProducts); //everyone can access all products- no middleware

router
  .route('/uploadImage')
  .post([authenticateUser, authorizePermissions('admin')], uploadImage); // only admin can upload image

router
  .route('/:id')
  .get(getSingleProduct) //everyone can access all products- no middleware
  .patch([authenticateUser, authorizePermissions('admin')], updateProduct) //only admin can update product
  .delete([authenticateUser, authorizePermissions('admin')], deleteProduct); //only admin can delete product

//router.route('/:id/reviews').get(getSingleProductReviews);

module.exports = router;
