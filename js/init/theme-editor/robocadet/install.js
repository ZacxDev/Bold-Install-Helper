var cartFiles = ['cart.liquid', 'cart-template.liquid', 'header.liquid', 'cart-drawer.liquid'];
// cartInclude, forItemInclude, boldDesc, itemPrice, cartTotalPrice, itemLinePrice, showPaypal
var cart_log = {};
var file_history = {};
var EXTENSION_ID = "clgokdfdcmjdmpooehnjkjdlhinkocgc";

$(document).ready(function() {
  $(document).on('auxclick', '.template-editor-tab', function(e) {
    if (e.which == 2)
    {
      e.preventDefault();
      $(this).find('.template-editor-close-tab').click();
    }
  });
});

function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function isNested(list, start) {
  var line;
  for (var i = start; i < list.length; ++i)
  {
    //if we find an opening for tag before finding another closing one
    line = replaceAll(list[i],' ', '');
    if (line.indexOf('{%for') != -1)
    {
      return -1;
    }
      if (line.indexOf('{%endfor%}') != -1)
      {
        return i;
      }
  }
  return -1;
}

function getAsset(asset, success, fail)
{
  key = asset.substring(0, asset.indexOf('/'));
  name = asset.substring(asset.indexOf('/') + 1);
  getFile(key, name, success, fail);
}

function getFile(key, name, callback, fail)
{
  var id = $('.action-bar__top-links a').attr('href');
  id = id.substring(id.indexOf("s/") + 2, id.indexOf("/editor"));
  var url = id + "/assets?asset%5Bkey%5D=" + key + "%2F" + name;

  $.get(id + '/assets.json?asset[key]=' + key + '/' + name + '&theme_id=' + id, function(data) {
    file_history[key + "\/" + name] = data.asset.value;
    callback(key, name, data.asset.value);
  })
  .fail(fail);
}

function pushAsset(asset, data, callback)
{
  key = asset.substring(0, asset.indexOf('/'));
  name = asset.substring(asset.indexOf('/') + 1);
  pushFile(key, name, data, callback);
}

function pushFile(key, name, data, callback)
{
  var id = $('.action-bar__top-links a').attr('href');
  id = id.substring(0, id.indexOf("/editor"));
  var url = id + '/assets.json';
  var params = {
    "asset": {
    "key": key + "\/" + name,
    "value": data
    }
  }

  $.ajax({
    url: url,
    type: 'PUT',
    data: params,
    success: callback(key, name),
    error: function(result)
    {
      console.log("error:" + result);
    }
  });
}

function refreshCodeTab(key, name)
{
  setTimeout(function() {
    // mark prev tab
    $('.template-editor-tab.active').prev().addClass('cadet_placeholder');
    // close/reopen tab
    $('.template-editor-tab.active .template-editor-close-tab').click();
    $('[data-asset-key="' + key + '/' + name + '"]').click();
    // Move the tab back to where it was
    setTimeout(function() {
      $('.template-editor-tab.active').insertAfter('.cadet_placeholder');
      $('.cadet_placeholder').removeClass('cadet_placeholder');
    }, 300);
  }, 300);
}

function updateCadetReport(log)
{
  if (typeof log == "undefined")
    log = cart_log;
  var strike = false;
  var logMsg = "<ul>";

  for (var k in log){
    strike = false;
    if (!log[k])
      strike = true;
      logMsg += "<li>";

      if(strike)
        logMsg += "<span class='cadet_report_false'>"

      logMsg += k + "</li>";

      if (strike)
        logMsg += "</span>";
  }
  logMsg += "</ul>";

  $('.cadet_report_content').html(logMsg);
}


/* @param: line - line to insert into theme Header
*  @param: check - what to check for to see if line is already there
*  @param: callback - the callback
*/
function appendToThemeHeaderContent(line, check, callback)
{
  //grab file and insert asset include
  getFile('layout', 'theme.liquid', function(k, n, data)
  {

    if (data.indexOf(line) != -1)
    {
      callback();
      return;
    }

    var lines = data.split('\n');

    for (var i = 0; i < lines.length; i++)
    {
      if (lines[i].indexOf('content_for_header') != -1)
      {
        lines.splice(i+1, 0, "\n" + line)
        break;
      }
    }

// convert array into string
    var code = '';
    for (var i = 0; i < lines.length; ++i)
    {
      code += lines[i] + '\n';
    }
    //update file
    pushFile('layout', 'theme.liquid', code, function() {
      callback();
    });
  });
}


