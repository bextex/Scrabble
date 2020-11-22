import Player, { players } from './player.js';
import SAOLchecker from './SAOLchecker.js';

export default class Game {

  constructor(tilesFromBag) {
    this.tilesFromBag = tilesFromBag;
    this.playerIndex = 0;
    this.start();
  }

  /* The game that will run, taking turns between players*/

  start() {
    this.playerTurn();
    // lock in word with button 'lägg brickor'
    // look up word in SAOL and count score in
    // countScores();
    // start();

    // if button 'stå över'
    // start();

  }

  async playerTurn() {

    /* Alternative to switch between players turns */

    this.player = players[this.playerIndex].name;
    this.tiles = [];

    this.tiles.push(players[this.playerIndex].tiles[0]);

    // If the players has played tiles and they have less than 7, push new tiles to their playing board

    if (this.tiles[0].length < 7) {
      let numberOfTiles = 0;
      for (let i = 0; i < 7; i++) {
        if (!this.tiles[0][i]) {
          numberOfTiles++;
        }
      }
      this.tiles.push(this.tilesFromBag.splice(0, numberOfTiles));
    }

    /* Disable all other players tile fields */

    players.forEach(player => {
      let indexOfPlayer = players.indexOf(player);
      if (this.player === player.name) {
        $(`#box${indexOfPlayer}`).show();
      } else {
        $(`#box${indexOfPlayer}`).hide();
      }
    });

    /* Change playerIndex so next player will be this.player next round */

    console.log(this.player);
    this.playerIndex++;
    if (this.playerIndex >= players.length - 1) {
      this.playerIndex = 0;
    }
    console.log(this.playerIndex);
  }

  async lettersFromFile() {
    let letters = [];
    // Read the tile info from file
    (await $.get('data/tiles.txt'))
      .split('\r').join('') // Windows safe :)
      .split('\n').forEach(x => {
        // For each line split content by ' '
        // x[0] = char, x[1] = points, x[2] = occurences
        x = x.split(' ');
        x[0] = x[0] === '_' ? ' ' : x[0];
        // add tiles to this.tiles
        letters.push({ char: x[0], points: +x[1] });
      });
    return letters;
  }

  async countScore() {

    let wordsToCheck = [
      'silkscreen', // false (two words),
      'Ecuador', // true
      'Malmö', // true
      'nerd',  // false (does not exist in SAOL)
      'nörd',  // true
      'zoo', // true,
      'programmerare', // true
      'utvecklaren', // false (not grundform),
      'renomme', // true (ignore accents)
      'bh', // true (alternate version of grundform),
      'kvalite', // true (alternate version + ignore accents),
      'sprang' // false (not grundform),
    ].map(x => x.toUpperCase());

    //read the file to the array
    let letters = await this.lettersFromFile();

    for (let word of wordsToCheck) {
      if (await SAOLchecker.scrabbleOk(word) === false) {
        $('body').append('<div class="boxForWord"><span class="word">' +
          word + '</span><hr>ok in Scrabble: ' +
          // check if ok scrabble words
          // by calling await SAOLchecker.scrabbleOk(word)
          await SAOLchecker.scrabbleOk(word) + '<hr>' +
          // add explanations/entries from SAOL in body
          // by using await SAOLchecker.lookupWord(word)
          // (maybe fun to show in scrabble at some point?)
          await SAOLchecker.lookupWord(word) + '</div');
        continue;
      }
      if (await SAOLchecker.scrabbleOk(word)) {
        $('body').append(`<div class="boxForWord" id="${word}-box"><span class="word">` +
          word + `</span><hr>ok in Scrabble: ` +
          // check if ok scrabble words
          // by calling await SAOLchecker.scrabbleOk(word)
          await SAOLchecker.scrabbleOk(word) + '<hr>');
        let wordPoints = 0;
        for (let i = 0; i < word.length; i++) {
          let letterInWord = word.charAt(i);
          //find the letters points          
          let letterPoints = letters
            // get char
            .filter(letter => letter.char === letterInWord)
            // get their points
            .map(letter => letter.points);
          let points = letterPoints[0];
          wordPoints += points;
        }
        $(`#${word}-box`).append(`<div><span class = "points"></span><hr> points: ${wordPoints}<hr>` +
          // add explanations/entries from SAOL in body
          // by using await SAOLchecker.lookupWord(word)
          // (maybe fun to show in scrabble at some point?)
          await SAOLchecker.lookupWord(word) + '</div');
      }

    }

  }
}