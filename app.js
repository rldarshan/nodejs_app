const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const logger = require('./config/logger');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middlewares/errorMiddleware');
const { swaggerDocs, swaggerUi } = require('./config/swagger');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json(), cors());

// Database connection
connectDB('mongodb+srv://Darshan:T35tpassword@cluster0.jgw8y.mongodb.net/userDB');  // 'mongodb://127.0.0.1:27017/userDB'   // process.env.MONGO_URI

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/', userRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    logger.info(`Server running on port http://localhost:${PORT}`);
    logger.info(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
