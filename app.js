require('dotenv').config();

const express = require('express');
const session = require('express-session')
const cookieParser = require('cookie-parser')
const MongoStore = require('connect-mongo')
const methodOverride = require('method-override')
const expressLayout = require('express-ejs-layouts')

const connectDB = require('./server/config/db')
const app = express();
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'))

app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));

const PORT = 5000

connectDB();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    })
}))

app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/routes'));

app.listen(PORT, (req,res) => {
    console.log(`server running on ${PORT}`)
})