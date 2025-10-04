const mongoose = require('mongoose')
require('dotenv').config()

mongoose.connect(process.env.MONGODB_URI)
const express = require("express")
const app = express()
const path = require('path')

// Middleware configuration
const session = require('express-session')
const nocache = require('nocache')
const bodyParser = require('body-parser')

const config = require('./config/config')


app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: "sessions"
  }),
  cookie: {
    secure: false, 
    maxAge: 1000 * 60 * 60 * 24
  }
}));

app.use(nocache())
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }))
// app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))



// app.use(express.static(path.join(__dirname, 'public')));
// app.set('view engine', "ejs")

const userRoute = require("./routes/userRoute")
const adminRoute = require('./routes/adminRoute')
const googleauth = require('./routes/googleauth.js')

app.use('/',userRoute)
app.use('/auth',googleauth)
app.use('/admin',adminRoute)

const PORT = process.env.PORT || 3;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/signUp`);
});