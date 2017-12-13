$(document).ready(function() {
    chrome.storage.sync.get({ theme_editor_file_scanner_options: false}, function(items){

  });
});

function fileContainsStrings(response, hooks, callback)
{
  var lines = replaceAll(parseValueFromXML(response), " ", "");
  var checks = [];

  for (var i = 0; i < hooks.length; ++i)
    if (lines.indexOf(replaceAll(hooks[i], " ", "")) == -1)
    {
      checks[i] = false;
      //callback();
    } else {
      checks[i] = true;
    }

  callback();
  return checks;
}
