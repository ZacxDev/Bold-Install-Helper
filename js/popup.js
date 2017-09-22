var url;
$( document ).ready(function() {
  loadPopup();
  loadSelectedApp();
});

function loadSelectedApp()
{
  chrome.storage.sync.get({
    selected_app: ""
  }, function(items) {
      console.log(items.selected_app)
    $('.app_selector').val(items.selected_app);
  });
}

function toggleOptions(app)
{

  var customer_lookup = true;
  var theme_editor_buttons = false;
  var recurring_orders_install = false;
  var email_recovery_buttons = true;
  var customer_account_highlight = false;
  var collaborator_account_checkboxes = true;
  var bold_file_buttons = true;
  var collaborator_account_notes = true;

  if (app === "ro")
  {
    theme_editor_buttons = true;
    recurring_orders_install = true;
    customer_account_highlight = true;
  }

  chrome.storage.sync.set({
    customer_lookup_option: customer_lookup,
    theme_editor_buttons_option: theme_editor_buttons,
    recurring_orders_install_option: recurring_orders_install,
    email_recovery_buttons_option: email_recovery_buttons,
    customer_account_highlight_option: customer_account_highlight,
    collaborator_account_checkboxes_options: collaborator_account_checkboxes,
    bold_buttons_options: bold_file_buttons,
    collaborator_account_notes_options: collaborator_account_notes
  });
}

function saveSelectedApp() {
  //var app = document.getElementById('customer_lookup').checked;
  var app = $('.app_selector').val();

  chrome.storage.sync.set({
    selected_app: app
  });
}

function getCurrentFile()
{
  var query = url.substring(url.indexOf('?key=') + 1);
  var key = query.substring(query.indexOf('=') + 1, query.indexOf('/'));
  var file = query.substring(query.indexOf('/') + 1);
  url = url.substring(0, url.indexOf('?'));
  url = url + "/assets?asset%5Bkey%5D=" + key + "%2F" + file;

  var xhr = new XMLHttpRequest();
xhr.open('GET', url, true);
//xhr.responseType = 'text';
xhr.onload = function(e) {
  if (this.status == 200) {
    var response = this.response;
    console.log(response)
  }
};
xhr.send();
}

function loadPopup()
{
  $('.app_selector').click(function()
  {
    saveSelectedApp();
    toggleOptions($(this).val());
  });
}

document.getElementById('options_button').onclick = openOps;
function openOps() {
  chrome.runtime.openOptionsPage()
    };
