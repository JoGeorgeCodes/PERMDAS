var API = " https://atm-differences-pages-applies.trycloudflare.com";//URGENT MAKE SURE TO REMOVE SLASH AT END

//of course the programmer forgot
if (API.endsWith('/')) {
  // slice(0, -1) creates a new string from the start up to the second-to-last character
  API = str.slice(0, -1);
}
