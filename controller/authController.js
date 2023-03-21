const {User, Order} = require("../modelsORM");
const bcrypt = require("bcrypt")
const jsonwebtoken = require("jsonwebtoken")
const ApiError = require("../error/ApiError");


let generatorJwt = (id, email, role, name, number) => {
    if (number && number.length !== 4) {
        let firstStr = number.slice(0, 2)
        number = `${firstStr}-******-${ number.slice(-4) }`
    }

    return jsonwebtoken.sign(
        {id, email, role, name, number},
        process.env.secretKey,
        {expiresIn: "24h"}
    )
}


class authController {
    async registration(req, res, next) {

        const {email, password, name, number} = req.body
        const candidate = await User.findOne({where: {email}})
        if (candidate) {
            return next(ApiError.badRequest("такой email уже существует"))
        }
        const hashPassword = await bcrypt.hash(password, 5)
        const user = await User.create({email, password: hashPassword, name, number})

        const token = generatorJwt(user.id, user.email, user.role, user.name, user.number)

        await Order.create({status: "draft", sumFlowers: 0, sumPrice: 0, userId: user.id})

        return res.json({token})
    }


    async login(req, res, next) {
        const {email, password} = req.body
        const user = await User.findOne({where: {email}})
        if (!user) {
            return next(ApiError.internal("пользователь не найден"))
        }
        let comparePassword = bcrypt.compareSync(password, user.password)
        if (!comparePassword) {
            return next(ApiError.internal("не верный пароль"))
        }

        const token = generatorJwt(user.id, user.email, user.role, user.name, user.number)
        return res.json({token})
    }


    async check(req, res) {
        const token = generatorJwt(req.user.id, req.user.email, req.user.role, req.user.name, req.user.number)
        return res.json({token})
    }


    async create_admin(req, res, next) {
        try {
            const admin = await User.findByPk(1)
            admin.role = "admin"
            await admin.save()
            return res.json("Первый пользователь теперь admin")
        } catch (e) {
            return next(ApiError.badRequest("Возможно даже первого пользователя нету"))
        }
    }


    async update(req, res, next) {
        try {
            const {oldEmail, email, password, name, number} = req.body
            let user = await User.findOne({where: {email: oldEmail}})

            if (email) {
                user.email = email
            }
            if (password) {
                const hashPassword = await bcrypt.hash(password, 5)
                user.password = hashPassword
            }
            if (name) {
                user.name = name
            }
            if (number) {
                user.number = number
            }

            user = await user.save()
            const token = generatorJwt(user.id, user.email, user.role,  user.name, user.number)

            return res.json({token})
        } catch (e) {
            return next(ApiError.badRequest(e))
        }

    }
}

module.exports = new authController()