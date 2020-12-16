import Store from 'https://network-lite.nodehill.com/store';
import Start from '../Start.js';
import Game from './game.js';
import Player from './player.js';
import Bag from './bag.js';
import Modal from './modal.js';


export let store;
// export let playerIndex_new;

export default class Network {

  constructor() {

    localStorage.clear();
    this.localStore = Store.getLocalStore();
    // this.tilesFromBag = tilesFromBag;



    // this.start();
  }


  async getLocalKey() {
    this.localStore.networkKey = await Store.createNetworkKey();
    return this.localStore.networkKey;
  }

  // setLocalKey() {
  //   return this.connectToChat();
  // }

  async connectToStore(networkKey, playerName) {

    // Put name in this localStore.name and then make it more accessable with local name
    this.localStore.name = playerName;
    let name = this.localStore.name;

    let bag = new Bag();
    this.tilesFromFile = await bag.tilesFromFile();

    let game = new Game();

    // this.networkKey is either a created key or a inserted key
    this.networkKey = networkKey;
    this.networkStore = await Store.getNetworkStore(this.networkKey,
      () => this.listenForNetworkChanges(game));
    console.log(this.networkStore);

    // Shorten the variable name to a shorter one for shorter code
    let s = this.networkStore;
    store = s;

    s.passcounter = 0;
    s.playercount = 0;

    // We want the network to listen for which players connecting to the same game (same game key)
    s.players = s.players || [];
    s.score = s.score || [];
    s.scoreFromTileLeftOnRack = s.scoreFromTileLeftOnRack || [];
    s.potentialTotalScore = s.potentialTotalScore || [];

    s.storeOldWords = s.storeOldWords || [];
    s.storeCurrentWords = s.storeCurrentWords || 0;

    s.currentPlayer = 0;

    s.tilesFromFile = s.tilesFromFile || this.tilesFromFile;

    s.board = s.board || game.createBoard();
    console.log(s.board);

    // We want to listen for which player is the one currently playing
    // s.currentPlayer = s.currentPlayer || game.playerIndex;
    console.log('Current player has index:', s.currentPlayer);
    console.log('The playercount is', s.playercount)

    // We want to if we're not in the same game anymore
    // s.game = s.game || game;
    // console.log(s.game);


    // Which player index am I? (0, 1, 2 or 3?)
    this.playerIndexInNetwork = s.players.length;
    console.log('My index is ' + this.playerIndexInNetwork);



    // Add my name to s.players array
    s.players.push(name);
    console.log('my name is ' + name);
    console.log(s.players);

    s.score.push({ name: name, score: 0 });

    // For all players except the one starting the game will need a render of the board

    // game.start();
    console.log('The current player is ' + s.players[s.currentPlayer]);

    // This should only be at the beginning when joining a game
    // if (s.players.length > 1) {
    //   this.game.start();
    //   $('.playing-window-left').append(`<div class="not-your-turn">Vänta på att spelet ska starta</div>`);
    // }


    // s.game = s.game || game;


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

    console.log('----------------------we are less than 2')
  }



  listenForNetworkChanges(game) {
    let s = this.networkStore;
    // let name = this.localStore.name;

    console.log('This count as a network change');
    // s.currentPlayer = this.playerIndexInNetwork;
    // let currentPlayerName = s.players[s.currentPlayer];


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

    // let game = s.game;

    console.log('Current players index:', s.currentPlayer);
    console.log('Its ' + s.players[s.currentPlayer] + 's turn');
    console.log('My playerindex in store:', this.playerIndexInNetwork);
    console.log('Should I render?', (s.currentPlayer === this.playerIndexInNetwork))
    if (!$('.waiting-box').length && s.currentPlayer === this.playerIndexInNetwork) {
      // game.playerTurn();
      game.board = s.board;
      game.tilesFromBag = s.tilesFromFile;
      game.storeOldWords = s.storeOldWords;
      game.storeCurrentWords = s.storeCurrentWords;
      // if (s.passcounter === 3) {
      //   game.endgame();
      // }
      // console.log('From network, what is s.passcounter', s.passcounter);


      game.render();
    } else if (!$('.waiting-box').length) {
      $('.playing-window').empty();
      if (store.players.indexOf(this.name) === store.currentPlayer) {
        $('.not-your-turn').remove();
      } else {
        //this.render();
        $('.playing-window').append(`<div class="not-your-turn"><p>${store.players[store.currentPlayer]} spelar just nu...</p></div>`);
      }
    }
  }
}








