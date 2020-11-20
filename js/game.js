import Player, { players } from './player.js';
import Score from './js/score.js';

export default class Game {

  constructor(tilesFromBag) {
    this.tilesFromBag = tilesFromBag;
    this.playerIndex = 0;
    this.start();
  }

  /* The game that will run, taking turns between players*/

  start() {
    this.playerTurn();
    // lock in word with button 'lägg brickor'
    // look up word in SAOL and count score in
    // countScores();
    // start();

    // if button 'stå över'
    // start();

  }

  async playerTurn() {

    // for (let playerIndex = 0; playerIndex < players.length; playerIndex++) {
    //   let currentPlayer = players[playerIndex];
    //   console.log("- - - >" + currentPlayer.name + "'s Turn < - - -")
    //   // add function calls
    //   // ex: countScore(currentPLayer)
    // }

    /* Alternative to switch between players turns */

    this.player = players[this.playerIndex].name;
    this.tiles = [];

    this.tiles.push(players[this.playerIndex].tiles[0]);

    // If the players has played tiles and they have less than 7, push new tiles to their playing board

    if (this.tiles[0].length < 7) {
      let numberOfTiles = 0;
      for (let i = 0; i < 7; i++) {
        if (!this.tiles[0][i]) {
          numberOfTiles++;
        }
      }
      this.tiles.push(this.tilesFromBag.splice(0, numberOfTiles));
    }

    /* Disable all other players tile fields */

    players.forEach(player => {
      let indexOfPlayer = players.indexOf(player);
      if (this.player === player.name) {
        $(`#box${indexOfPlayer}`).show();
      } else {
        $(`#box${indexOfPlayer}`).hide();
      }
    });

    /* Change playerIndex so next player will be this.player next round */

    console.log(this.player);
    this.playerIndex++;
    if (this.playerIndex >= players.length - 1) {
      this.playerIndex = 0;
    }
    console.log(this.playerIndex);
  }
}