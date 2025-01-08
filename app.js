const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const logger = require('./config/logger');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middlewares/errorMiddleware');
const { swaggerDocs, swaggerUi } = require('./config/swagger');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Database connection
connectDB(process.env.MONGO_URI);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api/users', userRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
