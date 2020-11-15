$('.addPlayersBtn').click(function () {
  $('.addPlayersContainer').css({
    "display": "block"
  })
  console.log("clicked addPlayers");
})


$('.rulesBtn').click(function () {
  $('.rulesContainer').css(
    "display", "block"
  );
  console.log("clicked rulesBtn");
});

$('.rulesContainer .closeRulesBtn').click(function () {
  $('.rulesContainer').css(
    "display", "none"
  );
  console.log("clicked close");
});

