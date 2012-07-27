
(function(){

'use strict';

var dt = window.dt = function(node, opts){
    // below code allow to create dt object without 'new'
    if(!(this instanceof dt)){
        return new dt(node, opts);
    }
    this.node = parseNode(node);
    this._opts = opts || {};
    this._phs = {};
    this._subdt = {};
    scan(this, this.node, this._phs, this._subdt);
};

dt.scanner = {
    add: function(scanner, index){
        if(index === void 0){
            return scanners.push(scanner);
        }
        scanners.splice(index, 0, scanner);
    },
    remove: function(scanner){
        if(typeof scanner === 'number'){
            delete scanners[scanner];
        }else if(typeof scanner === 'string'){
            for(var i = 0; i < scanners.length; i++){
                if(scanners[i].name === scanner){
                    delete scanners[i];
                    return;
                }
            }
        }
    }
}

dt.opt = function(k, v){
    if(v !== void 0){
        opts[k] = v;
    }
    return opts[k];
};

dt.util = {
    isArray: function(obj){
        var toString = Object.prototype.toString;
        return obj && toString.call(obj) === '[object Array]';
    },
    isIE: navigator.userAgent.indexOf('MSIE') >= 0
};

var scanners = [];
var opts = {
    // match for ${{xx.xx.xx}}, {{xx}} etc.
    regexp: /(\$?)\{\{\s*([\w\d\.]+)\s*:?\s*([^}]*)\}\}/ig
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
            delete this._phs[field].val;
            var handlers = this._phs[field].handlers;
            for(var i = 0; i < handlers.length; i++){
                handlers[i].clean();
            }
        }
        return this._show();
    },
    fetch: function(){
        var data = {};
        for(var field in this._phs){
            var phs = this._phs[field];
            var handlers = phs.handlers;
            var dat;
            for(var i = 0; i < handlers.length; i++){
                if(handlers[i].fetch){
                    dat = handlers[i].fetch();
                    break;
                }else if(handlers[i].fetchable){
                    dat = phs.val;
                    break;
                }
            }
            assemble(data, field, dat);
        }
        return data;
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
    addHandler: function(field, handler){
        if( !this._phs[field] ){
            this._phs[field] = {handlers: []};
        }
        this._phs[field].handlers.push(handler);
    },
    getHandlers: function(field){
        if( !this._phs[field] ){
            this._phs[field] = {handlers: []};
        }
        return this._phs[field].handlers;
    },
    _show: function(){
        var node = this.node;
        if( !node._parent ) return this;
        node._parent.replaceChild(node, node._replace);
        return this;
    },
    _hide: function(){
        var node = this.node;
        // remember its parentNode for append to dom when showing.
        if( !node._parent ) node._parent = node.parentNode;
        if( !node._parent ) return this;
        // create a p elements to hold its position.
        if( !node._replace ) node._replace = document.createElement('p');
        node._parent.replaceChild(node._replace, node);
        return this;
    }
};

function scan(dto, node, phs){
    // only scan text node or element node
    if(node.nodeType !== 1 && node.nodeType !== 3) return;
    for(var i = 0;  i < scanners.length; i++){
        scanners[i].scan(dto, node, phs);
    }
    scanChildren(dto, node, phs);
}

function scanChildren(dto, node, phs){
    // node.childNodes changed by scanText function.
    // fuck IE, we cannnot use the simpliest way below:
    // var children = Array.prototype.slice.call( node.childNodes );
    var childNodes = node.childNodes;
    var length = childNodes.length;
    var children = [];
    var child;
    for(var i = 0; i < length; i++){
        child = childNodes[i];
        var nodeType = child.nodeType;
        if(nodeType === 1 || nodeType === 3){
            children.push(child);
        }
    }
    for(var i = 0; i < length; i++){
        scan(dto, children[i], phs);
    }
}

function convert(field, exp){
    return new Function('v', 'return ' + exp);
}

var container = document.createElement('body');
function parseNode(node){
    if(typeof node === 'string'){
        container.innerHTML = node;
        return container.firstChild;
    }else if(node.jquery){
        return node[0];
    }
    return node;
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

function assemble(data, field, val){
    if(data && field){
        var fs = field.split('.');
        var temp = data;
        for(var i = 0, len = fs.length; i < len - 1; i++){
            if(!fs[i]) continue;
            temp[fs[i]] = temp[fs[i]] || {};
            temp = temp[fs[i]];
        }
        temp[fs[len-1]] = val;
    }
    return data;
}

})();