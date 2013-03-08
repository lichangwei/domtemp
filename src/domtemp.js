/**
 * @file domtemp.js
 * @overview
 */
(function(){

'use strict';

var DomTemp = window.dt = function(node, opts){
  // below code allow to create DomTemp object without 'new'
  if(!(this instanceof DomTemp)){
    return new DomTemp(node, opts);
  }
  setUp(this, node, opts || {});
  scanNode(this, this.node, this.placeholders);
};

DomTemp.version = '1.0';

DomTemp.regexp  = /\{\{\s*([\w\d\.]+)\s*:?\s*([^}]*)\}\}/ig;
DomTemp.scanners = [];
DomTemp.isIE = navigator.userAgent.indexOf('MSIE') >= 0;

DomTemp.convert = function(field, exp){
  return new Function('val', 'return ' + exp);
};
DomTemp.getValue = function(template, field, convert, data, pool){
  var value = pool[field];
  if( !value ){
    value = pool[field] = evaluate(data, field);
  }
  var opt = template.opts[field];
  if(typeof opt === 'function'){
    value = opt(value, data);
  }else if(opt !== void 0){
    value = opt;
  }
  if( convert ){
    value = convert(value);
  }
  return value;
};

DomTemp.prototype = {
  fill: function(data, append){
    if(append && this.data){
      this.data = merge(this.data, data);
    }else{
      this.data = data;
    }
    this.hide();
    for(var i = 0, len = this.handlers.length; i < len; i++){
      var handler = this.handlers[i];
      handler.fill(this.data, {});
    }
    return this.show();
  },
  append: function(data){
    return this.fill(data, true);
  },
  fetch: function(){
    var data = {};
    var undef = void 0;
    for(var i = 0, len = this.handlers.length; i < len; i++){
      var handler = this.handlers[i];
      if( handler.fetch ){
        assemble(data, handler.field, handler.fetch());
      }
    }
    return data;
  },
  clear: function(){
    if( this.data ){
      this.data.length = 0;
    }
    this.hide();
    for(var i = 0, len = this.handlers.length; i < len; i++){
      var handler = this.handlers[i];
      handler.clear();
    }
    return this.show();
  },
  hide: function(){
    var node = this.node;
    // remember its parentNode for append to dom when showing.
    if( !node._parent ) node._parent = node.parentNode;
    if( !node._parent ) return this;
    // create a p elements to hold its position.
    if( !node._replace ) node._replace = document.createElement('p');
    node._parent.replaceChild(node._replace, node);
    return this;
  },
  show: function(){
    var node = this.node;
    if( node._parent && node._replace){
      node._parent.replaceChild(node, node._replace);
    }
    return this;
  }
};

var container = document.createElement('body');

function setUp(template, node, opts){
  var html;
  if(typeof jQuery !== 'undefined' && node instanceof jQuery){
    node = node[0];
  }
  // @TODO don't support tbody tr etc. tag
  if(typeof node === 'string'){
    container.innerHTML = node;
    html = node;
    node = container.children[0];
    // or node.parentNode is container(impact with prototype.hide function).
    // If we use container.innerHTML = '', node.innerHTML will also be '' in IE.
    container.removeChild(node);
  }else{
    if( node.outerHTML ){
      html = node.outerHTML;
    }else{
      container.innerHTML = '';
      container.appendChild(node);
      html = container.innerHTML;
    }
  }
  template.node = node;
  template.opts = opts;
  template.html = html;
  template.handlers = [];
}

var scanners = DomTemp.scanners;

function scanNode(template, node){
  // only scan element node
  if(node.nodeType !== 1){
    return;
  }
  // continue to scan children node, default is true, until set to false.
  var needScanChildren = true;
  for(var i = 0;  i < scanners.length; i++){
    var result = scanners[i](template, node);
    if( result === false ) needScanChildren = false;
  }
  if( needScanChildren ){
    scanChildren(template, node);
  }
}

function scanChildren(template, node){
  var children = node.children;
  for(var i = 0; i < children.length; i++){
    scanNode(template, children[i]);
  }
}

function evaluate(ctx, exp){
  if(!ctx || !exp) return null;
  var fields = exp.split('.'),
    result = ctx, i;
  for( i = 0; result && i < fields.length; i++ ){
    if( fields[i] ) result = result[ fields[i] ];
  }
  return result;
}

function assemble(data, field, val){
  if(data && field){
    var fields = field.split('.');
    var temp = data;
    for(var i = 0, len = fields.length; i < len - 1; i++){
      if(!fields[i]) continue;
      temp[fields[i]] = temp[fields[i]] || {};
      temp = temp[fields[i]];
    }
    temp[fields[len-1]] = val;
  }
  return data;
}

function merge(target, obj){
  if( !target ) target = {};
  for(var k in obj){
    if(typeof target[k] === 'object' && typeof obj[k] === 'object'){
      target[k] = merge(target[k], obj[k]);
    }else{
      target[k] = obj[k];
    }
  }
  return target;
}

})();