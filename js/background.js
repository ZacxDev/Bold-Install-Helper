
var url, customer_lookup, theme_editor_buttons, recurring_orders_install, email_recovery_buttons, customer_account_highlight;

chrome.runtime.onMessage.addListener(
function(request, sender, sendResponse) {
  if (request.command == "geturl")
    sendResponse({url: sender.tab.url + ""});
  else if (request.command == "init")
    {
      url = sender.tab.url;
        chrome.storage.sync.get({
          customer_lookup_option: false,
          theme_editor_buttons_option: false,
          recurring_orders_install_option: false,
          email_recovery_buttons_option: false,
          customer_account_highlight_option: false
        }, function(items) {
          console.log(items);
          customer_lookup = items.customer_lookup_option;
          theme_editor_buttons = items.theme_editor_buttons_option;
          recurring_orders_install = items.recurring_orders_install_option;
          email_recovery_buttons = items.email_recovery_buttons_option;
          customer_account_highlight = items.customer_account_highlight_option;
          console.log(customer_lookup);

          switch(true) {
            case (url.indexOf('myshopify.com/admin/auth/recover') != -1 && email_recovery_buttons):
              loadRecoverButtons(sender.tab);
              break;
            case (url.indexOf("recurring_settings/product_recurring") != -1 && recurring_orders_install || url.indexOf('subscription_box_settings/box_settings/') != -1 && recurring_orders_install):
              loadROWidget(sender.tab);
              break;
            case (url.indexOf('myshopify.com/admin/themes/') != -1 && theme_editor_buttons && customer_account_highlight):
              loadThemeEditor(sender.tab);
              break;
            case (url.indexOf('util.boldapps.net/admin/liquid/requests') != -1 && customer_lookup):
              loadCusLookup(sender.tab);
              break;
            default:
              break;
          }
        });
    }
});

function loadRecoverButtons(tab) {
  chrome.tabs.executeScript(tab.id, {file: "js/init/recoverbuttons.js"}, function() {
  });
}

function loadROWidget(tab) {
  chrome.tabs.executeScript(tab.id, {file: "js/init/rowidget.js"}, function() {
  });
}

function loadThemeEditor(tab) {
  chrome.tabs.executeScript(tab.id, {file: "js/init/theme-editor.js"}, function() {
  });
}

function loadCusLookup(tab) {
  chrome.tabs.executeScript(tab.id, {file: "js/init/cuslookup.js"}, function() {
  });
}

$(document).ready(function() {

});
