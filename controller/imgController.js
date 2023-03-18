const {Image} = require("../modelsORM")
const uuid = require("uuid");
const path = require("path");
const ApiError = require("../error/ApiError")
const fs = require("fs");
const Sharp = require("sharp");


class imgController {
    async addImg(req, res, next) {
        try {
            let {
                id
            } = req.body

            if (!id) { return next(ApiError.badRequest("не введён flowerId")) }
            if (!req.files) { return next(ApiError.badRequest("файлы не переданы")) }



            const arrFiles = Object.values(req.files)

            for (const file of arrFiles) {
                const fileExtension = file.name.split(".").pop()
                file.name =  uuid.v4() + "." + fileExtension


                await Image.create({
                    flowerId: id,
                    nameImage: file.name
                })

                const filePath = path.resolve(__dirname, "..", "static")
                const filePathCompressed = path.resolve(__dirname, "..", "static", "compressed")
                if (!fs.existsSync(filePath)) {
                    fs.mkdirSync(filePath, {recursive: true})
                }
                if (!fs.existsSync(filePathCompressed)) {
                    fs.mkdirSync(filePathCompressed, {recursive: true})
                }
                await file.mv( path.resolve(__dirname, "..", "static", file.name) )

                await Sharp( path.resolve(__dirname, "..", "static", file.name) )
                    .resize({ width: 224, height: 224 })
                    .toFormat("jpeg")
                    .jpeg({ mozjpeg: true })
                    .toFile( path.resolve(__dirname, "..", "static", "compressed", file.name) , (err, info) => {
                        if (err) {
                            console.error(err);
                        } else {
                            console.log(info);
                        }
                    });
            }


            return res.json("Запрос успешно обработан")
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }



    async delt(req, res, next) {
        try {
            const {id} = req.query
            const image = await Image.findAll({where: {flowerId: id} })

            return res.json(image)
        }  catch (e) {
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

                const image = await Image.findAll({where: {flowerId: null} })

                for (const file of image) {
                    fs.unlinkSync(path.resolve(__dirname, "..", 'static', file.nameImage))
                    fs.unlinkSync(path.resolve(__dirname, "..", 'static', "compressed", file.nameImage))
                }

                await Image.destroy({where: {flowerId: null} })

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