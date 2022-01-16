(function (exports) {
  /*
   * Client to server: game is complete, the winner is ...
   */
  exports.T_GAME_WON_BY = "GAME-WON-BY";
  exports.O_GAME_WON_BY = {
    type: exports.T_GAME_WON_BY,
    data: null,
  };

  /*
   * Server to client: abort game (e.g. if second player exited the game)
   */
  exports.O_GAME_ABORTED = {
    type: "GAME-ABORTED",
  };
  exports.S_GAME_ABORTED = JSON.stringify(exports.O_GAME_ABORTED);

  /*
   * Server to client: set as player A
   */
  exports.T_PLAYER_TYPE = "PLAYER-TYPE";
  exports.O_PLAYER_A = {
    type: exports.T_PLAYER_TYPE,
    data: "A",
  };
  exports.S_PLAYER_A = JSON.stringify(exports.O_PLAYER_A);

  /*
   * Server to client: set as player B
   */
  exports.O_PLAYER_B = {
    type: exports.T_PLAYER_TYPE,
    data: "B",
  };
  exports.S_PLAYER_B = JSON.stringify(exports.O_PLAYER_B);

  /*
   * Server to client: turn of A/B
   */
  exports.T_TURN = "TURN";
  exports.O_TURN = {
    type: exports.T_TURN,
    data: null,
  };
  exports.S_TURN = JSON.stringify(exports.O_TURN);

  /*
   * Server to client: Score of Player A
   */
  exports.T_A_SCORE = "A_SCORE";
  exports.O_A_SCORE = {
	type: exports.T_A_SCORE,
	data: null,
  };
  exports.S_A_SCORE = JSON.stringify(exports.O_A_SCORE);

  /*
   * Server to client: Score of Player B
   */
  exports.T_B_SCORE = "B_SCORE";
  exports.O_B_SCORE = {
        type: exports.T_B_SCORE,
        data: null,
  };
  exports.S_B_SCORE = JSON.stringify(exports.O_B_SCORE);


  /*
   * Server to client: Time of start
   */
   exports.T_START_TIME = "START_TIME";
   exports.O_START_TIME = {
	type: exports.T_START_TIME,
	data: null,
   };
   exports.S_START_TIME = JSON.stringify(exports.O_START_TIME);

  /*
   * Server to client: Game grid
   */
   exports.T_GRID = "GRID";
   exports.O_GRID = {
	type: exports.T_GRID,
	data: null,
   };
   exports.S_GRID = JSON.stringify(exports.O_GRID);

   /*
    * Server to cliend: Revealed fields
    */
    exports.T_REVEALED = "REVEALED";
    exports.O_REVEALED = {
	type: exports.T_REVEALED,
	data: null,
    };
    exports.S_REVEALED = JSON.stringify(exports.O_REVEALED);

   /*
    * Client to Server: clicked item
    */
    exports.T_CLICKED = "CLICKED";
    exports.O_CLICKED = {
	type: exports.T_CLICKED,
	data: null,
    };
    exports.S_CLICKED = JSON.stringify(exports.O_CLICKED);

  /*
   * Server to Player A & B: game over with result won/loss
   */
  exports.T_GAME_OVER = "GAME-OVER";
  exports.O_GAME_OVER = {
    type: exports.T_GAME_OVER,
    data: null,
  };
})(typeof exports === "undefined" ? (this.Messages = {}) : exports);
//if exports is undefined, we are on the client; else the server
