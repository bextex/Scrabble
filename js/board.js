export default class Board {

  async start() {
    this.createBoard();
    console.log(this.board);
    this.render();
  }

  createBoard() {
    this.board = [...new Array(15)].map(x => new Array(15).fill({
      specialValue: '2w', tile: undefined
    }));
  }

  render() {
    $('.board').remove();
    let $board = $('<div class="board"/>').appendTo('body');
    this.board.flat().forEach(x => $board.append('<div/>'));

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