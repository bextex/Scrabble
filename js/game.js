import Player from './player.js';
import SAOLchecker from './SAOLchecker.js';
import Board from './board.js';
import Score from './score.js';
// import { players } from './player.js';
import { store } from './network.js';
import Bag from './bag.js';

console.log("Store från början", store)

export default class Game {

  constructor() {

    // this.createBoard();
    // this.render();
    // this.showPlayerButtons();
    // this.playerIndex = 0;

    // When resizing the window realign tiles with squares
    // (some extra code here to make sure we do not connect resize several times)
    window.currentGame = this;
    if (!window.resizeAdded) {
      window.resizeAdded = true;
      $(window).resize(() => currentGame.alignPrelTilesWithSquares());
    }

    console.log('game starting');
    this.wordArray = [];
    this.wordArrayCommitted = [];

    this.players = [];



    // this.start();

    // //this.lettersFromFile();
    // this.start();
    // // this.changeTiles();
    // // Set change button to disabled when starting the game
    // $('.change-tiles').prop('disabled', true);
  }

  async getTiles() {
    this.tilesFromBag = store.tilesFromFile;
  }

  /* Starting up the game with start() to set how's the first player */

  start(playerName) {
    this.getTiles();

    this.board = store.board;

    console.log(this.players);
    console.log(store.players);
    console.log(playerName);
    this.name = playerName;
    for (let i = 0; i < store.players.length; i++) {
      if (playerName === store.players[i]) {
        this.players.push(new Player(store.players[i], ([...this.tilesFromBag.splice(0, 7)])));
        ///Initialize player score
        this.players[0].score = 0;
        console.log('init PlayerScore', this.players[0], this.players[0].score);
      }
    }

    // store.board = this.createBoard();
    this.playerTurn();

    // this.render();
    this.showPlayerButtons();
    // Set change button to disabled when starting the game
    $('.change-tiles').prop('disabled', true);
    this.buttonEvents();
  }



  playerTurn() {
    if (store.currentPlayer >= store.players.length) {
      store.currentPlayer = 0;
      console.log('Trying to set playerindex to 0');
    }

    console.log('This index is currently this.playerindex ' + store.currentPlayer);

    console.log('store players length', store.players.length);

    // This players turn
    this.player = store.players[store.currentPlayer];

    console.log('players name in playerturn ' + this.player);

    // Set this.tiles to empty so the current players tiles can be this.tiles
    this.tiles = [];

    // set this.tiles to the current players tiles
    this.tiles = this.players[0].tiles;
    console.log('this tiles in playerturn');
    console.log(this.tiles);
    // this.tiles.push(players[this.playerIndex].tiles[0]);

    // If the players has played tiles and they have less than 7, push new tiles to their playing board
    if (this.tiles[0].length < 7) {
      // numberOfTiles will be how many new tiles the player will need
      console.log('i have less than 7 tiles in my stand');
      let numberOfTiles = 0;
      for (let i = 0; i < 7; i++) {
        if (!this.tiles[0][i]) {
          numberOfTiles++;
          // console.log(numberOfTiles);
        }
      }
      console.log('number of new tiles', numberOfTiles);

      // newTiles will get x number of new tiles from tilesFromBag
      let newTiles = [...this.tilesFromBag.splice(0, numberOfTiles)];
      // push the new tiles to the players current tiles
      for (let i = 0; i < numberOfTiles; i++) {
        this.tiles[0].push(newTiles[i]);
      }
    }

    console.log('this many tiles are left in the bag: ' + this.tilesFromBag.length);

    this.render();
  }

