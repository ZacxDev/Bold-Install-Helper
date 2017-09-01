
var url;

chrome.runtime.onMessage.addListener(
function(request, sender, sendResponse) {

  if (request.command == "geturl")
    sendResponse({url: sender.tab.url + ""});
  else if (request.command == "init")
    {
      url = sender.tab.url;

      switch(true) {
        case (url.indexOf('myshopify.com/admin/auth/recover') != -1):
          loadRecoverButtons(sender.tab);
          break;
        case (url.indexOf("recurring_settings/product_recurring") != -1 || url.indexOf('subscription_box_settings/box_settings/')):
          loadROWidget(sender.tab);
          break;
        case (url.indexOf('myshopify.com/admin/themes/') != -1):
          loadThemeEditor(sender.tab);
          break;
        case (url.indexOf('util.boldapps.net/admin/liquid/requests') != -1):
          loadCusLookup(sender.tab);
          break;
        default:
          break;
      }
    }
});

function loadRecoverButtons(tab) {
  chrome.tabs.executeScript(tab.id, {file: "recoverbuttons.js"}, function() {
  });
}

function loadROWidget(tab) {
  chrome.tabs.executeScript(tab.id, {file: "rowidget.js"}, function() {
  });
}

function loadThemeEditor(tab) {
  chrome.tabs.executeScript(tab.id, {file: "theme-editor.js"}, function() {
  });
}

function loadCusLookup(tab) {
  chrome.tabs.executeScript(tab.id, {file: "cuslookup.js"}, function() {
  });
}

$(document).ready(function() {

});
