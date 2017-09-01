var cartFiles = ['cart.liquid', 'cart-template.liquid', 'header.liquid', 'cart-drawer.liquid'];

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

function cartInstall(data)
{
  // cartInclude, forItemInclude, boldDesc, itemPrice, cartTotalPrice, itemLinePrice, showPaypal
  cart_log = [ false, false, false, false, false, false, false ]
  data = parseValueFromXML(data);

  var split = data.split('\n');
  for (var i = 0; i < split.length; ++i)
  {
      if (i === 0 && split[0].indexOf("{%- include 'bold-cart' -%}") === -1)
      {
        split.splice(0, 0, "{%- include 'bold-cart' -%}");
        cart_log[0] = true;
        continue;
      }

      if (split[i].indexOf('{% for item in') != -1 && split[i+1].indexOf("{%- include 'bold-cart-item' with item -%}") === -1 && !cart_log[1])
      {
        split.splice(i+1, 0, "{%- include 'bold-cart-item' with item -%}");
        cart_log[1] = true;
        continue;
      }

      //if we find the loop
      if ((split[i].indexOf('{% for p in item.properties') != -1 || split[i].indexOf('{% for property in itemProperties') != -1 || split[i].indexOf('{% for p in itemProperties') != -1) && !cart_log[2])
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
            cart_log[2] = true;

            break;
          }
        }
      }

      if (split[i].indexOf('{{ cart.total_price') != -1)
      {
        split[i] = split[i].replace('cart.total_price', 'bold_cart_total_price');
        cart_log[4] = true;
        continue;
      }

      if (split[i].indexOf('{{ item.price') != -1)
      {
        cart_log[3] = true;
        split[i] = split[i].replace('item.price', 'bold_item_price');
        continue;
      }

      if (split[i].indexOf('{{ item.line_price') != -1)
      {
        split[i] = split[i].replace('item.line_price', 'bold_item_line_price');
        cart_log[5] = true;
        continue;
      }

      if (split[i].indexOf('{% if additional_checkout_buttons %}') != -1 && !cart_log[6])
      {
        split[i] = split[i].replace('%}', 'and show_paypal %}');
        cart_log[6] = true;
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

  openCodePopup(code);
}

function openCodePopup(code)
{

    $('.bh-codepopup').css('display', 'block');
    $('.bh-codepopup xmp').text(code);

    SelectText('text-select');
    document.execCommand('copy');
    // cartInclude, forItemInclude, boldDesc, itemPrice, cartTotalPrice, itemLinePrice, showPaypal
    var logMsg = '';
    var strike = false;
    for (var i=0; i < cart_log.length; ++i)
    {
      strike = false;
      if (!cart_log[i])
        strike = true;

      if(strike)
        logMsg += "<p class='log-false'>"

      if (i === 0)
        logMsg += ' cartInclude ';
      else if (i === 1)
        logMsg += ' forItemInclude ';
      else if (i === 2)
          logMsg += ' boldRecurringDesc ';
      else if (i === 3)
            logMsg += ' itemPrice ';
      else if (i === 4)
            logMsg += ' cartTotalPrice ';
      else if (i === 5)
            logMsg += ' itemLinePrice ';
      else if (i === 6)
            logMsg += ' showPaypal ';
      if(strike)
        logMsg += "</p>"
    }
    $('.bh-rocart-log').css('display', 'block');
    $('.bh-rocart-log').html(logMsg);

  $('.bh-codepopup').click(function(e) {
    SelectText('text-select');
    e.stopPropagation();
  });
}


function narrativeAjaxThemeMinJs(data)
{

var log = [ false, false, false, false, false, false ]
//parse the actual code from the XML response
data = parseValueFromXML(data);

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
      log[0] = true;
    }
    // run clean cart and append recurring desc to html
    if (lines[i].indexOf('this.trigger("cart_update_start"') != -1)
    {
      //append cleancart
      //lines.splice(i+1, 0, "if(typeof(BOLD) === 'object' && BOLD.helpers && typeof(BOLD.helpers.cleanCart) === 'function' ) {cart = BOLD.helpers.cleanCart(cart);}")
      debugger;
      lines[i] = lines[i].substring(0, lines[i].indexOf('this.trigger("cart_update_start"')) + "if(typeof(BOLD) === 'object' && BOLD.helpers && typeof(BOLD.helpers.cleanCart) === 'function' ) {t = BOLD.helpers.cleanCart(t);}" + lines[i].substring(lines[i].indexOf('this.trigger("cart_update_start"'), lines[i].length);
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
    }
  }

  var code = '';
  for (var i = 0; i < lines.length; ++i)
  {
    code += lines[i] + '\n';
  }

    openCodePopup(code);
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
