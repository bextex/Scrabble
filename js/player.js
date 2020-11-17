const players = []; // Array of players and their tiles

export default class Player {

  constructor(name) {
    this.name = name;
    this.tiles = [];
    // Change to this when we have tiles function
    // this.tiles = [...this.game.getTiles(), ' '];
  }


  /*choosePlayers() {
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
  }*/
  choosePlayers() {
    let countClicks = 4;
    $('.players').on('click', function () {
      if (countClicks === 4) {
        $('.playersName').append(`
        <input type="names" 
        id="player1Name" 
        class="newPlayerInput" 
        placeholder="Spelare 1" />

        <style>
        .newPlayerInput {
        background-color:black;
        position: relative;
        top:80vh;
        margin-right: auto;
        margin-left: auto;
        font-family: 'Neucha', cursive;
        font-size: 25px;
        opacity: 0.8;
        border: 5px solid aliceblue;
        border-radius: 5px;
        color: white;
        }

        .newPlayerInput:hover {
           background-color: azure;
        }
        </style>`);



      } else if (countClicks === 3) {
        $('.playersName').append(`<input type="names" id="player2Name" class="newPlayerInput" placeholder="Spelare 2" />
        `);

      } else if (countClicks === 2) {
        $('.playersName').append(`<input type="names" id="player3Name" class="newPlayerInput" placeholder="Spelare 3" />
        `);
      }

      else if (countClicks === 1) {
        $('.playersName').append(`<input type="names" id="player4Name" class="newPlayerInput" placeholder="Spelare 4" />`);
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

