var OPEN_COPPY_TAB;
var COPPY_BATCH = {};
var RELOAD_HANDLED = false;
var CADET_UPLOAD_BATCH = {};
var EXTENSION_ID = "clgokdfdcmjdmpooehnjkjdlhinkocgc";

$(document).ready(function() {

// Check if on theme editor page
  if ($('.template-editor-container').length == 0)
    return;

  $.get(chrome.extension.getURL('js/init/theme-editor/robocadet/robocadet.html'), function(data) {
    $('body').prepend(data);

    // set image on cadet peek
    var src = chrome.extension.getURL('resources/icon.png');
    $('.cadet_peek img').attr('src', src);
    $('.cadet_peek').prependTo('.theme-asset-actions');

    chrome.extension.sendMessage({command: "gettheme"});
    // inject stylesheet
    var globalstyle = $('<link rel="stylesheet" type="text/css" href="' + chrome.extension.getURL('js/init/theme-editor/robocadet/style/global.css') + '">');
    $('head').append(globalstyle);
    var jqueryui = $('<link rel="stylesheet" type="text/css" href="' + chrome.extension.getURL('style/jquery-ui.css') + '">');
    $('head').append(jqueryui);

    var style = document.createElement('style');
    style.textContent = ".ui-resizable-handle.ui-resizable-se.ui-icon.ui-icon-gripsmall-diagonal-se {background-image:url(" + chrome.extension.getURL('resources/resize.png') + ");}"
    document.head.appendChild(style);

    // inject install.js
    var installjs = $('<script src="' + chrome.extension.getURL('js/init/theme-editor/robocadet/install.js') + '"></script>');
    $('head').append(installjs);

    // hide menus so that we don't see initial transition
    $('.cadet_menu').hide();
    // load listeners
    loadCadetListeners();

    var viewSnip = $('<img class="cadet_snip_view" data-opens="cadet_view_snip_menu_js" src="' + chrome.extension.getURL('resources/viewsnip.png') + '"/>');
    viewSnip.prependTo($('.cadet_snip').parent());

    $('.coppy_gear').attr('src', chrome.extension.getURL('resources/gear.png'));
    $('.coppy_execute_all').attr('src', chrome.extension.getURL('resources/runallcoppy.png'));
    $('.loading').attr('src', chrome.extension.getURL('resources/loading.gif'));

    loadMessageListeners();
    populateCoppy();
    populateFiles();
  });
});


