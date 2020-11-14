// This is our main-file called game

import Player from './js/player.js';


export default class Start {

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

