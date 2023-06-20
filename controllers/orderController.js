//CHECK ON BACKEND IF PRODUCT EXISTS, EVRTH IS CORRECT BEFORE LETTING USER TO CHECOUT AND PAY WITH STRIPE
const Order = require('../models/Order');
const Product = require('../models/Product');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');

const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = 'someRandomValue';
  return { client_secret, amount };
};

const createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body;
  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError('No cart items provided');
  }
  if (!tax || !shippingFee) {
    throw new CustomError.BadRequestError(
      'Please provide tax and shipping fee',
    );
  }

  const initialValue = { subtotal: 0, orderItems: [] };

  const { subtotal: subtotal, orderItems: orderItems } = await cartItems.reduce(
    async (resultsMap, item) => {
      // Loop through each item in `cartItems` array (if the array is empty, this will just be skipped)
      // Each iteration, item will be the next item in the array. resultsMap will be whatever we return at the end of the reduce function, and the first time it will be equal to `initialValue` (because we pass that to reduce as the second argument on line 52)

      const dbProduct = await Product.findOne({ _id: item.product });
      console.log(`looping through: resultsMap=${JSON.stringify(
        await resultsMap)} | item=${JSON.stringify(
        item)} | dbProduct=${dbProduct}`);

      if (!dbProduct) {
        throw new CustomError.NotFoundError(
          `No product with id ${item.product}`);
      }

      const { name, price, image, _id } = dbProduct;
      const singleOrderItem = {
        amount: item.amount,
        name,
        price,
        image,
        product: _id,
      };

      // Because resultsMap was returned in an async function; it is wrapped in a Promise; so we need to await before we can edit its fields. Node is working on each item in the cartItems array, in _parallel_ to save time
      resultsMap = await resultsMap;

      resultsMap.orderItems = [...resultsMap.orderItems, singleOrderItem];
      resultsMap.subtotal += item.amount * price;

      // We have to return resultsMap so that the reduce function knows to use the updated values for the next item in the list
      return resultsMap;
    }, initialValue);

  // console.log(orderItems);
  // console.log(subtotal);

  //calculate total
  const total = tax + shippingFee + subtotal;
  //get client Secret
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: 'usd',
  });

  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  });
  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret });
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id ${orderId}`);
  }
  checkPermissions(req.user, order.user);
  res.status(StatusCodes.OK).json({ order });
};

const getCurrentUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.userId }); // take req.user.userId and set it to user
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const updateOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const { paymentIntentId } = req.body;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id ${orderId}`);
  }
  checkPermissions(req.user, order.user); // only admin or proper user can update order

  order.paymentIntentId = paymentIntentId;
  order.status = 'paid';
  await order.save();
  res.status(StatusCodes.OK).json({ order });
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};
