const User = require("../schemas/Users.schema");

const createUser = async (userOnBoardingObj) => {
  const newUser = new User(userOnBoardingObj);
  return await newUser.save();
};

const getUserDetailsByCriteria = async (searchObj) => {
  return User.find(searchObj)
    .select({ password: 0 })
    .collation({
      locale: "en",
      strength: 2,
    })
    .sort({ createdAt: -1 });
};

const updatePassword = async (email, password) => {
  return User.findOneAndUpdate({ email }, { password }, { new: true });
};

/**
 *
 * Only for auth purpose
 * getUserDetailsByCriteria use this for fetching users
 */
const getUserByEmailOnlyForLogin = async (email, provider = "") => {
  return User.findOne({
    $and: [
      { email: email.toLowerCase().trim() },
      { socialIdentityProvider: provider },
    ],
  });
};

const updateUser = async (criteria, dataToUpdate, options = {}) => {
  options["new"] = true;
  options["lean"] = true;
  return User.findOneAndUpdate(criteria, dataToUpdate, options);
};

const updateBulkUser = async (criteria, dataToUpdate) => {
  return User.updateMany(criteria, dataToUpdate);
};

/**
 * only used while registration failure
 */
const deleteUserByUserId = async (userId) => {
  return User.deleteOne({ _id: userId });
};

const getUserByPhoneOnlyForLogin = async (phoneNumber, loginType = "phone") => {
  try {
    // Build query to find user by phone number
    const query = {
      phoneNumber: phoneNumber,
      isActive: true,
    };

    // If login type is specified and not "phone" (e.g., social login), check for matching provider
    if (loginType && loginType !== "phone") {
      query.socialIdentityProvider = loginType;
    }

    const user = await User.findOne(query);
    return user;
  } catch (error) {
    console.error("Error in getUserByPhoneOnlyForLogin:", error);
    throw error;
  }
};

module.exports = {
  createUser,
  getUserByEmailOnlyForLogin,
  getUserDetailsByCriteria,
  updatePassword,
  updateUser,
  updateBulkUser,
  deleteUserByUserId,
  getUserByPhoneOnlyForLogin,
};
