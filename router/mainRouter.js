const Router = require("express")
const router = new Router()
const authRouter = require("./authRouter")
const flowerRouter = require("./flowerRouter")
const checkMySkill = require("../checkMySkill")
const orderRouter = require("./orderRouter")

router.use("/auth", authRouter)
router.use("/flower", flowerRouter)
router.use("/test", checkMySkill)
router.use("/order", orderRouter)


module.exports = router