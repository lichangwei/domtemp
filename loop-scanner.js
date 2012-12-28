/**
 * Scan loop
 */
(function(dt){

'use strict';

dt.scanner.add({
  scan: scanLoop,
  name: 'loop'
});

function scanLoop(dto, node, phs){
  if(!node || node.nodeType !== 1) return;
  
  var field = node.getAttribute('each');
  if(!field) return;
  
  dto.addHandler(field, {
    fill: function( val ){
      this.clean();
      if(!val || val.length ===0){
        if( this.empty ){
          node.appendChild(this.empty);
        }
      }else{
        for(var i = 0, len = val.length; i < len; i++){
          var item = this.items[i];
          if(!item){
            var clone = this.item.cloneNode(true);
            if( dt.util.isIE ){
              clone.innerHTML = this.item.innerHTML;
            }
            item = this.items[i] = new dt(clone);
          }
          item.fill( val[i] );
          node.appendChild(item.node);
        }
      }
    },
    clean: function(){
      node.innerHTML = '';
    },
    item: node.children[0],
    empty: node.children[1],
    items: []
  });

  // stop scanning it's children node.
  return false;
}

})(dt);
