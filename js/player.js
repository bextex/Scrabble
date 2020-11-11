let players = []; // Array of players
let name;


function choosePlayers() {
  let numOfPlayers = document.getElementById("numOfPlayers").value; // Gets num 2, 3 and 4 from select in HTML
  //let numOfPlayers = $('select#numOfPlayers option:checked').val();
  //document.getElementById("demo").innerHTML = "You selected: " + numOfPlayers;
  console.log(numOfPlayers);
  setPlayerNames(numOfPlayers);
}

function setPlayerNames(numOfPlayers) {
  $('div#content').html(""); // Empty the div so correct number of text fields appear
  for (i = 1; i <= numOfPlayers; i++) {
    $('div#content').append(`<input type="text" id="newPlayer${i}"/>`); // Add text fields depending on how many players
  }

  $("input").keyup(function () {
    let value = $(this).val();
    $("p").text(value);

  }).keyup();

  for (i = 1; i <= numOfPlayers; i++) {
    let name = document.getElementById(`newPlayer${i}`).value;
    players.push(name);
    console.log(players);
  }

  /*
  

  players.push(value);
  console.log(players);
*/


}

/*
if (numOfPlayers === 'two_players') {
  $('div#content').append($('<input>', {
    type: 'text',
    val: 'player1'
  })
  );

  $('div#content').append('<input type="text" id="newPlayerInput"/>');
  $('div#content').append('<input type="text" id="newPlayerInput"/>');
} else if (numOfPlayers === 'three_players') {

} else {

}*/

//main UI elements

/*

const newTaskButton = document.getElementById('newPlayerButton');
const newTaskInput = document.getElementById('newPlayerInput'); // New player input (name)

const todoList = document.getElementById('players');

//models
const TodoList = function () {
  const self = this;
  self.todoList = document.getElementById('players');

  self.addTask = function (task) {
    self.todoList.appendChild(task);
  }

};

const Task = function (text) {
  const newTask = document.createElement('li');
  newTask.innerHTML = text;

  newTask.addEventListener('click', function () {
    console.log('son son son');
  });
  return newTask;
};

const todo = new TodoList();

newTaskButton.addEventListener('click', function () {
  const newTaskTextInput = newTaskInput.value;
  const newTask = new Task(newTaskTextInput);
  todo.addTask(newTask);
  players.push(newTask);
  console.log(players);
  newTaskInput.value = '';
});*/
