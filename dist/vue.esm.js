!function(e,t){e&&!e.getElementById("livereloadscript")&&((t=e.createElement("script")).async=1,t.src="//"+(self.location.host||"localhost").split(":")[0]+":35729/livereload.js?snipver=1",t.id="livereloadscript",e.getElementsByTagName("head")[0].appendChild(t))}(self.document);var activeEffect,effectStack=[];function effect(e){function t(){cleanup(t),activeEffect=t,effectStack.push(t),e(),effectStack.pop(),activeEffect=effectStack[effectStack.length-1]}t.options=options,t.deps=[],t()}var data={foo:1},bucket=new WeakMap,obj=new Proxy(data,{get:function(e,t){return track(e,t),e[t]},set:function(e,t,c){e[t]=c,trigger(e,t)}});function track(e,t){if(!activeEffect)return e[t];var c=bucket.get(e),e=(c||bucket.set(e,c=new Map),c.get(t));e||c.set(t,e=new Set),e.add(activeEffect),activeEffect.deps.push(e)}function trigger(e,t){var c,e=bucket.get(e);e&&(e=e.get(t),c=new Set,e&&e.forEach(function(e){e!==activeEffect&&c.add(e)}),c.forEach(function(e){return e()}))}function cleanup(e){for(var t=0;t<e.deps.length;t++)e.deps[t].delete(e);e.deps.length=0}effect(function(){console.log(obj.foo)}),setTimeout(function(){},2e3);
//# sourceMappingURL=vue.esm.js.map
