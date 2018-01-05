$(document).ready(function() {

// Check if on theme editor page
  if ($('.template-editor-container').length == 0)
    return;

  $.get(chrome.extension.getURL('js/init/theme-editor/robocadet/robocadet.html'), function(data) {
    $('body').prepend(data);

    // set image on cadet peek
    var src = chrome.extension.getURL('resources/icon.png');
    $('.cadet_peek img').attr('src', src);

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
  });
});


function loadCadetListeners()
{
  $(document).on('click', '.cadet-btn', function() {
    refreshCadetModal($(this));
  });
  $(document).on('click', 'a.ro_cartpage', function() {
    doROCartInstall();
  });
  $(document).on('click', 'a.ro_ajax', function() {
    doROAjaxInstalll();
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

  $(document).on('click', '.cadet_action', function() {
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

  window.onbeforeunload = function() {
    saveOpenTabs();
  }

}

function refreshCadetModal(ele)
{
  $('.cadet_selected').removeClass('cadet_selected');
  ele.addClass('cadet_selected')

  var opens = ele.data('opens');
  $('.cadet_functions').data('opens', opens);

  toggleMenu($('.' + opens));
}

function toggleMenu(tar)
{
  $('.cadet_menu_open').hide();
  $('.cadet_menu_open').css('transform', 'scale(1,0)');
  $('.cadet_menu_open').removeClass('cadet_menu_open');
  $(tar).show();
  $(tar).addClass('cadet_menu_open');
  $(tar).css('transform', 'scale(1,1)');
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
