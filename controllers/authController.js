const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { attachCookiesToResponse, createTokenUser } = require('../utils');

const register = async (req, res) => {
  const { name, email, password } = req.body; // destructured name, email, password from req.body
  //even if smn passes role he will be registered as user- line 15 User.create- we can only manually change the role on mongo db

  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError(
      'Email already exists, try another one'
    );
  }

  //first registered user is an admin
  const isFirstAccount = (await User.countDocuments({})) === 0; //get all users, and if there is no users
  const role = isFirstAccount ? 'admin' : 'user';
  //here { name, email, password, role } is what we get from frontend
  const user = await User.create({ name, email, password, role });
  //here user is created, we sign token for his access to www
  // what properties of user (we get as a response from server) we are signing with json token
  //create variable tokenUser to sign user.name, user._id, user.role  with jwt token and assign it to name, userId, role and finally store it in a cookie
  // const tokenUser = { name: user.name, userId: user._id, role: user.role }; // we placed it in createTokenUser.js
  //refactor thisline
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.CREATED).json({ user: tokenUser }); //sends as response tokenUser with 3 properties { name: user.name, userId: user._id, role: user.role }; and calls it 'user' object
};

const login = async (req, res) => {
  //destructure email and password that come in
  const { email, password } = req.body;

  //check if both credentials are provided
  if (!email || !password) {
    throw new CustomError.BadRequestError('Please provide email and password');
  }

  //check if user exists in a db
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError('Invalid credentials');
  }
  //check if provided password is correct
  const isPasswordCorrect = await user.comparePassword(password); //we can use comparePassword bcs we created it in User.js- 43 line
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid credentials');
  }

  const tokenUser = createTokenUser(user); //see lines 24-26
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const logout = async (req, res) => {
  const oneDay = 1000 * 60 * 60 * 24;
  
  res.clearCookie('token', {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === 'production', //secure:Boolean	Marks the cookie to be used with HTTPS only.- we set it up to be applied only in production
    signed: true,
    sameSite: 'none'
  });
  res.status(StatusCodes.OK).json({ msg: 'user logged out' });
};

module.exports = {
  register,
  login,
  logout,
};
