var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')

// Connect Database
const connectDatabase = require('./config/db')
connectDatabase()

// All Of the routes have defined for rest api
var userAuthRouter = require('./routes/api/auth/user')
var adminAuthRouter = require('./routes/api/auth/admin')
var categoryRouter = require('./routes/api/categories')
var locationRouter = require('./routes/api/locations')
var productRouter = require('./routes/api/products')
var typeRouter = require('./routes/api/types')
var userRouter = require('./routes/api/users')
var adminRouter = require('./routes/api/admins')

var app = express()

app.use(logger('dev'))
app.use(express.json({extended: false}))
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// Activate routes for creating rest api
app.use('/api/auth/user', userAuthRouter)
app.use('/api/auth/admin', adminAuthRouter)
app.use('/api/category', categoryRouter)
app.use('/api/location', locationRouter)
app.use('/api/product', productRouter)
app.use('/api/type', typeRouter)
app.use('/api/user', userRouter)
app.use('/api/admin', adminRouter)

module.exports = app
