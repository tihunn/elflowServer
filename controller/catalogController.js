const {Flower, Basket, BasketFlower, User, Order, Catalog, CatalogFlower} = require("../modelsORM")
const uuid = require("uuid");
const path = require("path");
const ApiError = require("../error/ApiError")
const fs = require("fs");
const {Op, where, attributes} = require("sequelize")
const sequelize = require("pg/lib/connection");

class catalogController {
    async newCatalog(req, res, next) {
        try {
            const {nameCatalog} = req.body
            if (nameCatalog) {
                const model = await Catalog.create({nameCatalog})
                return res.json(model)
            } else {
                next(ApiError.badRequest("название каталога было пустым"))
            }

        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }


    async addFlower(req, res, next) {
        try {
            const {catalogId, flowerId} = req.body

            if (catalogId && flowerId) {
                const modelBinded = await CatalogFlower.create({flowerId, catalogId})
                return res.json(modelBinded)
            }
            return res.json("catalogId or flowerId don't came")

        } catch (e) {
            next(ApiError.badRequest("Связь уже создана"))
        }
    }


    async updateNameCatalog(req, res, next) {
        try {
            const {id} = req.params
            const {nameCatalog} = req.body
            if (nameCatalog) {
                const model = await Catalog.findByPk(id)
                model.nameCatalog = nameCatalog
                await model.save()
                return res.json(model)
            } else {
                next(ApiError.badRequest("название каталога было пустым"))
            }

        } catch (e) {
            next(ApiError.badRequest("Связь уже создана"))
        }
    }


    async delBind(req, res, next) {
        try {
            const {flowerId, catalogId} = req.query

            const model = await CatalogFlower.findOne({
                where: {
                    [Op.and]: [flowerId, catalogId]
                }
            })
            await model.destroy()

            return res.json("по идеи связь удалена")

        } catch (e) {
            next(ApiError.badRequest("Где запрос? Не ну напишите уж, что случилось, самому интересно."))
        }
    }


    async delCatalog(req, res, next) {
        try {
            const {id} = req.params

            const model = await Catalog.findByPk(id)
            await model.destroy()

            return res.json(`Каталог с id ${id} удалён`)

        } catch (e) {
            next(ApiError.badRequest("Где запрос? Не ну напишите уж, что случилось, самому интересно."))
        }
    }


    async getAll(req, res, next) {
        try {
            const nameFlower = req.params
            const {id} = req.query
            const completedParamQuery = (packedQuery = {}) => {
                let {limit, page} = req.query
                page = page || 1
                limit = limit || 12
                packedQuery.limit = limit
                packedQuery.offset = page * limit - limit
                return packedQuery
            }


            if (id) {
                const bindings = await CatalogFlower.findAll({where: {catalogId: id}})
                if (bindings.length === 0) {
                    return res.json("Каталог пуст")
                }

                let arrFlowerId = []
                bindings.forEach(flower => {
                    arrFlowerId.push(flower.flowerId)
                })
                const catalogFlowers = await Flower.findAndCountAll(
                    completedParamQuery(
                        {
                            where: {
                                id: {[Op.or]: arrFlowerId}
                            }
                        }
                    )
                )

                return res.json(catalogFlowers)
            } else {
                const model = await Catalog.findAll()
                return res.json(model)
            }

        } catch (e) {
            next(ApiError.badRequest("Где запрос? Не ну напишите уж, что случилось, самому интересно."))
        }
    }

}

module.exports = new catalogController()