function loadCadetListeners()
{
  $(document).on('click', '.cadet-btn', function() {
    refreshCadetModal($(this));
  });

  $(document).on('click', '.cadet_snip_view', function() {
    var $this = $(this);
    prepareViewSnipMenu($this, function() {
      // Use toggle menu so that the menu button takes you back to snips menu
      toggleMenu($('.' + $this.data('opens')), $this);
    });
  });

  $(document).on('click', '.cadet_close', function() {
    $('.cadet_modal').hide();
    $('.cadet_peek').show();
  });
  $(document).on('click', '.cadet_peek', function() {
    $('.cadet_modal').show();
    $('.cadet_peek').hide();
    if ($('.cadet_stylesheet').length == 0)
    {
      var next = $('.cadet_theme_select').find(':selected').attr('name');
      updateTheme(next);
    }
    if ($('.ui-resizable-handle').length == 0)
    {
      injectScript(function() {
          $('.cadet_modal').resizable({
              aspectRatio: true
          });
      });
    }
  });
  $(document).on('click', '.cadet_expand', function() {
    hideDropdown($('.cadet_expand_selected'));
    var tar = $(this).data('expands');
    $('.' + tar).show();
    $('.' + tar).css('transform', 'scale(1,1)');
    $(this).addClass('cadet_hide cadet_expand_selected');
  });
  $(document).on('click', '.cadet_hide', function() {
    hideDropdown($(this));
  });

  $(document).on('click', '.cadet_undo', function() {
    undoCadetAction();
  });

  $(document).on('click', '.cadet_robo', function() {
    $('.cadet_undo').show();
  });

  $(document).on('click', '.cadet_menu_toggle', function() {
    var tar = this.dataset['opens'];
    toggleMenu($('.' + tar));
  });

  $(document).on('click', '.files_css', function() {
    uploadAndIncludeFile('/snippets/bold-custom.txt', 'assets', 'bold-custom.css', '{{ "bold-custom.css" | asset_url | stylesheet_tag }}', 'bold-custom.css');
  });

  // $(document).on('click', '.files_jsboldhelpers', function() {
  //   uploadAndIncludeFile('/snippets/bold-helper-functions.txt', 'assets', 'bold-helper-functions.js.liquid', '{{ "bold-helper-functions.js" | asset_url | script_tag }}', 'bold-helper-functions');
  // });
  //
  // $(document).on('click', '.files_jsboldhelpers', function() {
  //   uploadAndIncludeFile('/snippets/bold-helper-functions-ro.txt', 'assets', 'bold-helper-functions.js.liquid', '{{ "bold-helper-functions.js" | asset_url | script_tag }}', 'bold-helper-functions');
  // });

  $(document).on('click', '.cadet_snip', function() {
    var $this = $(this);
    var snipname = $this.data('snip');
    var app = $this.closest('table[data-app]').data('app');
    getSnippet(app, snipname, function(snip) {
      $('.cadet_text_dump').text(snip);
      $('.cadet_text_dump').css('display', 'block');
      SelectText('.cadet_text_dump');
      document.execCommand("Copy");
      $('.cadet_text_dump').hide();
    });
    var text = $this.text();
    $this.text('Copied!');
    setTimeout(function() {
        $this.text(text);
    }, 700);
  });

  $(document).on('click', '[data-opens="cadet_snippets_menu"]', function() {
    $('.cadet_menu_app_select').show();
  });

  $(document).on('change', '.cadet_menu_app_select', function() {
    var app = $(this).find(':selected').data('app');
    $('.cadet_snip_table').hide();
    $('.cadet_snip_table[data-app="' + app + '"]').show();

    if (app === "all")
    {
      $('.cadet_snip_table').show();
    }
  });

  $(document.body).on('click', '[href]:not([data-asset-key])', function() {
    RELOAD_HANDLED = true;
  });

  window.onbeforeunload = function(e) {
      if (!RELOAD_HANDLED)
      {
        e.preventDefault();
        saveOpenTabs();
        injectScript(function() {
          $('.template-editor-close-tab').click();
        });
        setTimeout(function() {
          location.reload();
        }, 200);
        RELOAD_HANDLED = true;
      }
  }

  $(document).on('click', '.cadet_new_coppy_tab input[name="create"]', function() {
    var name = $('input[name="coppy_tab_name"]').val();
    chrome.runtime.sendMessage({command: "newcoppytab", name: name});
  });

  $(document).on('change', '.cadet_coppy_tab_select', function() {
    beginUpdateCoppyMenu();
  });

  $(document).on('click', '#per_file_hooks', function() {
    updatePerFileHooks();
  });

  $(document).on('change', '[name="coppy_item_files"]', function() {
    updatePerFileHooks();
  });

  $(document).on('click', '.coppy_create_item, .coppy_update_item', function() {
    // gather name, content, files, and hooks for the item
    var parenttab = OPEN_COPPY_TAB;
    var name = $('input[name="coppy_item_name"]').val();
    var content = $('textarea.coppy_item_content').val();
    var files = $('[name="coppy_item_files"]').val();
    files = files.split(',');
    var hooks = $('[name="coppy_item_hooks"]').val();
    hooks = hooks.split(',');
    var command = "newcoppyitem";
    var oldname = "";

    if ($(this).hasClass('coppy_update_item'))
    {
      var name = $('input[name="coppy_item_name_edit"]').val();
      var content = $('textarea.coppy_item_content_edit').val();
      command = "updatecoppyitem"
      oldname = $('input[name="coppy_item_name_edit"]').data('oldname');
    }

    var per_file_hooks = $('#per_file_hooks').prop('checked');
    var item_file_obj = {};


    for (var i = 0; i < files.length; i++)
    {
      var hooksEle = $('[name="coppy_item_hooks"][data-id="' + i + '"]');
      var optionsEle = $('.coppy_hooks_advanced_options[data-id="' + i + '"]');

      item_file_obj[i] = {};
      var hookSetObj = item_file_obj[i];
      hookSetObj.options = getOptionsObject(optionsEle);
      hookSetObj.hooks = hooksEle.val().split(',');
      hookSetObj.file = hooksEle.data('file');
    }

    if ($('[name="coppy_item_name_edit"]').data('parent') != undefined)
    {
      parenttab = $('[name="coppy_item_name_edit"]').data('parent');
    }

    chrome.runtime.sendMessage({command: command, oldname: oldname, parenttab: parenttab, name: name, data:
    {description: "Desccc", content: content, file_obj: item_file_obj, rawfiles: files}});
  });

  $(document).on('click', '.coppy_item', function() {

    var name = $(this).text();
    chrome.runtime.sendMessage({command: "getcoppyitem", name: name, parenttab: OPEN_COPPY_TAB});

    var $this = $(this);
    var text = $this.text();
    $this.text('Copied!');
    setTimeout(function() {
        $this.text(text);
    }, 700);
  });

  $(document).on('click', '[data-triggers]', function() {
    var $this = $(this);
    var snipName = $this.next('.coppy_item').text();
    chrome.extension.sendMessage({command:"getcoppyitem", name: snipName, parenttab: OPEN_COPPY_TAB, response: "execute_coppy_item"});
  });

  $(document).on('click', '[data-opens="coppy_bulk_edit"]', function() {
    chrome.extension.sendMessage({command: "getcoppydata", response:"returncoppybulk"});
  });

  $(document).on('click', '.coppy_bulk_tab', function() {
    var $this = $(this);
    if ($this.hasClass('coppy_bulk_tab_open'))
    {
      $this.removeClass('coppy_bulk_tab_open');
      $this.siblings('.coppy_bulk_item_wrap').css('transform', 'scale(1,0)');
      $this.find('img').attr('src', chrome.extension.getURL('resources/dropdown-up.png'));
      // settimeout so that animation doesn't look like trash
      setTimeout(function() {
        $this.siblings('.coppy_bulk_item_wrap').css('height', '0');
      }, 150);
    } else {
      $this.addClass('coppy_bulk_tab_open');
      $this.siblings('.coppy_bulk_item_wrap').css('transform', 'scale(1,1)');
      $this.siblings('.coppy_bulk_item_wrap').css('height', 'auto');
      $this.find('img').attr('src', chrome.extension.getURL('resources/dropdown-down.png'));
    }
  });

  $(document).on('click', '.coppy_tab_check', function() {
    var $this = $(this);
    if ($this.prop('checked'))
    {
      $this.parent().find('.coppy_bulk_item_wrap').find('input').prop('checked', true);
    }
    else {
      $this.parent().find('.coppy_bulk_item_wrap').find('input').prop('checked', false);
    }
  });

  $(document).on('click', '[name="confirm_delete"]', function() {

    var items = {};
    $('.coppy_item_check:checked').each(function() {
      items[$(this).data('item')] = $(this).data('parent');
    });
    var tabs = [];
    $('.coppy_tab_check:checked').each(function() {
      tabs.push($(this).data('tab'));
    });
    chrome.extension.sendMessage({command: "deletecoppydata", items: items, tabs: tabs});
  });

  $(document).on('click', "img[data-opens='coppy_item_edit']", function() {
    var item = $(this).siblings('.coppy_item_check').data('item');
    var parent = $(this).siblings('.coppy_item_check').data('parent');

    chrome.extension.sendMessage({command: "getcoppyitem", name:item ,parenttab: parent, response: "editcoppyitem"})
  });

  $(document).on('click', '[data-opens="coppy_execute_confirm"]', function() {
    chrome.extension.sendMessage({command: "getcoppytab", tab:OPEN_COPPY_TAB , response: "populateexecutetab"});
  });

  $(document).on('click', '.cadet_execute_confirm', function() {
    beginCoppybatch(OPEN_COPPY_TAB);
  });

  $(document).on('click', '.coppy_reverse_injection', function() {
    undoLastCoppyBatch();
  });

  $(document).on('click', '[data-opens="coppy_export"]', function() {
    var tab = $('.coppy_tab_check:checked').first().data('tab');
    chrome.extension.sendMessage({command: "getcoppytab", tab:tab , response: "populateexport"});
  });

  $(document).on('click', '.coppy_copy_export', function() {
    document.querySelector('.coppy_export_dump').select();
    document.execCommand('Copy');
  });

  $(document).on('click', '.coppy_trigger_import', function() {
    var obj = JSON.parse($('.coppy_import_dump').val());
    if (obj.tab != undefined)
    {
      chrome.runtime.sendMessage({command: "newcoppytab", name: obj.tab.name, data: obj.tab.items});
    }
  });

  $(document).on('change', '.cadet_theme_select', function() {
    var next = $(this).find(':selected').attr('name');
    updateTheme(next);
    chrome.extension.sendMessage({command: "settheme", theme: next});
  });

  $(document).on('click', '.expand_hook_options:not(.coppy_hooks_expanded)', function() {
    //$('.coppy_hooks_advanced_options').css('transform', 'scale(1,1)');
    $(this).next('.coppy_hooks_advanced_options').css('max-height', '500px');
    $(this).addClass('coppy_hooks_expanded');
  });

  $(document).on('click', '.coppy_hooks_expanded', function() {
    $(this).removeClass('coppy_hooks_expanded');
  //  $('.coppy_hooks_advanced_options').css('transform', 'scale(1,0)');
    $(this).next('.coppy_hooks_advanced_options').css('max-height', '0');
  })

  $(document).on('click', "[data-opens='coppy_item_edit']", function() {
    OPEN_COPPY_TAB = $(this).siblings('[data-parent]').data('parent');
  });

  $('.cadet_coppy_tool[data-opens="cadet_new_coppy"]').on('click', function(e) {
    if (OPEN_COPPY_TAB == undefined)
    {
     e.stopPropagation();
      e.preventDefault();
    }
  });

  $('a.cadet_menu_toggle.cadet_files_tool[data-opens="cadet_new_file"]').on('click', function(e) {
    var id = $('.cadet_files_tab_select').find(':selected').data('id');
    if (id == undefined)
    {
      e.stopPropagation();
       e.preventDefault();
    }
  });

  $('[name="cadet_file_group_create"]').on('click', function() {
    var name = $('[name="cadet_file_group_name"]').val();
    chrome.extension.sendMessage({command: "newfilegroup", name: name});
  });

  $(document).on('click', '[data-opens="cadet_files_menu"]', function() {
    chrome.extension.sendMessage({command: 'getfilegroups'});
  });

  $('[data-opens="cadet_files_bulk_edit"]').on('click', function() {
    chrome.extension.sendMessage({command: 'getfilegroups', response: 'returnfilesbulkedit'});
  });

  $('[name="cadet_file_create"]').on('click', function() {
    var full_name = $('[name="cadet_file_name"]').val();
    var name = full_name.indexOf('.liquid') != -1 ? full_name.substring(0, full_name.lastIndexOf('.')) : full_name;
    var asset = $('[name="cadet_file_type"]').val() + '/' + full_name;
    var content = $('[name="cadet_file_content"]').val();
    var parent_id = $('.cadet_files_tab_select').find(':selected').data('id');
    var include = document.querySelector('#include_in_theme').checked;
    var liquid_include = "";
    var asset_tag = "stylesheet";
    if (full_name.indexOf('.js') != -1)
    {
      asset_tag = "script";
    }
    if (include)
    {
      switch($('[name="cadet_file_type"]').val()) {
        case "snippets": liquid_include = "{%- include '" + name + "' -%}";
              break;
        case "sections": liquid_include = "{%- section '" + name + "' -%}";
              break;
        case "assets": liquid_include = "{{ '" + name + "' | asset_url | " + asset_tag + "_tag }}"
              break;
        default: break;
      }
    }
    chrome.extension.sendMessage({command: "newfileitem", name: asset, content: content, parent: parent_id, include_in_theme: include, liquid_include: liquid_include});
  });

  $('.cadet_files_tab_select').on('change', function() {
    var id = $(this).find(':selected').data('id');
    if (id)
      chrome.extension.sendMessage({command: 'getfilegroup', id: id});
  });

  $('[name="confim_files_delete"]').on('click', function() {

    var items = {};
    $('.cadet_file_item:checked').each(function() {
      var gid = $(this).data('group-id');
      if (items[gid] == undefined)
      {
        items[gid] = [];
      }
      items[gid].push($(this).data('id'))
    });
    var groups = [];
    $('.cadet_file_group:checked').each(function() {
      groups.push($(this).data('group-id'));
    });
    chrome.extension.sendMessage({command: "deletefilesdata", items: items, groups: groups});
  });

  $(document).on('click', '.cadet_file_trigger', function() {
    var id = $(this).data('id');
    var gid = $(this).data('group-id');
    chrome.extension.sendMessage({command: 'getfileitem', id: id, group_id: gid, response: "returnfilesitem_forinjection"})
  });

  $('[data-opens="cadet_files_upload"]').on('click', function() {
    var id = $('.cadet_files_tab_select').find(':selected').data('id');
    chrome.extension.sendMessage({command: "getfilegroup", response: "returnfilegroup_populate_confirm_upload", id:id})
  });

  $('[name="cadet_files_confirm_upload"]').on('click', function() {
    uploadFilesItem(CADET_UPLOAD_BATCH.queue[Object.keys(CADET_UPLOAD_BATCH.queue)[0]]);
  });

  $('.cadet_prod_create').on('click', function() {
    var name = $('[name="cadet_prod_name"]').val();
    var type = $('[name="cadet_prod_type"]').val();
    injectScript(function(name, type) {
      createProduct(name, type);
    }, [name, type]);
  });

  $('[data-opens="cadet_prod_menu"]').on('click', function() {
    injectScript(function() {
      updateIBProductList();
    });
  });

  $('.cadet_delete_prod').on('click', function() {
    injectScript(function() {
      $('#ib_prod_input:checked').each(function() {
        $.ajax({
          type: "DELETE",
          url: window.location.origin + "/admin/products/" + $(this).data('product-id') + ".json"
        });
        $(this).parent().hide();
      });
    });
  });

  $('.cadet_cancel_tab_load').on('click', function() {
    CANCEL_TABS_REOPEN = true;
  });

}

