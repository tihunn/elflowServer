const {Flower, Order, Image, User, OrderFlower} = require("../modelsORM")
const ApiError = require("../error/ApiError")
const {Op, or} = require("sequelize")
const uuid = require("uuid");
const authController = require("./authController")
const {response} = require("express");

class orderController {
    async add(req, res, next) {
        try {
            let userId = req.user.id
            let {id} = req.params

            let {numberFlower} = req.body
            if (!id) {
                next(ApiError.badRequest("не пришел id цветка в параметры"))
            }

            let order = await Order.findOne({
                where: {
                    userId,
                    status: 'draft'
                }
            })

            if (order) {
                let orderFlowers = await OrderFlower.findCreateFind({
                    where: {
                        flowerId: id,
                        orderId: order.id
                    }
                })
                const flower = await Flower.findByPk(id)


                let oldNumberFlowers = orderFlowers[0].numberFlowers
                let newNumberFlowers =
                    numberFlower
                    ? numberFlower - oldNumberFlowers
                    : 1

                orderFlowers[0].numberFlowers = numberFlower ? numberFlower : ++oldNumberFlowers
                await orderFlowers[0].save()

                order.sumPrice = order.sumPrice + flower.price * newNumberFlowers
                order.sumFlowers = order.sumFlowers + newNumberFlowers
                order = await order.save()



            } else {
                next(ApiError.badRequest(order))
            }

            return res.json(order)

        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }


    async assemble(req, res, next) {
        try {
            const userId = req.user.id

            const order = await Order.findOne({
                where: {
                    userId,
                    status: 'draft'
                }
            })
            order.status = "assemble"
            await order.save()

            await Order.create({status: "draft", sumFlowers: 0, sumPrice: 0, userId})

            return res.json("order send to assemble and new order create")
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }



    async get(req, res, next) {
        try {
            let userId = req.user.id

            let order = await Order.findOne({
                where: {
                    userId,
                    status: 'draft'
                }
            })

            const orderFlowers = await OrderFlower.findAll({
                where: {
                    orderId: order.id
                }
            })

            if (orderFlowers.length === 0) {
                return res.json("Закажите цветы!")
            }


            let arrFlowerId = []
            orderFlowers.map(order => {
                arrFlowerId.push(order.flowerId)
            })

            let flowers = await Flower.findAndCountAll({
                where: {
                    id: {
                        [Op.or]: arrFlowerId
                    }
                }
            })


            let img = await Image.findAll({
                where: {
                    flowerId: {
                        [Op.or]: arrFlowerId
                    }
                }
            })

            // models merging
            flowers.rows.map(flower => {
                orderFlowers.forEach(order => {
                    if (flower.id === order.flowerId) {
                        flower.dataValues.numberFlowers = order.numberFlowers
                    }
                })

                let arrImg = []
                img.forEach(img => {
                    if (flower.id === img.flowerId) {
                        arrImg.push(img.nameImage)
                    }
                })
                flower.dataValues.image = arrImg
            })
            flowers.order = order

            return res.json(flowers)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }



    async getAll(req, res, next) {
        try {
            const {statusSend} = req.query

            let orders = await Order.findAll({ where: {status: statusSend} })

            let arrUserId = []
            orders.map(order => {
                arrUserId.push(order.userId)
            })

            let users = await User.findAll({
                where: {
                    id: {
                        [Op.or]: arrUserId
                    }
                }
            })

            // models merging
            orders.map(order => {
                users.forEach(user => {
                    if (user.id === order.userId) {
                        order.dataValues.user = user
                    }
                })
            })

            return res.json(orders)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }



    async history(req, res, next) {
        try {
            const userId = req.user.id

            const orders = await Order.findAll({
                where: {
                    userId,
                    [Op.not]: [{status: "draft"}]
                }
            })

            res.json(orders)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }

    }


    async del(req, res, next) {
        try {
            let userId = req.user.id
            let {flowerId} = req.params


            const order = await Order.findOne({
                where: {userId, status: "draft"}
            })
            let orderFlower = await OrderFlower.findOne({where: {orderId: order.id, flowerId}})

            const flower = await Flower.findByPk(flowerId)

            order.sumPrice = order.sumPrice - flower.price * orderFlower.numberFlowers
            order.sumFlowers = order.sumFlowers - orderFlower.numberFlowers
            await order.save()
            await orderFlower.destroy()

            return res.json(`один заказ с idFlower: ${flowerId} удалён успешно`)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }


    async delAll(req, res, next) {
        try {
            let userId = req.user.id

            const order = await Order.findOne({where: {userId, status: "draft"}})
            await OrderFlower.destroy({where: {orderId: order.id}})

            order.sumPrice = 0
            order.sumFlowers = 0
            await order.save()

            return res.json("Теперь черновик пуст")
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }


}

module.exports = new orderController()