  addEvents() {
    console.log('Im in addEvents');

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
    $('.playertiles').not('.none').draggabilly({ containment: 'body' })
      // Edited by TF
      .on('dragStart', e => delete $(e.currentTarget).data().prelBoardPos)
      .on('dragMove', e => this.alignPrelTilesWithSquares())
      .on('dragEnd', function (e, pointer) {

        // get the tile and the dropZone square
        let $tile = $(e.currentTarget);
        let $dropZone = $('.hover');

        // the index of the square we are hovering over
        let squareIndex = $('.board > div').index($dropZone);
        // convert to y and x coords in this.board
        let y = Math.floor(squareIndex / 15);
        let x = squareIndex % 15;

        // move the tile back to the rack
        $tile.css({ top: '', left: '' });

        // if no drop zone or the square is taken then do nothing
        if (!$dropZone.length || store.board[y][x].tile) {
          /********************** NEW CODE *******************/

          let { pageX, pageY } = pointer;
          let tileIndex = +$tile.attr('data-index');
          let tile = that.tiles[0][tileIndex];

          let $stand = $tile.parent('#box0');
          let { top, left } = $stand.offset();
          let bottom = top + $stand.height();
          let right = left + $stand.width();

          let newIndex;
          let playerMovedAroundTiles = false;
          if (pageX > left && pageX < right
            && pageY > top && pageY > bottom) {

            newIndex = Math.floor(8 * (pageX - left) / $stand.width());
            console.log('My new index is', newIndex);
            let pt = that.tiles[0];
            let replacedTile = pt[newIndex];
            console.log('iam player tiles', pt);
            // move around
            pt[newIndex] = tile;
            pt[tileIndex] = ' ';

            if (tileIndex === newIndex) {
              $tile.css({ top: '', left: '' });
            } else if (tileIndex > newIndex) {
              pt.splice(newIndex + 1, 0, replacedTile);
              playerMovedAroundTiles = true;
            } else if (tileIndex < newIndex) {
              pt.splice(newIndex, 0, replacedTile);
              playerMovedAroundTiles = true;
            }
            pt.splice(pt.indexOf(' '), 1);
          }

          if (playerMovedAroundTiles) {
            $('.playing-window-left').empty();
            that.render();
            // $tile.css({ top: '' });
          }
          else {
            // move the tile back to its original position
            $tile.css({ top: '', left: '' });
          }
          // $tile.data().prelBoardPos = { y, x };
          // this.alignPrelTilesWithSquares();
          return;
        }

        // store the preliminary board position with the tile div
        // (jQuery can add data to any element)
        $tile.data().prelBoardPos = { y, x };
        that.alignPrelTilesWithSquares();
      });
  }

  // added by TF
  alignPrelTilesWithSquares() {
    // align tiles that have a prelBoardPos with correct squares
    $('.playertiles').each((i, el) => {
      let $tile = $(el);
      let p = $tile.data().prelBoardPos;
      if (!p) { return; }
      let $square = $('.board > div').eq(p.y * 15 + p.x);
      $tile.css({ top: '', left: '' });
      let so = $square.offset(), to = $tile.offset();
      let swh = { w: $square.width(), h: $square.height() };
      let twh = { w: $tile.width(), h: $tile.height() };
      let pos = {
        left: so.left - to.left + (swh.w - twh.w) / 2.8,
        top: so.top - to.top + (swh.h - twh.h) / 2.8
      };
      $tile.css(pos);
    });
  }

  // added by TF
  placePrelTilesOnBoard() {
    $('.playertiles').each((i, el) => {
      let $tile = $(el);
      let p = $tile.data().prelBoardPos;
      if (!p) { return; }
      let tileIndex = $(`#box0 > div`).index($tile);
      let tile = this.tiles[0][tileIndex];
      tile.onBoard = true;
      this.board[p.y][p.x].tile = [tile];
      this.checkNewWordsOnBoard(p.y, p.x);
    });
    this.tiles[0] = this.tiles[0].filter(x => !x.onBoard);
  }

  // added by TF
  notFirstMoveOrCenterIsTaken() {
    let isFirstMove = this.board.flat().every(square => !square.tile);
    console.log('isFirstMove', isFirstMove);
    let centerIsTaken = !!([...$('.playertiles')].find(x => {
      let p = $(x).data().prelBoardPos;
      return p && p.x === 7 && p.y === 7;
    }));
    console.log('centerIsTaken', centerIsTaken);
    return !isFirstMove || centerIsTaken;
  }

