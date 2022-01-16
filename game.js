const websocket = require("ws");

const game = function(gameID) {
	this.playerA = null;
	this.playerB = null;
	this.id = gameID;
	this.grid = [
  			0, 0, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0
  		    ];
	this.revealed = [
			0, 0, 0, 0,
                        0, 0, 0, 0,
                        0, 0, 0, 0,
                        0, 0, 0, 0
			];
	this.gameState= "0 JOINT";
	this.playerAScore = 0;
	this.playerBScore = 0;
	this.turn = true; //0 - A | 1 - B
	this.startTime = -1;
	this.currentMove = [];
};

game.prototype.transitionStates = {
	"0 JOINT": 0,
  	"1 JOINT": 1,
  	"2 JOINT": 2,
  	"CARD GUESSED": 3,
  	"A": 4, //A won
  	"B": 5, //B won
  	"ABORTED": 6
};

game.prototype.transitionMatrix = [
	[0, 1, 0, 0, 0, 0, 0], //0 JOINT
  	[1, 0, 1, 0, 0, 0, 0], //1 JOINT
  	[0, 0, 0, 1, 0, 0, 1], //2 JOINT (note: once we have two players, there is no way back!)
  	[0, 0, 0, 1, 1, 1, 1], //CARD GUESSED
  	[0, 0, 0, 0, 0, 0, 0], //A WON
  	[0, 0, 0, 0, 0, 0, 0], //B WON
  	[0, 0, 0, 0, 0, 0, 0]  //ABORTED
];

//Getters
game.prototype.getAScore= function()
{
  	return this.playerAScore;
};

game.prototype.getGrid = function() {
	return this.grid;
};

game.prototype.getRevealed = function() {
        return this.revealed;
};

game.prototype.getBScore = function() {
	return this.playerBScore;
};

game.prototype.getTurn = function() {
	return this.turn;
};

game.prototype.getStartTime = function() {
	return this.startTime;
};

game.prototype.getCurrentMove = function() {
	return this.currentMove;
};

game.prototype.getA = function() {
	return this.playerA;
};

game.prototype.getB = function() {
        return this.playerB;
};

game.prototype.isCompleted = function() {
	for(let i=0; i<16; i++) {
		if(!this.revealed[i]) return false;
	}

	return true;
};



//Modifiers
game.prototype.incrementA = function()
{
  this.playerAScore++;
};

game.prototype.incrementB = function()
{
  this.playerBScore++;
};

game.prototype.updateStartTime = function() {
	this.startTime = Date.now();
};

game.prototype.changeTurn = function() {
	this.turn = !this.turn;
};

game.prototype.addMove = function(move) {
	this.currentMove.push(move);
};

game.prototype.clearMove = function() {
	this.currentMove = [];
};

game.prototype.revealAt = function(index) {
	this.revealed[parseInt(index)] = 1;
};

game.prototype.hideAt = function(index) {
        this.revealed[parseInt(index)] = 0;
};


game.prototype.initializeGrid = function(){
	let helper = new Array(8);

	for(let i=0; i<8; i++) helper[i]=2;


	for(let i=0; i<16; i++) {
      		var number = Math.floor(Math.random()*8);

      		while(helper[number]==0) {
        		number = Math.floor(Math.random()*8);
		}

      		this.grid[i] = number;
      		helper[number]--;
	}
};



game.prototype.isValidTransition = function(from, to) {
  let i, j;
  if (!(from in game.prototype.transitionStates)) return false;
  else i = game.prototype.transitionStates[from];

  if (!(to in game.prototype.transitionStates)) return false;
  else j = game.prototype.transitionStates[to];

  return game.prototype.transitionMatrix[i][j] > 0;
};

game.prototype.isValidState = function(s) {
  return s in game.prototype.transitionStates;
};


/**
 * Updates the game status to `w` if the state is valid and the transition to `w` is valid.
 * @param {string} w new game status
 */
 game.prototype.setStatus = function(w) {
  if (game.prototype.isValidState(w) && game.prototype.isValidTransition(this.gameState, w)) {
    this.gameState = w;
    console.log("[STATUS] %s", this.gameState);
  } else return new Error(`Impossible status change from ${this.gameState} to ${w}`);

};

/**
 * Checks whether the game is full.
 * @returns {boolean} returns true if the game is full (2 players), false otherwise
 */
game.prototype.hasTwoConnectedPlayers = function() {
  return this.gameState == "2 JOINT";
};

/**
 * Adds a player to the game. Returns an error if a player cannot be added to the current game.
 * @param {websocket} p WebSocket object of the player
 * @returns {(string|Error)} returns "A" or "B" depending on the player added; returns an error if that isn't possible
 */
game.prototype.addPlayer = function(p) {
  if (this.gameState != "0 JOINT" && this.gameState != "1 JOINT") return new Error(`Invalid call to addPlayer, current state is ${this.gameState}`);

  const error = this.setStatus("1 JOINT");
  if (error instanceof Error) {
    this.setStatus("2 JOINT");
  }

  if (this.playerA == null) {
    this.playerA = p;
    return "A";
  } else {
    this.playerB = p;
    return "B";
  }
};

module.exports = game;