function refreshCadetModal(ele)
{
  $('.cadet_selected').removeClass('cadet_selected');
  ele.addClass('cadet_selected');

  var opens = ele.data('opens');
  $('.cadet_functions').data('opens', opens);

  toggleMenu($('.' + opens), ele);
}

function toggleMenu(tar, button)
{
  $('.cadet_menu_open').hide();
  $('.cadet_menu_open').css('transform', 'scale(1,0)');
  $('.cadet_menu_open').removeClass('cadet_menu_open');
  $(tar).show();
  $(tar).addClass('cadet_menu_open');
  $(tar).css('transform', 'scale(1,1)');

  if (button != undefined && button.data('title') != undefined)
  {
    $('.cadet_title').text(button.data('title'));
  } else {
    $('.cadet_title').text('Install Helper');
  }

  if ($(tar).hasClass('cadet_coppy_menu'))
  {
    beginUpdateCoppyMenu();
  }

  updateToolbar();
}

function prepareViewSnipMenu(ele, callback)
{
  var snip = ele.next('a');
  var table = snip.closest('table');
  var title = snip.text();
  $('.snip_title_js').text(title);
  getSnippet(table.data('app'), snip.data('snip'), function(data) {
    $('.snip_content_js').text(data);
    callback();
  });
}

function updateToolbar()
{
  var menu = $('.cadet_menu_open');

  // Hide all toolbar buttons
  $('.cadet_menu_app_select').hide();
  $('.cadet_coppy_tool').hide();
  $('.coppy_item_tool').hide();
  $('.coppy_advanced_tool').hide();
  $('.cadet_files_tool').hide();
  $('.cadet_files_bulk_tool').hide();
  $('.cadet_prod_tool').hide();
  $('.cadet_coppy_bulk_tool').hide();

  if (menu.hasClass('cadet_snippets_menu'))
  {
    $('.cadet_menu_app_select').show();
  }
  else if (menu.hasClass('cadet_coppy_menu')) {
    $('.cadet_coppy_tool').show();
    $('[name="coppy_item_advaced_done"]').attr('data-opens', 'cadet_new_coppy');
  } else if (menu.hasClass('cadet_new_coppy') || menu.hasClass('coppy_item_edit')) {
    $('.coppy_item_tool').show();
  } else if (menu.hasClass('coppy_item_advanced'))
  {
    $('.coppy_advanced_tool').show();
  } else if (menu.hasClass('coppy_bulk_edit'))
  {
    $('.cadet_coppy_bulk_tool').show();
  } else if (menu.hasClass('cadet_files_menu'))
  {
    $('.cadet_files_tool').show();
  } else if (menu.hasClass('cadet_files_bulk_edit'))
  {
    $('.cadet_files_bulk_tool').show();
  } else if (menu.hasClass('cadet_prod_menu'))
  {
    $('.cadet_prod_tool').show();
  }

  if (!menu.hasClass('coppy_item_advanced'))
  {
    $('[name="coppy_item_advaced_done"]').attr('data-opens', 'cadet_new_coppy');
    $('.cadet_menu_toggle.coppy_advanced_tool').attr('data-opens', 'cadet_new_coppy');
  }
}

