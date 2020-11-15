// This is our main-file called game

// import Player from "./Player.js"

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
    $('.startBtn').click(this.clickFunction);
  }
}


// rules open-close 
$(document).ready(function () {

  $(".gamecontainer .add-rules").hide();

  $('.rules').click(function () {
    $('.add-rules').show();
  });
  $('.close').click(function () {
    $('.add-rules').hide();
  });

});



