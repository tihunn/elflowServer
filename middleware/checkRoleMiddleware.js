const jsonwebtoken = require("jsonwebtoken")

module.exports = function (role) {
    return function (req, res, next) {
        if (req.method === "OPTIONS") {
            next()
        }
        try {
            const jwt = req.headers.authorization.split(" ")[1]
            if (!jwt) {
                res.status(401).json({message: "не авторизован"})
            }
            const decoded = jsonwebtoken.verify(jwt, process.env.secretKey)
            if (decoded.role !== role) {
                return res.status(403).json({message: "не достаточно прав"})
            }
            next()
        } catch (e) {
            res.status(401).json({message: "не авторизован"})
        }
    }
}