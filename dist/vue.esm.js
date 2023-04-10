!function(e,t){e&&!e.getElementById("livereloadscript")&&((t=e.createElement("script")).async=1,t.src="//"+(self.location.host||"localhost").split(":")[0]+":35729/livereload.js?snipver=1",t.id="livereloadscript",e.getElementsByTagName("head")[0].appendChild(t))}(self.document),Promise.resolve();var activeEffect,effectStack=[];function effect(t){function r(){cleanup(r),activeEffect=r,effectStack.push(r);var e=t();return effectStack.pop(),activeEffect=effectStack[effectStack.length-1],e}var e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{};return r.options=e,r.deps=[],e.lazy||r(),r}function cleanup(e){for(var t=0;t<e.deps.length;t++)e.deps[t].delete(e);e.deps.length=0}function _iterableToArrayLimit(e,t){var r=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null!=r){var n,o,a,i,c=[],l=!0,u=!1;try{if(a=(r=r.call(e)).next,0===t){if(Object(r)!==r)return;l=!1}else for(;!(l=(n=a.call(r)).done)&&(c.push(n.value),c.length!==t);l=!0);}catch(e){u=!0,o=e}finally{try{if(!l&&null!=r.return&&(i=r.return(),Object(i)!==i))return}finally{if(u)throw o}}return c}}function _typeof(e){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function _defineProperty(e,t,r){return(t=_toPropertyKey(t))in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function _readOnlyError(e){throw new TypeError('"'+e+'" is read-only')}function _slicedToArray(e,t){return _arrayWithHoles(e)||_iterableToArrayLimit(e,t)||_unsupportedIterableToArray(e,t)||_nonIterableRest()}function _arrayWithHoles(e){if(Array.isArray(e))return e}function _unsupportedIterableToArray(e,t){var r;if(e)return"string"==typeof e?_arrayLikeToArray(e,t):"Map"===(r="Object"===(r=Object.prototype.toString.call(e).slice(8,-1))&&e.constructor?e.constructor.name:r)||"Set"===r?Array.from(e):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?_arrayLikeToArray(e,t):void 0}function _arrayLikeToArray(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function _createForOfIteratorHelper(e,t){var r,n,o,a,i="undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(i)return n=!(r=!0),{s:function(){i=i.call(e)},n:function(){var e=i.next();return r=e.done,e},e:function(e){n=!0,o=e},f:function(){try{r||null==i.return||i.return()}finally{if(n)throw o}}};if(Array.isArray(e)||(i=_unsupportedIterableToArray(e))||t&&e&&"number"==typeof e.length)return i&&(e=i),a=0,{s:t=function(){},n:function(){return a>=e.length?{done:!0}:{done:!1,value:e[a++]}},e:function(e){throw e},f:t};throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function _toPrimitive(e,t){if("object"!=typeof e||null===e)return e;var r=e[Symbol.toPrimitive];if(void 0===r)return("string"===t?String:Number)(e);r=r.call(e,t||"default");if("object"!=typeof r)return r;throw new TypeError("@@toPrimitive must return a primitive value.")}function _toPropertyKey(e){e=_toPrimitive(e,"string");return"symbol"==typeof e?e:String(e)}var _mutableInstrumentati,toString=Object.prototype.toString,toTypeString=function(e){return toString.call(e)},isMap=function(e){return"[object Map]"===toTypeString(e)},isSet=function(e){return"[object Set]"===toTypeString(e)};function lis(e){var t,r=[],n=_createForOfIteratorHelper(e);try{for(n.s();!(t=n.n()).done;){for(var o=t.value,a=0,i=r.length-1;a<=i;){var c=Math.floor((a+i)/2);r[c]<o?a=c+1:i=c-1}r[a]=o}}catch(e){n.e(e)}finally{n.f()}return r}var reactiveMap=new Map,arrayInstrumentations={},shouldTrack=(["includes","indexOf","lastIndexOf"].forEach(function(e){var o=Array.prototype[e];arrayInstrumentations[e]=function(){for(var e=arguments.length,t=new Array(e),r=0;r<e;r++)t[r]=arguments[r];var n=o.apply(this,t);return n=!1!==n&&-1!==n?n:o.apply(this.raw,t)}}),!0);function iterationMethod(){function r(e){return"object"===_typeof(e)?reactive(e):e}var e=this.raw,n=e[Symbol.iterator]();return track(e,ITERATE_KEY),{next:function(){var e=n.next(),t=e.value,e=e.done;return{value:t&&[r(t[0]),r(t[1])],done:e}}}}function valuesIterationMethod(){var e=this.raw,r=e.values();return track(e,ITERATE_KEY),_defineProperty({next:function(){var e=r.next(),t=e.value,e=e.done;return{value:"object"===_typeof(t=t)?reactive(t):t,done:e}}},Symbol.iterator,function(){return this})}function keysIterationMethod(){var e=this.raw,r=e.keys();return track(e,MAP_KEY_ITERATE_KEY),_defineProperty({next:function(){var e=r.next(),t=e.value,e=e.done;return{value:"object"===_typeof(t=t)?reactive(t):t,done:e}}},Symbol.iterator,function(){return this})}["push","pop","shift","unshift","splice"].forEach(function(e){var o=Array.prototype[e];arrayInstrumentations[e]=function(){shouldTrack=!1;for(var e=arguments.length,t=new Array(e),r=0;r<e;r++)t[r]=arguments[r];var n=o.apply(this,t);return shouldTrack=!0,n}});_defineProperty(_mutableInstrumentati={add:function(e){var t=this.raw,r=t.has(e),n=t.add(e);return r||trigger(t,e,"ADD"),n},delete:function(e){var t=this.raw,r=t.has(e),n=t.delete(e);return r&&trigger(t,e,"DELETE"),n},get:function(e){var t=this.raw,r=t.has(e);if(track(t,e),r)return"object"===_typeof(r=t.get(e))?reactive(r):r},set:function(e,t){var r=this.raw,n=r.has(e),o=r.get(e),a=t.raw||t;r.set(e,a),n?(o!==t||o==o&&t==t)&&trigger(r,e,"SET"):trigger(r,e,"ADD")},forEach:function(r,n){function o(e){return"object"===_typeof(e)?reactive(e):e}var a=this,e=this.raw;track(e,ITERATE_KEY),e.forEach(function(e,t){r.call(n,o(e),o(t),a)})}},Symbol.iterator,iterationMethod),_defineProperty(_mutableInstrumentati,"entries",iterationMethod),_defineProperty(_mutableInstrumentati,"values",valuesIterationMethod),_defineProperty(_mutableInstrumentati,"keys",keysIterationMethod);var mutableInstrumentations=_mutableInstrumentati;function createReactive(e){var n=1<arguments.length&&void 0!==arguments[1]&&arguments[1],c=2<arguments.length&&void 0!==arguments[2]&&arguments[2];return new Proxy(e,{get:function(e,t,r){if("raw"===t)return e;if("size"===t)return track(e,ITERATE_KEY),Reflect.get(e,t,e);if(isMap(e)||isSet(e))return mutableInstrumentations[t];if(Array.isArray(e)&&arrayInstrumentations.hasOwnProperty(t))return Reflect.get(arrayInstrumentations,t,r);c||"symbol"===_typeof(t)||track(e,t);e=Reflect.get(e,t,r);return!n&&"object"===_typeof(e)&&null!==e?(c?readonly:reactive)(e):e},has:function(e,t){return track(e,t),Reflect.has(e,t)},ownKeys:function(e){return track(e,Array.isArray(e)?"length":ITERATE_KEY),Reflect.ownKeys(e)},set:function(e,t,r,n){var o,a,i;return c?(console.warn("属性 ".concat(t," 是只读的")),!0):(o=e[t],a=Array.isArray(e)?Number(t)<e.length?"SET":"ADD":Object.prototype.hasOwnProperty.call(e,t)?"SET":"ADD",i=Reflect.set(e,t,r,n),e!==n.raw||o===r||o!=o&&r!=r||trigger(e,t,a,r),i)},deleteProperty:function(e,t){var r,n;return c?(console.warn("属性 ".concat(t," 是只读的")),!0):(r=Object.prototype.hasOwnProperty.call(e,t),(n=Reflect.deleteProperty(e,t))&&r&&trigger(e,t,"DELETE"),n)}})}function reactive(e){var t=reactiveMap.get(e);return t||(t=createReactive(e),reactiveMap.set(e,t),t)}function shallowReactive(e){return createReactive(e,!0,!0)}function readonly(e){return createReactive(e,!1,!0)}var bucket=new WeakMap,ITERATE_KEY=Symbol(),MAP_KEY_ITERATE_KEY=Symbol();function track(e,t){if(!activeEffect||!shouldTrack)return e[t];var r=bucket.get(e),e=(r||bucket.set(e,r=new Map),r.get(t));e||r.set(t,e=new Set),e.add(activeEffect),activeEffect.deps.push(e)}function trigger(e,t,r,n){var o,a,i=bucket.get(e);i&&(a=i.get(t),o=new Set,a&&a.forEach(function(e){e!==activeEffect&&o.add(e)}),"ADD"===r&&Array.isArray(e)&&(a=i.get("length"))&&a.forEach(function(e){e!==activeEffect&&o.add(e)}),Array.isArray(e)&&"length"===t&&i.forEach(function(e,t){n<=t&&e.forEach(function(e){e!==activeEffect&&o.add(e)})}),("ADD"===r||"DELETE"===r||"SET"===r&&isMap(e))&&((a=i.get(ITERATE_KEY))&&a.forEach(function(e){e!==activeEffect&&o.add(e)}),t=i.get(MAP_KEY_ITERATE_KEY))&&t.forEach(function(e){e!==activeEffect&&o.add(e)}),o.forEach(function(e){e.options.scheduler?e.options.scheduler(e):e()}))}var Text=Symbol(),Comment=Symbol(),Fragment=Symbol();function createElement(e){return document.createElement(e)}function setElementText(e,t){e.textContent=t}function insert(e,t){var r=2<arguments.length&&void 0!==arguments[2]?arguments[2]:null;(t="root"===t.type?document.getElementById("app"):t).insertBefore(e,r)}function createText(e){return document.createTextNode(e)}function setText(e,t){e.nodeValue=t}function createComment(e){return document.createComment(e)}function shouldSetAsProps(e,t,r){return("form"!==t||"INPUT"!==e.tagName)&&t in e}function patchProps(e,t,r,n){var o,a;/^on/.test(t)?(o=(e._vei||(e._vei={}))[t],a=t.slice(2).toLowerCase(),n?o?o.value=n:((o=e._vei[t]=function(t){t.timeStamp<o.attached||(Array.isArray(o.value)?o.value.forEach(function(e){return e(t)}):o.value(t))}).value=n,o.attached=performance.now(),e.addEventListener(a,o)):o&&e.removeEventListener(a,o),e.addEventListener(a,n)):"class"===t?e.className=n||"":shouldSetAsProps(e,t)?(a=_typeof(e[t]),e[t]="boolean"===a&&""===n||n):e.setAttribute(t,n)}var queue=new Set,isFlushing=!1,p=Promise.resolve();function queueJob(e){queue.add(e),isFlushing||(isFlushing=!0,p.then(function(){try{queue.forEach(function(e){return e()})}finally{isFlushing=!1,queue.clear=0}}))}var currentInstance=null;function setCurrentInstance(e){currentInstance=e}function resolveProps(e,t){var r,n={},o={};for(r in t)r in e||r.startsWith("on")?n[r]=t[r]:o[r]=t[r];return[n,o]}function hasPropsChanged(e,t){var r=Object.keys(t);if(r.length!==Object.keys(e).length)return!0;for(var n=0;n<r.length;n++){var o=r[n];if(t[o]!==e[o])return!0}return!1}function createRenderer(e){var g=e.createElement,M=e.setElementText,R=e.insert,A=e.patchProps,_=e.createText,T=e.setText,I=e.createComment;function j(e){var t;e.type===Fragment?e.children.forEach(j):"object"===_typeof(e.type)?e.shouldKeepAlive?e.keepAliveInstance._deActivate(e):j(e.component.subTree):(t=e.el.parentNode)&&t.removeChild(e.el)}function w(e,t,r){var n="function"==typeof e.type,o=e.type,n=o=n?{render:e.type,props:e.type.props}:o,a=n.render,o=n.data,i=n.setup,c=n.props,l=n.beforeCreate,u=n.created,s=n.beforeMount,f=n.mounted,p=n.beforeUpdate,y=n.updated,n=(l&&l(),o?reactive(o()):null),l=_slicedToArray(resolveProps(c,e.props),2),o=l[0],c=l[1],l=e.children||{},d={state:n,props:shallowReactive(o),isMounted:!1,subTree:null,slots:l,mounted:[],keepAliveCtx:null};e.type.__isKeepAlive&&(d.keepAliveCtx={move:function(e,t,r){R(e.component.subTree.el,t,r)},createElement:g}),setCurrentInstance(d);var n={attrs:c,emit:function(e){var t="on".concat(e[0].toUpperCase()+e.slice(1));if(t=d.props[t]){for(var r=arguments.length,n=new Array(1<r?r-1:0),o=1;o<r;o++)n[o-1]=arguments[o];t.apply(void 0,n)}else console.error("事件不存在")},slots:l,onMounted:function(e){currentInstance?currentInstance.mounted.push(e):console.error("onMounted 函数只能在 setup 中调用")}},o=i(shallowReadonly(d.props),n),v=(setCurrentInstance(null),null),h=("function"==typeof o?(a&&console.error("setup 函数返回渲染函数，render 选项将被忽略"),_readOnlyError("render")):v=o,e.component=d,new Proxy(d,{get:function(e,t,r){var n=e.state,o=e.props,e=e.slots;return"$slots"===t?e:n&&t in n?n[t]:t in o?o[t]:v&&t in v?v[t]:void console.error("不存在")},set:function(e,t,r,n){var o=e.state,e=e.props;o&&t in o?o[t]=r:t in e?console.warn('Attempting to mutate prop "'.concat(t,'". Propsare readonly.')):v&&t in v?v[t]=r:console.error("不存在")}}));u&&u.call(h),effect(function(){var e=a.call(h,h);d.isMounted?(p&&p.call(h),C(d.subTree,e,t,r),y&&y.call(h)):(s&&s.call(h),C(null,e,t,r),d.isMounted=!0,f&&f.call(h),d.mounted&&d.mounted.forEach(function(e){return e.call(h)})),d.subTree=e},{scheduler:queueJob})}function S(e,t,r){if("string"==typeof t.children)Array.isArray(e.children)&&e.children.forEach(j),M(r,t.children);else if(Array.isArray(t.children))if(Array.isArray(e.children)){for(var n=e,o=t,a=r,i=n.children,c=o.children,l=0,u=i[l],s=c[l];u.key===s.key;)C(u,s,a),u=i[++l],s=c[l];var f=i.length-1,p=c.length-1;for(u=i[f],s=c[p];u.key===s.key;)C(u,s,a),u=i[--f],s=c[--p];if(f<l&&l<=p)for(var y=(n=p+1)<c.length?c[n].el:null;l<=p;)C(null,c[l++],a,y);else if(p<l&&l<=f)for(;l<=f;)j(i[l++]);else{for(var d=p-l+1,v=new Array(d),o=(v.fill(-1),l),h=l,m=!1,E=0,b={},g=h;g<=p;g++)b[c[g].key]=g;for(var A=0,_=o;_<=f;_++){var T,u=i[_];A<=d&&void 0!==(T=b[u.key])?(C(u,s=c[T],a),A++,v[T-h]=_,T<E?m=!0:E=T):j(u)}if(m)for(var I,w,S,k=lis(v),P=k.length-1,x=d-1;0<=x;x--)-1===v[x]?C(null,c[I=x+h],a,(I=I+1)<c.length?c[I].el:null):x!==k[P]?(w=c[I=x+h],S=(S=I+1)<c.length?c[S].el:null,R(w.el,a,S)):P--}}else M(r,""),t.children.forEach(function(e){return C(null,e,r)});else Array.isArray(e.children)?e.children.forEach(j):"string"==typeof e.children&&M(r,"")}function C(e,t,r,n){e&&e.type!==t.type&&(j(e),e=null);var o=t.type;if("string"==typeof o)if(e){var a,i,c=e,l=t,u=l.el=c.el,s=c.props,f=l.props;for(a in f)f[a]!==s[a]&&A(u,a,s[a],f[a]);for(i in s)i in f||A(u,i,s[i],null);S(c,l,u)}else{var p=t,c=r,l=n,y=p.el=g(p.type);if("string"==typeof p.children?M(y,p.children):Array.isArray(p.children)&&p.children.forEach(function(e){C(null,e,y)}),p.props)for(var d in p.props)A(y,d,null,p.props[d]);R(y,c,l)}else if(o===Text)e?(v=t.el=e.el,t.children!==e.children&&T(v,t.children)):(v=t.el=_(t.children),R(v,r));else if(o===Comment)e?(v=t.el=e.el,t.children!==e.children&&T(v,t.children)):(v=t.el=I(t.children),R(v,r));else if(o===Fragment)e?S(e,t,r):t.children.forEach(function(e){return C(null,e,r)});else if("object"===_typeof(o)&&o.__isTeleport)o.process(e,t,r,n,{patch:C,patchChildren:S,unmount:j,move:function(e,t,r){R((e.component?e.component.subTree:e).el,t,r)}});else if("object"===_typeof(o)||"function"==typeof o)if(e){var v=e,o=t,h=(o.component=v.component).props;if(hasPropsChanged(v.props,o.props)){var m,E,b=_slicedToArray(resolveProps(o.type.props,o.props),1)[0];for(m in b)h[m]=b[m];for(E in h)E in b||delete h[E]}}else t.keptAlive&&t.keepAliveInstance._activate(t,r,n),w(t,r,n)}return{render:function(e,t){e?C(t._vnode,e,t):t._vnode&&j(t._vnode),t._vnode=e},hydrate:function(e,t){}}}var renderer=createRenderer({createElement:createElement,setElementText:setElementText,insert:insert,patchProps:patchProps,createText:createText,setText:setText,createComment:createComment}),vnode={type:"Teleport",props:{title:"A big Title"},children:[{type:"h1",children:"Title"},{type:"p",children:"content"}]};renderer.render(vnode,document.querySelector("#app"));
//# sourceMappingURL=vue.esm.js.map
