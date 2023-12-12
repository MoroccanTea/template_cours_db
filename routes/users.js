var express = require('express');
var router = express.Router();
var User = require('../models/user');
var bcrypt = require('bcryptjs');
var { generateToken } = require('../utils/jwtUtils');
var isAdmin = require('../middlewares/isAdmin');
var athenticate = require('../middlewares/authenticate');

/* GET users listing. */
router.get('/', athenticate, isAdmin, async function(req, res, next) {
  await User.find({}).then((users) => {
    res.json(users);
  }).catch(next);
});

/* GET user by id */
router.get('/:id', function(req, res, next) {
  User.findById(req.params.id).then((user) => {
    res.json(user);
  }).catch(next);
});

/* POST user */
router.post('/register', async function(req, res, next) {
  try {
  const hashedpassword = await bcrypt.hash(req.body.password, 10);
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedpassword,
    role: req.body.role
  });
  await user.save();
    res.status(201).json({ message: 'User created successfully', user: {_id: user._id, name: user.name} });
  } catch (error){
    res.status(500).json({message: error.message});
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
  res.json({ token });
});


// DELETE user
router.delete('/:id', function(req, res, next) {
  User.findOneAndDelete({ _id: req.params.id }).then((user) => {
    res.json(user);
  }).catch(next);
});




module.exports = router;
