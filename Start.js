// This is our main-file called game
import Game from './js/game.js';
import Board from './js/board.js';
import Network from './js/network.js';

//
//!!!! Kalla new Board().start(); där ni vill ha brädet! 
//
import Player from "./js/player.js";
import Bag from './js/bag.js';

export const players = [];

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

    let game = new Game(this.tiles);

    let network = new Network();

    that = this;

    $('.game-menu').append(
      `<input type="names" id="player1Name" class="newPlayerInput" placeholder="Namn" />`
    );

    $('.get-key').on('click', async function () {
      // If there isn't a name, ask the player to first type in a name
      let name = $('.newPlayerInput').val();
      if (!name) {
        // Should be a warning label from div instead
        alert('Type in a name first');
        return;
      }
      // Fade out the 'start-side' and replace it with waiting for other players
      $('.game-menu').fadeOut(1700);


      let networkKey = await network.getLocalKey();
      console.log('network key is ' + networkKey);
      $('.playersName').append(`<div class="waiting-for-players"><div class="waiting-box">Väntar på spelare...</div>
      <button class="start-new-game">Starta</button>
      <div type="key-input" class="key-input"><span class="key">${networkKey}</span></div>
      </div>`);

      // that is all the tiles from the bag. Which has been created in clickFunctions
      let tilesFromBag = that.tiles.splice(0, 7);
      console.log(name);
      console.log(tilesFromBag);
      console.log(game);
      // newPlayer.setPlayerNames(name, tilesFromBag, game);
      players.push(new Player(name, tilesFromBag));
      console.log(players);
      network.connectToStore(networkKey, name, game);


    })


    $('.set-key').on('click', function () {
      // If there isn't a name, ask the player to first type in a name
      let name = $('.newPlayerInput').val();
      console.log('my name is' + name);
      if (!name) {
        // Should be a warning label from div instead
        alert('Type in a name first');
        return;
      }

      // Fade out the 'start-side' and replace it with waiting for other players
      $('.game-menu').fadeOut(1700);

      // let networkKey = await network.getLocalKey();
      $('.playersName').append(`<div>
      <button class="join">Gå med</button>
      <input type="key-input" class="key-input"><span class="key" placeholder="Skriv nyckel här"></span></input>
      </div>`);

      $('.join').on('click', function () {
        console.log('im clicking the join button');
        //that is all the tiles from the bag. Which has been created in clickFunctions
        let tilesFromBag = that.tiles.splice(0, 7);
        console.log(name);
        console.log(tilesFromBag);
        // newPlayer.setPlayerNames(name, tilesFromBag, game);
        let insertedNetworkKey = $('.key-input').val();
        if (!insertedNetworkKey) {
          alert('type in a insert key');
        } else {
          console.log(insertedNetworkKey);
          players.push(new Player(name, tilesFromBag));
          console.log(players);
          network.connectToStore(insertedNetworkKey, name, game);
        }
        $('.playersName').fadeOut(200);
        $('.game-screen').fadeOut(200);
        $('.game-menu').fadeOut(200);
        $('.scrabble').fadeOut(200);
      });
    });







    // console.log("this.tiles:  " + this.tiles);
  }
}

$('.start-gameXXX').on('click', function () {
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









