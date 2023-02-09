const {Flower, Basket, BasketFlower, User, Order} = require("../modelsORM")
const uuid = require("uuid");
const path = require("path");
const ApiError = require("../error/ApiError")
const fs = require("fs");
const {Op, where, attributes} = require("sequelize")
const sequelize = require("pg/lib/connection");

class orderController {
    async add(req, res, next) {
        try {
            let userId = req.user.id
            let {id} = req.params
            let order

            order = await Order.findOne({where: {userId, flowerId: id}})

            if (order) {
                ++order.numberFlowers
                order = await order.save()
            } else {
                order = await Order.create({
                    userId,
                    flowerId: id,
                    numberFlowers: 1
                })
            }

            return res.json(order)

        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }


    async assemble(req, res, next) {
        try {
            let userId = req.user.id
            let {id} = req.params

            let order = await Order.findAll({where: {userId}})
            order.isAssembled = false

            return res.json(order)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }


    async get(req, res, next) {
        try {
            let userId = req.user.id

            let orders = await Order.findAll({where: {userId}})

            if (orders.length === 0) {
                return res.json("Закажите цветы!")
            }


            let arrFlowerId = []
            orders.map(order => {
                arrFlowerId.push(order.flowerId)
            })
            let flowers = await Flower.findAll({
                where: {
                    id: {
                        [Op.or]: arrFlowerId
                    }
                }
            })
            flowers.map(flower => {
                orders.forEach(order => {
                    if (flower.id === order.flowerId) {
                        flower.dataValues.numberFlowers = order.numberFlowers
                        flower.dataValues.isAssembled = order.isAssembled
                    }
                })
            })


            return res.json(flowers)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }


    async del(req, res, next) {
        try {
            let userId = req.user.id
            let {id} = req.params
            let flowerId = id

            await Order.destroy({where: {userId, flowerId}})

            return res.json(`один заказ с idFlower: ${id} удалён успешно`)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }


    async delAll(req, res, next) {
        try {
            let userId = req.user.id

            await Order.destroy({where: {userId}})

            return res.json("все записи пользоателя удалены")
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }


}

module.exports = new orderController()