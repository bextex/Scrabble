import Game from './game.js';

export default class Board {

  async start(tilesFromBag) {
    new Game(tilesFromBag);
  }
}
