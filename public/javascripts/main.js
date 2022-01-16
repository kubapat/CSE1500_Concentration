/**
 * Game state object
 * @param {*} socket
 */
function GameState(socket) {
  this.playerType   = null;
  this.playerAScore = 21;
  this.playerBScore = 37;
  this.turn         = false;
  this.startTime    = null;
  this.socket = socket;
}

//Getters
GameState.prototype.getPlayerType = function () {
  return this.playerType;
};

GameState.prototype.getAScore = function() {
        return this.playerAScore;
};

GameState.prototype.getBScore = function() {
        return this.playerBScore;
};

GameState.prototype.getTurn = function() {
	return this.turn;
};

GameState.prototype.getStartTime = function() {
	if(this.startTime == -1) return "Game hasn't started yet";
	else return this.startTime;
};

//Setters
GameState.prototype.setAScore = function(score) {
	this.playerAScore = score;
};

GameState.prototype.setBScore = function(score) {
        this.playerBScore = score;
};

GameState.prototype.setPlayerType = function (p) {
  	this.playerType = p;
};

GameState.prototype.setTurn = function(turn) {
	this.turn = turn;
};

GameState.prototype.setStartTime = function (time) {
	this.startTime = time;
};

GameState.prototype.turnFriendlyMessage = function() {
	if((!this.getTurn() && this.getPlayerType() == "A") || (this.getTurn() && this.getPlayerType() == "B")) return '<span style="color:green;">Your turn</span>';
	else return '<span style="color:red;">Wait for oponnents move</span>';
};

GameState.prototype.updateGame = function() {
	document.getElementById("player1score").innerHTML = this.getAScore();
	document.getElementById("player2score").innerHTML = this.getBScore();
	document.getElementById("gametime").innerHTML = this.getStartTime();
	document.getElementById("currentTurn").innerHTML = this.turnFriendlyMessage();
};




//set everything up, including the WebSocket
(function setup() {
  const socket = new WebSocket("ws://192.168.0.107:3000");
  const gs = new GameState(socket);

  socket.onmessage = function (event) {
    let incomingMsg = JSON.parse(event.data);

    //set player type
    if(incomingMsg.type == Messages.T_PLAYER_TYPE) {
		gs.setPlayerType(incomingMsg.data); //should be "A" or "B"
    } else if(incomingMsg.type == Messages.T_A_SCORE) {
    		gs.setAScore(incomingMsg.data);
    } else if(incomingMsg.type == Messages.T_B_SCORE) {
      		gs.setBScore(incomingMsg.data);
    } else if(incomingMsg.type == Messages.T_START_TIME) {
		gs.setStartTime(incomingMsg.data);
    } else if(incomingMsg.type == Messages.T_TURN) {
		gs.setTurn(turn);
    }

    gs.updateGame();

  };

  socket.onopen = function () {
    socket.send("{}");
  };

  //server sends a close event only if the game was aborted from some side
  socket.onclose = function () {
  };

  socket.onerror = function () {};
})(); //execute immediately
