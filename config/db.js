const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async (uri) => {
    try {
        await mongoose.connect(uri
        //     , {
        //     dbName: process.env.DB_NAME,
        //   }
        );
        logger.info('MongoDB connected');
    } catch (err) {
        logger.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

module.exports = connectDB;
