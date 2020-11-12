// This is our main-file called game

// import Player from "./Player.js"

export default class Start {

  constructor() {
    this.addStartBtnEvent();
  }

  clickFunction() {
    $('.start-screen').fadeOut(2000);
    $('.game-screen').fadeIn(2000);

  }

  addStartBtnEvent() {
    $('.startBtn').click(this.clickFunction);
  }

}


