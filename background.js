chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript({file: "jquery-3.2.1.min.js"}, function(result) {
      //  chrome.tabs.executeScript({file: "script.js"}, function(result) {
      //  });
    });
});

// $( document ).ready(function() {
// console.log('siufh');
//   $('.popup-coppy-format').click(function() {
//     console.log('siufh');
//   });
