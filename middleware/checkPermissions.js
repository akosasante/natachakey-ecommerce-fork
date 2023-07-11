const CustomError = require('../errors');

//only admin and proper user can access, other users can´t
const checkPermissions = async (req, res, next) => {
  //   console.log(requestUser); // who is doing a request req.user,
  //   console.log(resourceUserId); // user._id of the user we are requesting(id in URL)
  //   console.log(typeof resourceUserId);

  const token = req.signedCookies.token;
    if (!token) {
    throw new CustomError.UnauthenticatedError('Authentication invalid');
  }

  try {
    const { name, userId, role } = isTokenValid({ token }); // we destructure token- and take name, userId, role to attach it to req.user- we can log it in userController.js
    req.user = { name, userId, role }; //we add  name, userId and role to the req object under the "user" field/property, to be used in any following middleware or controllers

    if (req.user.role === 'admin') return; // if userRole is admin, evrth ok proceed with the next steps

    if (req.user.userId === user._id.toString()) return; // if userId  matches resourceUserId converted to string (remember that it is an object- line 7),evrth ok,  proceed with the next steps

    next();
  } catch (error) {
    throw new CustomError.UnauthorizedError(
      'Not authorized to access this route'
    );
  }
};

module.exports = {
  checkPermissions,
};
