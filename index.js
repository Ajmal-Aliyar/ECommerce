const mongoose = require('mongoose')
mongoose.connect("mongodb://localhost:27017/e_commerse")
const express = require("express")
const app = express()
const path = require('path')
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', "ejs")

const userRoute = require("./routes/userRoute")
const adminRoute = require('./routes/adminRoute')
const googleauth = require('./routes/googleauth.js')

app.use('/',userRoute)
app.use('/auth',googleauth)
app.use('/admin',adminRoute)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/signUp`);
});