import Store from 'https://network-lite.nodehill.com/store';

export default class Chat {

  constructor() {
    this.start();
  }

  async start() {

    // Get the localStore (an object that survives between page loads)
    this.localStore = Store.getLocalStore();

    // If no name has been stored ask for a name
    /* commented out this. Chat should work when you enter your name
       in game-screen (or game-menu (don't really remember)).
       And after players entered their names and started the game,
       they should be able to enter chat ( like join game )
        ( game-host starts a new game ---> other player joins ---> 
          ---> other players can connect to game-chat)
    */
    //this.localStore.name = this.localStore.name || prompt('Ditt namn?');

    // If we have stored a network key - then connect to that chat
    if (this.localStore.networkKey) {
      await this.connectToChat(this.localStore.networkKey);
    }

    // Remember the index of the last rendered message
    this.lastRenderedMessage = 0;

    // Render the GUI
    this.render();
  }

  async connectToChat() {

    // The network key we have in our localStore
    let key = this.localStore.networkKey;

    // Get the network store 
    // and setup a listener to changes from others
    // (an object shared between all clients in the network)
    this.networkStore = await Store.getNetworkStore(key, () => {
      // listener on changes from others in the network
      this.renderMessages();
    });

    // Something went wrong (propably: the key was incorrect)
    if (this.networkStore.error) {
      console.log('Could not connect!', this.networkStore.error);
      delete this.networkStore;
      delete this.localStore.networkKey;
    }
    // We are connected
    else {
      // If there is not a property messages in the network store
      // add it a let the value be an empty array
      this.networkStore.messages = this.networkStore.messages || [];
    }

    // Render the GUI
    this.render();
  }

  render() {
    // Render the whole GUI to screen
    let messages = this.networkStore && this.networkStore.messages;
    // commented out ---> $('body').empty().append(/*html*/

    // Added this instead: 
    $('body').append(/*html*/`
      <header>
        <button class="new">Starta en ny chatt</button>
        <button class="connect">Anslut till en chatt</button>
        <span class="key">${this.localStore.networkKey || ''}</span>
      </header>
       <main>
        ${!messages ? '<p>No active chat</p>' : ''}
      </main>
      ${!messages ? '' : `
        <footer>
          <form>
            <span class="name">${this.localStore.name}:</span>
            <input type="text" placeholder="Ditt meddelande">
          </form>
        </footer>
      `}
    `);
    messages && this.renderMessages();
    this.addEvents();
  }

  renderMessages() {
    // Just render new messages to screen
    this.networkStore.messages.slice(this.lastRenderedMessage)
      .map(({ sender, text }) =>
        $('main').append(/*html*/`
        <div class="message">
          <span class="sender">${sender}:</span>
          <span class="text">${text}</span>
        </div>
      `));
    this.lastRenderedMessage = this.networkStore.messages.length;
    // Scroll to the bototm of the screen
    window.scrollTo(0, 1000000);
  }

  addEvents() {
    // If the user clicks the Connect button ask for network key
    $('.connect').click(() => {
      this.localStore.networkKey = prompt('Ange chattens kod:');
      this.connectToChat();
    });

    // If the users clicks the New button ask create a new network key,
    // store it in the localStore and then connect to the chat
    $('.new').click(async () => {
      this.localStore.networkKey = await Store.createNetworkKey();
      this.connectToChat();
    });

    // If the user submits the form = enters a message + ENTER
    // add that message to the networkStore.messages array
    // and then render the messages again...
    $('form').submit(e => {
      e.preventDefault();
      let text = $('input').val();
      $('input').val('');
      this.networkStore.messages.push({ sender: this.localStore.name, text });
      this.renderMessages();
    });
  }

}