function findIndexOf(list, line, start)
{
  for (var j = start; j < list.length; ++j)
  {
    if (list[j].indexOf(line) != -1)
      return j;
  }
  return -1;
}

function GetCurrentFileKey()
{
  if ($('.theme-asset-name strong').text() === "")
    return "";
  var kv, key, tar = $('.theme-asset-name strong').text();
  kv = $('.ppb li:contains(' + tar + ') a').attr('data-asset-key');

  key = kv.substring(0, kv.indexOf('/'));
  return key;
}

function GetCurrentFileName()
{
  if ($('.theme-asset-name strong').text() === "")
    return "";

  var kv, value, tar = $('.theme-asset-name strong').text();
  kv = $('.ppb li:contains(' + tar + ') a').attr('data-asset-key');

  value = kv.substring(kv.indexOf('/') + 1, kv.length);
  return value;
}

// file cache is used to store assets locally incase another item in batch needs the same file. (must be global so that other injections can access data inserted from old ones)
var file_cache = {};
function injectCoppyItem()
{
  var data = $('.coppy_dump').text();
  this.item = JSON.parse(data);
  var per_file_hooks = this.item.file_hooks_link != undefined;
  console.log('[Install Bot] Starting injection..');
  var key, name;
    var line = "";
    var insertMap = {};
    var asset;
    // databackup is the original file so they can rollback if needed
    var databackup;
    var done_injection = false;
    var finished_all_iteration = false;
    var files_hooks_index = 0;
    var f;
    var f_options;
    var response = {};

    //for (f in this.item.file_hooks_link)
    //{
    var contine_files_hooks = function() {
      if (files_hooks_index >= Object.keys(this.item.file_obj).length)
      {
        response.inserted = false;
        if (response.message == undefined)
        {
          response.message = "No hook found";
        }
        chrome.runtime.sendMessage(EXTENSION_ID, {command: 'continue_coppy_batch', lastasset: asset, assetbackup: databackup, response: response});
        return;
      }
      f = this.item.file_obj[files_hooks_index].file;
      f_options = this.item.file_obj[files_hooks_index].options;
      if (done_injection)
      {
        return;
      }
      key = f.substring(0, f.indexOf('/'));
      name = f.substring(f.indexOf('/') + 1);
      var search_and_push_asset = function(key, name, data, callback) {
        databackup = data;
        console.log("[Install Bot] Starting " + key + "/" + name + " injection..");
        asset = key + '\/' + name;
        file_cache[asset] = data;
        var content = this.item.content.split('\n');

        data = data.split('\n');
        var hooks = this.item.file_obj[files_hooks_index].hooks;
        if (hooks == undefined)
        {
          return;
        }
        // iterate file's data
        for (var i = 0; i < data.length; i++)
        {
          line = data[i];
          //look for content already in file.
          for (var c = 0; c < content.length; c++)
          {
            if (line.indexOf(content[c]) != -1)
            {
              // trying to determine if it's a unique hook or just something genaric
              if (content[c].indexOf('include') !== -1 || content[c].indexOf('class') !== -1)
              {
                content.splice(c, 1);
              }
            }
          }
          //look for hooks in the file
          for (var h = 0; h < hooks.length; h++)
          {
            if (line.indexOf(hooks[h]) != -1)
            {
              // Save to insertMap object, key = hook, val = index in file
              insertMap[hooks[h]] = i;
            }
          }
        }

        // if no hooks were found, insertMap will be empty, or if all the content is already in the file
        if (!$.isEmptyObject(insertMap) && content.length !== 0)
        {
          // iterate insertMap to see which hook is closest to start of array
          var using_hook = Object.keys(insertMap)[0];
          for (a in insertMap)
          {
            if (hooks.indexOf(a) < hooks.indexOf(using_hook))
            {
              using_hook = a;
            }
          }

          // this is how many lines after/before the line containing the hook we will inject the code
          var insertOffset = 1;
          var overrideIndex;

          if (f_options.insert_above)
          {
            insertOffset = 0;
          }
          if (f_options.enclosing_element_as_hook)
          {
            // +1 since that will put it on the next line
            overrideIndex = getEndOfParentElement(data, insertMap[using_hook], using_hook) + 1;
          }
          if (f_options.start_of_function)
          {
            var start = getFunctionDeclarationIndex(data, using_hook);
            if (start === -1)
            {
              callback();
              return;
            }
            overrideIndex = start + 1;
          }
          if (f_options.end_of_function)
          {
            var start = getFunctionDeclarationIndex(data, using_hook);
            if (start === -1)
            {
              callback();
              return;
            }
            overrideIndex = getFunctionEndIndex(data, start) + 1;
          }

          if (overrideIndex != undefined)
          {
            // insert at end of parent element
            data.splice(overrideIndex, 0, content.join('\n'));
          } else {
            // insert the coppy item content under the preferred hook
            data.splice(insertMap[using_hook] + insertOffset, 0, content.join('\n'));
          }
          data = data.join('\n');
          //reset insertMap to prevent the next file from using the same hooks
          insertMap = {};
          if (!done_injection)
          {
            file_cache[asset] = data;
            // update the code mirror if they have the file open
            updateCodeMirror(key, name, data);
            // push updated file
            pushFile(key, name, data, function(){
              console.log("[Install Bot] Done injecting " + key + "/" + name);
              response.message = "Success";
              response.inserted = true;
              // send message to background script to start next injection
              chrome.runtime.sendMessage(EXTENSION_ID, {command: 'continue_coppy_batch', lastasset: asset, assetbackup: databackup, response: response});
              // if option is set to only insert in one file
              done_injection = true;
              //callback();
          });
      }
    } else {
      if (content.length === 0)
      {
        response.message = "Content already in file";
      }
      callback();
    }
  }
  //grab the coppy item's file
  if (file_cache[key + '\/' + name] == undefined) {
    getFile(key, name, function(key, name, data) {
      search_and_push_asset(key, name, data, function() {
        files_hooks_index++;
        contine_files_hooks();
      });
    }, function() {
      files_hooks_index++;
      contine_files_hooks();
    });
    } else {
      search_and_push_asset(key, name, file_cache[key + '\/' + name], function() {
        files_hooks_index++;
        contine_files_hooks();
      });
    }
    //}
  }
    contine_files_hooks();

  $('.coppy_dump').remove();
}

