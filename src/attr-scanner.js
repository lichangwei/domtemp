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