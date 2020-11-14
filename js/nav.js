$('.rulesBtn').click(function () {
  $('.rulesContainer').css(
    "display", "block"
  );
  console.log("clicked close");
});

$('.rulesContainer .closeRulesBtn').click(function () {
  $('.rulesContainer').css(
    "display", "none"
  );
  console.log("clicked close");
});