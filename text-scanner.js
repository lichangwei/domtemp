/**
 * Scan text nodes
 */
(function(dt){

'use strict';

dt.scanner.add({
    scan: function(dto, node, phs){
        if(node.nodeType !== 3) return;
        scanText(dto, node, phs);
        return false;
    },
    name: 'text'
});

function scanText(dto, node, phs){
    var value = node.nodeValue;
    var regexp = dt.opt('regexp');
    // if there's no placeholder, ignore it.
    if(!value.match(regexp)) return;
    
    var parent = node.parentNode;
    var txt;
    var idx = 0;
    
    // 'name: [{{first_name}}.{{last_name}}]'
    value.replace(regexp, function( match, has$, field, exp, startIdx ){
        // txt === 'name: ['
        if(txt = value.substring(idx, startIdx)){
            parent.insertBefore(textNode(txt), node);
        }
        // dn === '{{first_name}}'
        var splited = textNode(match);
        var handler = {
            fill: function( val ){
                if( this.convert ) val = this.convert(val);
                if( val && val.jquery ){
                    val = val.get();
                };
                if( val && val.nodeType !== 1 && !dt.util.isArray(val) || !has$ ){
                    val = textNode(val);
                }
                addNode(parent, this._now, val);
                removeNode(this._now);
                this._now = val;
            },
            clean: function(){
                addNode(parent, this._now, this._empty);
                removeNode(this._now);
                this._now = this._empty;
            },
            _ori: splited,
            _now: splited,
            _empty: textNode('')
        };
        if(exp) handler.convert = convert(field, exp);
        dto.addHandler(field, handler);
        parent.insertBefore(splited, node);
        idx = startIdx + match.length;
    });
    // txt === ']'
    if(txt = value.substring(idx)){
        parent.insertBefore(textNode(txt), node);
    }
    // remove original node which contains placehodlers
    parent.removeChild(node);
}

function textNode(text){
    return document.createTextNode('' + text);
}

function removeNode(node){
    if( dt.util.isArray(node) ){
        var parnet = node[0].parentNode;
        for(var i = 0; i < node.length; i++){
            parent.removeChild( node[i] );
        }
    }else if( node ){
        var parent = node.parentNode;
        parent && parent.removeChild(node);
    }
}

function addNode(parent, child, val){
    if( dt.util.isArray(child) ){
        child = child[0];
    }
    if( dt.util.isArray(val) ){
        for( var i = 0; i < val.length; i++){
            parent.insertBefore(val[i], child);
        }
    }else if( val ){
        parent.insertBefore(val, child);
    }
}

})(dt);
