import Store from 'https://network-lite.nodehill.com/store';
import Start from '../Start.js';
import Game from './game.js';
import Player from './player.js';
import Bag from './bag.js';


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

    // We want the network to listen for which players connecting to the same game (same game key)
    s.players = s.players || [];
    s.score = s.score || [];
    // s.storeOldWords = s.storeOldWords || [];

    s.currentPlayer = 0;

    s.tilesFromFile = s.tilesFromFile || this.tilesFromFile;

    s.board = s.board || game.createBoard();
    console.log(s.board);

    // We want to listen for which player is the one currently playing
    // s.currentPlayer = s.currentPlayer || game.playerIndex;
    console.log('Current player has index:', s.currentPlayer);

    // We want to if we're not in the same game anymore
    // s.game = s.game || game;
    // console.log(s.game);


    // Which player index am I? (0, 1, 2 or 3?)
    this.playerIndexInNetwork = s.players.length;
    console.log('My index is ' + this.playerIndexInNetwork);



    // Add my name to s.players array

    // ÄNDRA DENNA
    s.players.push(name);
    s.score.push(0);
    console.log('my name is ' + name);
    console.log(s.players);

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
      game.start(name);
    }

    // The player that gets a game-key is the only player that can start the game,
    // because they are the only one with the start-button



    $('.start-new-game').on('click', function () {
      console.log('im clicking the start button');

      // remove the waiting box so it doesn't append in listen for network changes
      $('.waiting-for-players').remove();

      $('.playersName').fadeOut(200);
      $('.game-screen').fadeOut(200);
      $('.game-menu').fadeOut(200);
      $('.scrabble').fadeOut(200);

      // game.start();
      game.start(name);
    });
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
      // game.storeOldWords = s.storeOldWords;
      game.render();
    }

  }




  // async start() {
  //   // Get the localStore (the object that survives between page loads)
  //   this.localStore = Store.getLocalStore();

  //   // If no name has been stored, ask for a name
  //   // this.localStore.name = this.localStore.name || prompt('Ditt namn?');
  //   this.localStore.name = this.localStore.name
  //   // prompt('Ditt namn är ' + this.localStore.name);

  //   if (this.localStore.networkKey) {
  //     await this.connectToChat(this.localStore.networkKey);
  //   }

  //   // Remember the index of the last rendered game???
  //   this.lastRenderedMessage = 0;

  //   // Render the GUI
  //   this.render();
  // }

  // async connectToChat() {
  //   // The local key we have in our localStore
  //   let key = this.localStore.networkKey;

  //   // Get the network store 
  //   // and set up a listener to changes from others 
  //   // (an object shared between all clients in the network)
  //   this.networkStore = await Store.getNetworkStore(key, () => {
  //     // Maybe render the board in our case?
  //     this.renderMessages();
  //   });

  //   // Something went wrong (probably: the key was incorrect)
  //   if (this.networkStore.error) {
  //     console.log('Could not connect!', this.networkStore.error);
  //     delete this.networkStore;
  //     delete this.localStore.networkKey;
  //   }
  //   // We're connected
  //   else {
  //     // If there is not a property messages in the network store
  //     // add it and let the value be an empty array

  //     // Maybe game here for us? or both game and messages if we have a chat
  //     this.networkStore.messages = this.networkStore.messages || [];
  //   }

  //   // Render the GUI 
  //   this.render();
  // }

  // // render() {
  // //   // Render the whole GUI to screen
  // //   let messages = this.networkStore && this.networkStore.messages;
  // //   $('body').empty().append(/*html*/ `
  // //   <header>
  // //     <button class="new-game">Nytt spel</button>
  // //     <button class="connect-to-game">Anslut till spel</button>
  // //     <span class="key">${this.localStore.networkKey || ''}</span>
  // //   </header>
  // //   <main>
  // //   ${!messages ? '' : `
  // //   <footer>
  // //     <form> 
  // //       <span class="name">${this.localStore.name}:</span>
  // //       <input type="text" placeholder="Ditt meddelande">
  // //     </form>
  // //   </footer>
  // //   `} 
  // //   `);
  // //   messages && this.renderMessages();
  // //   this.addEvents();
  // // }

  // renderMessages() {
  //   // Just render a new message to screen
  //   this.networkStore.messages.slice(this.lastRenderedMessage)
  //     .map(({ sender, text }) =>
  //       $('main').append(/*html*/ `
  //         <div class="message">
  //         <span class="sender">${sender}:</span>
  //         <span class="text">${text}</span>
  //         </div>
  //       `));
  //   this.lastRenderedMessage = this.networkStore.messages.length;
  //   // Scroll to the bottom of the screen
  //   window.scrollTo(0, 100000);
  // }

  // addEvents() {
  //   // If the user click on the Connect button ask for network key
  //   // $('.connect-to-game').click(() => {
  //   //   this.localStore.networkKey = prompt('Ange chattens kod:');
  //   //   this.connectToChat();
  //   // });

  //   // // If the user clicks on the New Game button ask to create a new network key,
  //   // // store it in the localStore and then connect to the chat 
  //   // $('.new-game').click(async () => {
  //   //   this.localStore.networkKey = await Store.createNetworkKey();
  //   //   this.connectToChat();
  //   // });

  //   // If the user submits the form = enters a message + ENTER 
  //   // add that message to the networkStore.messages array
  //   // and then render the messages again...
  //   $('.form').submit(e => {
  //     e.preventDefault();
  //     let text = $('.input').val();
  //     $('.input').val('');
  //     this.networkStore.messages.push({ sender: this.localStore.name, text });
  //     this.renderMessages();
  //   });
  // }




}

