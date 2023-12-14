const express = require('express');

const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../utils/jwtUtils');
const isAdmin = require('../middlewares/isAdmin');
const authenticate = require('../middlewares/authenticate');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - role
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         role:
 *           type: string
 *           enum: [admin, customer]
 *         isActive:
 *           type: boolean
 *           default: true
 *         isVerified:
 *           type: boolean
 *           default: false
 *   responses:
 *     UserNotFound:
 *       description: User not found.
 *     UnauthorizedError:
 *       description: Unauthorized access.
 */

/**
 * @swagger
 * /users/:
 *   get:
 *     summary: Retrieves all users
 *     description: Admin endpoint to get all users data. Only accessible by admin roles.
 *     responses:
 *       200:
 *         description: An array of user objects.
 *       401:
 *         description: Unauthorized access.
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Retrieves a specific user by ID
 *     description: Requires JWT token for authentication.
 *                  Accessible by the user themselves or an admin.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User data.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: User not found.
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     description: Endpoint for user registration.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully.
 *       400:
 *         description: Invalid input data.
 */

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: User login
 *     description: Endpoint for user authentication.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authentication successful, returns token.
 *       401:
 *         description: Authentication failed.
 */

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user
 *     description: Requires JWT token for authentication.
 *                  Endpoint to update user data. Only accessible by the user themselves.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: User not found.
 */

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Admin endpoint to delete a user. Only accessible by admin roles.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *       404:
 *         description: User not found.
 */

router.get('/', authenticate, isAdmin, async (req, res, next) => {
  await User.find({}).then((users) => {
    res.status(200).json(users);
  }).catch(next);
});

router.get('/:id', authenticate, async (req, res, next) => {
  const loggedInUser = req.user;
  if (loggedInUser && loggedInUser.id === req.params.id) {
    await User.findById(req.params.id).then((user) => {
      res.status(200).json(user);
    }).catch(next);
  } else {
    res.status(401).json({ message: 'Forbidden !' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const hashedpassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedpassword,
      role: 'customer',
    });
    await user.save();
    res.status(201).json({ message: 'User created successfully', user: { _id: user.id, name: user.name } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(401).json({ message: 'Authentication failed' });
  }
  const isMatch = await bcrypt.compare(req.body.password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Authentication failed' });
  }

  const token = generateToken(user);
  return res.status(200).json({ token });
});

router.put('/:id', authenticate, async (req, res, next) => {
  const loggedInUser = req.user;
  const data = {
    name: req.body.name,
    email: req.body.email,
  };
  if (loggedInUser && loggedInUser.id === req.params.id) {
    await User.findOneAndUpdate({ _id: req.params.id }, data).then((user) => {
      res.status(200).json(user);
    }).catch(next);
  }
});

router.delete('/:id', authenticate, isAdmin, (req, res, next) => {
  User.findOneAndDelete({ _id: req.params.id }).then(() => {
    res.status(200).json('User deleted successfully');
  }).catch(next);
});

module.exports = router;
