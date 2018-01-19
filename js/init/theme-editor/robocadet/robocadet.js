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

  $(document).on('click', '.coppy_create_item', function() {
    var name = $('input[name="coppy_item_name"]').val();
    chrome.runtime.sendMessage({command: "newcoppyitem", parenttab: OPEN_COPPY_TAB, name: name, data: {description: "Desccc"}});
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

  if (menu.hasClass('cadet_snippets_menu'))
  {
    $('.cadet_menu_app_select').show();
  }
  else if (menu.hasClass('cadet_coppy_menu')) {
    $('.cadet_coppy_tool').show();
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
  var item = '<div class="coppy_item_wrap"><a class="cadet_action coppy_item"></a></div>';

  for (t in tab)
  {
    var $item = $(item);
    $item.find('a').text(t);
    $item.appendTo('.cadet_coppy_wrap');
  }

  OPEN_COPPY_TAB = request.name;
}
