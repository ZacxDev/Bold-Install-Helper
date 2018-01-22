var OPEN_COPPY_TAB;

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

    // inject stylesheet for robocadet
    var cadetstyle = $('<link rel="stylesheet" type="text/css" href="' + chrome.extension.getURL('js/init/theme-editor/robocadet/robocadet.css') + '">');
    $('head').append(cadetstyle);

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

    loadCoppyListeners();
    populateCoppy();
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

  $(document).on('click', 'a.ro_cartpage', function() {
    doROCartInstall();
    document.querySelector('[data-opens="cadet_report_wrap"]').style.display = "inline";
  });
  $(document).on('click', 'a.ro_ajax', function() {
    doROAjaxInstalll();
    document.querySelector('[data-opens="cadet_report_wrap"]').style.display = "inline";
  });
  $(document).on('click', '.cadet_close', function() {
    $('.cadet_modal').hide();
    $('.cadet_peek').show();
  });
  $(document).on('click', '.cadet_peek', function() {
    $('.cadet_modal').show();
    $('.cadet_peek').hide();
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
    var tar = $(this).data('opens');
    toggleMenu($('.' + tar));
  });

  $(document).on('click', '.files_css', function() {
    uploadAndIncludeFile('/snippets/bold-custom.txt', 'assets', 'bold-custom.css', '{{ "bold-custom.css" | asset_url | stylesheet_tag }}', 'bold-custom.css');
  });

  $(document).on('click', '.files_jsboldhelpers', function() {
    uploadAndIncludeFile('/snippets/bold-helper-functions.txt', 'assets', 'bold-helper-functions.js.liquid', '{{ "bold-helper-functions.js" | asset_url | script_tag }}', 'bold-helper-functions');
  });

  $(document).on('click', '.files_jsboldhelpers', function() {
    uploadAndIncludeFile('/snippets/bold-helper-functions-ro.txt', 'assets', 'bold-helper-functions.js.liquid', '{{ "bold-helper-functions.js" | asset_url | script_tag }}', 'bold-helper-functions');
  });

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

  var target = document.querySelector('.theme-asset-name strong');
  var observer = new MutationObserver(function(mutations) {
    injectScript(function() {
      updateUndoButton();
    });
  });
  observer.observe(target, { childList: true });
  var pathChanged = false;


  window.onbeforeunload = function() {
      saveOpenTabs();
  }

  $(document).on('click', '.cadet_new_coppy_tab input[name="create"]', function() {
    var name = $('input[name="coppy_tab_name"]').val();
    chrome.runtime.sendMessage({command: "newcoppytab", name: name});
  });

  $(document).on('change', '.cadet_coppy_tab_select', function() {
    beginUpdateCoppyMenu();
  });

  $(document).on('click', '#per_file_hooks', function() {
    var $this = $(this);

    if ($this.prop('checked') == true)
    {
      var files = $('[name="coppy_item_files"]').val().split(',');
      var ele = $('[name="coppy_item_hooks"]');
      ele.remove();
      // create a new hooks input for each file and set it's data-file attr to that file
      for (f in files)
      {
        ele = ele.clone();
        ele.val('');
        ele.attr('data-file', files[f]);
        $('<span class="file_hook_span">' + files[f] + '</span>').insertBefore('[name="coppy_item_advaced_done"]');
        ele.insertBefore('[name="coppy_item_advaced_done"]');
      }
    } else {
      // remove the extra hooks inputs, except the first one, and remove it's data-file attr
      var ele = $($('[name="coppy_item_hooks"]')[0]);
      $('[name="coppy_item_hooks"]').remove();
      $('.file_hook_span').remove();
      ele.removeAttr('data-file');
      ele.insertBefore('[name="coppy_item_advaced_done"]');
    }
  });

  $(document).on('click', '.coppy_create_item', function() {
    // gather name, content, files, and hooks for the item
    var name = $('input[name="coppy_item_name"]').val();
    var content = $('textarea.coppy_item_content').val();
    var files = $('[name="coppy_item_files"]').val();
    files = files.split(',');
    var hooks = $('[name="coppy_item_hooks"]').val();
    hooks = hooks.split(',');

    // if they selected per file hooks, match each set of hooks to their file
    var files_hooks = {};
    var per_file_hooks = $('#per_file_hooks').prop('checked');
    // if per file hooks, set each file their specific hooks, other wise give each file the same ones
    if (per_file_hooks)
    {
      for (f in files)
      {
        files_hooks[files[f]] = $('[data-file="' + files[f] + '"]').val().split(',');
      }
    } else {
      for (f in files)
      {
        files_hooks[files[f]] = hooks;
      }
    }

    chrome.runtime.sendMessage({command: "newcoppyitem", parenttab: OPEN_COPPY_TAB, name: name, data:
    {description: "Desccc", content: content, file_hooks_link: files_hooks}});
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
  // Hide app selector, will be shown if button is snippets
  // if (!$(tar).hasClass('cadet_snippets_menu'))
  //   $('.cadet_menu_app_select').hide();
  // else
  //   $('.cadet_menu_app_select').show();
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

  if (menu.hasClass('cadet_snippets_menu'))
  {
    $('.cadet_menu_app_select').show();
  }
  else if (menu.hasClass('cadet_coppy_menu')) {
    $('.cadet_coppy_tool').show();
  } else if (menu.hasClass('cadet_new_coppy')) {
    $('.coppy_item_tool').show();
  } else if (menu.hasClass('coppy_item_advanced'))
  {
    $('.coppy_advanced_tool').show();
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

function loadCoppyListeners()
{
  chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.command == "setcoppy"){
      $('.cadet_coppy_tab_select').empty();
      for (e in request.coppy.coppyjr)
      {
        var o = $('<option>' + e + "</option>")
        o.appendTo('.cadet_coppy_tab_select');
      }

      // Send message to get the first coppy tab so that the menu isn't empty
      if (Object.keys(request.coppy.coppyjr)[0] != undefined)
      {
        chrome.runtime.sendMessage({command: "getcoppytab", tab: Object.keys(request.coppy.coppyjr)[0]});
      }
    } else if (request.command == "newtabcallback")
    {
      var o = $('<option>' + request.name + "</option>")
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
      // Dump the item json into dom so that install.js can grab it
      var dump = document.createElement('xmp');
      dump.classList.add('coppy_dump');
      dump.textContent = JSON.stringify(request.item);
      document.body.appendChild(dump);
      injectScript(function() {
        injectCoppyItem();
      });
    }
  });
}

function populateCoppy()
{
  chrome.runtime.sendMessage({command: "getcoppydata"});
}

function beginUpdateCoppyMenu()
{
  var tabname = $('.cadet_coppy_tab_select').val();
  chrome.runtime.sendMessage({command: "getcoppytab", tab: tabname});
}

function updateCoppyMenu(request)
{
  var tab = request.tab;
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

  OPEN_COPPY_TAB = request.name;
}
