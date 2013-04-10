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
