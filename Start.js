// This is our main-file called game
import Game from './js/game.js';
import Board from './js/board.js';
import Network from './js/network.js';

//
//!!!! Kalla new Board().start(); där ni vill ha brädet! 
//
import Player from "./js/player.js";
import Bag from './js/bag.js';

let that;


export default class Start {

  // Start button
  constructor() {
    $('.start-screen').fadeOut(1700);
    $('.game-screen').fadeIn(1350);
    // new Network();
    let player = new Player();
    // start choosePlayer method from the Player class
    player.choosePlayers();
    // new Network();
    this.clickFunction();
  }

  async clickFunction() {
    let bag = new Bag();
    // create all tiles in bag.js and returns and stores them in this.tiles,
    // and therefore stored in global variable "that".
    this.tiles = await bag.tilesFromFile();

    let length = $('.newPlayerInput').length;

    that = this;

    $('.game-menu').append(
      `<input type="names" id="player1Name" class="newPlayerInput" placeholder="Namn" />`
    );

    $('.start-new-game').on('click', async function () {
      if (length < 1) {
        console.log('Type in a name first');
        return;
      }
      let network = new Network();
      let networkKey = await network.getLocalKey();
      $('.playersName').append(`
      <div type="key-input" class="key-input"><span class="key">${networkKey}</span></div>`);
    })

    $('.connect-to-game').on('click', function () {
      let network = new Network();
      // let networkKey = await network.getLocalKey();
      $('.playersName').append(`
      <input type="key-input" class="key-input"><span class="key" placeholder="Skriv nyckel här"></span></input>`);

    });





    // console.log("this.tiles:  " + this.tiles);
  }
}

$('.start-game').on('click', function () {
  // console.log('clicking the button');
  // console.log($('.playersName > input').length);
  let length = $('.playersName > input').length
  for (let i = 1; i <= length; i++) {
    // console.log('im in the loop');
    let playerName = document.getElementById(`player${i}Name`).value;
    if (playerName === '') {
      playerName = `Spelare ${i}`;
    }
    // console.log(`${playerName}`);
    let newPlayer = new Player();
    //that is all the tiles from the bag. Which has been created in clickFunctions
    let tilesFromBag = that.tiles.splice(0, 7);
    newPlayer.setPlayerNames(playerName, tilesFromBag);
  }

  $('.game-screen').fadeOut(1700);
  $('.game-menu').fadeOut(1700);
  $('.scrabble').fadeOut(1700);
  setTimeout(() => {
    new Board().start(that.tiles);
  }, 1700);
  $('.scrabble').fadeOut(2000);
  // $('.scrabble').animate({ top: '12px' }, 'slow');
  //$('.scrabble').animate({ fontSize: '40px' }, 'slow');
  // console.log("new Game().playerTurn - called")
  //new Game(that.tiles);
  // new Game().countScore();
  // new Game().playerTurn();
});


// rules open-close 
$(document).ready(function () {

  $('.rules').click(function () {
    $('.game-screen').hide();
    $('.add-rules').animate({
      height: 'toggle'
    });
  });
  $('.close').click(function () {
    $('.add-rules').hide();
    $('.game-screen').fadeIn(850);
  });

});







