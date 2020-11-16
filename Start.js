// This is our main-file called game

import Player from "./js/player.js";

export default class Start {



  // Start button
  constructor() {
    this.addStartBtnEvent();
  }

  clickFunction() {
    $('.start-screen').fadeOut(1700);
    $('.game-screen').fadeIn(1350);
    let player = new Player();
    player.choosePlayers();
    // $('.start-game').on('click', function () {
    //   player.setPlayerNames();
    // });


  }
  addStartBtnEvent() {
    $('.startBtn').click(this.clickFunction);
  }
}

$('.start-game').on('click', function () {
  console.log('clicking the button');
  for (let i = 1; i < 5; i++) {
    console.log('im in the loop');
    let playerName = document.getElementById(`player${i}Name`).value;
    console.log(playerName);
    let newPlayer = new Player();
    newPlayer.setPlayerNames(playerName);

  }
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


// $(".new-start-Btn").click(function{
//   for (let i = 1; i < 5; i++) {
//     new playerName = getElementById(`player${i}Name`).value;
//     Player.setPlayerNames(playerName);
//   }
// });







