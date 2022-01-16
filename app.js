//Libs
const express     = require("express");
const http        = require("http");
const websocket   = require("ws");

const indexRouter = require("./routes/index");
const stats       = require("./stats");
const Game        = require("./game");
const messages    = require("./public/javascripts/messages");

//Express init
const port = process.argv[2];
const app = express();


	//Routes setup
	app.use(express.static(__dirname + "/public"));
	app.get("/", indexRouter);
	app.get("/play", indexRouter);


	const server = http.createServer(app);
	const wss = new websocket.Server({ server });

	const websockets = {};

	setInterval(function() {
  		for(let i in websockets) {
    			if(Object.prototype.hasOwnProperty.call(websockets,i)) {
      				let gameObj = websockets[i];
      				if (gameObj.finalStatus != null) {
        				delete websockets[i];
      				}
    			}
  		}
	}, 50000);

	//Initialize game and connection
	let currentGame  = new Game(stats.gamesInitialized++);
	currentGame.initializeGrid();
	let connectionID = 2137;


	wss.on("connection", function connection(ws) {
		//Websocket init
		const con = ws;
		con["id"] = connectionID++;

		if(currentGame.hasTwoConnectedPlayers()) { //If at current game are currently two players, create new game for that one
                        currentGame = new Game(stats.gamesInitialized++);
                        currentGame.initializeGrid();
                }

		//Assign player to game
		const playerType = currentGame.addPlayer(con);
  		websockets[con["id"]] = currentGame;

		console.log(`Player ${con["id"]} placed in game ${currentGame.id} as ${playerType}`);
		con.send(playerType == "A" ? messages.S_PLAYER_A : messages.S_PLAYER_B);

		//Init turn
		let msg  = messages.O_TURN;
		msg.data = currentGame.getTurn();
		con.send(JSON.stringify(msg));

		//Init score
		let msg1  = messages.O_A_SCORE;
		msg1.data = currentGame.getAScore();
		con.send(JSON.stringify(msg1));

		let msg2  = messages.O_B_SCORE;
                msg2.data = currentGame.getBScore();
                con.send(JSON.stringify(msg2));

		//Init time
		let msg3  = messages.O_START_TIME;
		msg3.data = currentGame.getStartTime();
		con.send(JSON.stringify(msg3));

		//Init grid
		let msg4  = messages.O_GRID;
		msg4.data = currentGame.getGrid();
		con.send(JSON.stringify(msg4));

		//Init revealed
		let msg5  = messages.O_REVEALED;
		msg5.data = currentGame.getRevealed();
		con.send(JSON.stringify(msg5));

		//Every 30s clean not executed moves
		/*
		setInterval(function() {
			var toRemove = currentGame.getCurrentMove();
			for(let i=0; i<toRemove.length; i++) {
				currentGame.hideAt(toRemove[i]);
			}
			currentGame.clearMove();
		},30000); */

		//If message received from client
		con.on("message", function incoming(message) {
			const oMsg = JSON.parse(message.toString());

			const gameObj = websockets[con["id"]];
			const isPlayerA = gameObj.playerA == con ? true : false;

			//If it's move
			if(oMsg.type == messages.T_CLICKED) {
				var moves = gameObj.getCurrentMove();
				if(moves.length == 1) { //If 2nd picked up
					let selected = parseInt(oMsg.data);
					gameObj.revealAt(selected-1);
                                        gameObj.addMove(selected-1);
					var gridVals = gameObj.getGrid();

					var correct = false;
					if(gridVals[moves[0]] == gridVals[selected-1]) { //if correct
						if(isPlayerA) gameObj.incrementA();
						else gameObj.incrementB();

						correct = true;
					} else {					//Not correct


						let msgShort  = messages.O_REVEALED;
        	                                msgShort.data = currentGame.getRevealed();
	                                        gameObj.getA().send(JSON.stringify(msgShort));
                	                        gameObj.getB().send(JSON.stringify(msgShort));

						console.log("MISSED");
						gameObj.hideAt(moves[0]);
						gameObj.hideAt(selected-1);
					}

					setTimeout(function() {

					gameObj.clearMove();

					//Update revealed
					let msg7  = messages.O_REVEALED;
                                        msg7.data = currentGame.getRevealed();
                                        gameObj.getA().send(JSON.stringify(msg7));
					gameObj.getB().send(JSON.stringify(msg7));


					//Update turn only if incorrect move
					if(!correct) {
						gameObj.changeTurn();
			                	let msgTurn  = messages.O_TURN;
                				msgTurn.data = currentGame.getTurn();
                				gameObj.getA().send(JSON.stringify(msgTurn));
						gameObj.getB().send(JSON.stringify(msgTurn));
					} else if(gameObj.isCompleted()) stats.gamesCompleted++;

			                //Update score
			                let msgA  = messages.O_A_SCORE;
                			msgA.data = currentGame.getAScore();
                			gameObj.getA().send(JSON.stringify(msgA));
					gameObj.getB().send(JSON.stringify(msgA));

			                let msgB  = messages.O_B_SCORE;
                			msgB.data = currentGame.getBScore();
					gameObj.getA().send(JSON.stringify(msgB));
					gameObj.getB().send(JSON.stringify(msgB));
					}, 2000);

				} else if(moves.length == 0) {
					let selected = parseInt(oMsg.data);
					gameObj.revealAt(selected-1);
					console.log(selected-1);
					gameObj.addMove(selected-1);

					let msg6  = messages.O_REVEALED;
                			msg6.data = currentGame.getRevealed();
                			gameObj.getA().send(JSON.stringify(msg6));
					gameObj.getB().send(JSON.stringify(msg6));
					//console.log("Send new reveal");
				}

				//Start Timer
				if(gameObj.getStartTime() == -1) {
					gameObj.updateStartTime();
					let msgTime  = messages.O_START_TIME;
                			msgTime.data = currentGame.getStartTime();
                			gameObj.getA().send(JSON.stringify(msgTime));
					gameObj.getB().send(JSON.stringify(msgTime));
				}

			} else if(oMsg.type == messages.T_GAMETIME) { //If game is finished and game time was sent
				var time = parseInt(oMsg.data);
				if(stats.fastestGame == -1 || stats.fastestGame > time) stats.fastestGame = time;
			}
		});


		con.on("close", function(code) {
			console.log(`${con["id"]} disconnected ...`);

    			if(code == 1001) {
				const gameObj = websockets[con["id"]];
				if(gameObj.isValidTransition(gameObj.gameState, "ABORTED")) {
					gameObj.setStatus("ABORTED");

					try {
          					gameObj.playerA.close();
          					gameObj.playerA = null;
        				} catch (e) {
          					console.log("Player A closing: " + e);
        				}

					try {
          					gameObj.playerB.close();
          					gameObj.playerB = null;
        				} catch (e) {
          					console.log("Player B closing: " + e);
        				}
				}
			}
		});
	});


server.listen(port);


