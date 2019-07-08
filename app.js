var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')

// Connect Database
const connectDatabase = require('./config/db')
connectDatabase()

// All Of the routes have defined for rest api
var authRouter = require('./routes/api/auth')
var categoryRouter = require('./routes/api/categories')
var locationRouter = require('./routes/api/locations')
var productRouter = require('./routes/api/products')
var typeRouter = require('./routes/api/types')
var userRouter = require('./routes/api/users')

var app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// Activate routes for creating rest api
app.use('/api/auth', authRouter)
app.use('/api/category', categoryRouter)
app.use('/api/location', locationRouter)
app.use('/api/product', productRouter)
app.use('/api/type', typeRouter)
app.use('/api/user', userRouter)

module.exports = app
