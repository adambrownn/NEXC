const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const userRepository = require("../../../database/mongo/repositories/user.repository");
const authService = require("../../../common/services/auth.service");

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt();
  return await bcrypt.hash(password, salt);
};

const checkDuplicateUser = async (userReqObj) => {
  const searchObj = {};
  if (userReqObj.email) {
    searchObj.email = userReqObj.email;
  }

  const userDetails = await userRepository.getUserDetailsByCriteria(searchObj);

  if (userDetails.length) {
    throw new Error("User with same email/phone number already exists.");
  }
  return;
};

const createUser = async (userReqObj) => {
  let newUser = {};

  newUser.email = userReqObj?.email?.toLowerCase()?.trim();
  newUser.dateOfBirth = userReqObj.dateOfBirth;
  newUser.address = userReqObj.address;
  newUser.name = userReqObj.name;
  newUser.phoneNumber = userReqObj.phoneNumber;
  newUser.accountType = userReqObj.accountType || "user";

  if (userReqObj.registrationType === "email") {
    newUser.password = await hashPassword(userReqObj.password);
  } else {
    // google
    newUser.socialIdentityProvider = userReqObj.registrationType;
  }

  const userData = await userRepository.createUser(newUser);
  return userData;
};

module.exports.registerUser = async (req, res) => {
  try {
    const reqObj = req.body;
    // check for duplicate account
    await checkDuplicateUser(reqObj);

    let userRegResponse = {};
    switch (reqObj.registrationType) {
      case "email":
        // register user via email
        userRegResponse = await createUser(reqObj);
        break;

      case "google":
        // register user via google
        await validateGoogleTokenAndEmail(
          reqObj.socialIdentityToken,
          reqObj.email
        );
        userRegResponse = await createUser(reqObj);
        break;

      case "visitor":
      default:
        userRegResponse = await createUser(reqObj);
        break;
    }

    if (reqObj.registrationType === "visitor") {
      res.json({
        user: {
          userId: userRegResponse._id,
          name: userRegResponse.name,
          email: userRegResponse?.email,
          phoneNumber: userRegResponse?.phoneNumber,
        },
      });
    } else {
      // mark it as logged in and create JWT as well
      const { accessToken, refreshToken } = await authService.generateJwtToken({
        userId: userRegResponse._id,
        name: userRegResponse.name.toLowerCase(),
        email: userRegResponse?.email?.toLowerCase(),
        accountType: userRegResponse.accountType.toLowerCase(),
      });
      if (accessToken && refreshToken) {
        res.json({
          user: {
            userId: userRegResponse._id,
            email: userRegResponse.email,
            name: userRegResponse.name,
            profileImage: userRegResponse.profileImage,
            accountType: userRegResponse.accountType,
          },
          accessToken,
          refreshToken,
        });
      } else {
        await userRepository.deleteUserByUserId(userRegResponse._id);
        throw new Error("Unable to create JWT Token.");
      }
    }
  } catch (error) {
    console.log(error);
    res.json({ err: error.message });
  }
};

const validateGoogleTokenAndEmail = async (googleToken, email) => {
  const payload = await verifyGoogleToken(googleToken);
  if (
    payload?.email.toString().toLowerCase().trim() !==
    email?.toString().toLowerCase().trim()
  ) {
    throw new Error("Token does not match with Email.");
  }
  return true;
};

module.exports.verifyGoogleToken = async (token) => {
  let socialUserInfo;
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  // create auth client
  const googleAuthClient = new OAuth2Client(googleClientId);
  try {
    // verify token
    socialUserInfo = await googleAuthClient.verifyIdToken({
      idToken: token,
    });
  } catch (ex) {
    const message = "Token error: " + ex.message;
    throw new Error(message);
  }
  // return user info from google
  return socialUserInfo.getPayload();
};
//#end google region

// reset password
/**
 * reset user password
 * @param email
 * @param password - new password
 */
module.exports.resetPassword = async (email, password) => {
  const passwordHash = await hashPassword(password);
  const updateResult = await userRepository.updatePassword(email, passwordHash);
  if (!updateResult.nModified == 0) {
    return false;
  } else {
    return true;
  }
};

module.exports.updateUserProfile = async (req, res) => {
  const userId = ["admin", "superadmin"].includes(req.user.accountType)
    ? req.body.userId
    : req.user.userId;
  try {
    const userData = await userRepository.updateUser(
      {
        _id: userId,
      },
      req.body,
      {}
    );

    if (userData) {
      res.json(userData);
    } else {
      throw new Error("Profle not update or User not Exists");
    }
  } catch (err) {
    console.log(err);
    res.json({ err: err.message });
  }
};

module.exports.updateUserAccountTypeDetails = async (req, res) => {
  // const userData = await userRepository.getUserDetailsByCriteria({
  //   _id: req.user.userId,
  // });
  // if (userData[0].accountType === "admin") {
  //   const updatedUserDetails =
  //     await this.userService.updateUserAccountTypeDetails(userBadge);
  //   return updatedUserDetails;
  // } else {
  //   throw new UnauthorizedException("Access Denied.");
  // }
};

module.exports.updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.userId;
    const preferences = req.body;

    // Validate the preferences object
    const validPreferenceKeys = ['email', 'push', 'sms', 'serviceUpdates', 'promotions', 'securityAlerts'];
    const validPreferences = {};

    Object.keys(preferences).forEach(key => {
      if (validPreferenceKeys.includes(key) && typeof preferences[key] === 'boolean') {
        validPreferences[key] = preferences[key];
      }
    });

    // Update user's notification preferences
    const userData = await userRepository.updateUser(
      { _id: userId },
      { notificationPreferences: validPreferences },
      {}
    );

    if (userData) {
      res.json({
        success: true,
        message: 'Notification preferences updated successfully',
        data: userData.notificationPreferences
      });
    } else {
      throw new Error("Failed to update notification preferences");
    }
  } catch (err) {
    console.log(err);
    res.json({ err: err.message });
  }
};

module.exports.getUserDetails = async (req, res) => {
  try {
    const searchReqObj = {};

    switch (req.body.searchCriteria) {
      case "phone":
        searchReqObj.phoneNumber = parseInt(req.body.searchString);
        break;
      case "email":
        searchReqObj.email = req.body.searchString;
        break;
      case "name":
        searchReqObj.name = req.body.searchString;
        break;

      default:
        searchReqObj.name = "";
        break;
    }

    if (req.body.accountType) {
      searchReqObj.accountType = req.body.accountType;
    }

    const userData = await userRepository.getUserDetailsByCriteria(
      searchReqObj
    );
    res.json(userData);
  } catch (error) {
    console.log(error);
    if (error.reason?.code == "ERR_ASSERTION") {
      res.json({ err: "Invalid Input" });
    } else {
      res.json({ err: error.message });
    }
  }
};

module.exports.getUsers = async (req, res) => {
  const userReqObj = {};
  if (req.query.userId) {
    userReqObj._id = req.query.userId;
  }
  if (req.query.accountType) {
    userReqObj.accountType = req.query.accountType;
  }
  const users = await userRepository.getUserDetailsByCriteria(userReqObj);
  res.json(users);
};

module.exports.deleteUserByUserId = async (req, res) => {
  try {
    // only admin can delete
    if (!["superadmin", "admin"].includes(req.user.accountType)) {
      throw new Error("You do not have access");
    }
    const users = await userRepository.deleteUserByUserId(req.params.userId);
    res.json(users);
  } catch (error) {
    res.json({ err: error.message });
  }
};
