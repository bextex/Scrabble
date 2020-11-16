// This is our main-file called game

import Player from "./js/player.js";

export default class Start {



  // Start button
  constructor() {
    $('.start-screen').fadeOut(1700);
    $('.game-screen').fadeIn(1350);
    let player = new Player();
    player.choosePlayers();
    //this.addStartBtnEvent();
  }

  clickFunction() {
    $('.game-screen').fadeIn(1350);
    let player = new Player();
    player.choosePlayers();
    // $('.start-game').on('click', function () {
    //   player.setPlayerNames();
    // });
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







