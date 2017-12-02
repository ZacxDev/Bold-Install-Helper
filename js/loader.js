

var roAjaxFiles = [ "theme.min.js.liquid", "theme.js.liquid" ]

var build_cart_names = [ 'buildCart', 'refreshCart', 'Sc =', 'Yc =' ]

function buildCartIndex(data)
{

  var lines = parseValueFromXML(data);//.split('\n');
  debugger;
isBuildCart(lines);
  // for (var i = 0; i < lines.length; ++i)
  // {
  //   isBuildCart(lines[i]);
  // }

}

// Tested for:
// - Narrative (unminified)
function isBuildCart(line)
{
  // if the line is not declaring a function, return false
  if (line.indexOf('function') == -1)
    return false;

  var name;
  // loop build_cart_names and check if the line has a function that matches the name
  for (var i = 0; i < build_cart_names.length; ++i)
  {
    name = build_cart_names[i];
    // if the line is a function (checked above) and is named like a buildcart is, return true
    if (line.indexOf(name) != -1)
    {
      console.log(line.substring(line.indexOf(name) - name.length, line.indexOf(name) + 500));
      return true;
    }
  }
  // if line is a function but does not match any buildcarts
  return false;
}


function isUniqueInstall() {

}

// Move this function to install.js
function genaricInstall() {

}
