// chrome.browserAction.onClicked.addListener(function(tab) {
//   console.log('ddd');
//     chrome.tabs.executeScript({file: "jquery-3.2.1.min.js"}, function(result) {
//
//     });
//
// });
//
// chrome.webNavigation.onCompleted.addListener(function() {
//   console.log('vd')
//
// });
// document.addEventListener('DOMContentLoaded', function () {
//   console.log('d');
// });
// chrome.runtime.onMessage.addListener(function (msg, sender) {
//   console.log(msg.subject);
//   if ((msg.from === 'content') && (msg.subject === 'zach')) {
//
//   }
// });
// var i = 9;

// chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//   chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
//     console.log(response.farewell);
//   });
// });
var url;

chrome.runtime.onMessage.addListener(
function(request, sender, sendResponse) {
  console.log(sender.tab ?
              "from a content script:" + sender.tab.url :
              "from the extension");
  if (request.command == "geturl")
    sendResponse({url: sender.tab.url + ""});
});

$(document).ready(function() {
  console.log('d')
});
