const express = require('express');

const router = express.Router();
const { Category } = require('../sequelize');

router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.send(categories);
  } catch (error) {
    res.status(500).send(error.message);
  }
});
