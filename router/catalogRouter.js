const Router = require("express")
const router = new Router()
const catalogController = require("../controller/catalogController")
const roleMiddleware = require("../middleware/checkRoleMiddleware");


router.post("/", roleMiddleware("admin"), catalogController.newCatalog)
router.put("/", roleMiddleware("admin"), catalogController.addFlower)
router.put("/:id", roleMiddleware("admin"), catalogController.updateNameCatalog)
router.delete("/", roleMiddleware("admin"), catalogController.delBind)
router.delete("/:id", roleMiddleware("admin"), catalogController.delCatalog)
router.get("/", catalogController.getAll)
router.get("/:nameCatalog", catalogController.getAll)


module.exports = router