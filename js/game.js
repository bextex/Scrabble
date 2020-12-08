import Player, { players } from './player.js';
import SAOLchecker from './SAOLchecker.js';
import Board from './board.js';
import Score from './score.js';

export default class Game {

  constructor(tilesFromBag) {


    this.createBoard();

    this.render();
    this.showPlayerButtons();

    this.tilesFromBag = tilesFromBag;
    this.playerIndex = 0;
    //this.lettersFromFile();
    this.start();
    this.wordArray = [];
    this.wordArrayCommitted = [];

    // this.changeTiles();
    // Set change button to disabled when starting the game
    $('.change-tiles').prop('disabled', true);
  }

  changeTiles() {
    let that = this;
    $('.change-tiles').prop('disabled', true);
    // When double-clicking on the tiles do this function
    $('.playertiles').not('.none').dblclick(function () {
      // If the player has played a tile then they cannot change any tiles the same round
      if (that.tiles[0].length < 7) {
        alert('You have already placed a tile on the board');
        // Put a div with a message here
        return;
      }
      // If this ( = the current tile) doesn't have class change, add or else remove.
      // So it works to double click to get the marked border and double-click to remove the marked border
      $(this).toggleClass('change');
      // First time someone mark the tile, the button gets enabled
      $('.change-tiles').prop('disabled', false);
      // If no tile has the class 'change', meaning no tile is marked atm
      // Change the buttons value to opposite of what it is now. 
      // If true, set to false. If false, set to true
      if ($('.change').length === 0) {
        $('.change-tiles').prop('disabled', (_, val) => !val);
      }
    });
  }


  /* Starting up the game with start() to set how's the first player */

  async start() {
    //Initialize player score
    this.initPlayerScore();
    this.playerTurn();
    let that = this;


    // When click on 'Stå över'-button, there will be a new player and the board will render
    $('.pass').on('click', () => {
      this.playerTurn();
      this.render();
      // this.changeTiles();
    });

    $('.play-tiles').on('click', async () => {
      console.log(".play-tiles triggered" + "\n".repeat(5))

      // read words on board and push to wordArray[]
      this.checkNewWordsOnBorad();
      this.checkNewWordsInSAOL();
      // this.countPlayerScore(this.playerIndex);
      // this.nextPlayer();
    });
    // To change tiles, locate what tile wants to be changed and change them to new tiles from bag. 
    // Put back the tiles that wants to be changed and scramble the bag

    $('.change-tiles').on('click', () => {
      if (that.tilesFromBag.length < 7) {
        console.log('there are 7 or less tiles in bag');
        alert('there are 7 or less tiles in bag');
        // Put a div and message here instead
      }
      // How many tiles the player wants to remove
      let numberOfTiles = 0;
      // Loop through the current players player tiles div
      $(`#box${players.indexOf(players[this.playerIndex - 1])} > div`).each(function () {
        // If the current div have the class 'change'
        if ($(this).hasClass('change')) {
          // What index does the div with the 'change' class have
          let indexOfTile = $('.change').index();
          // What text value does the current div have (we need to know the letter)
          let letterWithPoint = $(this).text()
          // Remove the point that follows when asking for text()
          let letterWithoutPoint = letterWithPoint[0];
          // Increase numberOfTiles so we now how many new tiles we need at the end
          numberOfTiles++;

          // Loop through the players tiles
          that.tiles[0].forEach(tile => {
            // When we come across the players tiles that match the marked tile
            if (tile.char === letterWithoutPoint) {
              // Remove that tile using the indexOfTile
              that.tiles[0].splice(indexOfTile, 1);
              // Push the players removed(changed) tiles back to tilesFromBag
              that.tilesFromBag.push(tile);
            }
          });
        }
      });
      // This is the same as for player when they need new tiles
      // Remove the number of tiles from tilesFromBag 
      let newTiles = [...that.tilesFromBag.splice(0, numberOfTiles)];
      // push the new tiles to the players current tiles
      for (let i = 0; i < numberOfTiles; i++) {
        that.tiles[0].push(newTiles[i]);
      }
      // 'Shake the bag'
      that.tilesFromBag.sort(() => Math.random() - 0.5);
      // Change player (since changing tiles is a move) and re-render
      this.playerTurn();
      this.render();
      // this.changeTiles();
    });

  }

