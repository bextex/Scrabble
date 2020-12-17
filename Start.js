import Game from './js/game.js';
import Board from './js/board.js';
import Network from './js/network.js';
import Modal from './js/modal.js'

export default class Start {

  // Start button
  constructor() {
    $('.start-screen').fadeOut(1700);
    $('.game-screen').fadeIn(1350);
    this.clickFunction();
  }

  async clickFunction() {
    let network = new Network();

    $('.game-menu').hide(0).delay(6000).show(0);

    $('.get-key').on('click', async function () {
      // If there isn't a name, ask the player to first type in a name
      let name = $('.newPlayerInput').val();
      if (!name) {
        await Modal.alert('Skriv in ett namn först!', 'OK');
        return;
      }
      // Fade out the 'start-side' and replace it with waiting for other players
      $('#candy').hide();
      $('.game-menu').fadeOut(250);

      let networkKey = await network.getLocalKey();
      console.log('network key is ' + networkKey);
      $('body').append(`<div class="waiting-for-players"><div class="waiting-box">Väntar på spelare...</div>
      <button class="start-new-game"><span>Starta</span></button>
      <div type="key-input" class="key-input"><span class="key">NYCKEL: ${networkKey}</span></div>
      </div>`);
      network.connectToStore(networkKey, name);
    });


    $('.set-key').on('click', async function () {
      // If there isn't a name, ask the player to first type in a name
      let name = $('.newPlayerInput').val();
      console.log('my name is' + name);
      if (!name) {
        await Modal.alert('Skriv in ett namn först!', 'OK');
        return;
      }

      // Fade out the 'start-side' and replace it with waiting for other players
      $('#candy').hide();
      $('.game-menu').fadeOut(250);

      $('body').append(`<div class="giveYourKey">
      <button class="join"><span>Gå med</span></button>
      <input type="key-input" class="key-input"><span class="key" placeholder="Skriv nyckel här"></span></input>
      <p class=write-key>Skriv nyckel här</p>
      </div>`);

      $('.join').on('click', function () {
        console.log('im clicking the join button');
        let insertedNetworkKey = $('.key-input').val();
        if (!insertedNetworkKey) {
          alert('type in a insert key');
        } else {
          console.log(insertedNetworkKey);
          network.connectToStore(insertedNetworkKey, name);
        }
        $('.giveYourKey').fadeOut(200);
        $('.playersName').fadeOut(200);
        $('.game-screen').fadeOut(200);
        $('.game-menu').fadeOut(200);
        $('.scrabble').fadeOut(200);
      });
    });
  }
}

// rules open-close 
$(document).ready(function () {
  $('.rules').click(function () {
    $('.newPlayerInput').hide();
    $('.game-menu').hide();
    $('.add-rules').animate({
      height: 'toggle'
    });
  });
  $('.close').click(function () {
    $('.add-rules').hide(150);
    $('.newPlayerInput').fadeIn(850);
    $('.game-menu').fadeIn(850);
  });

});



