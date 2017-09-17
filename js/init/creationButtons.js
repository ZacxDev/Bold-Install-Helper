$(document).ready(function() {
  //createButtons();
});

function createButtons() {
  bhCssFile = $('.bhCssFile');
  if (bhCssFile.length === 0)
    {
   bhCssFile = $('<input type="button" value="CSS" class="btn bh-btn bhCssFile" />');
   bhCssFile.prependTo($('.theme-asset-actions'));
  }
  bhBoldHelpers.click(function(){
    createBoldHelpers();
  });
  bhBoldHelpers = $('.bhBoldHelpers');
  if (bhBoldHelpers.length === 0)
    {
   bhBoldHelpers = $('<input type="button"  value="Bold Helper Functions" class="btn bh-btn bhBoldHelpers" />');
   bhBoldHelpers.prependTo($('.theme-asset-actions'));
   bhBoldHelpers.click(function(){
     createBoldHelpers();
   });
  }
}
function createBoldCss()
{
  console.log("hi hey there hello");
}
function createBoldHelpers()
{
  console.log("Hey Hi Hello");
}