  async checkNewWordsInSAOL() {

    console.log('3. --- checkNewWordsInSAOL ---')

    let all = true;
    let none = true;
    console.log("checkNewWordsInSAOL() this.wordArray: ", this.wordArray)
    for (let i = 0; i < this.wordArray.length; i++) {
      if (await SAOLchecker.scrabbleOk(this.wordArray[i].word) === false) {

        console.log("one or more words are invalid")
        all = false;

      }
      else {
        none = false;
      }
    }
    console.log("all: " + all)
    console.log("none: " + none)

    //if all words in wordsArray are ok in Scrabble
    if (all && !none) {
      this.countPlayerScore(this.playerIndex);
      this.nextPlayer();
      console.log("end of round this.wordArray: ", this.wordArray)
      //console.log("end of round this.wordArrayCommitted", this.wordArrayCommitted)
    }
  }

  async nextPlayer() {
    // if all words are ok in scrabble:
    console.log('5. --- nextPLayer() ---')
    //this.commitPlayedWords();
    // show words played in list
    for (let obj of this.wordArray) {
      console.log("appending " + obj.word + "to SAOL window")
      $('.saol').append('<div class="boxForWord"><span class="word validWord">' +
        obj.word + '</span>')
    }
    // empty stored words in array when its the next player


    this.playerTurn();
    this.render();
    // this.changeTiles();

  }

  //function for initialize player score
  initPlayerScore() {
    for (let i = 0; i < players.length; i++) {
      players[i].score = 0;
    }
    console.log('i am in init PlayerScore', players);
  }

  async playerTurn() {
    console.log(".6 ---playerTurn()---")
    console.log("\n.".repeat(5))
    $('body').remove('.boxForWord')
    /* Alternative to switch between players turns */
    // If player index is more och equal to player array length then go back to index 0.
    // Because the current player is the last player, and the next player will be the first.
    // It all starts over.
    if (this.playerIndex >= players.length) {
      this.playerIndex = 0;
    }

    // Set this.player to the player with playerindex in players array
    // so this.player will be the new player each round
    this.player = players[this.playerIndex].name;


    // Set this.tiles to empty so the current players tiles can be this.tiles
    this.tiles = [];

    // set this.tiles to the current players tiles
    this.tiles.push(players[this.playerIndex].tiles[0]);

    // If the players has played tiles and they have less than 7, push new tiles to their playing board
    if (this.tiles[0].length < 7) {
      // numberOfTiles will be how many new tiles the player will need
      let numberOfTiles = 0;
      for (let i = 0; i < 7; i++) {
        if (!this.tiles[0][i]) {
          numberOfTiles++;
          // console.log(numberOfTiles);
        }
      }

      // newTiles will get x number of new tiles from tilesFromBag
      let newTiles = [...this.tilesFromBag.splice(0, numberOfTiles)];
      // push the new tiles to the players current tiles
      for (let i = 0; i < numberOfTiles; i++) {
        this.tiles[0].push(newTiles[i]);
      }
    }

    /* Disable all other players tile fields */

    this.showAndHidePlayers();

    console.log("playerTurn() -- players array[]:  ", players)

    // Inrease player index so when new round, the next player will this.player
    this.playerIndex++;
  }

  showAndHidePlayers() {
    // Hide all other players tileboards except for the current player
    for (let i = 0; i < players.length; i++) {
      // If this.player ( a name ) is the same as any player in the array
      // Than show the players tileboard
      if (this.player === players[i].name) {
        $(`#box${players.indexOf(players[i])}`).show();
      } else {
        // Else hide the players tileboards
        $(`#box${players.indexOf(players[i])}`).hide();
      }
    }
  }

