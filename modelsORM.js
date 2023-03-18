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


const OrderFlower = sequelize.define('order_flower', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    numberFlowers: {type: DataTypes.INTEGER, defaultValue: 0}
})

const Order = sequelize.define('order', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    sumFlowers: {type: DataTypes.INTEGER},
    sumPrice: {type: DataTypes.INTEGER},
    status: {type: DataTypes.STRING}
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
    alternativeNames: {type: DataTypes.STRING},
    description: {type: DataTypes.STRING},
})

const Catalog = sequelize.define('catalog', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    nameCatalog: {type: DataTypes.STRING, unique: true}
})

const CatalogFlower = sequelize.define('catalog_flower', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}
})

const Image = sequelize.define('image', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    nameImage: {type: DataTypes.STRING}
})


User.hasOne(Order)
Order.belongsTo(User)

Order.belongsToMany(Flower, {through: OrderFlower})
Flower.belongsToMany(Order, {through: OrderFlower})

Flower.belongsToMany(Catalog, {through: CatalogFlower})
Catalog.belongsToMany(Flower, {through: CatalogFlower})

Flower.hasMany(Image)
Image.belongsTo(Flower)



module.exports = {
    User,
    Flower,
    Order,
    OrderFlower,
    Catalog,
    CatalogFlower,
    Image,
}