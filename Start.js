// This is our main-file called game

import Player from './js/player.js';


export default class Start {

  constructor() {
    this.addStartBtnEvent();
  }

  clickFunction() {
    $('.start-screen').fadeOut(2000);
    $('.game-screen').fadeIn(2000);

  }

  addStartBtnEvent() {
    let player = new Player();
    player.choosePlayers();
    $('.startBtn').on('click', function () {
      player.setPlayerNames();
    });
    $('.startBtn').click(this.clickFunction);
  }

}


