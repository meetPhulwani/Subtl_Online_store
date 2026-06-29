const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const app = express();
require('dotenv').config();

const db = require('./config/mongoose-connection');
const ownersRouter = require('./routes/ownersRouter');
const usersRouter = require('./routes/usersRouter');
const productsRouter = require('./routes/productsRouter');
const indexRouter = require('./routes/index');
const expressSession = require('express-session');
const flash = require('connect-flash');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

app.use(compression());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(
    expressSession({
        resave: false,
        saveUninitialized: false,
        secret: process.env.EXPRESS_SESSION_SECRET,
    })
);
app.use(flash());

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/', indexRouter);
app.use('/owners', ownersRouter);
app.use('/users', authLimiter, usersRouter);
app.use('/products', productsRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});
