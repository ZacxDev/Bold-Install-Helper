
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
  var url;
  var  btn = $('<a type="button" target="_blank" class="customer-lookup-btn btn btn-primary">Lookup</a>');
  btn.prependTo($(".with-row-borders td div a").parent().closest('td'));

  $('.customer-lookup-btn').each(function() {
    url = $(this).parent().find('div').find('a').text();
    url = url.substring(url.indexOf('//') + 1, url.length);
    //console.log(url);
    $(this).attr('href', 'https://util.boldapps.net/admin/shop?shop=' + url);
  });
}

function loadSubscriptionWidget()
{
  var widget = $('<div class="bold-install-widget" />');
  widget.appendTo($(".segment-header-actions"));



    var input = $('<input type="button" value="Install" class="btn btn-primary bold-install-dropdown" />');
    input.appendTo($(".bold-install-widget"));

    var flex = $('<div class="bold_flex_div" />');
    flex.appendTo($(".bold-install-widget"));

    var div = $('<div class="bold-install-dropdown-menu" />');
    div.appendTo($(".bold_flex_div"));

    var testOne = $('<input type="button" value="Standard" class="bold-install bold-install-testOne" />');
    testOne.appendTo($(".bold-install-dropdown-menu"));

    var testTwo = $('<input type="button" value="Convertible" class="bold-install bold-install-testTwo" />');
    testTwo.appendTo($(".bold-install-dropdown-menu"));

    var testThree = $('<input type="button" value="Build A Box" class="bold-install bold-install-testThree" />');
    testThree.appendTo($(".bold-install-dropdown-menu"));

}

var bhFixes;
var bhInstallMenu;
var bhROCartInstall, popup;
var bhCacheBusterToggle;
function loadThemeEditor()
{
  // bhFixes = $('.bh-fixes');
  //
  // if (bhFixes.length === 0)
  //   {
  //  bhFixes = $('<input type="button" value="Fixes" class="btn bh-btn bh-fixes" />');
  //  bhFixes.prependTo($('.theme-asset-actions'));
  // }

 //  bhInstallMenu = $('.bh-install-menu');
 //  if (bhInstallMenu.length === 0)
 //    {
 //   bhInstallMenu = $('<div class="bh-install-menu bh-btn" />');
 //   bhInstallMenu.appendTo($('.file-overview'));
 // }

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

  // if ($.inArray($('.theme-asset-name strong').text(), cartFiles) != -1)
  // {
  //     bhROCartInstall.css('display', 'block');
  // } else {
  //   bhROCartInstall.css('display', 'none');
  // }

  $('.bh-ro-cart').click(function() {
    var kv, key, name, tar = $('.theme-asset-name strong').text();
    kv = $('.ppb li:contains(' + tar + ') a').attr('data-asset-key')

    key = kv.substring(0, kv.indexOf('/'))
    value = kv.substring(kv.indexOf('/') + 1, kv.length)

    getFile(key, value, cartInstall);
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