function updateCodeMirror(key, name, data)
{
  // if they have the file open, click it and update the content after a timeout (to make sure it's open)
  if ($('.template-editor-tabs li:contains(' + name + ')').length > 0)
  {
    $('[data-asset-key="' + key + "\/" + name + '"]').click();
    $('.CodeMirror')[0].CodeMirror.setValue(data);
  }
}

// this function sends the message to dump the last coppy batch into the dom
function undoLastInstallBotAction()
{
  console.log('[Install Bot] Begining injection reversal');
  chrome.runtime.sendMessage(EXTENSION_ID, {command: 'undo_last_coppy_batch'});
}

// this function pushes the old file data to undo the coppy batch
function undoLastCoppy()
{
  var batch = JSON.parse($('.coppy_batch_undo').text());
  for (f in batch)
  {
    console.log('[Install Bot] Reversing ' + f + "..");
    pushAsset(f, batch[f], function(key, name){
      $('.coppy_batch_undo').remove();
      updateCodeMirror(key, name, batch[f]);
      console.log('[Install Bot] Done ' + f);
    });
  }
  console.log('[Install Bot] Injection reversal complete!');
}

function getEndOfParentElement(data, line, hook) {
  var i = line;
  var lines = data.slice(0);
  var skipNext = false;
  for (i; i > -1; i--)
  {
    if (lines[i].indexOf('</') !== -1)
    {
      if (i == line)
      {
         if (lines[i].indexOf('</') < lines[i].indexOf(hook))
         {
          // find all indexs of '<', then find the one closest to '</', if there are more the one '<', cut the string out and recheck the line, else skip next
          var str = lines[i];
          var closest = 0;
          var inx = 0;
          for(var n=0; n<str.length;n++) {
              if (str[n] === '<')
              {
                inx++;
                if (n < lines[i].indexOf('</') && n > closest)
                {
                  closest = n;
                }
              }
          }
          if (inx > 1)
          {
            lines[i] = lines[i].substring(0, closest) + lines[i].substring(lines[i].indexOf('</') + 2, lines[i].length);
            i++;
            continue;
          } else {
            skipNext = true;
          }
        }
      } else {
        skipNext = true;
      }
    }
    if (lines[i].indexOf('<') !== -1)
    {
      if (skipNext)
      {
        skipNext = false;
        continue;
      } else {
        if (i == line)
        {
          if (lines[i].indexOf('<') <lines[i].indexOf(hook))
          {
            break;
          }
        } else {
          break;
        }
      }
    }
  }
    skipNext = false;
    var end = 0;
    // if there is no enclosing element, return the line we were given
    if (i == -1)
    {
      return line;
    }
    lines[i] = lines[i].trim();
    if (lines[i].indexOf('>') != -1)
    {
      if (lines[i].indexOf(' ') != -1 && lines[i].indexOf(' ') < lines[i].indexOf('>'))
      {
        end = lines[i].indexOf(' ');
      } else {
        end = lines[i].indexOf('>')
      }
    } else if (lines[i].indexOf(' ') != -1) {
      end = lines[i].indexOf(' ');
    } else {
      end = lines[i].length;
    }
    var ele = lines[i].substring(lines[i].indexOf('<') + 1, end);
    lines = data.slice(0);
    var matchOn, matchIndex = 0, foundOpen = false;
    for (var n = i; n < lines.length; n++)
    {
      //remove the end tag from this line so we dont keep finding the same one
      if (n === matchOn)
      {
        // var str = lines[n];
        // var inx = 0;
        // for(var j=0; j<str.length;j++) {
        //     if (str[j] === '/')
        //     {
        //       inx++;
        //       if (j < lines[n].indexOf('</' + ele) && j > closest)
        //       {
        //         closest = j;
        //       }
        //     }
        // }
        // if (inx > 1)
        // {
        //   lines[n] = lines[n].substring(0, closest - 1) + lines[n].substring(lines[n].indexOf('</' + ele) + ('</' + ele).length, lines[n].length);
        // } else {
          lines[n] = lines[n].substring(matchIndex, lines[n].length);
        //}
      }
      // if the line is an open tag and it's not the same one we start on
      if (lines[n].indexOf('<' + ele) != -1)
      {
        if (!foundOpen)
        {
          //once we find the opening tag, we need to check the same line again
          foundOpen = true;
          matchIndex = lines[n].indexOf('<' + ele) + ("<" + ele).length;
          matchOn = n;
          n--;
          continue;
        } else {
        //  if (lines[n].indexOf('<' + ele) > lines[n].indexOf(hook))
        //  {
            skipNext = true;
          //}
          matchOn = n;
        }
      }
      if (lines[n].indexOf('</' + ele) != -1)
      {
        if (skipNext)
        {
          skipNext = false;
          matchIndex = lines[n].indexOf('</' + ele) + ("</" + ele).length;
          //if we found the end on this line, check it again
          if (n === matchOn)
          {
            n--;
          }
          continue;
        } else
        {
          return n;
        }
      }
    }
}

