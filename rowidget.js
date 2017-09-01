$(document).ready(function() {
  loadSubscriptionWidget();
});

function loadSubscriptionWidget()
{
  var widget = $('<div class="bold-install-widget" />');
  widget.appendTo($(".segment-header-actions"));

    var input = $('<input type="button" value="Fill Subs" class="btn btn-primary bold-install-dropdown" />');
    input.appendTo($(".bold-install-widget"));

    var flex = $('<div class="bold_flex_div" />');
    flex.appendTo($(".bold-install-widget"));

    var div = $('<div class="bold-install-dropdown-menu" />');
    div.appendTo($(".bold_flex_div"));

    var testOne = $('<input type="button" value="Standard" class="btn bold-install bold-install-testOne" />');
    testOne.appendTo($(".bold-install-dropdown-menu"));

    var testTwo = $('<input type="button" value="Convertible" class="btn bold-install bold-install-testTwo" />');
    testTwo.appendTo($(".bold-install-dropdown-menu"));

    var testThree = $('<input type="button" value="Build A Box" class="btn bold-install bold-install-testThree" />');
    testThree.appendTo($(".bold-install-dropdown-menu"));

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

      if ($(e.target).hasClass('bold-install-testOne'))
      {

        $('.field-group [name="discount"]').val('5');
        $('.input-field[name="group_name"]').val('Bold Test 1');
        $('#subscription_type').val('1');
        $('.products-step').css('display', 'block');
        $('.discount-step').css('display', 'block');
        $('.box-step').css('display', 'none');
      //  getProduct(setProdSelector, '#Bold Test Product 1', 'bold-zachary');
      }else if ($(e.target).hasClass('bold-install-testTwo'))
      {
        $('.field-group [name="discount"]').val('5');
        $('.input-field[name="group_name"]').val('Bold Test 2');
        $('#subscription_type').val('2');
        $('.products-step').css('display', 'block');
        $('.discount-step').css('display', 'block');
        $('.box-step').css('display', 'none');
        $('.convertible').css('display', "block");
      //  getProduct(setProdSelector, '#Bold Test Product 2', 'bold-zachary');
      //  getProduct(setRecurringProdSelector, '#Bold Test Product 2', 'bold-zachary', '49799035398');
      } else if ($(e.target).hasClass('bold-install-testThree'))
      {
        $('.products-step').css('display', 'none');
        $('.discount-step').css('display', 'none');
        $('.box-step').css('display', 'block');
        $('.input-field[name="group_name"]').val('Bold Test 3');
        $('#subscription_type').val('3');
        $('.content .action_button_name').text('Continue');
        setTimeout(function() {
          if (!clicked)
          {
            $('.content .action_button_name').click();
            clicked = true;
          }
        }, 500);
        return;
    }
  });
});

}