function hideDropdown(ele)
{
  var tar = ele.data('expands');
  $('.' + tar).css('transform', 'scale(1,0)');
  $('.' + tar).on('transitionend', function() {
    $(this).hide();
    $(this).off('transitionend');
  });
  ele.removeClass('cadet_hide cadet_expand_selected');
}

function uploadAndIncludeFile(relPath, key, name, include, includeCheck)
{
  //read the file
  readTextFile(chrome.extension.getURL(relPath), function(d) {
    // store file content in xmp dump tag
    $('.cadet_text_dump').text(d);
    injectScript(function(key, name, include, includeCheck) {
      // create file with data pulled from tag
      pushFile(key, name, $('.cadet_text_dump').text(), function() {
        appendToThemeHeaderContent(include, includeCheck, function() {
          setTimeout(function() {
            location.reload(true);
          }, 500);
        });
      });
    }, [key, name, include, includeCheck]);
  });
}

function getSnippet(app, snipname, callback)
{
  readTextFile(chrome.extension.getURL('snippets/' + app + "_snips.txt"), function(data) {
    // extract snippet data from file
    var s = data.substring(data.indexOf('^begin:' + snipname) + 7 + snipname.length, data.indexOf('^end:' + snipname));
    callback(s);
  });
}

function loadMessageListeners()
{
  chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.command == "setcoppy"){
      $('.cadet_coppy_tab_select').empty();
      for (e in request.coppy.coppyjr)
      {
        var o = $('<option></option>');
        o.text(request.coppy.coppyjr[e].name);
        o.attr('data-id', e);
        o.appendTo('.cadet_coppy_tab_select');
      }

      // Send message to get the first coppy tab so that the menu isn't empty
      if (Object.keys(request.coppy.coppyjr)[0] != undefined)
      {
        chrome.runtime.sendMessage({command: "getcoppytab", tab: Object.keys(request.coppy.coppyjr)[0]});
      } else {
        OPEN_COPPY_TAB = undefined;
        $('.cadet_coppy_wrap').empty();
      }
    } else if (request.command == "newtabcallback")
    {
      var o = $('<option></option>');
      o.text(request.tab.name);
      o.attr('data-id', request.id);
      o.appendTo('.cadet_coppy_tab_select');
      updateCoppyMenu(request);
    }
    else if (request.command == "returncoppytab")
    {
      updateCoppyMenu(request);
    }
    else if (request.command == "returncoppyitem")
    {
      $('.cadet_text_dump').text(request.item.content);
      $('.cadet_text_dump').css('display', 'block');
      SelectText('.cadet_text_dump');
      document.execCommand("Copy");
      $('.cadet_text_dump').hide();
    } else if (request.command == "execute_coppy_item")
    {
      COPPY_BATCH.queue = [request.name];
      COPPY_BATCH.backup = {};
      COPPY_BATCH.report = {};
      COPPY_BATCH.index = 0;
      COPPY_BATCH.max = COPPY_BATCH.queue.length;
      executeCoppyItem(request.item);
    } else if (request.command == "returncoppybulk")
    {
      $('.coppy_bulk_list_wrap').empty();
      var trow = "<div class='coppy_bulk_tab_wrap'><input class='coppy_tab_check' type='checkbox'/><div class='coppy_bulk_tab'><span></span><img/></div><div class='coppy_bulk_item_wrap'></div></div>";
      var titem = "<div class='coppy_bulk_item'><input class='coppy_item_check' type='checkbox'/><span></span><img class='cadet_menu_toggle' data-opens='coppy_item_edit' /></div>";
      for (tab in request.coppy.coppyjr)
      {
        row = $(trow);
        row.find('span')[0].textContent = request.coppy.coppyjr[tab].name;
        row.find('img').attr('src', chrome.extension.getURL('resources/dropdown-up.png'));
        row.find('.coppy_tab_check').attr('data-tab', tab);
        for (i in request.coppy.coppyjr[tab].items)
        {
          item = $(titem)
          item.find('span').text(i);
          item.find('img').attr('src', chrome.extension.getURL('resources/edit.png'));
          item.find('.coppy_item_check').attr('data-item', i);
          item.find('.coppy_item_check').attr('data-parent', tab);
          item.appendTo(row.find('.coppy_bulk_item_wrap'));
        }
        row.appendTo('.coppy_bulk_list_wrap');
      }
    } else if (request.command == 'editcoppyitem')
    {
      var menu = $('.coppy_item_edit');
      var advmenu = $('.coppy_item_advanced');
      var item = request.item;
      var files = item.rawfiles;
      menu.find('[name="coppy_item_name_edit"]').val(request.name);
      menu.find('[name="coppy_item_name_edit"]').attr('data-oldname', request.name);
      menu.find('[name="coppy_item_name_edit"]').attr('data-parent', request.parent);
      menu.find('.coppy_item_content_edit').text(item.content);

      advmenu.find('[name="coppy_item_files"]').val(files.join(','));
      advmenu.find('[name="coppy_item_advaced_done"]').attr('data-opens', 'coppy_item_edit');
      $('.cadet_menu_toggle.coppy_advanced_tool').attr('data-opens', 'coppy_item_edit');
      $('#per_file_hooks').prop('checked', true);
      updatePerFileHooks();
      for (var i = 0; i < files.length; i++)
      {
        $('[name="coppy_item_hooks"][data-id="' + i + '"]').val(item.file_obj[i].hooks.join(','));
        for (o in item.file_obj[i].options)
        {
          $('.coppy_hooks_advanced_options[data-id="' + i + '"] #' + o).prop('checked', item.file_obj[i].options[o]);
        }
      }
    } else if (request.command == "populateexecutetab")
    {
      $('.execute_list_wrap').empty();
      for (var f in request.tab.items)
      {
        $('<span class="execute_list_item">' + f + '</span>').appendTo('.execute_list_wrap')
      }
    } else if (request.command == "injectcoppybatch")
    {
        COPPY_BATCH.queue = Object.keys(request.tab.items);
        COPPY_BATCH.backup = {};
        COPPY_BATCH.report = {};
        COPPY_BATCH.index = 0;
        COPPY_BATCH.max = COPPY_BATCH.queue.length;
        COPPY_BATCH.tab = request.tab;
        executeCoppyItem(request.tab.items[COPPY_BATCH.queue[0]]);

     }else if (request.command == 'continue_coppy_batch')
     {
       if (COPPY_BATCH.backup[request.lastasset] == undefined)
       {
         COPPY_BATCH.backup[request.lastasset] = request.assetbackup;
       }
       COPPY_BATCH.report[COPPY_BATCH.queue[COPPY_BATCH.index]] = {};
       COPPY_BATCH.report[COPPY_BATCH.queue[COPPY_BATCH.index]].inserted = request.response.inserted;
       COPPY_BATCH.report[COPPY_BATCH.queue[COPPY_BATCH.index]].message = request.response.message;
       if (COPPY_BATCH.index + 1 < COPPY_BATCH.max)
       {
         COPPY_BATCH.index++;
        executeCoppyItem(COPPY_BATCH.tab.items[COPPY_BATCH.queue[COPPY_BATCH.index]]);
      }
      else {
        //done batch callback here
        doneCoppyBatchCallback();
      }
    } else if (request.command == "undo_last_coppy_batch")
    {
      undoLastCoppyBatch();
    } else if (request.command == "populateexport")
    {
      delete request.command;
      $('.coppy_export_dump').text(JSON.stringify(request));
    } else if (request.command == "returntheme")
    {
      updateTheme(request.theme);
    } else if (request.command == "updatefilegroups")
    {
      updateFilesDropdown(request.data);
      var id = $('.cadet_files_tab_select').find(':selected').data('id');
      if (id != undefined)
      {
        chrome.extension.sendMessage({command: 'getfilegroup', id: id});
      }
    } else if (request.command == "returnfilesbulkedit")
    {
      updateFilesBulkMenu(request.data);
    } else if (request.command == "updatecurrentgroup")
    {
      updateCurrentGroup(request.group);
    } else if (request.command == "returnfilesitem_forinjection")
    {
      uploadFilesItem(request.item);
    } else if (request.command == "returnfilegroup_populate_confirm_upload")
    {
      CADET_UPLOAD_BATCH = {};
      CADET_UPLOAD_BATCH.queue = request.group.items;
      CADET_UPLOAD_BATCH.index = 0;
      CADET_UPLOAD_BATCH.report = {};
      $('.cadet_files_confirm_list').empty();
      var s = "<span></span>";
      for (i in request.group.items)
      {
        $(s).text(request.group.items[i].name).appendTo('.cadet_files_confirm_list');
      }
    } else if (request.command == "continue_files_batch")
    {
      if (CADET_UPLOAD_BATCH.queue == undefined)
      {
        var ele = $('.cadet_file_trigger[data-id="' + request.id + '"]');
        var text = ele.text();
        ele.text('Uploaded!');
        setTimeout(function() {
          ele.text(text);
          injectScript(function() {
            window.Page.refresh({}, function() {
              chrome.runtime.sendMessage(EXTENSION_ID, {command: 're_init'});
            });
          });
        }, 500);
        return;
      }
      CADET_UPLOAD_BATCH.report[CADET_UPLOAD_BATCH.queue[Object.keys(CADET_UPLOAD_BATCH.queue)[CADET_UPLOAD_BATCH.index]].name] = request.success;
      CADET_UPLOAD_BATCH.index += 1;
      if (CADET_UPLOAD_BATCH.index < Object.keys(CADET_UPLOAD_BATCH.queue).length)
      {
        uploadFilesItem(CADET_UPLOAD_BATCH.queue[Object.keys(CADET_UPLOAD_BATCH.queue)[CADET_UPLOAD_BATCH.index]]);
      } else {
        doneFilesBatch();
      }
    }
  });
}

