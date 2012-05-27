
(function(){

var dt = window.dt = function(node, opts){
    this.node = node;
    this._opts = opts || {};
    this._phs = {};
    this._subdt = {};
    scan(node, this._subdt, this._phs);
};
dt.prototype = {
    fill: function(data, append){
        this._hide();
        for(var field in this._phs){
            var handlers = this._phs[field].handlers;
            var val = evaluate(data, field);
            var opt = this._opts[field];
            if(opt !== void 0){
                val = (typeof opt === 'function') ? opt(val, data) : opt;
            }
            this._phs[field].val = val;
            for(var i = 0; i < handlers.length; i++){
                handlers[i].fill(val);
            }
        }
        return this._show();
    },
    append: function(data){
        return this.fill(data, true);
    },
    clean: function(){
        this._hide();
        for(var field in this._phs){
            var handlers = this._phs[field].handlers;
            for(var i = 0; i < handlers.length; i++){
                handlers[i].clean();
            }
        }
        return this._show();
    },
    opt: function(k, v){
        if(typeof k === 'string'){
            this._opts[k] = v;
        }else if(k){
            for(var i in k){
                opt[i] = k[i];
            }
        }
        return this;
    },
    _show: function(){
        var node = this.node;
        if( !node._parent ) return this;
        node._parent.replaceChild(node, node._replace);
        return this;
    },
    _hide: function(){
        var node = this.node;
        if( !node._parent ) node._parent = node.parentNode;
        if( !node._parent ) return this;
        if( !node._replace ) node._replace = document.createElement('p');
        node._parent.replaceChild(node._replace, node);
        return this;
    }
};

var regex = /(\$?)\{\{\s*([\w\d\.]+)\s*:?\s*([^}]*)\}\}/ig;
var alias = {
    'imgsrc': 'src',
    'styl': 'style'
};
var isIE = navigator.userAgent.indexOf('MSIE') >= 0;

function scan(node, subdt, phs){
    if(node.nodeType === 3) return scanText(node, phs);
    if(node.nodeType !== 1) return ;
    scanAttr(node, phs);
    // isFormField( node ) && scanFormField( node, phs, fields, prefix );
    if(node.getAttribute('each')) return scanLoop(node, subdt, phs);
    // node.childNodes changed by scanText function.
    // fuck IE, we cannnot use the simpliest way below:
    // var children = Array.prototype.slice.call( node.childNodes );
    var children = [];
    for(var i = 0, len = node.childNodes.length; i < len; i++){
        children.push( node.childNodes[i] );
    }
    for(var i = 0, len = children.length; i < len; i++){
        scan(children[i], subdt, phs);
    }
}

function scanAttr(node, phs){
    var attrs = node.attributes;
    for(var i = 0, len = attrs.length; i < len; i++){
        var attr = attrs[i];
        var _ori = attr.nodeValue;
        var _phs = [];
        if(typeof _ori !== 'string') continue;
        _ori.replace(regex, function(match, has$, field, exp, startIdx){
            var ph = {f: field, m: match},
                name = alias[attr.nodeName] || attr.nodeName,
                handler = {
                    fill: function(v){
                        var val = this._ori, ph, _tm;
                        for(var i = 0; i < this._phs.length; i++){
                            ph = this._phs[i];
                            _tm = phs[ph.f].val;
                            if( ph.convert )
                                _tm = ph.convert( _tm );
                            val = val.replace(ph.m, _tm||'');
                        }
                        setAttribute(node, name, val);
                    },
                    clean: function(){
                        var val = this._ori.replace(regex, '');
                        setAttribute(node, name, val);
                    },
                    _ori: _ori,
                    _phs: _phs
                };
            if(exp) ph.convert = convert(field, exp);
            _phs.push( ph );
            getHandlers(phs, field).push( handler );
        });
    }
}

function scanText( node, phs, prefix ){
    var parent = node.parentNode;
    var value = node.nodeValue;
    var txt, idx = 0;
    node.nodeValue.replace(regex, function( match, has$, field, exp, startIdx ){
        if( txt = value.substring(idx, startIdx) ) parent.insertBefore( textNode(txt), node );
        var dn = textNode( match );
        var handler = {
            fill: function( val ){
                if( this.convert ) val = this.convert(val);
                if( val.jquery ){
                    val = $.map(val.toArray(), function(it){return it;});
                };
                if( val.nodeType !== 1 && !isArray(val) || !has$ ) val = textNode( val );
                var now = this._now;
                if( isArray(now) ){
                    for( var i = 1; i < now.length; i++){
                        parent.removeChild( now[i] );
                    }
                    now = now[0];
                }
                if( isArray(val) ){
                    for( var i = 0; i < val.length; i++){
                        parent.insertBefore( val[i], now );
                    }
                }else if(val){
                    parent.insertBefore( val, now );
                }
                parent.removeChild( now );
                this._now = val;
            },
            clean: function(){
                var now = this._now;
                if( isArray(now) ){
                    for(var i = 1; i < now.length; i++){
                        parent.removeChild( now[i] );
                    }
                    now = now[0];
                }
                parent.replaceChild( this._empty, now );
                this._now = this._empty;
            },
            _ori: dn,
            _now: dn,
            _empty: textNode('')
        };
        if( exp ) handler.convert = convert( field, exp );
        getHandlers(phs, field).push( handler );
        parent.insertBefore( dn, node );
        idx = startIdx + match.length;
    });
    if( txt = value.substring(idx) ) parent.insertBefore( textNode(txt), node );
    parent.removeChild( node );
}

function scanLoop(node, subdt, phs){
    var field = node.getAttribute('each');
    var firstChild, empty;
    var childNodes = node.childNodes;
    for(var i = 0, len = childNodes.length; i < len; i++){
        if(childNodes[i].nodeType === 3) continue;
        if(firstChild && !empty) empty = childNodes[i];
        if(!firstChild) firstChild = childNodes[i];
    }
    var _dt = subdt[field] = {
        item: firstChild,
        empty: empty,
        items: []
    };
    getHandlers(phs, field).push({
        fill: function(val){
            this.clean();
            if(!val || val.length ===0){
                empty && node.appendChild(empty);
            }else{
                for(var i = 0, len = val.length; i < len; i++){
                    var item = _dt.items[i];
                    if(!item){
                        var clone = firstChild.cloneNode(true);
                        isIE && (clone.innerHTML = firstChild.innerHTML);
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

var toString = Object.prototype.toString;

function isArray( obj ){
    return obj && toString.call(obj) === '[object Array]';
}

function textNode( text ){
    return document.createTextNode('' + text);
}

function convert(field, exp){
    return new Function('v', 'return ' + exp);
}

function setAttribute(node, attr, val){
    if(attr === 'class'){
        node.className = val;
    }if((attr === 'style') && isIE && val){
        node.style.cssText = val;
    }else{
        node.setAttribute(attr, val);
    }
}

function getHandlers(phs, field){
    if( !phs[field] ) phs[field] = { handlers: [] };
    return phs[field].handlers;
}

function evaluate( ctx, exp ){
    if( !ctx || !exp ) return null;
    var fs = exp.split('.'),
        data = ctx, i;
    for( i = 0; data && i < fs.length; i++ ){
        if( fs[i] ) data = data[ fs[i] ];
    }
    return data;
}

})();