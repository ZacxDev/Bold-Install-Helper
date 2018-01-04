
var url, customer_lookup, theme_editor_buttons, recurring_orders_install, email_recovery_buttons, customer_account_highlight, collaborator_account_checkboxes, bold_file_buttons, collaborator_account_notes;

chrome.runtime.onMessage.addListener(
function(request, sender, sendResponse) {
  if (request.command == "geturl")
    sendResponse({url: sender.tab.url + ""});
  else if (request.command == "getapp")
  {
    // grab app string from storage
    chrome.storage.sync.get({selected_app: ""}, function(items) {

      // send app string back to tab
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {app: items.selected_app});
});
    });
  }
  else if (request.command == "savethemetabs")
  {
    saveThemeEditorTabs(request.tabs);
  }
  else if (request.command == "getthemetabs")
  {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      getThemeEditorTabs(function(tablist) {
        chrome.tabs.sendMessage(tabs[0].id, {command: "settabs", tabs: tablist}, function() {});
      });
    });
  }
  else if (request.command == "init")
    {
      url = sender.tab.url;

      //don't run on extention pages
      if (url.indexOf("chrome-extension") != -1)
      {
        return;
      }

        chrome.storage.sync.get({
          customer_lookup_option: false,
          theme_editor_buttons_option: false,
          recurring_orders_install_option: false,
          email_recovery_buttons_option: false,
          customer_account_highlight_option: false,
          bold_buttons_options: false,
          collaborator_account_checkboxes_options: false,
          collaborator_account_notes_options: ""
        }, function(items) {
          customer_lookup = items.customer_lookup_option;
          theme_editor_buttons = items.theme_editor_buttons_option;
          recurring_orders_install = items.recurring_orders_install_option;
          email_recovery_buttons = items.email_recovery_buttons_option;
          bold_file_buttons =  items.bold_buttons_options;
          customer_account_highlight = items.customer_account_highlight_option;
          collaborator_account_checkboxes = items.collaborator_account_checkboxes_options;
          collaborator_account_notes = items.collaborator_account_notes_options;
        switch(true) {
          case (url.indexOf('myshopify.com/admin/auth/recover') != -1 && email_recovery_buttons):
            loadRecoverButtons(sender.tab);
            break;
          case (url.indexOf("recurring_settings/product_recurring") != -1 && recurring_orders_install || url.indexOf('subscription_box_settings/box_settings/') != -1 && recurring_orders_install):
            loadROWidget(sender.tab);
            break;
          case (url.indexOf('myshopify.com/admin/themes/') != -1 && theme_editor_buttons && customer_account_highlight):
            loadThemeEditor(sender.tab);
          case (url.indexOf('myshopify.com/admin/themes/') != -1 && bold_file_buttons):
              loadCreationButtons(sender.tab);
              break;
          case (url.indexOf('util.boldapps.net/admin/liquid/requests') != -1 && customer_lookup):
            loadCusLookup(sender.tab);
            break;
          case (url.indexOf('/managed_stores/new') != -1 && collaborator_account_checkboxes):
              loadCollaboratorAccounts(sender.tab);
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
  chrome.tabs.executeScript(tab.id, {file: "js/init/theme-editor/liquidScanner.js"}, function() {
    chrome.tabs.executeScript(tab.id, {file: "js/init/theme-editor.js"}, function() {
      chrome.tabs.executeScript(tab.id, {file: "js/init/theme-editor/robocadet/robocadet.js"}, function() {
      });
    });
  });
}

function loadCusLookup(tab) {
  chrome.tabs.executeScript(tab.id, {file: "js/init/cuslookup.js"}, function() {
  });
}
function loadCreationButtons(tab) {
  chrome.tabs.executeScript(tab.id, {file: "js/init/creationButtons.js"}, function() {
  });
}

function loadCollaboratorAccounts(tab) {
  chrome.tabs.executeScript(tab.id, {file: "js/init/collabAccounts.js"}, function() {
  });
}

$(document).ready(function() {

});

function saveThemeEditorTabs(tabs)
{
  chrome.storage.sync.set({
    theme_editor_tabs: tabs
  }, function() {
    console.log('Saved tabs');
  });
}

function getThemeEditorTabs(callback)
{
  chrome.storage.sync.get({
    theme_editor_tabs: []
  }, function(items) {
    callback(items.theme_editor_tabs);
  });
}
