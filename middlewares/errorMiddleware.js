const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
    logger.error(err.message, { stack: err.stack });
    res.status(500).send('Something went wrong');
};

module.exports = errorHandler;
