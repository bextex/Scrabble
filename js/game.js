import Player from './player.js';
import SAOLchecker from './SAOLchecker.js';
import Board from './board.js';
import Score from './score.js';
import Modal from './modal.js';
import Network, { store } from './network.js';
import Bag from './bag.js';

export default class Game {

  constructor() {
    // When resizing the window realign tiles with squares
    // (some extra code here to make sure we do not connect resize several times)
    window.currentGame = this;
    if (!window.resizeAdded) {
      window.resizeAdded = true;
      $(window).resize(() => currentGame.alignPrelTilesWithSquares());
    }
    console.log('Game starting');
    this.newestWords = [];
    this.usedSpecialTiles = [];
    this.players = [];
    this.boxIndex;
  }

  async checkNewWordsInSAOL() {
    console.log('3. --- checkNewWordsInSAOL ---')
    let all = true;
    let none = true;
    console.log(store.storeCurrentWords.length)
    for (let i = 0; i < store.storeCurrentWords.length; i++) {
      console.log(store.storeCurrentWords[i])
      if (/\s/.test(store.storeCurrentWords[i].word) || await SAOLchecker.scrabbleOk(store.storeCurrentWords[i].word) === false) {
        console.log("One or more words are invalid")
        if (/\s/.test(store.storeCurrentWords[i].word)) {
          await Modal.alert("Fill in the blank tile!");
        }
        this.newestWords = [];
        all = false;
      }
      else {
        none = false;
      }
    }
    //if all words in wordsArray are ok in Scrabble
    if (all && !none) {
      // Save all new words in storeOldWords
      for (let i = 0; i < store.storeCurrentWords.length; i++) {
        store.storeOldWords.push(store.storeCurrentWords[i].word)
      }
      this.countPlayerScore();
      this.nextPlayer();
    } else {
      await Modal.alert('Du har ogiltiga ord på brädet!');
      this.removeTilesFromBoard();
    }
  }

  removeTilesFromBoard() {
    $('.playertiles').each((i, el) => {
      let $tile = $(el);
      let p = $tile.data().prelBoardPos;
      // If the tile has the property 'prelBoardPos' and it's not falsey. 
      // The tile thinks its on the board and we need to remove all 'board' propertys since it was a false word
      if (p) {
        // Empty the property 'prelBoardPos' for the tile data 
        delete $tile.data().prelBoardPos;
        // Save the tile that is currently on the board at p.y and p.x position
        let tileOnBoard = this.board[p.y][p.x].tile;
        // Delete the property 'tile' from board, the tile should not have a tile in that position anymore
        delete this.board[p.y][p.x].tile;
        //Delete the position that saved in the  Array this.usedSpecialTiles because this position saved for the invalid word.
        let index = -1;
        for (let k = 0; k < this.usedSpecialTiles.length; k++) {
          if ((this.usedSpecialTiles[k].x === p.y) && (this.usedSpecialTiles[k].y === p.x)) { index = k; }
        }
        if (index >= 0) {
          this.usedSpecialTiles.splice(index, 1);
        }
        // Get the tileIndex from what tile-box it's currently in (It still think it belongs to a tile-box because we never really move it from the div)
        let tileIndex = $(`#box0 > div > div`).index($tile);
        // Add the tile back to the players this.tiles array, by adding it back at the index it was before and with the tile that was on the board
        this.tiles[0].splice(tileIndex, 0, ...tileOnBoard).join('');
        // Save the tile we just added back, to a local variable
        let tileInArray = this.tiles[0][tileIndex];
        // Delete the tiles property 'onBoard' so it doesn't think that its on the board anymore
        delete tileInArray.onBoard;
        // Style the css back to its original place (the place it was on the player rack)
        $tile.css({ top: '', left: '' });
      }
    });
  }

  async getTiles() {
    this.tilesFromBag = store.tilesFromFile;
  }

  /* Starting up the game with start() to set how's the first player */
  start(playerName, myPlayerIndex) {
    this.getTiles();
    this.board = store.board;
    this.myPlayerIndexInStore = myPlayerIndex;

    this.name = playerName;
    for (let i = 0; i < store.players.length; i++) {
      if (playerName === store.players[i]) {
        this.players.push(new Player(store.players[i], ([...this.tilesFromBag.splice(0, 7)]), 0));
      }
    }
    this.playerTurn();
    this.showPlayerButtons();
    $('.change-tiles').prop('disabled', true);
    this.buttonEvents();
  }

