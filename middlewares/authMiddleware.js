const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).send('Access Denied');

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        logger.error('Invalid Token:', err);
        res.status(400).send('Invalid Token');
    }
};

module.exports = authenticateToken;
