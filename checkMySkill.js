const Express = require('express')
const express = new Express()
const uuid = require('uuid')
const path = require('path')
const {Test} = require('./modelsORM')
const fs = require("fs");
const {config} = require("dotenv");
const ApiError = require('./error/ApiError')

express.get('/t', (req, res) => {
    res.json({message: "nani"})
})

express.get('/give2', async (req, res) => {
    const model = await Test.findAll()
    res.json({model} )
})

express.get('/givename/:id', async (req, res) => {
    const {id} = req.params
    const model = await Test.findByPk(id)
    const name = model.name
    res.json(name)
})

express.get('/give', async (req, res, next) => {
    const {id} = req.query
    if (!id) {
        return next(ApiError.badRequest('id не задан'))
    }
    const model = await Test.findByPk(id)
    res.json(model)
})

express.post('/file', (req, res) => {
    const {name} = req.body
    const {img} = req.files
    const fileName = uuid.v4() + '.jpg'
    img.mv( path.resolve(__dirname, 'static', fileName) )
    const successfulTest = Test.create({name, img: fileName})
    res.json(successfulTest)
})

express.delete('/delTab/:id', async (req, res) =>{
    const {id} = req.params
    await Test.destroy({ where: {id} });
    res.json(id)
})

express.delete('/del/:id', async (req, res) =>{
    const {id} = req.params
    const model = await Test.findByPk(id)
    const nameImg = model.dataValues.img
    fs.unlinkSync(path.resolve(__dirname, 'static', nameImg))
    await Test.destroy({ where: {id} });
    res.json(nameImg)
})

express.put('/update/:id', async (req, res) =>{
    const {id} = req.params
    const {name} = req.body
    const {img} = req.files
    const model = await Test.findByPk(id)
    fs.unlinkSync(path.resolve(__dirname, 'static', model.dataValues.img))
    const fileName = uuid.v4() + '.jpg'
    img.mv( path.resolve(__dirname, 'static', fileName) )
    model.name = name
    model.img = fileName
    const newModel = await model.save()
    res.json(newModel)
})

express.put('/update2/:id', async (req, res) => {
    const {id} = req.params
    const {name} = req.body
    const {img} = req.files
    const jane = await Test.findByPk(id)
    console.log(jane.name); // "Jane"
    jane.name = name;
// the name is still "Jane" in the database
    await jane.save();
// Now the name was updated to "Ada" in the database!
})

module.exports = express