function populateCoppy()
{
  chrome.runtime.sendMessage({command: "getcoppydata"});
}

function beginUpdateCoppyMenu()
{
  var tabid = $('.cadet_coppy_tab_select option:selected').data('id');
  if (tabid !== null)
  {
    chrome.runtime.sendMessage({command: "getcoppytab", tab: tabid});
  } else {
    $('.cadet_coppy_wrap').empty();
  }
}

function updateCoppyMenu(request)
{
  if (request.tab == undefined)
  {
    $('.cadet_coppy_wrap').empty();
    return;
  }
  var tab = request.tab.items;
  $('.cadet_coppy_wrap').empty();
  var item = '<div class="coppy_item_wrap"><img/><a class="cadet_action coppy_item"></a></div>';
  var max = 0;

  for (t in tab)
  {
    var $item = $(item);
    $item.find('img').attr('src', chrome.extension.getURL('resources/runcoppy.png'));
    $item.find('img').attr('data-triggers', t);
    $item.find('a').text(t);
    $item.appendTo('.cadet_coppy_wrap');
    if (tab[t].index != undefined)
    {
      $item.attr('data-index', tab[t].index);
      if (tab[t].index > max)
        max = tab[t].index;
    }
  }

  for (var i = max; i > 0; i--)
  {
    $('[data-index="' + i + '"]').prependTo('.cadet_coppy_wrap');
  }

  OPEN_COPPY_TAB = request.name != undefined ? request.name : request.id;
}

