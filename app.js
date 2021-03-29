let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let bodyParser = require('body-parser')
let dotenv = require('dotenv')
dotenv.config();
const errorHandler = require('./middlewares/errorHandler');
const cors = require('cors');
const passport = require('passport');
require('./middlewares/passport')(passport);
let app = express();


// swagger docs route
app.use('/api-docs', require('./helpers/swagger'));


// Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('secret'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// using passport for authentications 
app.use(passport.initialize());

// allow cors requests from any origin and with credentials
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: false }));
// catch 404 and forward to error handler
// error handler
app.use(errorHandler);

app.use(function (err, req, res, next) {
  console.log(err);
});

// authentication router
app.use('/api', require('./routes/auth'));

// require authentication router
app.use('/api', passport.authenticate('jwt', { session: false }), require('./routes/_auth'));
app.use('/api/users', passport.authenticate('jwt', { session: false }), require('./routes/users'));

//redirect to login if route is not registered
app.use('*', function (req, res) {
  res.json({ message:"cette route n'est pas repertoriee"});
});


module.exports = app;