  playerTurn() {
    if (store.currentPlayer >= store.players.length) {
      store.currentPlayer = 0;
    }
    // This players turn
    this.player = store.players[store.currentPlayer];
    // Set this.tiles to empty so the current players tiles can be this.tiles
    this.tiles = [];
    // set this.tiles to the current players tiles
    this.tiles = this.players[0].tiles;
    // If the players has played tiles and they have less than 7, push new tiles to their playing board
    if (this.tiles[0].length < 7) {
      // numberOfTiles will be how many new tiles the player will need
      let numberOfTiles = 0;
      for (let i = 0; i < 7; i++) {
        if (!this.tiles[0][i]) {
          numberOfTiles++;
        }
      }
      // newTiles will get x number of new tiles from tilesFromBag
      let newTiles = [...this.tilesFromBag.splice(0, numberOfTiles)];
      // push the new tiles to the players current tiles
      for (let i = 0; i < numberOfTiles; i++) {
        this.tiles[0].push(newTiles[i]);
      }
    }
    this.render();
  }

  addEvents() {
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

          let { pageX, pageY } = pointer;
          let tileIndex = +$tile.attr('data-index');
          let $tileBoxSquare = $tile.parent('.tiles-box');
          let tileBoxSquareIndex = +$tileBoxSquare.attr('data-box');
          let $stand = $('#box0');
          let { top, left } = $stand.offset();
          let bottom = top + $stand.height();
          let right = left + $stand.width();

          if (pageX > left && pageX < right
            && pageY > top && pageY > bottom) {

            let newBoxIndex = Math.floor(8 * (pageX - left) / ($stand.width()));
            let $newBoxSquare = $(`.tiles-box[data-box="${newBoxIndex}"]`);

            if (!$(`.tiles-box[data-box="${newBoxIndex}"] > div`).length) {

              $(`.tiles-box[data-box="${newBoxIndex}"]`).append($tile);
              $(`.tiles-box[data-box="${tileBoxSquareIndex}"]`).empty();

              let so = $newBoxSquare.offset(), to = $tile.offset();
              let swh = { w: $newBoxSquare.width(), h: $newBoxSquare.height() };
              let twh = { w: $tile.width(), h: $tile.height() };
              let pos = {
                left: so.left - to.left + (swh.w - twh.w) / 2.8,
                top: so.top - to.top + (swh.h - twh.h) / 2.8
              };
              $tile.css(pos);
              // 4. Re-arrange the array so it matches to order on the player rack, by empty the array and push it back in the order it is on the rack (only if tiles-box is not empty)
              that.tiles[0] = [];
              console.log('Is the tile empty?', that.tiles[0].length);

              $('.tiles-box').each((i, el) => {
                if ($(`.tiles-box[data-box="${i}"] > div`).length) {
                  let tile = $(`.tiles-box[data-box="${i}"] > div`).text();
                  let letter = tile[0];
                  let points;
                  if (tile.length > 2) {
                    points = tile[1] + tile[2];
                  } else {
                    points = tile[1];
                  }
                  that.tiles[0].push({ char: letter, points: points });
                }
              });
            } else {
              // Added render the tiles when putting tiles back from board to players tiles board
              let so = $tileBoxSquare.offset(), to = $tile.offset();
              let swh = { w: $tileBoxSquare.width(), h: $tileBoxSquare.height() };
              let twh = { w: $tile.width(), h: $tile.height() };
              let pos = {
                left: so.left - to.left + (swh.w - twh.w) / 2.8,
                top: so.top - to.top + (swh.h - twh.h) / 2.8
              };
              $tile.css(pos);
            }
          }
          return;
        }
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
      let tileIndex = $(`#box0 > div > div`).index($tile);
      let tile = this.tiles[0][tileIndex];
      tile.onBoard = true;
      this.board[p.y][p.x].tile = [tile];
    });
    this.checkNewWordsOnBoard();
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

  besideAnotherTile() {
    let isFirstMove = this.board.flat().every(square => !square.tile);
    if (isFirstMove) { return true; }
    let isBesideAnotherTile = false;
    $('.playertiles').each((i, el) => {
      let p = $(el).data().prelBoardPos;
      if (p) {
        let y = p.y;
        let x = p.x;
        if (y === 0 && x === 0) {
          if (!!this.board[y + 1][x].tile || !!this.board[y][x + 1].tile) {
            isBesideAnotherTile = true;
          }
        } else if (x === 0 && y > 0 && y < 14) {
          if (!this.board[y - 1][x].tile || !!this.board[y + 1][x].tile || !!this.board[y][x + 1].tile) {
            isBesideAnotherTile = true;
          }
        } else if (x === 14 && y === 0) {
          if (!!this.board[y][x - 1].tile || !!this.board[y + 1][x].tile) {
            isBesideAnotherTile = true;
          }
        } else if (x === 14 && y > 0 && y < 14) {
          if (!!this.board[y - 1][x].tile || !!this.board[y + 1][x].tile || !!this.board[y][x - 1].tile) {
            isBesideAnotherTile = true;
          }
        } else if (x === 14 && y === 14) {
          if (!!this.board[y - 1][x].tile || !!this.board[y][x - 1].tile) {
            isBesideAnotherTile = true;
          }
        } else if (y === 14 && x > 0 && x < 14) {
          if (!!this.board[y][x + 1].tile || !!this.board[y][x - 1].tile || !!this.board[y - 1][x].tile) {
            isBesideAnotherTile = true;
          }
        } else if (y === 14 && x === 0) {
          if (!!this.board[y - 1][x].tile || !!this.board[y][x + 1].tile) {
            isBesideAnotherTile = true;
          }
        } else if (y === 0 && x > 0 && x < 14) {
          if (!!this.board[y][x - 1].tile || !!this.board[y][x + 1].tile || !!this.board[y + 1][x].tile) {
            isBesideAnotherTile = true;
          }
        } else if (x > 0 && x < 14 && y > 0 && y < 14) {
          if (!!this.board[y - 1][x].tile || !!this.board[y + 1][x].tile || !!this.board[y][x + 1].tile || !!this.board[y][x - 1].tile) {
            isBesideAnotherTile = true;
          }
        }
      }
    });
    console.log('isBesideAnotherTile', isBesideAnotherTile);
    return isBesideAnotherTile;
  }

  render() {
    if (!$('.board').length) {
      $('.playing-window').append(`
        <div class="board"></div>
        <div class="tiles"></div>
      `);
    }

    $('.board').empty();
    // render the board after each player
    $('.board').html(
      this.board.flat().map(x => `
        <div class="${x.special ? 'special-' + x.special : ''}">
        ${x.tile ? `<div class="tile">${x.tile[0].char}<div class="points">${x.tile[0].points}</div></div>` : ''}
        </div>
      `).join('')
    );

    this.countingPotentialEndPoints();
    this.playerTurnWindow();
    // Empty the player tileboards window before rendering, otherwise there will be double each time it renders
    $('.playing-window-left').empty();
    this.showPlayers();
    this.showSaolText();
    this.buttonEvents();
    this.addEvents();
    this.changeTiles();
    this.highScoreList();
  }

  highScoreList() {
    $('.highScore').remove();

    $('.playing-window').append(`
     <div class="highScore">HIGH❄️SCORE
     <div class="highscore-name">Namn<div class="highscore-namelist"></div></div>
     <div class="highscore-score">Poäng<div class="highscore-scorelist"></div></div>
     </div>
    `);

    let scoreArray = [];
    for (let i = 0; i < store.score.length; i++) {
      scoreArray.push(store.score[i].points);
    }

    scoreArray.sort((a, b) => b - a);

    let playerArray = [];

    for (let i = 0; i < scoreArray.length; i++) {
      for (let j = 0; j < store.score.length; j++) {
        if (scoreArray[i] === store.score[j].points) {
          playerArray.push({ name: store.score[j].name, points: store.score[j].points });
        }
      }
    }

    for (let i = playerArray.length - 1; i >= store.score.length; i--) {
      playerArray.pop();
    }

    for (let i = 0; i < playerArray.length; i++) {
      $('.highscore-namelist').append(`
      ${playerArray[i].name}<br>
      `);
    }
    for (let i = 0; i < playerArray.length; i++) {
      $('.highscore-scorelist').append(`
      ${playerArray[i].points}<br>
      `)
    }
  }

  showSaolText() {
    $('.board').append(
      `<section class="saol">🎄SAOL🎄</section>`);
  }

  changeTiles() {
    $('.change-tiles').prop('disabled', true);
    // When double-clicking on the tiles do this function
    $('.playertiles').not('.none').dblclick(async function () {
      // If the player has played a tile then they cannot change any tiles the same round
      let stop = false;
      $('.playertiles').each((i, el) => {
        let $tile = $(el);
        let p = $tile.data().prelBoardPos;
        console.log('what is p in change tiles', p);
        if (p) {
          stop = true;
          return;
        }
      });
      if (stop) {
        await Modal.alert('Du kan inte byta brickor när du har lagt brickor på brädet! Lägg tillbaka dem och försök igen!');
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

  async buttonEvents() {
    this.showPlayerButtons();
    // When click on 'Stå över'-button, there will be a new player and the board will render
    $('.pass').on('click', () => {
      console.log('i have clicked on pass button');
      store.passcounter++;

      $('.playertiles').each((i, el) => {
        let $tile = $(el);
        let p = $tile.data().prelBoardPos;
        if (p) {
          p = '';
          // The tile renders back to its player tiles if not played and is on board
          $tile.css({ top: '', left: '' });
        }
      });

      store.currentPlayer++;
      this.playerTurn();
    });

    $('.help-button').on('click', async () => {
      await Modal.alert(`<b>Blanka brickan:</b> För att använda den blanka brickan, tryck på den och skriv in en bokstav. Om du vill ändra bokstaven senare kan du trycka på den igen. Men när du använder brickan så kommer den att läggas och vara i spel.
      <br><b>Byta Brickor:</b> Dubbelklicka på brickorna du vill byta i din brickhållare och tryck sedan på byta brickor.
      <br><b>Tänk på!</b> Om du och dina medspelare passar eller byter tre gånger i rad så avslutas spelet!`, 'Stäng');
    });

    // When click on 'Lägg brickor'-button, there will be a new player and the board will render
    // Shoul also count score on word
    $('.play-tiles').on('click', async () => {
      store.passcounter = 0;
      console.log('im pushing play-tiles');
      // only a valid move if not first move or center is taken
      // this.besideAnotherTile();
      if (!this.notFirstMoveOrCenterIsTaken()) {
        await Modal.alert('Du måste lägga första ordet så att det korsar mittenrutan!');
        this.render();
        return;
      }
      if (!this.besideAnotherTile()) {
        await Modal.alert('Du måste lägga dina ord brevid redan befintliga ord på brädet!');
        this.render();
        return;
      }
      this.placePrelTilesOnBoard();
      this.checkNewWordsInSAOL();
    });

    // To change tiles, locate what tile wants to be changed and change them to new tiles from bag. 
    // Put back the tiles that wants to be changed and scramble the bag
    $('.change-tiles').on('click', async () => {
      store.passcounter++;
      if (this.tilesFromBag.length < 7) {
        await Modal.alert('Du kan inte byta brickor när det är mindre än 7 brickor kvar.');
        return;
      }
      // How many tiles the player wants to remove
      let numberOfTiles = 0;
      let that = this;
      // Loop through the current players player tiles div
      // $(`#box${players.indexOf(players[this.playerIndex - 1])} > div`).each(function () {
      $(`#box0 > div > div`).each(function () {
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
      this.playerTurn();
    });
  }

  async nextPlayer() {
    // if all words are ok in scrabble:
    console.log('5. --- nextPLayer() ---')

    store.currentPlayer++;
    this.playerTurn();
    //append after render so it will appear in .saol element
    let boxForWord = '';
    for (let obj of store.storeCurrentWords) {
      console.log("appending " + obj.word + "to SAOL window")
      boxForWord = '<div class="boxForWord"><span class="word validWord">' + obj.word + '</span>'
      $('.saol').append(boxForWord)
    }
  }
  // --- johanna (gamla checkNewWordsOnBoard funktionen)
  checkNewWordsOnBoard() {
    console.log('2. --- checkNewWordsOnBoard ---')

    let wordH = [];  //to save  all the infromation on the horisontal 
    let wordV = [];  //to save all the infromation on the vertical 
    let wordArray = [];  //to save the final word array(word,points,extra points word times) 
    let c = ''; //temp variable to save this.board[i][j].tile[0].char
    let p = 0;  //temp variable to save this.board[i][j].tile[0].points;
    let s = ''; //temp variableto save this.board[i][j].special

    // CHECK HORISONTAL
    for (let i = 0; i < this.board.length; i++) {
      // CHECK VERTICAL
      for (let j = 0; j < this.board[i].length; j++) {
        // If we come across a board square that has a tile on it 
        if (this.board[i][j].tile) {

          if (i === 0 && j === 0) {
            if (!!this.board[i + 1][j].tile) {
              // Below (wordV)
              c = this.board[i][j].tile[0].char;
              p = +this.board[i][j].tile[0].points;
              s = this.board[i][j].special;
              wordV.push({ x: i, y: j, char: c, points: p, special: s });
            } else if (!!this.board[i][j + 1].tile) {
              // Beside - right (wordH)
              c = this.board[i][j].tile[0].char;
              p = +this.board[i][j].tile[0].points;
              s = this.board[i][j].special;
              wordH.push({ x: i, y: j, char: c, points: p, special: s });
            }
          } else if (j === 0 && i > 0 && i < 14) {
            if (!!this.board[i - 1][j].tile || !!this.board[i + 1][j].tile) {
              // Above and below (wordV)
              c = this.board[i][j].tile[0].char;
              p = +this.board[i][j].tile[0].points;
              s = this.board[i][j].special;
              wordV.push({ x: i, y: j, char: c, points: p, special: s });
            } else if (!!this.board[i][j + 1].tile) {
              // Beside + right (wordH)
              c = this.board[i][j].tile[0].char;
              p = +this.board[i][j].tile[0].points;
              s = this.board[i][j].special;
              wordH.push({ x: i, y: j, char: c, points: p, special: s });
            }
          } else if (j === 14 && i === 0) {
            if (!!this.board[i][j - 1].tile) {
              // Beside - left (wordH)
              c = this.board[i][j].tile[0].char;
              p = +this.board[i][j].tile[0].points;
              s = this.board[i][j].special;
              wordH.push({ x: i, y: j, char: c, points: p, special: s });
            } else if (!!this.board[i + 1][j].tile) {
              // Below (wordV)
              c = this.board[i][j].tile[0].char;
              p = +this.board[i][j].tile[0].points;
              s = this.board[i][j].special;
              wordV.push({ x: i, y: j, char: c, points: p, special: s });
            }
          } else if (j === 14 && i > 0 && i < 14) {
            if (!!this.board[i - 1][j].tile || !!this.board[i + 1][j].tile) {
              // Above and below (wordV)
              c = this.board[i][j].tile[0].char;
              p = +this.board[i][j].tile[0].points;
              s = this.board[i][j].special;
              wordV.push({ x: i, y: j, char: c, points: p, special: s });
            } else if (!!this.board[i][j - 1].tile) {
              // Beside - left (wordH)
              c = this.board[i][j].tile[0].char;
              p = +this.board[i][j].tile[0].points;
              s = this.board[i][j].special;
              wordH.push({ x: i, y: j, char: c, points: p, special: s });
            }
          } else if (j === 14 && i === 14) {
            if (!!this.board[i - 1][j].tile) {
              // Above (wordV)
              c = this.board[i][j].tile[0].char;
              p = +this.board[i][j].tile[0].points;
              s = this.board[i][j].special;
              wordV.push({ x: i, y: j, char: c, points: p, special: s });
            } else if (!!this.board[i][j - 1].tile) {
              // Beside - left (wordH)
              c = this.board[i][j].tile[0].char;
              p = +this.board[i][j].tile[0].points;
              s = this.board[i][j].special;
              wordH.push({ x: i, y: j, char: c, points: p, special: s });
            }
          } else if (i === 14 && j > 0 && j < 14) {
            if (!!this.board[i][j + 1].tile || !!this.board[i][j - 1].tile) {
              // Beside - right and left (wordH)
              c = this.board[i][j].tile[0].char;
              p = +this.board[i][j].tile[0].points;
              s = this.board[i][j].special;
              wordH.push({ x: i, y: j, char: c, points: p, special: s });
            } else if (!!this.board[i - 1][j].tile) {
              // Above (wordV)
              c = this.board[i][j].tile[0].char;
              p = +this.board[i][j].tile[0].points;
              s = this.board[i][j].special;
              wordV.push({ x: i, y: j, char: c, points: p, special: s });
            }
          } else if (i === 14 && j === 0) {
            if (!!this.board[i - 1][j].tile) {
              // Above (wordV)
              c = this.board[i][j].tile[0].char;
              p = +this.board[i][j].tile[0].points;
              s = this.board[i][j].special;
              wordV.push({ x: i, y: j, char: c, points: p, special: s });
            } else if (!!this.board[i][j + 1].tile) {
              // Beside - right (wordH)
              c = this.board[i][j].tile[0].char;
              p = +this.board[i][j].tile[0].points;
              s = this.board[i][j].special;
              wordH.push({ x: i, y: j, char: c, points: p, special: s });
            }
          } else if (i === 0 && j > 0 && j < 14) {
            if (!!this.board[i][j - 1].tile || !!this.board[i][j + 1].tile) {
              // Beside - left and right (wordH)
              c = this.board[i][j].tile[0].char;
              p = +this.board[i][j].tile[0].points;
              s = this.board[i][j].special;
              wordH.push({ x: i, y: j, char: c, points: p, special: s });
            } else if (!!this.board[i + 1][j].tile) {
              // Below (wordV)
              c = this.board[i][j].tile[0].char;
              p = +this.board[i][j].tile[0].points;
              s = this.board[i][j].special;
              wordV.push({ x: i, y: j, char: c, points: p, special: s });
            }
          } else if (j > 0 && j < 14 && i > 0 && i < 14) {
            if ((!!this.board[i - 1][j].tile || !!this.board[i + 1][j].tile) && (!!this.board[i][j + 1].tile || !!this.board[i][j - 1].tile)) {
              // All of the board exkl. the tiles around
              c = this.board[i][j].tile[0].char;
              p = +this.board[i][j].tile[0].points;
              s = this.board[i][j].special;
              wordV.push({ x: i, y: j, char: c, points: p, special: s });
              wordH.push({ x: i, y: j, char: c, points: p, special: s });
            } else if (!!this.board[i - 1][j].tile || !!this.board[i + 1][j].tile) {
              c = this.board[i][j].tile[0].char;
              p = +this.board[i][j].tile[0].points;
              s = this.board[i][j].special;
              wordV.push({ x: i, y: j, char: c, points: p, special: s });
            } else if (!!this.board[i][j + 1].tile || !!this.board[i][j - 1].tile) {
              c = this.board[i][j].tile[0].char;
              p = +this.board[i][j].tile[0].points;
              s = this.board[i][j].special;
              wordH.push({ x: i, y: j, char: c, points: p, special: s });
            } else {
              c = this.board[i][j].tile[0].char;
              p = +this.board[i][j].tile[0].points;
              s = this.board[i][j].special;
              wordH.push({ x: i, y: j, char: c, points: p, special: s });
              wordV.push({ x: i, y: j, char: c, points: p, special: s });
            }
          }
        }
      }
    }

    wordV.sort((a, b) => a.y > b.y ? -1 : 1);//sort by value of y from small to big
    wordH.sort((a, b) => a.x > b.x ? -1 : 1);//sort by value of x from small to big
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
          // Changed here. 
          // count the points
          //if there are some special box then save it to avoid count it again from next round
          if (wordV[i].special && !this.usedSpecialTiles.find(tile => (tile.x === wordV[i].x && tile.y === wordV[i].y))) {
            if ((wordV[i].special) === '2xLS') { points += 2 * wordV[i].points }
            else if ((wordV[i].special) === '3xLS') { points += 3 * wordV[i].points }
            else if ((wordV[i].special) === '2xWS') { multiple *= 2; points += wordV[i].points; }
            else if ((wordV[i].special) === '3xWS') { multiple *= 3; points += wordV[i].points; }
            else if ((wordV[i].special) === 'middle-star') {
              points += +wordV[i].points;
              //only for middle char if it is not the first word (there is a another player's score is not 0)
              //then the middle word will not be count dubble point
              let sumAllPlayerScore = 0;
              for (let k = 0; k < store.players.length; k++) {
                sumAllPlayerScore += +store.score[k].points;
              }
              if (isNaN(sumAllPlayerScore) || sumAllPlayerScore === 0) { multiple *= 2 }
              else { multiple *= 1; }
            }
            else points += +wordV[i].points;
            // save the word that have used special box
            this.usedSpecialTiles.push({ x: wordV[i].x, y: wordV[i].y });
          }
          else {
            points += +wordV[i].points;
          }
        }
        //if it is another column or if it has empty box between two char in the same column
        //then save the word to wordArray.Initialize variables in order to save the new words.
        if ((i === wordV.length - 1) || (wordV[i].y !== wordV[i + 1].y) || (wordV[i + 1].x - wordV[i].x !== 1)) {
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

          if (wordH[i].special && !this.usedSpecialTiles.find(tile => (tile.x === wordH[i].x && tile.y === wordH[i].y))) {
            if ((wordH[i].special) === '2xLS') { points += 2 * wordH[i].points; }
            else if ((wordH[i].special) === '3xLS') { points += 3 * wordH[i].points }
            else if ((wordH[i].special) === '2xWS') { multiple *= 2; points += wordH[i].points; }
            else if ((wordH[i].special) === '3xWS') { multiple *= 3; points += wordH[i].points; }
            else if ((wordH[i].special) === 'middle-star') {
              points += +wordH[i].points;
              //only for middle char if it is not the first word (there is a another player's score is not 0)
              //then the middle word will not be count dubble point
              let sumAllPlayerScore = 0;
              for (let k = 0; k < store.players.length; k++) {
                sumAllPlayerScore += +store.score[k].points;
              }
              if (isNaN(sumAllPlayerScore) || sumAllPlayerScore === 0) { multiple *= 2 }
              else { multiple *= 1; }
            }
            else points += +wordH[i].points;
            // save the word that have used special box
            this.usedSpecialTiles.push({ x: wordH[i].x, y: wordH[i].y });
          }
          else {
            points += +wordH[i].points;
          }
        }
        //if it is another row or if it has empty box between two char in the same row
        //then save the word to wordArray.Initialize variables in order to save the new words.
        if ((i === wordH.length - 1) || (wordH[i].x !== wordH[i + 1].x) || (wordH[i + 1].y - wordH[i].y !== 1)) {
          wordArray.push({ word: word, points: points, multiple: multiple, position: position })
          word = '';
          points = 0;
          multiple = 1;
          position = [];
        }
      }
    }
    //------------------------------
    this.newestWords = []
    if (store.storeCurrentWords.length !== undefined && store.storeCurrentWords.length > 0) {
      // Check if a old words exists in the wordsarray
      for (let i = 0; i < wordArray.length; i++) {
        if (store.storeOldWords.indexOf(wordArray[i].word) !== -1) {
          console.log("Old word! ", wordArray[i].word)
        } else {
          console.log("New word! ", wordArray[i].word)
          this.newestWords.push(wordArray[i])
        }
      }
      store.storeCurrentWords = this.newestWords;
    } else {
      store.storeCurrentWords = wordArray;
    }
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
      let index = 0;
      $('.playing-window-left').append(`
      <div class="playerWrapper">
      <div class="playersName">${player.name}</div>
      <div class="score">Poäng: ${player.score}</div></div>
      </div>
      <div class="tiles-box-parent-div"><div id="box${this.players.indexOf(player)}"></div></div>
      `);
      while (index < player.tiles[0].length) {
        $(`#box0`).append(`
        <div class="tiles-box" data-box="${index}"><div data-index="${index}" class="playertiles ${player.tiles[0][index].char === ' ' ? 'blankTile' : ''}">${player.tiles[0][index].char}<div class="points">${player.tiles[0][index].points || 0}</div></div>
      `);
        index++;
      }
      $(`#box0`).append(`
        <div class="tiles-box" data-box="${index}"></div>
      `);

      $('.blankTile').on('staticClick', async e => {
        let me = $(e.currentTarget);
        let index = +me.attr('data-index');
        let alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ';
        let pass = false;
        let char = '';
        do {
          char = await Modal.prompt('Skriv in en bokstav eller tryck avbryt för att markera brickan');
          if (char === null) {
            me.dblclick();
            return;
          }

          for (let i = 0; i < alphabet.length; i++) {
            if (alphabet.charAt(i) == char) {
              player.tiles[0][index].char = char.toUpperCase();
              pass = true;
            }
          }
        }
        while (!pass);
        me.html(char)
      })

      let boxIndex = 0;
      $('.playertiles').each((i, el) => {
        let $tile = $(el);
        let so = $(`.tiles-box[data-box="${boxIndex}"]`).offset(), to = $tile.offset();
        let swh = { w: $(`.tiles-box[data-box="${boxIndex}"]`).width(), h: $(`.tiles-box[data-box="${boxIndex}"]`).height() };
        let twh = { w: $tile.width(), h: $tile.height() };
        let pos = {
          left: so.left - to.left + (swh.w - twh.w) / 2.8,
          top: so.top - to.top + (swh.h - twh.h) / 2.8
        };
        $tile.css(pos);
        boxIndex++;
      });
    });
  }

  showPlayerButtons() {
    $('.tiles-from-bag').remove();
    $('.play-tiles').remove();
    $('.pass').remove();
    $('.change-tiles').remove();
    $('.help-button').remove();

    $('.board').append(
      `
      <p class= "tiles-from-bag">🎁 ${this.tilesFromBag.length}</p>
      <button class="play-tiles">Lägg brickor</button>
      <button class="pass">Stå över</button>
      <button class="change-tiles">Byt brickor</button>
      <button class="help-button">Hjälp</button>
    `);
  }

  async countPlayerScore() {
    console.log('4. --- countPLayerScore() ---')

    let currentWordPoints = 0;
    for (let i = 0; i < store.storeCurrentWords.length; i++) {
      currentWordPoints = store.storeCurrentWords[i].points * store.storeCurrentWords[i].multiple;
      this.players[0].score += +currentWordPoints;
    }
    if (this.tiles[0].length === 0) {
      this.players[0].score += 50;
      await Modal.alert('Grattis! Du fick extra 50 poäng för att du lägga alla 7 brickor en gång');
    }
    for (let i = 0; i < store.score.length; i++) {
      if (i === this.myPlayerIndexInStore) {
        store.score[i].points = this.players[0].score;
      }
    }
  }

  countingPotentialEndPoints() {
    // Always count the last tiles points in case the game is over
    let tilePointsOnRack = 0;
    this.tiles[0].map((tile) => {
      tilePointsOnRack += +tile.points;
    });
    store.scoreFromTileLeftOnRack[this.myPlayerIndexInStore] = tilePointsOnRack;

    let totalSubractedPoints = 0;
    if (this.tiles[0].length === 0) {
      for (let i = 0; i < store.scoreFromTileLeftOnRack.length; i++) {
        if (this.myPlayerIndexInStore === i) {
          continue;
        } else {
          totalSubractedPoints += +store.scoreFromTileLeftOnRack[i];
        }
      }
      store.potentialTotalScore[this.myPlayerIndexInStore] = ({ name: store.players[this.myPlayerIndexInStore], points: (store.score[this.myPlayerIndexInStore].points + totalSubractedPoints) });
    } else {
      store.potentialTotalScore[this.myPlayerIndexInStore] = ({ name: store.players[this.myPlayerIndexInStore], points: (store.score[this.myPlayerIndexInStore].points - tilePointsOnRack) });
    }
  }

  playerTurnWindow() {
    // Remove before so the player name of whos playing can be updated
    $('.not-your-turn').remove();
    $('.whos-playing').remove();

    if (store.passcounter === 3 || store.tilesFromFile.length <= 0) {
      this.endgame();
    } else if (store.players.indexOf(this.name) === store.currentPlayer) {
      $('.not-your-turn').remove();
      $('.whos-playing').remove();
    } else {
      $('.board').append(`<p class="whos-playing">${store.players[store.currentPlayer]} spelar just nu...</p>`);
      $('.playing-window').append(`<div class="not-your-turn"><div class="snowflakes" aria-hidden="true">
      <div class="snowflake">
        ❅
      </div>
      <div class="snowflake">
        ❅
      </div>
      <div class="snowflake">
        ❆
      </div>
      <div class="snowflake">
        ❄
      </div>
      <div class="snowflake">
        ❅
      </div>
      <div class="snowflake">
        ❆
      </div>
      <div class="snowflake">
        ❄
      </div>
      <div class="snowflake">
        ❅
      </div>
      <div class="snowflake">
        ❆
      </div>
      <div class="snowflake">
        ❄
      </div>
    </div>
</div>`);
    }
  }

  endgame() {
    let scoreArray = [];
    for (let i = 0; i < store.potentialTotalScore.length; i++) {
      scoreArray.push(store.potentialTotalScore[i].points);
    }
    scoreArray.sort((a, b) => b - a);

    let playerArray = [];

    for (let i = 0; i < scoreArray.length; i++) {
      for (let j = 0; j < store.potentialTotalScore.length; j++) {
        if (scoreArray[i] === store.potentialTotalScore[j].points) {
          playerArray.push({ name: store.potentialTotalScore[j].name, points: store.potentialTotalScore[j].points });
        }
      }
    }

    $('.playing-window').hide();

    $('.score-screen-container').empty();

    $('.score-screen-container').append(`
        <div class="player-table">
        <p class="scoreboard-text">⛄Scoreboard⛄</p>
        <ul class="lightrope">
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
</ul>
          <div class="player-table-inner">
          
          </div>
        </div>
      `);
    $('.player-table-inner').append(`
        <div class="scoreboard-players"></div>
        `);

    for (let i = 0; i < playerArray.length; i++) {
      $('.scoreboard-players').append(`
        <p class="scoreboard-players-text">[${i + 1}] ${playerArray[i].points} ${playerArray[i].name}</p>
        `);
    }
    $('.waiting-box').append(`
        <br>
          `);
  }

}