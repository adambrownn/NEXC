/**
 * Customer Status Types
 * @readonly
 * @enum {string}
 */
const CUSTOMER_STATUS = {
  NEW_FIRST_TIME: 'NEW_FIRST_TIME',        // First time interaction, no information collected yet
  NEW_PROSPECT: 'NEW_PROSPECT',            // Information collected but no purchase made (online or through sales)
  EXISTING_ACTIVE: 'EXISTING_ACTIVE',      // Has purchased a service and has active orders
  EXISTING_COMPLETED: 'EXISTING_COMPLETED' // All orders are marked as completed
};

/**
 * Customer Type
 * @readonly
 * @enum {string}
 */
const CUSTOMER_TYPE = {
  INDIVIDUAL: 'INDIVIDUAL',  // Individual customer
  COMPANY: 'COMPANY'        // Company/Business customer
};

/**
 * Customer Type Definition
 * Note: This matches the existing database schema while adding new fields
 * @typedef {Object} Customer
 * @property {string} _id - MongoDB ID
 * @property {string} name - Full name (for backward compatibility)
 * @property {string} [firstName] - First name
 * @property {string} [lastName] - Last name
 * @property {string} email - Email address
 * @property {string} phoneNumber - Contact number
 * @property {string} [NINumber] - National Insurance number
 * @property {string} address - Full address
 * @property {string} [zipcode] - Postal code
 * @property {string} [dob] - Date of birth
 * @property {CUSTOMER_STATUS} status - Customer status (automatically managed)
 * @property {CUSTOMER_TYPE} customerType - Type of customer (individual/company)
 * @property {string} [companyName] - Company name (required for COMPANY type)
 * @property {string} [companyRegNumber] - Company registration number (for COMPANY type)
 * @property {Date} [lastContact] - Last contact date
 */

/**
 * Transform customer data to match the existing schema format
 * @param {Object} customerData - New format customer data
 * @returns {Object} - Data in the format expected by existing components
 */
function transformCustomerData(customerData) {
  return {
    _id: customerData._id,
    name: customerData.customerType === CUSTOMER_TYPE.COMPANY 
      ? customerData.companyName 
      : (customerData.firstName && customerData.lastName 
        ? `${customerData.firstName} ${customerData.lastName}`
        : customerData.name),
    email: customerData.email,
    phoneNumber: customerData.phoneNumber,
    address: customerData.address,
    zipcode: customerData.zipcode,
    NINumber: customerData.NINumber,
    dob: customerData.dob,
    status: customerData.status,
    customerType: customerData.customerType,
    companyName: customerData.companyName,
    companyRegNumber: customerData.companyRegNumber,
    lastContact: customerData.lastContact,
    firstName: customerData.firstName,
    lastName: customerData.lastName
  };
}

module.exports = {
  CUSTOMER_STATUS,
  CUSTOMER_TYPE,
  transformCustomerData
};
