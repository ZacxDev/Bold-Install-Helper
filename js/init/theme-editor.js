
$(document).ready(function() {
  loadThemeEditor();
  loadThemeEditorListeners();
  // check customers/account.liquid for manage subs button
  getFile("templates", "customers/account.liquid", checkManageSubs);
  // refreshThemeEditor();
  // addObserver('.theme-asset-name strong', function() {
  //   refreshThemeEditor();
  // });

  chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.command == "settabs"){
        for (var i = 0; i < request.tabs.length; i++)
        {
          // stick code file name onto body attribute
          $('body').attr('cadet-opentab', request.tabs[i] + "");
          injectScript(function() {
            // grab the file name from body and open that file
              $('[data-asset-key="' + $('body').attr('cadet-opentab') + '"]').click();
          });
        }
    }
  });
});

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
   bhAjax = $('<input type="button" value="RO Ajax" class="btn bh-btn bh-ajax" />');
   bhAjax.prependTo($('.theme-asset-actions'));
  }

//ajax install menu
  bhAjaxMenu = $('.bh-ajax-menu');
  if (bhAjaxMenu.length === 0)
    {
   bhAjaxMenu = $('<div class="bh-ajax-menu" />');
   bhAjaxMenu.appendTo($('body'));
  }

  //ajax button
  bhAjaxBtn = $('.bh-ajax-btn');
  if (bhAjaxBtn.length === 0)
    {
   bhAjaxBtn = $('<input type="button" value="Narrative" class="btn bh-ajax-btn" />');
   bhAjaxBtn.appendTo($('.bh-ajax-menu'));
   bhAjaxBtn = bhAjaxBtn.clone().attr('disabled', 'disabled');
   bhAjaxBtn.val('Supply');
   bhAjaxBtn.appendTo($('.bh-ajax-menu'));
   bhAjaxBtn = bhAjaxBtn.clone();
   bhAjaxBtn.val('Turbo');
   bhAjaxBtn.appendTo($('.bh-ajax-menu'));
   bhAjaxBtn = bhAjaxBtn.clone().removeAttr('disabled');;
   bhAjaxBtn.val('Genaric');
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

}

// function refreshThemeEditor()
// {
//   var file = $('[data-bind="currentTab.basename"]:not(input)').text();
//
// //  if (roAjaxFiles.indexOf(file) == -1)
// if (file.indexOf('.js') == -1)
//   {
//     $('.bh-ajax, .bh-ajax-menu').hide();
//   } else {
//     $('.bh-ajax').show();
//   }
// }

function loadThemeEditorListeners() {

  //ro-cart install btn listener
  $(document).on('click', '.bh-ro-cart', function() {
    doROCartInstall();
  });

  //ajax btn listener
     $(document).on('click', '.bh-ajax', function(e) {
      $('.bh-ajax-menu').css('display','block');
      e.stopPropagation();
    });

    $(document).on('click', '.bh-ajax-menu', function(e) {
      e.stopPropagation();
    });

    $(document).on('click', '.bh-ajax-btn', function(e) {
      if ($(this).val() === "Narrative")
        getFile('assets', 'theme.min.js.liquid', narrativeAjaxThemeMinJs);
      if ($(this).val() === "Genaric")
        getFile('assets', 'theme.min.js.liquid', buildCartIndex);
    });

    $('.asset-listing-theme-file').click(function(e)
    {
      setTimeout(function() {
        //loadThemeEditor();
      //  refreshThemeEditor();
      }, 300);
    });
    $(document).on('click', '.template-editor-tab-filename', function(e)
    {
      setTimeout(function() {
        //loadThemeEditor();
      //  refreshThemeEditor();
      }, 300);
    });

    //hide menus when click html
    $('html').click(function()
    {
        $('.bh-codepopup').css('display', 'none');
        $('.bh-rocart-log').css('display', 'none');
        $('.bh-ajax-menu').css('display', 'none');
    });

}

function checkManageSubs(data) {

  //var lines = parseValueFromXML(data).split("\n");

//  for (var i = 0; i < lines.length; ++i)
//  {
    if (data.indexOf('/tools/checkout/front_end/login') != -1)
    {
      // if we find the code in the file, don't highlight
      return;
    }
  //}
  //if we don't find it, then highlight and append the clipboard button

  $('a[data-asset-key="templates/customers/account.liquid"]').css('background-color', 'rgba(255, 0, 0, 0.5)');
  // info hover popup
  var clipboardIcon = $('.clipboard-icon');
  if (clipboardIcon.length === 0)
  {
    var clipboardIcon = $('<div class="clipboard-icon"><img src="https://clipboardjs.com/assets/images/clippy.svg" href="#" /></div>')
    clipboardIcon.prependTo($('a[data-asset-key="templates/customers/account.liquid"]').parent());
  }

  // info hover popup
  var clipboardHover = $('.clipboard-hover');
  if (clipboardHover.length === 0)
  {
    var clipboardHover = $('<div class="clipboard-hover" style="display: none;"><xmp id="manage-subs"><p><a href="/tools/checkout/front_end/login" class="text-link">Manage Subscription</a></p></xmp></div>')
    clipboardHover.prependTo($('a[data-asset-key="templates/customers/account.liquid"]').parent());
  }
      $('.clipboard-icon').click(function() {
        $('.clipboard-hover').css('display', 'block');
        SelectText('manage-subs');
        document.execCommand('copy');
        $('.clipboard-hover').css('display', 'none');
      });
}

function doROCartInstall()
{
  injectScript(function() {
    var kv, key, name, tar = $('.theme-asset-name strong').text();
    kv = $('.ppb li:contains(' + tar + ') a').attr('data-asset-key');

    key = kv.substring(0, kv.indexOf('/'));
    value = kv.substring(kv.indexOf('/') + 1, kv.length);
    getFile(key, value, cartInstall);
  });
}

function doROAjaxInstalll()
{
    injectScript(function() {
      var kv, key, value, tar = $('.theme-asset-name strong').text();
      kv = $('.ppb li:contains(' + tar + ') a').attr('data-asset-key');

      key = kv.substring(0, kv.indexOf('/'));
      value = kv.substring(kv.indexOf('/') + 1, kv.length);
      getFile(key, value, narrativeAjaxThemeMinJs);
    });
}

function undoCadetAction()
{
  $('.cadet_undo').hide();
  injectScript(function() {
    var name = GetCurrentFileName();
    if (file_history[name] != undefined)
    {
      pushFile(GetCurrentFileKey(), name, file_history[name], refreshCodeTab);
    }
  });
}

function saveOpenTabs()
{
  var tablist = [];
  $('.template-editor-tab-filename').each(function() {
    var key = $('#asset-list').find('[data-asset-key*="' + $(this).text() + '"]');
    tablist.push(key.data('asset-key'));
  });

  chrome.runtime.sendMessage({command: "savethemetabs", tabs: tablist});
}
