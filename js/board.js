import Game from './game.js';





export default class Board {

  // Doesn't really need board anymore, easier to have all in board 

  async start(tilesFromBag) {

    new Game(tilesFromBag);

    // console.log(this.board);

  }
}
