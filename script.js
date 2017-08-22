
var classArr = ['cm-comment', 'cm-liquid', 'CodeMirror-matchingtag', 'cm-tag','cm-attribute', 'cm-braket', 'cm-string'];
var clicked = false;
var cartFiles = ['cart.liquid', 'cart-template.liquid', 'header.liquid', 'cart-drawer.liquid'];

$( document ).ready(function() {
  console.log('ready');

  var shopifyLogin = false;
  var liqReqPage = false;
  var themeEditor = false;

  if ($('.theme-asset-actions').length != 0)
    themeEditor = true;

  if($(".ico-shopify-bag").length != 0)
  {
    shopifyLogin = true;
  }
  if($("iframe[data-src*='https://ro.boldapps.net/s/']").length != 0)
  {
    console.log("wadadadadad")
  }

  if ($('.install-row').length != 0)
  {
    liqReqPage = true;
    loadCusLookupBtns();
  }

  if (!shopifyLogin && !liqReqPage)
      loadSubscriptionWidget();

  if (shopifyLogin)
  {
    var fillLogin = $('<input type="button" value="@boldcommerce" class="btn recover-btn commerce-fill" />');
  //  fillLogin.appendTo('.dialog-form ');
    fillLogin.insertBefore('.dialog-form .dialog-submit');
    var fillAppsLogin = $('<input type="button" value="@boldapps" class="btn recover-btn apps-fill" />');
  //  fillAppsLogin.appendTo('.dialog-form ');
    fillAppsLogin.insertBefore(fillLogin);
  }

  if (themeEditor)
  {
    setTimeout(function() {
      loadThemeEditor();
    }, 300);
  }

    $('html').click(function() {
      $('.bold-install-dropdown-menu').css('display', 'none');
    });

    $(".bold-install-dropdown").click(function(e)
    {
      if (isBoxTab())
      {
        fillBAB();
      } else {
        $('.bold-install-dropdown-menu').css('display', 'block');
      }
      e.stopPropagation();
    });


$('.bold-install').click(function(e)
{

  $('.bold-install-dropdown-menu').children().each(function () {

    $('.toggle-field input[value="consistent"]').prop('checked', true);
    $('.discount_config_consistent').css("display", "block");
    $('.input-field').prop('disabled', false);
    $('.card .btn').click();

      if ($(e.target).hasClass('bold-install-testOne'))
      {

        $('.field-group [name="discount"]').val('5');
        $('.input-field[name="group_name"]').val('Bold Test 1');
        $('#subscription_type').val('1');
        $('.products-step').css('display', 'block');
        $('.discount-step').css('display', 'block');
        $('.box-step').css('display', 'none');
      }else if ($(e.target).hasClass('bold-install-testTwo'))
      {
        $('.field-group [name="discount"]').val('5');
        $('.input-field[name="group_name"]').val('Bold Test 2');
        $('#subscription_type').val('2');
        $('.products-step').css('display', 'block');
        $('.discount-step').css('display', 'block');
        $('.box-step').css('display', 'none');
        $('.convertible').css('display', "block");
      } else if ($(e.target).hasClass('bold-install-testThree'))
      {
        $('.products-step').css('display', 'none');
        $('.discount-step').css('display', 'none');
        $('.box-step').css('display', 'block');
        $('.input-field[name="group_name"]').val('Bold Test 3');
        $('#subscription_type').val('3');
        $('.content .action_button_name').text('Continue');
        setTimeout(function() {
          if (!clicked)
          {
            $('.content .action_button_name').click();
            clicked = true;
          }
        }, 500);
    }
  });
});

$('.recover-btn').click(function(e)
{
  if ($(this).hasClass('apps-fill'))
    $('#recover-login').val("support@boldapps.net");
  else
    $('#recover-login').val("support@boldcommerce.com");

  $('.dialog-submit').click();
});

$('.asset-listing-theme-file').click(function(e)
{
  setTimeout(function() {
    loadThemeEditor();
  }, 300);
});
$('.template-editor-tab-filename').click(function(e)
{
  setTimeout(function() {
    loadThemeEditor();
  }, 200);
});

$('.bh-cachebuster').click(function() {
  var file = getFile('snippets', 'bold-common.liquid', appendCacheBuster);
});

$('.card-section button').click(function() {
  setTimeout(function() {
    loadCusLookupBtns()
  }, 200);
});

$('.card-section select').click(function() {
  setTimeout(function() {
    loadCusLookupBtns()
  }, 200);
});

$('.with-row-borders td .btn').click(function()
{
  setTimeout(function() {
    loadEmailButtons();
  }, 200);
});

////////////
//end of ready
/////////////
});

function fillBAB()
{
  $('.add_box_slot')[0].click();
  $('.add_box_product_size')[0].click();

  $('.slot_type_name').val('Bold Test');
  $('.slot_save')[0].click();
  $('.field-group input[name="product_size_box_size"]').val('3');
  setTimeout(function() {
    $('.add_box_product_occurrences')[0].click();
    $('.field-group input[name="start_date"]').val('2017-08-02');
  }, 1000);
}

function isBoxTab()
{
  return $('.segment-header h1').text().indexOf('Build a Box') >= 0;
}