  addEvents() {
    console.log("addEvents() called")
    $('.board > div').mouseenter(e => {
      let me = $(e.currentTarget);
      if ($('.is-dragging').length && !me.find('.tiles').length) {
        // If the current square on the board has a class '.tile', don't add hover,
        // because then there already is a tile in that square
        if (me.find('.tile').length === 0) {
          me.addClass('hover');
        }
      }
    });
    $('.board > div').mouseleave(e =>
      $(e.currentTarget).removeClass('hover')
    );

    let that = this;

    // Drag-events: We only check if a tile is in place on dragEnd
    // $('.stand .tile').not('.none').draggabilly({ containment: 'body' })
    $('.playertiles').not('.none').draggabilly({ containment: 'body' }).on('dragEnd', e => {
      // get the dropZone square - if none render and return

      let $dropZone = $('.hover');
      if (!$dropZone.length) { this.render(); return; }

      // the index of the square we are hovering over
      let squareIndex = $('.board > div').index($dropZone);

      // convert to y and x coords in this.board
      let y = Math.floor(squareIndex / 15);
      let x = squareIndex % 15;

      // the index of the chosen tile

      let $tile = $(e.currentTarget);
      // Check what index the tile have that lays in a div under each players individual id="box"
      let tileIndex = $(`#box${(this.playerIndex - 1)} > div`).index($tile);

      // If board doesn't have any div with class '.tile' then there isn't any tiles on board
      if (!$('.board > div > .tile').length) {
        // If there isn't any tiles on board, and the squareIndex is not in the middle
        // Re-render and return
        if (squareIndex !== 112) {
          this.render();
          return;
        }
        // If there is at least one tile on board then check if the new tile the player is trying to drop
        // has another tile around, if not - re-render and return. Or else place the tile and render the new board (As before)
        // It most be specific conditions for the board squares on the outer rim otherwise it will return error 
        // when we try to check if a square on the board has a tile and that square doesn't exist.
      } else if ((y === 0 && x === 0 && !this.board[y + 1][x].tile && !this.board[y][x + 1].tile)
        || (x === 0 && y > 0 && y < 14 && !this.board[y - 1][x].tile && !this.board[y + 1][x].tile && !this.board[y][x + 1].tile)
        || (x === 14 && y === 0 && !this.board[y][x - 1].tile && !this.board[y + 1][x].tile)
        || (x === 14 && y > 0 && y < 14 && !this.board[y - 1][x].tile && !this.board[y - 1][x].tile && !this.board[y][x - 1].tile)
        || (x === 14 && y === 14 && !this.board[y - 1][x].tile && !this.board[y][x - 1].tile)
        || (y === 14 && x > 0 && x < 14 && !this.board[y][x + 1].tile && !this.board[y][x - 1].tile && !this.board[y - 1][x].tile)
        || (y === 14 && x === 0 && !this.board[y - 1][x].tile && !this.board[y][x + 1].tile)
        || (y === 0 && x > 0 && x < 14 && !this.board[y][x - 1].tile && !this.board[y][x + 1].tile && !this.board[y + 1][x].tile)
        || (x > 0 && x < 14 && y > 0 && y < 14 && !this.board[y - 1][x].tile && !this.board[y + 1][x].tile && !this.board[y][x + 1].tile && !this.board[y][x - 1].tile)) {
        this.render();
        return;
      }

      // Add the moved tile from players tile array to the boards tiles
      this.board[y][x].tile = that.tiles[0].splice(tileIndex, 1);
      // When droped a tile on the board, re-render

      //Here we create a reference to the tile and the input.
      let tileChar = this.board[y][x].tile[0].char;
      let charInput = "";

      //We need to check if the tile is empty and if thats true we enter the statement.
      if (tileChar == ' ') {
        let alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ';
        let pass = false
        //We use a do while loop to check the input of the player
        //We set it to capitalized letters and check through the string in our forloop.
        //If the input matches a character in the alphabet, the loop is true and it ends.
        do {
          let rawInput = prompt("Please enter a letter");
          charInput = rawInput.toUpperCase();
          for (let i = 0; i < alphabet.length; i++) {

            console.log(charInput)
            console.log(alphabet.charAt(i))

            if (alphabet.charAt(i) == charInput) {
              console.log(alphabet.charAt(i) + ' is equals to' + charInput)
              pass = true;
            }
          }
        }
        while (!pass);
        //Now we set the tiles character to our verified and safe input.
        this.board[y][x].tile[0].char = charInput;
      }


      this.render();
    });
  }


  render() {
    // $('.board').remove();
    // let $board = $('<div class="board"/>').appendTo('.playing-window');
    // this.board.flat().forEach(x => $board.append('<div/>'));
    //********************************************* */
    if (!$('.board').length) {
      $('.playing-window').append(`
        <div class="board"></div>
        <div class="tiles"></div>
      `);

    }

    $('.board').empty();
    // render the board RENDER THE BOARD AFTER EACH PLAYER
    $('.board').html(
      this.board.flat().map(x => `
        <div class="${x.special ? 'special-' + x.special : ''}">
        ${x.tile ? `<div class="tile">${x.tile[0].char}<div class="points">${x.tile[0].points}</div></div>` : ''}
        </div>
      `).join('')
    );

    // this.checkForNewWords(y, x);

    // Empty the player tileboards window before rendering, otherwise there will be double each time it renders
    $('.playing-window-left').empty();
    // showPlayers needs to be first

    this.showPlayers();
    this.showSaolText();
    //this.showPlayerButtons();
    // showAndHide cannot be done unless we have read the showPlayers method
    this.showAndHidePlayers();
    // We want the addEvents to be last so the player can make their move

    this.addEvents();

    this.changeTiles();

  }

