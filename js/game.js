import Player, { players } from './player.js';
import SAOLchecker from './SAOLchecker.js';

export default class Game {

  async playerTurn() {
    for (let playerIndex = 0; playerIndex < players.length; playerIndex++) {
      let currentPlayer = players[playerIndex];
      console.log("- - - >" + currentPlayer.name + "'s Turn < - - -")
    }

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