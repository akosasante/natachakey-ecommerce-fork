const CustomError = require('../errors');

//only admin and proper user can access, other users can´t
const checkPermissions = (requestUser, resourceUserId) => {
  //see userController.line 19
//   console.log(requestUser); // who is doing a request req.user,
//   console.log(resourceUserId); // user._id of the user we are requesting(id in URL)
//   console.log(typeof resourceUserId);
  if (requestUser.role === 'admin') return; // if userRole is admin, evrth ok proceed with the next steps

  if (requestUser.userId === resourceUserId.toString()) return; // if userId  matches resourceUserId converted to string (remember that it is an object- line 7),evrth ok,  proceed with the next steps
//if none of these conditions are met- throw new custom error
  throw new CustomError.UnauthorizedError(
    'Not authorized to access this route');
};

module.exports = checkPermissions;
