const {Flower, Image} = require("../modelsORM")
const ApiError = require("../error/ApiError")
const {Op} = require("sequelize")
const imgController = require("../controller/imgController");


class flowerController {
    async delete(req, res, next) {
        try {
            const {id} = req.params

            if (!id) {
                return next(ApiError.badRequest("не введён id"))
            }

            const model = await Flower.findByPk(id)
            if (!model) {
                return next(ApiError.notFound("id не найден"))
            }



            // need del img
            // need del catalog_flower

            await Flower.destroy({where: {id}})

            await imgController.delImg(req, res, next)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }



    async get(req, res, next) {
        try {
            let isKeysValid = (variable) => {
                let valids = ["id", "bloomTime", "lightSensitivity",
                    "available", "price", "wholesale", "description", "img"]
                return valids.some(valid => valid === variable)
            }

            let arrAttr = () => {
                let arr = []
                let value = Object.values(req.query)
                let keys = Object.keys(req.query)
                for (let i = 0; keys.length > i; i++) {
                    if (isKeysValid(keys[i])) {
                        let wrapper = {}
                        wrapper[keys[i]] = value[i]
                        arr.push(wrapper)
                    }
                }

                let {nameFlower} = req.query
                if (nameFlower) {
                    arr.push({
                        nameFlower: { [Op.iLike]: `%${nameFlower}%` }
                    })
                    arr.push({
                        alternativeNames: { [Op.iLike]: `%${nameFlower}%` }
                    })
                }

                let {heightMax, heightMin} = req.query
                if (heightMax > 1) {
                    arr.push({
                        height: { [Op.between]: [heightMin, heightMax] }
                    })
                }

                return arr
            }

            let packingQuery = () => {
                return {
                    where: {
                        [Op.or]: arrAttr(),
                    }
                }
            }

            let isQuery = () => {
                let queryLength = Object.keys(req.query).length
                let {id} = req.params

                if (id) {
                    return {where: {id}}
                }
                if (queryLength > 2) {
                    return packingQuery()
                }
            }

            let completedParamQuery = (packedQuery = {}) => {
                let {limit, page} = req.query
                page = page || 1
                limit = limit || 12
                packedQuery.limit = limit
                packedQuery.offset = page * limit - limit
                return packedQuery
            }

            const flower = await Flower.findAndCountAll(completedParamQuery(isQuery()))
            if (flower.length === 0) {
                return next(ApiError.notFound("параметр не найден или какая-то внутреняя ошибка"))
            }

            const arrFlowerId = []
            flower.rows.forEach(flower => {
                arrFlowerId.push({flowerId: flower.id})
            })
            const modelImages = await Image.findAll({where: {[Op.or]: arrFlowerId}})

            flower.rows.forEach(flower => {
                flower.dataValues.image = []
                modelImages.forEach(modelImage => {
                    if (flower.id === modelImage.flowerId) {
                        flower.dataValues.image.push(modelImage.nameImage)
                    }
                })
            })


            res.json(flower)

        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }


    async update(req, res, next) {
        try {
            let {
                id,
                nameFlower,
                bloomTime,
                lightSensitivity,
                height,
                price,
                wholesale,
                available,
                description,
                alternativeNames
            } = req.body

            const model = await Flower.findByPk(id)


            model.nameFlower = nameFlower
            model.lightSensitivity = lightSensitivity
            model.bloomTime = bloomTime
            model.height = Number(height)
            model.price = Number(price)
            model.wholesale = Number(wholesale)
            model.available = Number(available)
            model.description = description
            model.alternativeNames = alternativeNames

            const newModel = await model.save()

            res.json(newModel)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }


    async create(req, res, next) {
        if (!req.body.nameFlower || !req.body.height || !req.body.bloomTime) {
            return next(ApiError.badRequest("не введено название цветка, высота или время цветения"))
        }
        if (!Number(req.body.height)) {
            return next(ApiError.badRequest("введите только цифры"))
        }

        try {
            let {
                nameFlower,
                height,
                bloomTime,
                lightSensitivity = "Солнце",
                price = 200,
                wholesale = 100,
                available = 0,
                description,
                alternativeNames
            } = req.body

            height = Number(height)
            price = Number(price)
            wholesale = Number(wholesale)
            available = Number(available)

            const flower = await Flower.create({
                nameFlower,
                height,
                bloomTime,
                lightSensitivity,
                available,
                price,
                wholesale,
                description,
                alternativeNames
            })

            req.body.id = flower.id
            await imgController.addImg(req, res, next)


        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }


}

module.exports = new flowerController()