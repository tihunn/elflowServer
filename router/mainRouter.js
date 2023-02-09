const Router = require("express")
const router = new Router()
const authRouter = require("./authRouter")
const flowerRouter = require("./flowerRouter")
const orderRouter = require("./orderRouter")
const catalogRouter = require("./catalogRouter")

router.use("/auth", authRouter)
router.use("/flower", flowerRouter)
router.use("/order", orderRouter)
router.use("/catalog", catalogRouter)


module.exports = router