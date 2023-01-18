const Router = require("express")
const flowerController = require("../controller/flowerController");
const router = new Router()
const roleMiddleware = require("../middleware/checkRoleMiddleware")

router.post("/add", roleMiddleware("admin"), flowerController.create)
router.delete("/del/:id", roleMiddleware("admin"), flowerController.delete)
router.get("/", flowerController.get)
router.get("/:id", flowerController.get)
router.delete("/deldb/:id", roleMiddleware("admin"), flowerController.deleteFromDb)
router.put("/update", roleMiddleware("admin"), flowerController.update)

module.exports = router