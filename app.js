const cors = require('cors');
const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const logger = require('./utils/logger');
const { connectDB } = require('./models/db');
const userRoutes = require('./routes/userRoutes');
const { createHandler } = require('graphql-http/lib/use/express');
const { schema, resolvers } = require('./graphql/schema');
const errorHandler = require('./middlewares/errorMiddleware');
const { swaggerDocs, swaggerUi } = require('./utils/swagger');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 6000;

// Middleware
app.use(bodyParser.json(), cors());

// Database connection
connectDB();

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api/users', userRoutes);

// GraphQL Setup
app.use('/graphql', createHandler({
    schema,
    rootValue: resolvers,
  }));
  
// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
