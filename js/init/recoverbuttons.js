
$(document).ready(function() {
  loadRecoverButtons();
});
function loadRecoverButtons() {

  var fillLogin = $('<input type="button" value="@boldcommerce" class="btn recover-btn commerce-fill" />');
  fillLogin.insertBefore('.dialog-form .dialog-submit');
  var fillAppsLogin = $('<input type="button" value="@boldapps" class="btn recover-btn apps-fill" />');
  fillAppsLogin.insertBefore(fillLogin);

  $('.recover-btn').click(function(e)
  {
    if ($(this).hasClass('apps-fill'))
      $('#recover-login').val("support@boldapps.net");
    else
      $('#recover-login').val("support@boldcommerce.com");

    $('.dialog-submit').click();
  });

}
