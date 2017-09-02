var url;
$( document ).ready(function() {
  $('.popup-btn').click(function() {
    getURL(function(){
      getCurrentFile();
    });
  });

  // chrome.tabs.query({
  //   active: true,
  //   currentWindow: true
  // }, function (tabs) {
  //   chrome.tabs.sendMessage(
  //       tabs[0].id,
  //       {from: 'popup', farewell: 'DOMInfo'},
  //       function() {console.log(message)});
  //       });

});

function getURL(callback)
{
  chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
      url = tabs[0].url;
      console.log('supp')
      callback(url);
  });
}

function getCurrentFile()
{
  var query = url.substring(url.indexOf('?key=') + 1);
  var key = query.substring(query.indexOf('=') + 1, query.indexOf('/'));
  var file = query.substring(query.indexOf('/') + 1);
  url = url.substring(0, url.indexOf('?'));
  url = url + "/assets?asset%5Bkey%5D=" + key + "%2F" + file;

  var xhr = new XMLHttpRequest();
xhr.open('GET', url, true);
//xhr.responseType = 'text';
xhr.onload = function(e) {
  if (this.status == 200) {
    var response = this.response;
    console.log(response)
  }
};
xhr.send();
}
document.getElementById('options_button').onclick = openOps;
function openOps() {
  chrome.runtime.openOptionsPage()
    };
