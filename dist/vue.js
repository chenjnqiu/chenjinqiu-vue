!function(e,r){e&&!e.getElementById("livereloadscript")&&((r=e.createElement("script")).async=1,r.src="//"+(self.location.host||"localhost").split(":")[0]+":35729/livereload.js?snipver=1",r.id="livereloadscript",e.getElementsByTagName("head")[0].appendChild(r))}(self.document),function(e){"function"==typeof define&&define.amd?define(e):e()}(function(){"use strict";var l;function p(e){return(p="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function r(e,r,t){return(r=function(e){e=function(e,r){if("object"!=typeof e||null===e)return e;var t=e[Symbol.toPrimitive];if(void 0===t)return("string"===r?String:Number)(e);t=t.call(e,r||"default");if("object"!=typeof t)return t;throw new TypeError("@@toPrimitive must return a primitive value.")}(e,"string");return"symbol"==typeof e?e:String(e)}(r))in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function c(e,r){(null==r||r>e.length)&&(r=e.length);for(var t=0,n=new Array(r);t<r;t++)n[t]=e[t];return n}function k(e,r){var t,n,o,i,a="undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(a)return n=!(t=!0),{s:function(){a=a.call(e)},n:function(){var e=a.next();return t=e.done,e},e:function(e){n=!0,o=e},f:function(){try{t||null==a.return||a.return()}finally{if(n)throw o}}};if(Array.isArray(e)||(a=function(e,r){var t;if(e)return"string"==typeof e?c(e,r):"Map"===(t="Object"===(t=Object.prototype.toString.call(e).slice(8,-1))&&e.constructor?e.constructor.name:t)||"Set"===t?Array.from(e):"Arguments"===t||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?c(e,r):void 0}(e))||r&&e&&"number"==typeof e.length)return a&&(e=a),i=0,{s:r=function(){},n:function(){return i>=e.length?{done:!0}:{done:!1,value:e[i++]}},e:function(e){throw e},f:r};throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}Promise.resolve();var t=Object.prototype.toString,n=function(e){return t.call(e)},u=function(e){return"[object Map]"===n(e)},o=function(e){return"[object Set]"===n(e)};var i=new Map,a={};function e(){function t(e){return"object"===p(e)?s(e):e}var e=this.raw,n=e[Symbol.iterator]();return e[h],{next:function(){var e=n.next(),r=e.value,e=e.done;return{value:r&&[t(r[0]),t(r[1])],done:e}}}}["includes","indexOf","lastIndexOf"].forEach(function(e){var o=Array.prototype[e];a[e]=function(){for(var e=arguments.length,r=new Array(e),t=0;t<e;t++)r[t]=arguments[t];var n=o.apply(this,r);return n=!1!==n&&-1!==n?n:o.apply(this.raw,r)}}),["push","pop","shift","unshift","splice"].forEach(function(e){var n=Array.prototype[e];a[e]=function(){for(var e=arguments.length,r=new Array(e),t=0;t<e;t++)r[t]=arguments[t];return n.apply(this,r)}});r(A={add:function(e){var r=this.raw,t=r.has(e),n=r.add(e);return t||m(r,e,"ADD"),n},delete:function(e){var r=this.raw,t=r.has(e),n=r.delete(e);return t&&m(r,e,"DELETE"),n},get:function(e){var r=this.raw,t=r.has(e);if(r[e],t)return"object"===p(t=r.get(e))?s(t):t},set:function(e,r){var t=this.raw,n=t.has(e),o=t.get(e),i=r.raw||r;t.set(e,i),n?(o!==r||o==o&&r==r)&&m(t,e,"SET"):m(t,e,"ADD")},forEach:function(t,n){function o(e){return"object"===p(e)?s(e):e}var i=this,e=this.raw;e[h],e.forEach(function(e,r){t.call(n,o(e),o(r),i)})}},Symbol.iterator,e),r(A,"entries",e),r(A,"values",function(){var e=this.raw,t=e.values();return e[h],r({next:function(){var e=t.next(),r=e.value,e=e.done;return{value:"object"===p(r=r)?s(r):r,done:e}}},Symbol.iterator,function(){return this})}),r(A,"keys",function(){var e=this.raw,t=e.keys();return e[v],r({next:function(){var e=t.next(),r=e.value,e=e.done;return{value:"object"===p(r=r)?s(r):r,done:e}}},Symbol.iterator,function(){return this})});var f=A;function y(e,r,t){var n=1<arguments.length&&void 0!==r&&r,l=2<arguments.length&&void 0!==t&&t;return new Proxy(e,{get:function(e,r,t){if("raw"===r)return e;if("size"===r)return e[h],Reflect.get(e,r,e);if(u(e)||o(e))return f[r];if(Array.isArray(e)&&a.hasOwnProperty(r))return Reflect.get(a,r,t);l||"symbol"===p(r)||e[r];e=Reflect.get(e,r,t);return!n&&"object"===p(e)&&null!==e?l?y(e,!1,!0):s(e):e},has:function(e,r){return e[r],Reflect.has(e,r)},ownKeys:function(e){return e[Array.isArray(e)?"length":h],Reflect.ownKeys(e)},set:function(e,r,t,n){var o,i,a;return l?(console.warn("属性 ".concat(r," 是只读的")),!0):(o=e[r],i=Array.isArray(e)?Number(r)<e.length?"SET":"ADD":Object.prototype.hasOwnProperty.call(e,r)?"SET":"ADD",a=Reflect.set(e,r,t,n),e!==n.raw||o===t||o!=o&&t!=t||m(e,r,i,t),a)},deleteProperty:function(e,r){var t,n;return l?(console.warn("属性 ".concat(r," 是只读的")),!0):(t=Object.prototype.hasOwnProperty.call(e,r),(n=Reflect.deleteProperty(e,r))&&t&&m(e,r,"DELETE"),n)}})}function s(e){var r=i.get(e);return r||(r=y(e),i.set(e,r),r)}var d=new WeakMap,h=Symbol(),v=Symbol();function m(e,r,t,n){var o,i,a=d.get(e);a&&(i=a.get(r),o=new Set,i&&i.forEach(function(e){e!==l&&o.add(e)}),"ADD"===t&&Array.isArray(e)&&(i=a.get("length"))&&i.forEach(function(e){e!==l&&o.add(e)}),Array.isArray(e)&&"length"===r&&a.forEach(function(e,r){n<=r&&e.forEach(function(e){e!==l&&o.add(e)})}),("ADD"===t||"DELETE"===t||"SET"===t&&u(e))&&((i=a.get(h))&&i.forEach(function(e){e!==l&&o.add(e)}),r=a.get(v))&&r.forEach(function(e){e!==l&&o.add(e)}),o.forEach(function(e){e.options.scheduler?e.options.scheduler(e):e()}))}var g=Symbol(),b=Symbol(),E=Symbol();w=(A={createElement:function(e){return document.createElement(e)},setElementText:function(e,r){e.textContent=r},insert:function(e,r){var t=2<arguments.length&&void 0!==arguments[2]?arguments[2]:null;(r="root"===r.type?document.getElementById("app"):r).insertBefore(e,t)},patchProps:function(e,r,t,n){var o,i,a;/^on/.test(r)?(o=(e._vei||(e._vei={}))[r],i=r.slice(2).toLowerCase(),n?o?o.value=n:((o=e._vei[r]=function(r){r.timeStamp<o.attached||(Array.isArray(o.value)?o.value.forEach(function(e){return e(r)}):o.value(r))}).value=n,o.attached=performance.now(),e.addEventListener(i,o)):o&&e.removeEventListener(i,o),e.addEventListener(i,n)):"class"===r?e.className=n||"":(i=e,("form"!==(a=r)||"INPUT"!==i.tagName)&&a in i?(a=p(e[r]),e[r]="boolean"===a&&""===n||n):e.setAttribute(r,n))},createText:function(e){return document.createTextNode(e)},setText:function(e,r){e.nodeValue=r},createComment:function(e){return document.createComment(e)}}).createElement,S=A.setElementText,D=A.insert,T=A.patchProps,j=A.createText,x=A.setText,P=A.createComment;var A,w,S,D,T,j,x,P,O={render:function(e,r){e?L(r._vnode,e,r):r._vnode&&C(r._vnode),r._vnode=e},hydrate:function(e,r){}};function C(e){var r;e.type===E?e.children.forEach(C):(r=e.el.parentNode)&&r.removeChild(e.el)}function N(e,r,t){for(var n=e.children,o=r.children,i=0,a=n[i],l=o[i];a.key===l.key;)L(a,l,t),a=n[++i],l=o[i];var c=n.length-1,u=o.length-1;for(a=n[c],l=o[u];a.key===l.key;)L(a,l,t),a=n[--c],l=o[--u];if(c<i&&i<=u)for(var e=u+1,f=e<o.length?o[e].el:null;i<=u;)L(null,o[i++],t,f);else if(u<i&&i<=c)for(;i<=c;)C(n[i++]);else{for(var y=u-i+1,s=new Array(y),r=(s.fill(-1),i),d=i,h=!1,p=0,v={},m=d;m<=u;m++)v[o[m].key]=m;for(var g=0,b=r;b<=c;b++){var E,a=n[b];g<=y&&void 0!==(E=v[a.key])?(L(a,l=o[E],t),g++,s[E-d]=b,E<p?h=!0:p=E):C(a)}if(h)for(var A,w,S,T=function(e){var r,t=[],n=k(e);try{for(n.s();!(r=n.n()).done;){for(var o=r.value,i=0,a=t.length-1;i<=a;){var l=Math.floor((i+a)/2);t[l]<o?i=l+1:a=l-1}t[i]=o}}catch(e){n.e(e)}finally{n.f()}return t}(s),j=T.length-1,x=y-1;0<=x;x--)-1===s[x]?L(null,o[A=x+d],t,(A=A+1)<o.length?o[A].el:null):x!==T[j]?(w=o[A=x+d],S=(S=A+1)<o.length?o[S].el:null,D(w.el,t,S)):j--}}function I(e,r,t){"string"==typeof r.children?(Array.isArray(e.children)&&e.children.forEach(C),S(t,r.children)):Array.isArray(r.children)?Array.isArray(e.children)?N(e,r,t):(S(t,""),r.children.forEach(function(e){return L(null,e,t)})):Array.isArray(e.children)?e.children.forEach(C):"string"==typeof e.children&&S(t,"")}function L(e,r,t,n){e&&e.type!==r.type&&(C(e),e=null);var o=r.type;if("string"==typeof o)if(e){var i,a,l=e,c=r,u=c.el=l.el,f=l.props,y=c.props;for(i in y)y[i]!==f[i]&&T(u,i,f[i],y[i]);for(a in f)a in y||T(u,a,f[a],null);I(l,c,u)}else{var s=r,l=t,c=n,d=s.el=w(s.type);if("string"==typeof s.children?S(d,s.children):Array.isArray(s.children)&&s.children.forEach(function(e){L(null,e,d)}),s.props)for(var h in s.props)T(d,h,null,s.props[h]);D(d,l,c)}else o===g?e?(n=r.el=e.el,r.children!==e.children&&x(n,r.children)):(n=r.el=j(r.children),D(n,t)):o===b?e?(n=r.el=e.el,r.children!==e.children&&x(n,r.children)):(n=r.el=P(r.children),D(n,t)):o===E?e?I(e,r,t):r.children.forEach(function(e){return L(null,e,t)}):p(o)}var R={type:"div",children:[{type:"p",children:"4",key:4},{type:"p",children:"2",key:2},{type:"p",children:"1",key:1},{type:"p",children:"world",key:3}]};O.render({type:"div",children:[{type:"p",children:"1",key:1},{type:"p",children:"2",key:2},{type:"p",children:"hello",key:3}]},document.querySelector("#app")),setTimeout(function(){O.render(R,document.querySelector("#app"))},1e3)});
//# sourceMappingURL=vue.js.map
