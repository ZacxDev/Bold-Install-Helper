$(document).ready(function() {
  checkBoxes();
  fillNotes();
});
function checkBoxes()
{
  document.getElementById('collaborator_relationship_allow_orders').checked = true;
  document.getElementById('collaborator_relationship_allow_customers').checked = true;
  document.getElementById('collaborator_relationship_allow_products').checked = true;
  document.getElementById('collaborator_relationship_allow_applications').checked = true;
  document.getElementById('collaborator_relationship_allow_preferences').checked = true;
  document.getElementById('collaborator_relationship_allow_domains').checked = true;
  document.getElementById('collaborator_relationship_allow_pages').checked = true;
  document.getElementById('collaborator_relationship_allow_links').checked = true;
  document.getElementById('collaborator_relationship_allow_themes').checked = true;
}
function fillNotes()
{
  chrome.storage.sync.get({
    collaborator_account_notes_options: ""
    }, function(items) {

      document.getElementById('collaborator_relationship_request_message').value = items.collaborator_account_notes_options;
    });
}
