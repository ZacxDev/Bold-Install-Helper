
function loadEmailButtons()
{
    collab = $('<input type="button" class="bh-button btn bh-collab" value="Collab" />');
    //collab.prependTo($('span .card div .btn-primary:contains("Send")').parent());

    $('.bh-collab').click(function(e)
    {
      var line = $('div[data-contents="true"] div').last();
    //  line.find('span[data-text="true"]').text('collab\nmessage');
      //line.appendTo('div[data-contents="true"]');
    });
}


function loadCusLookupBtns()
{
  destroyCusButtons();
  var url;
  var  btn = $('<a type="button" target="_blank" class="customer-lookup-btn btn btn-primary">Lookup</a>');
  var columnHeader = $('<th class="customerLookup"> <span>Customer Lookup</span> </th>')[0];
  var tableHeaderChild = $('.install-row').children().eq(1)[0]
  var tableBodyChild = $('tbody tr')
  tableHeaderChild.after(columnHeader)
  $('tbody > tr').each(function(index, element) {
    var tableRow = $('tbody tr').eq(index)[0];

    var url = ($(tableRow).find("td > div > a")[0]).text;
    url = url.substring(url.indexOf('//') + 1, url.length);
    ($('tbody tr').eq(index)).children().eq(1)[0].after($('<td class="customerLookup"> <span> <a type="button" target="_blank" class="customer-lookup-btn btn btn-primary">Lookup</a> </span> </td> ')[0]);
    $('.customer-lookup-btn').eq(index).attr('href', 'https://util.boldapps.net/admin/shop?shop=' + url);
  });
}
function destroyCusButtons()
{
  if($('.customerLookup'))
  {
    $('.customerLookup').remove();
  }
}
function loadSubscriptionWidget()
{
  var widget = $('<div class="bold-install-widget" />');
  widget.appendTo($(".segment-header-actions"));

    var input = $('<input type="button" value="Fill Subs" class="btn btn-primary bold-install-dropdown" />');
    input.appendTo($(".bold-install-widget"));

    var flex = $('<div class="bold_flex_div" />');
    flex.appendTo($(".bold-install-widget"));

    var div = $('<div class="bold-install-dropdown-menu" />');
    div.appendTo($(".bold_flex_div"));

    var testOne = $('<input type="button" value="Standard" class="btn bold-install bold-install-testOne" />');
    testOne.appendTo($(".bold-install-dropdown-menu"));

    var testTwo = $('<input type="button" value="Convertible" class="btn bold-install bold-install-testTwo" />');
    testTwo.appendTo($(".bold-install-dropdown-menu"));

    var testThree = $('<input type="button" value="Build A Box" class="btn bold-install bold-install-testThree" />');
    testThree.appendTo($(".bold-install-dropdown-menu"));

}

var bhAjax;
var bhInstallMenu;
var bhROCartInstall, popup;
var bhCacheBusterToggle;
function loadThemeEditor()
{

  // button to open ajax menu
  bhAjax = $('.bh-ajax');
  if (bhAjax.length === 0)
    {
   bhAjax = $('<input type="button" value="Ajax" class="btn bh-btn bh-ajax" />');
   bhAjax.prependTo($('.theme-asset-actions'));
  }

//ajax install menu
  bhAjaxMenu = $('.bh-ajax-menu');
  if (bhAjaxMenu.length === 0)
    {
   bhAjaxMenu = $('<div class="bh-ajax-menu" />');
   bhAjaxMenu.appendTo($('.file-overview'));
  }

  //ajax button
  bhAjaxBtn = $('.bh-ajax-btn');
  if (bhAjaxBtn.length === 0)
    {
   bhAjaxBtn = $('<input type="button" value="Narrative" class="bh-ajax-btn" />');
   bhAjaxBtn.appendTo($('.bh-ajax-menu'));
   bhAjaxBtn = bhAjaxBtn.clone().attr('disabled', 'disabled');
   bhAjaxBtn.val('Supply');
   bhAjaxBtn.appendTo($('.bh-ajax-menu'));
   bhAjaxBtn = bhAjaxBtn.clone();
   bhAjaxBtn.val('Turbo');
   bhAjaxBtn.appendTo($('.bh-ajax-menu'));
  }


//ro cart install btn
 bhROCartInstall = $('.bh-ro-cart');
 if (bhROCartInstall.length === 0)
   {
  bhROCartInstall = $('<input type="button" value="RO Cart Install" class="btn bh-btn bh-ro-cart" />');
  bhROCartInstall.prependTo($('.theme-asset-actions'));
 }

//ro cart code popup
 var popup = $('.bh-codepopup');
 if (popup.length === 0)
   {
     var popup = $('<div id="text-select" class="bh-codepopup"><xmp></xmp></div>')
     popup.appendTo($('.file-overview'));
   }

// ro cart install log
   var log = $('.bh-rocart-log');
   if (log.length === 0)
     {
       var log = $('<div class="bh-rocart-log"></div>')
       log.prependTo($('.theme-asset-actions'));
     }

// check if a cart file is open to append ro-cart btn
  // if ($.inArray($('.theme-asset-name strong').text(), cartFiles) != -1)
  // {
  //     bhROCartInstall.css('display', 'block');
  // } else {
  //   bhROCartInstall.css('display', 'none');
  // }

//ro-cart install btn listener
  $('.bh-ro-cart').click(function() {
    var kv, key, name, tar = $('.theme-asset-name strong').text();
    kv = $('.ppb li:contains(' + tar + ') a').attr('data-asset-key')

    key = kv.substring(0, kv.indexOf('/'))
    value = kv.substring(kv.indexOf('/') + 1, kv.length)

    getFile(key, value, cartInstall);
  });

//ajax btn listener
  $('.bh-ajax').click(function(e) {
    $('.bh-ajax-menu').css('display','block');
    e.stopPropagation();
  });

  $('.bh-ajax-menu').click(function(e) {
    e.stopPropagation();
  });

  $('.bh-ajax-btn').click(function(e) {
    if ($(this).val() === "Narrative")
      getFile('assets', 'theme.min.js.liquid', narrativeAjaxThemeMinJs);
  });

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
