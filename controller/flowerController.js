const {Flower, Sort, Image} = require("../modelsORM")
const uuid = require("uuid");
const path = require("path");
const ApiError = require("../error/ApiError")
const fs = require("fs");
const {Op, where, attributes} = require("sequelize")

class flowerController {
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
            } = req.body
            let imgDestruction = null
            if (req.files) {
                const {img} = req.files
                imgDestruction = img
            }


            let fileName
            if (imgDestruction) {
                fileName = uuid.v4() + ".jpg"
            } else {
                fileName = "defFlower.jpg"
            }

            const flower = await Flower.create({
                nameFlower,
                height,
                bloomTime,
                lightSensitivity,
                available,
                price,
                wholesale,
                description,
            })
            const sort = await Sort.create({
                flowerId: flower.id
            })
            const image = await Image.create({
                flowerId: flower.id,
                sortId: sort.id,
                nameImage: fileName
            })

            if (imgDestruction) {await imgDestruction.mv(path.resolve(__dirname, "..", "static", fileName))}

            return res.json({flower, sort, image})
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

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
            if (model.img) {
                fs.unlinkSync(path.resolve(__dirname, "..", "static", model.img))
            }
            await Flower.destroy({where: {id}});
            res.json(`растение с id:${id} удалено успешно`)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async deleteFromDb(req, res, next) {
        try {
            const {id} = req.params

            if (!id) {
                return next(ApiError.badRequest("не введён id"))
            }
            const model = await Flower.findByPk(id)
            if (!model) {
                return next(ApiError.notFound("id не найден"))
            }
            await Flower.destroy({where: {id}});
            res.json(`растение с id:${id} удалено успешно`)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async get(req, res, next) {
        try {
            let isKeysValid = (variable) => {
                let valids = ["id", "nameFlower", "bloomTime", "lightSensitivity",
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

                let {heightMax, heightMin} = req.query
                if (heightMax > 1) {
                    arr.push( { height: {[Op.between]: [heightMin, heightMax]} } )
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

                if (id) { return { where: {id} } }
                if ( queryLength > 2 ) { return packingQuery()}
            }

            let completedParamQuery = (packedQuery = {}) => {
                let {limit, page} = req.query
                page = page || 1
                limit = limit || 12
                packedQuery.limit = limit
                packedQuery.offset = page * limit - limit
                return packedQuery
            }

            const model = await Flower.findAndCountAll( completedParamQuery( isQuery() ) )
            if (model.length === 0) {return next( ApiError.notFound("параметр не найден или какая-то внутреняя ошибка") )}

            const arrFlowerId = []
            model.rows.forEach( flower => {
                arrFlowerId.push( {flowerId: flower.id} )
            })
            const modelImages = await Image.findAll({where: {[Op.or]: arrFlowerId}})

            model.rows.forEach( flower => {
                flower.dataValues.image = []
                modelImages.forEach( modelImage => {
                    if (flower.id === modelImage.flowerId) {
                        flower.dataValues.image.push( modelImage.nameImage )
                    }
                } )
            })


           res.json(model)

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
            } = req.body

            const model = await Flower.findByPk(id)

            let imgDestruction = null
            if (req.files) {
                const {img} = req.files
                imgDestruction = img
            }
            let fileName
            if (imgDestruction) {
                fileName = uuid.v4() + ".jpg"
                fs.unlinkSync(path.resolve(__dirname, "..", 'static', model.img))
                await imgDestruction.mv(path.resolve(__dirname, "..", "static", fileName))
            } else {
                fileName = model.img
            }


            model.nameFlower = nameFlower
            model.lightSensitivity = lightSensitivity
            model.bloomTime = bloomTime
            model.height = Number(height)
            model.price = Number(price)
            model.wholesale = Number(wholesale)
            model.available = Number(available)
            model.description = description
            model.img = fileName
            const newModel = await model.save()
            res.json(newModel)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

}

module.exports = new flowerController()