function appendCacheBuster(response)
{
  //console.log(response)
  var lines = response.split('\n');
  //start at 90 since it will always be after that
  for (var i = 90; i < lines.length; ++i)
  {
    if (lines[i].indexOf("window.BOLD.common.Shopify.metafields[{{ namespace | json }}] = {{ shop.metafields[namespace] | json }};") != -1)
    {
      if (lines[i + 1].indexOf("{%- endfor -%}") != -1)
      {
        lines.splice(i + 2, 0, "window.BOLD.common.cacheParams = window.BOLD.common.cacheParams || {}\n  window.BOLD.common.cacheParams.cachebuster = Date.now();\nwindow.BOLD.common.cacheParams.recurring_orders = 'ro'+{{theme.id}}+window.BOLD.common.cacheParams.cachebuster;\nwindow.BOLD.common.cacheParams.options = 'options'+{{theme.id}}+window.BOLD.common.cacheParams.cachebuster;");
      }
    }
  }
  var data = '';
  for (var i = 0; i < lines.length; ++i)
  {
    data += lines[i];
  }

  //pushFile('snippets', 'bold-common.liquid', data);
  openCodePopup(data)
}

// cartInclude, forItemInclude, boldDesc, itemPrice, cartTotalPrice, itemLinePrice, showPaypal

function cartInstall(data)
{
  var cart_log = [ false, false, false, false, false, false, false ]
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

      if (split[i].indexOf('{% for item in cart.items %}') != -1 && split[i+1].indexOf("{%- include 'bold-cart-item' with item -%}") === -1 && !cart_log[1])
      {
        split.splice(i+1, 0, "{%- include 'bold-cart-item' with item -%}");
        cart_log[1] = true;
        continue;
      }

      //if we find the loop
      if (split[i].indexOf('{% for p in item.properties %}') != -1 && !cart_log[2])
      {
        //save the index so we can comment
        var fl_cmt_index = i;
        //look for the end of the loop
        for (var f = i; f < split.length; ++f)
        {
          if (split[f].indexOf('{% endfor %}') != -1)
          {
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

function getFile(key, name, callback)
{
//  var query = url.substring(url.indexOf('?key=') + 1);
  //var key = query.substring(query.indexOf('=') + 1, query.indexOf('/'));
//  var file = query.substring(query.indexOf('/') + 1);
  //url = url.substring(0, url.indexOf('?'));
  var id = $('.action-bar__top-links a').attr('href');
  id = id.substring(0, id.indexOf("/editor"));
  var url = id + "/assets?asset%5Bkey%5D=" + key + "%2F" + name;

  var xhr = new XMLHttpRequest();
xhr.open('GET', url, true);
//xhr.responseType = 'text';
xhr.onload = function(e) {
  if (this.status == 200) {
    var response = this.response;
    //console.log(response)
    callback(response);
  }
};
xhr.send();
}

function pushFile(key, name, data)
{
//  var query = url.substring(url.indexOf('?key=') + 1);
  //var key = query.substring(query.indexOf('=') + 1, query.indexOf('/'));
//  var file = query.substring(query.indexOf('/') + 1);
  //url = url.substring(0, url.indexOf('?'));
  var id = $('.action-bar__top-links a').attr('href');
  id = id.substring(0, id.indexOf("/editor"));
  //var url = id + "/assets?asset%5Bkey%5D=" + key + "%2F" + name;
  var url = id + '/assets.json'
  console.log(url)
  var xhr = new XMLHttpRequest();
xhr.open('PUT', url, true);
//xhr.responseType = 'text';
xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

xhr.onreadystatechange = function() {//Call a function when the state changes.
    if(xhr.readyState == 4 && xhr.status == 200) {
        console.log(xhr.responseText);
    }
}
var json = {
"asset": {
  "key": key + "\/" + name,
  "value": data
}
}
xhr.send(json);
}

function parseValueFromXML(data)
{
  var value = '';
  var code = '';
  var parser = new DOMParser();
  value = parser.parseFromString(data, 'text/xml');
  code = value.getElementsByTagName('value')[0].childNodes[0].nodeValue;
  return code;
}

function openCodePopup(code)
{
  // var w = window.open("", "BH:Popup", "width=600, height=400, scrollbars=yes");
  //               var $w = $(w.document.body);
  //               $w.html("<xmp style='width: 100%; height: 100%'>" + code +"</xmp>");
  //
  //         $('html').click(function()
  //       {
  //         w.close();
  //       });

  //$('.bh-codepopup xmp').text(code);
  //$('.bh-codepopup').css('display', 'block')
  popup = $('.bh-codepopup');
  if (popup.length === 0)
    {
      var popup = $('<div id="text-select" class="bh-codepopup"><xmp>' + code + '</xmp></div>')
      popup.appendTo($('.theme-asset-actions'));
    } else
    {
      popup.css('display', 'block');
      $('.bh-codepopup xmp').text(code);
    }

  $('.bh-codepopup').click(function(e) {
    SelectText('text-select');
    e.stopPropagation();
  });

  $('html').click(function()
  {
      $('.bh-codepopup').css('display', 'none')
  });

}
