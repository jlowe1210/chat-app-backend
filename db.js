const { Sequelize } = require("sequelize");
require("dotenv").config();
let sequelize;

sequelize = new Sequelize({
  database: process.env.PROD_DB_DATABASE,
  username: process.env.PROD_DB_USERNAME,
  password: process.env.PROD_DB_PASSWORD,
  host: process.env.PROD_DB_HOST,
  port: process.env.PROD_DB_PORT,
  dialect: "mysql",
  logging: false,
  define: {
    timestamps: false,
  },
});

module.exports = sequelize;
