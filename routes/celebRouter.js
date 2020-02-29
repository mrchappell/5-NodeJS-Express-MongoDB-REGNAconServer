const express = require('express');
const bodyParser = require('body-parser');
const Campsite = require('../models/celeb');
const authenticate = require('../authenticate');
const cors = require('./cors');

const celebRouter = express.Router();

celebRouter.use(bodyParser.json());

celebRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
        Celeb.find()
            .populate('comments.author')
            .then(celebs => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(celebs);
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Celeb.create(req.body)
            .then(celeb => {
                console.log('Celeb Created ', celeb);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(celeb);
            })
            .catch(err => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /celebs');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Celeb.deleteMany()
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    });

    campsiteRouter.route('/:celebId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        Celeb.findById(req.params.celebId)
            .populate('comments.author')
            .then(celeb => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(celeb);
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /celebs/${req.params.celebId}`);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Celeb.findByIdAndUpdate(req.params.celebId, {
            $set: req.body
        }, { new: true })
            .then(celeb => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(celeb);
            })
            .catch(err => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Celeb.findByIdAndDelete(req.params.celebId)
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    });

    celebRouter.route('/:celebId/comments')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        Celeb.findById(req.params.celebId)
            .populate('comments.author')
            .then(celeb => {
                if (celeb) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(celeb.comments);
                } else {
                    err = new Error(`Celeb ${req.params.campsiteId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Celeb.findById(req.params.celebId)
            .then(celeb => {
                if (celeb) {
                    req.body.author = req.user._id;
                    celeb.comments.push(req.body);
                    celeb.save()
                        .then(celeb => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(campsite);
                        })
                        .catch(err => next(err));
                } else {
                    err = new Error(`Celeb ${req.params.celebId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /celebs/${req.params.celebId}/comments`);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Celeb.findById(req.params.celebId)
            .then(celeb => {
                if (celeb) {
                    for (let i = (celeb.comments.length - 1); i >= 0; i--) {
                        celeb.comments.id(celeb.comments[i]._id).remove();
                    }
                    celeb.save()
                        .then(celeb => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(celeb);
                        })
                        .catch(err => next(err));
                } else {
                    err = new Error(`Celeb ${req.params.celebId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    });

    celebRouter.route('/:celebId/comments/:commentId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        Celeb.findById(req.params.celebId)
            .populate('comment.author')
            .then(celeb => {
                if (celeb && celeb.comments.id(req.params.celebId)) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(celeb.comments.id(req.params.commentId));
                } else if (!celeb) {
                    err = new Error(`Celeb ${req.params.celebId} not found`);
                    err.status = 404;
                    return next(err);
                } else {
                    err = new Error(`Comment ${req.params.commentId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Celeb.findById(req.params.celebId)
            .then(celeb => {
                if (celeb && celeb.comments.id(req.params.commentId)) {
                    if ((celeb.comments.id(req.params.commentId).author._id).equals(req.user._id)) {
                        celeb.comments.id(req.params.commentId).remove();
                        Celeb.save()
                            .then(celeb => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(celeb);
                            })
                            .catch(err => next(err));
                    } else if (!celeb) {
                        err = new Error(`Celeb ${req.params.celebId} not found`);
                        err.status = 404;
                        return next(err);
                    } else {
                        err = new Error(`Comment ${req.params.commentId} not found`);
                        err.status = 404;
                        return next(err);
                    }
                } else {
                    err = new Error('This is not your comment to update.');
                    err.status = 403;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Celeb.findById(req.params.celebId)
            .then(celeb => {
                if (celeb && celeb.comments.id(req.params.commentId)) {
                    if ((celeb.comments.id(req.params.commentId).author._id).equals(req.user._id)) {
                        celeb.comments.id(req.params.commentId).remove();
                        celeb.save()
                            .then(celeb => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(celeb);
                            })
                            .catch(err => next(err));
                    } else if (!celeb) {
                        err = new Error(`Celeb ${req.params.celebId} not found`);
                        err.status = 404;
                        return next(err);
                    } else {
                        err = new Error(`Comment ${req.params.commentId} not found`);
                        err.status = 404;
                        return next(err);
                    }
                } else {
                    err = new Error('This is not your comment to update.');
                    err.status = 403;
                    return next(err);
                }
            })
            .catch(err => next(err));
    });

module.exports = campsiteRouter;