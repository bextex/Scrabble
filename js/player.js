export default class Player {

  players = []; // Array of players and their tiles

  constructor() {
    
  }

  choosePlayers() {
    let countClicks = 2;
    console.log('im in choose player');

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
    console.log('im in set players name from start');
    let index = 1;
    $(".playersName").children().each(function () {
      let name;
      if (document.getElementById(`player${index}Name`).value === null) {
        name = 'Player ' + index;
      } else {
        name = document.getElementById(`player${index}Name`).value;
      } 
      index++;
      console.log(name);
    });
  }
}



    //let numOfPlayers = document.getElementById("numOfPlayers").value; // Gets num 2, 3 and 4 from select in HTML
    /*let numOfPlayers;
    document.getElementById('numOfPlayers').addEventListener('change', function () {
      numOfPlayers = this.value;
    });
    /*
  select.onchange = function () {
    numOfPlayers = document.getElementById("numOfPlayers").value;
  };*/
    //let numOfPlayers = $('select#numOfPlayers option:checked').val();
    //document.getElementById("demo").innerHTML = "You selected: " + numOfPlayers;
    /*
        const selectElement = document.querySelector('.numOfPlayers');
        let result;
    
        await selectElement.addEventListener('change', (event) => {
          result = document.querySelector('.result');
          //result.text() = `The number of players are ${event.target.value}`;
        });

    let num = document.getElementById("numOfPlayers");
    let strUser = num.options[num.selectedIndex].text;

    let numOfPlayers = $("#numOfPlayers :selected").val();
    const selectElement = document.querySelector('.numOfPlayers');
    let result;

    selectElement.addEventListener('change', (event) => {
      result = document.querySelector('.result');
      result.text() = `The number of players are ${event.target.value}`;
    });
    console.log(`The number of players are ${numOfPlayers}`);
    //this.setPlayerNames(numOfPlayers);
  }

  setPlayerNames(numOfPlayers) {
    console.log('im in set player names');
    $('#playerContent').html(""); // Empty the div so correct number of text fields appear
    for (let i = 1; i <= numOfPlayers; i++) {
      $('#playerContent').append(`<input type="names" id="newPlayerInput" />`); // Add text fields depending on how many players
      console.log('skapade input');
    }
  }*/