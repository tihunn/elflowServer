require("dotenv").config()
const express = require("express")
const sequelize = require("./db")
const models = require("./modelsORM")
const cors = require("cors")
const mainRouter = require("./router/mainRouter")
const fileUpload = require("express-fileupload")
const path = require("path")
const errorHandler = require("./middleware/errorHandlingMiddleware")

const port = process.env.SERVER_PORT || 3007
const host = process.env.SERVER_HOST

const app = express()
app.use(cors())
app.use(express.json())
app.use(fileUpload({}))
app.use(express.static (path.resolve(__dirname, "static") ))
app.use('/', mainRouter)

app.use(errorHandler)


const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        console.log('Connection has been established successfully.');
        console.log("env === SERVER_PORT: " + process.env.SERVER_PORT)
        app.listen( port, () => console.log(`Server listens http://${host}:${port}`) )
    } catch (e) {
        console.error('Unable to connect to the database:', e);
    }
}

start()

module.exports = app