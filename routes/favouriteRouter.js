const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Favourite = require('../models/favourite');
const favouriteRouter = express.Router();
const cors = require('./cors');
favouriteRouter.use(bodyParser.json());
const authenticate = require('../authenticate');

favouriteRouter.route('/')
.options(cors.corsWithOptions, (req,res) => {res.sendStatus(200);})
      .get( cors.cors,authenticate.verifyUser, (req,res,next) => {
         Favourite.findById( req.user._id)
          .populate('user')
          .populate('dishes')
            .then((favourite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(favourite);
            },(err) => next(err))
            .catch((err) => next(err));
      })
      .post(cors.corsWithOptions,authenticate.verifyUser, (req,res,next) => {
        Favourite.findById( req.user._id)
        .then((favourite) => {
                if (favourite != null) {
                    favourite.dishes.push(req.body);
                    favourite.save()
                    .then((favourite) => {
                        Favourite.findById(favourite._id)
                        .populate('user')
                        .populate('dishes')
                          .then((favourite) => {
                              res.statusCode = 200;
                              res.setHeader('Content-Type', 'application/json');
                              res.json(favourite);
                          })
                    }, (err) => next(err));
                }
                else if(favourite == null){
                        req.body.user = req.user._id
                        Favourite.create(req.body)
                        .then((favourite) => {
                                Favourite.findById(favourite._id)
                                .populate('user')
                                .populate('dishes')
                                  .then((favourite) => {
                                      res.statusCode = 200;
                                      res.setHeader('Content-Type', 'application/json');
                                      res.json(favourite);
                                  })
                            }, (err) => next(err));
                }
                else {
                    err = new Error('Something fishy happened, try again ! ');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
        })
        .delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
                Favourite.findById(req.user._id)
                .then((favourite) => {
                    if (favourite != null) {
                        for (var i = (favourite.dishes.length -1); i >= 0; i--) {
                            favourite.dishes.id(favourite.dishes[i]._id).remove();
                        }
                        favourite.save()
                        .populate('user')
                        .populate('dishes')
                        .then((favourite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favourite);                
                        }, (err) => next(err));
                    }
                    else {
                        err = new Error('Favourite list  not found');
                        err.status = 404;
                        return next(err);
                    }
                }, (err) => next(err))
                .catch((err) => next(err));    
            });

// GET OPERATION ON / ONLY (all for all users and stuff)
// POST OPERATION WITH BODY FULL OF DISHID IS ALSO SUPPORTED   : /
//  POST OPERATION HAS AN ID INCLUDED for(Find/Create Schema)  /:dishId
// DELETE OPERATION AVAILABLE ON /:dishId
favouriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req,res) => {res.sendStatus(200);})
.post(cors.corsWithOptions,authenticate.verifyUser,(req,res,next) => {
        Favourite.findById(req.user._id)
        .then((favourite) => {
                if(favourite.dishes.indexOf(req.params.dishId) === -1){
                    err = new Error('This dish already exists, please try another dish ! ');
                    err.status = 404;
                    return next(err);
                }
                else if (favourite != null) {
                    favourite.dishes.push(req.params.dishId);
                    favourite.save()
                    .then((favourite) => {
                        Favourite.findById(favourite._id)
                        .populate('user')
                        .populate('dishes')
                          .then((favourite) => {
                              res.statusCode = 200;
                              res.setHeader('Content-Type', 'application/json');
                              res.json(favourite);
                          })
                    }, (err) => next(err));
                }
                else if(favourite == null){
                        req.body.user = req.user._id
                        req.body.dishes = [req.params.dishId]
                        Favourite.create(req.body)
                        .then((favourite) => {
                                Favourite.findById(favourite._id)
                                .populate('user')
                                .populate('dishes')
                                  .then((favourite) => {
                                      res.statusCode = 200;
                                      res.setHeader('Content-Type', 'application/json');
                                      res.json(favourite);
                                  })
                            }, (err) => next(err));
                }
                else {
                    err = new Error('Something fishy happened, try again ! ');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
        })
        .delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
                Favourite.findById(req.user._id)
                .then((favourite) => {
                    if (favourite != null) {
                            favourite.dishes.id(req.params.dishId).remove();
                            favourite.save()
                        .populate('user')
                        .populate('dishes')
                        .then((favourite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favourite);                
                        }, (err) => next(err));
                    }
                    else {
                        err = new Error('Favourite list  not found');
                        err.status = 404;
                        return next(err);
                    }
                }, (err) => next(err))
                .catch((err) => next(err));    
            });
module.exports = favouriteRouter;