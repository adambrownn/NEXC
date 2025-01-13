const jwt = require("jsonwebtoken");

// create json web token
module.exports.generateJwtToken = async (jwtPayload) => {
  try {
    const accessToken = await jwt.sign(jwtPayload, process.env.AUTH_JWT, {
      expiresIn: process.env.AUTH_JWT_EXPIRY,
    });

    const refreshToken = await jwt.sign(
      { userId: jwtPayload.userId },
      process.env.AUTH_REFRESH_JWT,
      {
        expiresIn: process.env.AUTH_REFRESH_JWT_EXPIRY,
      }
    );

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    return { accessToken: null, refreshToken: null };
  }
};

module.exports.extractTokenDetails = async (req, res, next) => {
  try {
    // const token = req.headers["x-access-token"];
    const token = req.headers.authorization?.split(" ")[1];
    // to separate Bearer and token

    if (!token) throw new Error("Auth token missing");

    // verify jwt token
    const jwtDecoded = await jwt.verify(token, process.env.AUTH_JWT);
    // attach decoded jwt with req
    req.user = jwtDecoded;

    next();
  } catch (err) {
    console.log(err);
    if (err.name == "TokenExpiredError") {
      res.json({ err: "JWT expired." });
      return;
    }
    if (err.message == "Auth token missing") {
      res.json({ err: err.message });
      return;
    }
    res.json({ err: "Invalid Token." });
  }
};

module.exports.verifyToken = async (token) => {
  return jwt.verify(token, process.env.AUTH_JWT);
};

module.exports.extractRefreshTokenDetails = async (token) => {
  return jwt.verify(token, process.env.AUTH_REFRESH_JWT);
};
