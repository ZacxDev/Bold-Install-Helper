
document.addEventListener("DOMContentLoaded", function(event) {
    restore_options();
  });

// Saves options to chrome.storage
function save_options() {
  var customer_lookup = document.getElementById('customer_lookup').checked;
  var theme_editor_buttons = document.getElementById('theme_editor_buttons').checked;
  var recurring_orders_install = document.getElementById('recurring_orders_install').checked;
  var email_recovery_buttons = document.getElementById('email_recovery_buttons').checked;
  var customer_account_highlight = document.getElementById('customer_account_highlight').checked;
  var collaborator_account_checkboxes = document.getElementById('collaborator_account_settings').checked;
  var bold_buttons = document.getElementById('bold_buttons').checked;
  var collaborator_account_notes = document.getElementById('collaborator_account_notes').value;
  var theme_editor_file_scanner = document.getElementById('file_scanner').checked;
  chrome.storage.sync.set({
    customer_lookup_option: customer_lookup,
    theme_editor_buttons_option: theme_editor_buttons,
    recurring_orders_install_option: recurring_orders_install,
    email_recovery_buttons_option: email_recovery_buttons,
    customer_account_highlight_option: customer_account_highlight,
    collaborator_account_checkboxes_options: collaborator_account_checkboxes,
    bold_buttons_options: bold_buttons,
    collaborator_account_notes_options: collaborator_account_notes,
    theme_editor_file_scanner_options: theme_editor_file_scanner
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('save_options');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = 'Save Options';
    }, 750);
  });
}

function restore_options() {
  chrome.storage.sync.get({
    customer_lookup_option: false,
    theme_editor_buttons_option: false,
    recurring_orders_install_option: false,
    email_recovery_buttons_option: false,
    customer_account_highlight_option: false,
    bold_buttons_options: false,
    collaborator_account_checkboxes_options: false,
    collaborator_account_notes_options: "",
    theme_editor_file_scanner_options: false
  }, function(items) {
    document.getElementById('customer_lookup').checked = items.customer_lookup_option;
    document.getElementById('theme_editor_buttons').checked = items.theme_editor_buttons_option;
    document.getElementById('recurring_orders_install').checked = items.recurring_orders_install_option;
    document.getElementById('email_recovery_buttons').checked = items.email_recovery_buttons_option;
    document.getElementById('customer_account_highlight').checked = items.customer_account_highlight_option;
    document.getElementById('bold_buttons').checked = items.bold_buttons_options;
    document.getElementById('collaborator_account_settings').checked = items.collaborator_account_checkboxes_options;
    document.getElementById('collaborator_account_notes').value = items.collaborator_account_notes_options;
    document.getElementById('file_scanner').checked = items.theme_editor_file_scanner_options;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save_options').addEventListener('click',
    save_options);

$(document).ready(function() {

$('.line').hide();
$("." + $('.option_tab_selected').attr('value') + "_option").show();
$('.genaric_option').show();
$('.beta_option').show();

var app;
$('.option_tab').click(function() {

  if (app != undefined)
    $("." + app + "_option").hide();

  app = $(this).attr('value');
  $("." + app + "_option").show();
  $('.option_tab_selected').removeClass('option_tab_selected');
  $(this).addClass('option_tab_selected');
});

var checked_0 = false;
$('.beta_radio input').click(function() {

  if (!checked_0)
  {
    $(this).prop('checked', false);
  //  $('.beta_option').hide();
    $('.beta_option span').css('background-color', "#ccc");
    $('.beta_option span').css('cursor', 'not-allowed');
    $('.beta_option label').css('cursor', 'not-allowed');
    $('.beta_option').css('cursor', 'not-allowed');
    $('.beta_option').css('color', '#ccc');
  //  $('.beta_option input').prop('checked', false);
    checked_0 = true;
  }
  else
  {
    //$('.beta_option').show();
    $('.beta_option span').css('background-color', "#2196F3");
    $('.beta_option span').css('cursor', 'default');
    $('.beta_option label').css('cursor', 'default');
    $('.beta_option').css('cursor', 'default');
    $('.beta_option').css('color', 'cadetblue');
    checked_0 = false;
  }
});

});
