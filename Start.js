// This is our main-file called game

import Player from './js/player.js';


export default class Start {

  // Start button
  constructor() {
    this.addStartBtnEvent();
  }

  clickFunction() {
    $('.start-screen').fadeOut(1700);
    $('.game-screen').fadeIn(1350);

  }
  addStartBtnEvent() {
    let player = new Player();
    player.choosePlayers();
    let that = this;
    $('.startBtn').on('click', function () {
      player.setPlayerNames();
      that.clickFunction();
    });
  }
}


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



