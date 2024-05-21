const { Sequelize } = require('sequelize');
const { Category } = require('./models/Category');

const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false,
});

sequelize.authenticate()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch((err) => console.error('Unable to connect to PostgreSQL:', err));

sequelize.sync({ force: false })
  .then(() => {
    console.log('PostgreSQL models synchronized');
  });

module.exports = {
  sequelize,
  Category,
};
