
// This file is used for global stuff as it is loaded everywhere


var clicked = false;

$( document ).ready(function() {
  console.log('ready');
  chrome.runtime.sendMessage({command: "init"});

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
  var id = $('.action-bar__top-links a').attr('href');
  id = id.substring(0, id.indexOf("/editor"));
  var url = id + "/assets?asset%5Bkey%5D=" + key + "%2F" + name;

  $.get(id + '/assets.json?asset[key]=' + key + '/' + name + '&theme_id=' + id, function(data) {
    callback(key, name, data.asset.value);
  });
}

/*
* @param: func - the function that is injected, must be anonymous, can take string params
* @param: parms - must be an array of strings to pass into function as params
*/
function injectScript(func, param)
{
  if (typeof param != 'object')
    param = "";
  var script = document.createElement('script');
  script.textContent = "(" + func + ")(";

// if it's an array, iterate the value and pass them as paramaters
  if (typeof param == 'object')
  {
    for (var i = 0; i < param.length; i++)
    {
      // surround with quotes to make string value as it's injected as plaintext
      script.textContent += "'" + param[i] + "',";
    }
  }

  // close function call and pass empty string so that last comma from for loop doesn't break stuff
  script.textContent += "'');";

  (document.head||document.documentElement).appendChild(script);
//  script.remove();
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
        , text = doc.querySelector(element)
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
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$&");
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function readTextFile(file, callback)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                callback(allText)
            }
        }
    }
    rawFile.send(null);
}

function getIndexsOf(str, x)
{
  var indices = [];
  for(var i=0; i<str.length;i++) {
      if (str[i] === x) indices.push(i);
  }
  return indices;
}
