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

	let currentGame  = new Game(stats.gamesInitialized++);
	currentGame.initializeGrid();

	let connectionID = 2137;


	wss.on("connection", function connection(ws) {
		//Websocket init
		const con = ws;
		con["id"] = connectionID++;
		const playerType = currentGame.addPlayer(con);
  		websockets[con["id"]] = currentGame;

		console.log(`Player ${con["id"]} placed in game ${currentGame.id} as ${playerType}`);
		con.send(playerType == "A" ? messages.S_PLAYER_A : messages.S_PLAYER_B);

		if(currentGame.hasTwoConnectedPlayers()) { //If at current game are currently two players, create new game for that one
    			currentGame = new Game(stats.gamesInitialized++);
			currentGame.initializeGrid();
  		}

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

		con.on("message", function incoming(message) {
			const oMsg = JSON.parse(message.toString());

			const gameObj = websockets[con["id"]];
			const isPlayerA = gameObj.playerA == con ? true : false;

			if(!isPlayerA) {
				if (oMsg.type == messages.T_GAME_WON_BY) {
			 	       gameObj.setStatus(oMsg.data);
				       gameStatus.gamesCompleted++;
      				}
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

