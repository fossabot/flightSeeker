const express = require('express');
const router = express.Router({mergeParams: true});

const mongo = require('../services/mongo');
const routeRouter = require('./routeRouter');
const airlineRouter = require('./airlineRouter');
const flightRouter = require('./flightRouter');
const escapeStringRegexp = require('escape-string-regexp');

function reqAirport(req, res, next) {
  console.log('[reqAirport]');
  mongo().then(db => {
    const startsWith = req.query.startsWith;
    const startsWithRegExp = startsWith ? {
        '$regex': new RegExp(`^${escapeStringRegexp(startsWith)}`, 'i')
      } : null;
    const query = req.params.iataAirport ? {
      'iata' : req.params.iataAirport,
    } : (
      req.query.startsWith ? {
        '$and' : [
          {
            '$or' : [
              {
                'name' : startsWithRegExp
              },
              {
                'city' : startsWithRegExp
              },
              {
                'cityNames' : {
                  '$elemMatch': startsWithRegExp
                }
              },
              {
                'iata': startsWithRegExp
              }
            ]
          },{
            'cityIata': {
              '$ne': req.query.notInCity
            }
          }
        ]
      } : {}
    );
    
    db.collection("airports").find(query).toArray().then(result => {
      res.airportData = (result||[]).map(doc=>Object.assign(doc,{'cityNames':undefined}));
      next();
    }, err => {
      console.error(err);
      res.sendStatus(500);
    });
  }, err => {
    console.error(err);
    res.sendStatus(500);
  });
}

function resAirport(req, res) {
  console.log('[resAirline]');
  if (res.airportData.length > 0) {
    res.send(res.airportData);
  } else {
    res.sendStatus(204);
  }
}

router.get('/', reqAirport, resAirport);
router.get('/:iataAirport([A-Z\\d]{3})', reqAirport, resAirport);
router.use('/:iataDeparture([A-Z\\d]{3})/airline', reqAirport, airlineRouter);
router.use('/:iataDeparture([A-Z\\d]{3})/to/:iataArrival([A-Z\\d]{3})/flight', flightRouter);
router.use('/:iataDeparture([A-Z\\d]{3})/to/:iataArrival([A-Z\\d]{3})/airline', routeRouter);

module.exports = router;
