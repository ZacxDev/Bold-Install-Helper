
var url;
var ACTIVE_TAB;

chrome.runtime.onMessage.addListener(
function(request, sender, sendResponse) {
  if (request.command == "geturl")
    sendResponse({url: sender.tab.url + ""});
  else if (request.command == "getapp")
  {
    // grab app string from storage
    chrome.storage.local.get({selected_app: ""}, function(items) {

      // send app string back to tab
        chrome.tabs.sendMessage(ACTIVE_TAB.id, {app: items.selected_app});
    });
  }
  else if (request.command == "savethemetabs")
  {
      saveThemeEditorTabs(request.tabs, ACTIVE_TAB.url);
  }
  else if (request.command == "getthemetabs")
  {
      getThemeEditorTabs(function(items) {
        var store = "tabs_" + ACTIVE_TAB.url.substring(0, ACTIVE_TAB.url.indexOf('?') != -1 ? ACTIVE_TAB.url.indexOf('?') : ACTIVE_TAB.url.length);
        if (items.cadet[store] != undefined)
        {
          var tablist = items.cadet[store];
          chrome.tabs.sendMessage(ACTIVE_TAB.id, {command: "settabs", tabs: tablist}, function() {});
        }
      }, ACTIVE_TAB.url);
  }
  else if (request.command == "newcoppytab")
  {
    createCoppyTab(request, function(tab, id)
    {
          chrome.tabs.sendMessage(ACTIVE_TAB.id, {command: "newtabcallback", tab: tab, id: id});
    });
  }
  else if (request.command == "newcoppyitem")
  {
    createCoppyItem(request, function()
    {
      getCoppyData(function(data) {
        chrome.tabs.sendMessage(ACTIVE_TAB.id, {command: "setcoppy", coppy: data});
      });
    });
  }
  else if (request.command == "getcoppydata")
  {
    var command = "setcoppy";
    if (request.response != undefined)
    {
      command = request.response;
    }
    getCoppyData(function(data) {
      chrome.tabs.sendMessage(ACTIVE_TAB.id, {command: command, coppy: data});
    });
  }
  else if (request.command == "getcoppytab")
  {
    var command = "returncoppytab";
    if (request.response != undefined)
    {
      command = request.response;
    }
    getCoppyTab(request.tab, function(data) {
      chrome.tabs.sendMessage(ACTIVE_TAB.id, {command: command, tab: data, name: request.tab});
    });
  }
  else if (request.command == "getcoppyitem")
  {
    getCoppyItem(request.name, request.parenttab, function(data) {
        var command = 'returncoppyitem';
        if (request.response != undefined)
        {
          command = request.response;
        }
        chrome.tabs.sendMessage(ACTIVE_TAB.id, {command: command, item: data, name: request.name, parent: request.parenttab});
    });
  }
  else if (request.command == "deletecoppydata")
  {
    deleteCoppyItems(request.items, function() {
      deleteCoppyTabs(request.tabs, function() {
        getCoppyData(function(data) {
            chrome.tabs.sendMessage(ACTIVE_TAB.id, {command: 'setcoppy', coppy: data});
        });
      });
    });
  }
  else if (request.command == "updatecoppyitem")
  {
    updateCoppyItem(request, function()
    {
      getCoppyData(function(data) {
        chrome.tabs.sendMessage(ACTIVE_TAB.id, {command: "setcoppy", coppy: data});
      });
    });
  }
  else if (request.command == "settheme")
  {
    setTheme(request.theme);
  }
  else if (request.command == "gettheme")
  {
    getTheme(function(t) {
      chrome.tabs.sendMessage(ACTIVE_TAB.id, {command: "returntheme", theme: t});
    });
  }
  else if (request.command == "newfilegroup")
  {
    newFileGroup(request, function(data) {
      getFileGroups(function(data) {
        chrome.tabs.sendMessage(ACTIVE_TAB.id, {command: "updatefilegroups", data: data});
      })
    });
  }
  else if (request.command == "getfilegroups")
  {
    var response = 'updatefilegroups';
    if (request.response != undefined)
    {
      response = request.response;
    }
    getFileGroups(function(data) {
      chrome.tabs.sendMessage(ACTIVE_TAB.id, {command: response, data: data});
    });
  }
  else if (request.command == "getfilegroup")
  {
    var response = "updatecurrentgroup";
    if (request.response != undefined)
    {
      response = request.response;
    }
    getFileGroup(request, function(group) {
      chrome.tabs.sendMessage(ACTIVE_TAB.id, {command: response, group: group})
    });
  }
  else if (request.command == "newfileitem")
  {
    newFileItem(request, function(data) {
      chrome.tabs.sendMessage(ACTIVE_TAB.id, {command: 'updatecurrentgroup', group: data});
    })
  }
  else if (request.command == "getfileitem")
  {
    var response = "returnfileitem";
    if (request.response != undefined)
    {
      response = request.response;
    }
    getFileItem(request, function(data) {
      chrome.tabs.sendMessage(ACTIVE_TAB.id, {command: response, item: data})
    });
  }
  else if (request.command == "deletefilesdata")
  {
    deleteFilesData(request);
  }
  else if (request.command == "init")
    {
      initialize(request, sender, sendResponse);
    }
});

