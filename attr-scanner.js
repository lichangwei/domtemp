/**
 * Scan attributes
 */
(function(dt){

'use strict';

dt.scanner.add({
    scan: scanAttr,
    name: 'attr'
});

function scanAttr(dto, node, phs){
    if(node.nodeType !== 1) return ;
    
    var attrs = node.attributes;
    for(var i = 0, len = attrs.length; i < len; i++){
        var attr = attrs[i];
        var _ori = attr.nodeValue;
        var _phs = [];
        if(typeof _ori !== 'string') continue;
        _ori.replace(dt.opt('regexp'), function(match, has$, field, exp, startIdx){
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
                        var val = this._ori.replace(dt.opt('regexp'), '');
                        setAttribute(node, name, val);
                    },
                    _ori: _ori,
                    _phs: _phs
                };
            if(exp) ph.convert = convert(field, exp);
            _phs.push( ph );
            dto.addHandler(field, handler);
        });
    }
}

var alias = {
    'imgsrc': 'src',
    'styl': 'style'
};

function setAttribute(node, attr, val){
    if(attr === 'class'){
        node.className = val;
    }if((attr === 'style') && dt.util.isIE && val){
        node.style.cssText = val;
    }else{
        node.setAttribute(attr, val);
    }
}

})(dt);
