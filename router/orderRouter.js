const Router = require("express")
const router = new Router()
const orderRouter = require("../controller/orderController")
const authMiddleware = require("../middleware/authMiddleware")


router.post("/:id", authMiddleware, orderRouter.add)
router.post("/", authMiddleware, orderRouter.assemble)
router.get("/", authMiddleware, orderRouter.get)
router.delete("/:id", authMiddleware, orderRouter.del)
router.delete("/", authMiddleware, orderRouter.delAll)



module.exports = router