const jwt = require('jsonwebtoken');

//fn creates token
const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
  return token;
};

const isTokenValid = ({ token }) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

//attach cookies to response
//whatever we're passing in as a user, we'll set it up as payload // user is tokenUser- see line 25 AND 26 (!!) authController.js
const attachCookiesToResponse = ({ res, user }) => {
  const token = createJWT({ payload: user });

  const oneDay = 1000 * 60 * 60 * 24; //1d because we set previously JWT_LIFETIME=1d
  //set up cookie for storing token
  res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === 'production', //secure:Boolean	Marks the cookie to be used with HTTPS only.- we set it up to be applied only in production
    signed: true,
  });
};

module.exports = {
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
};
