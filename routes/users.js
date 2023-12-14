var express = require('express');
var router = express.Router();
var User = require('../models/user');
var bcrypt = require('bcryptjs');
var { generateToken } = require('../utils/jwtUtils');
var isAdmin = require('../middlewares/isAdmin');
var authenticate = require('../middlewares/authenticate');


/**
 * @swagger
 * /users/:
 *   get:
 *     summary: Get all users
 *     description: Admin endpoint to get all users data
 *     responses:
 *       200:
 *         description: Success response description
 */
/* GET users listing. */
router.get('/', authenticate, isAdmin, async function (req, res, next) {
  await User.find({}).then((users) => {
    res.status(200).json(users);
  }).catch(next);
});

/* GET user by id */
router.get('/:id', authenticate, function (req, res, next) {
  const loggedInUser = req.user;
  if (loggedInUser._id.toString() == req.params.id) {
    User.findById(req.params.id).then((user) => {
      res.status(200).json(user);
    }).catch(next);
  }
});

/* POST user */
router.post('/register', async function (req, res, next) {
  try {
    const hashedpassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedpassword,
      role: "customer"
    });
    await user.save();
    res.status(201).json({ message: 'User created successfully', user: { _id: user._id, name: user.name } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* LOGIN user */
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
  res.status(200).json({ token });
});

/* UPDATE user */
router.put('/:id', authenticate, async function (req, res, next) {
  const loggedInUser = req.user;
  let data = {
    name: req.body.name,
    email: req.body.email
  };
  if (loggedInUser._id.toString() == req.params.id) {
    await User.findOneAndUpdate({ _id: req.params.id }, data).then((user) => {
      res.status(200).json(user);
    }).catch(next);
  };
});

// DELETE user
router.delete('/:id', authenticate, isAdmin, function (req, res, next) {
  User.findOneAndDelete({ _id: req.params.id }).then((user) => {
    res.status(200).json("User deleted successfully");
  }).catch(next);
});




module.exports = router;
