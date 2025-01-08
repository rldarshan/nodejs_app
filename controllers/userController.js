const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { getDB } = require('../models/db');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

const collectionName = process.env.DB_COLLECTION || 'users';
const secret = process.env.JWT_SECRET || 'your_jwt_secret';
const saltRounds = 10;

const testUrl = async (req, res, next) => {
    try {
        logger.info('Test URL called successfully', { email });
        res.send('Hello World');
    } catch (err) {
        next(err);
    }
};

const registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const db = getDB();
    const user = await db.collection(collectionName).insertOne({ name, email, password: hashedPassword });
    logger.info('User registered successfully', { email });
    res.status(201).json({ message: 'User registered successfully', userId: user.insertedId });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const db = getDB();
    const user = await db.collection(collectionName).findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '1h' });
    logger.info('User logged in successfully', { email });
    res.json({ token });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const db = getDB();
    const users = await db.collection(collectionName).find().toArray();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
    try {
        const db = getDB();
        const user = await db.collection(collectionName).findById(req.params.id).toArray();
        if (!user) return res.status(404).send('User not found');

        res.json(user);
    } catch (err) {
        next(err);
    }
};

const updateUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    const updateData = { name, email };
    if (password) {
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    const db = getDB();
    const result = await db.collection(collectionName).updateOne(
      { _id: new require('mongodb').ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    logger.info('User updated successfully', { id: req.params.id });
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDB();
    const result = await db.collection(collectionName).deleteOne({ _id: new require('mongodb').ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    logger.info('User deleted successfully', { id: req.params.id });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { testUrl, registerUser, loginUser, getAllUsers, getUserById, updateUser, deleteUser };
