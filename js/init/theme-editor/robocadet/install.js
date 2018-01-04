var cartFiles = ['cart.liquid', 'cart-template.liquid', 'header.liquid', 'cart-drawer.liquid'];
// cartInclude, forItemInclude, boldDesc, itemPrice, cartTotalPrice, itemLinePrice, showPaypal
var cart_log = {};
var file_history = {};

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
  id = id.substring(0, id.indexOf("/editor"));
  var url = id + "/assets?asset%5Bkey%5D=" + key + "%2F" + name;

  $.get(id + '/assets.json?asset[key]=' + key + '/' + name + '&theme_id=' + id, function(data) {
    file_history[name] = data.asset.value;
    callback(key, name, data.asset.value);
  });
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
