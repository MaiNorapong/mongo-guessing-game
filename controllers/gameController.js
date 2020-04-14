var Game = require('../models/game');

var async = require('async');
const validator = require('express-validator');

//  Handle game play on GET.
exports.play_get = function (req, res, next) {
  Game.findOne({}, function (err, game) {
    if (err) { return next(err); }
    if (game==null) { // No results.
      res.redirect('/create');
    }
    res.render('play', { title: 'Guessing Game', error: err, game: game,
      humanizedOrder: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eight', 'ninth', 'tenth']
    });
  });
  // res.render('play', {
  //   title: 'Guessing Game',
  //   choices: ['A', 'B', 'C', 'D'],
  //   answer: [],
  //   question: ['C', 'A', 'C', 'B'],
  //   humanizedOrder: ['first', 'second', 'third', 'fourth'],
  // });
};

//  Handle game play on POST.
exports.play_post = function (req, res, next) {
  Game.findOne({}, function (err, game) {
    if (err) { return next(err); }
    // game logic
    var doc = {};
    if (req.body.choice === game.question[game.answer.length]) { // correct answer
      console.log('correct answer');
      doc = {'$set': { answer: game.answer.concat([req.body.choice]) }};
    } else { // wrong answer
      console.log('wrong answer');
      doc = {'$set': { fails: game.fails + 1 }};
    }
    Game.findOneAndUpdate({ _id: game._id }, doc,{}
      , function (err, game) {
        if (err) { return next(err); }
        if (game==null) { // No results.
          var err = new Error('Game instance to update not found');
          err.status = 200;
          return next(err);
        }
        console.log('updated game ' + game);
        res.redirect('/play');
      });
  });
};

//  Handle Game create on GET.
exports.create_get = function (req, res, next) {
  Game.findOne({}, function (err, game) {
    if (err) { return next(err); }
    res.render('create', { title: 'Create Guessing Game', game: game});
  })
};

//  Handle Game "create" on Post.
exports.create_post = [
  validator.body('choices', )
    .trim().notEmpty()
    .withMessage('Choices are required'),
    // TODO: Buggy
    // Choices are unique
    // .custom((value, { req }) => value.split("") === value.split("").filter((value, index, array) => array.indexOf(value)===index))
    // .withMessage((value, { req }) => 'Choices must be unique'),
  validator.body('question', 'Question is required')
    .trim().notEmpty()
    .withMessage('Question is required')
    // Question can be answered with choices
    .custom((value, { req }) => value.split("").every(val => req.body.choices.split("").includes(val)))
    .withMessage('Question must be answerable by choices'),
  // Process request after validation and sanitization.
  (req, res, next) => {
    console.log(req.body);
    // Extract the validation errors from a request.
    const errors = validator.validationResult(req);
    const game = {
      // Get unique elements in an array
      choices: req.body.choices.split("").filter((value, index, array) => array.indexOf(value)===index),
      question: req.body.question.split(""),
      answer: [],
      fails: 0,
    };

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render('create', {title: 'Create Guessing Game', game: game, errors: errors.array()});
    } else {
      // Creates the object if it doesn't exist.
      Game.findOneAndUpdate({}, game, {upsert: true}
        , function (err, old) {
          if (err) {
            return next(err);
          }
          console.log('updated game instance ' + old + ' with ' + game);
          res.redirect('/play');
        });
    }
  }
];

//  Handle game restart on POST.
exports.restart_post = function (req, res, next) {
  Game.findOneAndUpdate({}, {'$set': { fails: 0, answer: [] }}, { new: true }
    , function (err, game) {
      if (err) { return next(err); }
      if (game==null) {
        var err = new Error('Game instance not found');
        err.status = 200;
        return next(err);
      }
      console.log('updated game instance to be ', game);
      res.redirect('/play');
    });
};