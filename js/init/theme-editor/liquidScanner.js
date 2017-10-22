$(document).ready(function() {
    chrome.storage.sync.get({ theme_editor_file_scanner_options: false}, function(items){

      if (items.theme_editor_file_scanner_options)
          scanROFiles();
  });
  //setInterval(function() {
    //markOldScanIcons();
    //scanROFiles();
  //}, 5000);
});

var ro_i = 0;
function scanROFiles()
{
  var key, file;
//  for (var i = 0; i < roFiles.length; ++i)
  //{
    key = roFiles[ro_i].substring(0, roFiles[ro_i].indexOf('/'));
    file = roFiles[ro_i].substring(roFiles[ro_i].indexOf('/') + 1);

    getFile(key, file, function(response)
    {
      var checks = fileContainsStrings(response, roHooks[file.substring(0, file.indexOf('.')).replace('-', '_')], function() {
        ro_i++;
        if(ro_i < roFiles.length) {
            scanROFiles();
        } else
            ro_i = 0;
          destroyOldScanIcons();
      });

      if (checks.indexOf(false) != -1)
        createScanIcon(key + "/" + file, checks);
      //console.log(file + ": " + b)
    });
  //}
}

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
// Call markOldScanIcons + destroyOldScanIcons before rescanning to avoid dupe buttons
function markOldScanIcons()
{
  $('.scan-hover').addClass('scan-hover-old');
  $('.scan-icon').addClass('scan-icon-old');
}
function destroyOldScanIcons()
{
  $('.scan-hover-old').remove();
  $('.scan-icon-old').remove();
}

function createScanIcon(file, checks)
{
  var row = $('[data-asset-key="' + file + '"]').closest('li');
  var icon = $("<img src='" + chrome.extension.getURL('resources/scanicon.png') + "' class='scan-icon' />");
  var scan_hover = $("<div class='scan-hover'><p>Click To See Missing Code.</p></div>");

  row.css('display', 'inline');
  scan_hover.insertBefore(row.prev().prev());
  icon.insertBefore(row);

  createScanListeners();
}
function createScanListeners()
{
  $(".scan-icon").mouseenter(function(e)
  {
    $(this).parent().find('.scan-hover').css('display', 'block');
  //  debugger;
    $(this).parent().find('.scan-hover').css('left', $(this).offset().left - 10);
    $(this).parent().find('.scan-hover').css('top', ($(this).offset().top - 55));
  });

  $(".scan-icon").mouseleave(function()
  {
    $(this).parent().find('.scan-hover').css('display', 'none');
  });

  $(".scan-icon").click(function() {
    openSnipPage();
  });

}

function openSnipPage()
{

//open the missing code snippet page
chrome.runtime.sendMessage({command: "openmissingcode"});
}
