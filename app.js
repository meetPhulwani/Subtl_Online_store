const express = require('express');
const path = require('path');
const cookie = require('cookie-parser');
const app = express();
const db = require('./config/mongoose-connection');
const ownersRouter = require('./routes/ownersRouter');
const usersRouter = require('./routes/usersRouter');
const productsRouter = require('./routes/productsRouter');
const expressSession = require('express-session');
const flash = require('connect-flash');
require('dotenv').config();
const isLoggedIn = require('./middlewares/isLoggedIn');
const productModel = require('./models/productModel');
const indexRouter = require('./routes/index');


app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname , 'public')));
app.use(cookie());
app.set("view engine","ejs");
app.set("views", path.join(__dirname, "views"));
app.use(
    expressSession({
        resave: false,
        saveUninitialized:false,
        secret:process.env.EXPRESS_SESSION_SECRET

    })
);
app.use(flash());

app.use('/', indexRouter);
app.use('/owners',ownersRouter);
app.use('/users',usersRouter);
app.use('/products',productsRouter);


app.get("/",(req,res)=>{
    res.render('app');
});

app.get("/login",(req,res)=>{
    res.render('loginPg',{
        success: req.flash("success"),
        error: req.flash("error"),
    });
});

app.get('/shop',isLoggedIn,async (req,res)=>{
    let products = await productModel.find();
    res.render('shop',{products,success: req.flash("success"),error: req.flash("error"),});

});

app.get('/admin',(req,res)=>{
    res.render('createProducts',{
        success: req.flash("success"),
        error: req.flash("error")
    });
})











app.listen(3000 , ()=>{
    console.log("app connected");
})