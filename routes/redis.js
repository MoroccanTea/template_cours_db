const express = require('express');
const redis = require('redis');
const redisClient = require('../redisClient');

const router = express.Router();

router.get('/redis', async (req, res) => {
  redisClient.set('key', 'value', redis.print);
  // eslint-disable-next-line consistent-return
  redisClient.get('key', (err, reply) => {
    if (err) return res.status(500).send(err);
    res.send(reply);
  });
});
