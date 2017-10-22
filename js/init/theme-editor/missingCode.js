
var app_names = {
  ro: "Recurring Orders",
  qb: "Quantity Breaks",
  po: "Product Options"
}

updatePage();

function updatePage()
{
  // hide the snippet viewer pane
  $('.snip-view-pane-fade').hide();
  loadMissingCodeListeners();

  getApp(function(appname) {
    $('.missing-code-files-title h2').text(app_names[appname]);
  });

  var fileItem;
  $.each(roFiles, function(index, value) {
    fileItem = $('<div class="missing-code-file-item"><p>{file.title}</p></div>');
    fileItem.appendTo($('.missing-code-files'));
    fileItem.find('p').text(value);
  });

  $('.missing-code-file-item').first().addClass('selected');
  updateCodePane();
}

function updateCodePane()
{
  $('.missing-code-pane h1').text($('.selected p').text());

  var fileName = $('.selected p').text();
  fileName = fileName.substring(fileName.indexOf('/') + 1, fileName.indexOf('.'));

  $('.missing-code-snippet').remove();
  var snipItem;
  $.each(roSnips[fileName], function(key, value) {
    snipItem = $('<div class="missing-code-snippet" data-code="' + value + '"><h3>{snippet.title}</h3><div class="snip-buttons"><div class="snip-view"><img src="https://cdn2.iconfinder.com/data/icons/flat-ui-icons-24-px/24/eye-24-512.png" /></div><div class="snip-copy"><img src="https://d30y9cdsu7xlg0.cloudfront.net/png/340540-200.png" /></div></div</div>');
    snipItem.find('h3').text(key);
    snipItem.appendTo($('.missing-code-pane'));
  });

}

function loadMissingCodeListeners()
{
  $(document).on('click', '.missing-code-file-item', function() {
    $('.selected').removeClass('selected');
    $(this).addClass('selected');
    updateCodePane();
  });

  $(document).on('click', '.snip-view-pane', function(e) {
    e.stopPropagation();
  });

  $(document).on('click', '.snip-view-pane-fade', function() {
    $('.snip-view-pane-fade').hide();
  });

  $(document).on('click', '.snip-view', function() {
    $('.current-snip').removeClass('current-snip');
    $(this).closest('.missing-code-snippet').addClass('current-snip');
    $('.snip-view-pane-fade').show();
    updateSnipViewPane();
  });
}

function updateSnipViewPane()
{
  var snip = $('.current-snip');
  $('.snip-view-pane h1').text(snip.find('h3').text());
  $('.snip-view-pane p').text(snip.data('code'));
}

function getApp(callback) {
  chrome.runtime.sendMessage({command: "getapp"}, function(response) {
    chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
        callback(request.app);
      });
    });
}
