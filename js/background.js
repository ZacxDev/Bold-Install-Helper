
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
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    saveThemeEditorTabs(request.tabs, tabs[0].url);
    });
  }
  else if (request.command == "getthemetabs")
  {
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function(tabs) {
      getThemeEditorTabs(function(items) {
        var store = "tabs_" + tabs[0].url.substring(0, tabs[0].url.indexOf('?') != -1 ? tabs[0].url.indexOf('?') : tabs[0].url.length);
        var tablist = items.cadet[store];
        chrome.tabs.sendMessage(tabs[0].id, {command: "settabs", tabs: tablist}, function() {});
      }, tabs[0].url);
    });
  }
  else if (request.command == "newcoppytab")
  {
    createCoppyTab(request.name, function(tab)
    {
    //  getCoppyData(function(data) {
        chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {command: "newtabcallback", tab: tab, name: request.name});
        });
      //});
    });
  }
  else if (request.command == "newcoppyitem")
  {
    createCoppyItem(request, function()
    {
      getCoppyData(function(data) {
        chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {command: "setcoppy", coppy: data});
        });
      });
    });
  }
  else if (request.command == "getcoppydata")
  {
    getCoppyData(function(data) {
      chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {command: "setcoppy", coppy: data});
      });
    });
  }
  else if (request.command == "getcoppytab")
  {
    getCoppyTab(request.tab, function(data) {
      chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {command: "returncoppytab", tab: data, name: request.tab});
      });
    });
  }
  else if (request.command == "getcoppyitem")
  {
    getCoppyItem(request.name, request.parenttab, function(data) {
      chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
        var command = 'returncoppyitem';
        if (request.response != undefined)
        {
          command = request.response;
        }
        chrome.tabs.sendMessage(tabs[0].id, {command: command, item: data, name: request.tab});
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
          case (url.indexOf('myshopify.com/admin/themes/') != -1):
            loadThemeEditor(sender.tab);
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

function saveThemeEditorTabs(tabs, store)
{
  chrome.storage.sync.get({cadet: {}}, function(items) {
    store = "tabs_" + store.substring(0, store.indexOf('?')  != -1 ? store.indexOf('?') : store.length);
    // set map tp current tabs map
    var obj = items.cadet;
    // add new tabs map
    obj[store] = tabs;
    // update tabs map
    chrome.storage.sync.set({
      cadet: obj
    }, function() {
      console.log('Saved tabs');
    });
});
}

function getThemeEditorTabs(callback, store)
{
  store = "tabs_" + store.substring(0, store.indexOf('?') != -1 ? store.indexOf('?') : store.length);
  var obj = {};
  chrome.storage.sync.get(obj[store], function(items) {
    callback(items);
  });
}

function createCoppyTab(name, callback)
{
//get coppy data
  chrome.storage.sync.get({coppyjr: {}}, function(items) {
    // set map to current tabs map
    var obj = items.coppyjr;
    // add new tab to map
    obj[name] = {};
    // update tabs map
    chrome.storage.sync.set({
      coppyjr: obj
    }, function() {
      callback(obj[name]);
    });
  });
}

function createCoppyItem(request, callback)
{
  chrome.storage.sync.get({
    coppyjr:{}
  }, function(data) {
    var obj = data.coppyjr;
    // Get the item's parent tab object and insert the new item
    var parent = obj[request.parenttab];
    request.data.index = Object.keys(obj[request.parenttab]).length + 1;
    parent[request.name] = request.data;
    // update the parent tab in the coppyjr object
    obj[request.parenttab] = parent;
    // update the coppyjr object in storage
    chrome.storage.sync.set({
      coppyjr : obj
    }, function() {
      callback();
    });
  });
}

function saveCoppyData(data)
{
  chrome.storage.sync.set({
    coppyjr: data
  });
}

function getCoppyData(callback)
{
  chrome.storage.sync.get({
    coppyjr: {}
  }, function(items) {
    callback(items);
  });
}

function getCoppyTab(tab, callback)
{
  chrome.storage.sync.get({
    coppyjr: {}
  }, function(items) {
    callback(items.coppyjr[tab]);
  });
}

function getCoppyItem(name, parenttab, callback)
{
  chrome.storage.sync.get({
    coppyjr : {}
  }, function(items) {
    var tab = items.coppyjr[parenttab];
    callback(tab[name]);
  });
}
