const CustomError = require('../errors');
const { isTokenValid } = require('../utils');

//check for the user in general- if he exists in db
const authenticateUser = async (req, res, next) => {
  //since we signed cookie with JWT secret it is stored in req.signedCookies and .token is the name we gave to our cookie in jwt.js on line 22. if cookies are not signed- they are in req.cookies
  const token = req.signedCookies.token;
  //if we 've logged out  or user isn't registered/logged in, the error will be thrown
  if (!token) {
    throw new CustomError.UnauthenticatedError('Authentication invalid');
  }
  try {
    const { name, userId, role, exp } = isTokenValid({ token }); // we destructure token- and take name, userId, role to attach it to req.user- we can log it in userController.js
    // AKOSREVIEW: We're not passing to the browser here, just adding it to the req object under the "user" field/property, to be used in any following middleware or controllers
    req.user = { name, userId, role, exp }; //we pass to the browser object with name, userId ad role
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError('Authentication invalid');
  }
};

//fn that checks if it is an admin //to allow /restrict access
//...roles  gathers all the  arguments into an array.
const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    //checking if the user currently trying to access the route (req.user.role) matches any role that I have in an array  created by (...roles)
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError(
        'Unauthorized to access this route',
      );
    }
    next(); //proceed to next middleware- in this case get all users route
  };
};

module.exports = {
  authenticateUser,
  authorizePermissions,
};