// Listen for messages from the page
chrome.runtime.onMessageExternal.addListener(
function(request, sender, sendResponse) {
  if (request.command == "continue_coppy_batch")
  {
      // forward request map to content script
      chrome.tabs.sendMessage(ACTIVE_TAB.id, request);
  } else if (request.command == "undo_last_coppy_batch") {
      chrome.tabs.sendMessage(ACTIVE_TAB.id, request);
  } else if (request.command == "continue_files_batch")
  {
    chrome.tabs.sendMessage(ACTIVE_TAB.id, request);
  } else if (request.command == "re_init")
  {
    initialize(request, sender, sendResponse);
  }
});

function initialize(request, sender, sendResponse)
{
  url = sender.tab.url;
  ACTIVE_TAB = sender.tab;

  //don't run on extention pages
  if (url.indexOf("chrome-extension") != -1)
  {
    return;
  }
    switch(true) {
      case (url.indexOf('myshopify.com/admin/auth/recover') != -1):
        loadRecoverButtons(sender.tab);
        break;
      case (url.indexOf("recurring_settings/product_recurring") != -1  || url.indexOf('subscription_box_settings/box_settings/') != -1):
        loadROWidget(sender.tab);
        break;
      case (url.indexOf('myshopify.com/admin/themes/') != -1):
        loadThemeEditor(sender.tab);
        break;
      case (url.indexOf('/managed_stores/new') != -1):
        loadCollaboratorAccounts(sender.tab);
        break;
      default:
        break;
    }
}

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
      chrome.tabs.executeScript(tab.id, {file: "js/init/theme-editor/robocadet/robocadet.js"}, function() {
      });
    });
}

function loadCollaboratorAccounts(tab) {
  chrome.tabs.executeScript(tab.id, {file: "js/init/collabAccounts.js"}, function() {
  });
}

