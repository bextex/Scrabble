export default class Modal {

  //The alert function
  static async alert(message, okMessage = 'OK',) {
    // Use the prompt method with type = alert
    return await this.prompt(message, okMessage, false, 'alert');
  }

  //The confirm function
  static async confirm(message, okMessage = 'OK', cancelMessage = 'Cancel') {
    // Use the prompt method with type = confirm
    return await this.prompt(message, okMessage, cancelMessage, 'confirm');
  }

  //The input function
  static async prompt(message, okMessage = 'OK', cancelMessage = 'Cancel', type = 'prompt') {
    // Add html for modal
    $('body').append(`
      <div class="modal">
        <div class="hider"></div>
        <div class="box">
          <p>${message}</p>
          ${type === 'prompt' ? `<input type="text">` : ''}
          <button class="ok-btn">${okMessage}</button>
          ${type !== 'alert' ? `<button class="cancel-btn">${cancelMessage}</button>` : ''}
        </div>
      </div>
    `);
    return await this.open();
  }

  static open() {
    // Fade in during 500 ms
    $('.modal').fadeIn(500);
    // Create a promise and return it
    // this means that any method the awaits alert
    // will wait until we call the resolve method
    let resolve, promise = new Promise(r => resolve = r);
    $('.modal .ok-btn').click(() => {
      this.toReturn = $('.modal input').length ? $('.modal input').val() : true;
      this.close();
    });
    $('.modal .cancel-btn').click(() => {
      this.toReturn = $('.modal input').length ? null : false;
      this.close();
    });
    $('.modal input').keyup(e => e.key === 'Enter' && $('.modal .ok-btn').click());
    this.resolve = resolve;
    return promise;
  }

  static async close() {
    // Fade out during 1000 ms
    await $('.modal').fadeOut(500, () => {
      // Remove modal and resolve promise
      $('.modal').remove();
      this.resolve(this.toReturn);
    });
  }

  static sleep(ms) {
    // Sleep for a number of ms (if called with await)
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}


//------HUR MAN KALLAR POPUP WINDOW------------//
//await Modal.alert('I like JavaScript!', 'Yeah!');
//console.log('You clicked OK - the only way to get out of the alert');
//^^^^^^^^^^^^^^The statement above will create a simple popup with a 'Yeah' button that closes it

//  let likes = await Modal.confirm('Do you like JavaScript?', 'Sure!', 'No - what a silly language!');
//console.log('You like JS', likes);
//^^^^^^^^^^^^^^The statement above will create a question and two buttons, one for true and one for false. Will save boolean to "likes" variable.

//let answer = await Modal.prompt('What do you think about JavaScript?');
//console.log('You answered', answer);
//^^^^^^^^^^^^^^The statement above will show a text then let you input text and save the input to the 'answer' variable.

//--------REMEMBER, USE ASYNC IN THE FUNCTION TO BE ABLE TO AWAIT.--------------//