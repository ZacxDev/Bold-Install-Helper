
// This file is used for global stuff as it is loaded everywhere

//////////////////
// SCANNER DATA //
//////////////////

// @variable roFiles: this is used for api calls to read the files, must match query string format
var roFiles = [ "layout/theme.liquid", "templates/cart.liquid", "templates/product.liquid", "sections/cart-template.liquid", "sections/product-template.liquid", "sections/featured-product.liquid", "snippets/cart-drawer.liquid", "templates/customersaccount.liquid" ];
// key must match an roFiles file name, replace all - with _, remove all '/'
// spacing does not matter in hooks
// @variable roHooks: this is used to search the files, make as genaric as possible
var roHooks = {
  theme: ["include 'bold-common'", "include 'bold-ro-init'", "'bold-helper-functions.js'|asset_url|script_tag", "'bold-ro.css'|asset_url|stylesheet_tag"],
  cart : ["include 'bold-cart'"],
  product : ["include 'bold-ro'", "include 'bold-product' with product, hide_action: 'break', output: 'none'"],
  cart_template : ["include 'bold-cart'", "include 'bold-cart-item' with item", "{{ bold_recurring_desc }}", 'bold_item_price', "bold_cart_total_price", "{{ bold_ro_cart }}", "if additional_checkout_buttons and show_paypal"],
  product_template : [],
  cart_drawer : [],
  customersaccount: ['<p><a href="/tools/checkout/front_end/login" class="text-link">Manage Subscription</a></p>']
}

//unused so far
var roOptionalHooks = {
  theme: ["'bold-helper-functions.js'|asset_url|script_tag", "'bold-ro.css'|asset_url|stylesheet_tag"]
}

// ro snippets
// @variable roSnips: this is used to populate the snippets on missing code page (missingCode.html|.js|.css), MUST be functional and proper code, MUST match an roFiles entry without key or extention, MUST replace all '-' with '_'
var roSnips = {
  theme : {
    includes: ["{%- include 'bold-ro-init' -%}", "{%- include 'bold-common' -%}", "{%- include 'bold-product' with product, hide_action: 'header' -%}"]
  },
  product : {
    includes: ["{%- include 'bold-ro' -%}", "{%- include 'bold-product' with product, hide_action: 'break', output: 'none' -%}"]
  },
  cart : {
    includes: ["{%- include 'bold-cart' -%}"]
  },
  cart_template : {
    includes: ["{%- include 'bold-cart' -%}"],
    loop_cart_item: ["{%- include 'bold-cart-item' with item -%}"],
    recurring_desc: ["{{ bold_recurring_desc }}"],
    prices: ['bold_item_price', "bold_cart_total_price"],
    cart_widget: ["{{ bold_ro_cart }}"],
    show_paypal: ["{%- if additional_checkout_buttons and show_paypal -%}"]
  },
  customersaccount: {
    manage_subs: ['<p><a href="/tools/checkout/front_end/login" class="text-link">Manage Subscription</a></p>']
  },
  product_template: {
    includes: ["{%- include 'bold-ro' -%}", "{%- include 'bold-product' with product, hide_action: 'break', output: 'none' -%}"],
    ro_widget: ["{{ bold_ro_widget }}"],
    add_to_existing: ['<!-- bold-ro-liquid --><div class="bold_add_to_orders" style="display: inline-block;"></div><!-- bold-ro-liquid -->'],
    product_json: ["{%- include 'bold-product', output: 'json' -%}"]
  },
  featured_product: {
    product_json: ["{%- include 'bold-product', output: 'json' -%}"]
  }
}

//////////////////////
// SCANNER DATA END //
//////////////////////


var clicked = false;
// cartInclude, forItemInclude, boldDesc, itemPrice, cartTotalPrice, itemLinePrice, showPaypal
var cart_log = [ false, false, false, false, false, false, false ];

$( document ).ready(function() {
  console.log('ready');

  // chrome.runtime.onMessage.addListener(
  //   function(request, sender, sendResponse) {
  //     console.log(sender.tab ?
  //                 "from a content script:" + sender.tab.url :
  //                 "from the extension");
  //   });

  chrome.runtime.sendMessage({command: "init"}, function(response) {
    //console.log(response.url);
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
  } else if (this.status == 404)
  {
    callback(undefined);
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
  if (data == undefined)
    return '';

  var value = '';
  var code = '';
  var parser = new DOMParser();
  value = parser.parseFromString(data, 'text/xml');
  code = value.getElementsByTagName('value')[0].childNodes[0].nodeValue;
  return code;
}

//we need to get the name of store from the URL and then set URL to *name*.myshopify.com/admin/products.json
function getProduct(callback, title, myshopify, var_id = '0')
{

var url = 'https://' + myshopify + '.myshopify.com/admin/products.json';

  var xhr = new XMLHttpRequest();
xhr.open('get', url, true);
//xhr.responseType = 'text';
xhr.onload = function(e) {
  if (this.status == 200) {
    var response = this.response;
    //console.log(response)
    callback(response, title, var_id);
  }
};
xhr.send();
}

function setProdSelector(data, title, var_id)
{
  var json = JSON.parse(data).products;

  for (var i = 0; i < json.length; ++i)
  {
    if (json[i]['title'].indexOf(title) != -1)
    {
    //  debugger;
      var id = json[i]['id'];
      $('#select_product').first().val('{"select":1,"products":[{"prod_id":"' + id + '","id":"0"}]}');
      $('#select_product_visible').val(title);

      var id = json[i]['variants'][0].id;

      //$('#select_product_visible').parent().find('.btn').click()
      $("#select_product")[0].product_selector.show();
    //  setTimeout(function() {

      visible_product_selector.select_product(id, '0', id + "-0");
      visible_product_selector.continue_with_product();
      //$(document).trigger('close.facebox')
    //}, 2000);
      break;
    }
  }
}
//this function works fine
function setRecurringProdSelector(data, title, var_id)
{
  var json = JSON.parse(data).products;

  for (var i = 0; i < json.length; ++i)
  {
    if (json[i]['title'].indexOf(title) != -1)
    {
      var id = json[i]['id'];
      $('#select_recurring_product').first().val('{"select":1,"products":[{"prod_id":"' + id + '","id":"0"}]}');
      $('#select_recurring_product_visible').val(title);

      var id = json[i]['variants'][0].id;

      $("#select_recurring_product")[0].product_selector.show();
      setTimeout(function() {
      visible_product_selector.select_product(id, var_id, id + '-' + var_id);
      visible_product_selector.continue_with_product();
      $(document).trigger('close.facebox')
      }, 1000);

      break;

    }
  }
}

function SelectText(element) {
    var doc = document
        , text = doc.getElementById(element)
        , range, selection
    ;
    if (doc.body.createTextRange) {
        range = document.body.createTextRange();
        range.moveToElementText(text);
        range.select();
    } else if (window.getSelection) {
        selection = window.getSelection();
        range = document.createRange();
        range.selectNodeContents(text);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}
