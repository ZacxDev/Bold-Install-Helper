$(document).ready(function() {
  $.get(chrome.extension.getURL('js/init/theme-editor/robocadet/robocadet.html'), function(data) {
    $('body').prepend(data);

    // set image on cadet peek
    var src = chrome.extension.getURL('resources/icon.png');
    $('.cadet_peek img').attr('src', src);

    // inject stylesheet for robocadet
    var cadetstyle = $('<link rel="stylesheet" type="text/css" href="' + chrome.extension.getURL('js/init/theme-editor/robocadet/robocadet.css') + '">');
    $('head').append(cadetstyle);
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

// Prevent modal from going off screen
  var mouseDown = false;
  $('.cadet_modal').mouseup(function() {
    if (parseInt($(this).css('left')) < 0)
      $(this).css('left', '0');
    if (parseInt($(this).css('top')) < 0)
      $(this).css('top', '0');
    mouseDown = false;
    if (parseInt($(this).css('left')) + $(this).width() > $(window).width())
      $(this).css('left', $(window).width() - $(this).width());
    if (parseInt($(this).css('top')) + $(this).height() > $(window).height())
      $(this).css('top', $(window).height() - $(this).height());
  });

  $('.cadet_modal').mousedown(function() {
    mouseDown = true;
  });
  $('.cadet_modal').mousemove(function() {
    if (mouseDown)
    {
      if (parseInt($(this).css('left')) + $(this).width() > $(window).width())
        $(this).css('left', $(window).width() - $(this).width());
      if (parseInt($(this).css('top')) + $(this).height() > $(window).height())
        $(this).css('top', $(window).height() - $(this).height());
    }
  });

// Prevent modal from going off screen ^^

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
