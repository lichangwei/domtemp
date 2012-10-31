(function(){"use strict";function i(t,n,r){var i,o,u;if(n.nodeType!==1&&n.nodeType!==3)return;i=!0;for(o=0;o<e.length;o++)u=e[o].scan(t,n,r),u===!1&&(i=!1);i&&s(t,n,r)}function s(e,t,n){var r,s,o,u=t.childNodes,a=u.length,f=[];for(s=0;s<a;s++)r=u[s],o=r.nodeType,(o===1||o===3)&&f.push(r);for(s=0;s<a;s++)i(e,f[s],n)}function o(e){return typeof e=="string"?(n.innerHTML=e,n.firstChild):e.jquery?e[0]:e}function u(e,t){var n,r,i;if(!e||!t)return null;n=t.split("."),r=e;for(i=0;r&&i<n.length;i++)n[i]&&(r=r[n[i]]);return r}function a(e,t,n){var r,i,s,o;if(e&&t){r=t.split("."),i=e;for(s=0,o=r.length;s<o-1;s++){if(!r[s])continue;i[r[s]]=i[r[s]]||{},i=i[r[s]]}i[r[o-1]]=n}return e}var e,t,n,r=window.dt=function(e,t){if(!(this instanceof r))return new r(e,t);this.node=o(e),this._opts=t||{},this._phs={},this._subdt={},i(this,this.node,this._phs,this._subdt)};r.scanner={add:function(t,n){if(n===void 0)return e.push(t);e.splice(n,0,t)},remove:function(t){var n;if(typeof t=="number")delete e[t];else if(typeof t=="string")for(n=0;n<e.length;n++)if(e[n].name===t){delete e[n];return}}},r.opt=function(e,n){return n!==void 0&&(t[e]=n),t[e]},r.util={isArray:function(e){var t=Object.prototype.toString;return e&&t.call(e)==="[object Array]"},isIE:navigator.userAgent.indexOf("MSIE")>=0},e=[],t={regexp:/(\$?)\{\{\s*([\w\d\.]+)\s*:?\s*([^}]*)\}\}/ig},r.prototype={fill:function(e){var t,n,r,i,s;this._hide();for(t in this._phs){n=this._phs[t].handlers,r=u(e,t),i=this._opts[t],i!==void 0&&(r=typeof i=="function"?i(r,e):i),this._phs[t].val=r;for(s=0;s<n.length;s++)n[s].fill(r)}return this._show()},append:function(e){return this.fill(e,!0)},clean:function(){var e,t,n;this._hide();for(e in this._phs){this._phs[e].val=void 0,t=this._phs[e].handlers;for(n=0;n<t.length;n++)t[n].clean()}return this._show()},fetch:function(){var e,t,n,r,i,s={},o=void 0;for(e in this._phs){t=this._phs[e],n=t.handlers,r=o;for(i=0;i<n.length;i++){if(n[i].fetch){r=n[i].fetch();break}if(n[i].fetchable){r=t.val;break}}r!==o&&a(s,e,r)}return s},opt:function(e,t){var n;if(typeof e=="string")this._opts[e]=t;else if(e)for(n in e)opt[n]=e[n];return this},addHandler:function(e,t){this._phs[e]||(this._phs[e]={handlers:[]}),this._phs[e].handlers.push(t)},getHandlers:function(e){return this._phs[e]||(this._phs[e]={handlers:[]}),this._phs[e].handlers},_show:function(){var e=this.node;return e._parent?(e._parent.replaceChild(e,e._replace),this):this},_hide:function(){var e=this.node;return e._parent||(e._parent=e.parentNode),e._parent?(e._replace||(e._replace=document.createElement("p")),e._parent.replaceChild(e._replace,e),this):this}},n=document.createElement("body")})()
(function(e){"use strict";function n(n,i,s){var o,u,a,f,l,c;if(i.nodeType!==1)return;o=i.attributes;for(u=0,a=o.length;u<a;u++){f=o[u],l=f.nodeValue,c=[];if(typeof l!="string")continue;l.replace(e.opt("regexp"),function(o,u,a,h){var p={f:a,m:o},d=t[f.nodeName]||f.nodeName,v={fill:function(e){var t=this._ori,n,o;for(var u=0;u<this._phs.length;u++)n=this._phs[u],o=s[n.f].val,n.convert&&(o=n.convert(o)),t=t.replace(n.m,o||"");r(i,d,t)},clean:function(){var t=this._ori.replace(e.opt("regexp"),"");r(i,d,t)},_ori:l,_phs:c};h&&(p.convert=convert(a,h)),c.push(p),n.addHandler(a,v)})}}function r(t,n,r){n==="class"&&(t.className=r),n==="style"&&e.util.isIE&&r?t.style.cssText=r:t.setAttribute(n,r)}var t;e.scanner.add({scan:n,name:"attr"}),t={imgsrc:"src",styl:"style"}})(dt)
(function(e){"use strict";function t(t,s){var o,u,a,f=s.nodeValue,l=e.opt("regexp");if(!f.match(l))return;o=s.parentNode,a=0,f.replace(l,function(l,c,h,p,d){var v,m;(u=f.substring(a,d))&&o.insertBefore(n(u),s),v=n(l),m={fill:function(t){this.convert&&(t=this.convert(t)),t&&t.jquery&&(t=t.get());if(t&&t.nodeType!==1&&!e.util.isArray(t)||!c)t=n(t);i(o,this._now,t),r(this._now),this._now=t},clean:function(){i(o,this._now,this._empty),r(this._now),this._now=this._empty},_ori:v,_now:v,_empty:n("")},p&&(m.convert=convert(h,p)),t.addHandler(h,m),o.insertBefore(v,s),a=d+l.length}),(u=f.substring(a))&&o.insertBefore(n(u),s),o.removeChild(s)}function n(e){return document.createTextNode(""+e)}function r(t){var n,r,i;if(e.util.isArray(t)){n=t[0].parentNode;for(r=0;r<t.length;r++)i.removeChild(t[r])}else t&&(i=t.parentNode,i&&i.removeChild(t))}function i(t,n,r){var i;e.util.isArray(n)&&(n=n[0]);if(e.util.isArray(r))for(i=0;i<r.length;i++)t.insertBefore(r[i],n);else r&&t.insertBefore(r,n)}e.scanner.add({scan:function(e,n,r){if(n.nodeType!==3)return;return t(e,n,r),!1},name:"text"})})(dt)
(function(e){"use strict";function n(e,n){var i,s,o,u,a,f;if(!r(n))return;i=n.name;if(!i)return;s=n.type,o=n.getAttribute("number"),u=e.getHandlers(i);for(f=0;f<u.length;f++)u[f].type===s&&(a=u[f]);a||(a=new(t[s]||t.normal),a.type=s,e.addHandler(i,a)),a.isNum=a.isNum||s==="number"||s==="range"||o!==null,s==="radio"||s==="checkbox"?(a.nodes||(a.nodes=[]),a.nodes.push(n)):a.nodes=n}function r(e){var t;return e.tagName?(t=e.tagName.toLowerCase(),"input textarea select".indexOf(t)!==-1&&"image file button reset submit".indexOf(e.type)===-1):!1}function i(e,t){return t&&(e=parseInt(e)),e!==e?NaN:e}var t;e.scanner.add({scan:n,name:"form"}),t={},t.normal=function(){},t.normal.prototype={fill:function(e){this.nodes.value=e||""},clean:function(){this.nodes.value=""},fetch:function(){return i(this.nodes.value,this.isNum)}},t.radio=function(){},t.radio.prototype={fill:function(e){var t,n=this.nodes,r=n.length,i=""+e;for(t=0;t<r;t++)n[t].checked=!1,n[t].value===i&&(n[t].checked=!0)},clean:function(){var e,t=this.nodes,n=t.length;for(e=0;e<n;e++)t[e].checked=!1},fetch:function(){var e,t=this.nodes,n=t.length;for(e=0;e<n;e++)if(t[e].checked)return i(t[e].value,this.isNum)}},t.checkbox=function(){},t.checkbox.prototype={fill:function(t){var n,r,i=this.nodes,s=i.length;!e.util.isArray(t)&&(t=[t]);for(n=0;n<s;n++){i[n].checked=!1;for(r=0;t&&r<t.length;r++)i[n].value===""+t[r]&&(i[n].checked=!0)}},clean:function(){var e,t=this.nodes,n=t.length;for(e=0;e<n;e++)t[e].checked=!1},fetch:function(){var e,t=this.nodes,n=t.length,r=[];for(e=0;e<n;e++)t[e].checked&&r.push(i(t[e].value,this.isNum));return n===1?r[0]:r}},t["select-multiple"]=function(){},t["select-multiple"].prototype={fill:function(e){var t,n,r=this.nodes.children,i=r.length;for(t=0;t<i;t++){r[t].setAttribute("selected",""),r[t].selected=!1;for(n=0;e&&n<e.length;n++)r[t].value===e[n]&&(r[t].setAttribute("selected","true"),r[t].selected=!0)}},clean:function(){var e,t=this.nodes.children,n=t.length;for(e=0;e<n;e++)t[e].setAttribute("selected",""),t[e].selected=!1},fetch:function(){var e,t=this.nodes.children,n=t.length,r=[];for(e=0;e<n;e++)t[e].selected&&r.push(i(t[e].value,this.isNum));return r}}})(dt)
(function(e){"use strict";function t(t,n){var r;if(!n||n.nodeType!==1)return;r=n.getAttribute("each");if(!r)return;return t.addHandler(r,{fill:function(t){var r,i,s,o;this.clean();if(!t||t.length===0)this.empty&&n.appendChild(this.empty);else for(r=0,i=t.length;r<i;r++)s=this.items[r],s||(o=this.item.cloneNode(!0),e.util.isIE&&(o.innerHTML=this.item.innerHTML),s=this.items[r]=new e(o)),s.fill(t[r]),n.appendChild(s.node)},clean:function(){n.innerHTML=""},item:n.children[0],empty:n.children[1],items:[]}),!1}e.scanner.add({scan:t,name:"loop"})})(dt)