var express = require('express');
var router = express.Router();

const stats = require("../stats.js");
/* GET home page.
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get("/", function(req, res, next) {
	res.sendFile("splash.html", { root: "./public" });
});
*/

router.get("/", function(req, res) {
	res.render("splash.ejs", {
		gamesInitialized: stats.gamesInitialized,
		gamesCompleted: stats.gamesCompleted,
		fastestGame: (stats.fastestGame == -1 ? stats.fastestGame : Math.floor(stats.fastestGame/1000))
	});
});

router.get("/play", function(req, res) {
  res.sendFile("game.html", { root: "./public" });
});


module.exports = router;
