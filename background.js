chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript({file: "jquery-3.2.1.min.js"}, function(result) {
      //  chrome.tabs.executeScript({file: "script.js"}, function(result) {
      //  });
    });
chrome.tabs.sendMessage(tab.id, "zdev-tab-url:" + getTab());
});

function getTab()
{
  chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    return url = tabs[0].url;
});
}
