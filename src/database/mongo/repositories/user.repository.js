const User = require("../schemas/Users.schema");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const createUser = async (userObj) => {
  try {
    console.log("🔍 [UserRepository] Creating user with data:", {
      name: userObj.name,
      email: userObj.email,
      accountType: userObj.accountType,
      role: userObj.role,
      hasPassword: !!userObj.password,
    });

    const userModel = require("../models/User.model");

    // Ensure we have a valid user model
    if (!userModel) {
      throw new Error("User model not initialized");
    }

    const newUser = new userModel(userObj);
    const savedUser = await newUser.save();

    console.log("✅ [UserRepository] User created successfully with ID:", savedUser._id);
    return savedUser;
  } catch (error) {
    console.error("❌ [UserRepository] Error creating user:", error);
    console.error("❌ [UserRepository] Error details:", error.message);
    if (error.name === "ValidationError") {
      console.error("❌ [UserRepository] Validation errors:", error.errors);
    }
    throw error;
  }
};

const getUserDetailsByCriteria = async (searchCriteria) => {
  try {
    console.log("🔍 [UserRepository] Searching users with criteria:", searchCriteria);

    const userModel = require("../models/User.model");
    const users = await userModel
      .find(searchCriteria, { password: 0 }) // Exclude password
      .collation({ locale: "en", strength: 2 })
      .sort({ createdAt: -1 });

    console.log("✅ [UserRepository] Found users count:", users.length);
    return users;
  } catch (error) {
    console.error("❌ [UserRepository] Error searching users:", error);
    throw error;
  }
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