function updatePerFileHooks()
{
    var $this = $('#per_file_hooks');

    if ($this.prop('checked') == true)
    {
      var files = $('[name="coppy_item_files"]').val().split(',');
      var ele = $('.coppy_item_hooks_wrap');
      ele.remove();
      $('.file_hook_span').remove();
      // create a new hooks input for each file and set it's data-file attr to that file
      var id = 0;
      for (f in files)
      {
        ele = ele.first().clone();
        ele.find('[name="coppy_item_hooks"]').val('');
        ele.find('[name="coppy_item_hooks"]').attr('data-file', files[f]);
        ele.find('[name="coppy_item_hooks"]').attr('data-id', id);
        ele.find('.coppy_hooks_advanced_options').attr('data-file', files[f]);
        ele.find('.coppy_hooks_advanced_options').attr('data-id', id);
        $('<span class="file_hook_span">' + files[f] + '</span>').insertBefore('[name="coppy_item_advaced_done"]');
        ele.insertBefore('[name="coppy_item_advaced_done"]');
        id++;
      }
    } else {
      // remove the extra hooks inputs, except the first one, and remove it's data-file attr
      var ele = $($('.coppy_item_hooks_wrap')[0]);
      $('.coppy_item_hooks_wrap').remove();
      $('.file_hook_span').remove();
      var f = $('[name="coppy_item_files"]').val().split(',')[0];
      ele.find('[name="coppy_item_hooks"]').attr('data-file', f);
      ele.find('[name="coppy_item_hooks"]').attr('data-id', '0');
      ele.find('.coppy_hooks_advanced_options').attr('data-file', f);
      ele.find('.coppy_hooks_advanced_options').attr('data-id', '0');
      ele.insertBefore('[name="coppy_item_advaced_done"]');
    }
}

