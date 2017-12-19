$(document).ready(function() {
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
  $(document).on('click', '.cadet_close', function() {
    $('.cadet_modal').hide();
    $('.cadet_peek').show();
  });
  $(document).on('click', '.cadet_peek', function() {
    $('.cadet_modal').show();
    $('.cadet_peek').hide();
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
}
