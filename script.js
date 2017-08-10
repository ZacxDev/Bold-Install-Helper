
var appsnet = false;
$( document ).ready(function() {
  console.log('ready');

var shopifyLogin = false;

if($(".ico-shopify-bag").length != 0)
{
  shopifyLogin = true;
}

  var widget = $('<div class="bold-install-widget" />');
  widget.appendTo($(".segment-header-actions"));

    var flex = $('<div class="bold_flex_div" />');
    flex.appendTo($(".bold-install-widget"));

    var div = $('<div class="bold-install-dropdown-menu" />');
    div.appendTo($(".bold_flex_div"));

    var input = $('<input type="button" value="Install" class="btn btn-primary bold-install-dropdown" />');
    input.appendTo($(".bold-install-widget"));

    var testOne = $('<input type="button" value="Standard" class="bold-install bold-install-testOne" />');
    testOne.appendTo($(".bold-install-dropdown-menu"));

    var testTwo = $('<input type="button" value="Convertible" class="bold-install bold-install-testTwo" />');
    testTwo.appendTo($(".bold-install-dropdown-menu"));

    var testThree = $('<input type="button" value="Build A Box" class="bold-install bold-install-testThree" />');
    testThree.appendTo($(".bold-install-dropdown-menu"));

    if (shopifyLogin)
    {
      var fillLogin = $('<input type="button" value="Support@" class="btn recover-btn" />');
      fillLogin.appendTo($(".dialog-form "));
    }

    $('html').click(function() {
      $('.bold-install-dropdown-menu').css('display', 'none');
    });

    $(".bold-install-dropdown").click(function(e)
    {
      if (isBoxTab())
      {
        fillBAB();
      } else {
        $('.bold-install-dropdown-menu').css('display', 'block');
      }
      e.stopPropagation();
    });


$('.bold-install').click(function(e)
{

  $('.bold-install-dropdown-menu').children().each(function () {

    $('.toggle-field input[value="consistent"]').prop('checked', true);
    $('.discount_config_consistent').css("display", "block");
    $('.input-field').prop('disabled', false);
    $('.card .btn').click();
    $('html, body').animate({
            scrollTop: $(".products-step").offset().top
        }, 2000);
      if ($(e.target).hasClass('bold-install-testOne'))
      {
        $('html, body').animate({
        scrollTop: $("#elementtoScrollToID").offset().top
    }, 2000);
        $('.field-group [name="discount"]').val('5');
        $('.input-field[name="group_name"]').val('Bold Test 1');
        $('#subscription_type').val('1');
        $('.products-step').css('display', 'block');
        $('.discount-step').css('display', 'block');
        $('.box-step').css('display', 'none');
      }else if ($(e.target).hasClass('bold-install-testTwo'))
      {
        $('.field-group [name="discount"]').val('5');
        $('.input-field[name="group_name"]').val('Bold Test 2');
        $('#subscription_type').val('2');
        $('.products-step').css('display', 'block');
        $('.discount-step').css('display', 'block');
        $('.box-step').css('display', 'none');
        $('.convertible').css('display', "block");
      } else if ($(e.target).hasClass('bold-install-testThree'))
      {
        $('.products-step').css('display', 'none');
        $('.discount-step').css('display', 'none');
        $('.box-step').css('display', 'block');
        $('.input-field[name="group_name"]').val('Bold Test 3');
        $('#subscription_type').val('3');
        $('.content .action_button_name').text('Continue');
        setTimeout(function() {
          $('.content .action_button_name').click();
        }, 500);
    }
  });
});

$('.recover-btn').click(function(e)
{
  if (appsnet)
    $('#recover-login').val("support@boldapps.net");
  else
    $('#recover-login').val("support@boldcommerce.com");
  appsnet = !appsnet;

  $('.dialog-submit').click();
});

});

function fillBAB()
{
  $('.add_box_slot')[0].click();
  $('.add_box_product_size')[0].click();

  $('.slot_type_name').val('Bold Test');
  $('.slot_save')[0].click();
  $('.field-group input[name="product_size_box_size"]').val('3');
  setTimeout(function() {
    $('.add_box_product_occurrences')[0].click();
    $('.field-group input[name="start_date"]').val('2017-08-02');
  }, 1000);
}

function isBoxTab()
{
  return $('.segment-header h1').text().indexOf('Build a Box') >= 0;
}
