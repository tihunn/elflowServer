const {Sequelize} = require('sequelize')

module.exports = new Sequelize(
    process.env.dbName, // Название БД
    process.env.dbUser, // Пользователь
    process.env.dbPassword, // ПАРОЛЬ
    {
        dialect: 'postgres',
        host: process.env.dbHost,
        port: process.env.dbPort
    }
)