  checkNewWordsOnBorad() {

    console.log('2. --- checkNewWordsOnBoard ---')

    let wordH = [];  //to save  all the infromation on the horisontal 
    let wordV = [];  //to save all the infromation on the vertical 
    let wordArray = [];  //to save the final word array(word,points,extra points word times) 
    let c = ''; //temp variable to save this.board[i][j].tile[0].char
    let p = 0;  //temp variable to save this.board[i][j].tile[0].points;
    let s = ''; //temp variableto save this.board[i][j].special

    // console.log('y: ' + y);
    // console.log('x: ' + x);

    // CHECK HORISONTAL
    for (let i = 0; i < this.board.length; i++) {
      // CHECK VERTICAL
      for (let j = 0; j < this.board[i].length; j++) {
        // If we come across a board square that has a tile on it 
        if (this.board[i][j].tile) {
          // if (i === y && j === x) {
          // First check if we have another tile above/below AND side/side
          // Add the letter to both vertical and horisontal word  
          if ((this.board[i + 1][j].tile || this.board[i - 1][j].tile) && (this.board[i][j + 1].tile || this.board[i][j - 1].tile)) {
            c = this.board[i][j].tile[0].char;
            p = this.board[i][j].tile[0].points;
            s = this.board[i][j].special;
            wordV.push({ x: i, y: j, char: c, points: p, special: s });
            wordH.push({ x: i, y: j, char: c, points: p, special: s });
            // If we only have a tile above/below, add the letter to vertical word
          } else if (this.board[i + 1][j].tile || this.board[i - 1][j].tile) {
            c = this.board[i][j].tile[0].char;
            p = this.board[i][j].tile[0].points;
            s = this.board[i][j].special;
            wordV.push({ x: i, y: j, char: c, points: p, special: s });
            // If we only have a tile side/side, add the letter to horisontal word
          } else if (this.board[i][j + 1].tile || this.board[i][j - 1].tile) {
            c = this.board[i][j].tile[0].char;
            p = this.board[i][j].tile[0].points;
            s = this.board[i][j].special;
            wordH.push({ x: i, y: j, char: c, points: p, special: s });
            // If we have a tile but no other tile beside us, add to both vertical and horisontal word
            // This will only be at the start of game, when the first tile is placed
          } else {
            c = this.board[i][j].tile[0].char;
            p = this.board[i][j].tile[0].points;
            s = this.board[i][j].special;
            wordV.push({ x: i, y: j, char: c, points: p, special: s });
            wordH.push({ x: i, y: j, char: c, points: p, special: s });
          }
        }
      }
    }
    wordV.sort((a, b) => a.y > b.y ? -1 : 1);//sort by value of y from small to big
    wordH.sort((a, b) => a.x > b.x ? -1 : 1);//sort by value of x from small to big
    // console.log('vertical wordV: ', wordV);
    // console.log('horisontal wordH: ', wordH);

    //Collect all the letters from same column and made it up to en word. 
    //Calulate the points of word even if it has extra points(2x letters,3x letters). 
    //save the words multiple times  if it has extra points(2x word,3x word). 
    if (wordV.length > 1) {
      let word = '';
      let points = 0;
      let multiple = 1;
      let position = [];
      for (let i = 0; i < wordV.length; i++) {
        if (((i < wordV.length - 1) && (wordV[i].y === wordV[i + 1].y)) || ((i > 0) && (wordV[i].y === wordV[i - 1].y))) {
          word += wordV[i].char;
          position.push({ x: wordV[i].x, y: wordV[i].y });
          if (wordV[i].special) {
            if ((wordV[i].special) === '2xLS') { points += 2 * wordV[i].points }
            else if ((wordV[i].special) === '3xLS') { points += 3 * wordV[i].points }
            else if ((wordV[i].special) === '2xLW') { multiple *= 2 }
            else if ((wordV[i].special) === '3xLW') { multiple *= 3 }
            else points += wordV[i].points;
          }
          else {
            points += wordV[i].points;
          }
        }
        //if it is another column then save the word to wordArray. Initialize variables in order to save the new words.
        if ((i === wordV.length - 1) || (wordV[i].y !== wordV[i + 1].y)) {
          wordArray.push({ word: word, points: points, multiple: multiple, position: position })
          word = '';
          points = 0;
          multiple = 1;
          position = [];
        }

      }
    }
    //Collect all the letters from same row and made it up to en word. 
    //Calulate the points of word even if it has extra points(2x letters,3x letters). 
    //save the words multiple times  if it has extra points(2x word,3x word). 
    if (wordH.length > 1) {
      let word = '';
      let points = 0;
      let multiple = 1;
      let position = [];
      for (let i = 0; i < wordH.length; i++) {
        if (((i < wordH.length - 1) && (wordH[i].x === wordH[i + 1].x)) || ((i > 0) && (wordH[i].x === wordH[i - 1].x))) {
          word += wordH[i].char;
          position.push({ x: wordH[i].x, y: wordH[i].y });
          if (wordH[i].special) {
            if ((wordH[i].special) === '2xLS') { points += 2 * wordH[i].points }
            else if ((wordH[i].special) === '3xLS') { points += 3 * wordH[i].points }
            else if ((wordH[i].special) === '2xLW') { multiple *= 2 }
            else if ((wordH[i].special) === '3xLW') { multiple *= 3 }
            else points += wordH[i].points;
          }
          else {
            points += wordH[i].points;
          }
        }
        //if it is another row then save the word to wordArray. Initialize variables in order to save the new words.
        if ((i === wordH.length - 1) || (wordH[i].x !== wordH[i + 1].x)) {
          wordArray.push({ word: word, points: points, multiple: multiple, position: position })
          word = '';
          points = 0;
          multiple = 1;
          position = [];
        }
      }

      console.log('vertical wordV: ', wordV);
      console.log('horisontal wordH: ', wordH);

      console.log('the words currently on board:', wordArray);


    }

    // console.log('print this.wordArrayCommitted', this.wordArrayCommitted);

    // if (this.wordArrayCommitted.length > 0) {
    //   for (let oldItem of this.wordArrayCommitted) {
    //     let lastIndexForPosition = oldItem.position.length - 1;
    //     console.log('lastIndexForPosition', lastIndexForPosition);
    //     wordArray.splice(wordArray.findIndex
    //       (newItem => ((newItem.position[0].x === oldItem.position[0].x) && (newItem.position[0].y === oldItem.position[0].y))
    //         && ((newItem.position[newItem.position.length - 1].x === oldItem.position[lastIndexForPosition].x)
    //           && (newItem.position[newItem.position.length - 1].y === oldItem.position[lastIndexForPosition].y))
    //       ), 1);
    //   }
    //   console.log('wordArray after delete old item:', wordArray);
    //   console.log('this.wordArrayCommitted:', this.wordArrayCommitted);
    // }

    /* 
    only add new words to this.wordArray 
    compare local wordArray to this.Array and only add words which 
    if(wordArray[i].played !== 'oldWord')
    */
    console.log("this.wordArray: ", this.wordArray)
    console.log("wordArray: ", wordArray)



    // Find if the array contains an object by comparing the property value
    // if (wordArray.length > 0) {
    //   for (let i = 0; i < wordArray.length; i++) {
    //     if (this.wordArray.some(obj => obj.word === wordArray[i].word)) {
    //       alert("Object found inside the array.");
    //     } else {
    //       alert("Object not found.");
    //     }
    //   }
    // } else {
    //   this.wordArray = wordArray;
    // }

    //YUNYAN's code:
    //Compare the new words of this time and the words that have committed before
    //If there are som same position's words then remove from the wordArray.
    if (this.wordArrayCommitted.length > 0) {
      for (let oldItem of this.wordArrayCommitted) {
        let lastIndexOfPosition = oldItem.position.length - 1;
        let newItemIndex = wordArray.findIndex
          (newItem => ((newItem.position[0].x === oldItem.position[0].x) && (newItem.position[0].y === oldItem.position[0].y))
            && ((newItem.position[newItem.position.length - 1].x === oldItem.position[lastIndexOfPosition].x)
              && (newItem.position[newItem.position.length - 1].y === oldItem.position[lastIndexOfPosition].y))
          )
        //if newItemIndex is -1 that mean there is no match data. 
        //If we don't have code "if (newItemIndex !== -1)" then it will delete the last element of wordArray.
        if (newItemIndex !== -1) {
          wordArray.splice(newItemIndex, 1)
        }
      }
      this.wordArray = wordArray;
    } else {
      this.wordArray = wordArray;
    }
    console.log('wordArray after delete old item:', wordArray);
    console.log('this.wordArrayCommitted:', this.wordArrayCommitted);
  }


