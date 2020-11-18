// This is our main-file called game
import Game from './js/game.js';
new Game().countScore();
import Board from './js/board.js';

//
//!!!! Kalla new Board().start(); där ni vill ha brädet! 
//
import Player from "./js/player.js";
import Bag from './js/bag.js';


export default class Start {

  tiles = [];

  // Start button
  constructor() {
    $('.start-screen').fadeOut(1700);
    $('.game-screen').fadeIn(1350);
    let player = new Player();
    player.choosePlayers();
    //this.addStartBtnEvent();
  }

  async clickFunction() {
    this.tiles = await Bag.tilesFromFile();
    $('.game-screen').fadeIn(1350);
    let player = new Player();
    player.choosePlayers();
  }
}

$('.start-game').on('click', function () {
  console.log('clicking the button');
  console.log($('.playersName > input').length);
  let length = $('.playersName > input').length
  //console.log(document.getElementsByClassName('playersName').childElementCount);
  for (let i = 1; i <= length; i++) {
    console.log('im in the loop');
    let playerName = document.getElementById(`player${i}Name`).value;
    if (playerName === '') {
      playerName = `Spelare ${i}`;
    }
    console.log(`${playerName}`);
    let newPlayer = new Player();
    newPlayer.setPlayerNames(playerName);
  }
  $('.game-screen').fadeOut(1700);
  $('.game-menu').fadeOut(1700);
  setTimeout(() => {
    new Board().start();
  }, 2000);
});




// rules open-close 
$(document).ready(function () {

  $(".rules-window .add-rules").hide();

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







