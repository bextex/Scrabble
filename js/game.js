import Player, { players } from './player.js';
import SAOLchecker from './SAOLchecker.js';
import { copyOfBoard } from './board.js';

export default class Game {

  constructor(tilesFromBag) {
    this.tilesFromBag = tilesFromBag;
    this.playerIndex = 0;
    this.lettersFromFile();
    this.start();
  }

  /* The game that will run, taking turns between players*/

  start() {
    this.playerTurn();
    // lock in word with button 'lägg brickor'
    // look up word in SAOL and count score in
    // countScores();
    // start();

    $('.pass').click(() => {
      this.playerTurn();
    });

    // if button 'stå över'
    // start();

  }

  async playerTurn() {

    // for (let playerIndex = 0; playerIndex < players.length; playerIndex++) {
    //   let currentPlayer = players[playerIndex];
    //   console.log("- - - >" + currentPlayer.name + "'s Turn < - - -")
    //   // add function calls
    //   // ex: countScore(currentPLayer)
    // }

    /* Change playerIndex so next player will be this.player next round */

    console.log('player name ' + this.player);
    console.log('current index ' + this.playerIndex);
    console.log('player array length ' + players.length);


    // If player index is more och equal to player array length then go back to index 0
    if (this.playerIndex >= players.length) {
      this.playerIndex = 0;
    }



    /* Alternative to switch between players turns */

    // Set this.player to the player with playerindex in players array
    // so this.player will be the new player each round
    this.player = players[this.playerIndex].name;
    this.tiles = [];

    // set this.tiles to the current players tiles
    this.tiles.push(players[this.playerIndex].tiles[0]);

    // If the players has played tiles and they have less than 7, push new tiles to their playing board
    console.log(this.tiles[0].length);
    console.log(this.tiles[0]);
    if (this.tiles[0].length < 7) {
      let numberOfTiles = 0;
      for (let i = 0; i < 7; i++) {
        if (!this.tiles[0][i]) {
          numberOfTiles++;
        }
      }
      // Push new tiles to the this.tiles, take so many from bag that the player needs,
      // gets determined in loop above
      this.tiles.push(this.tilesFromBag.splice(0, numberOfTiles));
    }

    /* Disable all other players tile fields */

    for (let i = 0; i < players.length; i++) {
      if (this.player === players[i].name) {
        console.log(`#box${players.indexOf(players[i])} ska visas`);
        $(`#box${players.indexOf(players[i])}`).show();
      } else {
        console.log(`#box${players.indexOf(players[i])} ska inte visas`);
        $(`#box${players.indexOf(players[i])}`).hide();
      }
    }

    // let currPlayer = this.player;
    // players.forEach((p) => {
    //   let indexOfPlayer = players.indexOf(p);
    //   console.log('loopar igenom vilka fält som ska synas, index just nu ' + indexOfPlayer);
    //   console.log(currPlayer + ' in for each loop');
    //   if (currPlayer === p.name) {
    //     console.log(`#box${indexOfPlayer} ska visas`);
    //     $(`#box${indexOfPlayer}`).show();
    //   } else {
    //     console.log(`#box${indexOfPlayer} ska inte visas`);
    //     $(`#box${indexOfPlayer}`).hide();
    //   }
    // });

    // Inrease player index so when new round, the next player will this.player
    this.playerIndex++;
    console.log('new index ' + this.playerIndex);

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