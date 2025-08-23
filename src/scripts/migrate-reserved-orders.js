const mongoose = require('mongoose');
const ReservedOrder = require('../database/mongo/schemas/ReservedOrders.schema');
const { Orders } = require('../database/mongo/repositories/orders.repository');

async function migrateReservedOrders() {
  try {
    console.log('Starting reserved orders migration...');
    
    // Get all reserved orders
    const reservedOrders = await ReservedOrder.find({}).populate('customerId');
    console.log(`Found ${reservedOrders.length} reserved orders to migrate`);

    // Migrate each order
    for (const reservedOrder of reservedOrders) {
      try {
        // Map reserved order to new order format
        const newOrder = {
          orderType: 'PHONE',
          customerId: reservedOrder.customerId?._id,
          customer: {
            name: reservedOrder.name,
            email: reservedOrder.email,
            phoneNumber: reservedOrder.phoneNumber,
            address: reservedOrder.address,
            zipcode: reservedOrder.zipcode,
            NINumber: reservedOrder.NINumber,
          },
          orderCheckPoint: reservedOrder.orderCheckPoint,
          paymentStatus: reservedOrder.payStatus ? 2 : 0, // 2 = paid, 0 = not initiated
          itemsTotal: reservedOrder.grandTotal,
          grandTotalToPay: reservedOrder.grandTotal,
          grandTotalPaid: reservedOrder.payStatus ? reservedOrder.grandTotal : 0,
          createdAt: reservedOrder.createdAt,
          updatedAt: new Date()
        };

        // Create new order
        await Orders.create(newOrder);
        console.log(`Migrated order ${reservedOrder._id}`);
      } catch (error) {
        console.error(`Error migrating order ${reservedOrder._id}:`, error);
      }
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.disconnect();
  }
}

// Connect to MongoDB and run migration
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
  migrateReservedOrders();
}).catch((error) => {
  console.error('MongoDB connection failed:', error);
});
