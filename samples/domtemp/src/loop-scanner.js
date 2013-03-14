/**
 * Scan loop
 */
(function(dt){

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
  node.innerHTML = '';
  node.removeAttribute('data-each');
  // return false to stop scanning it's children node.
  return false;
}

dt.scanners.push(scanLoop);

var handler = {
  fill: function(data, pool){
    this.clear();
    var val = dt.getValue(this.template, this.field, null, data, pool);
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

})(dt);