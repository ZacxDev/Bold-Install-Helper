

var build_cart_names = [ 'buildcart', 'refreshcart', 'sc', 'yc' ]

function buildCartIndex(data)
{

  var lines = parseValueFromXML(data).split('\n');

  for (var i = 0; i < lines.length; ++i)
  {

  }

}

function isBuildCart(line)
{
  // if the line is not declaring a function, return false
  if (lines.indexOf('function') == -1)
    return false;

  var name;
  // loop build_cart_names and check if the line has a function that matches the name
  for (var i = 0; i < build_cart_names.length; ++i)
  {
    name = build_cart_names[i].toLowerCase();
    // if the line is a function (checked above) and is named like a buildcart is, return true
    if (line.indexOf(name) != -1)
      return true;
  }
  // if line is a function but does not match any buildcarts
  return false;
}
