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
    
    var subdt = dto._subdt;
    var children = node.children;
    var _dt = subdt[field] = {
        item: children['0'],
        empty: children['1'],
        items: []
    };
    dto.addHandler(field, {
        fill: function(val){
            this.clean();
            if(!val || val.length ===0){
                _dt.empty && node.appendChild(_dt.empty);
            }else{
                for(var i = 0, len = val.length; i < len; i++){
                    var item = _dt.items[i];
                    if(!item){
                        var clone = _dt.item.cloneNode(true);
                        dt.util.isIE && (clone.innerHTML = _dt.item.innerHTML);
                        item = _dt.items[i] = new dt(clone);
                    }
                    item.fill( val[i] );
                    node.appendChild(item.node);
                }
            }
        },
        clean: function(){
            for(var i = node.childNodes.length - 1; i >= 0; i--){
                node.removeChild(node.childNodes[i]);
            }
            for(var i = 0, len = _dt.items.length; i < len; i++){
                _dt.items[i].clean();
            }
        }
    });
}

})(dt);
