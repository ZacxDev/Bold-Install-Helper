$(document).ready(function() {
  scanROFiles();
});

var roFiles = [ "layout/theme.liquid", "templates/cart.liquid", "templates/product.liquid", "sections/cart-template.liquid", "sections/product-template.liquid" ];
var roHooks = {
  theme: ["bold-common", "bold-ro-init"],
  cart : [],
  product : [],
  cart_template : [],
  product_template : []
}

var ro_i = 0;
function scanROFiles()
{
  var key, file;
//  for (var i = 0; i < roFiles.length; ++i)
  //{
    key = roFiles[ro_i].substring(0, roFiles[ro_i].indexOf('/'));
    file = roFiles[ro_i].substring(roFiles[ro_i].indexOf('/') + 1);

    getFile(key, file, function(response)
    {
      var b = fileContainsStrings(response, roHooks[file.substring(0, file.indexOf('.')).replace('-', '_')], function() {
        if(ro_i < roFiles.length) {
            scanROFiles();
        }
      });
      //console.log(file + ": " + b)
    });
  //}
  ro_i++;
}

function fileContainsStrings(response, hooks, callback)
{
  var lines = parseValueFromXML(response);

  for (var i = 0; i < hooks.length; ++i)
    if (lines.indexOf(hooks[i]) == -1)
    {
      callback();
      return false;
    }

  callback();
  return true;
}
