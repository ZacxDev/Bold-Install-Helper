
var app_names = {
  ro: "Recurring Orders",
  qb: "Quantity Breaks",
  po: "Product Options"
}

updatePage();

function updatePage()
{
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
}

function loadMissingCodeListeners()
{
  $(document).on('click', '.missing-code-file-item', function() {
    $('.selected').removeClass('selected');
    $(this).addClass('selected');
    updateCodePane();
  });
}

function getApp(callback) {
  chrome.runtime.sendMessage({command: "getapp"}, function(response) {
    chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
        callback(request.app);
      });
    });
}
