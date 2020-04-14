var express = require('express');
var router = express.Router();

var game_controller = require('../controllers/gameController');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Guessing Game' });
});

router.get('/play', game_controller.play_get);
router.post('/play', game_controller.play_post);
router.get('/create', game_controller.create_get);
router.post('/create', game_controller.create_post);
router.post('/restart', game_controller.restart_post);

module.exports = router;
