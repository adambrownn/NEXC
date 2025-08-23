require('dotenv').config({ path: './env/.env' });
const mongoose = require('mongoose');
const { Orders } = require('../database/mongo/repositories/orders.repository');
const Customer = require('../api/v1/trades/customers.service').Customer;
const { CUSTOMER_TYPE } = require('../types/customer.types');
const { initializeConnection } = require('../database/connection');

// Set a timeout for the entire test
const TEST_TIMEOUT = 30000; // 30 seconds

async function testUnifiedOrders() {
    try {
        console.log('Starting unified orders test...');

        // Ensure database connection
        await initializeConnection();
        console.log('Database connected');

        // 1. Create a test customer
        const testCustomer = await Customer.create({
            firstName: 'Test',
            lastName: 'Customer',
            email: 'test@example.com',
            phoneNumber: '+44123456789',
            address: '123 Test St',
            zipcode: 'TE12 3ST',
            NINumber: 'TEST123456',
            customerType: CUSTOMER_TYPE.INDIVIDUAL,
            status: 'NEW_FIRST_TIME'
        });
        console.log('Created test customer:', testCustomer._id);

        // 2. Create a test online order
        const onlineOrder = await Orders.create({
            orderType: 'ONLINE',
            customerId: testCustomer._id,
            customer: {
                name: `${testCustomer.firstName} ${testCustomer.lastName}`,
                email: testCustomer.email,
                phoneNumber: testCustomer.phoneNumber,
                address: testCustomer.address,
                zipcode: testCustomer.zipcode,
                NINumber: testCustomer.NINumber
            },
            items: [{
                _id: new mongoose.Types.ObjectId(),
                title: 'Test Course',
                type: 'course',
                trade: {
                    _id: 'TEST123',
                    title: 'Test Trade'
                },
                price: 199.99
            }],
            itemsTotal: 199.99,
            grandTotalToPay: 199.99,
            orderCheckPoint: 0,
            paymentStatus: 0
        });
        console.log('Created online order:', onlineOrder._id);

        // 3. Create a test phone order
        const phoneOrder = await Orders.create({
            orderType: 'PHONE',
            customerId: testCustomer._id,
            customer: {
                name: `${testCustomer.firstName} ${testCustomer.lastName}`,
                email: testCustomer.email,
                phoneNumber: testCustomer.phoneNumber,
                address: testCustomer.address,
                zipcode: testCustomer.zipcode,
                NINumber: testCustomer.NINumber
            },
            createdBy: new mongoose.Types.ObjectId(), // Simulating admin user
            items: [{
                _id: new mongoose.Types.ObjectId(),
                title: 'Test Service',
                type: 'service',
                trade: {
                    _id: 'TEST456',
                    title: 'Test Trade Service'
                },
                price: 299.99
            }],
            itemsTotal: 299.99,
            grandTotalToPay: 299.99,
            orderCheckPoint: 0,
            paymentStatus: 0
        });
        console.log('Created phone order:', phoneOrder._id);

        // 4. Test fetching orders
        const allOrders = await Orders.find({ customerId: testCustomer._id });
        console.log('\nFetched all orders for customer:');
        console.log('Total orders:', allOrders.length);
        console.log('Order types:', allOrders.map(o => o.orderType));

        // 5. Test updating an order
        const updatedOrder = await Orders.findByIdAndUpdate(
            onlineOrder._id,
            {
                orderCheckPoint: 1,
                paymentStatus: 1,
                'customer.status': 'EXISTING_ACTIVE'
            },
            { new: true }
        );
        console.log('\nUpdated online order status:', updatedOrder.orderCheckPoint);

        console.log('\nTest completed successfully!');
        console.log('Created test data:');
        console.log('- Customer ID:', testCustomer._id);
        console.log('- Online Order ID:', onlineOrder._id);
        console.log('- Phone Order ID:', phoneOrder._id);

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('Database connection closed');
        }
        process.exit(0); // Ensure script exits
    }
}

// Set overall timeout
const timeoutId = setTimeout(() => {
    console.error('Test timed out after', TEST_TIMEOUT, 'ms');
    process.exit(1);
}, TEST_TIMEOUT);

// Run the test
testUnifiedOrders().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
});
