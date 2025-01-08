const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/userModel');
const logger = require('../config/logger');

JWT_SECRET = process.env.JWT_SECRET || 'T35t@JWT#Secrete';

// Register a new user
const registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        logger.info('User registered successfully', { email });
        res.status(201).send({message:'User registered successfully'});
    } catch (err) {
        logger.error('Error registering user:', err);
        res.status(400).send(err.message);
    }
};

// Login user
const loginUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).send('User not found');

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(400).send('Invalid password');

        const token = jwt.sign({ _id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

        logger.info('User logged in successfully', { email });
        res.header('Authorization', token).send({ message: "Login successful", "jwtToken": token });
    } catch (err) {
        logger.error('Error logging in user:', err);
        res.status(400).send(err.message);
    }
};

// CRUD Operations
const getAllUsers = async (req, res) => {
    try {
        logger.info('Fetching all users');
        const users = await User.find();
        res.json(users);
    } catch (err) {
        logger.error('Error fetching users:', err);
        res.status(500).send(err.message);
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).send('User not found');

        res.json(user);
    } catch (err) {
        logger.error('Error fetching user:', err);
        res.status(500).send(err.message);
    }
};

const updateUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).send('User not found');

        const { name, email, password } = req.body;

        if (name) user.name = name;
        if (email) user.email = email;
        if (password) user.password = await bcrypt.hash(password, 10);

        await user.save();
        logger.info('User updated successfully', { id: req.params.id });
        res.send('User updated successfully');
    } catch (err) {
        logger.error('Error updating user:', err);
        res.status(500).send(err.message);
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).send('User not found');

        logger.info('User deleted successfully', { id: req.params.id });
        res.send('User deleted successfully');
    } catch (err) {
        logger.error('Error deleting user:', err);
        res.status(500).send(err.message);
    }
};

module.exports = { registerUser, loginUser, getAllUsers, getUserById, updateUser, deleteUser };
