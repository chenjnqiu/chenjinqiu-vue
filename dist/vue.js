!function(e,t){e&&!e.getElementById("livereloadscript")&&((t=e.createElement("script")).async=1,t.src="//"+(self.location.host||"localhost").split(":")[0]+":35729/livereload.js?snipver=1",t.id="livereloadscript",e.getElementsByTagName("head")[0].appendChild(t))}(self.document),function(e){"function"==typeof define&&define.amd?define(e):e()}(function(){"use strict";var i,n=[];var o,s=new WeakMap,e=new Proxy({foo:1},{get:function(e,t){return function(e,t){if(!i)return e[t];var n=s.get(e);n||s.set(e,n=new Map);e=n.get(t);e||n.set(t,e=new Set);e.add(i),i.deps.push(e)}(e,t),e[t]},set:function(e,t,n){var o;e[t]=n,n=e,e=t,(n=s.get(n))&&(n=n.get(e),o=new Set,n&&n.forEach(function(e){e!==i&&o.add(e)}),o.forEach(function(e){return e()}))}});function c(){for(var e=c,t=0;t<e.deps.length;t++)e.deps[t].delete(e);e.deps.length=0,i=c,n.push(c),o(),n.pop(),i=n[n.length-1]}o=function(){console.log(e.foo)},c.options=options,c.deps=[],c(),setTimeout(function(){},2e3)});
//# sourceMappingURL=vue.js.map
