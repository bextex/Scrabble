export default class Player {

  players = []; // Array of players and their tiles

  constructor(name) {
    this.name = name;
  }

  choosePlayers() {
    let countClicks = 2;
    $('#add-player').on('click', function () {
      if (countClicks === 2) {
        $('.playersName').append(`<input type="names" id="player3Name" class="newPlayerInput" placeholder="Spelare 3" />`)
      } else if (countClicks === 1) {
        $('.playersName').append(`<input type="names" id="player4Name" class="newPlayerInput" placeholder="Spelare 4" />`)
        $('#add-player').attr('disabled', true);
      }
      countClicks--;
    });
  }


  setPlayerNames() {
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
    return new Player(name);
  }


}
loopPlayersArr();
function loopPlayersArr() {
  let player = new Player('berit')
  // loop through array players[]
  console.log('name from for..of-loop', player.setPlayerNames(name));

}




