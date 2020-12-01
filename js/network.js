import Store from 'https://network-lite.nodehill.com/store';
import Start from '../Start.js';


export default class Network {

  constructor() {

    this.localStore = Store.getLocalStore();

    // this.start();
  }

  async start() {
    // Get the localStore (the object that survives between page loads)
    this.localStore = Store.getLocalStore();

    // If no name has been stored, ask for a name
    // this.localStore.name = this.localStore.name || prompt('Ditt namn?');
    this.localStore.name = this.localStore.name
    // prompt('Ditt namn är ' + this.localStore.name);

    if (this.localStore.networkKey) {
      await this.connectToChat(this.localStore.networkKey);
    }

    // Remember the index of the last rendered game???
    this.lastRenderedMessage = 0;

    // Render the GUI
    this.render();
  }

  async connectToChat() {
    // The local key we have in our localStore
    let key = this.localStore.networkKey;

    // Get the network store 
    // and set up a listener to changes from others 
    // (an object shared between all clients in the network)
    this.networkStore = await Store.getNetworkStore(key, () => {
      // Maybe render the board in our case?
      this.renderMessages();
    });

    // Something went wrong (probably: the key was incorrect)
    if (this.networkStore.error) {
      console.log('Could not connect!', this.networkStore.error);
      delete this.networkStore;
      delete this.localStore.networkKey;
    }
    // We're connected
    else {
      // If there is not a property messages in the network store
      // add it and let the value be an empty array

      // Maybe game here for us? or both game and messages if we have a chat
      this.networkStore.messages = this.networkStore.messages || [];
    }

    // Render the GUI 
    this.render();
  }

  // render() {
  //   // Render the whole GUI to screen
  //   let messages = this.networkStore && this.networkStore.messages;
  //   $('body').empty().append(/*html*/ `
  //   <header>
  //     <button class="new-game">Nytt spel</button>
  //     <button class="connect-to-game">Anslut till spel</button>
  //     <span class="key">${this.localStore.networkKey || ''}</span>
  //   </header>
  //   <main>
  //   ${!messages ? '' : `
  //   <footer>
  //     <form> 
  //       <span class="name">${this.localStore.name}:</span>
  //       <input type="text" placeholder="Ditt meddelande">
  //     </form>
  //   </footer>
  //   `} 
  //   `);
  //   messages && this.renderMessages();
  //   this.addEvents();
  // }

  renderMessages() {
    // Just render a new message to screen
    this.networkStore.messages.slice(this.lastRenderedMessage)
      .map(({ sender, text }) =>
        $('main').append(/*html*/ `
          <div class="message">
          <span class="sender">${sender}:</span>
          <span class="text">${text}</span>
          </div>
        `));
    this.lastRenderedMessage = this.networkStore.messages.length;
    // Scroll to the bottom of the screen
    window.scrollTo(0, 100000);
  }

  addEvents() {
    // If the user click on the Connect button ask for network key
    // $('.connect-to-game').click(() => {
    //   this.localStore.networkKey = prompt('Ange chattens kod:');
    //   this.connectToChat();
    // });

    // // If the user clicks on the New Game button ask to create a new network key,
    // // store it in the localStore and then connect to the chat 
    // $('.new-game').click(async () => {
    //   this.localStore.networkKey = await Store.createNetworkKey();
    //   this.connectToChat();
    // });

    // If the user submits the form = enters a message + ENTER 
    // add that message to the networkStore.messages array
    // and then render the messages again...
    $('.form').submit(e => {
      e.preventDefault();
      let text = $('.input').val();
      $('.input').val('');
      this.networkStore.messages.push({ sender: this.localStore.name, text });
      this.renderMessages();
    });
  }

  async getLocalKey() {
    this.localStore.networkKey = await Store.createNetworkKey();
    return this.localStore.networkKey;
  }

  setLocalKey() {
    return this.connectToChat();
  }

}

