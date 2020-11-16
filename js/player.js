export default class Player {

  players = []


  constructor(name) {
    this.name = name;
  }

  choosePlayers() {
    let countClicks = 2;
    $('.players').on('click', function () {
      if (countClicks === 2) {
        $('.playersName').append(`<input type="names" id="player3Name" class="newPlayerInput" placeholder="Spelare 3" />`)
      } else if (countClicks === 1) {
        $('.playersName').append(`<input type="names" id="player4Name" class="newPlayerInput" placeholder="Spelare 4" />`)
        $('.players').attr('disabled', true);
      }
      countClicks--;
    });
  }


  setPlayerNames() {
    if (countClicks == 1) {
      console.log(document.getElementById(`player1Name`).value);
      if (document.getElementById(`player1Name`).value === null) {
      }
    }
    // let index = 1;
    //   $(".playersName").children().each(function () {
    //     let name;
    //     if (document.getElementById(`player${index}Name`).value === null) {
    //       name = 'Player ' + index;
    //     } else {
    //       name = document.getElementById(`player${index}Name`).value;
    //     }
    //     index++;
    //   });
    // }
  }
}