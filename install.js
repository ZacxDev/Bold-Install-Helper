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
    if (line.indexOf('{%for%}') != -1)
    {
      return -1;
    }
      if (line.indexOf('{% endfor %}') != -1)
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
      if ((split[i].indexOf('{% for p in item.properties %}') != -1 || split[i].indexOf('{% for property in itemProperties %}') != -1)&& !cart_log[2])
      {
        //save the index so we can comment
        var fl_cmt_index = i;
        //look for the end of the loop
        for (var f = i; f < split.length; ++f)
        {
          if (split[f].indexOf('{% endfor %}') != -1)
          {
            //if there is another end for before another for
            var next_for_line = isNested(split, f);
            if (next_for_line != -1)
              {
                f = next_for_line;
              }

            split.splice(fl_cmt_index, 0, "{% comment %}");
            split.splice(f+2, 0, "{% endcomment %}");
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

  $('html').click(function()
  {
      $('.bh-codepopup').css('display', 'none');
      $('.bh-rocart-log').css('display', 'none');
  });

}
