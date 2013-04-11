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

DomTemp.regexp  = /\{\{\s*([\w\d\.]+)\s*:?\s*([^}]*)\}\}/ig;
DomTemp.scanners = [];

var util = DomTemp.util = {
  getValue: function(template, field, convert, data, pool){
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
  },
  convert: function(field, exp){
    return new Function('val', 'return ' + exp);
  },
  hideNode: function(node){
    // remember its parentNode for append to dom when showing.
    if( !node._parent ) node._parent = node.parentNode;
    if( !node._parent ) return;
    // create a p elements to hold its position.
    if( !node._replace ) node._replace = document.createTextNode('');
    node._parent.replaceChild(node._replace, node);
  },
  showNode: function(node){
    if( node._parent && node._replace){
      node._parent.replaceChild(node, node._replace);
    }
  }
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
    util.hideNode(this.node);
    return this;
  },
  show: function(){
    util.showNode(this.node);
    return this;
  }
};

var container = document.createElement('body');

function setUp(template, node, opts){
  if(typeof jQuery !== 'undefined' && node instanceof jQuery){
    node = node[0];
  }
  if(typeof node === 'string'){
    node = document.querySelector(node);
  }
  template.node = node;
  template.opts = opts;
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
/**
 * Scan attributes
 */
(function(dt, util){

'use strict';

function scanAttrs(template, node){
  var dataset = isDatasetSupported ? node.dataset : getDataset(node);
  for(var nodeName in dataset){
    var nodeValue = dataset[nodeName];
    if(typeof nodeValue !== 'string') continue;
    var handler = handleAttr(template, node, nodeName, dataset[nodeName]);
    if( handler ){
      node.removeAttribute('data-' + nodeName);
      template.handlers.push(handler);
    }
  }
}

dt.scanners.push(scanAttrs);

function handleAttr(template, node, nodeName, nodeValue){
  var holders = [];
  nodeValue.replace(dt.regexp, function(match, field, exp, startIdx){
    holders.push({
      field: field,
      match: match,
      convert: exp ? util.convert(field, exp) : void 0
    });
  });
  if(holders.length === 0){
    return ;
  }
  var handler = {
    fill: function(data, pool){
      var real = nodeValue;
      for(var i = 0; i < holders.length; i++){
        var holder = holders[i];
        var val = util.getValue(this.template, holder.field, holder.convert, data, pool);
        real = real.replace(holder.match, val);
      }
      this.setAttribute(node, nodeName, real);
    },
    clear: function(){
      this.setAttribute(node, nodeName, '');
    },
    setAttribute: attributeSetter[nodeName] || attributeSetter['*'],
    template: template
  };
  return handler;
}

var root = document.documentElement;
var isDatasetSupported = !!root.dataset;

function getDataset( node ){
  var attrs = node.attributes;
  var map = {};
  for(var i = 0, len = attrs.length; i < len; i++){
    var attr = attrs[i];
    var name = attr.nodeName;
    if(name.indexOf('data-') === 0){
      map[name.substr(5)] = attr.nodeValue;
    }
  }
  return map;
}

var attributeSetter = dt.attributeSetter = {
  'value': 'innerHTML' in root ? function(node, name, value){
      node.innerHTML = value;
    } : function(node, name, value){
      node.textContent = value;
    },
  'style': function(node, name, value){
    node.style.cssText = value;
  },
  'class': function(node, name, value){
    node.className = value;
  },
  'indom': function(node, name, value){
    if(value === 'true'){
      util.showNode(node);
    }else{
      util.hideNode(node);
    }
  },
  'display': function(node, name, value){
    node.style.display = value === 'true' ? '' : 'none';
  },
  '*': function(node, name, value){
    node.setAttribute(name, value);
  }
};

})(dt, dt.util);
/**
 * Scan form elements
 */
(function(dt, util){

'use strict';

dt.scanners.push(scanFormElements);

function scanFormElements(template, node){
  if( !isFormField(node) ) return;
  var field = node.name;
  if( !field ) return ;
  // var type = node.getAttribute('type');
  var type = node.type;
  var isNum = node.getAttribute('number');

  var handlers = template.handlers;
  var handler;
  for(var i = 0; i < handlers.length; i++){
    if(handlers[i].field === field && handlers[i].type === type){
      handler = handlers[i];
    }
  }
  if( !handler ){
    handler = new (protos[type] || protos.normal)();
    handler.field = field;
    handler.type = type;
    handler.template = template;
    template.handlers.push( handler );
  }

  handler.isNum = handler.isNum || type === 'number' || type ==='range' || isNum !== null;
  
  if(type === 'radio' || type === 'checkbox'){
    if( !handler.nodes ) handler.nodes = [];
    handler.nodes.push( node );
  }else{
    handler.nodes = node;
  }
}

function isFormField(node){
  if( !node.tagName ) return false;
  var tagName = node.tagName.toLowerCase();
  return ('input textarea select'.indexOf( tagName ) !== -1)
    && ('image file button reset submit'.indexOf(node.type) === -1);
}

var protos = {};
protos.normal = function(){};
protos.normal.prototype = {
  fill: function(data, pool){
    var val = util.getValue(this.template, this.field, null, data, pool);
    this.nodes.value = val || '';
  },
  clear: function(){
    this.nodes.value = '';
  },
  fetch: function(){
    return toNumber(this.nodes.value, this.isNum);
  }
};

protos.radio = function(){};
protos.radio.prototype = {
  fill: function(data, pool){
    var val = util.getValue(this.template, this.field, null, data, pool);
    var nodes = this.nodes,
      len = nodes.length,
      v = '' + val;
    for( var i = 0; i < len; i++ ){
      nodes[i].checked = false;
      if( nodes[i].value === v ){
        nodes[i].checked = true;
      }
    }
  },
  clear: function(){
    var nodes = this.nodes,
      len = nodes.length;
    for( var i = 0; i < len; i++ ){
      nodes[i].checked = false;
    }
  },
  fetch: function(){
    var nodes = this.nodes,
      len = nodes.length;
    for( var i = 0; i < len; i++ ){
      if( nodes[i].checked ){
        return toNumber(nodes[i].value, this.isNum);
      }
    }
  }
};

protos.checkbox = function(){};
protos.checkbox.prototype = {
  fill: function(data, pool){
    var val = util.getValue(this.template, this.field, null, data, pool);
    var nodes = this.nodes;
    var len = nodes.length;
    if( !isArray(val) ){
      val = [val];
    }
    for(var i = 0; i < len; i++){
      nodes[i].checked = false;
      for(var j = 0; val && j < val.length; j++){
        if(nodes[i].value === '' + val[j]){
          nodes[i].checked = true;
        }
      }
    }
  },
  clear: function(){
    var nodes = this.nodes,
      len = nodes.length;
    for( var i = 0; i < len; i++ ){
      nodes[i].checked = false;
    }
  },
  fetch: function(){
    var nodes = this.nodes,
      len = nodes.length;
    var arr = [];
    for( var i = 0; i < len; i++ ){
      if( nodes[i].checked ){
        arr.push( toNumber(nodes[i].value, this.isNum) );
      }
    }
    if( len === 1 ) return arr[0];
    return arr;
  }
};

protos['select-multiple'] = function(){};
protos['select-multiple'].prototype = {
  fill: function(data, pool){
    var val = util.getValue(this.template, this.field, null, data, pool);
    var options = this.nodes.children,
      len = options.length;
    for( var i = 0; i < len; i++ ){
      options[i].setAttribute('selected', '');
      options[i].selected = false;
      for( var j = 0; val && j < val.length; j++ ){
        if( options[i].value === val[j] ){
          options[i].setAttribute('selected', 'true'); // IE
          options[i].selected = true; // FF and other
        }
      }
    }
  },
  clear: function(){
    var options = this.nodes.children,
      len = options.length;
    for( var i = 0; i < len; i++ ){
      options[i].setAttribute('selected', ''); // IE
      options[i].selected = false; // FF and other
    }
  },
  fetch: function(){
    var options = this.nodes.children,
      len = options.length,
      arr = [];
    for( var i = 0; i < len; i++ ){
      if( options[i].selected ){
        arr.push( toNumber(options[i].value, this.isNum) );
      }
    }
    return arr;
  }
};

function toNumber( val, isNum ){
  if( isNum ){
    val = parseInt(val, 10);
  }
  // val !== val <==> typeof val === 'number' && isNaN(val)
  return val !== val ? NaN : val;
}

function isArray( obj ){
  return obj && Object.prototype.toString.call(obj) === '[object Array]';
}

})(dt, dt.util);

/**
 * Scan loop
 */
(function(dt, util){

'use strict';

function scanLoop(template, node){
  var field = node.getAttribute('data-each');
  if( !field ) return;
  template.handlers.push({
    template: template,
    node: node,
    fill: handler.fill,
    clear: handler.clear,
    field: field,
    item: node.children[0],
    empty: node.children[1],
    items: []
  });
  // if we use `node.innerHTML = '';`, item.innerHTML and empty.innerHTML will be '' in IE, even if IE10.
  var range = document.createRange();
  range.selectNodeContents(node);
  range.deleteContents();
  node.removeAttribute('data-each');
  // return false to stop scanning it's children node.
  return false;
}

dt.scanners.push(scanLoop);

var handler = {
  fill: function(data, pool){
    this.clear();
    var val = util.getValue(this.template, this.field, null, data, pool);
    if(!val || val.length ===0){
      if(this.empty){
        this.node.appendChild(this.empty);
      }
    }else{
      for(var i = 0, len = val.length; i < len; i++){
        var item = this.items[i];
        if(!item){
          item = this.items[i] = dt(this.item.cloneNode(true), this.template.opts);
        }
        item.fill( val[i] );
        this.node.appendChild(item.node);
      }
    }
  },
  clear: function(){
    this.node.innerHTML = '';
  }
};

})(dt, dt.util);