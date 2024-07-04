require("dotenv").config();
module.exports = {
  development: {
    username: "root",
    password: "suresh",
    database: "tutorialdb",
    host: "localhost",
    dialect: "mysql",
    timezone: "+05:30",
  },
  test: {
    username: "root",
    password: null,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "mysql",
    timezone: "+05:30",
  },
  production: {
    username: process.env.MYSQL_ADDON_USER,
    password: process.env.MYSQL_ADDON_PASSWORD,
    database: process.env.MYSQL_ADDON_DB,
    host: process.env.MYSQL_ADDON_HOST,
    dialect: "mysql",
    timezone: "+05:30",
  },
};
