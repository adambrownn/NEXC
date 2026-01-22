const jwt = require("jsonwebtoken");

// create json web token
module.exports.generateJwtToken = async (userDetails) => {
  // Include phone in token payload if available
  const tokenPayload = {
    userId: userDetails.userId,
    name: userDetails.name,
    email: userDetails.email,
    phone: userDetails.phone, // Add this line
    accountType: userDetails.accountType,
  };

  // Generate tokens as before
  const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY,
  });

  const refreshToken = jwt.sign(tokenPayload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRY,
  });

  return { accessToken, refreshToken };
};

module.exports.extractTokenDetails = async (req, res, next) => {
  try {
    // const token = req.headers["x-access-token"];
    const token = req.headers.authorization?.split(" ")[1];
    // to separate Bearer and token

    if (!token) {
      return res.status(401).json({ 
        status: 'error',
        error: 'Auth token missing',
        message: 'Authentication required'
      });
    }

    // verify jwt token
    const jwtDecoded = await jwt.verify(token, process.env.JWT_SECRET);
    // attach decoded jwt with req
    req.user = jwtDecoded;

    next();
  } catch (err) {
    console.error('[Auth] Token verification failed:', err.message);
    
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ 
        status: 'error',
        error: 'JWT expired',
        message: 'Your session has expired. Please log in again.'
      });
    }
    
    return res.status(401).json({ 
      status: 'error',
      error: 'Invalid token',
      message: 'Authentication failed'
    });
  }
};

module.exports.verifyToken = async (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports.extractRefreshTokenDetails = async (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};