function getFunctionDeclarationIndex(lines, name)
{
  // the chars thhat can be between function keyword and it's name
  var name_before_function_seperators = [':', '='];
  var func_index = -1, name_index = -1, line = "";
  for (var i = 0; i < lines.length; i++)
  {
    func_index = lines[i].indexOf('function');
    name_index = lines[i].indexOf(name);
    if (func_index !== -1 && name_index !== -1)
    {
      if (func_index < name_index)
      {
        line = lines[i];
        line = replaceAll(line, ' ', '');
        if (line.indexOf('function' + name) !== -1)
        {
          return i;
        }
      } else if (name_index < func_index)
      {
        line = lines[i];
        line = replaceAll(line, ' ', '');
        if (line.indexOf(name + ':function') !== -1 || line.indexOf(name + '=function') !== -1)
        {
          return i;
        }
      }
    }
  }
  return -1;
}

function getFunctionEndIndex(lines, startIndex) {
  var foundOpen = false, skipNext = false;
  var matchIndex = -1, matchLine = -1;
  var line;
  for (var i = startIndex; i < lines.length; i++)
  {
    line = lines[i];
    if (i === matchLine)
    {
      line = line.substring(matchIndex + 1, line.length);
    }
    if (line.indexOf('{') != -1)
    {
      if (!foundOpen)
      {
        foundOpen = true;
        matchIndex = line.indexOf('{');
        matchLine = i;
        i--;
        continue;
      }
      skipNext = true;
    }
    if (line.indexOf('}') != -1)
    {
      if (skipNext)
      {
        skipNext = false;
        matchIndex = line.indexOf('}');
        matchLine = i;
        i--;
        continue;
      }
      return i;
    }
  }

}