  createBoard() {
    this.board = [...new Array(15)].map(x => [...new Array(15)].map(x => ({})));
    // Add some info about special squares
    // Triple word score (3xWs) or swedish (3xOp) Op = Ordpoäng
    [[0, 0], [0, 7], [0, 14], [7, 0], [7, 14], [14, 0], [14, 7], [14, 14]]
      .forEach(([y, x]) => this.board[y][x].special = '3xWS');
    // Double letter score (2xLs) or swedish (2xBp) Bp = bokstavspoäng
    [[0, 3], [0, 11], [2, 6], [2, 8], [3, 0], [3, 7], [3, 14], [6, 2], [6, 6], [6, 8], [6, 12], [7, 3], [7, 11],
    [8, 2], [8, 6], [8, 8], [8, 12], [11, 0], [11, 7], [11, 14], [12, 6], [12, 8], [14, 3], [14, 11]]
      .forEach(([y, x]) => this.board[y][x].special = '2xLS');
    // Triple letter score (3xLs) or swedish (3xOp)
    [[1, 5], [1, 9], [5, 1], [5, 5], [5, 9], [5, 13], [9, 1], [9, 5], [9, 9], [9, 13], [13, 5], [13, 9]]
      .forEach(([y, x]) => this.board[y][x].special = '3xLS');
    // Double word score (2xWs) or swedish (3xBp)
    [[1, 1], [1, 13], [2, 2], [2, 12], [3, 3], [3, 11], [4, 4], [4, 10], [7, 7], [10, 4], [10, 10], [11, 3], [11, 11],
    [12, 2], [12, 12], [13, 1], [13, 13]]
      .forEach(([y, x]) => this.board[y][x].special = '2xWS');
    this.board[7][7].special = 'middle-star';


    //$('.saol').append('<div class= "boxForWordContainer"></div>')
    //$('.boxForWordContainer').css({ 'border': '1px solid black', 'height': 'auto' })
  }


