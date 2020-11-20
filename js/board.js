import Game from './game.js';
import { players } from './player.js';

export default class Board {

  async start(tilesFromBag) {
    this.createBoard();
    console.log(this.board);
    this.render();
    this.showPlayers();
    this.showPlayerButtons();
    new Game(tilesFromBag);
  }

  createBoard() {
    // this.board = [...new Array(15)].map(x => new Array(15).fill({
    //   specialValue: '2w', tile: undefined
    // }));

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

    // render the board
    console.log(this.board.flat());
    $('.board').html(
      this.board.flat().map(x => `
        <div class="${x.special ? 'special-' + x.special : ''}">
          ${x.tile ? `<div class="tile">${x.tile.char}</div>` : ''}
        </div>
      `).join('')
    );


    // render the tiles
    //$('.tiles').html(
    // this.tiles.map(x => `<div>${x.char}</div>`).join('')
    //);

    // this.addEvents();

  }

  addEvents() {
    let that = this;
    console.log("HEJ HÅ HEJ HÅ", $('.playertiles').length)
    // let tile in the stands be draggable
    $('.playertiles').draggabilly({ containment: 'body' })
      .on('dragStart', function () {
        // set a high z-index so that the tile being drag
        // is on top of everything  
        $(this).css({ zIndex: 100 });
      })

    $('.board').mouseenter(e => {
      let me = $(e.currentTarget);
      if ($('.is-dragging').length && !me.find('.tile').length) {
        me.addClass('hover')
      }
    });
    $('.board > div').mouseleave(e =>
      $(e.currentTarget).removeClass('hover')
    );

    $('.playertiles').draggabilly().on('dragEnd', e => {
      // get the dropZone square - if none render and return
      let $dropZone = $('.hover');
      if (!$dropZone.length) { this.render(); return; }

      let squareIndex = $('.board > div').index($dropZone);

      // convert to y and x coords in this.board
      let y = Math.floor(squareIndex / 10);
      let x = squareIndex % 10;

      // the index of the chosen tile
      let $tile = $(e.currentTarget);
      let tileIndex = $('.tiles > div').index($tile);

      // put the tile on the board and re-render
      this.board[y][x].tile = this.tiles.splice(tileIndex, 1)[0];
      this.render();
    });












    /* .on('dragMove', function (e, pointer) {
     let { pageX, pageY } = pointer;
   })

   .on('dragEnd', function (e, pointer) {
     let { pageX, pageY } = pointer;
     let me = $(this);

     // reset the z-index
     me.css({ zIndex: '' });

     // add data-player
     // add data-title 

     let player = that.players[+me.attr('board')];
     let tileIndex = +me.attr('title');
     let tile = player.tiles[tileIndex];


     let $playertiles = me.parent('.playertiles');
     let { top, left } = $playertiles.offset();
     let bottom = top + $playertiles.height();
     let right = left + $playertiles.width();

     if (pageX > left && pageX < right
       && pageY > top && pageY < bottom) {
       let newIndex = Math.floor(8 * (pageX - left) / $playertiles.width());
       let pt = player.tiles;


       pt.splice(tileIndex, 1, ' ');
       pt.splice(newIndex, 0, tile);
       //preserve the space where the tile used to be
       while (pt.length > 8) { pt.splice(pt[tileIndex > newIndex ? 'indexOf' : 'lastIndexOf'](' '), 1); }
     }
     that.render();

   })*/
  }

  showPlayers() {
    players.forEach(player => {
      let index = 0
      $('.playing-window-left').append(`
        <div class="playername">${player.name}</div>
        <div class="tiles-box"><div id="box${players.indexOf(player)}"></div></div>
        `);
      console.log(player.tiles[0].length);
      while (index < player.tiles[0].length) {
        console.log('appending tiles');
        $(`#box${players.indexOf(player)}`).append(`
        <div class="playertiles">${player.tiles[0][index].char}<div class="points">${player.tiles[0][index].points}</div>
      `);

        index++;

      }
      $(`#box${players.indexOf(player)}`).append(`
        <div class="playertiles ${player.tiles[1][0].char === ' ' ? '' : 'none'}"></div>
        
      `);

    });
    console.log(players);
    // this.addDragEvents();
    this.addEvents();

  }

  showPlayerButtons() {
    $('.playing-window').append(
      `<button class="play-tiles">Lägg brickor</button>
      <button class="pass">Stå över</button>`
    );
  }

}

/*let $draggable = $('.draggable').draggability({

})*/