/**
 * Scan text nodes
 */
(function(dt){

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
                    val = $.map(val.toArray(), function(it){return it;});
                };
                if( val && val.nodeType !== 1 && !isArray(val) || !has$ ){
                    val = textNode(val);
                }
                var current = this._now;
                if( isArray(current) ){
                    current = current[0];
                }
                addNode(parent, current, val);
                removeNode(this._now);
                this._now = val;
            },
            clean: function(){
                var now = this._now;
                parent.replaceChild( this._empty, isArray(now) ? now[0] : now );
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

var toString = Object.prototype.toString;
function isArray(obj){
    return obj && toString.call(obj) === '[object Array]';
}

function textNode(text){
    return document.createTextNode('' + text);
}

function removeNode(node){
    if( isArray(node) ){
        var parnet = node[0].parentNode;
        for(var i = 0; i < now.length; i++){
            parent.removeChild( node[i] );
        }
    }else{
        node.parentNode.removeChild(node);
    }
}

function addNode(parent, child, val){
    if( isArray(val) ){
        for( var i = 0; i < val.length; i++){
            parent.insertBefore(val[i], child);
        }
    }else if(val){
        parent.insertBefore(val, child);
    }
}

})(dt);
