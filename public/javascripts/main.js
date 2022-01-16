/**
 * Game state object
 * @param {*} socket
 */
function GameState(socket) {
  this.playerType   = null;
  this.playerAScore = 21;
  this.playerBScore = 37;
  this.turn         = false;
  this.grid	    = null;
  this.revealed     = null;
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

GameState.prototype.getRevealed = function() {
        return this.revealed;
};

GameState.prototype.getGrid = function() {
        return this.grid;
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

GameState.prototype.setGrid = function(grid) {
	this.grid = grid;
};

GameState.prototype.setRevealed = function(revealed) {
        this.revealed = revealed;
};


//Utility
GameState.prototype.turnFriendlyMessage = function() {
	if((!this.getTurn() && this.getPlayerType() == "A") || (this.getTurn() && this.getPlayerType() == "B")) return '<span style="color:green;">Your turn</span>';
	else return '<span style="color:red;">Wait for oponnents move</span>';
};

GameState.prototype.updateGame = function() {
	document.getElementById("player1score").innerHTML = this.getAScore();
	document.getElementById("player2score").innerHTML = this.getBScore();
	document.getElementById("gametime").innerHTML = this.getStartTime();
	document.getElementById("currentTurn").innerHTML = this.turnFriendlyMessage();

	var toReveal = this.getRevealed();
	var toGrid   = this.getGrid();
	if(toReveal != null && toGrid != null) {
		for(let i=0; i<16; i++) {
			if(toReveal[i] == 1) {
				document.getElementById("grid"+i).style.backgroundImage = "url('images/"+toGrid[i]+".jpg')";
			}
		}
	}
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
		gs.setTurn(incomingMsg.data);
    } else if(incomingMsg.type == Messages.T_GRID) {
		data = incomingMsg.data + '';
		gs.setGrid(data.split(","));
		console.log("GRID:"+gs.getGrid());
    } else if(incomingMsg.type == Messages.T_REVEALED) {
		data = incomingMsg.data + '';
		gs.setRevealed(data.split(","));
		console.log("REVEALED:"+gs.getRevealed());
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