  render() {
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
        ${x.tile ? `<div class="tile" >${x.tile[0].char}<div class="points">${x.tile[0].points}</div></div>` : ''}
        </div>
      `).join('')
    );

    console.log('Index of this player in store.players:', store.players.indexOf(this.name));
    console.log('Current player in store:', store.currentPlayer);
    if (store.players.indexOf(this.name) === store.currentPlayer) {
      $('.not-your-turn').remove();
    } else {
      $('.playing-window').append(`<div class="not-your-turn"><p>${this.player} spelar just nu...</p></div>`);

    }

    // Empty the player tileboards window before rendering, otherwise there will be double each time it renders
    $('.playing-window-left').empty();
    // showPlayers needs to be first

    this.showPlayers();
    this.showSaolText();

    // showAndHide cannot be done unless we have read the showPlayers method
    // this.showAndHidePlayers();
    // We want the addEvents to be last so the player can make their move

    this.buttonEvents();
    this.addEvents();
    this.changeTiles();
    // this.showPlayerButtons();
  }

  changeTiles() {
    console.log('Im in changeTiles()');

    $('.change-tiles').prop('disabled', true);
    // When double-clicking on the tiles do this function
    $('.playertiles').not('.none').dblclick(function () {
      // If the player has played a tile then they cannot change any tiles the same round

      let stop = false;

      $('.playertiles').each((i, el) => {
        let $tile = $(el);
        let p = $tile.data().prelBoardPos;
        if (p) {
          stop = true;
          return;
        }
      });

      if (stop) {
        return;
      } else {
        $(this).toggleClass('change');
        // First time someone mark the tile, the button gets enabled
        $('.change-tiles').prop('disabled', false);
        // If no tile has the class 'change', meaning no tile is marked atm
        // Change the buttons value to opposite of what it is now. 
        // If true, set to false. If false, set to true
        if ($('.change').length === 0) {
          $('.change-tiles').prop('disabled', (_, val) => !val);
        }
      }
    });
  }

  buttonEvents() {
    this.showPlayerButtons();

    console.log('Im in button events');

    // When click on 'Stå över'-button, there will be a new player and the board will render
    $('.pass').on('click', () => {
      console.log('i have clicked on pass button');

      $('.playertiles').each((i, el) => {
        let $tile = $(el);
        let p = $tile.data().prelBoardPos;
        if (p) {
          console.log('There is tiles when I clicked the pass button');
          p = '';
        }
      });

      store.currentPlayer++;
      console.log('Changing player index', store.currentPlayer);

      // this.board = store.board;
      // this.tilesFromBag = store.tilesFromFile;

      this.playerTurn();
      this.render();
      // this.changeTiles();
    });

    // When click on 'Lägg brickor'-button, there will be a new player and the board will render
    // Shoul also count score on word
    $('.play-tiles').on('click', () => {
      console.log('im pushing play-tiles');

      // TF comments:

      // only a valid move if not first move or center is taken
      if (!this.notFirstMoveOrCenterIsTaken()) {
        this.render();
        return;
      }

      this.placePrelTilesOnBoard();
      this.render();

      console.log('i have clicked on lägg brickor');

      console.log('Changing player index', store.currentPlayer);

      this.checkNewWordsOnBoard(y, x);
      // get points for word
      // CountScores(); ??? 

      //if (this.wordArray.length > 0) {
      //  this.showWordWithList(this.wordArray)
      //}

      if (this.wordArray.length > 0) {
        this.countPlayerScore(store.players.indexOf(this.name), this.wordArray);
        // this.countPlayerScore(this.playerIndex, this.wordArray);
      }
      else {
        alert('Du har ingen godkänd ord');
        return;
      }

      store.currentPlayer++;


      // this.board = store.board;
      // this.tilesFromBag = store.tilesFromFile;

      this.playerTurn();
      this.render();
      // this.changeTiles();
    });

    // To change tiles, locate what tile wants to be changed and change them to new tiles from bag. 
    // Put back the tiles that wants to be changed and scramble the bag

    $('.change-tiles').on('click', () => {
      console.log('im pushing play-tiles');
      if (this.tilesFromBag.length < 7) {
        console.log('there are 7 or less tiles in bag');
        alert('there are 7 or less tiles in bag');
        // Put a div and message here instead
      }
      // How many tiles the player wants to remove
      let numberOfTiles = 0;
      let that = this;
      // Loop through the current players player tiles div
      // $(`#box${players.indexOf(players[this.playerIndex - 1])} > div`).each(function () {
      $(`#box0 > div`).each(function () {
        // If the current div have the class 'change'
        if ($(this).hasClass('change')) {
          // What index does the div with the 'change' class have

          let indexOfTile = $('.change').index();
          // What text value does the current div have (we need to know the letter)
          let letterWithPoint = $(this).text();
          // Remove the point that follows when asking for text()
          let letterWithoutPoint = letterWithPoint[0];
          // Increase numberOfTiles so we now how many new tiles we need at the end
          numberOfTiles++;

          // Loop through the players tiles
          for (let i = 0; i < that.tiles[0].length; i++) {
            if (that.tiles[0][i].char === letterWithoutPoint) {
              // Remove that tile using the indexOfTile
              that.tiles[0].splice(indexOfTile, 1);
              // Push the players removed(changed) tiles back to tilesFromBag
              that.tilesFromBag.push(that.tiles[0][i]);
              return;
            }
          }
        }
      });
      // This is the same as for player when they need new tiles
      // Remove the number of tiles from tilesFromBag 
      let newTiles = [...this.tilesFromBag.splice(0, numberOfTiles)];
      // push the new tiles to the players current tiles
      for (let i = 0; i < numberOfTiles; i++) {
        this.tiles[0].push(newTiles[i]);
      }

      // 'Shake the bag'
      this.tilesFromBag.sort(() => Math.random() - 0.5);
      // Change player (since changing tiles is a move) and re-render
      store.tilesFromFile = this.tilesFromBag;

      store.currentPlayer++;
      console.log('Changing player index', store.currentPlayer);

      this.playerTurn();
      this.render();
      // this.changeTiles();
    });

  }

  checkNewWordsOnBoard(y, x) {
    let wordH = [];  //to save  all the infromation on the horisontal 
    let wordV = [];  //to save all the infromation on the vertical 
    let wordArray = [];  //to save the final word array(word,points,extra points word times) 
    let c = ''; //temp variable to save this.board[i][j].tile[0].char
    let p = 0;  //temp variable to save this.board[i][j].tile[0].points;
    let s = ''; //temp variableto save this.board[i][j].special

    console.log('y: ' + y);
    console.log('x: ' + x);
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
    console.log('vertical wordV: ', wordV);
    console.log('horisontal wordH: ', wordH);

    //Collect all the letters from same column and made it up to en word. 
    //Calulate the points of word even if it has extra points(2x letters,3x letters). 
    //save the words multiple times  if it has extra points(2x word,3x word). 
    if (wordV.length > 1) {
      let word = '';
      let points = 0;
      let multiple = 1;
      let position = [];
      let totalPoints = 0;
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
          totalPoints = multiple * points;
          wordArray.push({ word: word, points: points, multiple: multiple, position: position, totalPoints: totalPoints })
          word = '';
          points = 0;
          multiple = 1;
          position = [];
          totalPoints = 0;
        }

      }
      console.log('the words currently on board:', wordArray);
    }
    //Collect all the letters from same row and made it up to en word. 
    //Calulate the points of word even if it has extra points(2x letters,3x letters). 
    //save the words multiple times  if it has extra points(2x word,3x word). 
    if (wordH.length > 1) {
      let word = '';
      let points = 0;
      let multiple = 1;
      let position = [];
      let totalPoints = 0;
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
          totalPoints = multiple * points;
          wordArray.push({ word: word, points: points, multiple: multiple, position: position, totalPoints: totalPoints })
          word = '';
          points = 0;
          multiple = 1;
          position = [];
          totalPoints = 0;
        }
      }
      console.log('the words currently on board:', wordArray);
    }

    //console.log('print this.wordArrayCommitted', this.wordArrayCommitted);
    //let wordArrayCopy = wordArray.slice();
    //console.log('print wordArrayCopy', wordArrayCopy);

    //Compare the new words of this time and the wors that have committed before
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
      console.log('wordArray after delete old item:', wordArray);
      console.log('this.wordArrayCommitted:', this.wordArrayCommitted);
    }


    this.wordArray = wordArray;
    /*
    if (wordArray.length > 0) {
      this.countPlayerScore(wordArray);
    }
    */
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

    return this.board;
  }

  showPlayers() {
    this.players.forEach(player => {
      let index = 0

      $('.playing-window-left').append(`
      <div class="playerWrapper">
      <div class="playersName">${player.name}</div>
      <div class="score">Poäng:<div id="score${this.players.indexOf(player)}"></div></div>
      </div>
      <div class="tiles-box"><div id="box${this.players.indexOf(player)}"></div></div>
      `);
      while (index < player.tiles[0].length) {
        $(`#box0`).append(`
      <div data-index="${index}" class="playertiles ${player.tiles[0][index].char === ' ' ? 'blankTile' : ''}">${player.tiles[0][index].char}<div class="points">${player.tiles[0][index].points || ''}</div>
    `);
        index++;
      }
      $('.blankTile').on('staticClick', e => {
        let me = $(e.currentTarget);
        let index = +me.attr('data-index');
        let alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ';
        let pass = false;
        let char = '';
        //We use a do while loop to check the input of the player
        //We set it to capitalized letters and check through the string in our forloop.
        //If the input matches a character in the alphabet, the loop is true and it ends.
        do {
          char = prompt('Skriv in en bokstav eller tryck avbryt för att byta bricka');
          if (char === null) {
            me.dblclick();
            return;
          }

          for (let i = 0; i < alphabet.length; i++) {

            console.log(char)
            console.log(alphabet.charAt(i))

            if (alphabet.charAt(i) == char) {
              console.log(alphabet.charAt(i) + ' is equals to' + char)
              player.tiles[0][index].char = char;
              pass = true;

            }
          }
        }
        while (!pass);
        //Now we set the tiles character to our verified and safe input.

        console.log(player.tiles)
        me.html(char)

      })
    });

  }


  showPlayerButtons() {
    console.log('Im in showPlayerButtons');

    $('.tiles-from-bag').remove();
    $('.play-tiles').remove();
    $('.pass').remove();
    $('.change-tiles').remove();

    console.log('The length of the tile bag array from show player buttons', store.tilesFromFile.length);

    $('.board').append(
      `
      <p class= "tiles-from-bag">🎁 ${this.tilesFromBag.length}</p>
      <button class="play-tiles">Lägg brickor</button>
      <button class="pass">Stå över</button>
      <button class="change-tiles">Byt brickor</button>
    `);
  }
  // This function to count the player's score
  async countPlayerScore(playerIndex, wordArray) {
    let currentWordPoints = 0;
    console.log('I am in countPlayerScore, wordArray: ', wordArray);
    console.log('I am in countPlayerScore, player: ', playerIndex);
    for (let i = 0; i < wordArray.length; i++) {
      console.log('I am in countPlayerScore, wordArray[i].word: ', wordArray[i].word);
      if (await SAOLchecker.scrabbleOk(wordArray[i].word)) {
        // currentWordPoints = wordArray[i].points * wordArray[i].multiple;
        currentWordPoints = wordArray[i].totalPoints;
        wordArray[i].scrabbleOk = true;
      }
      else {
        currentWordPoints = 0;
        wordArray[i].scrabbleOk = false;
      }
      console.log('currentWordPoints', currentWordPoints);
      // players[playerIndex - 1].score += currentWordPoints;
      this.players[playerIndex].score += currentWordPoints;
      console.log('play.score: ', this.players[playerIndex].score);
    }
    //console.log('play.score', player.score);
    this.wordArrayCommitted = wordArray.filter(x => x.scrabbleOk === true);
    console.log('I am in countPlayerScore wordArray committed', this.wordArrayCommitted);
  }


  showSaolText() {
    $('.board').append(
      `<p class="saol">🎄SAOL🎄</p>
      <section class="placeForBox"><section>`
    );
  }

  async showWordFromSAOL(wordsInArray) {
    console.log('------im in countScore()------');
    console.log("wordsInArray:  ", wordsInArray);

    let lastWord = wordsInArray[0].word;
    console.log("last word: ----> ", lastWord)

    console.log(lastWord + "is: " + await SAOLchecker.scrabbleOk(lastWord))

    // only shows the last word (ok in scrabble - box)
    if ($('body .boxForWord').length > 0) {
      $('body .boxForWord').remove();
    }

    /*Remove?*/
    if (await SAOLchecker.scrabbleOk(lastWord) === false) {
      // (false === false) --> (true)
      $('.placeForBox').append('<div class="boxForWord"><span class="word">' +
        lastWord + '</span><hr>ok in Scrabble: ' +
        // check if ok scrabble words
        // by calling await SAOLchecker.scrabbleOk(word)
        await SAOLchecker.scrabbleOk(lastWord) + '<hr>' +
        // add explanations/entries from SAOL in body
        // by using await SAOLchecker.lookupWord(word)
        // (maybe fun to show in scrabble at some point?)
        await SAOLchecker.lookupWord(lastWord) + '</div');

    }
    if (await SAOLchecker.scrabbleOk(lastWord)) {
      $('.placeForBox').append(`<div class="boxForWord" id="${lastWord}-box"><span class="word">` +

        lastWord + `</span><hr>ok in Scrabble: ` +
        // check if ok scrabble words
        // by calling await SAOLchecker.scrabbleOk(word)
        await SAOLchecker.scrabbleOk(lastWord) + '<hr>');
      // let wordPoints = 0;
      // for (let i = 0; i < word.length; i++) {
      //   let letterInWord = word.charAt(i);
      //   //find the letters points          
      //   let letterPoints = letters
      //     // get char
      //     .filter(letter => letter.char === letterInWord)
      //     // get their points
      //     .map(letter => letter.points);
      //   let points = letterPoints[0];
      //   wordPoints += points;
      // }
      $(`#${lastWord}-box`).append(`<div><span class="points"></span><hr> points: ${lastWord}<hr>` +
        // add explanations/entries from SAOL in body
        // by using await SAOLchecker.lookupWord(word)
        // (maybe fun to show in scrabble at some point?)
        await SAOLchecker.lookupWord(lastWord) + '</div');
    }
  }
  async showWordWithList(wordsInArray) {
    console.log('------I am in showWordWithList()-----');
    $('.playing-window').append(`<section class="wordList"><h3>Ord Listor</h3>
     <table><tr><th>Ord</th><th>ok in Scrabble</th><th>poäng</th></tr>
     `)
    for (let item of wordsInArray) {
      if (await SAOLchecker.scrabbleOk(item.word)) {
        item.scrabbleOk = true;
      }
      else {
        item.scrabbleOk = false;
        item.totalPoints = 0;
      }
      $(`.wordList`).append(`<span class="word">
      <tr><td>${item.word}</td></tr><tr><td>${item.scrabbleOk}</td></tr><tr><td>${item.totalPoints}</td></tr>
      `)
    }


  }
}
