/**
 * Scan loop
 */
(function(dt, util){

'use strict';

function scanLoop(template, node){
  // formamt: filed|indexAttrName
  var field = node.getAttribute('data-each');
  if(!field) return;
  
  var array = field.split('|');
  field = array[0];
  var indexAttrName = array[1] || 'index';
  
  template.handlers.push({
    template: template,
    opts: util.merge(null, template.opts),
    node: node,
    fill: handler.fill,
    clear: handler.clear,
    field: field,
    index: indexAttrName,
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
          this.opts[this.index] = i;
          item = this.items[i] = dt(this.item.cloneNode(true), this.opts);
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