import Store from 'https://network-lite.nodehill.com/store';
import Game from './game.js';
import Bag from './bag.js';

export let store;

export default class Network {

  constructor() {
    localStorage.clear();
    this.localStore = Store.getLocalStore();
  }

  async getLocalKey() {
    this.localStore.networkKey = await Store.createNetworkKey();
    return this.localStore.networkKey;
  }

  async connectToStore(networkKey, playerName) {
    // Put name in this localStore.name and then make it more accessable with local name
    this.localStore.name = playerName;
    let name = this.localStore.name;

    // Get the tiles from bag
    let bag = new Bag();
    this.tilesFromFile = await bag.tilesFromFile();

    // Create a new game
    let game = new Game();

    // this.networkKey is either a created key or a inserted key
    this.networkKey = networkKey;
    this.networkStore = await Store.getNetworkStore(this.networkKey,
      () => this.listenForNetworkChanges(game));
    console.log(this.networkStore);

    // Shorten the variable name to a shorter one for shorter code
    let s = this.networkStore;
    store = s;

    // If players pass or change tiles 3x in a row - the game end
    s.passcounter = 0;
    s.playercount = 0;

    // The name of the players
    s.players = s.players || [];
    // The score of the players with name
    s.score = s.score || [];
    // The score from the current tiles the player have on rack
    s.scoreFromTileLeftOnRack = s.scoreFromTileLeftOnRack || [];
    // The potential score if counting with the rules of rack-tiles after game end
    s.potentialTotalScore = s.potentialTotalScore || [];
    // The words that have been played on board
    s.storeOldWords = s.storeOldWords || [];
    // The currentWords playing on board
    s.storeCurrentWords = s.storeCurrentWords || 0;
    // Currentplayer when game starts
    s.currentPlayer = 0;
    // The tiles from file save as a listener variable to be shared between players
    s.tilesFromFile = s.tilesFromFile || this.tilesFromFile;
    // The playing board
    s.board = s.board || game.createBoard();

    // We want to listen for which player is the one currently playing
    // s.currentPlayer = s.currentPlayer || game.playerIndex;
    console.log('Current player has index:', s.currentPlayer);
    console.log('The playercount is', s.playercount)

    // Which player index am I? (0, 1, 2 or 3?)
    this.playerIndexInNetwork = s.players.length;

    // Add my name to s.players array
    s.players.push(name);
    // Add name and score to score
    s.score.push({ name: name, points: 0 });

    console.log('The current player is ' + s.players[s.currentPlayer]);

    // For all players except the one that starts
    if (s.players.length > 1) {
      game.start(name, this.playerIndexInNetwork);
    }

    // The player that gets a game-key is the only player that can start the game,
    // because they are the only one with the start-button
    let that = this;

    $('.start-new-game').on('click', async function () {

      // if (s.players.length > 1 && s.players.length < 5) {
      console.log('im clicking the start button');

      // remove the waiting box so it doesn't append in listen for network changes
      $('.waiting-for-players').remove();

      $('.playersName').fadeOut(200);
      $('.game-screen').fadeOut(200);
      $('.game-menu').fadeOut(200);
      $('.scrabble').fadeOut(200);

      // game.start();
      game.start(name, that.playerIndexInNetwork);
      // }
      // else if (s.players.length == 1 || s.players.length <= 5) {
      //   await Modal.alert('Det måste vara minst 2 spelare och högst 4 för att starta ett spel', 'Stäng');
      //   // alert('This is a modal');
      // }
    });
  }



  listenForNetworkChanges(game) {
    let s = this.networkStore;
    console.log('This count as a network change');

    // Append a waiting box for the game starter to know who and how many players are joining
    if ($('.waiting-for-players').length) {
      $('.waiting-box').empty();
      for (let i = 1; i < s.players.length; i++) {
        console.log('there are currently ' + s.players.length + ' players in player array');
        $('.waiting-box').append(`
        <br>
          ${s.players[i]} har joinat spelet</br>
          `);
        s.playercount++;
      }
    }
    console.log('Its ' + s.players[s.currentPlayer] + 's turn');
    if (!$('.waiting-box').length) {
      game.board = s.board;
      game.tilesFromBag = s.tilesFromFile;
      game.storeOldWords = s.storeOldWords;
      game.storeCurrentWords = s.storeCurrentWords;
      game.render();
    }
  }
}