  showPlayers() {
    players.forEach(player => {
      let index = 0
      $('.playing-window-left').append(`
        <div class="playerWrapper">
        <div class="playername">${player.name}</div>
        <div class="score">Poäng :<div id="score${players.indexOf(player)}"></div></div>
        </div>
        <div class="tiles-box"><div id="box${players.indexOf(player)}"></div></div>
        `);
      while (index < player.tiles[0].length) {
        $(`#box${players.indexOf(player)}`).append(`
        <div class="playertiles">${player.tiles[0][index].char}<div class="points">${player.tiles[0][index].points}</div>
      `);

        index++;
      }
      $(`#box${players.indexOf(player)}`).append(`
        <div class="playertiles ${player.tiles[1][0].char === ' ' ? '' : 'none'}"></div>
      `);

    });


  }

  showPlayerButtons() {
    //append to body instead of .board because its not working
    $('body').append(
      `
      <button class="play-tiles">Lägg brickor</button>
       <button class="pass">Stå över</button>
    
      `

    );

    // <style>
    //   .play-tiles {
    //     font - family: 'Neucha', cursive;
    //     font-size: 20px;
    //      background-color: white;
    //      border: 3px solid aliceblue;
    //      border-radius: 3px;
    //   }
    //   .pass {
    //     font - family: 'Neucha', cursive;
    //     font-size: 20px;
    //      background-color: white;
    //      border: 3px solid aliceblue;
    //      border-radius: 3px;
    //   }
    //   </style>
  }
  // This function to count the player's score
  async countPlayerScore(playerIndex) {

    console.log('4. --- countPLayerScore() ---')

    let currentWordPoints = 0;
    console.log('I am in countPlayerScore, wordArray: ', this.wordArray);
    for (let i = 0; i < this.wordArray.length; i++) {
      currentWordPoints = this.wordArray[i].points * this.wordArray[i].multiple;
      players[playerIndex - 1].score += currentWordPoints;

    }
    console.log(players[playerIndex - 1].name + " score: " + players[playerIndex - 1].score)
  }

  showSaolText() {
    $('.board').append(
      `<section class="saol">🎄SAOL🎄</section>`
    );
  }
}