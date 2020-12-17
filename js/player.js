//import { tiles } from './bag.js';
import Bag from './bag.js';
//import { tiles } from '../Start.js';

// export const players = []; // Array of players and their tiles

export default class Player {

  constructor(name, tiles, score) {
    this.name = name;
    this.tiles = [tiles, ' '];
    this.score = score;
    // this.game = game;
    console.log(this.name + ' is added as a player');
  }


  // // THIS METHOD CAN BE REMOVED
  // choosePlayers() {
  //   let countClicks = 2;
  //   $('.players').on('click', function () {
  //     if (countClicks === 2) {
  //       $('.playersName').append(`<input type="names" id="player3Name" class="newPlayerInput" placeholder="Spelare 3" /> `)

  //     } else if (countClicks === 1) {
  //       $('.playersName').append(`<input type="names" id="player4Name" class="newPlayerInput" placeholder="Spelare 4" />`)
  //       $('.players').attr('disabled', true);
  //     }
  //     countClicks--;
  //   });
  // }


  // // THIS METHOD CAN BE REMOVED
  // setPlayerNames(inputName, tiles, game) {
  //   // if (countClicks == 1) {
  //   //   console.log(document.getElementById(`player1Name`).value);
  //   //   if (document.getElementById(`player1Name`).value === null) {
  //   //   }
  //   // }
  //   players.push(new Player(inputName, tiles, game));
  //   console.log(players);
  //   console.log(game);


  //   // let index = 1;
  //   //   $(".playersName").children().each(function () {
  //   //     let name;
  //   //     if (document.getElementById(`player${index}Name`).value === null) {
  //   //       name = 'Player ' + index;
  //   //     } else {
  //   //       name = document.getElementById(`player${index}Name`).value;
  //   //     }
  //   //     index++;
  //   //   });
  //   // }
  // }

}