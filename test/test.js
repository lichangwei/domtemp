
var assert = require('assert');

var Browser = require('zombie');
var browser = new Browser();

browser.site = 'http://127.0.0.1/github/domtemp/test/';
browser.slient = true;

browser.visit('index.html', function (e, browser, status){
  var document = browser.document;
  var failed = document.querySelector('#qunit-testresult .failed').innerHTML;
  assert.equal(failed, '0');
});