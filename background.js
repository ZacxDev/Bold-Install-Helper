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
chrome.runtime.onMessage.addListener(function (msg, sender) {
  console.log(msg.subject);
  if ((msg.from === 'content') && (msg.subject === 'zach')) {

  }
});
var i = 9;