function saveThemeEditorTabs(tabs, store)
{
  chrome.storage.local.get({cadet: {}}, function(items) {
    store = "tabs_" + store.substring(0, store.indexOf('?')  != -1 ? store.indexOf('?') : store.length);
    // set map tp current tabs map
    var obj = items.cadet;
    // add new tabs map
    obj[store] = tabs;
    // update tabs map
    chrome.storage.local.set({
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
  chrome.storage.local.get(obj[store], function(items) {
    callback(items);
  });
}

function createCoppyTab(tab, callback)
{
//get coppy data
  chrome.storage.local.get({coppyjr: {}}, function(items) {
    // set map to current tabs map
    var obj = items.coppyjr;
    // add new tab to map
    var id = Object.keys(obj).length + 1;
    obj[id] = {};
    obj[id].items = tab.data != undefined ? tab.data : {};
    obj[id].name = tab.name;
    // update tabs map
    chrome.storage.local.set({
      coppyjr: obj
    }, function() {
      callback(obj[id], id);
    });
  });
}

function createCoppyItem(request, callback)
{
  chrome.storage.local.get({
    coppyjr:{}
  }, function(data) {
    var obj = data.coppyjr;
    // Get the item's parent tab object and insert the new item
    var parent = obj[request.parenttab];
    request.data.index = Object.keys(obj[request.parenttab]).length + 1;
    parent.items[request.name] = request.data;
    // update the parent tab in the coppyjr object
    obj[request.parenttab] = parent;
    // update the coppyjr object in storage
    chrome.storage.local.set({
      coppyjr : obj
    }, function() {
      callback();
    });
  });
}

function saveCoppyData(data)
{
  chrome.storage.local.set({
    coppyjr: data
  });
}

function getCoppyData(callback)
{
  chrome.storage.local.get({
    coppyjr: {}
  }, function(items) {
    callback(items);
  });
}

function getCoppyTab(tab, callback)
{
  chrome.storage.local.get({
    coppyjr: {}
  }, function(items) {
    callback(items.coppyjr[tab]);
  });
}

function getCoppyItem(name, parenttab, callback)
{
  chrome.storage.local.get({
    coppyjr : {}
  }, function(items) {
    var tab = items.coppyjr[parenttab];
    callback(tab.items[name]);
  });
}

function deleteCoppyItems(items, callback)
{
  chrome.storage.local.get({
    coppyjr: {}
  }, function(data) {
    var obj = data.coppyjr;
    var tab;
    for (i in items)
    {
      tab = items[i];
      delete obj[tab].items[i];
    }
    chrome.storage.local.set({
      coppyjr: obj
    }, function() {
      callback();
    });
  });
}

function deleteCoppyTabs(tabs, callback)
{
  chrome.storage.local.get({
    coppyjr: {}
  }, function(data) {
    var obj = data.coppyjr;
    for (i in tabs)
    {
      delete obj[tabs[i]];
    }
    chrome.storage.local.set({
      coppyjr: obj
    }, function() {
      callback();
    });
  });
}

function updateCoppyItem(request, callback)
{
  chrome.storage.local.get({
    coppyjr:{}
  }, function(data) {
    var obj = data.coppyjr;
    // Get the item's parent tab object and insert the new item
    var parent = obj[request.parenttab];
    request.data.index = Object.keys(obj[request.parenttab]).length + 1;
    delete parent.items[request.oldname];
    parent.items[request.name] = request.data;
    // update the parent tab in the coppyjr object
    obj[request.parenttab] = parent;
    // update the coppyjr object in storage
    chrome.storage.local.set({
      coppyjr : obj
    }, function() {
      callback();
    });
  });
}

function setTheme(theme)
{
  chrome.storage.local.set({
    theme: theme
  });
}

function getTheme(callback)
{
  chrome.storage.local.get({
    theme: ""
  }, function(t) {
    if (t.theme == "")
      callback('spooky');
    else {
      callback(t.theme);
    }
  });
}

function getFileGroups(callback)
{
  chrome.storage.local.get({
    ib_files: {}
  }, callback);
}

function newFileGroup(req, callback)
{
  chrome.storage.local.get({
    ib_files: {}
  }, function(data) {
    var obj = data.ib_files;
    var id = Object.keys(obj).length + 1;
    obj[id] = {};
    obj[id].name = req.name;
    obj[id].items = {};
    obj[id].id = id;
    chrome.storage.local.set({
      ib_files: obj
    }, function()
    {
      callback(obj);
    });
  });
}

function newFileItem(req, callback)
{
  chrome.storage.local.get({
    ib_files: {}
  }, function(data) {
    var obj = data.ib_files;
    var items = obj[req.parent].items;
    var id = Object.keys(items).length + 1;
    items[id] = {}
    items[id].name = req.name;
    items[id].content = req.content;
    items[id].include_in_theme = req.include_in_theme;
    items[id].liquid_include = req.liquid_include;
    items[id].id = id;
    obj[req.parent].items = items;
    chrome.storage.local.set({ib_files: obj}, function() {
      callback(obj[req.parent]);
    });
  });
}

function getFileGroup(req, callback)
{
  chrome.storage.local.get({
    ib_files: {}
  }, function(data) {
    var obj = data.ib_files;
    callback(obj[req.id]);
  })
}

function getFileItem(req, callback)
{
  chrome.storage.local.get({
    ib_files: {}
  }, function(data) {
    var obj = data.ib_files;
    callback(obj[req.group_id].items[req.id]);
  });
}

function deleteFilesData(req, callback)
{
  chrome.storage.local.get({
    ib_files: {}
  }, function(data) {
    var obj = data.ib_files;
    for (g in req.groups)
    {
      delete obj[req.groups[g]];
    }
    for (i in req.items)
    {
      if (req.groups.indexOf(i) == -1)
      {
        for (d in req.items[i])
        {
          delete obj[i].items[req.items[d]];
        }
      }
    }
    chrome.storage.local.set({
      ib_files: obj
    });
  });
}
