
var classArr = ['cm-comment', 'cm-liquid', 'CodeMirror-matchingtag', 'cm-tag','cm-attribute', 'cm-braket', 'cm-string'];
var clicked = false;
var cartFiles = ['cart.liquid', 'cart-template.liquid', 'header.liquid', 'cart-drawer.liquid'];
// cartInclude, forItemInclude, boldDesc, itemPrice, cartTotalPrice, itemLinePrice, showPaypal
var cart_log = [ false, false, false, false, false, false, false ];

$( document ).ready(function() {
  console.log('ready');

  // chrome.runtime.sendMessage({
  //   from:    'content',
  //   message: 'zach'
  // });
  //
  // chrome.runtime.onMessage.addListener(
  //   function(request, sender, sendResponse) {
  //     console.log(sender.tab ?
  //                 "from a content script:" + sender.tab.url :
  //                 "from the extension");
  //   });

  var shopifyLogin = false;
  var liqReqPage = false;
  var themeEditor = false;

  if ($('.theme-asset-actions').length != 0)
    themeEditor = true;

  if($(".ico-shopify-bag").length != 0)
  {
    shopifyLogin = true;
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