function executeCoppyItem(item)
{
  // Dump the item json into dom so that install.js can grab it
  var dump = document.createElement('xmp');
  dump.classList.add('coppy_dump');
  dump.textContent = JSON.stringify(item);
  document.body.appendChild(dump);
  injectScript(function() {
    injectCoppyItem();
  });
}

function beginCoppybatch(tab)
{
  chrome.extension.sendMessage({command: 'getcoppytab', tab: tab, response: "injectcoppybatch"});
}
// send a message to do the first tab (store in var), in listener inject exectue coppy from install js, in callback from that, call this funciton again

function doneCoppyBatchCallback()
{
  var item = "<div><img/><span></span></div>";
  var $item;
  var asset;
  $('.coppy_report_wrap').empty();
  for (var f in COPPY_BATCH.queue)
  {
    asset = COPPY_BATCH.queue[f];
    $item = $(item);
    $item.find('span').text(asset + " - " + COPPY_BATCH.report[asset].message);
    if (COPPY_BATCH.report[asset].inserted)
    {
      $item.find('img').attr('src', chrome.extension.getURL('resources/checkmark_green.png'));
    } else {
      $item.find('img').attr('src', chrome.extension.getURL('resources/failed.png'));
    }
    $item.appendTo('.coppy_report_wrap');
  }
  toggleMenu('.coppy_batch_done');
  console.log('[Install Bot] %cInjection Complete! %cIf you need to rollback these changes use the undoLastInstallBotAction() function.', 'color:green;font-weight:700;', 'color:black;font-weight:100;');
  console.log('[Install Bot] If you have any issues or find any bugs, please Slack Zach Lowden the details.');
  // clear file cache so that next batch won't use it
  injectScript(function() {
    file_cache = {};
  });
}

