
updatePage();

function updatePage()
{
  getApp(function(appname) {
    debugger;
    $('.missing-code-pane h1').text(appname);
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
