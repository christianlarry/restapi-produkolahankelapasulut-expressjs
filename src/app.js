import dotenv from 'dotenv'
import express from 'express'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import cors from 'cors'

// IMPORT ROUTES
import BaseRoute from './routes/BaseRoute.js'
import AuthRoute from './routes/AuthRoute.js'
import TokoRoute from './routes/TokoRoute.js'
import ProdukRoute from './routes/ProdukRoute.js'
import UserRoute from './routes/UserRoute.js'

import authenticateToken from './middlewares/authenticateToken.js'
// END IMPORT ROUTES

dotenv.config()
const app = express()

// MIDDLEWARE
app.use(cors())
app.use(cookieParser())
app.use(morgan('combined'))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
// END MIDDLEWARE

// USE ROUTE
app.use('/',BaseRoute)
app.use('/',AuthRoute)

app.use('/api',authenticateToken)
app.use('/api',TokoRoute)
app.use('/api',ProdukRoute)
app.use('/api',UserRoute)
// END USE ROUTE

// HTTP SERVER LISTEN
const port = process.env.PORT
app.listen(port,()=>{
    console.log(`Server up and running at port ${port}`)
})