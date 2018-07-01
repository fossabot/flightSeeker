const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const airportRouter = require('./routes/airportRouter');
const airlineRouter = require('./routes/airlineRouter');
const flightRouter = require('./routes/flightRouter');
const compression = require('compression');

const app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression({
    level : 9
  }));

app.use('/', indexRouter);
app.use('/airport', airportRouter);
app.use('/airline', airlineRouter);
app.use('/airport/:iataDeparture/to/:iataArrival/airline/:iataAirline/flight/:date', flightRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  console.error(err);
  // render the error page
  res.status(err.status || 500);
  res.send(req.app.get('env') === 'development' ? err : {});
});

module.exports = app;
