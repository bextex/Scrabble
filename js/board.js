export default class Board {

  async start() {
    this.createBoard();
    console.log(this.board);
    this.render();
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
    // $('.tiles').html(
    //   this.tiles.map(x => `<div>${x.char}</div>`).join('')
    // );

  }

}
// nav
$('nav .rulesBtn').click(function () {
  $('.rulesContainer').css(
    "display", "block"
  );
});

$('.rulesContainer .closeRulesBtn').click(function () {
  $('.rulesContainer').css(
    "display", "none"
    // "height": "0",
    // "width": "0"
  );
});

