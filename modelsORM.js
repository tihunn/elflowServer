const sequelize = require('./db')
const {DataTypes} = require('sequelize')

const User = sequelize.define( 'user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    email: {type: DataTypes.STRING, unique: true},
    password: {type: DataTypes.STRING},
    role: {type: DataTypes.STRING, defaultValue: 'user'},
    name: {type: DataTypes.STRING},
    number: {type: DataTypes.STRING}
})


const Order = sequelize.define('order', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    numberFlowers: {type: DataTypes.INTEGER},
    isAssembled: {type: DataTypes.BOOLEAN}
})

const Flower = sequelize.define('flower', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    nameFlower: {type: DataTypes.STRING},
    height: {type: DataTypes.INTEGER},
    bloomTime: {type: DataTypes.STRING},
    lightSensitivity: {type: DataTypes.STRING},
    available: {type: DataTypes.INTEGER},
    price: {type: DataTypes.INTEGER},
    wholesale: {type: DataTypes.INTEGER},
    description: {type: DataTypes.STRING},
    img: {type: DataTypes.STRING}
})


User.hasMany(Order)
Order.belongsTo(User)

Flower.hasOne(Order)
Order.belongsTo(Flower)


module.exports = {
    User,
    Flower,
    Order,
}