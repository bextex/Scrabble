// This is our main-file called game

// import Player from "./Player.js"

export default class Start {

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

<<<<<<< HEAD


=======
>>>>>>> 935e27657dcb45821098995c78dce698bafcbbb4
