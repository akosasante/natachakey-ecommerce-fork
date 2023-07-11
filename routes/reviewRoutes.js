const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authentication');

const {
  checkPermissions,
} = require('../middleware/checkPermissions');

const {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');

router.route('/').post(authenticateUser, createReview).get(getAllReviews);

router
  .route('/:id')
  .get(getSingleReview)
  .patch(authenticateUser, checkPermissions, updateReview)
  .delete(authenticateUser, checkPermissions, deleteReview);

module.exports = router;
