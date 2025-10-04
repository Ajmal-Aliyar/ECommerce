const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");  
const nocache = require("nocache");
const bodyParser = require("body-parser");
require("dotenv").config();

// ---------------------
// Database Connection
// ---------------------
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// ---------------------
// Express App Setup
// ---------------------
const app = express();
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI, 
      collectionName: "sessions",
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production", 
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// General middlewares
app.use(nocache());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// ---------------------
// Routes
// ---------------------
const userRoute = require("./routes/userRoute");
const adminRoute = require("./routes/adminRoute");
const googleauth = require("./routes/googleauth.js");

app.use("/", userRoute);
app.use("/auth", googleauth);
app.use("/admin", adminRoute);

// ---------------------
// Start Server
// ---------------------
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}/signUp`);
});
