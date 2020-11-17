export const players = []; // Array of players and their tiles

export default class Player {

  constructor(name) {
    this.name = name;
    this.tiles = [];
    // Change to this when we have tiles function
    // this.tiles = [...this.game.getTiles(), ' '];
  }


  choosePlayers() {
    let countClicks = 2;
    $('.players').on('click', function () {
      if (countClicks === 2) {
        $('.playersName').append(`<input type="names" id="player3Name" class="newPlayerInput" placeholder="Spelare 3" /> `)

      } else if (countClicks === 1) {
        $('.playersName').append(`<input type="names" id="player4Name" class="newPlayerInput" placeholder="Spelare 4" />`)
        $('.players').attr('disabled', true);
      }
      countClicks--;
    });
  }


  setPlayerNames(inputName) {
    // if (countClicks == 1) {
    //   console.log(document.getElementById(`player1Name`).value);
    //   if (document.getElementById(`player1Name`).value === null) {
    //   }
    // }

    players.push(new Player(inputName));
    console.log(players);


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