
$(document).ready(function() {

  // check customers/account.liquid for manage subs button
  getFile("templates", "customers/account.liquid", checkManageSubs);

  openSavedTabs();
});

function checkManageSubs(data) {
    if (data.indexOf('/tools/checkout/front_end/login') != -1)
    {
      // if we find the code in the file, don't highlight
      return;
    }
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

function saveOpenTabs()
{
  var tablist = [];
  $('.template-editor-tab-filename').each(function() {
    var key = $('#asset-list').find('[data-asset-key*="' + $(this).text() + '"]');
    tablist.push(key.data('asset-key'));
  });

  chrome.runtime.sendMessage({command: "savethemetabs", tabs: tablist});
}

function openSavedTabs()
{
  chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.command == "settabs"){
      if (request.tabs.length <= 0)
      {
        return;
      }
      var tar = document.querySelector('strong[data-bind="currentTab.basename"]');
      var i = 1;
      var observer = new MutationObserver(function() {
        injectScript(function(s) {
            $('[data-asset-key="' + s + '"]').click();
        }, [request.tabs[i]]);
        i++;
        if (i >= request.tabs.length)
        {
          observer.disconnect();
        }
      });
      observer.observe(tar, {childList: true});
      //click the first asset to start the mutation observer
      injectScript(function(s) {
          $('[data-asset-key="' + s + '"]').click();
      }, [request.tabs[0]]);
    }
  });

// send get tabs message that will trigger above listener
  chrome.runtime.sendMessage({command: "getthemetabs"});
}
