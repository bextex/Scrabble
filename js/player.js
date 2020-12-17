export default class Player {

  constructor(name, tiles, score) {
    this.name = name;
    this.tiles = [tiles, ' '];
    this.score = score;
    console.log(this.name + ' is added as a player');
  }
}