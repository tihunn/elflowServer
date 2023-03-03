const {Flower, Sort, Image} = require("../modelsORM")
const uuid = require("uuid");
const path = require("path");
const ApiError = require("../error/ApiError")
const fs = require("fs");
const {Op} = require("sequelize")

class imgController {
    async addImg(req, res, next) {
        try {
            let {
                nameSort,
                id
            } = req.body

            if (!id) { return next(ApiError.badRequest("не введён flowerId")) }
            if (!req.files) { return next(ApiError.badRequest("файлы не переданы")) }
            if (!nameSort) { nameSort = "Обычный" }


            const arrFiles = Object.values(req.files)

            for (const file of arrFiles) {
                const fileExtension = file.name.split(".").pop()
                file.name =  uuid.v4() + "." + fileExtension

                const sort = await Sort.findOrCreate({
                    where: {flowerId: id, nameSort}
                })

                await Image.create({
                    flowerId: id,
                    sortId: sort[0].dataValues.id,
                    nameImage: file.name
                })

                const filePath = path.resolve(__dirname, "..", "static")
                if (!fs.existsSync(filePath)) {
                    fs.mkdirSync(filePath, {recursive: true})
                }
                await file.mv( path.resolve(__dirname, "..", "static", file.name) )
            }


            return res.json("Запрос успешно обработан")
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }


    async delImg(req, res, next) {
        try {
            let {
                nameImage,
            } = req.query
            const {id} = req.params


            if (!nameImage) {
                if (!id) { return next(ApiError.badRequest("Не отправлен flowerId параметром")) }

                const image = await Image.findAll({where: {flowerId: id} })

                for (const file of image) {
                    fs.unlinkSync(path.resolve(__dirname, "..", 'static', file.nameImage))
                }

                await Flower.destroy({where: {id}})
                await Image.destroy({where: {flowerId: id} })
                await Sort.destroy({where: {flowerId: id} })
            } else {

                const image = await Image.findAll({where: {nameImage} })

                if (image.length !== 0) {
                    fs.unlinkSync(path.resolve(__dirname, "..", 'static', nameImage))
                    await Image.destroy({where: {nameImage} })
                } else {
                    return next(ApiError.badRequest("Название изображения отсутствует в базе данных"))
                }

            }

            return res.json("Запрос на удаление успешно обработан")
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }


}

module.exports = new imgController()