export default class Player {

  players = [

  ]; // Array of players and their tiles

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


  setPlayerNames(name) {
    let index = 1;
    $(".playersName").children().each(function () {
      let name;
      if (document.getElementById(`player${index}Name`).value === null) {
        name = 'Player ' + index;
      } else {
        name = document.getElementById(`player${index}Name`).value;
      }
      index++;

    });
    // players.push(new Player(inputName));

  }
}