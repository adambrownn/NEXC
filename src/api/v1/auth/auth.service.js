const bcrypt = require("bcryptjs");
const userRepository = require("../../../database/mongo/repositories/user.repository");
const authService = require("../../../common/services/auth.service");
const userService = require("../user/user.service");

module.exports.authenticateUser = async (req, res) => {
  try {
    const reqObj = req.body;

    let user = {};
    let emailFromToken = "";

    switch (reqObj.loginType) {
      case "email": {
        emailFromToken = reqObj.email;
        user = await userRepository.getUserByEmailOnlyForLogin(reqObj.email);
        if (!user) {
          throw new Error("Email doesn't exist. Please register.");
        }
        const isPasswordMatched = await bcrypt.compare(
          reqObj.password,
          user.password
        );
        if (!isPasswordMatched) {
          throw new Error("Incorrect password.");
        }
        break;
      }

      case "google": {
        const googlePayload = await userService.verifyGoogleToken(
          reqObj.socialIdentityToken
        );
        if (googlePayload.email) {
          emailFromToken = googlePayload.email;
          user = await userRepository.getUserByEmailOnlyForLogin(
            googlePayload.email,
            reqObj.loginType
          );
        }
        break;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userDetails } = user.toObject();

    const { accessToken, refreshToken } = await authService.generateJwtToken({
      userId: userDetails._id,
      name: userDetails.name.toLowerCase(),
      email: userDetails?.email?.toLowerCase(),
      accountType: userDetails.accountType.toLowerCase(),
    });

    //rename _id to userId before sending
    userDetails.userId = userDetails._id;
    delete userDetails._id;

    res.json({
      user: {
        userId: userDetails.userId,
        email: userDetails.email,
        name: userDetails.name,
        profileImage: userDetails.profileImage,
        accountType: userDetails.accountType,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.log(error);
    res.json({ err: error.message });
  }
};

// reset Password
module.exports.resetPassword = async (req, res) => {
  try {
    const decodedToken = await authService.verifyToken(req.body.jwtToken);
    if (!decodedToken.email) {
      console.error("No Email in decoded token");
      throw new Error("Invalid Token");
    }
    const updatePasswordRes = await userService.resetPassword(
      decodedToken.email,
      req.body.password
    );
    if (!updatePasswordRes) {
      throw new Error("Unable to reset password");
    }
    res.json({ updated: true });
  } catch (err) {
    console.log(err);
    res.json({ err: err.message });
  }
};

// generate new token from refresh token
module.exports.generateTokenFromRefreshToken = async (req, res) => {
  try {
    const decodedToken = await authService.extractRefreshTokenDetails(
      req.body.jwtToken
    );

    if (!decodedToken.userId) {
      throw new Error("Invalid Refresh Token");
    }

    const userDetails = await userRepository.getUserDetailsByCriteria({
      _id: decodedToken.userId,
    });

    if (userDetails.length) {
      const { accessToken, refreshToken } = await authService.generateJwtToken({
        userId: userDetails[0]._id,
        email: userDetails[0].email.toLowerCase(),
        name: userDetails[0].name.toLowerCase(),
        accountType: userDetails[0].accountType.toLowerCase(),
      });

      res.json({ accessToken, refreshToken });
    } else {
      throw new Error("User Not Exists. Please login again.");
    }
  } catch (err) {
    console.error(err);
    res.json({ err: "Invalid Refresh Token." });
  }
};

// generate new token from refresh token
module.exports.checkIsAdmin = async (req, res) => {
  try {
    const userDetails = await userRepository.getUserDetailsByCriteria({
      email: req.body.email,
    });
    res.json({
      isAdmin:
        userDetails.length &&
        ["superadmin", "admin"].includes(userDetails[0]?.accountType)
          ? true
          : false,
    });
  } catch (err) {
    console.error(err);
    res.json({ err: "You're not admin" });
  }
};
