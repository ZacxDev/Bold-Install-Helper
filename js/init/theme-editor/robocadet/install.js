var cartFiles = ['cart.liquid', 'cart-template.liquid', 'header.liquid', 'cart-drawer.liquid'];
// cartInclude, forItemInclude, boldDesc, itemPrice, cartTotalPrice, itemLinePrice, showPaypal
var cart_log = {};
var file_history = {};

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

function getFile(key, name, callback)
{
  var id = $('.action-bar__top-links a').attr('href');
  id = id.substring(id.indexOf("s/") + 2, id.indexOf("/editor"));
  var url = id + "/assets?asset%5Bkey%5D=" + key + "%2F" + name;

  $.get(id + '/assets.json?asset[key]=' + key + '/' + name + '&theme_id=' + id, function(data) {
    file_history[key + "\/" + name] = data.asset.value;
    callback(key, name, data.asset.value);
  });
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

function cartInstall(key, name, data)
{
  // cartInclude, forItemInclude, boldDesc, itemPrice, cartTotalPrice, itemLinePrice, showPaypal
  cart_log = {'cartInclude' : false, 'forItemInclude': false, 'boldDesc': false, 'itemPrice': false, 'cartTotalPrice': false, 'itemLinePrice': false, 'showPaypal': false, };
  //data = parseValueFromXML(data);

  var split = data.split('\n');
  for (var i = 0; i < split.length; ++i)
  {
      if (i === 0 && split[0].indexOf("{%- include 'bold-cart' -%}") === -1)
      {
        split.splice(0, 0, "{%- include 'bold-cart' -%}");
        cart_log['cartInclude'] = true;
        continue;
      }

      if (split[i].indexOf('{% for item in') != -1 && split[i+1].indexOf("{%- include 'bold-cart-item' with item -%}") === -1 && !cart_log['forItemInclude'])
      {
        split.splice(i+1, 0, "{%- include 'bold-cart-item' with item -%}");
        cart_log['forItemInclude'] = true;
        continue;
      }

      //if we find the loop
      if ((split[i].indexOf('{% for p in item.properties') != -1 || split[i].indexOf('{% for property in itemProperties') != -1 || split[i].indexOf('{% for p in itemProperties') != -1) && !cart_log['boldDesc'])
      {
        //save the index so we can comment
        var fl_cmt_index = i;
        //look for the end of the loop
        for (var f = i; f < split.length; ++f)
        {
          if (split[f].indexOf('{% endfor %}') != -1)
          {
            //if there is another end for before another for (use f + 1 since otherwise it'll return the current line)
            var next_for_line = isNested(split, f + 1);
            if (next_for_line != -1)
              {
                f = next_for_line;
              }

            split.splice(fl_cmt_index, 0, "{%- comment -%}");
            split.splice(f+2, 0, "{%- endcomment -%}");
            split.splice(f+3, 0, "{{ bold_recurring_desc }}");
            cart_log['boldDesc'] = true;

            break;
          }
        }
      }

      if (split[i].indexOf('{{ cart.total_price') != -1)
      {
        split[i] = split[i].replace('cart.total_price', 'bold_cart_total_price');
        cart_log['cartTotalPrice'] = true;
        continue;
      }

      if (split[i].indexOf('{{ item.price') != -1)
      {
        cart_log['itemPrice'] = true;
        split[i] = split[i].replace('item.price', 'bold_item_price');
        continue;
      }

      if (split[i].indexOf('{{ item.line_price') != -1)
      {
        split[i] = split[i].replace('item.line_price', 'bold_item_line_price');
        cart_log['itemLinePrice'] = true;
        continue;
      }

      if (split[i].indexOf('{% if additional_checkout_buttons %}') != -1 && !cart_log['showPaypal'])
      {
        split[i] = split[i].replace('%}', 'and show_paypal %}');
        cart_log['showPaypal'] = true;
        continue;
      }
//console.log((i/split.length) * 100 + "%")
  }
//console.log(cart_log);

  var code = '';
  for (var i = 0; i < split.length; ++i)
  {
    code += split[i] + '\n';
  }

  pushFile(key, name, code, function(key, name) {
      refreshCodeTab(key, name);
  });
  updateCadetReport();
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

//deprecated
function openCodePopup(code)
{
}


function narrativeAjaxThemeMinJs(key, name, data)
{

var log = {'recurringProperty': false, 'cleanCart': false, 'formatted_recurring_desc': false}

  // find property tag, insert recurring tag | add the $n recurringdesc thingy | clean cart in update(t) | put <p data-formatted_recurr...> in cart-drawer and cart-template
  var lines = data.split('\n');
  for (var i = 0; i < lines.length; ++i)
  {
    // create itemRecurring property
    if (lines[i].indexOf('itemProperty:') != -1)
    {
      //inset recurring property on next line
      //lines.splice(i+1, 0, 'itemRecurring: "[data-cart-item-formatted_recurring_desc]",');
      lines[i] = lines[i].substring(0, lines[i].indexOf('itemProperty:')) + 'itemRecurring: "[data-cart-item-formatted_recurring_desc]",' + lines[i].substring(lines[i].indexOf('itemProperty:'), lines[i].length);
      log['recurringProperty'] = true;
    }
    // run clean cart and append recurring desc to html
    if (lines[i].indexOf('this.trigger("cart_update_start"') != -1)
    {
      //append cleancart
      //lines.splice(i+1, 0, "if(typeof(BOLD) === 'object' && BOLD.helpers && typeof(BOLD.helpers.cleanCart) === 'function' ) {cart = BOLD.helpers.cleanCart(cart);}")
      lines[i] = lines[i].substring(0, lines[i].indexOf('this.trigger("cart_update_start"')) + "if(typeof(BOLD) === 'object' && BOLD.helpers && typeof(BOLD.helpers.cleanCart) === 'function' ) {t = BOLD.helpers.cleanCart(t);}" + lines[i].substring(lines[i].indexOf('this.trigger("cart_update_start"'), lines[i].length);
      log['cleanCart'] = true;
    }
    //insert recurring desc to html
    if (lines[i].indexOf('return e.find') != -1)
    {
      // find the line we want to inset recurring desc into
    //  var j = findIndexOf(lines, 'return e.find', i);
      // if we find it, insert the code, and replace discounted price with itemPrice
    //  if (j != -1)
        lines[i] = lines[i].substring(0, lines[i].indexOf('$n(Sc.itemVariantTitle')) + "$n(Sc.itemRecurring, e).html(t.formatted_recurring_desc), " + lines[i].substring(lines[i].indexOf('$n(Sc.itemVariantTitle'), lines[i].length).replace('t.discounted_price', 'itemPrice');
      //define itemprice
      //lines.splice(j, 0, "var itemPrice = '';if(t.properties != null){itemPrice = t.price;} else{itemPrice = t.discounted_price;}")
      lines[i] = lines[i].substring(0, lines[i].indexOf('return e.find')) + "var itemPrice = '';if(t.properties != null){itemPrice = t.price;} else{itemPrice = t.discounted_price;}" + lines[i].substring(lines[i].indexOf('return e.find'), lines[i].length);
      log['formatted_recurring_desc'] = true;
    }
  }

  var code = '';
  for (var i = 0; i < lines.length; ++i)
  {
    code += lines[i] + '\n';
  }

  pushFile(key, name, code, function(key, name) {
    refreshCodeTab(key, name);
  });
  updateCadetReport(log);
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
  console.log(this.item + '[Install Bot] Starting injection..');
  var key, name;
  if (per_file_hooks)
  {
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

    //for (f in this.item.file_hooks_link)
    //{
    var contine_files_hooks = function() {
      if (files_hooks_index >= this.item.file_hooks_link.length)
      {
        chrome.runtime.sendMessage('clgokdfdcmjdmpooehnjkjdlhinkocgc', {command: 'continue_coppy_batch', lastasset: asset, assetbackup: databackup, inserted: false});
        return;
      }
      f = Object.keys(this.item.file_hooks_link[files_hooks_index])[0];
      f_options = this.item.file_options[f];
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

        data = data.split('\n');
        var hooks = this.item.file_hooks_link[files_hooks_index][asset];
        if (hooks == undefined)
        {
          return;
        }
        // iterate file's data
        for (var i = 0; i < data.length; i++)
        {
          line = data[i];
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

        // if no hooks were found, insertMap will be empty
        if (!$.isEmptyObject(insertMap))
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

          // insert the coppy item content under the preferred hook
          data.splice(insertMap[using_hook] + 1, 0, this.item.content);
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
              // send message to background script to start next injection
              chrome.runtime.sendMessage('clgokdfdcmjdmpooehnjkjdlhinkocgc', {command: 'continue_coppy_batch', lastasset: asset, assetbackup: databackup, inserted: true});
              // if option is set to only insert in one file
              done_injection = true;
              //callback();
          });
      }
    } else {
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
  }
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
  chrome.runtime.sendMessage('clgokdfdcmjdmpooehnjkjdlhinkocgc', {command: 'undo_last_coppy_batch'});
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
