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
  $(document).on('click', '.cadet_report_toggle', function()
  {
    $('.cadet_report_wrap').show();
    $(this).text('Hide Report');
    $(this).addClass('cadet_report_view_hide');
  });
  $(document).on('click', '.cadet_report_view_hide', function() {
    $('.cadet_report_wrap').hide();
    $(this).text('View Report');
    $(this).removeClass('cadet_report_view_hide');
  });
  $(document).on('click', '.cadet_expand', function() {
    var tar = $(this).data('expands');
    $('.' + tar).show();
    $('.' + tar).css('transform', 'scale(1,1)');
    $(this).addClass('cadet_hide cadet_expand_selected');
  });
  $(document).on('click', '.cadet_hide', function() {
    var tar = $(this).data('expands');
    $('.' + tar).css('transform', 'scale(1,0)');
    $('.' + tar).on('transitionend', function() {
      $(this).hide();
      $(this).off('transitionend');
    });
    $(this).removeClass('cadet_hide cadet_expand_selected');
  });

  $(document).on('click', '.cadet_undo', function() {
    undoCadetAction();
  });

  $(document).on('click', '.cadet_action', function() {
    $('.cadet_undo').show();
  });
}

function refreshCadetModal(ele)
{
  $('.cadet_selected').removeClass('cadet_selected');
  ele.addClass('cadet_selected')

  $('.cadet_visable').hide();
  $('.cadet_visable').removeClass('cadet_visable');

  if (ele.data('app') === "ro")
  {
    $('.cadet_ro').show();
    $('.cadet_ro').addClass('cadet_visable');
  }
  else if (ele.data('app') === "lp")
  {
    $('.cadet_lp').show();
    $('.cadet_lp').addClass('cadet_visable');
  }
}
