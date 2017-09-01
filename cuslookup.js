$(document).ready(function() {
  loadCusLookupBtns();
  loadCusLookupListener();
});

function loadCusLookupBtns()
{
  destroyCusButtons();
  var url;
  var  btn = $('<a type="button" target="_blank" class="customer-lookup-btn btn btn-primary">Lookup</a>');
  var columnHeader = $('<th class="customerLookup"> <span>Customer Lookup</span> </th>')[0];
  var tableHeaderChild = $('.install-row').children().eq(1)[0]
  var tableBodyChild = $('tbody tr')
  tableHeaderChild.after(columnHeader)
  $('tbody > tr').each(function(index, element) {
    var tableRow = $('tbody tr').eq(index)[0];

    var url = ($(tableRow).find("td > div > a")[0]).text;
    url = url.substring(url.indexOf('//') + 1, url.length);
    ($('tbody tr').eq(index)).children().eq(1)[0].after($('<td class="customerLookup"> <span> <a type="button" target="_blank" class="customer-lookup-btn btn btn-primary">Lookup</a> </span> </td> ')[0]);
    $('.customer-lookup-btn').eq(index).attr('href', 'https://util.boldapps.net/admin/shop?shop=' + url);
  });
}

function loadCusLookupListener() {

$('.card-section button').click(function() {
  setTimeout(function() {
    loadCusLookupBtns()
  }, 200);
});

$('.card-section select').click(function() {
  setTimeout(function() {
    loadCusLookupBtns()
  }, 200);
});


}

function destroyCusButtons()
{
  if($('.customerLookup'))
  {
    $('.customerLookup').remove();
  }
}
