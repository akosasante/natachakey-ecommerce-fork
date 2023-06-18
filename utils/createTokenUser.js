//user object
const createTokenUser = (user) => {
  return { name: user.name, userId: user._id, role: user.role }; //look for these
};

module.exports = createTokenUser;