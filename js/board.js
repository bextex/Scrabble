
// nav
$('nav .rulesBtn').click(function () {
  $('.rulesContainer').css(
    "display", "block"
  );
});

$('.rulesContainer .closeRulesBtn').click(function () {
  $('.rulesContainer').css(
    "display", "none"
    // "height": "0",
    // "width": "0"
  );
});