function undoLastCoppyBatch()
{
  $('<xmp class="coppy_batch_undo">' + JSON.stringify(COPPY_BATCH.backup) + '</xmp>').appendTo('body');
  injectScript(function() {
    undoLastCoppy();
  });
}

function updateTheme(t)
{
  $('.cadet_stylesheet').remove();
  $('.cadet_theme_select').val($('option[name="' + t + '"]').val());
  var stylelink = $('<link rel="stylesheet" class="cadet_stylesheet" type="text/css" href="' + chrome.extension.getURL('js/init/theme-editor/robocadet/style/ib_' + t + '.css') + '">');
  $('head').append(stylelink);
}

function getOptionsObject(ele)
{
  var obj = {};
  $(ele).find('input').each(function() {
    obj[$(this).attr('id')] = $(this).prop('checked');
  });
  return obj;
}

function updateFilesDropdown(data)
{
  if (data == undefined)
  {
    return;
  }
  $('.cadet_files_tab_select').empty();
  var o = "<option></option>";
  var op;
  for (i in data.ib_files)
  {
    op = $(o);
    op.text(data.ib_files[i].name);
    op.attr('data-id', i);
    op.appendTo('.cadet_files_tab_select');
  }
}

function updateFilesBulkMenu(data)
{
  $('.bulk_files_list_wrap').empty();
  var t = "<div><input class='cadet_file_group' type='checkbox'/><div class='coppy_bulk_tab'><span></span><img/></div><div class='coppy_bulk_item_wrap'></div></div>";
  var fi = "<div><input class='cadet_file_item' type='checkbox'/><span></span></div>"
  var file;
  var tab;
  for (i in data.ib_files)
  {
    tab = $(t);
    tab.find('span').text(data.ib_files[i].name);
    tab.find('input').attr('data-group-id', i);
    tab.find('img').attr('src', chrome.extension.getURL('resources/dropdown-up.png'));
    for (f in data.ib_files[i].items)
    {
      file = $(fi);
      file.find('span').text(data.ib_files[i].items[f].name);
      file.find('input').attr('data-group-id', i);
      file.find('input').attr('data-id', f);
      file.appendTo(tab.find('.coppy_bulk_item_wrap'));
    }
    tab.appendTo('.bulk_files_list_wrap');
  }
}

function updateCurrentGroup(group)
{
  $('.cadet_files_menu').empty();
  if (group == undefined)
  {
    return;
  }
  var fi = "<div><a class='cadet_file_trigger'></a></div>";
  for (f in group.items)
  {
    file = $(fi);
    file.find('a').text(group.items[f].name);
    file.find('a').attr('data-group-id', group.id);
    file.find('a').attr('data-id', f);
    file.appendTo('.cadet_files_menu');
  }
}

function uploadFilesItem(item)
{
  $('.cadet_file_item_dump').remove();
  $('<xmp class="cadet_file_item_dump" style="display:none;"></xmp>').text(JSON.stringify(item)).appendTo(document.body);
  injectScript(function() {
    var dump = $('.cadet_file_item_dump').text();
    this.cadet_item = JSON.parse(dump);
    getAsset(this.cadet_item.name, function() {
      // the asset already exists
      chrome.runtime.sendMessage(EXTENSION_ID, {command:'continue_files_batch', success: false});
    }, () => {
      pushAsset(this.cadet_item.name, this.cadet_item.content, (key, name) => {
        if (this.cadet_item.include_in_theme)
        {
          getAsset('layout/theme.liquid', (key, name, data) => {
            data = data.split('\n');
            for (var n = 0; n < data.length; n++)
            {
              var line = data[n];
              if (line.indexOf('content_for_header') != -1 && line.indexOf('}}') != -1)
              {
                data[n] = data[n] + '\n' + this.cadet_item.liquid_include;
                break;
              }
            }
            data = data.join('\n');
            updateCodeMirror(key, name, data);
            pushAsset('layout/theme.liquid', data, (key, name) => {
              chrome.runtime.sendMessage(EXTENSION_ID, {command:'continue_files_batch', success: true, id: this.cadet_item.id});
            });
          });
        } else {
          chrome.runtime.sendMessage(EXTENSION_ID, {command:'continue_files_batch', success: true, id: this.cadet_item.id});
        }
      });
    })
  });
}

function doneFilesBatch()
{
  $('.cadet_files_uploaded_list').empty();
  var s = "<div><img/><span></span></div>";
  for (i in CADET_UPLOAD_BATCH.queue)
  {
    var $s = $(s);
    $s.find('span').text(CADET_UPLOAD_BATCH.queue[i].name);
    if (CADET_UPLOAD_BATCH.report[CADET_UPLOAD_BATCH.queue[i].name])
    {
      $s.find('img').attr('src', chrome.extension.getURL('resources/checkmark_green.png'));
    } else {
      $s.find('img').attr('src', chrome.extension.getURL('resources/failed.png'));
      $s.find('span').append(' - File already exists')
    }
    $s.appendTo('.cadet_files_uploaded_list');
  }

  toggleMenu('.cadet_upload_done');
  injectScript(function() {
    setTimeout(function() {
      window.Page.refresh({}, function() {
        chrome.runtime.sendMessage(EXTENSION_ID, {command: 're_init'});
      });
    }, 500);
  });
}

function populateFiles()
{
  chrome.extension.sendMessage({command: 'getfilegroups'});
}
