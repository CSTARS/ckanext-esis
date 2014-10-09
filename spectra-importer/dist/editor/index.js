/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
// @version: 0.4.2

window.Platform=window.Platform||{},window.logFlags=window.logFlags||{},function(a){var b=a.flags||{};location.search.slice(1).split("&").forEach(function(a){a=a.split("="),a[0]&&(b[a[0]]=a[1]||!0)});var c=document.currentScript||document.querySelector('script[src*="platform.js"]');if(c)for(var d,e=c.attributes,f=0;f<e.length;f++)d=e[f],"src"!==d.name&&(b[d.name]=d.value||!0);b.log&&b.log.split(",").forEach(function(a){window.logFlags[a]=!0}),b.shadow=b.shadow||b.shadowdom||b.polyfill,b.shadow="native"===b.shadow?!1:b.shadow||!HTMLElement.prototype.createShadowRoot,b.shadow&&document.querySelectorAll("script").length>1&&console.log("Warning: platform.js is not the first script on the page. See http://www.polymer-project.org/docs/start/platform.html#setup for details."),b.register&&(window.CustomElements=window.CustomElements||{flags:{}},window.CustomElements.flags.register=b.register),b.imports&&(window.HTMLImports=window.HTMLImports||{flags:{}},window.HTMLImports.flags.imports=b.imports),a.flags=b}(Platform),"undefined"==typeof WeakMap&&!function(){var a=Object.defineProperty,b=Date.now()%1e9,c=function(){this.name="__st"+(1e9*Math.random()>>>0)+(b++ +"__")};c.prototype={set:function(b,c){var d=b[this.name];return d&&d[0]===b?d[1]=c:a(b,this.name,{value:[b,c],writable:!0}),this},get:function(a){var b;return(b=a[this.name])&&b[0]===a?b[1]:void 0},"delete":function(a){var b=a[this.name];if(!b)return!1;var c=b[0]===a;return b[0]=b[1]=void 0,c},has:function(a){var b=a[this.name];return b?b[0]===a:!1}},window.WeakMap=c}(),Platform.flags.shadow?(!function(a){"use strict";function b(){function a(a){b=a}if("function"!=typeof Object.observe||"function"!=typeof Array.observe)return!1;var b=[],c={},d=[];return Object.observe(c,a),Array.observe(d,a),c.id=1,c.id=2,delete c.id,d.push(1,2),d.length=0,Object.deliverChangeRecords(a),5!==b.length?!1:"add"!=b[0].type||"update"!=b[1].type||"delete"!=b[2].type||"splice"!=b[3].type||"splice"!=b[4].type?!1:(Object.unobserve(c,a),Array.unobserve(d,a),!0)}function c(){if("undefined"!=typeof chrome&&chrome.app&&chrome.app.runtime)return!1;if("undefined"!=typeof navigator&&navigator.getDeviceStorage)return!1;try{var a=new Function("","return true;");return a()}catch(b){return!1}}function d(a){return+a===a>>>0&&""!==a}function e(a){return+a}function f(a){return a===Object(a)}function g(a,b){return a===b?0!==a||1/a===1/b:R(a)&&R(b)?!0:a!==a&&b!==b}function h(a){if(void 0===a)return"eof";var b=a.charCodeAt(0);switch(b){case 91:case 93:case 46:case 34:case 39:case 48:return a;case 95:case 36:return"ident";case 32:case 9:case 10:case 13:case 160:case 65279:case 8232:case 8233:return"ws"}return b>=97&&122>=b||b>=65&&90>=b?"ident":b>=49&&57>=b?"number":"else"}function i(){}function j(a){function b(){if(!(m>=a.length)){var b=a[m+1];return"inSingleQuote"==n&&"'"==b||"inDoubleQuote"==n&&'"'==b?(m++,d=b,o.append(),!0):void 0}}for(var c,d,e,f,g,j,k,l=[],m=-1,n="beforePath",o={push:function(){void 0!==e&&(l.push(e),e=void 0)},append:function(){void 0===e?e=d:e+=d}};n;)if(m++,c=a[m],"\\"!=c||!b(n)){if(f=h(c),k=W[n],g=k[f]||k["else"]||"error","error"==g)return;if(n=g[0],j=o[g[1]]||i,d=void 0===g[2]?c:g[2],j(),"afterPath"===n)return l}}function k(a){return V.test(a)}function l(a,b){if(b!==X)throw Error("Use Path.get to retrieve path objects");for(var c=0;c<a.length;c++)this.push(String(a[c]));Q&&this.length&&(this.getValueFrom=this.compiledGetValueFromFn())}function m(a){if(a instanceof l)return a;if((null==a||0==a.length)&&(a=""),"string"!=typeof a){if(d(a.length))return new l(a,X);a=String(a)}var b=Y[a];if(b)return b;var c=j(a);if(!c)return Z;var b=new l(c,X);return Y[a]=b,b}function n(a){return d(a)?"["+a+"]":'["'+a.replace(/"/g,'\\"')+'"]'}function o(b){for(var c=0;_>c&&b.check_();)c++;return O&&(a.dirtyCheckCycleCount=c),c>0}function p(a){for(var b in a)return!1;return!0}function q(a){return p(a.added)&&p(a.removed)&&p(a.changed)}function r(a,b){var c={},d={},e={};for(var f in b){var g=a[f];(void 0===g||g!==b[f])&&(f in a?g!==b[f]&&(e[f]=g):d[f]=void 0)}for(var f in a)f in b||(c[f]=a[f]);return Array.isArray(a)&&a.length!==b.length&&(e.length=a.length),{added:c,removed:d,changed:e}}function s(){if(!ab.length)return!1;for(var a=0;a<ab.length;a++)ab[a]();return ab.length=0,!0}function t(){function a(a){b&&b.state_===fb&&!d&&b.check_(a)}var b,c,d=!1,e=!0;return{open:function(c){if(b)throw Error("ObservedObject in use");e||Object.deliverChangeRecords(a),b=c,e=!1},observe:function(b,d){c=b,d?Array.observe(c,a):Object.observe(c,a)},deliver:function(b){d=b,Object.deliverChangeRecords(a),d=!1},close:function(){b=void 0,Object.unobserve(c,a),cb.push(this)}}}function u(a,b,c){var d=cb.pop()||t();return d.open(a),d.observe(b,c),d}function v(){function a(b,f){b&&(b===d&&(e[f]=!0),h.indexOf(b)<0&&(h.push(b),Object.observe(b,c)),a(Object.getPrototypeOf(b),f))}function b(a){for(var b=0;b<a.length;b++){var c=a[b];if(c.object!==d||e[c.name]||"setPrototype"===c.type)return!1}return!0}function c(c){if(!b(c)){for(var d,e=0;e<g.length;e++)d=g[e],d.state_==fb&&d.iterateObjects_(a);for(var e=0;e<g.length;e++)d=g[e],d.state_==fb&&d.check_()}}var d,e,f=0,g=[],h=[],i={object:void 0,objects:h,open:function(b,c){d||(d=c,e={}),g.push(b),f++,b.iterateObjects_(a)},close:function(){if(f--,!(f>0)){for(var a=0;a<h.length;a++)Object.unobserve(h[a],c),x.unobservedCount++;g.length=0,h.length=0,d=void 0,e=void 0,db.push(this)}}};return i}function w(a,b){return $&&$.object===b||($=db.pop()||v(),$.object=b),$.open(a,b),$}function x(){this.state_=eb,this.callback_=void 0,this.target_=void 0,this.directObserver_=void 0,this.value_=void 0,this.id_=ib++}function y(a){x._allObserversCount++,kb&&jb.push(a)}function z(){x._allObserversCount--}function A(a){x.call(this),this.value_=a,this.oldObject_=void 0}function B(a){if(!Array.isArray(a))throw Error("Provided object is not an Array");A.call(this,a)}function C(a,b){x.call(this),this.object_=a,this.path_=m(b),this.directObserver_=void 0}function D(a){x.call(this),this.reportChangesOnOpen_=a,this.value_=[],this.directObserver_=void 0,this.observed_=[]}function E(a){return a}function F(a,b,c,d){this.callback_=void 0,this.target_=void 0,this.value_=void 0,this.observable_=a,this.getValueFn_=b||E,this.setValueFn_=c||E,this.dontPassThroughSet_=d}function G(a,b,c){for(var d={},e={},f=0;f<b.length;f++){var g=b[f];nb[g.type]?(g.name in c||(c[g.name]=g.oldValue),"update"!=g.type&&("add"!=g.type?g.name in d?(delete d[g.name],delete c[g.name]):e[g.name]=!0:g.name in e?delete e[g.name]:d[g.name]=!0)):(console.error("Unknown changeRecord type: "+g.type),console.error(g))}for(var h in d)d[h]=a[h];for(var h in e)e[h]=void 0;var i={};for(var h in c)if(!(h in d||h in e)){var j=a[h];c[h]!==j&&(i[h]=j)}return{added:d,removed:e,changed:i}}function H(a,b,c){return{index:a,removed:b,addedCount:c}}function I(){}function J(a,b,c,d,e,f){return sb.calcSplices(a,b,c,d,e,f)}function K(a,b,c,d){return c>b||a>d?-1:b==c||d==a?0:c>a?d>b?b-c:d-c:b>d?d-a:b-a}function L(a,b,c,d){for(var e=H(b,c,d),f=!1,g=0,h=0;h<a.length;h++){var i=a[h];if(i.index+=g,!f){var j=K(e.index,e.index+e.removed.length,i.index,i.index+i.addedCount);if(j>=0){a.splice(h,1),h--,g-=i.addedCount-i.removed.length,e.addedCount+=i.addedCount-j;var k=e.removed.length+i.removed.length-j;if(e.addedCount||k){var c=i.removed;if(e.index<i.index){var l=e.removed.slice(0,i.index-e.index);Array.prototype.push.apply(l,c),c=l}if(e.index+e.removed.length>i.index+i.addedCount){var m=e.removed.slice(i.index+i.addedCount-e.index);Array.prototype.push.apply(c,m)}e.removed=c,i.index<e.index&&(e.index=i.index)}else f=!0}else if(e.index<i.index){f=!0,a.splice(h,0,e),h++;var n=e.addedCount-e.removed.length;i.index+=n,g+=n}}}f||a.push(e)}function M(a,b){for(var c=[],f=0;f<b.length;f++){var g=b[f];switch(g.type){case"splice":L(c,g.index,g.removed.slice(),g.addedCount);break;case"add":case"update":case"delete":if(!d(g.name))continue;var h=e(g.name);if(0>h)continue;L(c,h,[g.oldValue],1);break;default:console.error("Unexpected record type: "+JSON.stringify(g))}}return c}function N(a,b){var c=[];return M(a,b).forEach(function(b){return 1==b.addedCount&&1==b.removed.length?void(b.removed[0]!==a[b.index]&&c.push(b)):void(c=c.concat(J(a,b.index,b.index+b.addedCount,b.removed,0,b.removed.length)))}),c}var O=a.testingExposeCycleCount,P=b(),Q=c(),R=a.Number.isNaN||function(b){return"number"==typeof b&&a.isNaN(b)},S="__proto__"in{}?function(a){return a}:function(a){var b=a.__proto__;if(!b)return a;var c=Object.create(b);return Object.getOwnPropertyNames(a).forEach(function(b){Object.defineProperty(c,b,Object.getOwnPropertyDescriptor(a,b))}),c},T="[$_a-zA-Z]",U="[$_a-zA-Z0-9]",V=new RegExp("^"+T+"+"+U+"*$"),W={beforePath:{ws:["beforePath"],ident:["inIdent","append"],"[":["beforeElement"],eof:["afterPath"]},inPath:{ws:["inPath"],".":["beforeIdent"],"[":["beforeElement"],eof:["afterPath"]},beforeIdent:{ws:["beforeIdent"],ident:["inIdent","append"]},inIdent:{ident:["inIdent","append"],0:["inIdent","append"],number:["inIdent","append"],ws:["inPath","push"],".":["beforeIdent","push"],"[":["beforeElement","push"],eof:["afterPath","push"]},beforeElement:{ws:["beforeElement"],0:["afterZero","append"],number:["inIndex","append"],"'":["inSingleQuote","append",""],'"':["inDoubleQuote","append",""]},afterZero:{ws:["afterElement","push"],"]":["inPath","push"]},inIndex:{0:["inIndex","append"],number:["inIndex","append"],ws:["afterElement"],"]":["inPath","push"]},inSingleQuote:{"'":["afterElement"],eof:["error"],"else":["inSingleQuote","append"]},inDoubleQuote:{'"':["afterElement"],eof:["error"],"else":["inDoubleQuote","append"]},afterElement:{ws:["afterElement"],"]":["inPath","push"]}},X={},Y={};l.get=m,l.prototype=S({__proto__:[],valid:!0,toString:function(){for(var a="",b=0;b<this.length;b++){var c=this[b];a+=k(c)?b?"."+c:c:n(c)}return a},getValueFrom:function(a){for(var b=0;b<this.length;b++){if(null==a)return;a=a[this[b]]}return a},iterateObjects:function(a,b){for(var c=0;c<this.length;c++){if(c&&(a=a[this[c-1]]),!f(a))return;b(a,this[0])}},compiledGetValueFromFn:function(){var a="",b="obj";a+="if (obj != null";for(var c,d=0;d<this.length-1;d++)c=this[d],b+=k(c)?"."+c:n(c),a+=" &&\n     "+b+" != null";a+=")\n";var c=this[d];return b+=k(c)?"."+c:n(c),a+="  return "+b+";\nelse\n  return undefined;",new Function("obj",a)},setValueFrom:function(a,b){if(!this.length)return!1;for(var c=0;c<this.length-1;c++){if(!f(a))return!1;a=a[this[c]]}return f(a)?(a[this[c]]=b,!0):!1}});var Z=new l("",X);Z.valid=!1,Z.getValueFrom=Z.setValueFrom=function(){};var $,_=1e3,ab=[],bb=P?function(){var a={pingPong:!0},b=!1;return Object.observe(a,function(){s(),b=!1}),function(c){ab.push(c),b||(b=!0,a.pingPong=!a.pingPong)}}():function(){return function(a){ab.push(a)}}(),cb=[],db=[],eb=0,fb=1,gb=2,hb=3,ib=1;x.prototype={open:function(a,b){if(this.state_!=eb)throw Error("Observer has already been opened.");return y(this),this.callback_=a,this.target_=b,this.connect_(),this.state_=fb,this.value_},close:function(){this.state_==fb&&(z(this),this.disconnect_(),this.value_=void 0,this.callback_=void 0,this.target_=void 0,this.state_=gb)},deliver:function(){this.state_==fb&&o(this)},report_:function(a){try{this.callback_.apply(this.target_,a)}catch(b){x._errorThrownDuringCallback=!0,console.error("Exception caught during observer callback: "+(b.stack||b))}},discardChanges:function(){return this.check_(void 0,!0),this.value_}};var jb,kb=!P;x._allObserversCount=0,kb&&(jb=[]);var lb=!1;a.Platform=a.Platform||{},a.Platform.performMicrotaskCheckpoint=function(){if(!lb&&kb){lb=!0;var b,c,d=0;do{d++,c=jb,jb=[],b=!1;for(var e=0;e<c.length;e++){var f=c[e];f.state_==fb&&(f.check_()&&(b=!0),jb.push(f))}s()&&(b=!0)}while(_>d&&b);O&&(a.dirtyCheckCycleCount=d),lb=!1}},kb&&(a.Platform.clearObservers=function(){jb=[]}),A.prototype=S({__proto__:x.prototype,arrayObserve:!1,connect_:function(){P?this.directObserver_=u(this,this.value_,this.arrayObserve):this.oldObject_=this.copyObject(this.value_)},copyObject:function(a){var b=Array.isArray(a)?[]:{};for(var c in a)b[c]=a[c];return Array.isArray(a)&&(b.length=a.length),b},check_:function(a){var b,c;if(P){if(!a)return!1;c={},b=G(this.value_,a,c)}else c=this.oldObject_,b=r(this.value_,this.oldObject_);return q(b)?!1:(P||(this.oldObject_=this.copyObject(this.value_)),this.report_([b.added||{},b.removed||{},b.changed||{},function(a){return c[a]}]),!0)},disconnect_:function(){P?(this.directObserver_.close(),this.directObserver_=void 0):this.oldObject_=void 0},deliver:function(){this.state_==fb&&(P?this.directObserver_.deliver(!1):o(this))},discardChanges:function(){return this.directObserver_?this.directObserver_.deliver(!0):this.oldObject_=this.copyObject(this.value_),this.value_}}),B.prototype=S({__proto__:A.prototype,arrayObserve:!0,copyObject:function(a){return a.slice()},check_:function(a){var b;if(P){if(!a)return!1;b=N(this.value_,a)}else b=J(this.value_,0,this.value_.length,this.oldObject_,0,this.oldObject_.length);return b&&b.length?(P||(this.oldObject_=this.copyObject(this.value_)),this.report_([b]),!0):!1}}),B.applySplices=function(a,b,c){c.forEach(function(c){for(var d=[c.index,c.removed.length],e=c.index;e<c.index+c.addedCount;)d.push(b[e]),e++;Array.prototype.splice.apply(a,d)})},C.prototype=S({__proto__:x.prototype,get path(){return this.path_},connect_:function(){P&&(this.directObserver_=w(this,this.object_)),this.check_(void 0,!0)},disconnect_:function(){this.value_=void 0,this.directObserver_&&(this.directObserver_.close(this),this.directObserver_=void 0)},iterateObjects_:function(a){this.path_.iterateObjects(this.object_,a)},check_:function(a,b){var c=this.value_;return this.value_=this.path_.getValueFrom(this.object_),b||g(this.value_,c)?!1:(this.report_([this.value_,c,this]),!0)},setValue:function(a){this.path_&&this.path_.setValueFrom(this.object_,a)}});var mb={};D.prototype=S({__proto__:x.prototype,connect_:function(){if(P){for(var a,b=!1,c=0;c<this.observed_.length;c+=2)if(a=this.observed_[c],a!==mb){b=!0;break}b&&(this.directObserver_=w(this,a))}this.check_(void 0,!this.reportChangesOnOpen_)},disconnect_:function(){for(var a=0;a<this.observed_.length;a+=2)this.observed_[a]===mb&&this.observed_[a+1].close();this.observed_.length=0,this.value_.length=0,this.directObserver_&&(this.directObserver_.close(this),this.directObserver_=void 0)},addPath:function(a,b){if(this.state_!=eb&&this.state_!=hb)throw Error("Cannot add paths once started.");var b=m(b);if(this.observed_.push(a,b),this.reportChangesOnOpen_){var c=this.observed_.length/2-1;this.value_[c]=b.getValueFrom(a)}},addObserver:function(a){if(this.state_!=eb&&this.state_!=hb)throw Error("Cannot add observers once started.");if(this.observed_.push(mb,a),this.reportChangesOnOpen_){var b=this.observed_.length/2-1;this.value_[b]=a.open(this.deliver,this)}},startReset:function(){if(this.state_!=fb)throw Error("Can only reset while open");this.state_=hb,this.disconnect_()},finishReset:function(){if(this.state_!=hb)throw Error("Can only finishReset after startReset");return this.state_=fb,this.connect_(),this.value_},iterateObjects_:function(a){for(var b,c=0;c<this.observed_.length;c+=2)b=this.observed_[c],b!==mb&&this.observed_[c+1].iterateObjects(b,a)},check_:function(a,b){for(var c,d=0;d<this.observed_.length;d+=2){var e,f=this.observed_[d],h=this.observed_[d+1];if(f===mb){var i=h;e=this.state_===eb?i.open(this.deliver,this):i.discardChanges()}else e=h.getValueFrom(f);b?this.value_[d/2]=e:g(e,this.value_[d/2])||(c=c||[],c[d/2]=this.value_[d/2],this.value_[d/2]=e)}return c?(this.report_([this.value_,c,this.observed_]),!0):!1}}),F.prototype={open:function(a,b){return this.callback_=a,this.target_=b,this.value_=this.getValueFn_(this.observable_.open(this.observedCallback_,this)),this.value_},observedCallback_:function(a){if(a=this.getValueFn_(a),!g(a,this.value_)){var b=this.value_;this.value_=a,this.callback_.call(this.target_,this.value_,b)}},discardChanges:function(){return this.value_=this.getValueFn_(this.observable_.discardChanges()),this.value_},deliver:function(){return this.observable_.deliver()},setValue:function(a){return a=this.setValueFn_(a),!this.dontPassThroughSet_&&this.observable_.setValue?this.observable_.setValue(a):void 0},close:function(){this.observable_&&this.observable_.close(),this.callback_=void 0,this.target_=void 0,this.observable_=void 0,this.value_=void 0,this.getValueFn_=void 0,this.setValueFn_=void 0}};var nb={add:!0,update:!0,"delete":!0},ob=0,pb=1,qb=2,rb=3;I.prototype={calcEditDistances:function(a,b,c,d,e,f){for(var g=f-e+1,h=c-b+1,i=new Array(g),j=0;g>j;j++)i[j]=new Array(h),i[j][0]=j;for(var k=0;h>k;k++)i[0][k]=k;for(var j=1;g>j;j++)for(var k=1;h>k;k++)if(this.equals(a[b+k-1],d[e+j-1]))i[j][k]=i[j-1][k-1];else{var l=i[j-1][k]+1,m=i[j][k-1]+1;i[j][k]=m>l?l:m}return i},spliceOperationsFromEditDistances:function(a){for(var b=a.length-1,c=a[0].length-1,d=a[b][c],e=[];b>0||c>0;)if(0!=b)if(0!=c){var f,g=a[b-1][c-1],h=a[b-1][c],i=a[b][c-1];f=i>h?g>h?h:g:g>i?i:g,f==g?(g==d?e.push(ob):(e.push(pb),d=g),b--,c--):f==h?(e.push(rb),b--,d=h):(e.push(qb),c--,d=i)}else e.push(rb),b--;else e.push(qb),c--;return e.reverse(),e},calcSplices:function(a,b,c,d,e,f){var g=0,h=0,i=Math.min(c-b,f-e);if(0==b&&0==e&&(g=this.sharedPrefix(a,d,i)),c==a.length&&f==d.length&&(h=this.sharedSuffix(a,d,i-g)),b+=g,e+=g,c-=h,f-=h,c-b==0&&f-e==0)return[];if(b==c){for(var j=H(b,[],0);f>e;)j.removed.push(d[e++]);return[j]}if(e==f)return[H(b,[],c-b)];for(var k=this.spliceOperationsFromEditDistances(this.calcEditDistances(a,b,c,d,e,f)),j=void 0,l=[],m=b,n=e,o=0;o<k.length;o++)switch(k[o]){case ob:j&&(l.push(j),j=void 0),m++,n++;break;case pb:j||(j=H(m,[],0)),j.addedCount++,m++,j.removed.push(d[n]),n++;break;case qb:j||(j=H(m,[],0)),j.addedCount++,m++;break;case rb:j||(j=H(m,[],0)),j.removed.push(d[n]),n++}return j&&l.push(j),l},sharedPrefix:function(a,b,c){for(var d=0;c>d;d++)if(!this.equals(a[d],b[d]))return d;return c},sharedSuffix:function(a,b,c){for(var d=a.length,e=b.length,f=0;c>f&&this.equals(a[--d],b[--e]);)f++;return f},calculateSplices:function(a,b){return this.calcSplices(a,0,a.length,b,0,b.length)},equals:function(a,b){return a===b}};var sb=new I;a.Observer=x,a.Observer.runEOM_=bb,a.Observer.observerSentinel_=mb,a.Observer.hasObjectObserve=P,a.ArrayObserver=B,a.ArrayObserver.calculateSplices=function(a,b){return sb.calculateSplices(a,b)},a.ArraySplice=I,a.ObjectObserver=A,a.PathObserver=C,a.CompoundObserver=D,a.Path=l,a.ObserverTransform=F}("undefined"!=typeof global&&global&&"undefined"!=typeof module&&module?global:this||window),window.ShadowDOMPolyfill={},function(a){"use strict";function b(){if("undefined"!=typeof chrome&&chrome.app&&chrome.app.runtime)return!1;if(navigator.getDeviceStorage)return!1;try{var a=new Function("return true;");return a()}catch(b){return!1}}function c(a){if(!a)throw new Error("Assertion failed")}function d(a,b){for(var c=N(b),d=0;d<c.length;d++){var e=c[d];M(a,e,O(b,e))}return a}function e(a,b){for(var c=N(b),d=0;d<c.length;d++){var e=c[d];switch(e){case"arguments":case"caller":case"length":case"name":case"prototype":case"toString":continue}M(a,e,O(b,e))}return a}function f(a,b){for(var c=0;c<b.length;c++)if(b[c]in a)return b[c]}function g(a,b,c){P.value=c,M(a,b,P)}function h(a){var b=a.__proto__||Object.getPrototypeOf(a),c=I.get(b);if(c)return c;var d=h(b),e=v(d);return s(b,e,a),e}function i(a,b){q(a,b,!0)}function j(a,b){q(b,a,!1)}function k(a){return/^on[a-z]+$/.test(a)}function l(a){return/^\w[a-zA-Z_0-9]*$/.test(a)}function m(a){return L&&l(a)?new Function("return this.__impl4cf1e782hg__."+a):function(){return this.__impl4cf1e782hg__[a]}}function n(a){return L&&l(a)?new Function("v","this.__impl4cf1e782hg__."+a+" = v"):function(b){this.__impl4cf1e782hg__[a]=b}}function o(a){return L&&l(a)?new Function("return this.__impl4cf1e782hg__."+a+".apply(this.__impl4cf1e782hg__, arguments)"):function(){return this.__impl4cf1e782hg__[a].apply(this.__impl4cf1e782hg__,arguments)}}function p(a,b){try{return Object.getOwnPropertyDescriptor(a,b)}catch(c){return R}}function q(b,c,d){for(var e=N(b),f=0;f<e.length;f++){var g=e[f];if("polymerBlackList_"!==g&&!(g in c||b.polymerBlackList_&&b.polymerBlackList_[g])){Q&&b.__lookupGetter__(g);var h,i,j=p(b,g);if(d&&"function"==typeof j.value)c[g]=o(g);else{var l=k(g);h=l?a.getEventHandlerGetter(g):m(g),(j.writable||j.set||S)&&(i=l?a.getEventHandlerSetter(g):n(g)),M(c,g,{get:h,set:i,configurable:j.configurable,enumerable:j.enumerable})}}}}function r(a,b,c){var d=a.prototype;s(d,b,c),e(b,a)}function s(a,b,d){var e=b.prototype;c(void 0===I.get(a)),I.set(a,b),J.set(e,a),i(a,e),d&&j(e,d),g(e,"constructor",b),b.prototype=e}function t(a,b){return I.get(b.prototype)===a}function u(a){var b=Object.getPrototypeOf(a),c=h(b),d=v(c);return s(b,d,a),d}function v(a){function b(b){a.call(this,b)}var c=Object.create(a.prototype);return c.constructor=b,b.prototype=c,b}function w(a){return a&&a.__impl4cf1e782hg__}function x(a){return!w(a)}function y(a){return null===a?null:(c(x(a)),a.__wrapper8e3dd93a60__||(a.__wrapper8e3dd93a60__=new(h(a))(a)))}function z(a){return null===a?null:(c(w(a)),a.__impl4cf1e782hg__)}function A(a){return a.__impl4cf1e782hg__}function B(a,b){b.__impl4cf1e782hg__=a,a.__wrapper8e3dd93a60__=b}function C(a){return a&&w(a)?z(a):a}function D(a){return a&&!w(a)?y(a):a}function E(a,b){null!==b&&(c(x(a)),c(void 0===b||w(b)),a.__wrapper8e3dd93a60__=b)}function F(a,b,c){T.get=c,M(a.prototype,b,T)}function G(a,b){F(a,b,function(){return y(this.__impl4cf1e782hg__[b])})}function H(a,b){a.forEach(function(a){b.forEach(function(b){a.prototype[b]=function(){var a=D(this);return a[b].apply(a,arguments)}})})}var I=new WeakMap,J=new WeakMap,K=Object.create(null),L=b(),M=Object.defineProperty,N=Object.getOwnPropertyNames,O=Object.getOwnPropertyDescriptor,P={value:void 0,configurable:!0,enumerable:!1,writable:!0};N(window);var Q=/Firefox/.test(navigator.userAgent),R={get:function(){},set:function(){},configurable:!0,enumerable:!0},S=function(){var a=Object.getOwnPropertyDescriptor(Node.prototype,"nodeType");return!!a&&"set"in a}(),T={get:void 0,configurable:!0,enumerable:!0};a.assert=c,a.constructorTable=I,a.defineGetter=F,a.defineWrapGetter=G,a.forwardMethodsToWrapper=H,a.isWrapper=w,a.isWrapperFor=t,a.mixin=d,a.nativePrototypeTable=J,a.oneOf=f,a.registerObject=u,a.registerWrapper=r,a.rewrap=E,a.setWrapper=B,a.unsafeUnwrap=A,a.unwrap=z,a.unwrapIfNeeded=C,a.wrap=y,a.wrapIfNeeded=D,a.wrappers=K}(window.ShadowDOMPolyfill),function(a){"use strict";function b(){g=!1;var a=f.slice(0);f=[];for(var b=0;b<a.length;b++)a[b]()}function c(a){f.push(a),g||(g=!0,d(b,0))}var d,e=window.MutationObserver,f=[],g=!1;if(e){var h=1,i=new e(b),j=document.createTextNode(h);i.observe(j,{characterData:!0}),d=function(){h=(h+1)%2,j.data=h}}else d=window.setImmediate||window.setTimeout;a.setEndOfMicrotask=c}(window.ShadowDOMPolyfill),function(a){"use strict";function b(a){a.scheduled_||(a.scheduled_=!0,o.push(a),p||(k(c),p=!0))}function c(){for(p=!1;o.length;){var a=o;o=[],a.sort(function(a,b){return a.uid_-b.uid_});for(var b=0;b<a.length;b++){var c=a[b];c.scheduled_=!1;var d=c.takeRecords();f(c),d.length&&c.callback_(d,c)}}}function d(a,b){this.type=a,this.target=b,this.addedNodes=new m.NodeList,this.removedNodes=new m.NodeList,this.previousSibling=null,this.nextSibling=null,this.attributeName=null,this.attributeNamespace=null,this.oldValue=null}function e(a,b){for(;a;a=a.parentNode){var c=n.get(a);if(c)for(var d=0;d<c.length;d++){var e=c[d];e.options.subtree&&e.addTransientObserver(b)}}}function f(a){for(var b=0;b<a.nodes_.length;b++){var c=a.nodes_[b],d=n.get(c);if(!d)return;for(var e=0;e<d.length;e++){var f=d[e];f.observer===a&&f.removeTransientObservers()}}}function g(a,c,e){for(var f=Object.create(null),g=Object.create(null),h=a;h;h=h.parentNode){var i=n.get(h);if(i)for(var j=0;j<i.length;j++){var k=i[j],l=k.options;if((h===a||l.subtree)&&!("attributes"===c&&!l.attributes||"attributes"===c&&l.attributeFilter&&(null!==e.namespace||-1===l.attributeFilter.indexOf(e.name))||"characterData"===c&&!l.characterData||"childList"===c&&!l.childList)){var m=k.observer;f[m.uid_]=m,("attributes"===c&&l.attributeOldValue||"characterData"===c&&l.characterDataOldValue)&&(g[m.uid_]=e.oldValue)}}}for(var o in f){var m=f[o],p=new d(c,a);"name"in e&&"namespace"in e&&(p.attributeName=e.name,p.attributeNamespace=e.namespace),e.addedNodes&&(p.addedNodes=e.addedNodes),e.removedNodes&&(p.removedNodes=e.removedNodes),e.previousSibling&&(p.previousSibling=e.previousSibling),e.nextSibling&&(p.nextSibling=e.nextSibling),void 0!==g[o]&&(p.oldValue=g[o]),b(m),m.records_.push(p)}}function h(a){if(this.childList=!!a.childList,this.subtree=!!a.subtree,this.attributes="attributes"in a||!("attributeOldValue"in a||"attributeFilter"in a)?!!a.attributes:!0,this.characterData="characterDataOldValue"in a&&!("characterData"in a)?!0:!!a.characterData,!this.attributes&&(a.attributeOldValue||"attributeFilter"in a)||!this.characterData&&a.characterDataOldValue)throw new TypeError;if(this.characterData=!!a.characterData,this.attributeOldValue=!!a.attributeOldValue,this.characterDataOldValue=!!a.characterDataOldValue,"attributeFilter"in a){if(null==a.attributeFilter||"object"!=typeof a.attributeFilter)throw new TypeError;this.attributeFilter=q.call(a.attributeFilter)}else this.attributeFilter=null}function i(a){this.callback_=a,this.nodes_=[],this.records_=[],this.uid_=++r,this.scheduled_=!1}function j(a,b,c){this.observer=a,this.target=b,this.options=c,this.transientObservedNodes=[]}var k=a.setEndOfMicrotask,l=a.wrapIfNeeded,m=a.wrappers,n=new WeakMap,o=[],p=!1,q=Array.prototype.slice,r=0;i.prototype={constructor:i,observe:function(a,b){a=l(a);var c,d=new h(b),e=n.get(a);e||n.set(a,e=[]);for(var f=0;f<e.length;f++)e[f].observer===this&&(c=e[f],c.removeTransientObservers(),c.options=d);c||(c=new j(this,a,d),e.push(c),this.nodes_.push(a))},disconnect:function(){this.nodes_.forEach(function(a){for(var b=n.get(a),c=0;c<b.length;c++){var d=b[c];if(d.observer===this){b.splice(c,1);break}}},this),this.records_=[]},takeRecords:function(){var a=this.records_;return this.records_=[],a}},j.prototype={addTransientObserver:function(a){if(a!==this.target){b(this.observer),this.transientObservedNodes.push(a);var c=n.get(a);c||n.set(a,c=[]),c.push(this)}},removeTransientObservers:function(){var a=this.transientObservedNodes;this.transientObservedNodes=[];for(var b=0;b<a.length;b++)for(var c=a[b],d=n.get(c),e=0;e<d.length;e++)if(d[e]===this){d.splice(e,1);break}}},a.enqueueMutation=g,a.registerTransientObservers=e,a.wrappers.MutationObserver=i,a.wrappers.MutationRecord=d}(window.ShadowDOMPolyfill),function(a){"use strict";function b(a,b){this.root=a,this.parent=b}function c(a,b){if(a.treeScope_!==b){a.treeScope_=b;for(var d=a.shadowRoot;d;d=d.olderShadowRoot)d.treeScope_.parent=b;for(var e=a.firstChild;e;e=e.nextSibling)c(e,b)}}function d(c){if(c instanceof a.wrappers.Window,c.treeScope_)return c.treeScope_;var e,f=c.parentNode;return e=f?d(f):new b(c,null),c.treeScope_=e}b.prototype={get renderer(){return this.root instanceof a.wrappers.ShadowRoot?a.getRendererForHost(this.root.host):null},contains:function(a){for(;a;a=a.parent)if(a===this)return!0;return!1}},a.TreeScope=b,a.getTreeScope=d,a.setTreeScope=c}(window.ShadowDOMPolyfill),function(a){"use strict";function b(a){return a instanceof T.ShadowRoot}function c(a){return M(a).root}function d(a,d){var h=[],i=a;for(h.push(i);i;){var j=g(i);if(j&&j.length>0){for(var k=0;k<j.length;k++){var m=j[k];if(f(m)){var n=c(m),o=n.olderShadowRoot;o&&h.push(o)}h.push(m)}i=j[j.length-1]}else if(b(i)){if(l(a,i)&&e(d))break;i=i.host,h.push(i)}else i=i.parentNode,i&&h.push(i)}return h}function e(a){if(!a)return!1;switch(a.type){case"abort":case"error":case"select":case"change":case"load":case"reset":case"resize":case"scroll":case"selectstart":return!0}return!1}function f(a){return a instanceof HTMLShadowElement}function g(b){return a.getDestinationInsertionPoints(b)}function h(a,b){if(0===a.length)return b;b instanceof T.Window&&(b=b.document);for(var c=M(b),d=a[0],e=M(d),f=j(c,e),g=0;g<a.length;g++){var h=a[g];if(M(h)===f)return h}return a[a.length-1]}function i(a){for(var b=[];a;a=a.parent)b.push(a);return b}function j(a,b){for(var c=i(a),d=i(b),e=null;c.length>0&&d.length>0;){var f=c.pop(),g=d.pop();if(f!==g)break;e=f}return e}function k(a,b,c){b instanceof T.Window&&(b=b.document);var e,f=M(b),g=M(c),h=d(c,a),e=j(f,g);e||(e=g.root);for(var i=e;i;i=i.parent)for(var k=0;k<h.length;k++){var l=h[k];if(M(l)===i)return l}return null}function l(a,b){return M(a)===M(b)}function m(a){if(!V.get(a)&&(V.set(a,!0),o(S(a),S(a.target)),K)){var b=K;throw K=null,b}}function n(a){switch(a.type){case"load":case"beforeunload":case"unload":return!0}return!1}function o(b,c){if(W.get(b))throw new Error("InvalidStateError");W.set(b,!0),a.renderAllPending();var e,f,g;if(n(b)&&!b.bubbles){var h=c;h instanceof T.Document&&(g=h.defaultView)&&(f=h,e=[])}if(!e)if(c instanceof T.Window)g=c,e=[];else if(e=d(c,b),!n(b)){var h=e[e.length-1];h instanceof T.Document&&(g=h.defaultView)}return cb.set(b,e),p(b,e,g,f)&&q(b,e,g,f)&&r(b,e,g,f),$.set(b,db),Y.delete(b,null),W.delete(b),b.defaultPrevented}function p(a,b,c,d){var e=eb;if(c&&!s(c,a,e,b,d))return!1;for(var f=b.length-1;f>0;f--)if(!s(b[f],a,e,b,d))return!1;return!0}function q(a,b,c,d){var e=fb,f=b[0]||c;return s(f,a,e,b,d)}function r(a,b,c,d){for(var e=gb,f=1;f<b.length;f++)if(!s(b[f],a,e,b,d))return;c&&b.length>0&&s(c,a,e,b,d)}function s(a,b,c,d,e){var f=U.get(a);if(!f)return!0;var g=e||h(d,a);if(g===a){if(c===eb)return!0;c===gb&&(c=fb)}else if(c===gb&&!b.bubbles)return!0;if("relatedTarget"in b){var i=R(b),j=i.relatedTarget;if(j){if(j instanceof Object&&j.addEventListener){var l=S(j),m=k(b,a,l);if(m===g)return!0}else m=null;Z.set(b,m)}}$.set(b,c);var n=b.type,o=!1;X.set(b,g),Y.set(b,a),f.depth++;for(var p=0,q=f.length;q>p;p++){var r=f[p];if(r.removed)o=!0;else if(!(r.type!==n||!r.capture&&c===eb||r.capture&&c===gb))try{if("function"==typeof r.handler?r.handler.call(a,b):r.handler.handleEvent(b),ab.get(b))return!1}catch(s){K||(K=s)}}if(f.depth--,o&&0===f.depth){var t=f.slice();f.length=0;for(var p=0;p<t.length;p++)t[p].removed||f.push(t[p])}return!_.get(b)}function t(a,b,c){this.type=a,this.handler=b,this.capture=Boolean(c)}function u(a,b){if(!(a instanceof hb))return S(y(hb,"Event",a,b));var c=a;return sb||"beforeunload"!==c.type||this instanceof z?void P(c,this):new z(c)}function v(a){return a&&a.relatedTarget?Object.create(a,{relatedTarget:{value:R(a.relatedTarget)}}):a}function w(a,b,c){var d=window[a],e=function(b,c){return b instanceof d?void P(b,this):S(y(d,a,b,c))};if(e.prototype=Object.create(b.prototype),c&&N(e.prototype,c),d)try{O(d,e,new d("temp"))}catch(f){O(d,e,document.createEvent(a))}return e}function x(a,b){return function(){arguments[b]=R(arguments[b]);var c=R(this);c[a].apply(c,arguments)}}function y(a,b,c,d){if(qb)return new a(c,v(d));var e=R(document.createEvent(b)),f=pb[b],g=[c];return Object.keys(f).forEach(function(a){var b=null!=d&&a in d?d[a]:f[a];"relatedTarget"===a&&(b=R(b)),g.push(b)}),e["init"+b].apply(e,g),e}function z(a){u.call(this,a)}function A(a){return"function"==typeof a?!0:a&&a.handleEvent}function B(a){switch(a){case"DOMAttrModified":case"DOMAttributeNameChanged":case"DOMCharacterDataModified":case"DOMElementNameChanged":case"DOMNodeInserted":case"DOMNodeInsertedIntoDocument":case"DOMNodeRemoved":case"DOMNodeRemovedFromDocument":case"DOMSubtreeModified":return!0}return!1}function C(a){P(a,this)}function D(a){return a instanceof T.ShadowRoot&&(a=a.host),R(a)}function E(a,b){var c=U.get(a);if(c)for(var d=0;d<c.length;d++)if(!c[d].removed&&c[d].type===b)return!0;return!1}function F(a,b){for(var c=R(a);c;c=c.parentNode)if(E(S(c),b))return!0;return!1}function G(a){L(a,ub)}function H(b,c,e,f){a.renderAllPending();var g=S(vb.call(Q(c),e,f));if(!g)return null;var i=d(g,null),j=i.lastIndexOf(b);return-1==j?null:(i=i.slice(0,j),h(i,b))}function I(a){return function(){var b=bb.get(this);
return b&&b[a]&&b[a].value||null}}function J(a){var b=a.slice(2);return function(c){var d=bb.get(this);d||(d=Object.create(null),bb.set(this,d));var e=d[a];if(e&&this.removeEventListener(b,e.wrapped,!1),"function"==typeof c){var f=function(b){var d=c.call(this,b);d===!1?b.preventDefault():"onbeforeunload"===a&&"string"==typeof d&&(b.returnValue=d)};this.addEventListener(b,f,!1),d[a]={value:c,wrapped:f}}}}var K,L=a.forwardMethodsToWrapper,M=a.getTreeScope,N=a.mixin,O=a.registerWrapper,P=a.setWrapper,Q=a.unsafeUnwrap,R=a.unwrap,S=a.wrap,T=a.wrappers,U=(new WeakMap,new WeakMap),V=new WeakMap,W=new WeakMap,X=new WeakMap,Y=new WeakMap,Z=new WeakMap,$=new WeakMap,_=new WeakMap,ab=new WeakMap,bb=new WeakMap,cb=new WeakMap,db=0,eb=1,fb=2,gb=3;t.prototype={equals:function(a){return this.handler===a.handler&&this.type===a.type&&this.capture===a.capture},get removed(){return null===this.handler},remove:function(){this.handler=null}};var hb=window.Event;hb.prototype.polymerBlackList_={returnValue:!0,keyLocation:!0},u.prototype={get target(){return X.get(this)},get currentTarget(){return Y.get(this)},get eventPhase(){return $.get(this)},get path(){var a=cb.get(this);return a?a.slice():[]},stopPropagation:function(){_.set(this,!0)},stopImmediatePropagation:function(){_.set(this,!0),ab.set(this,!0)}},O(hb,u,document.createEvent("Event"));var ib=w("UIEvent",u),jb=w("CustomEvent",u),kb={get relatedTarget(){var a=Z.get(this);return void 0!==a?a:S(R(this).relatedTarget)}},lb=N({initMouseEvent:x("initMouseEvent",14)},kb),mb=N({initFocusEvent:x("initFocusEvent",5)},kb),nb=w("MouseEvent",ib,lb),ob=w("FocusEvent",ib,mb),pb=Object.create(null),qb=function(){try{new window.FocusEvent("focus")}catch(a){return!1}return!0}();if(!qb){var rb=function(a,b,c){if(c){var d=pb[c];b=N(N({},d),b)}pb[a]=b};rb("Event",{bubbles:!1,cancelable:!1}),rb("CustomEvent",{detail:null},"Event"),rb("UIEvent",{view:null,detail:0},"Event"),rb("MouseEvent",{screenX:0,screenY:0,clientX:0,clientY:0,ctrlKey:!1,altKey:!1,shiftKey:!1,metaKey:!1,button:0,relatedTarget:null},"UIEvent"),rb("FocusEvent",{relatedTarget:null},"UIEvent")}var sb=window.BeforeUnloadEvent;z.prototype=Object.create(u.prototype),N(z.prototype,{get returnValue(){return Q(this).returnValue},set returnValue(a){Q(this).returnValue=a}}),sb&&O(sb,z);var tb=window.EventTarget,ub=["addEventListener","removeEventListener","dispatchEvent"];[Node,Window].forEach(function(a){var b=a.prototype;ub.forEach(function(a){Object.defineProperty(b,a+"_",{value:b[a]})})}),C.prototype={addEventListener:function(a,b,c){if(A(b)&&!B(a)){var d=new t(a,b,c),e=U.get(this);if(e){for(var f=0;f<e.length;f++)if(d.equals(e[f]))return}else e=[],e.depth=0,U.set(this,e);e.push(d);var g=D(this);g.addEventListener_(a,m,!0)}},removeEventListener:function(a,b,c){c=Boolean(c);var d=U.get(this);if(d){for(var e=0,f=!1,g=0;g<d.length;g++)d[g].type===a&&d[g].capture===c&&(e++,d[g].handler===b&&(f=!0,d[g].remove()));if(f&&1===e){var h=D(this);h.removeEventListener_(a,m,!0)}}},dispatchEvent:function(b){var c=R(b),d=c.type;V.set(c,!1),a.renderAllPending();var e;F(this,d)||(e=function(){},this.addEventListener(d,e,!0));try{return R(this).dispatchEvent_(c)}finally{e&&this.removeEventListener(d,e,!0)}}},tb&&O(tb,C);var vb=document.elementFromPoint;a.elementFromPoint=H,a.getEventHandlerGetter=I,a.getEventHandlerSetter=J,a.wrapEventTargetMethods=G,a.wrappers.BeforeUnloadEvent=z,a.wrappers.CustomEvent=jb,a.wrappers.Event=u,a.wrappers.EventTarget=C,a.wrappers.FocusEvent=ob,a.wrappers.MouseEvent=nb,a.wrappers.UIEvent=ib}(window.ShadowDOMPolyfill),function(a){"use strict";function b(a,b){Object.defineProperty(a,b,p)}function c(a){j(a,this)}function d(){this.length=0,b(this,"length")}function e(a){for(var b=new d,e=0;e<a.length;e++)b[e]=new c(a[e]);return b.length=e,b}function f(a){g.call(this,a)}var g=a.wrappers.UIEvent,h=a.mixin,i=a.registerWrapper,j=a.setWrapper,k=a.unsafeUnwrap,l=a.wrap,m=window.TouchEvent;if(m){var n;try{n=document.createEvent("TouchEvent")}catch(o){return}var p={enumerable:!1};c.prototype={get target(){return l(k(this).target)}};var q={configurable:!0,enumerable:!0,get:null};["clientX","clientY","screenX","screenY","pageX","pageY","identifier","webkitRadiusX","webkitRadiusY","webkitRotationAngle","webkitForce"].forEach(function(a){q.get=function(){return k(this)[a]},Object.defineProperty(c.prototype,a,q)}),d.prototype={item:function(a){return this[a]}},f.prototype=Object.create(g.prototype),h(f.prototype,{get touches(){return e(k(this).touches)},get targetTouches(){return e(k(this).targetTouches)},get changedTouches(){return e(k(this).changedTouches)},initTouchEvent:function(){throw new Error("Not implemented")}}),i(m,f,n),a.wrappers.Touch=c,a.wrappers.TouchEvent=f,a.wrappers.TouchList=d}}(window.ShadowDOMPolyfill),function(a){"use strict";function b(a,b){Object.defineProperty(a,b,h)}function c(){this.length=0,b(this,"length")}function d(a){if(null==a)return a;for(var b=new c,d=0,e=a.length;e>d;d++)b[d]=g(a[d]);return b.length=e,b}function e(a,b){a.prototype[b]=function(){return d(f(this)[b].apply(f(this),arguments))}}var f=a.unsafeUnwrap,g=a.wrap,h={enumerable:!1};c.prototype={item:function(a){return this[a]}},b(c.prototype,"item"),a.wrappers.NodeList=c,a.addWrapNodeListMethod=e,a.wrapNodeList=d}(window.ShadowDOMPolyfill),function(a){"use strict";a.wrapHTMLCollection=a.wrapNodeList,a.wrappers.HTMLCollection=a.wrappers.NodeList}(window.ShadowDOMPolyfill),function(a){"use strict";function b(a){A(a instanceof w)}function c(a){var b=new y;return b[0]=a,b.length=1,b}function d(a,b,c){C(b,"childList",{removedNodes:c,previousSibling:a.previousSibling,nextSibling:a.nextSibling})}function e(a,b){C(a,"childList",{removedNodes:b})}function f(a,b,d,e){if(a instanceof DocumentFragment){var f=h(a);P=!0;for(var g=f.length-1;g>=0;g--)a.removeChild(f[g]),f[g].parentNode_=b;P=!1;for(var g=0;g<f.length;g++)f[g].previousSibling_=f[g-1]||d,f[g].nextSibling_=f[g+1]||e;return d&&(d.nextSibling_=f[0]),e&&(e.previousSibling_=f[f.length-1]),f}var f=c(a),i=a.parentNode;return i&&i.removeChild(a),a.parentNode_=b,a.previousSibling_=d,a.nextSibling_=e,d&&(d.nextSibling_=a),e&&(e.previousSibling_=a),f}function g(a){if(a instanceof DocumentFragment)return h(a);var b=c(a),e=a.parentNode;return e&&d(a,e,b),b}function h(a){for(var b=new y,c=0,d=a.firstChild;d;d=d.nextSibling)b[c++]=d;return b.length=c,e(a,b),b}function i(a){return a}function j(a,b){I(a,b),a.nodeIsInserted_()}function k(a,b){for(var c=D(b),d=0;d<a.length;d++)j(a[d],c)}function l(a){I(a,new z(a,null))}function m(a){for(var b=0;b<a.length;b++)l(a[b])}function n(a,b){var c=a.nodeType===w.DOCUMENT_NODE?a:a.ownerDocument;c!==b.ownerDocument&&c.adoptNode(b)}function o(b,c){if(c.length){var d=b.ownerDocument;if(d!==c[0].ownerDocument)for(var e=0;e<c.length;e++)a.adoptNodeNoRemove(c[e],d)}}function p(a,b){o(a,b);var c=b.length;if(1===c)return K(b[0]);for(var d=K(a.ownerDocument.createDocumentFragment()),e=0;c>e;e++)d.appendChild(K(b[e]));return d}function q(a){if(void 0!==a.firstChild_)for(var b=a.firstChild_;b;){var c=b;b=b.nextSibling_,c.parentNode_=c.previousSibling_=c.nextSibling_=void 0}a.firstChild_=a.lastChild_=void 0}function r(a){if(a.invalidateShadowRenderer()){for(var b=a.firstChild;b;){A(b.parentNode===a);var c=b.nextSibling,d=K(b),e=d.parentNode;e&&W.call(e,d),b.previousSibling_=b.nextSibling_=b.parentNode_=null,b=c}a.firstChild_=a.lastChild_=null}else for(var c,f=K(a),g=f.firstChild;g;)c=g.nextSibling,W.call(f,g),g=c}function s(a){var b=a.parentNode;return b&&b.invalidateShadowRenderer()}function t(a){for(var b,c=0;c<a.length;c++)b=a[c],b.parentNode.removeChild(b)}function u(a,b,c){var d;if(d=M(c?Q.call(c,J(a),!1):R.call(J(a),!1)),b){for(var e=a.firstChild;e;e=e.nextSibling)d.appendChild(u(e,!0,c));if(a instanceof O.HTMLTemplateElement)for(var f=d.content,e=a.content.firstChild;e;e=e.nextSibling)f.appendChild(u(e,!0,c))}return d}function v(a,b){if(!b||D(a)!==D(b))return!1;for(var c=b;c;c=c.parentNode)if(c===a)return!0;return!1}function w(a){A(a instanceof S),x.call(this,a),this.parentNode_=void 0,this.firstChild_=void 0,this.lastChild_=void 0,this.nextSibling_=void 0,this.previousSibling_=void 0,this.treeScope_=void 0}var x=a.wrappers.EventTarget,y=a.wrappers.NodeList,z=a.TreeScope,A=a.assert,B=a.defineWrapGetter,C=a.enqueueMutation,D=a.getTreeScope,E=a.isWrapper,F=a.mixin,G=a.registerTransientObservers,H=a.registerWrapper,I=a.setTreeScope,J=a.unsafeUnwrap,K=a.unwrap,L=a.unwrapIfNeeded,M=a.wrap,N=a.wrapIfNeeded,O=a.wrappers,P=!1,Q=document.importNode,R=window.Node.prototype.cloneNode,S=window.Node,T=window.DocumentFragment,U=(S.prototype.appendChild,S.prototype.compareDocumentPosition),V=S.prototype.insertBefore,W=S.prototype.removeChild,X=S.prototype.replaceChild,Y=/Trident/.test(navigator.userAgent),Z=Y?function(a,b){try{W.call(a,b)}catch(c){if(!(a instanceof T))throw c}}:function(a,b){W.call(a,b)};w.prototype=Object.create(x.prototype),F(w.prototype,{appendChild:function(a){return this.insertBefore(a,null)},insertBefore:function(a,c){b(a);var d;c?E(c)?d=K(c):(d=c,c=M(d)):(c=null,d=null),c&&A(c.parentNode===this);var e,h=c?c.previousSibling:this.lastChild,i=!this.invalidateShadowRenderer()&&!s(a);if(e=i?g(a):f(a,this,h,c),i)n(this,a),q(this),V.call(J(this),K(a),d);else{h||(this.firstChild_=e[0]),c||(this.lastChild_=e[e.length-1],void 0===this.firstChild_&&(this.firstChild_=this.firstChild));var j=d?d.parentNode:J(this);j?V.call(j,p(this,e),d):o(this,e)}return C(this,"childList",{addedNodes:e,nextSibling:c,previousSibling:h}),k(e,this),a},removeChild:function(a){if(b(a),a.parentNode!==this){for(var d=!1,e=(this.childNodes,this.firstChild);e;e=e.nextSibling)if(e===a){d=!0;break}if(!d)throw new Error("NotFoundError")}var f=K(a),g=a.nextSibling,h=a.previousSibling;if(this.invalidateShadowRenderer()){var i=this.firstChild,j=this.lastChild,k=f.parentNode;k&&Z(k,f),i===a&&(this.firstChild_=g),j===a&&(this.lastChild_=h),h&&(h.nextSibling_=g),g&&(g.previousSibling_=h),a.previousSibling_=a.nextSibling_=a.parentNode_=void 0}else q(this),Z(J(this),f);return P||C(this,"childList",{removedNodes:c(a),nextSibling:g,previousSibling:h}),G(this,a),a},replaceChild:function(a,d){b(a);var e;if(E(d)?e=K(d):(e=d,d=M(e)),d.parentNode!==this)throw new Error("NotFoundError");var h,i=d.nextSibling,j=d.previousSibling,m=!this.invalidateShadowRenderer()&&!s(a);return m?h=g(a):(i===a&&(i=a.nextSibling),h=f(a,this,j,i)),m?(n(this,a),q(this),X.call(J(this),K(a),e)):(this.firstChild===d&&(this.firstChild_=h[0]),this.lastChild===d&&(this.lastChild_=h[h.length-1]),d.previousSibling_=d.nextSibling_=d.parentNode_=void 0,e.parentNode&&X.call(e.parentNode,p(this,h),e)),C(this,"childList",{addedNodes:h,removedNodes:c(d),nextSibling:i,previousSibling:j}),l(d),k(h,this),d},nodeIsInserted_:function(){for(var a=this.firstChild;a;a=a.nextSibling)a.nodeIsInserted_()},hasChildNodes:function(){return null!==this.firstChild},get parentNode(){return void 0!==this.parentNode_?this.parentNode_:M(J(this).parentNode)},get firstChild(){return void 0!==this.firstChild_?this.firstChild_:M(J(this).firstChild)},get lastChild(){return void 0!==this.lastChild_?this.lastChild_:M(J(this).lastChild)},get nextSibling(){return void 0!==this.nextSibling_?this.nextSibling_:M(J(this).nextSibling)},get previousSibling(){return void 0!==this.previousSibling_?this.previousSibling_:M(J(this).previousSibling)},get parentElement(){for(var a=this.parentNode;a&&a.nodeType!==w.ELEMENT_NODE;)a=a.parentNode;return a},get textContent(){for(var a="",b=this.firstChild;b;b=b.nextSibling)b.nodeType!=w.COMMENT_NODE&&(a+=b.textContent);return a},set textContent(a){var b=i(this.childNodes);if(this.invalidateShadowRenderer()){if(r(this),""!==a){var c=J(this).ownerDocument.createTextNode(a);this.appendChild(c)}}else q(this),J(this).textContent=a;var d=i(this.childNodes);C(this,"childList",{addedNodes:d,removedNodes:b}),m(b),k(d,this)},get childNodes(){for(var a=new y,b=0,c=this.firstChild;c;c=c.nextSibling)a[b++]=c;return a.length=b,a},cloneNode:function(a){return u(this,a)},contains:function(a){return v(this,N(a))},compareDocumentPosition:function(a){return U.call(J(this),L(a))},normalize:function(){for(var a,b,c=i(this.childNodes),d=[],e="",f=0;f<c.length;f++)b=c[f],b.nodeType===w.TEXT_NODE?a||b.data.length?a?(e+=b.data,d.push(b)):a=b:this.removeNode(b):(a&&d.length&&(a.data+=e,t(d)),d=[],e="",a=null,b.childNodes.length&&b.normalize());a&&d.length&&(a.data+=e,t(d))}}),B(w,"ownerDocument"),H(S,w,document.createDocumentFragment()),delete w.prototype.querySelector,delete w.prototype.querySelectorAll,w.prototype=F(Object.create(x.prototype),w.prototype),a.cloneNode=u,a.nodeWasAdded=j,a.nodeWasRemoved=l,a.nodesWereAdded=k,a.nodesWereRemoved=m,a.originalInsertBefore=V,a.originalRemoveChild=W,a.snapshotNodeList=i,a.wrappers.Node=w}(window.ShadowDOMPolyfill),function(a){"use strict";function b(b,c,d,e){for(var f=null,g=null,h=0,i=b.length;i>h;h++)f=s(b[h]),!e&&(g=q(f).root)&&g instanceof a.wrappers.ShadowRoot||(d[c++]=f);return c}function c(a){return String(a).replace(/\/deep\//g," ")}function d(a,b){for(var c,e=a.firstElementChild;e;){if(e.matches(b))return e;if(c=d(e,b))return c;e=e.nextElementSibling}return null}function e(a,b){return a.matches(b)}function f(a,b,c){var d=a.localName;return d===b||d===c&&a.namespaceURI===D}function g(){return!0}function h(a,b,c){return a.localName===c}function i(a,b){return a.namespaceURI===b}function j(a,b,c){return a.namespaceURI===b&&a.localName===c}function k(a,b,c,d,e,f){for(var g=a.firstElementChild;g;)d(g,e,f)&&(c[b++]=g),b=k(g,b,c,d,e,f),g=g.nextElementSibling;return b}function l(c,d,e,f,g){var h,i=r(this),j=q(this).root;if(j instanceof a.wrappers.ShadowRoot)return k(this,d,e,c,f,null);if(i instanceof B)h=w.call(i,f);else{if(!(i instanceof C))return k(this,d,e,c,f,null);h=v.call(i,f)}return b(h,d,e,g)}function m(c,d,e,f,g){var h,i=r(this),j=q(this).root;if(j instanceof a.wrappers.ShadowRoot)return k(this,d,e,c,f,g);if(i instanceof B)h=y.call(i,f,g);else{if(!(i instanceof C))return k(this,d,e,c,f,g);h=x.call(i,f,g)}return b(h,d,e,!1)}function n(c,d,e,f,g){var h,i=r(this),j=q(this).root;if(j instanceof a.wrappers.ShadowRoot)return k(this,d,e,c,f,g);if(i instanceof B)h=A.call(i,f,g);else{if(!(i instanceof C))return k(this,d,e,c,f,g);h=z.call(i,f,g)}return b(h,d,e,!1)}var o=a.wrappers.HTMLCollection,p=a.wrappers.NodeList,q=a.getTreeScope,r=a.unsafeUnwrap,s=a.wrap,t=document.querySelector,u=document.documentElement.querySelector,v=document.querySelectorAll,w=document.documentElement.querySelectorAll,x=document.getElementsByTagName,y=document.documentElement.getElementsByTagName,z=document.getElementsByTagNameNS,A=document.documentElement.getElementsByTagNameNS,B=window.Element,C=window.HTMLDocument||window.Document,D="http://www.w3.org/1999/xhtml",E={querySelector:function(b){var e=c(b),f=e!==b;b=e;var g,h=r(this),i=q(this).root;if(i instanceof a.wrappers.ShadowRoot)return d(this,b);if(h instanceof B)g=s(u.call(h,b));else{if(!(h instanceof C))return d(this,b);g=s(t.call(h,b))}return g&&!f&&(i=q(g).root)&&i instanceof a.wrappers.ShadowRoot?d(this,b):g},querySelectorAll:function(a){var b=c(a),d=b!==a;a=b;var f=new p;return f.length=l.call(this,e,0,f,a,d),f}},F={getElementsByTagName:function(a){var b=new o,c="*"===a?g:f;return b.length=m.call(this,c,0,b,a,a.toLowerCase()),b},getElementsByClassName:function(a){return this.querySelectorAll("."+a)},getElementsByTagNameNS:function(a,b){var c=new o,d=null;return d="*"===a?"*"===b?g:h:"*"===b?i:j,c.length=n.call(this,d,0,c,a||null,b),c}};a.GetElementsByInterface=F,a.SelectorsInterface=E}(window.ShadowDOMPolyfill),function(a){"use strict";function b(a){for(;a&&a.nodeType!==Node.ELEMENT_NODE;)a=a.nextSibling;return a}function c(a){for(;a&&a.nodeType!==Node.ELEMENT_NODE;)a=a.previousSibling;return a}var d=a.wrappers.NodeList,e={get firstElementChild(){return b(this.firstChild)},get lastElementChild(){return c(this.lastChild)},get childElementCount(){for(var a=0,b=this.firstElementChild;b;b=b.nextElementSibling)a++;return a},get children(){for(var a=new d,b=0,c=this.firstElementChild;c;c=c.nextElementSibling)a[b++]=c;return a.length=b,a},remove:function(){var a=this.parentNode;a&&a.removeChild(this)}},f={get nextElementSibling(){return b(this.nextSibling)},get previousElementSibling(){return c(this.previousSibling)}};a.ChildNodeInterface=f,a.ParentNodeInterface=e}(window.ShadowDOMPolyfill),function(a){"use strict";function b(a){d.call(this,a)}var c=a.ChildNodeInterface,d=a.wrappers.Node,e=a.enqueueMutation,f=a.mixin,g=a.registerWrapper,h=a.unsafeUnwrap,i=window.CharacterData;b.prototype=Object.create(d.prototype),f(b.prototype,{get textContent(){return this.data},set textContent(a){this.data=a},get data(){return h(this).data},set data(a){var b=h(this).data;e(this,"characterData",{oldValue:b}),h(this).data=a}}),f(b.prototype,c),g(i,b,document.createTextNode("")),a.wrappers.CharacterData=b}(window.ShadowDOMPolyfill),function(a){"use strict";function b(a){return a>>>0}function c(a){d.call(this,a)}var d=a.wrappers.CharacterData,e=(a.enqueueMutation,a.mixin),f=a.registerWrapper,g=window.Text;c.prototype=Object.create(d.prototype),e(c.prototype,{splitText:function(a){a=b(a);var c=this.data;if(a>c.length)throw new Error("IndexSizeError");var d=c.slice(0,a),e=c.slice(a);this.data=d;var f=this.ownerDocument.createTextNode(e);return this.parentNode&&this.parentNode.insertBefore(f,this.nextSibling),f}}),f(g,c,document.createTextNode("")),a.wrappers.Text=c}(window.ShadowDOMPolyfill),function(a){"use strict";function b(b){a.invalidateRendererBasedOnAttribute(b,"class")}function c(a,b){d(a,this),this.ownerElement_=b}var d=a.setWrapper,e=a.unsafeUnwrap;c.prototype={constructor:c,get length(){return e(this).length},item:function(a){return e(this).item(a)},contains:function(a){return e(this).contains(a)},add:function(){e(this).add.apply(e(this),arguments),b(this.ownerElement_)},remove:function(){e(this).remove.apply(e(this),arguments),b(this.ownerElement_)},toggle:function(){var a=e(this).toggle.apply(e(this),arguments);return b(this.ownerElement_),a},toString:function(){return e(this).toString()}},a.wrappers.DOMTokenList=c}(window.ShadowDOMPolyfill),function(a){"use strict";function b(b,c){var d=b.parentNode;if(d&&d.shadowRoot){var e=a.getRendererForHost(d);e.dependsOnAttribute(c)&&e.invalidate()}}function c(a,b,c){k(a,"attributes",{name:b,namespace:null,oldValue:c})}function d(a){g.call(this,a)}var e=a.ChildNodeInterface,f=a.GetElementsByInterface,g=a.wrappers.Node,h=a.wrappers.DOMTokenList,i=a.ParentNodeInterface,j=a.SelectorsInterface,k=(a.addWrapNodeListMethod,a.enqueueMutation),l=a.mixin,m=(a.oneOf,a.registerWrapper),n=a.unsafeUnwrap,o=a.wrappers,p=window.Element,q=["matches","mozMatchesSelector","msMatchesSelector","webkitMatchesSelector"].filter(function(a){return p.prototype[a]}),r=q[0],s=p.prototype[r],t=new WeakMap;d.prototype=Object.create(g.prototype),l(d.prototype,{createShadowRoot:function(){var b=new o.ShadowRoot(this);n(this).polymerShadowRoot_=b;var c=a.getRendererForHost(this);return c.invalidate(),b},get shadowRoot(){return n(this).polymerShadowRoot_||null},setAttribute:function(a,d){var e=n(this).getAttribute(a);n(this).setAttribute(a,d),c(this,a,e),b(this,a)},removeAttribute:function(a){var d=n(this).getAttribute(a);n(this).removeAttribute(a),c(this,a,d),b(this,a)},matches:function(a){return s.call(n(this),a)},get classList(){var a=t.get(this);return a||t.set(this,a=new h(n(this).classList,this)),a},get className(){return n(this).className},set className(a){this.setAttribute("class",a)},get id(){return n(this).id},set id(a){this.setAttribute("id",a)}}),q.forEach(function(a){"matches"!==a&&(d.prototype[a]=function(a){return this.matches(a)})}),p.prototype.webkitCreateShadowRoot&&(d.prototype.webkitCreateShadowRoot=d.prototype.createShadowRoot),l(d.prototype,e),l(d.prototype,f),l(d.prototype,i),l(d.prototype,j),m(p,d,document.createElementNS(null,"x")),a.invalidateRendererBasedOnAttribute=b,a.matchesNames=q,a.wrappers.Element=d}(window.ShadowDOMPolyfill),function(a){"use strict";function b(a){switch(a){case"&":return"&amp;";case"<":return"&lt;";case">":return"&gt;";case'"':return"&quot;";case"\xa0":return"&nbsp;"}}function c(a){return a.replace(A,b)}function d(a){return a.replace(B,b)}function e(a){for(var b={},c=0;c<a.length;c++)b[a[c]]=!0;return b}function f(a,b){switch(a.nodeType){case Node.ELEMENT_NODE:for(var e,f=a.tagName.toLowerCase(),h="<"+f,i=a.attributes,j=0;e=i[j];j++)h+=" "+e.name+'="'+c(e.value)+'"';return h+=">",C[f]?h:h+g(a)+"</"+f+">";case Node.TEXT_NODE:var k=a.data;return b&&D[b.localName]?k:d(k);case Node.COMMENT_NODE:return"<!--"+a.data+"-->";default:throw console.error(a),new Error("not implemented")}}function g(a){a instanceof z.HTMLTemplateElement&&(a=a.content);for(var b="",c=a.firstChild;c;c=c.nextSibling)b+=f(c,a);return b}function h(a,b,c){var d=c||"div";a.textContent="";var e=x(a.ownerDocument.createElement(d));e.innerHTML=b;for(var f;f=e.firstChild;)a.appendChild(y(f))}function i(a){o.call(this,a)}function j(a,b){var c=x(a.cloneNode(!1));c.innerHTML=b;for(var d,e=x(document.createDocumentFragment());d=c.firstChild;)e.appendChild(d);return y(e)}function k(b){return function(){return a.renderAllPending(),w(this)[b]}}function l(a){p(i,a,k(a))}function m(b){Object.defineProperty(i.prototype,b,{get:k(b),set:function(c){a.renderAllPending(),w(this)[b]=c},configurable:!0,enumerable:!0})}function n(b){Object.defineProperty(i.prototype,b,{value:function(){return a.renderAllPending(),w(this)[b].apply(w(this),arguments)},configurable:!0,enumerable:!0})}var o=a.wrappers.Element,p=a.defineGetter,q=a.enqueueMutation,r=a.mixin,s=a.nodesWereAdded,t=a.nodesWereRemoved,u=a.registerWrapper,v=a.snapshotNodeList,w=a.unsafeUnwrap,x=a.unwrap,y=a.wrap,z=a.wrappers,A=/[&\u00A0"]/g,B=/[&\u00A0<>]/g,C=e(["area","base","br","col","command","embed","hr","img","input","keygen","link","meta","param","source","track","wbr"]),D=e(["style","script","xmp","iframe","noembed","noframes","plaintext","noscript"]),E=/MSIE/.test(navigator.userAgent),F=window.HTMLElement,G=window.HTMLTemplateElement;i.prototype=Object.create(o.prototype),r(i.prototype,{get innerHTML(){return g(this)},set innerHTML(a){if(E&&D[this.localName])return void(this.textContent=a);var b=v(this.childNodes);this.invalidateShadowRenderer()?this instanceof z.HTMLTemplateElement?h(this.content,a):h(this,a,this.tagName):!G&&this instanceof z.HTMLTemplateElement?h(this.content,a):w(this).innerHTML=a;var c=v(this.childNodes);q(this,"childList",{addedNodes:c,removedNodes:b}),t(b),s(c,this)},get outerHTML(){return f(this,this.parentNode)},set outerHTML(a){var b=this.parentNode;if(b){b.invalidateShadowRenderer();var c=j(b,a);b.replaceChild(c,this)}},insertAdjacentHTML:function(a,b){var c,d;switch(String(a).toLowerCase()){case"beforebegin":c=this.parentNode,d=this;break;case"afterend":c=this.parentNode,d=this.nextSibling;break;case"afterbegin":c=this,d=this.firstChild;break;case"beforeend":c=this,d=null;break;default:return}var e=j(c,b);c.insertBefore(e,d)},get hidden(){return this.hasAttribute("hidden")},set hidden(a){a?this.setAttribute("hidden",""):this.removeAttribute("hidden")}}),["clientHeight","clientLeft","clientTop","clientWidth","offsetHeight","offsetLeft","offsetTop","offsetWidth","scrollHeight","scrollWidth"].forEach(l),["scrollLeft","scrollTop"].forEach(m),["getBoundingClientRect","getClientRects","scrollIntoView"].forEach(n),u(F,i,document.createElement("b")),a.wrappers.HTMLElement=i,a.getInnerHTML=g,a.setInnerHTML=h}(window.ShadowDOMPolyfill),function(a){"use strict";function b(a){c.call(this,a)}var c=a.wrappers.HTMLElement,d=a.mixin,e=a.registerWrapper,f=a.unsafeUnwrap,g=a.wrap,h=window.HTMLCanvasElement;b.prototype=Object.create(c.prototype),d(b.prototype,{getContext:function(){var a=f(this).getContext.apply(f(this),arguments);return a&&g(a)}}),e(h,b,document.createElement("canvas")),a.wrappers.HTMLCanvasElement=b}(window.ShadowDOMPolyfill),function(a){"use strict";function b(a){c.call(this,a)}var c=a.wrappers.HTMLElement,d=a.mixin,e=a.registerWrapper,f=window.HTMLContentElement;b.prototype=Object.create(c.prototype),d(b.prototype,{constructor:b,get select(){return this.getAttribute("select")},set select(a){this.setAttribute("select",a)},setAttribute:function(a,b){c.prototype.setAttribute.call(this,a,b),"select"===String(a).toLowerCase()&&this.invalidateShadowRenderer(!0)}}),f&&e(f,b),a.wrappers.HTMLContentElement=b}(window.ShadowDOMPolyfill),function(a){"use strict";function b(a){c.call(this,a)}var c=a.wrappers.HTMLElement,d=a.mixin,e=a.registerWrapper,f=a.wrapHTMLCollection,g=a.unwrap,h=window.HTMLFormElement;b.prototype=Object.create(c.prototype),d(b.prototype,{get elements(){return f(g(this).elements)}}),e(h,b,document.createElement("form")),a.wrappers.HTMLFormElement=b}(window.ShadowDOMPolyfill),function(a){"use strict";function b(a){d.call(this,a)}function c(a,b){if(!(this instanceof c))throw new TypeError("DOM object constructor cannot be called as a function.");var e=f(document.createElement("img"));d.call(this,e),g(e,this),void 0!==a&&(e.width=a),void 0!==b&&(e.height=b)}var d=a.wrappers.HTMLElement,e=a.registerWrapper,f=a.unwrap,g=a.rewrap,h=window.HTMLImageElement;b.prototype=Object.create(d.prototype),e(h,b,document.createElement("img")),c.prototype=b.prototype,a.wrappers.HTMLImageElement=b,a.wrappers.Image=c}(window.ShadowDOMPolyfill),function(a){"use strict";function b(a){c.call(this,a)}var c=a.wrappers.HTMLElement,d=(a.mixin,a.wrappers.NodeList,a.registerWrapper),e=window.HTMLShadowElement;b.prototype=Object.create(c.prototype),b.prototype.constructor=b,e&&d(e,b),a.wrappers.HTMLShadowElement=b}(window.ShadowDOMPolyfill),function(a){"use strict";function b(a){if(!a.defaultView)return a;var b=l.get(a);if(!b){for(b=a.implementation.createHTMLDocument("");b.lastChild;)b.removeChild(b.lastChild);l.set(a,b)}return b}function c(a){for(var c,d=b(a.ownerDocument),e=i(d.createDocumentFragment());c=a.firstChild;)e.appendChild(c);return e}function d(a){if(e.call(this,a),!m){var b=c(a);k.set(this,j(b))}}var e=a.wrappers.HTMLElement,f=a.mixin,g=a.registerWrapper,h=a.unsafeUnwrap,i=a.unwrap,j=a.wrap,k=new WeakMap,l=new WeakMap,m=window.HTMLTemplateElement;d.prototype=Object.create(e.prototype),f(d.prototype,{constructor:d,get content(){return m?j(h(this).content):k.get(this)}}),m&&g(m,d),a.wrappers.HTMLTemplateElement=d}(window.ShadowDOMPolyfill),function(a){"use strict";function b(a){c.call(this,a)}var c=a.wrappers.HTMLElement,d=a.registerWrapper,e=window.HTMLMediaElement;e&&(b.prototype=Object.create(c.prototype),d(e,b,document.createElement("audio")),a.wrappers.HTMLMediaElement=b)}(window.ShadowDOMPolyfill),function(a){"use strict";function b(a){d.call(this,a)}function c(a){if(!(this instanceof c))throw new TypeError("DOM object constructor cannot be called as a function.");var b=f(document.createElement("audio"));d.call(this,b),g(b,this),b.setAttribute("preload","auto"),void 0!==a&&b.setAttribute("src",a)}var d=a.wrappers.HTMLMediaElement,e=a.registerWrapper,f=a.unwrap,g=a.rewrap,h=window.HTMLAudioElement;h&&(b.prototype=Object.create(d.prototype),e(h,b,document.createElement("audio")),c.prototype=b.prototype,a.wrappers.HTMLAudioElement=b,a.wrappers.Audio=c)}(window.ShadowDOMPolyfill),function(a){"use strict";function b(a){return a.replace(/\s+/g," ").trim()}function c(a){e.call(this,a)}function d(a,b,c,f){if(!(this instanceof d))throw new TypeError("DOM object constructor cannot be called as a function.");var g=i(document.createElement("option"));e.call(this,g),h(g,this),void 0!==a&&(g.text=a),void 0!==b&&g.setAttribute("value",b),c===!0&&g.setAttribute("selected",""),g.selected=f===!0}var e=a.wrappers.HTMLElement,f=a.mixin,g=a.registerWrapper,h=a.rewrap,i=a.unwrap,j=a.wrap,k=window.HTMLOptionElement;c.prototype=Object.create(e.prototype),f(c.prototype,{get text(){return b(this.textContent)},set text(a){this.textContent=b(String(a))},get form(){return j(i(this).form)}}),g(k,c,document.createElement("option")),d.prototype=c.prototype,a.wrappers.HTMLOptionElement=c,a.wrappers.Option=d}(window.ShadowDOMPolyfill),function(a){"use strict";function b(a){c.call(this,a)}var c=a.wrappers.HTMLElement,d=a.mixin,e=a.registerWrapper,f=a.unwrap,g=a.wrap,h=window.HTMLSelectElement;b.prototype=Object.create(c.prototype),d(b.prototype,{add:function(a,b){"object"==typeof b&&(b=f(b)),f(this).add(f(a),b)},remove:function(a){return void 0===a?void c.prototype.remove.call(this):("object"==typeof a&&(a=f(a)),void f(this).remove(a))},get form(){return g(f(this).form)}}),e(h,b,document.createElement("select")),a.wrappers.HTMLSelectElement=b}(window.ShadowDOMPolyfill),function(a){"use strict";function b(a){c.call(this,a)}var c=a.wrappers.HTMLElement,d=a.mixin,e=a.registerWrapper,f=a.unwrap,g=a.wrap,h=a.wrapHTMLCollection,i=window.HTMLTableElement;b.prototype=Object.create(c.prototype),d(b.prototype,{get caption(){return g(f(this).caption)},createCaption:function(){return g(f(this).createCaption())},get tHead(){return g(f(this).tHead)},createTHead:function(){return g(f(this).createTHead())},createTFoot:function(){return g(f(this).createTFoot())},get tFoot(){return g(f(this).tFoot)},get tBodies(){return h(f(this).tBodies)},createTBody:function(){return g(f(this).createTBody())},get rows(){return h(f(this).rows)},insertRow:function(a){return g(f(this).insertRow(a))}}),e(i,b,document.createElement("table")),a.wrappers.HTMLTableElement=b}(window.ShadowDOMPolyfill),function(a){"use strict";function b(a){c.call(this,a)}var c=a.wrappers.HTMLElement,d=a.mixin,e=a.registerWrapper,f=a.wrapHTMLCollection,g=a.unwrap,h=a.wrap,i=window.HTMLTableSectionElement;b.prototype=Object.create(c.prototype),d(b.prototype,{constructor:b,get rows(){return f(g(this).rows)},insertRow:function(a){return h(g(this).insertRow(a))}}),e(i,b,document.createElement("thead")),a.wrappers.HTMLTableSectionElement=b}(window.ShadowDOMPolyfill),function(a){"use strict";function b(a){c.call(this,a)}var c=a.wrappers.HTMLElement,d=a.mixin,e=a.registerWrapper,f=a.wrapHTMLCollection,g=a.unwrap,h=a.wrap,i=window.HTMLTableRowElement;b.prototype=Object.create(c.prototype),d(b.prototype,{get cells(){return f(g(this).cells)},insertCell:function(a){return h(g(this).insertCell(a))}}),e(i,b,document.createElement("tr")),a.wrappers.HTMLTableRowElement=b}(window.ShadowDOMPolyfill),function(a){"use strict";function b(a){switch(a.localName){case"content":return new c(a);case"shadow":return new e(a);case"template":return new f(a)}d.call(this,a)}var c=a.wrappers.HTMLContentElement,d=a.wrappers.HTMLElement,e=a.wrappers.HTMLShadowElement,f=a.wrappers.HTMLTemplateElement,g=(a.mixin,a.registerWrapper),h=window.HTMLUnknownElement;b.prototype=Object.create(d.prototype),g(h,b),a.wrappers.HTMLUnknownElement=b}(window.ShadowDOMPolyfill),function(a){"use strict";var b=a.wrappers.Element,c=a.wrappers.HTMLElement,d=a.registerObject,e="http://www.w3.org/2000/svg",f=document.createElementNS(e,"title"),g=d(f),h=Object.getPrototypeOf(g.prototype).constructor;if(!("classList"in f)){var i=Object.getOwnPropertyDescriptor(b.prototype,"classList");Object.defineProperty(c.prototype,"classList",i),delete b.prototype.classList}a.wrappers.SVGElement=h}(window.ShadowDOMPolyfill),function(a){"use strict";function b(a){m.call(this,a)}var c=a.mixin,d=a.registerWrapper,e=a.unwrap,f=a.wrap,g=window.SVGUseElement,h="http://www.w3.org/2000/svg",i=f(document.createElementNS(h,"g")),j=document.createElementNS(h,"use"),k=i.constructor,l=Object.getPrototypeOf(k.prototype),m=l.constructor;b.prototype=Object.create(l),"instanceRoot"in j&&c(b.prototype,{get instanceRoot(){return f(e(this).instanceRoot)},get animatedInstanceRoot(){return f(e(this).animatedInstanceRoot)}}),d(g,b,j),a.wrappers.SVGUseElement=b}(window.ShadowDOMPolyfill),function(a){"use strict";function b(a){c.call(this,a)}var c=a.wrappers.EventTarget,d=a.mixin,e=a.registerWrapper,f=a.unsafeUnwrap,g=a.wrap,h=window.SVGElementInstance;h&&(b.prototype=Object.create(c.prototype),d(b.prototype,{get correspondingElement(){return g(f(this).correspondingElement)
},get correspondingUseElement(){return g(f(this).correspondingUseElement)},get parentNode(){return g(f(this).parentNode)},get childNodes(){throw new Error("Not implemented")},get firstChild(){return g(f(this).firstChild)},get lastChild(){return g(f(this).lastChild)},get previousSibling(){return g(f(this).previousSibling)},get nextSibling(){return g(f(this).nextSibling)}}),e(h,b),a.wrappers.SVGElementInstance=b)}(window.ShadowDOMPolyfill),function(a){"use strict";function b(a){e(a,this)}var c=a.mixin,d=a.registerWrapper,e=a.setWrapper,f=a.unsafeUnwrap,g=a.unwrap,h=a.unwrapIfNeeded,i=a.wrap,j=window.CanvasRenderingContext2D;c(b.prototype,{get canvas(){return i(f(this).canvas)},drawImage:function(){arguments[0]=h(arguments[0]),f(this).drawImage.apply(f(this),arguments)},createPattern:function(){return arguments[0]=g(arguments[0]),f(this).createPattern.apply(f(this),arguments)}}),d(j,b,document.createElement("canvas").getContext("2d")),a.wrappers.CanvasRenderingContext2D=b}(window.ShadowDOMPolyfill),function(a){"use strict";function b(a){e(a,this)}var c=a.mixin,d=a.registerWrapper,e=a.setWrapper,f=a.unsafeUnwrap,g=a.unwrapIfNeeded,h=a.wrap,i=window.WebGLRenderingContext;if(i){c(b.prototype,{get canvas(){return h(f(this).canvas)},texImage2D:function(){arguments[5]=g(arguments[5]),f(this).texImage2D.apply(f(this),arguments)},texSubImage2D:function(){arguments[6]=g(arguments[6]),f(this).texSubImage2D.apply(f(this),arguments)}});var j=/WebKit/.test(navigator.userAgent)?{drawingBufferHeight:null,drawingBufferWidth:null}:{};d(i,b,j),a.wrappers.WebGLRenderingContext=b}}(window.ShadowDOMPolyfill),function(a){"use strict";function b(a){d(a,this)}var c=a.registerWrapper,d=a.setWrapper,e=a.unsafeUnwrap,f=a.unwrap,g=a.unwrapIfNeeded,h=a.wrap,i=window.Range;b.prototype={get startContainer(){return h(e(this).startContainer)},get endContainer(){return h(e(this).endContainer)},get commonAncestorContainer(){return h(e(this).commonAncestorContainer)},setStart:function(a,b){e(this).setStart(g(a),b)},setEnd:function(a,b){e(this).setEnd(g(a),b)},setStartBefore:function(a){e(this).setStartBefore(g(a))},setStartAfter:function(a){e(this).setStartAfter(g(a))},setEndBefore:function(a){e(this).setEndBefore(g(a))},setEndAfter:function(a){e(this).setEndAfter(g(a))},selectNode:function(a){e(this).selectNode(g(a))},selectNodeContents:function(a){e(this).selectNodeContents(g(a))},compareBoundaryPoints:function(a,b){return e(this).compareBoundaryPoints(a,f(b))},extractContents:function(){return h(e(this).extractContents())},cloneContents:function(){return h(e(this).cloneContents())},insertNode:function(a){e(this).insertNode(g(a))},surroundContents:function(a){e(this).surroundContents(g(a))},cloneRange:function(){return h(e(this).cloneRange())},isPointInRange:function(a,b){return e(this).isPointInRange(g(a),b)},comparePoint:function(a,b){return e(this).comparePoint(g(a),b)},intersectsNode:function(a){return e(this).intersectsNode(g(a))},toString:function(){return e(this).toString()}},i.prototype.createContextualFragment&&(b.prototype.createContextualFragment=function(a){return h(e(this).createContextualFragment(a))}),c(window.Range,b,document.createRange()),a.wrappers.Range=b}(window.ShadowDOMPolyfill),function(a){"use strict";var b=a.GetElementsByInterface,c=a.ParentNodeInterface,d=a.SelectorsInterface,e=a.mixin,f=a.registerObject,g=f(document.createDocumentFragment());e(g.prototype,c),e(g.prototype,d),e(g.prototype,b);var h=f(document.createComment(""));a.wrappers.Comment=h,a.wrappers.DocumentFragment=g}(window.ShadowDOMPolyfill),function(a){"use strict";function b(a){var b=l(k(a).ownerDocument.createDocumentFragment());c.call(this,b),i(b,this);var e=a.shadowRoot;n.set(this,e),this.treeScope_=new d(this,g(e||a)),m.set(this,a)}var c=a.wrappers.DocumentFragment,d=a.TreeScope,e=a.elementFromPoint,f=a.getInnerHTML,g=a.getTreeScope,h=a.mixin,i=a.rewrap,j=a.setInnerHTML,k=a.unsafeUnwrap,l=a.unwrap,m=new WeakMap,n=new WeakMap,o=/[ \t\n\r\f]/;b.prototype=Object.create(c.prototype),h(b.prototype,{constructor:b,get innerHTML(){return f(this)},set innerHTML(a){j(this,a),this.invalidateShadowRenderer()},get olderShadowRoot(){return n.get(this)||null},get host(){return m.get(this)||null},invalidateShadowRenderer:function(){return m.get(this).invalidateShadowRenderer()},elementFromPoint:function(a,b){return e(this,this.ownerDocument,a,b)},getElementById:function(a){return o.test(a)?null:this.querySelector('[id="'+a+'"]')}}),a.wrappers.ShadowRoot=b}(window.ShadowDOMPolyfill),function(a){"use strict";function b(a){a.previousSibling_=a.previousSibling,a.nextSibling_=a.nextSibling,a.parentNode_=a.parentNode}function c(c,e,f){var g=H(c),h=H(e),i=f?H(f):null;if(d(e),b(e),f)c.firstChild===f&&(c.firstChild_=f),f.previousSibling_=f.previousSibling;else{c.lastChild_=c.lastChild,c.lastChild===c.firstChild&&(c.firstChild_=c.firstChild);var j=I(g.lastChild);j&&(j.nextSibling_=j.nextSibling)}a.originalInsertBefore.call(g,h,i)}function d(c){var d=H(c),e=d.parentNode;if(e){var f=I(e);b(c),c.previousSibling&&(c.previousSibling.nextSibling_=c),c.nextSibling&&(c.nextSibling.previousSibling_=c),f.lastChild===c&&(f.lastChild_=c),f.firstChild===c&&(f.firstChild_=c),a.originalRemoveChild.call(e,d)}}function e(a){J.set(a,[])}function f(a){var b=J.get(a);return b||J.set(a,b=[]),b}function g(a){for(var b=[],c=0,d=a.firstChild;d;d=d.nextSibling)b[c++]=d;return b}function h(){for(var a=0;a<N.length;a++){var b=N[a],c=b.parentRenderer;c&&c.dirty||b.render()}N=[]}function i(){y=null,h()}function j(a){var b=L.get(a);return b||(b=new n(a),L.set(a,b)),b}function k(a){var b=E(a).root;return b instanceof D?b:null}function l(a){return j(a.host)}function m(a){this.skip=!1,this.node=a,this.childNodes=[]}function n(a){this.host=a,this.dirty=!1,this.invalidateAttributes(),this.associateNode(a)}function o(a){for(var b=[],c=a.firstChild;c;c=c.nextSibling)v(c)?b.push.apply(b,f(c)):b.push(c);return b}function p(a){if(a instanceof B)return a;if(a instanceof A)return null;for(var b=a.firstChild;b;b=b.nextSibling){var c=p(b);if(c)return c}return null}function q(a,b){f(b).push(a);var c=K.get(a);c?c.push(b):K.set(a,[b])}function r(a){return K.get(a)}function s(a){K.set(a,void 0)}function t(a,b){var c=b.getAttribute("select");if(!c)return!0;if(c=c.trim(),!c)return!0;if(!(a instanceof z))return!1;if(!P.test(c))return!1;try{return a.matches(c)}catch(d){return!1}}function u(a,b){var c=r(b);return c&&c[c.length-1]===a}function v(a){return a instanceof A||a instanceof B}function w(a){return a.shadowRoot}function x(a){for(var b=[],c=a.shadowRoot;c;c=c.olderShadowRoot)b.push(c);return b}var y,z=a.wrappers.Element,A=a.wrappers.HTMLContentElement,B=a.wrappers.HTMLShadowElement,C=a.wrappers.Node,D=a.wrappers.ShadowRoot,E=(a.assert,a.getTreeScope),F=(a.mixin,a.oneOf),G=a.unsafeUnwrap,H=a.unwrap,I=a.wrap,J=new WeakMap,K=new WeakMap,L=new WeakMap,M=F(window,["requestAnimationFrame","mozRequestAnimationFrame","webkitRequestAnimationFrame","setTimeout"]),N=[],O=new ArraySplice;O.equals=function(a,b){return H(a.node)===b},m.prototype={append:function(a){var b=new m(a);return this.childNodes.push(b),b},sync:function(a){if(!this.skip){for(var b=this.node,e=this.childNodes,f=g(H(b)),h=a||new WeakMap,i=O.calculateSplices(e,f),j=0,k=0,l=0,m=0;m<i.length;m++){for(var n=i[m];l<n.index;l++)k++,e[j++].sync(h);for(var o=n.removed.length,p=0;o>p;p++){var q=I(f[k++]);h.get(q)||d(q)}for(var r=n.addedCount,s=f[k]&&I(f[k]),p=0;r>p;p++){var t=e[j++],u=t.node;c(b,u,s),h.set(u,!0),t.sync(h)}l+=r}for(var m=l;m<e.length;m++)e[m].sync(h)}}},n.prototype={render:function(a){if(this.dirty){this.invalidateAttributes();var b=this.host;this.distribution(b);var c=a||new m(b);this.buildRenderTree(c,b);var d=!a;d&&c.sync(),this.dirty=!1}},get parentRenderer(){return E(this.host).renderer},invalidate:function(){if(!this.dirty){this.dirty=!0;var a=this.parentRenderer;if(a&&a.invalidate(),N.push(this),y)return;y=window[M](i,0)}},distribution:function(a){this.resetAllSubtrees(a),this.distributionResolution(a)},resetAll:function(a){v(a)?e(a):s(a),this.resetAllSubtrees(a)},resetAllSubtrees:function(a){for(var b=a.firstChild;b;b=b.nextSibling)this.resetAll(b);a.shadowRoot&&this.resetAll(a.shadowRoot),a.olderShadowRoot&&this.resetAll(a.olderShadowRoot)},distributionResolution:function(a){if(w(a)){for(var b=a,c=o(b),d=x(b),e=0;e<d.length;e++)this.poolDistribution(d[e],c);for(var e=d.length-1;e>=0;e--){var f=d[e],g=p(f);if(g){var h=f.olderShadowRoot;h&&(c=o(h));for(var i=0;i<c.length;i++)q(c[i],g)}this.distributionResolution(f)}}for(var j=a.firstChild;j;j=j.nextSibling)this.distributionResolution(j)},poolDistribution:function(a,b){if(!(a instanceof B))if(a instanceof A){var c=a;this.updateDependentAttributes(c.getAttribute("select"));for(var d=!1,e=0;e<b.length;e++){var a=b[e];a&&t(a,c)&&(q(a,c),b[e]=void 0,d=!0)}if(!d)for(var f=c.firstChild;f;f=f.nextSibling)q(f,c)}else for(var f=a.firstChild;f;f=f.nextSibling)this.poolDistribution(f,b)},buildRenderTree:function(a,b){for(var c=this.compose(b),d=0;d<c.length;d++){var e=c[d],f=a.append(e);this.buildRenderTree(f,e)}if(w(b)){var g=j(b);g.dirty=!1}},compose:function(a){for(var b=[],c=a.shadowRoot||a,d=c.firstChild;d;d=d.nextSibling)if(v(d)){this.associateNode(c);for(var e=f(d),g=0;g<e.length;g++){var h=e[g];u(d,h)&&b.push(h)}}else b.push(d);return b},invalidateAttributes:function(){this.attributes=Object.create(null)},updateDependentAttributes:function(a){if(a){var b=this.attributes;/\.\w+/.test(a)&&(b["class"]=!0),/#\w+/.test(a)&&(b.id=!0),a.replace(/\[\s*([^\s=\|~\]]+)/g,function(a,c){b[c]=!0})}},dependsOnAttribute:function(a){return this.attributes[a]},associateNode:function(a){G(a).polymerShadowRenderer_=this}};var P=/^(:not\()?[*.#[a-zA-Z_|]/;C.prototype.invalidateShadowRenderer=function(){var a=G(this).polymerShadowRenderer_;return a?(a.invalidate(),!0):!1},A.prototype.getDistributedNodes=B.prototype.getDistributedNodes=function(){return h(),f(this)},z.prototype.getDestinationInsertionPoints=function(){return h(),r(this)||[]},A.prototype.nodeIsInserted_=B.prototype.nodeIsInserted_=function(){this.invalidateShadowRenderer();var a,b=k(this);b&&(a=l(b)),G(this).polymerShadowRenderer_=a,a&&a.invalidate()},a.getRendererForHost=j,a.getShadowTrees=x,a.renderAllPending=h,a.getDestinationInsertionPoints=r,a.visual={insertBefore:c,remove:d}}(window.ShadowDOMPolyfill),function(a){"use strict";function b(b){if(window[b]){d(!a.wrappers[b]);var i=function(a){c.call(this,a)};i.prototype=Object.create(c.prototype),e(i.prototype,{get form(){return h(g(this).form)}}),f(window[b],i,document.createElement(b.slice(4,-7))),a.wrappers[b]=i}}var c=a.wrappers.HTMLElement,d=a.assert,e=a.mixin,f=a.registerWrapper,g=a.unwrap,h=a.wrap,i=["HTMLButtonElement","HTMLFieldSetElement","HTMLInputElement","HTMLKeygenElement","HTMLLabelElement","HTMLLegendElement","HTMLObjectElement","HTMLOutputElement","HTMLTextAreaElement"];i.forEach(b)}(window.ShadowDOMPolyfill),function(a){"use strict";function b(a){d(a,this)}{var c=a.registerWrapper,d=a.setWrapper,e=a.unsafeUnwrap,f=a.unwrap,g=a.unwrapIfNeeded,h=a.wrap;window.Selection}b.prototype={get anchorNode(){return h(e(this).anchorNode)},get focusNode(){return h(e(this).focusNode)},addRange:function(a){e(this).addRange(f(a))},collapse:function(a,b){e(this).collapse(g(a),b)},containsNode:function(a,b){return e(this).containsNode(g(a),b)},extend:function(a,b){e(this).extend(g(a),b)},getRangeAt:function(a){return h(e(this).getRangeAt(a))},removeRange:function(a){e(this).removeRange(f(a))},selectAllChildren:function(a){e(this).selectAllChildren(g(a))},toString:function(){return e(this).toString()}},c(window.Selection,b,window.getSelection()),a.wrappers.Selection=b}(window.ShadowDOMPolyfill),function(a){"use strict";function b(a){k.call(this,a),this.treeScope_=new p(this,null)}function c(a){var c=document[a];b.prototype[a]=function(){return C(c.apply(A(this),arguments))}}function d(a,b){F.call(A(b),B(a)),e(a,b)}function e(a,b){a.shadowRoot&&b.adoptNode(a.shadowRoot),a instanceof o&&f(a,b);for(var c=a.firstChild;c;c=c.nextSibling)e(c,b)}function f(a,b){var c=a.olderShadowRoot;c&&b.adoptNode(c)}function g(a){z(a,this)}function h(a,b){var c=document.implementation[b];a.prototype[b]=function(){return C(c.apply(A(this),arguments))}}function i(a,b){var c=document.implementation[b];a.prototype[b]=function(){return c.apply(A(this),arguments)}}var j=a.GetElementsByInterface,k=a.wrappers.Node,l=a.ParentNodeInterface,m=a.wrappers.Selection,n=a.SelectorsInterface,o=a.wrappers.ShadowRoot,p=a.TreeScope,q=a.cloneNode,r=a.defineWrapGetter,s=a.elementFromPoint,t=a.forwardMethodsToWrapper,u=a.matchesNames,v=a.mixin,w=a.registerWrapper,x=a.renderAllPending,y=a.rewrap,z=a.setWrapper,A=a.unsafeUnwrap,B=a.unwrap,C=a.wrap,D=a.wrapEventTargetMethods,E=(a.wrapNodeList,new WeakMap);b.prototype=Object.create(k.prototype),r(b,"documentElement"),r(b,"body"),r(b,"head"),["createComment","createDocumentFragment","createElement","createElementNS","createEvent","createEventNS","createRange","createTextNode","getElementById"].forEach(c);var F=document.adoptNode,G=document.getSelection;if(v(b.prototype,{adoptNode:function(a){return a.parentNode&&a.parentNode.removeChild(a),d(a,this),a},elementFromPoint:function(a,b){return s(this,this,a,b)},importNode:function(a,b){return q(a,b,A(this))},getSelection:function(){return x(),new m(G.call(B(this)))},getElementsByName:function(a){return n.querySelectorAll.call(this,"[name="+JSON.stringify(String(a))+"]")}}),document.registerElement){var H=document.registerElement;b.prototype.registerElement=function(b,c){function d(a){return a?void z(a,this):f?document.createElement(f,b):document.createElement(b)}var e,f;if(void 0!==c&&(e=c.prototype,f=c.extends),e||(e=Object.create(HTMLElement.prototype)),a.nativePrototypeTable.get(e))throw new Error("NotSupportedError");for(var g,h=Object.getPrototypeOf(e),i=[];h&&!(g=a.nativePrototypeTable.get(h));)i.push(h),h=Object.getPrototypeOf(h);if(!g)throw new Error("NotSupportedError");for(var j=Object.create(g),k=i.length-1;k>=0;k--)j=Object.create(j);["createdCallback","attachedCallback","detachedCallback","attributeChangedCallback"].forEach(function(a){var b=e[a];b&&(j[a]=function(){C(this)instanceof d||y(this),b.apply(C(this),arguments)})});var l={prototype:j};f&&(l.extends=f),d.prototype=e,d.prototype.constructor=d,a.constructorTable.set(j,d),a.nativePrototypeTable.set(e,j);H.call(B(this),b,l);return d},t([window.HTMLDocument||window.Document],["registerElement"])}t([window.HTMLBodyElement,window.HTMLDocument||window.Document,window.HTMLHeadElement,window.HTMLHtmlElement],["appendChild","compareDocumentPosition","contains","getElementsByClassName","getElementsByTagName","getElementsByTagNameNS","insertBefore","querySelector","querySelectorAll","removeChild","replaceChild"].concat(u)),t([window.HTMLDocument||window.Document],["adoptNode","importNode","contains","createComment","createDocumentFragment","createElement","createElementNS","createEvent","createEventNS","createRange","createTextNode","elementFromPoint","getElementById","getElementsByName","getSelection"]),v(b.prototype,j),v(b.prototype,l),v(b.prototype,n),v(b.prototype,{get implementation(){var a=E.get(this);return a?a:(a=new g(B(this).implementation),E.set(this,a),a)},get defaultView(){return C(B(this).defaultView)}}),w(window.Document,b,document.implementation.createHTMLDocument("")),window.HTMLDocument&&w(window.HTMLDocument,b),D([window.HTMLBodyElement,window.HTMLDocument||window.Document,window.HTMLHeadElement]),h(g,"createDocumentType"),h(g,"createDocument"),h(g,"createHTMLDocument"),i(g,"hasFeature"),w(window.DOMImplementation,g),t([window.DOMImplementation],["createDocumentType","createDocument","createHTMLDocument","hasFeature"]),a.adoptNodeNoRemove=d,a.wrappers.DOMImplementation=g,a.wrappers.Document=b}(window.ShadowDOMPolyfill),function(a){"use strict";function b(a){c.call(this,a)}var c=a.wrappers.EventTarget,d=a.wrappers.Selection,e=a.mixin,f=a.registerWrapper,g=a.renderAllPending,h=a.unwrap,i=a.unwrapIfNeeded,j=a.wrap,k=window.Window,l=window.getComputedStyle,m=window.getDefaultComputedStyle,n=window.getSelection;b.prototype=Object.create(c.prototype),k.prototype.getComputedStyle=function(a,b){return j(this||window).getComputedStyle(i(a),b)},m&&(k.prototype.getDefaultComputedStyle=function(a,b){return j(this||window).getDefaultComputedStyle(i(a),b)}),k.prototype.getSelection=function(){return j(this||window).getSelection()},delete window.getComputedStyle,delete window.getDefaultComputedStyle,delete window.getSelection,["addEventListener","removeEventListener","dispatchEvent"].forEach(function(a){k.prototype[a]=function(){var b=j(this||window);return b[a].apply(b,arguments)},delete window[a]}),e(b.prototype,{getComputedStyle:function(a,b){return g(),l.call(h(this),i(a),b)},getSelection:function(){return g(),new d(n.call(h(this)))},get document(){return j(h(this).document)}}),m&&(b.prototype.getDefaultComputedStyle=function(a,b){return g(),m.call(h(this),i(a),b)}),f(k,b,window),a.wrappers.Window=b}(window.ShadowDOMPolyfill),function(a){"use strict";var b=a.unwrap,c=window.DataTransfer||window.Clipboard,d=c.prototype.setDragImage;d&&(c.prototype.setDragImage=function(a,c,e){d.call(this,b(a),c,e)})}(window.ShadowDOMPolyfill),function(a){"use strict";function b(a){var b;b=a instanceof f?a:new f(a&&e(a)),d(b,this)}var c=a.registerWrapper,d=a.setWrapper,e=a.unwrap,f=window.FormData;f&&(c(f,b,new f),a.wrappers.FormData=b)}(window.ShadowDOMPolyfill),function(a){"use strict";var b=a.unwrapIfNeeded,c=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(a){return c.call(this,b(a))}}(window.ShadowDOMPolyfill),function(a){"use strict";function b(a){var b=c[a],d=window[b];if(d){var e=document.createElement(a),f=e.constructor;window[b]=f}}var c=(a.isWrapperFor,{a:"HTMLAnchorElement",area:"HTMLAreaElement",audio:"HTMLAudioElement",base:"HTMLBaseElement",body:"HTMLBodyElement",br:"HTMLBRElement",button:"HTMLButtonElement",canvas:"HTMLCanvasElement",caption:"HTMLTableCaptionElement",col:"HTMLTableColElement",content:"HTMLContentElement",data:"HTMLDataElement",datalist:"HTMLDataListElement",del:"HTMLModElement",dir:"HTMLDirectoryElement",div:"HTMLDivElement",dl:"HTMLDListElement",embed:"HTMLEmbedElement",fieldset:"HTMLFieldSetElement",font:"HTMLFontElement",form:"HTMLFormElement",frame:"HTMLFrameElement",frameset:"HTMLFrameSetElement",h1:"HTMLHeadingElement",head:"HTMLHeadElement",hr:"HTMLHRElement",html:"HTMLHtmlElement",iframe:"HTMLIFrameElement",img:"HTMLImageElement",input:"HTMLInputElement",keygen:"HTMLKeygenElement",label:"HTMLLabelElement",legend:"HTMLLegendElement",li:"HTMLLIElement",link:"HTMLLinkElement",map:"HTMLMapElement",marquee:"HTMLMarqueeElement",menu:"HTMLMenuElement",menuitem:"HTMLMenuItemElement",meta:"HTMLMetaElement",meter:"HTMLMeterElement",object:"HTMLObjectElement",ol:"HTMLOListElement",optgroup:"HTMLOptGroupElement",option:"HTMLOptionElement",output:"HTMLOutputElement",p:"HTMLParagraphElement",param:"HTMLParamElement",pre:"HTMLPreElement",progress:"HTMLProgressElement",q:"HTMLQuoteElement",script:"HTMLScriptElement",select:"HTMLSelectElement",shadow:"HTMLShadowElement",source:"HTMLSourceElement",span:"HTMLSpanElement",style:"HTMLStyleElement",table:"HTMLTableElement",tbody:"HTMLTableSectionElement",template:"HTMLTemplateElement",textarea:"HTMLTextAreaElement",thead:"HTMLTableSectionElement",time:"HTMLTimeElement",title:"HTMLTitleElement",tr:"HTMLTableRowElement",track:"HTMLTrackElement",ul:"HTMLUListElement",video:"HTMLVideoElement"});Object.keys(c).forEach(b),Object.getOwnPropertyNames(a.wrappers).forEach(function(b){window[b]=a.wrappers[b]})}(window.ShadowDOMPolyfill),function(a){function b(a,c){var d,e,f,g,h=a.firstElementChild;for(e=[],f=a.shadowRoot;f;)e.push(f),f=f.olderShadowRoot;for(g=e.length-1;g>=0;g--)if(d=e[g].querySelector(c))return d;for(;h;){if(d=b(h,c))return d;h=h.nextElementSibling}return null}function c(a,b,d){var e,f,g,h,i,j=a.firstElementChild;for(g=[],f=a.shadowRoot;f;)g.push(f),f=f.olderShadowRoot;for(h=g.length-1;h>=0;h--)for(e=g[h].querySelectorAll(b),i=0;i<e.length;i++)d.push(e[i]);for(;j;)c(j,b,d),j=j.nextElementSibling;return d}window.wrap=ShadowDOMPolyfill.wrapIfNeeded,window.unwrap=ShadowDOMPolyfill.unwrapIfNeeded,Object.defineProperty(Element.prototype,"webkitShadowRoot",Object.getOwnPropertyDescriptor(Element.prototype,"shadowRoot"));var d=Element.prototype.createShadowRoot;Element.prototype.createShadowRoot=function(){var a=d.call(this);return CustomElements.watchShadow(this),a},Element.prototype.webkitCreateShadowRoot=Element.prototype.createShadowRoot,a.queryAllShadows=function(a,d,e){return e?c(a,d,[]):b(a,d)}}(window.Platform),function(a){function b(a,b){var c="";return Array.prototype.forEach.call(a,function(a){c+=a.textContent+"\n\n"}),b||(c=c.replace(l,"")),c}function c(a){var b=document.createElement("style");return b.textContent=a,b}function d(a){var b=c(a);document.head.appendChild(b);var d=[];if(b.sheet)try{d=b.sheet.cssRules}catch(e){}else console.warn("sheet not found",b);return b.parentNode.removeChild(b),d}function e(){v.initialized=!0,document.body.appendChild(v);var a=v.contentDocument,b=a.createElement("base");b.href=document.baseURI,a.head.appendChild(b)}function f(a){v.initialized||e(),document.body.appendChild(v),a(v.contentDocument),document.body.removeChild(v)}function g(a,b){if(b){var e;if(a.match("@import")&&x){var g=c(a);f(function(a){a.head.appendChild(g.impl),e=Array.prototype.slice.call(g.sheet.cssRules,0),b(e)})}else e=d(a),b(e)}}function h(a){a&&j().appendChild(document.createTextNode(a))}function i(a,b){var d=c(a);d.setAttribute(b,""),d.setAttribute(z,""),document.head.appendChild(d)}function j(){return w||(w=document.createElement("style"),w.setAttribute(z,""),w[z]=!0),w}var k={strictStyling:!1,registry:{},shimStyling:function(a,c,d){var e=this.prepareRoot(a,c,d),f=this.isTypeExtension(d),g=this.makeScopeSelector(c,f),h=b(e,!0);h=this.scopeCssText(h,g),a&&(a.shimmedStyle=h),this.addCssToDocument(h,c)},shimStyle:function(a,b){return this.shimCssText(a.textContent,b)},shimCssText:function(a,b){return a=this.insertDirectives(a),this.scopeCssText(a,b)},makeScopeSelector:function(a,b){return a?b?"[is="+a+"]":a:""},isTypeExtension:function(a){return a&&a.indexOf("-")<0},prepareRoot:function(a,b,c){var d=this.registerRoot(a,b,c);return this.replaceTextInStyles(d.rootStyles,this.insertDirectives),this.removeStyles(a,d.rootStyles),this.strictStyling&&this.applyScopeToContent(a,b),d.scopeStyles},removeStyles:function(a,b){for(var c,d=0,e=b.length;e>d&&(c=b[d]);d++)c.parentNode.removeChild(c)},registerRoot:function(a,b,c){var d=this.registry[b]={root:a,name:b,extendsName:c},e=this.findStyles(a);d.rootStyles=e,d.scopeStyles=d.rootStyles;var f=this.registry[d.extendsName];return f&&(d.scopeStyles=f.scopeStyles.concat(d.scopeStyles)),d},findStyles:function(a){if(!a)return[];var b=a.querySelectorAll("style");return Array.prototype.filter.call(b,function(a){return!a.hasAttribute(A)})},applyScopeToContent:function(a,b){a&&(Array.prototype.forEach.call(a.querySelectorAll("*"),function(a){a.setAttribute(b,"")}),Array.prototype.forEach.call(a.querySelectorAll("template"),function(a){this.applyScopeToContent(a.content,b)},this))},insertDirectives:function(a){return a=this.insertPolyfillDirectivesInCssText(a),this.insertPolyfillRulesInCssText(a)},insertPolyfillDirectivesInCssText:function(a){return a=a.replace(m,function(a,b){return b.slice(0,-2)+"{"}),a.replace(n,function(a,b){return b+" {"})},insertPolyfillRulesInCssText:function(a){return a=a.replace(o,function(a,b){return b.slice(0,-1)}),a.replace(p,function(a,b,c,d){var e=a.replace(b,"").replace(c,"");return d+e})},scopeCssText:function(a,b){var c=this.extractUnscopedRulesFromCssText(a);if(a=this.insertPolyfillHostInCssText(a),a=this.convertColonHost(a),a=this.convertColonHostContext(a),a=this.convertShadowDOMSelectors(a),b){var a,d=this;g(a,function(c){a=d.scopeRules(c,b)})}return a=a+"\n"+c,a.trim()},extractUnscopedRulesFromCssText:function(a){for(var b,c="";b=q.exec(a);)c+=b[1].slice(0,-1)+"\n\n";for(;b=r.exec(a);)c+=b[0].replace(b[2],"").replace(b[1],b[3])+"\n\n";return c},convertColonHost:function(a){return this.convertColonRule(a,cssColonHostRe,this.colonHostPartReplacer)},convertColonHostContext:function(a){return this.convertColonRule(a,cssColonHostContextRe,this.colonHostContextPartReplacer)},convertColonRule:function(a,b,c){return a.replace(b,function(a,b,d,e){if(b=polyfillHostNoCombinator,d){for(var f,g=d.split(","),h=[],i=0,j=g.length;j>i&&(f=g[i]);i++)f=f.trim(),h.push(c(b,f,e));return h.join(",")}return b+e})},colonHostContextPartReplacer:function(a,b,c){return b.match(s)?this.colonHostPartReplacer(a,b,c):a+b+c+", "+b+" "+a+c},colonHostPartReplacer:function(a,b,c){return a+b.replace(s,"")+c},convertShadowDOMSelectors:function(a){for(var b=0;b<shadowDOMSelectorsRe.length;b++)a=a.replace(shadowDOMSelectorsRe[b]," ");return a},scopeRules:function(a,b){var c="";return a&&Array.prototype.forEach.call(a,function(a){if(a.selectorText&&a.style&&void 0!==a.style.cssText)c+=this.scopeSelector(a.selectorText,b,this.strictStyling)+" {\n	",c+=this.propertiesFromRule(a)+"\n}\n\n";else if(a.type===CSSRule.MEDIA_RULE)c+="@media "+a.media.mediaText+" {\n",c+=this.scopeRules(a.cssRules,b),c+="\n}\n\n";else try{a.cssText&&(c+=a.cssText+"\n\n")}catch(d){a.type===CSSRule.KEYFRAMES_RULE&&a.cssRules&&(c+=this.ieSafeCssTextFromKeyFrameRule(a))}},this),c},ieSafeCssTextFromKeyFrameRule:function(a){var b="@keyframes "+a.name+" {";return Array.prototype.forEach.call(a.cssRules,function(a){b+=" "+a.keyText+" {"+a.style.cssText+"}"}),b+=" }"},scopeSelector:function(a,b,c){var d=[],e=a.split(",");return e.forEach(function(a){a=a.trim(),this.selectorNeedsScoping(a,b)&&(a=c&&!a.match(polyfillHostNoCombinator)?this.applyStrictSelectorScope(a,b):this.applySelectorScope(a,b)),d.push(a)},this),d.join(", ")},selectorNeedsScoping:function(a,b){if(Array.isArray(b))return!0;var c=this.makeScopeMatcher(b);return!a.match(c)},makeScopeMatcher:function(a){return a=a.replace(/\[/g,"\\[").replace(/\[/g,"\\]"),new RegExp("^("+a+")"+selectorReSuffix,"m")},applySelectorScope:function(a,b){return Array.isArray(b)?this.applySelectorScopeList(a,b):this.applySimpleSelectorScope(a,b)},applySelectorScopeList:function(a,b){for(var c,d=[],e=0;c=b[e];e++)d.push(this.applySimpleSelectorScope(a,c));return d.join(", ")},applySimpleSelectorScope:function(a,b){return a.match(polyfillHostRe)?(a=a.replace(polyfillHostNoCombinator,b),a.replace(polyfillHostRe,b+" ")):b+" "+a},applyStrictSelectorScope:function(a,b){b=b.replace(/\[is=([^\]]*)\]/g,"$1");var c=[" ",">","+","~"],d=a,e="["+b+"]";return c.forEach(function(a){var b=d.split(a);d=b.map(function(a){var b=a.trim().replace(polyfillHostRe,"");return b&&c.indexOf(b)<0&&b.indexOf(e)<0&&(a=b.replace(/([^:]*)(:*)(.*)/,"$1"+e+"$2$3")),a}).join(a)}),d},insertPolyfillHostInCssText:function(a){return a.replace(colonHostContextRe,t).replace(colonHostRe,s)},propertiesFromRule:function(a){var b=a.style.cssText;a.style.content&&!a.style.content.match(/['"]+|attr/)&&(b=b.replace(/content:[^;]*;/g,"content: '"+a.style.content+"';"));var c=a.style;for(var d in c)"initial"===c[d]&&(b+=d+": initial; ");return b},replaceTextInStyles:function(a,b){a&&b&&(a instanceof Array||(a=[a]),Array.prototype.forEach.call(a,function(a){a.textContent=b.call(this,a.textContent)},this))},addCssToDocument:function(a,b){a.match("@import")?i(a,b):h(a)}},l=/\/\*[^*]*\*+([^/*][^*]*\*+)*\//gim,m=/\/\*\s*@polyfill ([^*]*\*+([^/*][^*]*\*+)*\/)([^{]*?){/gim,n=/polyfill-next-selector[^}]*content\:[\s]*?['"](.*?)['"][;\s]*}([^{]*?){/gim,o=/\/\*\s@polyfill-rule([^*]*\*+([^/*][^*]*\*+)*)\//gim,p=/(polyfill-rule)[^}]*(content\:[\s]*['"](.*?)['"])[;\s]*[^}]*}/gim,q=/\/\*\s@polyfill-unscoped-rule([^*]*\*+([^/*][^*]*\*+)*)\//gim,r=/(polyfill-unscoped-rule)[^}]*(content\:[\s]*['"](.*?)['"])[;\s]*[^}]*}/gim,s="-shadowcsshost",t="-shadowcsscontext",u=")(?:\\(((?:\\([^)(]*\\)|[^)(]*)+?)\\))?([^,{]*)";cssColonHostRe=new RegExp("("+s+u,"gim"),cssColonHostContextRe=new RegExp("("+t+u,"gim"),selectorReSuffix="([>\\s~+[.,{:][\\s\\S]*)?$",colonHostRe=/\:host/gim,colonHostContextRe=/\:host-context/gim,polyfillHostNoCombinator=s+"-no-combinator",polyfillHostRe=new RegExp(s,"gim"),polyfillHostContextRe=new RegExp(t,"gim"),shadowDOMSelectorsRe=[/\^\^/g,/\^/g,/\/shadow\//g,/\/shadow-deep\//g,/::shadow/g,/\/deep\//g,/::content/g];var v=document.createElement("iframe");v.style.display="none";var w,x=navigator.userAgent.match("Chrome"),y="shim-shadowdom",z="shim-shadowdom-css",A="no-shim";if(window.ShadowDOMPolyfill){h("style { display: none !important; }\n");var B=wrap(document),C=B.querySelector("head");C.insertBefore(j(),C.childNodes[0]),document.addEventListener("DOMContentLoaded",function(){a.urlResolver;if(window.HTMLImports&&!HTMLImports.useNative){var b="link[rel=stylesheet]["+y+"]",c="style["+y+"]";HTMLImports.importer.documentPreloadSelectors+=","+b,HTMLImports.importer.importsPreloadSelectors+=","+b,HTMLImports.parser.documentSelectors=[HTMLImports.parser.documentSelectors,b,c].join(",");var d=HTMLImports.parser.parseGeneric;HTMLImports.parser.parseGeneric=function(a){if(!a[z]){var b=a.__importElement||a;if(!b.hasAttribute(y))return void d.call(this,a);a.__resource&&(b=a.ownerDocument.createElement("style"),b.textContent=a.__resource),HTMLImports.path.resolveUrlsInStyle(b),b.textContent=k.shimStyle(b),b.removeAttribute(y,""),b.setAttribute(z,""),b[z]=!0,b.parentNode!==C&&(a.parentNode===C?C.replaceChild(b,a):this.addElementToDocument(b)),b.__importParsed=!0,this.markParsingComplete(a),this.parseNext()}};var e=HTMLImports.parser.hasResource;HTMLImports.parser.hasResource=function(a){return"link"===a.localName&&"stylesheet"===a.rel&&a.hasAttribute(y)?a.__resource:e.call(this,a)}}})}a.ShadowCSS=k}(window.Platform)):!function(){window.wrap=window.unwrap=function(a){return a},addEventListener("DOMContentLoaded",function(){if(CustomElements.useNative===!1){var a=Element.prototype.createShadowRoot;Element.prototype.createShadowRoot=function(){var b=a.call(this);return CustomElements.watchShadow(this),b}}})}(window.Platform),function(a){"use strict";function b(a){return void 0!==m[a]}function c(){h.call(this),this._isInvalid=!0}function d(a){return""==a&&c.call(this),a.toLowerCase()}function e(a){var b=a.charCodeAt(0);return b>32&&127>b&&-1==[34,35,60,62,63,96].indexOf(b)?a:encodeURIComponent(a)}function f(a){var b=a.charCodeAt(0);return b>32&&127>b&&-1==[34,35,60,62,96].indexOf(b)?a:encodeURIComponent(a)}function g(a,g,h){function i(a){t.push(a)}var j=g||"scheme start",k=0,l="",r=!1,s=!1,t=[];a:for(;(a[k-1]!=o||0==k)&&!this._isInvalid;){var u=a[k];switch(j){case"scheme start":if(!u||!p.test(u)){if(g){i("Invalid scheme.");break a}l="",j="no scheme";continue}l+=u.toLowerCase(),j="scheme";break;case"scheme":if(u&&q.test(u))l+=u.toLowerCase();else{if(":"!=u){if(g){if(o==u)break a;i("Code point not allowed in scheme: "+u);break a}l="",k=0,j="no scheme";continue}if(this._scheme=l,l="",g)break a;b(this._scheme)&&(this._isRelative=!0),j="file"==this._scheme?"relative":this._isRelative&&h&&h._scheme==this._scheme?"relative or authority":this._isRelative?"authority first slash":"scheme data"}break;case"scheme data":"?"==u?(query="?",j="query"):"#"==u?(this._fragment="#",j="fragment"):o!=u&&"	"!=u&&"\n"!=u&&"\r"!=u&&(this._schemeData+=e(u));break;case"no scheme":if(h&&b(h._scheme)){j="relative";continue}i("Missing scheme."),c.call(this);break;case"relative or authority":if("/"!=u||"/"!=a[k+1]){i("Expected /, got: "+u),j="relative";continue}j="authority ignore slashes";break;case"relative":if(this._isRelative=!0,"file"!=this._scheme&&(this._scheme=h._scheme),o==u){this._host=h._host,this._port=h._port,this._path=h._path.slice(),this._query=h._query;break a}if("/"==u||"\\"==u)"\\"==u&&i("\\ is an invalid code point."),j="relative slash";else if("?"==u)this._host=h._host,this._port=h._port,this._path=h._path.slice(),this._query="?",j="query";
else{if("#"!=u){var v=a[k+1],w=a[k+2];("file"!=this._scheme||!p.test(u)||":"!=v&&"|"!=v||o!=w&&"/"!=w&&"\\"!=w&&"?"!=w&&"#"!=w)&&(this._host=h._host,this._port=h._port,this._path=h._path.slice(),this._path.pop()),j="relative path";continue}this._host=h._host,this._port=h._port,this._path=h._path.slice(),this._query=h._query,this._fragment="#",j="fragment"}break;case"relative slash":if("/"!=u&&"\\"!=u){"file"!=this._scheme&&(this._host=h._host,this._port=h._port),j="relative path";continue}"\\"==u&&i("\\ is an invalid code point."),j="file"==this._scheme?"file host":"authority ignore slashes";break;case"authority first slash":if("/"!=u){i("Expected '/', got: "+u),j="authority ignore slashes";continue}j="authority second slash";break;case"authority second slash":if(j="authority ignore slashes","/"!=u){i("Expected '/', got: "+u);continue}break;case"authority ignore slashes":if("/"!=u&&"\\"!=u){j="authority";continue}i("Expected authority, got: "+u);break;case"authority":if("@"==u){r&&(i("@ already seen."),l+="%40"),r=!0;for(var x=0;x<l.length;x++){var y=l[x];if("	"!=y&&"\n"!=y&&"\r"!=y)if(":"!=y||null!==this._password){var z=e(y);null!==this._password?this._password+=z:this._username+=z}else this._password="";else i("Invalid whitespace in authority.")}l=""}else{if(o==u||"/"==u||"\\"==u||"?"==u||"#"==u){k-=l.length,l="",j="host";continue}l+=u}break;case"file host":if(o==u||"/"==u||"\\"==u||"?"==u||"#"==u){2!=l.length||!p.test(l[0])||":"!=l[1]&&"|"!=l[1]?0==l.length?j="relative path start":(this._host=d.call(this,l),l="",j="relative path start"):j="relative path";continue}"	"==u||"\n"==u||"\r"==u?i("Invalid whitespace in file host."):l+=u;break;case"host":case"hostname":if(":"!=u||s){if(o==u||"/"==u||"\\"==u||"?"==u||"#"==u){if(this._host=d.call(this,l),l="",j="relative path start",g)break a;continue}"	"!=u&&"\n"!=u&&"\r"!=u?("["==u?s=!0:"]"==u&&(s=!1),l+=u):i("Invalid code point in host/hostname: "+u)}else if(this._host=d.call(this,l),l="",j="port","hostname"==g)break a;break;case"port":if(/[0-9]/.test(u))l+=u;else{if(o==u||"/"==u||"\\"==u||"?"==u||"#"==u||g){if(""!=l){var A=parseInt(l,10);A!=m[this._scheme]&&(this._port=A+""),l=""}if(g)break a;j="relative path start";continue}"	"==u||"\n"==u||"\r"==u?i("Invalid code point in port: "+u):c.call(this)}break;case"relative path start":if("\\"==u&&i("'\\' not allowed in path."),j="relative path","/"!=u&&"\\"!=u)continue;break;case"relative path":if(o!=u&&"/"!=u&&"\\"!=u&&(g||"?"!=u&&"#"!=u))"	"!=u&&"\n"!=u&&"\r"!=u&&(l+=e(u));else{"\\"==u&&i("\\ not allowed in relative path.");var B;(B=n[l.toLowerCase()])&&(l=B),".."==l?(this._path.pop(),"/"!=u&&"\\"!=u&&this._path.push("")):"."==l&&"/"!=u&&"\\"!=u?this._path.push(""):"."!=l&&("file"==this._scheme&&0==this._path.length&&2==l.length&&p.test(l[0])&&"|"==l[1]&&(l=l[0]+":"),this._path.push(l)),l="","?"==u?(this._query="?",j="query"):"#"==u&&(this._fragment="#",j="fragment")}break;case"query":g||"#"!=u?o!=u&&"	"!=u&&"\n"!=u&&"\r"!=u&&(this._query+=f(u)):(this._fragment="#",j="fragment");break;case"fragment":o!=u&&"	"!=u&&"\n"!=u&&"\r"!=u&&(this._fragment+=u)}k++}}function h(){this._scheme="",this._schemeData="",this._username="",this._password=null,this._host="",this._port="",this._path=[],this._query="",this._fragment="",this._isInvalid=!1,this._isRelative=!1}function i(a,b){void 0===b||b instanceof i||(b=new i(String(b))),this._url=a,h.call(this);var c=a.replace(/^[ \t\r\n\f]+|[ \t\r\n\f]+$/g,"");g.call(this,c,null,b)}var j=!1;if(!a.forceJURL)try{var k=new URL("b","http://a");j="http://a/b"===k.href}catch(l){}if(!j){var m=Object.create(null);m.ftp=21,m.file=0,m.gopher=70,m.http=80,m.https=443,m.ws=80,m.wss=443;var n=Object.create(null);n["%2e"]=".",n[".%2e"]="..",n["%2e."]="..",n["%2e%2e"]="..";var o=void 0,p=/[a-zA-Z]/,q=/[a-zA-Z0-9\+\-\.]/;i.prototype={get href(){if(this._isInvalid)return this._url;var a="";return(""!=this._username||null!=this._password)&&(a=this._username+(null!=this._password?":"+this._password:"")+"@"),this.protocol+(this._isRelative?"//"+a+this.host:"")+this.pathname+this._query+this._fragment},set href(a){h.call(this),g.call(this,a)},get protocol(){return this._scheme+":"},set protocol(a){this._isInvalid||g.call(this,a+":","scheme start")},get host(){return this._isInvalid?"":this._port?this._host+":"+this._port:this._host},set host(a){!this._isInvalid&&this._isRelative&&g.call(this,a,"host")},get hostname(){return this._host},set hostname(a){!this._isInvalid&&this._isRelative&&g.call(this,a,"hostname")},get port(){return this._port},set port(a){!this._isInvalid&&this._isRelative&&g.call(this,a,"port")},get pathname(){return this._isInvalid?"":this._isRelative?"/"+this._path.join("/"):this._schemeData},set pathname(a){!this._isInvalid&&this._isRelative&&(this._path=[],g.call(this,a,"relative path start"))},get search(){return this._isInvalid||!this._query||"?"==this._query?"":this._query},set search(a){!this._isInvalid&&this._isRelative&&(this._query="?","?"==a[0]&&(a=a.slice(1)),g.call(this,a,"query"))},get hash(){return this._isInvalid||!this._fragment||"#"==this._fragment?"":this._fragment},set hash(a){this._isInvalid||(this._fragment="#","#"==a[0]&&(a=a.slice(1)),g.call(this,a,"fragment"))},get origin(){var a;if(this._isInvalid||!this._scheme)return"";switch(this._scheme){case"data":case"file":case"javascript":case"mailto":return"null"}return a=this.host,a?this._scheme+"://"+a:""}};var r=a.URL;r&&(i.createObjectURL=function(){return r.createObjectURL.apply(r,arguments)},i.revokeObjectURL=function(a){r.revokeObjectURL(a)}),a.URL=i}}(this),function(){Function.prototype.bind||(Function.prototype.bind=function(a){var b=this,c=Array.prototype.slice.call(arguments,1);return function(){var d=c.slice();return d.push.apply(d,arguments),b.apply(a,d)}})}(window.Platform),function(a){function b(a){u.push(a),t||(t=!0,q(d))}function c(a){return window.ShadowDOMPolyfill&&window.ShadowDOMPolyfill.wrapIfNeeded(a)||a}function d(){t=!1;var a=u;u=[],a.sort(function(a,b){return a.uid_-b.uid_});var b=!1;a.forEach(function(a){var c=a.takeRecords();e(a),c.length&&(a.callback_(c,a),b=!0)}),b&&d()}function e(a){a.nodes_.forEach(function(b){var c=p.get(b);c&&c.forEach(function(b){b.observer===a&&b.removeTransientObservers()})})}function f(a,b){for(var c=a;c;c=c.parentNode){var d=p.get(c);if(d)for(var e=0;e<d.length;e++){var f=d[e],g=f.options;if(c===a||g.subtree){var h=b(g);h&&f.enqueue(h)}}}}function g(a){this.callback_=a,this.nodes_=[],this.records_=[],this.uid_=++v}function h(a,b){this.type=a,this.target=b,this.addedNodes=[],this.removedNodes=[],this.previousSibling=null,this.nextSibling=null,this.attributeName=null,this.attributeNamespace=null,this.oldValue=null}function i(a){var b=new h(a.type,a.target);return b.addedNodes=a.addedNodes.slice(),b.removedNodes=a.removedNodes.slice(),b.previousSibling=a.previousSibling,b.nextSibling=a.nextSibling,b.attributeName=a.attributeName,b.attributeNamespace=a.attributeNamespace,b.oldValue=a.oldValue,b}function j(a,b){return w=new h(a,b)}function k(a){return x?x:(x=i(w),x.oldValue=a,x)}function l(){w=x=void 0}function m(a){return a===x||a===w}function n(a,b){return a===b?a:x&&m(a)?x:null}function o(a,b,c){this.observer=a,this.target=b,this.options=c,this.transientObservedNodes=[]}var p=new WeakMap,q=window.msSetImmediate;if(!q){var r=[],s=String(Math.random());window.addEventListener("message",function(a){if(a.data===s){var b=r;r=[],b.forEach(function(a){a()})}}),q=function(a){r.push(a),window.postMessage(s,"*")}}var t=!1,u=[],v=0;g.prototype={observe:function(a,b){if(a=c(a),!b.childList&&!b.attributes&&!b.characterData||b.attributeOldValue&&!b.attributes||b.attributeFilter&&b.attributeFilter.length&&!b.attributes||b.characterDataOldValue&&!b.characterData)throw new SyntaxError;var d=p.get(a);d||p.set(a,d=[]);for(var e,f=0;f<d.length;f++)if(d[f].observer===this){e=d[f],e.removeListeners(),e.options=b;break}e||(e=new o(this,a,b),d.push(e),this.nodes_.push(a)),e.addListeners()},disconnect:function(){this.nodes_.forEach(function(a){for(var b=p.get(a),c=0;c<b.length;c++){var d=b[c];if(d.observer===this){d.removeListeners(),b.splice(c,1);break}}},this),this.records_=[]},takeRecords:function(){var a=this.records_;return this.records_=[],a}};var w,x;o.prototype={enqueue:function(a){var c=this.observer.records_,d=c.length;if(c.length>0){var e=c[d-1],f=n(e,a);if(f)return void(c[d-1]=f)}else b(this.observer);c[d]=a},addListeners:function(){this.addListeners_(this.target)},addListeners_:function(a){var b=this.options;b.attributes&&a.addEventListener("DOMAttrModified",this,!0),b.characterData&&a.addEventListener("DOMCharacterDataModified",this,!0),b.childList&&a.addEventListener("DOMNodeInserted",this,!0),(b.childList||b.subtree)&&a.addEventListener("DOMNodeRemoved",this,!0)},removeListeners:function(){this.removeListeners_(this.target)},removeListeners_:function(a){var b=this.options;b.attributes&&a.removeEventListener("DOMAttrModified",this,!0),b.characterData&&a.removeEventListener("DOMCharacterDataModified",this,!0),b.childList&&a.removeEventListener("DOMNodeInserted",this,!0),(b.childList||b.subtree)&&a.removeEventListener("DOMNodeRemoved",this,!0)},addTransientObserver:function(a){if(a!==this.target){this.addListeners_(a),this.transientObservedNodes.push(a);var b=p.get(a);b||p.set(a,b=[]),b.push(this)}},removeTransientObservers:function(){var a=this.transientObservedNodes;this.transientObservedNodes=[],a.forEach(function(a){this.removeListeners_(a);for(var b=p.get(a),c=0;c<b.length;c++)if(b[c]===this){b.splice(c,1);break}},this)},handleEvent:function(a){switch(a.stopImmediatePropagation(),a.type){case"DOMAttrModified":var b=a.attrName,c=a.relatedNode.namespaceURI,d=a.target,e=new j("attributes",d);e.attributeName=b,e.attributeNamespace=c;var g=a.attrChange===MutationEvent.ADDITION?null:a.prevValue;f(d,function(a){return!a.attributes||a.attributeFilter&&a.attributeFilter.length&&-1===a.attributeFilter.indexOf(b)&&-1===a.attributeFilter.indexOf(c)?void 0:a.attributeOldValue?k(g):e});break;case"DOMCharacterDataModified":var d=a.target,e=j("characterData",d),g=a.prevValue;f(d,function(a){return a.characterData?a.characterDataOldValue?k(g):e:void 0});break;case"DOMNodeRemoved":this.addTransientObserver(a.target);case"DOMNodeInserted":var h,i,d=a.relatedNode,m=a.target;"DOMNodeInserted"===a.type?(h=[m],i=[]):(h=[],i=[m]);var n=m.previousSibling,o=m.nextSibling,e=j("childList",d);e.addedNodes=h,e.removedNodes=i,e.previousSibling=n,e.nextSibling=o,f(d,function(a){return a.childList?e:void 0})}l()}},a.JsMutationObserver=g,a.MutationObserver||(a.MutationObserver=g)}(this),window.HTMLImports=window.HTMLImports||{flags:{}},function(a){function b(a,b){b=b||q,d(function(){f(a,b)},b)}function c(a){return"complete"===a.readyState||a.readyState===s}function d(a,b){if(c(b))a&&a();else{var e=function(){("complete"===b.readyState||b.readyState===s)&&(b.removeEventListener(t,e),d(a,b))};b.addEventListener(t,e)}}function e(a){a.target.__loaded=!0}function f(a,b){function c(){h==i&&a&&a()}function d(a){e(a),h++,c()}var f=b.querySelectorAll("link[rel=import]"),h=0,i=f.length;if(i)for(var j,k=0;i>k&&(j=f[k]);k++)g(j)?d.call(j,{target:j}):(j.addEventListener("load",d),j.addEventListener("error",d));else c()}function g(a){return m?a.__loaded||a.import&&"loading"!==a.import.readyState:a.__importParsed}function h(a){for(var b,c=0,d=a.length;d>c&&(b=a[c]);c++)i(b)&&j(b)}function i(a){return"link"===a.localName&&"import"===a.rel}function j(a){var b=a.import;b?e({target:a}):(a.addEventListener("load",e),a.addEventListener("error",e))}var k="import",l=k in document.createElement("link"),m=l,n=/Trident/.test(navigator.userAgent),o=Boolean(window.ShadowDOMPolyfill),p=function(a){return o?ShadowDOMPolyfill.wrapIfNeeded(a):a},q=p(document),r={get:function(){var a=HTMLImports.currentScript||document.currentScript||("complete"!==document.readyState?document.scripts[document.scripts.length-1]:null);return p(a)},configurable:!0};Object.defineProperty(document,"_currentScript",r),Object.defineProperty(q,"_currentScript",r);var s=n?"complete":"interactive",t="readystatechange";m&&(new MutationObserver(function(a){for(var b,c=0,d=a.length;d>c&&(b=a[c]);c++)b.addedNodes&&h(b.addedNodes)}).observe(document.head,{childList:!0}),function(){if("loading"===document.readyState)for(var a,b=document.querySelectorAll("link[rel=import]"),c=0,d=b.length;d>c&&(a=b[c]);c++)j(a)}()),b(function(){HTMLImports.ready=!0,HTMLImports.readyTime=(new Date).getTime(),q.dispatchEvent(new CustomEvent("HTMLImportsLoaded",{bubbles:!0}))}),a.useNative=m,a.isImportLoaded=g,a.whenReady=b,a.rootDocument=q,a.IMPORT_LINK_TYPE=k,a.isIE=n}(window.HTMLImports),function(a){var b=(a.path,a.xhr),c=a.flags,d=function(a,b){this.cache={},this.onload=a,this.oncomplete=b,this.inflight=0,this.pending={}};d.prototype={addNodes:function(a){this.inflight+=a.length;for(var b,c=0,d=a.length;d>c&&(b=a[c]);c++)this.require(b);this.checkDone()},addNode:function(a){this.inflight++,this.require(a),this.checkDone()},require:function(a){var b=a.src||a.href;a.__nodeUrl=b,this.dedupe(b,a)||this.fetch(b,a)},dedupe:function(a,b){if(this.pending[a])return this.pending[a].push(b),!0;return this.cache[a]?(this.onload(a,b,this.cache[a]),this.tail(),!0):(this.pending[a]=[b],!1)},fetch:function(a,d){if(c.load&&console.log("fetch",a,d),a.match(/^data:/)){var e=a.split(","),f=e[0],g=e[1];g=f.indexOf(";base64")>-1?atob(g):decodeURIComponent(g),setTimeout(function(){this.receive(a,d,null,g)}.bind(this),0)}else{var h=function(b,c,e){this.receive(a,d,b,c,e)}.bind(this);b.load(a,h)}},receive:function(a,b,c,d,e){this.cache[a]=d;for(var f,g=this.pending[a],h=0,i=g.length;i>h&&(f=g[h]);h++)this.onload(a,f,d,c,e),this.tail();this.pending[a]=null},tail:function(){--this.inflight,this.checkDone()},checkDone:function(){this.inflight||this.oncomplete()}},b=b||{async:!0,ok:function(a){return a.status>=200&&a.status<300||304===a.status||0===a.status},load:function(c,d,e){var f=new XMLHttpRequest;return(a.flags.debug||a.flags.bust)&&(c+="?"+Math.random()),f.open("GET",c,b.async),f.addEventListener("readystatechange",function(){if(4===f.readyState){var a=f.getResponseHeader("Location"),c=null;if(a)var c="/"===a.substr(0,1)?location.origin+a:a;d.call(e,!b.ok(f)&&f,f.response||f.responseText,c)}}),f.send(),f},loadDocument:function(a,b,c){this.load(a,b,c).responseType="document"}},a.xhr=b,a.Loader=d}(window.HTMLImports),function(a){function b(a){return"link"===a.localName&&a.rel===j}function c(a){var b=d(a);return"data:text/javascript;charset=utf-8,"+encodeURIComponent(b)}function d(a){return a.textContent+e(a)}function e(a){var b=a.__nodeUrl;if(!b){b=a.ownerDocument.baseURI;var c="["+Math.floor(1e3*(Math.random()+1))+"]",d=a.textContent.match(/Polymer\(['"]([^'"]*)/);c=d&&d[1]||c,b+="/"+c+".js"}return"\n//# sourceURL="+b+"\n"}function f(a){var b=a.ownerDocument.createElement("style");return b.textContent=a.textContent,n.resolveUrlsInStyle(b),b}var g=a.rootDocument,h=a.flags,i=a.isIE,j=a.IMPORT_LINK_TYPE,k={documentSelectors:"link[rel="+j+"]",importsSelectors:["link[rel="+j+"]","link[rel=stylesheet]","style","script:not([type])",'script[type="text/javascript"]'].join(","),map:{link:"parseLink",script:"parseScript",style:"parseStyle"},dynamicElements:[],parseNext:function(){var a=this.nextToParse();a&&this.parse(a)},parse:function(a){if(this.isParsed(a))return void(h.parse&&console.log("[%s] is already parsed",a.localName));var b=this[this.map[a.localName]];b&&(this.markParsing(a),b.call(this,a))},parseDynamic:function(a,b){this.dynamicElements.push(a),b||this.parseNext()},markParsing:function(a){h.parse&&console.log("parsing",a),this.parsingElement=a},markParsingComplete:function(a){a.__importParsed=!0,this.markDynamicParsingComplete(a),a.__importElement&&(a.__importElement.__importParsed=!0,this.markDynamicParsingComplete(a.__importElement)),this.parsingElement=null,h.parse&&console.log("completed",a)},markDynamicParsingComplete:function(a){var b=this.dynamicElements.indexOf(a);b>=0&&this.dynamicElements.splice(b,1)},parseImport:function(a){if(HTMLImports.__importsParsingHook&&HTMLImports.__importsParsingHook(a),a.import&&(a.import.__importParsed=!0),this.markParsingComplete(a),a.dispatchEvent(a.__resource&&!a.__error?new CustomEvent("load",{bubbles:!1}):new CustomEvent("error",{bubbles:!1})),a.__pending)for(var b;a.__pending.length;)b=a.__pending.shift(),b&&b({target:a});this.parseNext()},parseLink:function(a){b(a)?this.parseImport(a):(a.href=a.href,this.parseGeneric(a))},parseStyle:function(a){var b=a;a=f(a),a.__importElement=b,this.parseGeneric(a)},parseGeneric:function(a){this.trackElement(a),this.addElementToDocument(a)},rootImportForElement:function(a){for(var b=a;b.ownerDocument.__importLink;)b=b.ownerDocument.__importLink;return b},addElementToDocument:function(a){for(var b=this.rootImportForElement(a.__importElement||a),c=b.__insertedElements=b.__insertedElements||0,d=b.nextElementSibling,e=0;c>e;e++)d=d&&d.nextElementSibling;b.parentNode.insertBefore(a,d)},trackElement:function(a,b){var c=this,d=function(d){b&&b(d),c.markParsingComplete(a),c.parseNext()};if(a.addEventListener("load",d),a.addEventListener("error",d),i&&"style"===a.localName){var e=!1;if(-1==a.textContent.indexOf("@import"))e=!0;else if(a.sheet){e=!0;for(var f,g=a.sheet.cssRules,h=g?g.length:0,j=0;h>j&&(f=g[j]);j++)f.type===CSSRule.IMPORT_RULE&&(e=e&&Boolean(f.styleSheet))}e&&a.dispatchEvent(new CustomEvent("load",{bubbles:!1}))}},parseScript:function(b){var d=document.createElement("script");d.__importElement=b,d.src=b.src?b.src:c(b),a.currentScript=b,this.trackElement(d,function(){d.parentNode.removeChild(d),a.currentScript=null}),this.addElementToDocument(d)},nextToParse:function(){return this._mayParse=[],!this.parsingElement&&(this.nextToParseInDoc(g)||this.nextToParseDynamic())},nextToParseInDoc:function(a,c){if(a&&this._mayParse.indexOf(a)<0){this._mayParse.push(a);for(var d,e=a.querySelectorAll(this.parseSelectorsForNode(a)),f=0,g=e.length;g>f&&(d=e[f]);f++)if(!this.isParsed(d))return this.hasResource(d)?b(d)?this.nextToParseInDoc(d.import,d):d:void 0}return c},nextToParseDynamic:function(){return this.dynamicElements[0]},parseSelectorsForNode:function(a){var b=a.ownerDocument||a;return b===g?this.documentSelectors:this.importsSelectors},isParsed:function(a){return a.__importParsed},needsDynamicParsing:function(a){return this.dynamicElements.indexOf(a)>=0},hasResource:function(a){return b(a)&&void 0===a.import?!1:!0}},l=/(url\()([^)]*)(\))/g,m=/(@import[\s]+(?!url\())([^;]*)(;)/g,n={resolveUrlsInStyle:function(a){var b=a.ownerDocument,c=b.createElement("a");return a.textContent=this.resolveUrlsInCssText(a.textContent,c),a},resolveUrlsInCssText:function(a,b){var c=this.replaceUrls(a,b,l);return c=this.replaceUrls(c,b,m)},replaceUrls:function(a,b,c){return a.replace(c,function(a,c,d,e){var f=d.replace(/["']/g,"");return b.href=f,f=b.href,c+"'"+f+"'"+e})}};a.parser=k,a.path=n}(HTMLImports),function(a){function b(a){return c(a,g)}function c(a,b){return"link"===a.localName&&a.getAttribute("rel")===b}function d(a,b){var c=a;c instanceof Document||(c=document.implementation.createHTMLDocument(g)),c._URL=b;var d=c.createElement("base");d.setAttribute("href",b),c.baseURI||(c.baseURI=b);var e=c.createElement("meta");return e.setAttribute("charset","utf-8"),c.head.appendChild(e),c.head.appendChild(d),a instanceof Document||(c.body.innerHTML=a),window.HTMLTemplateElement&&HTMLTemplateElement.bootstrap&&HTMLTemplateElement.bootstrap(c),c}var e=a.useNative,f=a.flags,g=a.IMPORT_LINK_TYPE;if(e)var h={};else{var i=a.rootDocument,j=(a.xhr,a.Loader),k=a.parser,h={documents:{},documentPreloadSelectors:"link[rel="+g+"]",importsPreloadSelectors:["link[rel="+g+"]"].join(","),loadNode:function(a){l.addNode(a)},loadSubtree:function(a){var b=this.marshalNodes(a);l.addNodes(b)},marshalNodes:function(a){return a.querySelectorAll(this.loadSelectorsForNode(a))},loadSelectorsForNode:function(a){var b=a.ownerDocument||a;return b===i?this.documentPreloadSelectors:this.importsPreloadSelectors},loaded:function(a,c,e,g,h){if(f.load&&console.log("loaded",a,c),c.__resource=e,c.__error=g,b(c)){var i=this.documents[a];void 0===i&&(i=g?null:d(e,h||a),i&&(i.__importLink=c,this.bootDocument(i)),this.documents[a]=i),c.import=i}k.parseNext()},bootDocument:function(a){this.loadSubtree(a),this.observe(a),k.parseNext()},loadedAll:function(){k.parseNext()}},l=new j(h.loaded.bind(h),h.loadedAll.bind(h));if(!document.baseURI){var m={get:function(){var a=document.querySelector("base");return a?a.href:window.location.href},configurable:!0};Object.defineProperty(document,"baseURI",m),Object.defineProperty(i,"baseURI",m)}"function"!=typeof window.CustomEvent&&(window.CustomEvent=function(a,b){var c=document.createEvent("HTMLEvents");return c.initEvent(a,b.bubbles===!1?!1:!0,b.cancelable===!1?!1:!0,b.detail),c})}a.importer=h,a.IMPORT_LINK_TYPE=g,a.importLoader=l}(window.HTMLImports),function(a){function b(a){for(var b,d=0,e=a.length;e>d&&(b=a[d]);d++)"childList"===b.type&&b.addedNodes.length&&c(b.addedNodes)}function c(a){for(var b,f,i,j,k=0,l=a.length;l>k&&(i=a[k]);k++)b||(b=i.ownerDocument,f=h.isParsed(b)),j=d(i),j&&g.loadNode(i),e(i)&&f&&h.parseDynamic(i,j),i.children&&i.children.length&&c(i.children)}function d(a){return 1===a.nodeType&&i.call(a,g.loadSelectorsForNode(a))}function e(a){return 1===a.nodeType&&i.call(a,h.parseSelectorsForNode(a))}function f(a){j.observe(a,{childList:!0,subtree:!0})}var g=(a.IMPORT_LINK_TYPE,a.importer),h=a.parser,i=HTMLElement.prototype.matches||HTMLElement.prototype.matchesSelector||HTMLElement.prototype.webkitMatchesSelector||HTMLElement.prototype.mozMatchesSelector||HTMLElement.prototype.msMatchesSelector,j=new MutationObserver(b);a.observe=f,g.observe=f}(HTMLImports),function(){function a(){HTMLImports.importer.bootDocument(b)}var b=window.ShadowDOMPolyfill?window.ShadowDOMPolyfill.wrapIfNeeded(document):document;HTMLImports.useNative||("complete"===document.readyState||"interactive"===document.readyState&&!window.attachEvent?a():document.addEventListener("DOMContentLoaded",a))}(),window.CustomElements=window.CustomElements||{flags:{}},function(a){function b(a,c,d){var e=a.firstElementChild;if(!e)for(e=a.firstChild;e&&e.nodeType!==Node.ELEMENT_NODE;)e=e.nextSibling;for(;e;)c(e,d)!==!0&&b(e,c,d),e=e.nextElementSibling;return null}function c(a,b){for(var c=a.shadowRoot;c;)d(c,b),c=c.olderShadowRoot}function d(a,d){b(a,function(a){return d(a)?!0:void c(a,d)}),c(a,d)}function e(a){return h(a)?(i(a),!0):void l(a)}function f(a){d(a,function(a){return e(a)?!0:void 0})}function g(a){return e(a)||f(a)}function h(b){if(!b.__upgraded__&&b.nodeType===Node.ELEMENT_NODE){var c=b.getAttribute("is")||b.localName,d=a.registry[c];if(d)return B.dom&&console.group("upgrade:",b.localName),a.upgrade(b),B.dom&&console.groupEnd(),!0}}function i(a){l(a),r(a)&&d(a,function(a){l(a)})}function j(a){if(G.push(a),!F){F=!0;var b=window.Platform&&window.Platform.endOfMicrotask||setTimeout;b(k)}}function k(){F=!1;for(var a,b=G,c=0,d=b.length;d>c&&(a=b[c]);c++)a();G=[]}function l(a){D?j(function(){m(a)}):m(a)}function m(a){(a.attachedCallback||a.detachedCallback||a.__upgraded__&&B.dom)&&(B.dom&&console.group("inserted:",a.localName),r(a)&&(a.__inserted=(a.__inserted||0)+1,a.__inserted<1&&(a.__inserted=1),a.__inserted>1?B.dom&&console.warn("inserted:",a.localName,"insert/remove count:",a.__inserted):a.attachedCallback&&(B.dom&&console.log("inserted:",a.localName),a.attachedCallback())),B.dom&&console.groupEnd())}function n(a){o(a),d(a,function(a){o(a)})}function o(a){D?j(function(){p(a)}):p(a)}function p(a){(a.attachedCallback||a.detachedCallback||a.__upgraded__&&B.dom)&&(B.dom&&console.group("removed:",a.localName),r(a)||(a.__inserted=(a.__inserted||0)-1,a.__inserted>0&&(a.__inserted=0),a.__inserted<0?B.dom&&console.warn("removed:",a.localName,"insert/remove count:",a.__inserted):a.detachedCallback&&a.detachedCallback()),B.dom&&console.groupEnd())}function q(a){return window.ShadowDOMPolyfill?ShadowDOMPolyfill.wrapIfNeeded(a):a}function r(a){for(var b=a,c=q(document);b;){if(b==c)return!0;b=b.parentNode||b.host}}function s(a){if(a.shadowRoot&&!a.shadowRoot.__watched){B.dom&&console.log("watching shadow-root for: ",a.localName);for(var b=a.shadowRoot;b;)t(b),b=b.olderShadowRoot}}function t(a){w(a)}function u(a){if(B.dom){var b=a[0];if(b&&"childList"===b.type&&b.addedNodes&&b.addedNodes){for(var c=b.addedNodes[0];c&&c!==document&&!c.host;)c=c.parentNode;var d=c&&(c.URL||c._URL||c.host&&c.host.localName)||"";d=d.split("/?").shift().split("/").pop()}console.group("mutations (%d) [%s]",a.length,d||"")}a.forEach(function(a){"childList"===a.type&&(H(a.addedNodes,function(a){a.localName&&g(a)}),H(a.removedNodes,function(a){a.localName&&n(a)}))}),B.dom&&console.groupEnd()}function v(a){for(a||(a=q(document));a.parentNode;)a=a.parentNode;var b=a.__observer;b&&(u(b.takeRecords()),k())}function w(a){if(!a.__observer){var b=new MutationObserver(u);b.observe(a,{childList:!0,subtree:!0}),a.__observer=b}}function x(a){w(a)}function y(a){B.dom&&console.group("upgradeDocument: ",a.baseURI.split("/").pop()),g(a),B.dom&&console.groupEnd()}function z(a){E=[],A(a),E=null}function A(a){if(a=q(a),!(E.indexOf(a)>=0)){E.push(a);for(var b,c=a.querySelectorAll("link[rel="+C+"]"),d=0,e=c.length;e>d&&(b=c[d]);d++)b.import&&b.import.__parsed&&A(b.import);y(a)}}var B=window.logFlags||{},C=window.HTMLImports?HTMLImports.IMPORT_LINK_TYPE:"none",D=!window.MutationObserver||window.MutationObserver===window.JsMutationObserver;a.hasPolyfillMutations=D;var E,F=!1,G=[],H=Array.prototype.forEach.call.bind(Array.prototype.forEach);a.IMPORT_LINK_TYPE=C,a.watchShadow=s,a.upgradeDocumentTree=z,a.upgradeAll=g,a.upgradeSubtree=f,a.insertedNode=i,a.observeDocument=x,a.upgradeDocument=y,a.takeRecords=v}(window.CustomElements),function(a){function b(b,g){var h=g||{};if(!b)throw new Error("document.registerElement: first argument `name` must not be empty");if(b.indexOf("-")<0)throw new Error("document.registerElement: first argument ('name') must contain a dash ('-'). Argument provided was '"+String(b)+"'.");if(c(b))throw new Error("Failed to execute 'registerElement' on 'Document': Registration failed for type '"+String(b)+"'. The type name is invalid.");if(n(b))throw new Error("DuplicateDefinitionError: a type with name '"+String(b)+"' is already registered");if(!h.prototype)throw new Error("Options missing required prototype property");return h.__name=b.toLowerCase(),h.lifecycle=h.lifecycle||{},h.ancestry=d(h.extends),e(h),f(h),l(h.prototype),o(h.__name,h),h.ctor=p(h),h.ctor.prototype=h.prototype,h.prototype.constructor=h.ctor,a.ready&&a.upgradeDocumentTree(document),h.ctor}function c(a){for(var b=0;b<y.length;b++)if(a===y[b])return!0}function d(a){var b=n(a);return b?d(b.extends).concat([b]):[]}function e(a){for(var b,c=a.extends,d=0;b=a.ancestry[d];d++)c=b.is&&b.tag;a.tag=c||a.__name,c&&(a.is=a.__name)}function f(a){if(!Object.__proto__){var b=HTMLElement.prototype;if(a.is){var c=document.createElement(a.tag),d=Object.getPrototypeOf(c);d===a.prototype&&(b=d)}for(var e,f=a.prototype;f&&f!==b;)e=Object.getPrototypeOf(f),f.__proto__=e,f=e;a.native=b}}function g(a){return h(B(a.tag),a)}function h(b,c){return c.is&&b.setAttribute("is",c.is),i(b,c),b.__upgraded__=!0,k(b),a.insertedNode(b),a.upgradeSubtree(b),b}function i(a,b){Object.__proto__?a.__proto__=b.prototype:(j(a,b.prototype,b.native),a.__proto__=b.prototype)}function j(a,b,c){for(var d={},e=b;e!==c&&e!==HTMLElement.prototype;){for(var f,g=Object.getOwnPropertyNames(e),h=0;f=g[h];h++)d[f]||(Object.defineProperty(a,f,Object.getOwnPropertyDescriptor(e,f)),d[f]=1);e=Object.getPrototypeOf(e)}}function k(a){a.createdCallback&&a.createdCallback()}function l(a){if(!a.setAttribute._polyfilled){var b=a.setAttribute;a.setAttribute=function(a,c){m.call(this,a,c,b)};var c=a.removeAttribute;a.removeAttribute=function(a){m.call(this,a,null,c)},a.setAttribute._polyfilled=!0}}function m(a,b,c){a=a.toLowerCase();var d=this.getAttribute(a);c.apply(this,arguments);var e=this.getAttribute(a);this.attributeChangedCallback&&e!==d&&this.attributeChangedCallback(a,d,e)}function n(a){return a?z[a.toLowerCase()]:void 0}function o(a,b){z[a]=b}function p(a){return function(){return g(a)}}function q(a,b,c){return a===A?r(b,c):C(a,b)}function r(a,b){var c=n(b||a);if(c){if(a==c.tag&&b==c.is)return new c.ctor;if(!b&&!c.is)return new c.ctor}if(b){var d=r(a);return d.setAttribute("is",b),d}var d=B(a);return a.indexOf("-")>=0&&i(d,HTMLElement),d}function s(a){if(!a.__upgraded__&&a.nodeType===Node.ELEMENT_NODE){var b=a.getAttribute("is"),c=n(b||a.localName);if(c){if(b&&c.tag==a.localName)return h(a,c);if(!b&&!c.extends)return h(a,c)}}}function t(b){var c=D.call(this,b);return a.upgradeAll(c),c}a||(a=window.CustomElements={flags:{}});var u=a.flags,v=Boolean(document.registerElement),w=!u.register&&v&&!window.ShadowDOMPolyfill&&(!window.HTMLImports||HTMLImports.useNative);if(w){var x=function(){};a.registry={},a.upgradeElement=x,a.watchShadow=x,a.upgrade=x,a.upgradeAll=x,a.upgradeSubtree=x,a.observeDocument=x,a.upgradeDocument=x,a.upgradeDocumentTree=x,a.takeRecords=x,a.reservedTagList=[]}else{var y=["annotation-xml","color-profile","font-face","font-face-src","font-face-uri","font-face-format","font-face-name","missing-glyph"],z={},A="http://www.w3.org/1999/xhtml",B=document.createElement.bind(document),C=document.createElementNS.bind(document),D=Node.prototype.cloneNode;document.registerElement=b,document.createElement=r,document.createElementNS=q,Node.prototype.cloneNode=t,a.registry=z,a.upgrade=s}var E;E=Object.__proto__||w?function(a,b){return a instanceof b}:function(a,b){for(var c=a;c;){if(c===b.prototype)return!0;c=c.__proto__}return!1},a.instanceof=E,a.reservedTagList=y,document.register=document.registerElement,a.hasNative=v,a.useNative=w}(window.CustomElements),function(a){function b(a){return"link"===a.localName&&a.getAttribute("rel")===c}var c=a.IMPORT_LINK_TYPE,d={selectors:["link[rel="+c+"]"],map:{link:"parseLink"},parse:function(a){if(!a.__parsed){a.__parsed=!0;var b=a.querySelectorAll(d.selectors);e(b,function(a){d[d.map[a.localName]](a)}),CustomElements.upgradeDocument(a),CustomElements.observeDocument(a)}},parseLink:function(a){b(a)&&this.parseImport(a)},parseImport:function(a){a.import&&d.parse(a.import)}},e=Array.prototype.forEach.call.bind(Array.prototype.forEach);a.parser=d,a.IMPORT_LINK_TYPE=c}(window.CustomElements),function(a){function b(){CustomElements.parser.parse(document),CustomElements.upgradeDocument(document),window.HTMLImports&&(HTMLImports.__importsParsingHook=function(a){CustomElements.parser.parse(a.import)}),CustomElements.ready=!0,setTimeout(function(){CustomElements.readyTime=Date.now(),window.HTMLImports&&(CustomElements.elapsed=CustomElements.readyTime-HTMLImports.readyTime),document.dispatchEvent(new CustomEvent("WebComponentsReady",{bubbles:!0}))})}if("function"!=typeof window.CustomEvent&&(window.CustomEvent=function(a,b){b=b||{};var c=document.createEvent("CustomEvent");return c.initCustomEvent(a,Boolean(b.bubbles),Boolean(b.cancelable),b.detail),c},window.CustomEvent.prototype=window.Event.prototype),"complete"===document.readyState||a.flags.eager)b();else if("interactive"!==document.readyState||window.attachEvent||window.HTMLImports&&!window.HTMLImports.ready){var c=window.HTMLImports&&!HTMLImports.ready?"HTMLImportsLoaded":"DOMContentLoaded";window.addEventListener(c,b)}else b()}(window.CustomElements),function(){if(window.ShadowDOMPolyfill){var a=["upgradeAll","upgradeSubtree","observeDocument","upgradeDocument"],b={};a.forEach(function(a){b[a]=CustomElements[a]}),a.forEach(function(a){CustomElements[a]=function(c){return b[a](wrap(c))}})}}(),function(a){"use strict";function b(){window.Polymer===e&&(window.Polymer=function(){throw new Error('You tried to use polymer without loading it first. To load polymer, <link rel="import" href="components/polymer/polymer.html">')})}if(!window.performance){var c=Date.now();window.performance={now:function(){return Date.now()-c
}}}window.requestAnimationFrame||(window.requestAnimationFrame=function(){var a=window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame;return a?function(b){return a(function(){b(performance.now())})}:function(a){return window.setTimeout(a,1e3/60)}}()),window.cancelAnimationFrame||(window.cancelAnimationFrame=function(){return window.webkitCancelAnimationFrame||window.mozCancelAnimationFrame||function(a){clearTimeout(a)}}());var d=[],e=function(a){"string"!=typeof a&&1===arguments.length&&Array.prototype.push.call(arguments,document._currentScript),d.push(arguments)};window.Polymer=e,a.consumeDeclarations=function(b){a.consumeDeclarations=function(){throw"Possible attempt to load Polymer twice"},b&&b(d),d=null},HTMLImports.useNative?b():addEventListener("DOMContentLoaded",b)}(window.Platform),function(){var a=document.createElement("style");a.textContent="body {transition: opacity ease-in 0.2s; } \nbody[unresolved] {opacity: 0; display: block; overflow: hidden; position: relative; } \n";var b=document.querySelector("head");b.insertBefore(a,b.firstChild)}(Platform),function(a){function b(a,b){return b=b||[],b.map||(b=[b]),a.apply(this,b.map(d))}function c(a,c,d){var e;switch(arguments.length){case 0:return;case 1:e=null;break;case 2:e=c.apply(this);break;default:e=b(d,c)}f[a]=e}function d(a){return f[a]}function e(a,c){HTMLImports.whenImportsReady(function(){b(c,a)})}var f={};a.marshal=d,a.modularize=c,a.using=e}(window);
//# sourceMappingURL=platform.js.map;
!function(a,b){"object"==typeof module&&"object"==typeof module.exports?module.exports=a.document?b(a,!0):function(a){if(!a.document)throw new Error("jQuery requires a window with a document");return b(a)}:b(a)}("undefined"!=typeof window?window:this,function(a,b){function c(a){var b=a.length,c=_.type(a);return"function"===c||_.isWindow(a)?!1:1===a.nodeType&&b?!0:"array"===c||0===b||"number"==typeof b&&b>0&&b-1 in a}function d(a,b,c){if(_.isFunction(b))return _.grep(a,function(a,d){return!!b.call(a,d,a)!==c});if(b.nodeType)return _.grep(a,function(a){return a===b!==c});if("string"==typeof b){if(hb.test(b))return _.filter(b,a,c);b=_.filter(b,a)}return _.grep(a,function(a){return U.call(b,a)>=0!==c})}function e(a,b){for(;(a=a[b])&&1!==a.nodeType;);return a}function f(a){var b=ob[a]={};return _.each(a.match(nb)||[],function(a,c){b[c]=!0}),b}function g(){Z.removeEventListener("DOMContentLoaded",g,!1),a.removeEventListener("load",g,!1),_.ready()}function h(){Object.defineProperty(this.cache={},0,{get:function(){return{}}}),this.expando=_.expando+Math.random()}function i(a,b,c){var d;if(void 0===c&&1===a.nodeType)if(d="data-"+b.replace(ub,"-$1").toLowerCase(),c=a.getAttribute(d),"string"==typeof c){try{c="true"===c?!0:"false"===c?!1:"null"===c?null:+c+""===c?+c:tb.test(c)?_.parseJSON(c):c}catch(e){}sb.set(a,b,c)}else c=void 0;return c}function j(){return!0}function k(){return!1}function l(){try{return Z.activeElement}catch(a){}}function m(a,b){return _.nodeName(a,"table")&&_.nodeName(11!==b.nodeType?b:b.firstChild,"tr")?a.getElementsByTagName("tbody")[0]||a.appendChild(a.ownerDocument.createElement("tbody")):a}function n(a){return a.type=(null!==a.getAttribute("type"))+"/"+a.type,a}function o(a){var b=Kb.exec(a.type);return b?a.type=b[1]:a.removeAttribute("type"),a}function p(a,b){for(var c=0,d=a.length;d>c;c++)rb.set(a[c],"globalEval",!b||rb.get(b[c],"globalEval"))}function q(a,b){var c,d,e,f,g,h,i,j;if(1===b.nodeType){if(rb.hasData(a)&&(f=rb.access(a),g=rb.set(b,f),j=f.events)){delete g.handle,g.events={};for(e in j)for(c=0,d=j[e].length;d>c;c++)_.event.add(b,e,j[e][c])}sb.hasData(a)&&(h=sb.access(a),i=_.extend({},h),sb.set(b,i))}}function r(a,b){var c=a.getElementsByTagName?a.getElementsByTagName(b||"*"):a.querySelectorAll?a.querySelectorAll(b||"*"):[];return void 0===b||b&&_.nodeName(a,b)?_.merge([a],c):c}function s(a,b){var c=b.nodeName.toLowerCase();"input"===c&&yb.test(a.type)?b.checked=a.checked:("input"===c||"textarea"===c)&&(b.defaultValue=a.defaultValue)}function t(b,c){var d,e=_(c.createElement(b)).appendTo(c.body),f=a.getDefaultComputedStyle&&(d=a.getDefaultComputedStyle(e[0]))?d.display:_.css(e[0],"display");return e.detach(),f}function u(a){var b=Z,c=Ob[a];return c||(c=t(a,b),"none"!==c&&c||(Nb=(Nb||_("<iframe frameborder='0' width='0' height='0'/>")).appendTo(b.documentElement),b=Nb[0].contentDocument,b.write(),b.close(),c=t(a,b),Nb.detach()),Ob[a]=c),c}function v(a,b,c){var d,e,f,g,h=a.style;return c=c||Rb(a),c&&(g=c.getPropertyValue(b)||c[b]),c&&(""!==g||_.contains(a.ownerDocument,a)||(g=_.style(a,b)),Qb.test(g)&&Pb.test(b)&&(d=h.width,e=h.minWidth,f=h.maxWidth,h.minWidth=h.maxWidth=h.width=g,g=c.width,h.width=d,h.minWidth=e,h.maxWidth=f)),void 0!==g?g+"":g}function w(a,b){return{get:function(){return a()?void delete this.get:(this.get=b).apply(this,arguments)}}}function x(a,b){if(b in a)return b;for(var c=b[0].toUpperCase()+b.slice(1),d=b,e=Xb.length;e--;)if(b=Xb[e]+c,b in a)return b;return d}function y(a,b,c){var d=Tb.exec(b);return d?Math.max(0,d[1]-(c||0))+(d[2]||"px"):b}function z(a,b,c,d,e){for(var f=c===(d?"border":"content")?4:"width"===b?1:0,g=0;4>f;f+=2)"margin"===c&&(g+=_.css(a,c+wb[f],!0,e)),d?("content"===c&&(g-=_.css(a,"padding"+wb[f],!0,e)),"margin"!==c&&(g-=_.css(a,"border"+wb[f]+"Width",!0,e))):(g+=_.css(a,"padding"+wb[f],!0,e),"padding"!==c&&(g+=_.css(a,"border"+wb[f]+"Width",!0,e)));return g}function A(a,b,c){var d=!0,e="width"===b?a.offsetWidth:a.offsetHeight,f=Rb(a),g="border-box"===_.css(a,"boxSizing",!1,f);if(0>=e||null==e){if(e=v(a,b,f),(0>e||null==e)&&(e=a.style[b]),Qb.test(e))return e;d=g&&(Y.boxSizingReliable()||e===a.style[b]),e=parseFloat(e)||0}return e+z(a,b,c||(g?"border":"content"),d,f)+"px"}function B(a,b){for(var c,d,e,f=[],g=0,h=a.length;h>g;g++)d=a[g],d.style&&(f[g]=rb.get(d,"olddisplay"),c=d.style.display,b?(f[g]||"none"!==c||(d.style.display=""),""===d.style.display&&xb(d)&&(f[g]=rb.access(d,"olddisplay",u(d.nodeName)))):(e=xb(d),"none"===c&&e||rb.set(d,"olddisplay",e?c:_.css(d,"display"))));for(g=0;h>g;g++)d=a[g],d.style&&(b&&"none"!==d.style.display&&""!==d.style.display||(d.style.display=b?f[g]||"":"none"));return a}function C(a,b,c,d,e){return new C.prototype.init(a,b,c,d,e)}function D(){return setTimeout(function(){Yb=void 0}),Yb=_.now()}function E(a,b){var c,d=0,e={height:a};for(b=b?1:0;4>d;d+=2-b)c=wb[d],e["margin"+c]=e["padding"+c]=a;return b&&(e.opacity=e.width=a),e}function F(a,b,c){for(var d,e=(cc[b]||[]).concat(cc["*"]),f=0,g=e.length;g>f;f++)if(d=e[f].call(c,b,a))return d}function G(a,b,c){var d,e,f,g,h,i,j,k,l=this,m={},n=a.style,o=a.nodeType&&xb(a),p=rb.get(a,"fxshow");c.queue||(h=_._queueHooks(a,"fx"),null==h.unqueued&&(h.unqueued=0,i=h.empty.fire,h.empty.fire=function(){h.unqueued||i()}),h.unqueued++,l.always(function(){l.always(function(){h.unqueued--,_.queue(a,"fx").length||h.empty.fire()})})),1===a.nodeType&&("height"in b||"width"in b)&&(c.overflow=[n.overflow,n.overflowX,n.overflowY],j=_.css(a,"display"),k="none"===j?rb.get(a,"olddisplay")||u(a.nodeName):j,"inline"===k&&"none"===_.css(a,"float")&&(n.display="inline-block")),c.overflow&&(n.overflow="hidden",l.always(function(){n.overflow=c.overflow[0],n.overflowX=c.overflow[1],n.overflowY=c.overflow[2]}));for(d in b)if(e=b[d],$b.exec(e)){if(delete b[d],f=f||"toggle"===e,e===(o?"hide":"show")){if("show"!==e||!p||void 0===p[d])continue;o=!0}m[d]=p&&p[d]||_.style(a,d)}else j=void 0;if(_.isEmptyObject(m))"inline"===("none"===j?u(a.nodeName):j)&&(n.display=j);else{p?"hidden"in p&&(o=p.hidden):p=rb.access(a,"fxshow",{}),f&&(p.hidden=!o),o?_(a).show():l.done(function(){_(a).hide()}),l.done(function(){var b;rb.remove(a,"fxshow");for(b in m)_.style(a,b,m[b])});for(d in m)g=F(o?p[d]:0,d,l),d in p||(p[d]=g.start,o&&(g.end=g.start,g.start="width"===d||"height"===d?1:0))}}function H(a,b){var c,d,e,f,g;for(c in a)if(d=_.camelCase(c),e=b[d],f=a[c],_.isArray(f)&&(e=f[1],f=a[c]=f[0]),c!==d&&(a[d]=f,delete a[c]),g=_.cssHooks[d],g&&"expand"in g){f=g.expand(f),delete a[d];for(c in f)c in a||(a[c]=f[c],b[c]=e)}else b[d]=e}function I(a,b,c){var d,e,f=0,g=bc.length,h=_.Deferred().always(function(){delete i.elem}),i=function(){if(e)return!1;for(var b=Yb||D(),c=Math.max(0,j.startTime+j.duration-b),d=c/j.duration||0,f=1-d,g=0,i=j.tweens.length;i>g;g++)j.tweens[g].run(f);return h.notifyWith(a,[j,f,c]),1>f&&i?c:(h.resolveWith(a,[j]),!1)},j=h.promise({elem:a,props:_.extend({},b),opts:_.extend(!0,{specialEasing:{}},c),originalProperties:b,originalOptions:c,startTime:Yb||D(),duration:c.duration,tweens:[],createTween:function(b,c){var d=_.Tween(a,j.opts,b,c,j.opts.specialEasing[b]||j.opts.easing);return j.tweens.push(d),d},stop:function(b){var c=0,d=b?j.tweens.length:0;if(e)return this;for(e=!0;d>c;c++)j.tweens[c].run(1);return b?h.resolveWith(a,[j,b]):h.rejectWith(a,[j,b]),this}}),k=j.props;for(H(k,j.opts.specialEasing);g>f;f++)if(d=bc[f].call(j,a,k,j.opts))return d;return _.map(k,F,j),_.isFunction(j.opts.start)&&j.opts.start.call(a,j),_.fx.timer(_.extend(i,{elem:a,anim:j,queue:j.opts.queue})),j.progress(j.opts.progress).done(j.opts.done,j.opts.complete).fail(j.opts.fail).always(j.opts.always)}function J(a){return function(b,c){"string"!=typeof b&&(c=b,b="*");var d,e=0,f=b.toLowerCase().match(nb)||[];if(_.isFunction(c))for(;d=f[e++];)"+"===d[0]?(d=d.slice(1)||"*",(a[d]=a[d]||[]).unshift(c)):(a[d]=a[d]||[]).push(c)}}function K(a,b,c,d){function e(h){var i;return f[h]=!0,_.each(a[h]||[],function(a,h){var j=h(b,c,d);return"string"!=typeof j||g||f[j]?g?!(i=j):void 0:(b.dataTypes.unshift(j),e(j),!1)}),i}var f={},g=a===vc;return e(b.dataTypes[0])||!f["*"]&&e("*")}function L(a,b){var c,d,e=_.ajaxSettings.flatOptions||{};for(c in b)void 0!==b[c]&&((e[c]?a:d||(d={}))[c]=b[c]);return d&&_.extend(!0,a,d),a}function M(a,b,c){for(var d,e,f,g,h=a.contents,i=a.dataTypes;"*"===i[0];)i.shift(),void 0===d&&(d=a.mimeType||b.getResponseHeader("Content-Type"));if(d)for(e in h)if(h[e]&&h[e].test(d)){i.unshift(e);break}if(i[0]in c)f=i[0];else{for(e in c){if(!i[0]||a.converters[e+" "+i[0]]){f=e;break}g||(g=e)}f=f||g}return f?(f!==i[0]&&i.unshift(f),c[f]):void 0}function N(a,b,c,d){var e,f,g,h,i,j={},k=a.dataTypes.slice();if(k[1])for(g in a.converters)j[g.toLowerCase()]=a.converters[g];for(f=k.shift();f;)if(a.responseFields[f]&&(c[a.responseFields[f]]=b),!i&&d&&a.dataFilter&&(b=a.dataFilter(b,a.dataType)),i=f,f=k.shift())if("*"===f)f=i;else if("*"!==i&&i!==f){if(g=j[i+" "+f]||j["* "+f],!g)for(e in j)if(h=e.split(" "),h[1]===f&&(g=j[i+" "+h[0]]||j["* "+h[0]])){g===!0?g=j[e]:j[e]!==!0&&(f=h[0],k.unshift(h[1]));break}if(g!==!0)if(g&&a["throws"])b=g(b);else try{b=g(b)}catch(l){return{state:"parsererror",error:g?l:"No conversion from "+i+" to "+f}}}return{state:"success",data:b}}function O(a,b,c,d){var e;if(_.isArray(b))_.each(b,function(b,e){c||zc.test(a)?d(a,e):O(a+"["+("object"==typeof e?b:"")+"]",e,c,d)});else if(c||"object"!==_.type(b))d(a,b);else for(e in b)O(a+"["+e+"]",b[e],c,d)}function P(a){return _.isWindow(a)?a:9===a.nodeType&&a.defaultView}var Q=[],R=Q.slice,S=Q.concat,T=Q.push,U=Q.indexOf,V={},W=V.toString,X=V.hasOwnProperty,Y={},Z=a.document,$="2.1.1",_=function(a,b){return new _.fn.init(a,b)},ab=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,bb=/^-ms-/,cb=/-([\da-z])/gi,db=function(a,b){return b.toUpperCase()};_.fn=_.prototype={jquery:$,constructor:_,selector:"",length:0,toArray:function(){return R.call(this)},get:function(a){return null!=a?0>a?this[a+this.length]:this[a]:R.call(this)},pushStack:function(a){var b=_.merge(this.constructor(),a);return b.prevObject=this,b.context=this.context,b},each:function(a,b){return _.each(this,a,b)},map:function(a){return this.pushStack(_.map(this,function(b,c){return a.call(b,c,b)}))},slice:function(){return this.pushStack(R.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(a){var b=this.length,c=+a+(0>a?b:0);return this.pushStack(c>=0&&b>c?[this[c]]:[])},end:function(){return this.prevObject||this.constructor(null)},push:T,sort:Q.sort,splice:Q.splice},_.extend=_.fn.extend=function(){var a,b,c,d,e,f,g=arguments[0]||{},h=1,i=arguments.length,j=!1;for("boolean"==typeof g&&(j=g,g=arguments[h]||{},h++),"object"==typeof g||_.isFunction(g)||(g={}),h===i&&(g=this,h--);i>h;h++)if(null!=(a=arguments[h]))for(b in a)c=g[b],d=a[b],g!==d&&(j&&d&&(_.isPlainObject(d)||(e=_.isArray(d)))?(e?(e=!1,f=c&&_.isArray(c)?c:[]):f=c&&_.isPlainObject(c)?c:{},g[b]=_.extend(j,f,d)):void 0!==d&&(g[b]=d));return g},_.extend({expando:"jQuery"+($+Math.random()).replace(/\D/g,""),isReady:!0,error:function(a){throw new Error(a)},noop:function(){},isFunction:function(a){return"function"===_.type(a)},isArray:Array.isArray,isWindow:function(a){return null!=a&&a===a.window},isNumeric:function(a){return!_.isArray(a)&&a-parseFloat(a)>=0},isPlainObject:function(a){return"object"!==_.type(a)||a.nodeType||_.isWindow(a)?!1:a.constructor&&!X.call(a.constructor.prototype,"isPrototypeOf")?!1:!0},isEmptyObject:function(a){var b;for(b in a)return!1;return!0},type:function(a){return null==a?a+"":"object"==typeof a||"function"==typeof a?V[W.call(a)]||"object":typeof a},globalEval:function(a){var b,c=eval;a=_.trim(a),a&&(1===a.indexOf("use strict")?(b=Z.createElement("script"),b.text=a,Z.head.appendChild(b).parentNode.removeChild(b)):c(a))},camelCase:function(a){return a.replace(bb,"ms-").replace(cb,db)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toLowerCase()===b.toLowerCase()},each:function(a,b,d){var e,f=0,g=a.length,h=c(a);if(d){if(h)for(;g>f&&(e=b.apply(a[f],d),e!==!1);f++);else for(f in a)if(e=b.apply(a[f],d),e===!1)break}else if(h)for(;g>f&&(e=b.call(a[f],f,a[f]),e!==!1);f++);else for(f in a)if(e=b.call(a[f],f,a[f]),e===!1)break;return a},trim:function(a){return null==a?"":(a+"").replace(ab,"")},makeArray:function(a,b){var d=b||[];return null!=a&&(c(Object(a))?_.merge(d,"string"==typeof a?[a]:a):T.call(d,a)),d},inArray:function(a,b,c){return null==b?-1:U.call(b,a,c)},merge:function(a,b){for(var c=+b.length,d=0,e=a.length;c>d;d++)a[e++]=b[d];return a.length=e,a},grep:function(a,b,c){for(var d,e=[],f=0,g=a.length,h=!c;g>f;f++)d=!b(a[f],f),d!==h&&e.push(a[f]);return e},map:function(a,b,d){var e,f=0,g=a.length,h=c(a),i=[];if(h)for(;g>f;f++)e=b(a[f],f,d),null!=e&&i.push(e);else for(f in a)e=b(a[f],f,d),null!=e&&i.push(e);return S.apply([],i)},guid:1,proxy:function(a,b){var c,d,e;return"string"==typeof b&&(c=a[b],b=a,a=c),_.isFunction(a)?(d=R.call(arguments,2),e=function(){return a.apply(b||this,d.concat(R.call(arguments)))},e.guid=a.guid=a.guid||_.guid++,e):void 0},now:Date.now,support:Y}),_.each("Boolean Number String Function Array Date RegExp Object Error".split(" "),function(a,b){V["[object "+b+"]"]=b.toLowerCase()});var eb=function(a){function b(a,b,c,d){var e,f,g,h,i,j,l,n,o,p;if((b?b.ownerDocument||b:O)!==G&&F(b),b=b||G,c=c||[],!a||"string"!=typeof a)return c;if(1!==(h=b.nodeType)&&9!==h)return[];if(I&&!d){if(e=sb.exec(a))if(g=e[1]){if(9===h){if(f=b.getElementById(g),!f||!f.parentNode)return c;if(f.id===g)return c.push(f),c}else if(b.ownerDocument&&(f=b.ownerDocument.getElementById(g))&&M(b,f)&&f.id===g)return c.push(f),c}else{if(e[2])return _.apply(c,b.getElementsByTagName(a)),c;if((g=e[3])&&v.getElementsByClassName&&b.getElementsByClassName)return _.apply(c,b.getElementsByClassName(g)),c}if(v.qsa&&(!J||!J.test(a))){if(n=l=N,o=b,p=9===h&&a,1===h&&"object"!==b.nodeName.toLowerCase()){for(j=z(a),(l=b.getAttribute("id"))?n=l.replace(ub,"\\$&"):b.setAttribute("id",n),n="[id='"+n+"'] ",i=j.length;i--;)j[i]=n+m(j[i]);o=tb.test(a)&&k(b.parentNode)||b,p=j.join(",")}if(p)try{return _.apply(c,o.querySelectorAll(p)),c}catch(q){}finally{l||b.removeAttribute("id")}}}return B(a.replace(ib,"$1"),b,c,d)}function c(){function a(c,d){return b.push(c+" ")>w.cacheLength&&delete a[b.shift()],a[c+" "]=d}var b=[];return a}function d(a){return a[N]=!0,a}function e(a){var b=G.createElement("div");try{return!!a(b)}catch(c){return!1}finally{b.parentNode&&b.parentNode.removeChild(b),b=null}}function f(a,b){for(var c=a.split("|"),d=a.length;d--;)w.attrHandle[c[d]]=b}function g(a,b){var c=b&&a,d=c&&1===a.nodeType&&1===b.nodeType&&(~b.sourceIndex||W)-(~a.sourceIndex||W);if(d)return d;if(c)for(;c=c.nextSibling;)if(c===b)return-1;return a?1:-1}function h(a){return function(b){var c=b.nodeName.toLowerCase();return"input"===c&&b.type===a}}function i(a){return function(b){var c=b.nodeName.toLowerCase();return("input"===c||"button"===c)&&b.type===a}}function j(a){return d(function(b){return b=+b,d(function(c,d){for(var e,f=a([],c.length,b),g=f.length;g--;)c[e=f[g]]&&(c[e]=!(d[e]=c[e]))})})}function k(a){return a&&typeof a.getElementsByTagName!==V&&a}function l(){}function m(a){for(var b=0,c=a.length,d="";c>b;b++)d+=a[b].value;return d}function n(a,b,c){var d=b.dir,e=c&&"parentNode"===d,f=Q++;return b.first?function(b,c,f){for(;b=b[d];)if(1===b.nodeType||e)return a(b,c,f)}:function(b,c,g){var h,i,j=[P,f];if(g){for(;b=b[d];)if((1===b.nodeType||e)&&a(b,c,g))return!0}else for(;b=b[d];)if(1===b.nodeType||e){if(i=b[N]||(b[N]={}),(h=i[d])&&h[0]===P&&h[1]===f)return j[2]=h[2];if(i[d]=j,j[2]=a(b,c,g))return!0}}}function o(a){return a.length>1?function(b,c,d){for(var e=a.length;e--;)if(!a[e](b,c,d))return!1;return!0}:a[0]}function p(a,c,d){for(var e=0,f=c.length;f>e;e++)b(a,c[e],d);return d}function q(a,b,c,d,e){for(var f,g=[],h=0,i=a.length,j=null!=b;i>h;h++)(f=a[h])&&(!c||c(f,d,e))&&(g.push(f),j&&b.push(h));return g}function r(a,b,c,e,f,g){return e&&!e[N]&&(e=r(e)),f&&!f[N]&&(f=r(f,g)),d(function(d,g,h,i){var j,k,l,m=[],n=[],o=g.length,r=d||p(b||"*",h.nodeType?[h]:h,[]),s=!a||!d&&b?r:q(r,m,a,h,i),t=c?f||(d?a:o||e)?[]:g:s;if(c&&c(s,t,h,i),e)for(j=q(t,n),e(j,[],h,i),k=j.length;k--;)(l=j[k])&&(t[n[k]]=!(s[n[k]]=l));if(d){if(f||a){if(f){for(j=[],k=t.length;k--;)(l=t[k])&&j.push(s[k]=l);f(null,t=[],j,i)}for(k=t.length;k--;)(l=t[k])&&(j=f?bb.call(d,l):m[k])>-1&&(d[j]=!(g[j]=l))}}else t=q(t===g?t.splice(o,t.length):t),f?f(null,g,t,i):_.apply(g,t)})}function s(a){for(var b,c,d,e=a.length,f=w.relative[a[0].type],g=f||w.relative[" "],h=f?1:0,i=n(function(a){return a===b},g,!0),j=n(function(a){return bb.call(b,a)>-1},g,!0),k=[function(a,c,d){return!f&&(d||c!==C)||((b=c).nodeType?i(a,c,d):j(a,c,d))}];e>h;h++)if(c=w.relative[a[h].type])k=[n(o(k),c)];else{if(c=w.filter[a[h].type].apply(null,a[h].matches),c[N]){for(d=++h;e>d&&!w.relative[a[d].type];d++);return r(h>1&&o(k),h>1&&m(a.slice(0,h-1).concat({value:" "===a[h-2].type?"*":""})).replace(ib,"$1"),c,d>h&&s(a.slice(h,d)),e>d&&s(a=a.slice(d)),e>d&&m(a))}k.push(c)}return o(k)}function t(a,c){var e=c.length>0,f=a.length>0,g=function(d,g,h,i,j){var k,l,m,n=0,o="0",p=d&&[],r=[],s=C,t=d||f&&w.find.TAG("*",j),u=P+=null==s?1:Math.random()||.1,v=t.length;for(j&&(C=g!==G&&g);o!==v&&null!=(k=t[o]);o++){if(f&&k){for(l=0;m=a[l++];)if(m(k,g,h)){i.push(k);break}j&&(P=u)}e&&((k=!m&&k)&&n--,d&&p.push(k))}if(n+=o,e&&o!==n){for(l=0;m=c[l++];)m(p,r,g,h);if(d){if(n>0)for(;o--;)p[o]||r[o]||(r[o]=Z.call(i));r=q(r)}_.apply(i,r),j&&!d&&r.length>0&&n+c.length>1&&b.uniqueSort(i)}return j&&(P=u,C=s),p};return e?d(g):g}var u,v,w,x,y,z,A,B,C,D,E,F,G,H,I,J,K,L,M,N="sizzle"+-new Date,O=a.document,P=0,Q=0,R=c(),S=c(),T=c(),U=function(a,b){return a===b&&(E=!0),0},V="undefined",W=1<<31,X={}.hasOwnProperty,Y=[],Z=Y.pop,$=Y.push,_=Y.push,ab=Y.slice,bb=Y.indexOf||function(a){for(var b=0,c=this.length;c>b;b++)if(this[b]===a)return b;return-1},cb="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",db="[\\x20\\t\\r\\n\\f]",eb="(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",fb=eb.replace("w","w#"),gb="\\["+db+"*("+eb+")(?:"+db+"*([*^$|!~]?=)"+db+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+fb+"))|)"+db+"*\\]",hb=":("+eb+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+gb+")*)|.*)\\)|)",ib=new RegExp("^"+db+"+|((?:^|[^\\\\])(?:\\\\.)*)"+db+"+$","g"),jb=new RegExp("^"+db+"*,"+db+"*"),kb=new RegExp("^"+db+"*([>+~]|"+db+")"+db+"*"),lb=new RegExp("="+db+"*([^\\]'\"]*?)"+db+"*\\]","g"),mb=new RegExp(hb),nb=new RegExp("^"+fb+"$"),ob={ID:new RegExp("^#("+eb+")"),CLASS:new RegExp("^\\.("+eb+")"),TAG:new RegExp("^("+eb.replace("w","w*")+")"),ATTR:new RegExp("^"+gb),PSEUDO:new RegExp("^"+hb),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+db+"*(even|odd|(([+-]|)(\\d*)n|)"+db+"*(?:([+-]|)"+db+"*(\\d+)|))"+db+"*\\)|)","i"),bool:new RegExp("^(?:"+cb+")$","i"),needsContext:new RegExp("^"+db+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+db+"*((?:-\\d)?\\d*)"+db+"*\\)|)(?=[^-]|$)","i")},pb=/^(?:input|select|textarea|button)$/i,qb=/^h\d$/i,rb=/^[^{]+\{\s*\[native \w/,sb=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,tb=/[+~]/,ub=/'|\\/g,vb=new RegExp("\\\\([\\da-f]{1,6}"+db+"?|("+db+")|.)","ig"),wb=function(a,b,c){var d="0x"+b-65536;return d!==d||c?b:0>d?String.fromCharCode(d+65536):String.fromCharCode(d>>10|55296,1023&d|56320)};try{_.apply(Y=ab.call(O.childNodes),O.childNodes),Y[O.childNodes.length].nodeType}catch(xb){_={apply:Y.length?function(a,b){$.apply(a,ab.call(b))}:function(a,b){for(var c=a.length,d=0;a[c++]=b[d++];);a.length=c-1}}}v=b.support={},y=b.isXML=function(a){var b=a&&(a.ownerDocument||a).documentElement;return b?"HTML"!==b.nodeName:!1},F=b.setDocument=function(a){var b,c=a?a.ownerDocument||a:O,d=c.defaultView;return c!==G&&9===c.nodeType&&c.documentElement?(G=c,H=c.documentElement,I=!y(c),d&&d!==d.top&&(d.addEventListener?d.addEventListener("unload",function(){F()},!1):d.attachEvent&&d.attachEvent("onunload",function(){F()})),v.attributes=e(function(a){return a.className="i",!a.getAttribute("className")}),v.getElementsByTagName=e(function(a){return a.appendChild(c.createComment("")),!a.getElementsByTagName("*").length}),v.getElementsByClassName=rb.test(c.getElementsByClassName)&&e(function(a){return a.innerHTML="<div class='a'></div><div class='a i'></div>",a.firstChild.className="i",2===a.getElementsByClassName("i").length}),v.getById=e(function(a){return H.appendChild(a).id=N,!c.getElementsByName||!c.getElementsByName(N).length}),v.getById?(w.find.ID=function(a,b){if(typeof b.getElementById!==V&&I){var c=b.getElementById(a);return c&&c.parentNode?[c]:[]}},w.filter.ID=function(a){var b=a.replace(vb,wb);return function(a){return a.getAttribute("id")===b}}):(delete w.find.ID,w.filter.ID=function(a){var b=a.replace(vb,wb);return function(a){var c=typeof a.getAttributeNode!==V&&a.getAttributeNode("id");return c&&c.value===b}}),w.find.TAG=v.getElementsByTagName?function(a,b){return typeof b.getElementsByTagName!==V?b.getElementsByTagName(a):void 0}:function(a,b){var c,d=[],e=0,f=b.getElementsByTagName(a);if("*"===a){for(;c=f[e++];)1===c.nodeType&&d.push(c);return d}return f},w.find.CLASS=v.getElementsByClassName&&function(a,b){return typeof b.getElementsByClassName!==V&&I?b.getElementsByClassName(a):void 0},K=[],J=[],(v.qsa=rb.test(c.querySelectorAll))&&(e(function(a){a.innerHTML="<select msallowclip=''><option selected=''></option></select>",a.querySelectorAll("[msallowclip^='']").length&&J.push("[*^$]="+db+"*(?:''|\"\")"),a.querySelectorAll("[selected]").length||J.push("\\["+db+"*(?:value|"+cb+")"),a.querySelectorAll(":checked").length||J.push(":checked")}),e(function(a){var b=c.createElement("input");b.setAttribute("type","hidden"),a.appendChild(b).setAttribute("name","D"),a.querySelectorAll("[name=d]").length&&J.push("name"+db+"*[*^$|!~]?="),a.querySelectorAll(":enabled").length||J.push(":enabled",":disabled"),a.querySelectorAll("*,:x"),J.push(",.*:")})),(v.matchesSelector=rb.test(L=H.matches||H.webkitMatchesSelector||H.mozMatchesSelector||H.oMatchesSelector||H.msMatchesSelector))&&e(function(a){v.disconnectedMatch=L.call(a,"div"),L.call(a,"[s!='']:x"),K.push("!=",hb)}),J=J.length&&new RegExp(J.join("|")),K=K.length&&new RegExp(K.join("|")),b=rb.test(H.compareDocumentPosition),M=b||rb.test(H.contains)?function(a,b){var c=9===a.nodeType?a.documentElement:a,d=b&&b.parentNode;return a===d||!(!d||1!==d.nodeType||!(c.contains?c.contains(d):a.compareDocumentPosition&&16&a.compareDocumentPosition(d)))}:function(a,b){if(b)for(;b=b.parentNode;)if(b===a)return!0;return!1},U=b?function(a,b){if(a===b)return E=!0,0;var d=!a.compareDocumentPosition-!b.compareDocumentPosition;return d?d:(d=(a.ownerDocument||a)===(b.ownerDocument||b)?a.compareDocumentPosition(b):1,1&d||!v.sortDetached&&b.compareDocumentPosition(a)===d?a===c||a.ownerDocument===O&&M(O,a)?-1:b===c||b.ownerDocument===O&&M(O,b)?1:D?bb.call(D,a)-bb.call(D,b):0:4&d?-1:1)}:function(a,b){if(a===b)return E=!0,0;var d,e=0,f=a.parentNode,h=b.parentNode,i=[a],j=[b];if(!f||!h)return a===c?-1:b===c?1:f?-1:h?1:D?bb.call(D,a)-bb.call(D,b):0;if(f===h)return g(a,b);for(d=a;d=d.parentNode;)i.unshift(d);for(d=b;d=d.parentNode;)j.unshift(d);for(;i[e]===j[e];)e++;return e?g(i[e],j[e]):i[e]===O?-1:j[e]===O?1:0},c):G},b.matches=function(a,c){return b(a,null,null,c)},b.matchesSelector=function(a,c){if((a.ownerDocument||a)!==G&&F(a),c=c.replace(lb,"='$1']"),!(!v.matchesSelector||!I||K&&K.test(c)||J&&J.test(c)))try{var d=L.call(a,c);if(d||v.disconnectedMatch||a.document&&11!==a.document.nodeType)return d}catch(e){}return b(c,G,null,[a]).length>0},b.contains=function(a,b){return(a.ownerDocument||a)!==G&&F(a),M(a,b)},b.attr=function(a,b){(a.ownerDocument||a)!==G&&F(a);var c=w.attrHandle[b.toLowerCase()],d=c&&X.call(w.attrHandle,b.toLowerCase())?c(a,b,!I):void 0;return void 0!==d?d:v.attributes||!I?a.getAttribute(b):(d=a.getAttributeNode(b))&&d.specified?d.value:null},b.error=function(a){throw new Error("Syntax error, unrecognized expression: "+a)},b.uniqueSort=function(a){var b,c=[],d=0,e=0;if(E=!v.detectDuplicates,D=!v.sortStable&&a.slice(0),a.sort(U),E){for(;b=a[e++];)b===a[e]&&(d=c.push(e));for(;d--;)a.splice(c[d],1)}return D=null,a},x=b.getText=function(a){var b,c="",d=0,e=a.nodeType;if(e){if(1===e||9===e||11===e){if("string"==typeof a.textContent)return a.textContent;for(a=a.firstChild;a;a=a.nextSibling)c+=x(a)}else if(3===e||4===e)return a.nodeValue}else for(;b=a[d++];)c+=x(b);return c},w=b.selectors={cacheLength:50,createPseudo:d,match:ob,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(a){return a[1]=a[1].replace(vb,wb),a[3]=(a[3]||a[4]||a[5]||"").replace(vb,wb),"~="===a[2]&&(a[3]=" "+a[3]+" "),a.slice(0,4)},CHILD:function(a){return a[1]=a[1].toLowerCase(),"nth"===a[1].slice(0,3)?(a[3]||b.error(a[0]),a[4]=+(a[4]?a[5]+(a[6]||1):2*("even"===a[3]||"odd"===a[3])),a[5]=+(a[7]+a[8]||"odd"===a[3])):a[3]&&b.error(a[0]),a},PSEUDO:function(a){var b,c=!a[6]&&a[2];return ob.CHILD.test(a[0])?null:(a[3]?a[2]=a[4]||a[5]||"":c&&mb.test(c)&&(b=z(c,!0))&&(b=c.indexOf(")",c.length-b)-c.length)&&(a[0]=a[0].slice(0,b),a[2]=c.slice(0,b)),a.slice(0,3))}},filter:{TAG:function(a){var b=a.replace(vb,wb).toLowerCase();return"*"===a?function(){return!0}:function(a){return a.nodeName&&a.nodeName.toLowerCase()===b}},CLASS:function(a){var b=R[a+" "];return b||(b=new RegExp("(^|"+db+")"+a+"("+db+"|$)"))&&R(a,function(a){return b.test("string"==typeof a.className&&a.className||typeof a.getAttribute!==V&&a.getAttribute("class")||"")})},ATTR:function(a,c,d){return function(e){var f=b.attr(e,a);return null==f?"!="===c:c?(f+="","="===c?f===d:"!="===c?f!==d:"^="===c?d&&0===f.indexOf(d):"*="===c?d&&f.indexOf(d)>-1:"$="===c?d&&f.slice(-d.length)===d:"~="===c?(" "+f+" ").indexOf(d)>-1:"|="===c?f===d||f.slice(0,d.length+1)===d+"-":!1):!0}},CHILD:function(a,b,c,d,e){var f="nth"!==a.slice(0,3),g="last"!==a.slice(-4),h="of-type"===b;return 1===d&&0===e?function(a){return!!a.parentNode}:function(b,c,i){var j,k,l,m,n,o,p=f!==g?"nextSibling":"previousSibling",q=b.parentNode,r=h&&b.nodeName.toLowerCase(),s=!i&&!h;if(q){if(f){for(;p;){for(l=b;l=l[p];)if(h?l.nodeName.toLowerCase()===r:1===l.nodeType)return!1;o=p="only"===a&&!o&&"nextSibling"}return!0}if(o=[g?q.firstChild:q.lastChild],g&&s){for(k=q[N]||(q[N]={}),j=k[a]||[],n=j[0]===P&&j[1],m=j[0]===P&&j[2],l=n&&q.childNodes[n];l=++n&&l&&l[p]||(m=n=0)||o.pop();)if(1===l.nodeType&&++m&&l===b){k[a]=[P,n,m];break}}else if(s&&(j=(b[N]||(b[N]={}))[a])&&j[0]===P)m=j[1];else for(;(l=++n&&l&&l[p]||(m=n=0)||o.pop())&&((h?l.nodeName.toLowerCase()!==r:1!==l.nodeType)||!++m||(s&&((l[N]||(l[N]={}))[a]=[P,m]),l!==b)););return m-=e,m===d||m%d===0&&m/d>=0}}},PSEUDO:function(a,c){var e,f=w.pseudos[a]||w.setFilters[a.toLowerCase()]||b.error("unsupported pseudo: "+a);return f[N]?f(c):f.length>1?(e=[a,a,"",c],w.setFilters.hasOwnProperty(a.toLowerCase())?d(function(a,b){for(var d,e=f(a,c),g=e.length;g--;)d=bb.call(a,e[g]),a[d]=!(b[d]=e[g])}):function(a){return f(a,0,e)}):f}},pseudos:{not:d(function(a){var b=[],c=[],e=A(a.replace(ib,"$1"));return e[N]?d(function(a,b,c,d){for(var f,g=e(a,null,d,[]),h=a.length;h--;)(f=g[h])&&(a[h]=!(b[h]=f))}):function(a,d,f){return b[0]=a,e(b,null,f,c),!c.pop()}}),has:d(function(a){return function(c){return b(a,c).length>0}}),contains:d(function(a){return function(b){return(b.textContent||b.innerText||x(b)).indexOf(a)>-1}}),lang:d(function(a){return nb.test(a||"")||b.error("unsupported lang: "+a),a=a.replace(vb,wb).toLowerCase(),function(b){var c;do if(c=I?b.lang:b.getAttribute("xml:lang")||b.getAttribute("lang"))return c=c.toLowerCase(),c===a||0===c.indexOf(a+"-");while((b=b.parentNode)&&1===b.nodeType);return!1}}),target:function(b){var c=a.location&&a.location.hash;return c&&c.slice(1)===b.id},root:function(a){return a===H},focus:function(a){return a===G.activeElement&&(!G.hasFocus||G.hasFocus())&&!!(a.type||a.href||~a.tabIndex)},enabled:function(a){return a.disabled===!1},disabled:function(a){return a.disabled===!0},checked:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&!!a.checked||"option"===b&&!!a.selected},selected:function(a){return a.parentNode&&a.parentNode.selectedIndex,a.selected===!0},empty:function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType<6)return!1;return!0},parent:function(a){return!w.pseudos.empty(a)},header:function(a){return qb.test(a.nodeName)},input:function(a){return pb.test(a.nodeName)},button:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&"button"===a.type||"button"===b},text:function(a){var b;return"input"===a.nodeName.toLowerCase()&&"text"===a.type&&(null==(b=a.getAttribute("type"))||"text"===b.toLowerCase())},first:j(function(){return[0]}),last:j(function(a,b){return[b-1]}),eq:j(function(a,b,c){return[0>c?c+b:c]}),even:j(function(a,b){for(var c=0;b>c;c+=2)a.push(c);return a}),odd:j(function(a,b){for(var c=1;b>c;c+=2)a.push(c);return a}),lt:j(function(a,b,c){for(var d=0>c?c+b:c;--d>=0;)a.push(d);return a}),gt:j(function(a,b,c){for(var d=0>c?c+b:c;++d<b;)a.push(d);return a})}},w.pseudos.nth=w.pseudos.eq;for(u in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})w.pseudos[u]=h(u);for(u in{submit:!0,reset:!0})w.pseudos[u]=i(u);return l.prototype=w.filters=w.pseudos,w.setFilters=new l,z=b.tokenize=function(a,c){var d,e,f,g,h,i,j,k=S[a+" "];if(k)return c?0:k.slice(0);for(h=a,i=[],j=w.preFilter;h;){(!d||(e=jb.exec(h)))&&(e&&(h=h.slice(e[0].length)||h),i.push(f=[])),d=!1,(e=kb.exec(h))&&(d=e.shift(),f.push({value:d,type:e[0].replace(ib," ")}),h=h.slice(d.length));for(g in w.filter)!(e=ob[g].exec(h))||j[g]&&!(e=j[g](e))||(d=e.shift(),f.push({value:d,type:g,matches:e}),h=h.slice(d.length));if(!d)break}return c?h.length:h?b.error(a):S(a,i).slice(0)},A=b.compile=function(a,b){var c,d=[],e=[],f=T[a+" "];if(!f){for(b||(b=z(a)),c=b.length;c--;)f=s(b[c]),f[N]?d.push(f):e.push(f);f=T(a,t(e,d)),f.selector=a}return f},B=b.select=function(a,b,c,d){var e,f,g,h,i,j="function"==typeof a&&a,l=!d&&z(a=j.selector||a);if(c=c||[],1===l.length){if(f=l[0]=l[0].slice(0),f.length>2&&"ID"===(g=f[0]).type&&v.getById&&9===b.nodeType&&I&&w.relative[f[1].type]){if(b=(w.find.ID(g.matches[0].replace(vb,wb),b)||[])[0],!b)return c;j&&(b=b.parentNode),a=a.slice(f.shift().value.length)}for(e=ob.needsContext.test(a)?0:f.length;e--&&(g=f[e],!w.relative[h=g.type]);)if((i=w.find[h])&&(d=i(g.matches[0].replace(vb,wb),tb.test(f[0].type)&&k(b.parentNode)||b))){if(f.splice(e,1),a=d.length&&m(f),!a)return _.apply(c,d),c;break}}return(j||A(a,l))(d,b,!I,c,tb.test(a)&&k(b.parentNode)||b),c},v.sortStable=N.split("").sort(U).join("")===N,v.detectDuplicates=!!E,F(),v.sortDetached=e(function(a){return 1&a.compareDocumentPosition(G.createElement("div"))}),e(function(a){return a.innerHTML="<a href='#'></a>","#"===a.firstChild.getAttribute("href")})||f("type|href|height|width",function(a,b,c){return c?void 0:a.getAttribute(b,"type"===b.toLowerCase()?1:2)}),v.attributes&&e(function(a){return a.innerHTML="<input/>",a.firstChild.setAttribute("value",""),""===a.firstChild.getAttribute("value")})||f("value",function(a,b,c){return c||"input"!==a.nodeName.toLowerCase()?void 0:a.defaultValue}),e(function(a){return null==a.getAttribute("disabled")})||f(cb,function(a,b,c){var d;return c?void 0:a[b]===!0?b.toLowerCase():(d=a.getAttributeNode(b))&&d.specified?d.value:null}),b}(a);_.find=eb,_.expr=eb.selectors,_.expr[":"]=_.expr.pseudos,_.unique=eb.uniqueSort,_.text=eb.getText,_.isXMLDoc=eb.isXML,_.contains=eb.contains;var fb=_.expr.match.needsContext,gb=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,hb=/^.[^:#\[\.,]*$/;_.filter=function(a,b,c){var d=b[0];return c&&(a=":not("+a+")"),1===b.length&&1===d.nodeType?_.find.matchesSelector(d,a)?[d]:[]:_.find.matches(a,_.grep(b,function(a){return 1===a.nodeType}))},_.fn.extend({find:function(a){var b,c=this.length,d=[],e=this;if("string"!=typeof a)return this.pushStack(_(a).filter(function(){for(b=0;c>b;b++)if(_.contains(e[b],this))return!0
}));for(b=0;c>b;b++)_.find(a,e[b],d);return d=this.pushStack(c>1?_.unique(d):d),d.selector=this.selector?this.selector+" "+a:a,d},filter:function(a){return this.pushStack(d(this,a||[],!1))},not:function(a){return this.pushStack(d(this,a||[],!0))},is:function(a){return!!d(this,"string"==typeof a&&fb.test(a)?_(a):a||[],!1).length}});var ib,jb=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,kb=_.fn.init=function(a,b){var c,d;if(!a)return this;if("string"==typeof a){if(c="<"===a[0]&&">"===a[a.length-1]&&a.length>=3?[null,a,null]:jb.exec(a),!c||!c[1]&&b)return!b||b.jquery?(b||ib).find(a):this.constructor(b).find(a);if(c[1]){if(b=b instanceof _?b[0]:b,_.merge(this,_.parseHTML(c[1],b&&b.nodeType?b.ownerDocument||b:Z,!0)),gb.test(c[1])&&_.isPlainObject(b))for(c in b)_.isFunction(this[c])?this[c](b[c]):this.attr(c,b[c]);return this}return d=Z.getElementById(c[2]),d&&d.parentNode&&(this.length=1,this[0]=d),this.context=Z,this.selector=a,this}return a.nodeType?(this.context=this[0]=a,this.length=1,this):_.isFunction(a)?"undefined"!=typeof ib.ready?ib.ready(a):a(_):(void 0!==a.selector&&(this.selector=a.selector,this.context=a.context),_.makeArray(a,this))};kb.prototype=_.fn,ib=_(Z);var lb=/^(?:parents|prev(?:Until|All))/,mb={children:!0,contents:!0,next:!0,prev:!0};_.extend({dir:function(a,b,c){for(var d=[],e=void 0!==c;(a=a[b])&&9!==a.nodeType;)if(1===a.nodeType){if(e&&_(a).is(c))break;d.push(a)}return d},sibling:function(a,b){for(var c=[];a;a=a.nextSibling)1===a.nodeType&&a!==b&&c.push(a);return c}}),_.fn.extend({has:function(a){var b=_(a,this),c=b.length;return this.filter(function(){for(var a=0;c>a;a++)if(_.contains(this,b[a]))return!0})},closest:function(a,b){for(var c,d=0,e=this.length,f=[],g=fb.test(a)||"string"!=typeof a?_(a,b||this.context):0;e>d;d++)for(c=this[d];c&&c!==b;c=c.parentNode)if(c.nodeType<11&&(g?g.index(c)>-1:1===c.nodeType&&_.find.matchesSelector(c,a))){f.push(c);break}return this.pushStack(f.length>1?_.unique(f):f)},index:function(a){return a?"string"==typeof a?U.call(_(a),this[0]):U.call(this,a.jquery?a[0]:a):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(a,b){return this.pushStack(_.unique(_.merge(this.get(),_(a,b))))},addBack:function(a){return this.add(null==a?this.prevObject:this.prevObject.filter(a))}}),_.each({parent:function(a){var b=a.parentNode;return b&&11!==b.nodeType?b:null},parents:function(a){return _.dir(a,"parentNode")},parentsUntil:function(a,b,c){return _.dir(a,"parentNode",c)},next:function(a){return e(a,"nextSibling")},prev:function(a){return e(a,"previousSibling")},nextAll:function(a){return _.dir(a,"nextSibling")},prevAll:function(a){return _.dir(a,"previousSibling")},nextUntil:function(a,b,c){return _.dir(a,"nextSibling",c)},prevUntil:function(a,b,c){return _.dir(a,"previousSibling",c)},siblings:function(a){return _.sibling((a.parentNode||{}).firstChild,a)},children:function(a){return _.sibling(a.firstChild)},contents:function(a){return a.contentDocument||_.merge([],a.childNodes)}},function(a,b){_.fn[a]=function(c,d){var e=_.map(this,b,c);return"Until"!==a.slice(-5)&&(d=c),d&&"string"==typeof d&&(e=_.filter(d,e)),this.length>1&&(mb[a]||_.unique(e),lb.test(a)&&e.reverse()),this.pushStack(e)}});var nb=/\S+/g,ob={};_.Callbacks=function(a){a="string"==typeof a?ob[a]||f(a):_.extend({},a);var b,c,d,e,g,h,i=[],j=!a.once&&[],k=function(f){for(b=a.memory&&f,c=!0,h=e||0,e=0,g=i.length,d=!0;i&&g>h;h++)if(i[h].apply(f[0],f[1])===!1&&a.stopOnFalse){b=!1;break}d=!1,i&&(j?j.length&&k(j.shift()):b?i=[]:l.disable())},l={add:function(){if(i){var c=i.length;!function f(b){_.each(b,function(b,c){var d=_.type(c);"function"===d?a.unique&&l.has(c)||i.push(c):c&&c.length&&"string"!==d&&f(c)})}(arguments),d?g=i.length:b&&(e=c,k(b))}return this},remove:function(){return i&&_.each(arguments,function(a,b){for(var c;(c=_.inArray(b,i,c))>-1;)i.splice(c,1),d&&(g>=c&&g--,h>=c&&h--)}),this},has:function(a){return a?_.inArray(a,i)>-1:!(!i||!i.length)},empty:function(){return i=[],g=0,this},disable:function(){return i=j=b=void 0,this},disabled:function(){return!i},lock:function(){return j=void 0,b||l.disable(),this},locked:function(){return!j},fireWith:function(a,b){return!i||c&&!j||(b=b||[],b=[a,b.slice?b.slice():b],d?j.push(b):k(b)),this},fire:function(){return l.fireWith(this,arguments),this},fired:function(){return!!c}};return l},_.extend({Deferred:function(a){var b=[["resolve","done",_.Callbacks("once memory"),"resolved"],["reject","fail",_.Callbacks("once memory"),"rejected"],["notify","progress",_.Callbacks("memory")]],c="pending",d={state:function(){return c},always:function(){return e.done(arguments).fail(arguments),this},then:function(){var a=arguments;return _.Deferred(function(c){_.each(b,function(b,f){var g=_.isFunction(a[b])&&a[b];e[f[1]](function(){var a=g&&g.apply(this,arguments);a&&_.isFunction(a.promise)?a.promise().done(c.resolve).fail(c.reject).progress(c.notify):c[f[0]+"With"](this===d?c.promise():this,g?[a]:arguments)})}),a=null}).promise()},promise:function(a){return null!=a?_.extend(a,d):d}},e={};return d.pipe=d.then,_.each(b,function(a,f){var g=f[2],h=f[3];d[f[1]]=g.add,h&&g.add(function(){c=h},b[1^a][2].disable,b[2][2].lock),e[f[0]]=function(){return e[f[0]+"With"](this===e?d:this,arguments),this},e[f[0]+"With"]=g.fireWith}),d.promise(e),a&&a.call(e,e),e},when:function(a){var b,c,d,e=0,f=R.call(arguments),g=f.length,h=1!==g||a&&_.isFunction(a.promise)?g:0,i=1===h?a:_.Deferred(),j=function(a,c,d){return function(e){c[a]=this,d[a]=arguments.length>1?R.call(arguments):e,d===b?i.notifyWith(c,d):--h||i.resolveWith(c,d)}};if(g>1)for(b=new Array(g),c=new Array(g),d=new Array(g);g>e;e++)f[e]&&_.isFunction(f[e].promise)?f[e].promise().done(j(e,d,f)).fail(i.reject).progress(j(e,c,b)):--h;return h||i.resolveWith(d,f),i.promise()}});var pb;_.fn.ready=function(a){return _.ready.promise().done(a),this},_.extend({isReady:!1,readyWait:1,holdReady:function(a){a?_.readyWait++:_.ready(!0)},ready:function(a){(a===!0?--_.readyWait:_.isReady)||(_.isReady=!0,a!==!0&&--_.readyWait>0||(pb.resolveWith(Z,[_]),_.fn.triggerHandler&&(_(Z).triggerHandler("ready"),_(Z).off("ready"))))}}),_.ready.promise=function(b){return pb||(pb=_.Deferred(),"complete"===Z.readyState?setTimeout(_.ready):(Z.addEventListener("DOMContentLoaded",g,!1),a.addEventListener("load",g,!1))),pb.promise(b)},_.ready.promise();var qb=_.access=function(a,b,c,d,e,f,g){var h=0,i=a.length,j=null==c;if("object"===_.type(c)){e=!0;for(h in c)_.access(a,b,h,c[h],!0,f,g)}else if(void 0!==d&&(e=!0,_.isFunction(d)||(g=!0),j&&(g?(b.call(a,d),b=null):(j=b,b=function(a,b,c){return j.call(_(a),c)})),b))for(;i>h;h++)b(a[h],c,g?d:d.call(a[h],h,b(a[h],c)));return e?a:j?b.call(a):i?b(a[0],c):f};_.acceptData=function(a){return 1===a.nodeType||9===a.nodeType||!+a.nodeType},h.uid=1,h.accepts=_.acceptData,h.prototype={key:function(a){if(!h.accepts(a))return 0;var b={},c=a[this.expando];if(!c){c=h.uid++;try{b[this.expando]={value:c},Object.defineProperties(a,b)}catch(d){b[this.expando]=c,_.extend(a,b)}}return this.cache[c]||(this.cache[c]={}),c},set:function(a,b,c){var d,e=this.key(a),f=this.cache[e];if("string"==typeof b)f[b]=c;else if(_.isEmptyObject(f))_.extend(this.cache[e],b);else for(d in b)f[d]=b[d];return f},get:function(a,b){var c=this.cache[this.key(a)];return void 0===b?c:c[b]},access:function(a,b,c){var d;return void 0===b||b&&"string"==typeof b&&void 0===c?(d=this.get(a,b),void 0!==d?d:this.get(a,_.camelCase(b))):(this.set(a,b,c),void 0!==c?c:b)},remove:function(a,b){var c,d,e,f=this.key(a),g=this.cache[f];if(void 0===b)this.cache[f]={};else{_.isArray(b)?d=b.concat(b.map(_.camelCase)):(e=_.camelCase(b),b in g?d=[b,e]:(d=e,d=d in g?[d]:d.match(nb)||[])),c=d.length;for(;c--;)delete g[d[c]]}},hasData:function(a){return!_.isEmptyObject(this.cache[a[this.expando]]||{})},discard:function(a){a[this.expando]&&delete this.cache[a[this.expando]]}};var rb=new h,sb=new h,tb=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,ub=/([A-Z])/g;_.extend({hasData:function(a){return sb.hasData(a)||rb.hasData(a)},data:function(a,b,c){return sb.access(a,b,c)},removeData:function(a,b){sb.remove(a,b)},_data:function(a,b,c){return rb.access(a,b,c)},_removeData:function(a,b){rb.remove(a,b)}}),_.fn.extend({data:function(a,b){var c,d,e,f=this[0],g=f&&f.attributes;if(void 0===a){if(this.length&&(e=sb.get(f),1===f.nodeType&&!rb.get(f,"hasDataAttrs"))){for(c=g.length;c--;)g[c]&&(d=g[c].name,0===d.indexOf("data-")&&(d=_.camelCase(d.slice(5)),i(f,d,e[d])));rb.set(f,"hasDataAttrs",!0)}return e}return"object"==typeof a?this.each(function(){sb.set(this,a)}):qb(this,function(b){var c,d=_.camelCase(a);if(f&&void 0===b){if(c=sb.get(f,a),void 0!==c)return c;if(c=sb.get(f,d),void 0!==c)return c;if(c=i(f,d,void 0),void 0!==c)return c}else this.each(function(){var c=sb.get(this,d);sb.set(this,d,b),-1!==a.indexOf("-")&&void 0!==c&&sb.set(this,a,b)})},null,b,arguments.length>1,null,!0)},removeData:function(a){return this.each(function(){sb.remove(this,a)})}}),_.extend({queue:function(a,b,c){var d;return a?(b=(b||"fx")+"queue",d=rb.get(a,b),c&&(!d||_.isArray(c)?d=rb.access(a,b,_.makeArray(c)):d.push(c)),d||[]):void 0},dequeue:function(a,b){b=b||"fx";var c=_.queue(a,b),d=c.length,e=c.shift(),f=_._queueHooks(a,b),g=function(){_.dequeue(a,b)};"inprogress"===e&&(e=c.shift(),d--),e&&("fx"===b&&c.unshift("inprogress"),delete f.stop,e.call(a,g,f)),!d&&f&&f.empty.fire()},_queueHooks:function(a,b){var c=b+"queueHooks";return rb.get(a,c)||rb.access(a,c,{empty:_.Callbacks("once memory").add(function(){rb.remove(a,[b+"queue",c])})})}}),_.fn.extend({queue:function(a,b){var c=2;return"string"!=typeof a&&(b=a,a="fx",c--),arguments.length<c?_.queue(this[0],a):void 0===b?this:this.each(function(){var c=_.queue(this,a,b);_._queueHooks(this,a),"fx"===a&&"inprogress"!==c[0]&&_.dequeue(this,a)})},dequeue:function(a){return this.each(function(){_.dequeue(this,a)})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,b){var c,d=1,e=_.Deferred(),f=this,g=this.length,h=function(){--d||e.resolveWith(f,[f])};for("string"!=typeof a&&(b=a,a=void 0),a=a||"fx";g--;)c=rb.get(f[g],a+"queueHooks"),c&&c.empty&&(d++,c.empty.add(h));return h(),e.promise(b)}});var vb=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,wb=["Top","Right","Bottom","Left"],xb=function(a,b){return a=b||a,"none"===_.css(a,"display")||!_.contains(a.ownerDocument,a)},yb=/^(?:checkbox|radio)$/i;!function(){var a=Z.createDocumentFragment(),b=a.appendChild(Z.createElement("div")),c=Z.createElement("input");c.setAttribute("type","radio"),c.setAttribute("checked","checked"),c.setAttribute("name","t"),b.appendChild(c),Y.checkClone=b.cloneNode(!0).cloneNode(!0).lastChild.checked,b.innerHTML="<textarea>x</textarea>",Y.noCloneChecked=!!b.cloneNode(!0).lastChild.defaultValue}();var zb="undefined";Y.focusinBubbles="onfocusin"in a;var Ab=/^key/,Bb=/^(?:mouse|pointer|contextmenu)|click/,Cb=/^(?:focusinfocus|focusoutblur)$/,Db=/^([^.]*)(?:\.(.+)|)$/;_.event={global:{},add:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,n,o,p,q=rb.get(a);if(q)for(c.handler&&(f=c,c=f.handler,e=f.selector),c.guid||(c.guid=_.guid++),(i=q.events)||(i=q.events={}),(g=q.handle)||(g=q.handle=function(b){return typeof _!==zb&&_.event.triggered!==b.type?_.event.dispatch.apply(a,arguments):void 0}),b=(b||"").match(nb)||[""],j=b.length;j--;)h=Db.exec(b[j])||[],n=p=h[1],o=(h[2]||"").split(".").sort(),n&&(l=_.event.special[n]||{},n=(e?l.delegateType:l.bindType)||n,l=_.event.special[n]||{},k=_.extend({type:n,origType:p,data:d,handler:c,guid:c.guid,selector:e,needsContext:e&&_.expr.match.needsContext.test(e),namespace:o.join(".")},f),(m=i[n])||(m=i[n]=[],m.delegateCount=0,l.setup&&l.setup.call(a,d,o,g)!==!1||a.addEventListener&&a.addEventListener(n,g,!1)),l.add&&(l.add.call(a,k),k.handler.guid||(k.handler.guid=c.guid)),e?m.splice(m.delegateCount++,0,k):m.push(k),_.event.global[n]=!0)},remove:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,n,o,p,q=rb.hasData(a)&&rb.get(a);if(q&&(i=q.events)){for(b=(b||"").match(nb)||[""],j=b.length;j--;)if(h=Db.exec(b[j])||[],n=p=h[1],o=(h[2]||"").split(".").sort(),n){for(l=_.event.special[n]||{},n=(d?l.delegateType:l.bindType)||n,m=i[n]||[],h=h[2]&&new RegExp("(^|\\.)"+o.join("\\.(?:.*\\.|)")+"(\\.|$)"),g=f=m.length;f--;)k=m[f],!e&&p!==k.origType||c&&c.guid!==k.guid||h&&!h.test(k.namespace)||d&&d!==k.selector&&("**"!==d||!k.selector)||(m.splice(f,1),k.selector&&m.delegateCount--,l.remove&&l.remove.call(a,k));g&&!m.length&&(l.teardown&&l.teardown.call(a,o,q.handle)!==!1||_.removeEvent(a,n,q.handle),delete i[n])}else for(n in i)_.event.remove(a,n+b[j],c,d,!0);_.isEmptyObject(i)&&(delete q.handle,rb.remove(a,"events"))}},trigger:function(b,c,d,e){var f,g,h,i,j,k,l,m=[d||Z],n=X.call(b,"type")?b.type:b,o=X.call(b,"namespace")?b.namespace.split("."):[];if(g=h=d=d||Z,3!==d.nodeType&&8!==d.nodeType&&!Cb.test(n+_.event.triggered)&&(n.indexOf(".")>=0&&(o=n.split("."),n=o.shift(),o.sort()),j=n.indexOf(":")<0&&"on"+n,b=b[_.expando]?b:new _.Event(n,"object"==typeof b&&b),b.isTrigger=e?2:3,b.namespace=o.join("."),b.namespace_re=b.namespace?new RegExp("(^|\\.)"+o.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,b.result=void 0,b.target||(b.target=d),c=null==c?[b]:_.makeArray(c,[b]),l=_.event.special[n]||{},e||!l.trigger||l.trigger.apply(d,c)!==!1)){if(!e&&!l.noBubble&&!_.isWindow(d)){for(i=l.delegateType||n,Cb.test(i+n)||(g=g.parentNode);g;g=g.parentNode)m.push(g),h=g;h===(d.ownerDocument||Z)&&m.push(h.defaultView||h.parentWindow||a)}for(f=0;(g=m[f++])&&!b.isPropagationStopped();)b.type=f>1?i:l.bindType||n,k=(rb.get(g,"events")||{})[b.type]&&rb.get(g,"handle"),k&&k.apply(g,c),k=j&&g[j],k&&k.apply&&_.acceptData(g)&&(b.result=k.apply(g,c),b.result===!1&&b.preventDefault());return b.type=n,e||b.isDefaultPrevented()||l._default&&l._default.apply(m.pop(),c)!==!1||!_.acceptData(d)||j&&_.isFunction(d[n])&&!_.isWindow(d)&&(h=d[j],h&&(d[j]=null),_.event.triggered=n,d[n](),_.event.triggered=void 0,h&&(d[j]=h)),b.result}},dispatch:function(a){a=_.event.fix(a);var b,c,d,e,f,g=[],h=R.call(arguments),i=(rb.get(this,"events")||{})[a.type]||[],j=_.event.special[a.type]||{};if(h[0]=a,a.delegateTarget=this,!j.preDispatch||j.preDispatch.call(this,a)!==!1){for(g=_.event.handlers.call(this,a,i),b=0;(e=g[b++])&&!a.isPropagationStopped();)for(a.currentTarget=e.elem,c=0;(f=e.handlers[c++])&&!a.isImmediatePropagationStopped();)(!a.namespace_re||a.namespace_re.test(f.namespace))&&(a.handleObj=f,a.data=f.data,d=((_.event.special[f.origType]||{}).handle||f.handler).apply(e.elem,h),void 0!==d&&(a.result=d)===!1&&(a.preventDefault(),a.stopPropagation()));return j.postDispatch&&j.postDispatch.call(this,a),a.result}},handlers:function(a,b){var c,d,e,f,g=[],h=b.delegateCount,i=a.target;if(h&&i.nodeType&&(!a.button||"click"!==a.type))for(;i!==this;i=i.parentNode||this)if(i.disabled!==!0||"click"!==a.type){for(d=[],c=0;h>c;c++)f=b[c],e=f.selector+" ",void 0===d[e]&&(d[e]=f.needsContext?_(e,this).index(i)>=0:_.find(e,this,null,[i]).length),d[e]&&d.push(f);d.length&&g.push({elem:i,handlers:d})}return h<b.length&&g.push({elem:this,handlers:b.slice(h)}),g},props:"altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(a,b){return null==a.which&&(a.which=null!=b.charCode?b.charCode:b.keyCode),a}},mouseHooks:{props:"button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(a,b){var c,d,e,f=b.button;return null==a.pageX&&null!=b.clientX&&(c=a.target.ownerDocument||Z,d=c.documentElement,e=c.body,a.pageX=b.clientX+(d&&d.scrollLeft||e&&e.scrollLeft||0)-(d&&d.clientLeft||e&&e.clientLeft||0),a.pageY=b.clientY+(d&&d.scrollTop||e&&e.scrollTop||0)-(d&&d.clientTop||e&&e.clientTop||0)),a.which||void 0===f||(a.which=1&f?1:2&f?3:4&f?2:0),a}},fix:function(a){if(a[_.expando])return a;var b,c,d,e=a.type,f=a,g=this.fixHooks[e];for(g||(this.fixHooks[e]=g=Bb.test(e)?this.mouseHooks:Ab.test(e)?this.keyHooks:{}),d=g.props?this.props.concat(g.props):this.props,a=new _.Event(f),b=d.length;b--;)c=d[b],a[c]=f[c];return a.target||(a.target=Z),3===a.target.nodeType&&(a.target=a.target.parentNode),g.filter?g.filter(a,f):a},special:{load:{noBubble:!0},focus:{trigger:function(){return this!==l()&&this.focus?(this.focus(),!1):void 0},delegateType:"focusin"},blur:{trigger:function(){return this===l()&&this.blur?(this.blur(),!1):void 0},delegateType:"focusout"},click:{trigger:function(){return"checkbox"===this.type&&this.click&&_.nodeName(this,"input")?(this.click(),!1):void 0},_default:function(a){return _.nodeName(a.target,"a")}},beforeunload:{postDispatch:function(a){void 0!==a.result&&a.originalEvent&&(a.originalEvent.returnValue=a.result)}}},simulate:function(a,b,c,d){var e=_.extend(new _.Event,c,{type:a,isSimulated:!0,originalEvent:{}});d?_.event.trigger(e,null,b):_.event.dispatch.call(b,e),e.isDefaultPrevented()&&c.preventDefault()}},_.removeEvent=function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c,!1)},_.Event=function(a,b){return this instanceof _.Event?(a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||void 0===a.defaultPrevented&&a.returnValue===!1?j:k):this.type=a,b&&_.extend(this,b),this.timeStamp=a&&a.timeStamp||_.now(),void(this[_.expando]=!0)):new _.Event(a,b)},_.Event.prototype={isDefaultPrevented:k,isPropagationStopped:k,isImmediatePropagationStopped:k,preventDefault:function(){var a=this.originalEvent;this.isDefaultPrevented=j,a&&a.preventDefault&&a.preventDefault()},stopPropagation:function(){var a=this.originalEvent;this.isPropagationStopped=j,a&&a.stopPropagation&&a.stopPropagation()},stopImmediatePropagation:function(){var a=this.originalEvent;this.isImmediatePropagationStopped=j,a&&a.stopImmediatePropagation&&a.stopImmediatePropagation(),this.stopPropagation()}},_.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(a,b){_.event.special[a]={delegateType:b,bindType:b,handle:function(a){var c,d=this,e=a.relatedTarget,f=a.handleObj;return(!e||e!==d&&!_.contains(d,e))&&(a.type=f.origType,c=f.handler.apply(this,arguments),a.type=b),c}}}),Y.focusinBubbles||_.each({focus:"focusin",blur:"focusout"},function(a,b){var c=function(a){_.event.simulate(b,a.target,_.event.fix(a),!0)};_.event.special[b]={setup:function(){var d=this.ownerDocument||this,e=rb.access(d,b);e||d.addEventListener(a,c,!0),rb.access(d,b,(e||0)+1)},teardown:function(){var d=this.ownerDocument||this,e=rb.access(d,b)-1;e?rb.access(d,b,e):(d.removeEventListener(a,c,!0),rb.remove(d,b))}}}),_.fn.extend({on:function(a,b,c,d,e){var f,g;if("object"==typeof a){"string"!=typeof b&&(c=c||b,b=void 0);for(g in a)this.on(g,b,c,a[g],e);return this}if(null==c&&null==d?(d=b,c=b=void 0):null==d&&("string"==typeof b?(d=c,c=void 0):(d=c,c=b,b=void 0)),d===!1)d=k;else if(!d)return this;return 1===e&&(f=d,d=function(a){return _().off(a),f.apply(this,arguments)},d.guid=f.guid||(f.guid=_.guid++)),this.each(function(){_.event.add(this,a,d,c,b)})},one:function(a,b,c,d){return this.on(a,b,c,d,1)},off:function(a,b,c){var d,e;if(a&&a.preventDefault&&a.handleObj)return d=a.handleObj,_(a.delegateTarget).off(d.namespace?d.origType+"."+d.namespace:d.origType,d.selector,d.handler),this;if("object"==typeof a){for(e in a)this.off(e,b,a[e]);return this}return(b===!1||"function"==typeof b)&&(c=b,b=void 0),c===!1&&(c=k),this.each(function(){_.event.remove(this,a,c,b)})},trigger:function(a,b){return this.each(function(){_.event.trigger(a,b,this)})},triggerHandler:function(a,b){var c=this[0];return c?_.event.trigger(a,b,c,!0):void 0}});var Eb=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,Fb=/<([\w:]+)/,Gb=/<|&#?\w+;/,Hb=/<(?:script|style|link)/i,Ib=/checked\s*(?:[^=]|=\s*.checked.)/i,Jb=/^$|\/(?:java|ecma)script/i,Kb=/^true\/(.*)/,Lb=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,Mb={option:[1,"<select multiple='multiple'>","</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};Mb.optgroup=Mb.option,Mb.tbody=Mb.tfoot=Mb.colgroup=Mb.caption=Mb.thead,Mb.th=Mb.td,_.extend({clone:function(a,b,c){var d,e,f,g,h=a.cloneNode(!0),i=_.contains(a.ownerDocument,a);if(!(Y.noCloneChecked||1!==a.nodeType&&11!==a.nodeType||_.isXMLDoc(a)))for(g=r(h),f=r(a),d=0,e=f.length;e>d;d++)s(f[d],g[d]);if(b)if(c)for(f=f||r(a),g=g||r(h),d=0,e=f.length;e>d;d++)q(f[d],g[d]);else q(a,h);return g=r(h,"script"),g.length>0&&p(g,!i&&r(a,"script")),h},buildFragment:function(a,b,c,d){for(var e,f,g,h,i,j,k=b.createDocumentFragment(),l=[],m=0,n=a.length;n>m;m++)if(e=a[m],e||0===e)if("object"===_.type(e))_.merge(l,e.nodeType?[e]:e);else if(Gb.test(e)){for(f=f||k.appendChild(b.createElement("div")),g=(Fb.exec(e)||["",""])[1].toLowerCase(),h=Mb[g]||Mb._default,f.innerHTML=h[1]+e.replace(Eb,"<$1></$2>")+h[2],j=h[0];j--;)f=f.lastChild;_.merge(l,f.childNodes),f=k.firstChild,f.textContent=""}else l.push(b.createTextNode(e));for(k.textContent="",m=0;e=l[m++];)if((!d||-1===_.inArray(e,d))&&(i=_.contains(e.ownerDocument,e),f=r(k.appendChild(e),"script"),i&&p(f),c))for(j=0;e=f[j++];)Jb.test(e.type||"")&&c.push(e);return k},cleanData:function(a){for(var b,c,d,e,f=_.event.special,g=0;void 0!==(c=a[g]);g++){if(_.acceptData(c)&&(e=c[rb.expando],e&&(b=rb.cache[e]))){if(b.events)for(d in b.events)f[d]?_.event.remove(c,d):_.removeEvent(c,d,b.handle);rb.cache[e]&&delete rb.cache[e]}delete sb.cache[c[sb.expando]]}}}),_.fn.extend({text:function(a){return qb(this,function(a){return void 0===a?_.text(this):this.empty().each(function(){(1===this.nodeType||11===this.nodeType||9===this.nodeType)&&(this.textContent=a)})},null,a,arguments.length)},append:function(){return this.domManip(arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=m(this,a);b.appendChild(a)}})},prepend:function(){return this.domManip(arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=m(this,a);b.insertBefore(a,b.firstChild)}})},before:function(){return this.domManip(arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this)})},after:function(){return this.domManip(arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this.nextSibling)})},remove:function(a,b){for(var c,d=a?_.filter(a,this):this,e=0;null!=(c=d[e]);e++)b||1!==c.nodeType||_.cleanData(r(c)),c.parentNode&&(b&&_.contains(c.ownerDocument,c)&&p(r(c,"script")),c.parentNode.removeChild(c));return this},empty:function(){for(var a,b=0;null!=(a=this[b]);b++)1===a.nodeType&&(_.cleanData(r(a,!1)),a.textContent="");return this},clone:function(a,b){return a=null==a?!1:a,b=null==b?a:b,this.map(function(){return _.clone(this,a,b)})},html:function(a){return qb(this,function(a){var b=this[0]||{},c=0,d=this.length;if(void 0===a&&1===b.nodeType)return b.innerHTML;if("string"==typeof a&&!Hb.test(a)&&!Mb[(Fb.exec(a)||["",""])[1].toLowerCase()]){a=a.replace(Eb,"<$1></$2>");try{for(;d>c;c++)b=this[c]||{},1===b.nodeType&&(_.cleanData(r(b,!1)),b.innerHTML=a);b=0}catch(e){}}b&&this.empty().append(a)},null,a,arguments.length)},replaceWith:function(){var a=arguments[0];return this.domManip(arguments,function(b){a=this.parentNode,_.cleanData(r(this)),a&&a.replaceChild(b,this)}),a&&(a.length||a.nodeType)?this:this.remove()},detach:function(a){return this.remove(a,!0)},domManip:function(a,b){a=S.apply([],a);var c,d,e,f,g,h,i=0,j=this.length,k=this,l=j-1,m=a[0],p=_.isFunction(m);if(p||j>1&&"string"==typeof m&&!Y.checkClone&&Ib.test(m))return this.each(function(c){var d=k.eq(c);p&&(a[0]=m.call(this,c,d.html())),d.domManip(a,b)});if(j&&(c=_.buildFragment(a,this[0].ownerDocument,!1,this),d=c.firstChild,1===c.childNodes.length&&(c=d),d)){for(e=_.map(r(c,"script"),n),f=e.length;j>i;i++)g=c,i!==l&&(g=_.clone(g,!0,!0),f&&_.merge(e,r(g,"script"))),b.call(this[i],g,i);if(f)for(h=e[e.length-1].ownerDocument,_.map(e,o),i=0;f>i;i++)g=e[i],Jb.test(g.type||"")&&!rb.access(g,"globalEval")&&_.contains(h,g)&&(g.src?_._evalUrl&&_._evalUrl(g.src):_.globalEval(g.textContent.replace(Lb,"")))}return this}}),_.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){_.fn[a]=function(a){for(var c,d=[],e=_(a),f=e.length-1,g=0;f>=g;g++)c=g===f?this:this.clone(!0),_(e[g])[b](c),T.apply(d,c.get());return this.pushStack(d)}});var Nb,Ob={},Pb=/^margin/,Qb=new RegExp("^("+vb+")(?!px)[a-z%]+$","i"),Rb=function(a){return a.ownerDocument.defaultView.getComputedStyle(a,null)};!function(){function b(){g.style.cssText="-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;display:block;margin-top:1%;top:1%;border:1px;padding:1px;width:4px;position:absolute",g.innerHTML="",e.appendChild(f);var b=a.getComputedStyle(g,null);c="1%"!==b.top,d="4px"===b.width,e.removeChild(f)}var c,d,e=Z.documentElement,f=Z.createElement("div"),g=Z.createElement("div");g.style&&(g.style.backgroundClip="content-box",g.cloneNode(!0).style.backgroundClip="",Y.clearCloneStyle="content-box"===g.style.backgroundClip,f.style.cssText="border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;position:absolute",f.appendChild(g),a.getComputedStyle&&_.extend(Y,{pixelPosition:function(){return b(),c},boxSizingReliable:function(){return null==d&&b(),d},reliableMarginRight:function(){var b,c=g.appendChild(Z.createElement("div"));return c.style.cssText=g.style.cssText="-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:0",c.style.marginRight=c.style.width="0",g.style.width="1px",e.appendChild(f),b=!parseFloat(a.getComputedStyle(c,null).marginRight),e.removeChild(f),b}}))}(),_.swap=function(a,b,c,d){var e,f,g={};for(f in b)g[f]=a.style[f],a.style[f]=b[f];e=c.apply(a,d||[]);for(f in b)a.style[f]=g[f];return e};var Sb=/^(none|table(?!-c[ea]).+)/,Tb=new RegExp("^("+vb+")(.*)$","i"),Ub=new RegExp("^([+-])=("+vb+")","i"),Vb={position:"absolute",visibility:"hidden",display:"block"},Wb={letterSpacing:"0",fontWeight:"400"},Xb=["Webkit","O","Moz","ms"];_.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=v(a,"opacity");return""===c?"1":c}}}},cssNumber:{columnCount:!0,fillOpacity:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":"cssFloat"},style:function(a,b,c,d){if(a&&3!==a.nodeType&&8!==a.nodeType&&a.style){var e,f,g,h=_.camelCase(b),i=a.style;return b=_.cssProps[h]||(_.cssProps[h]=x(i,h)),g=_.cssHooks[b]||_.cssHooks[h],void 0===c?g&&"get"in g&&void 0!==(e=g.get(a,!1,d))?e:i[b]:(f=typeof c,"string"===f&&(e=Ub.exec(c))&&(c=(e[1]+1)*e[2]+parseFloat(_.css(a,b)),f="number"),void(null!=c&&c===c&&("number"!==f||_.cssNumber[h]||(c+="px"),Y.clearCloneStyle||""!==c||0!==b.indexOf("background")||(i[b]="inherit"),g&&"set"in g&&void 0===(c=g.set(a,c,d))||(i[b]=c))))}},css:function(a,b,c,d){var e,f,g,h=_.camelCase(b);return b=_.cssProps[h]||(_.cssProps[h]=x(a.style,h)),g=_.cssHooks[b]||_.cssHooks[h],g&&"get"in g&&(e=g.get(a,!0,c)),void 0===e&&(e=v(a,b,d)),"normal"===e&&b in Wb&&(e=Wb[b]),""===c||c?(f=parseFloat(e),c===!0||_.isNumeric(f)?f||0:e):e}}),_.each(["height","width"],function(a,b){_.cssHooks[b]={get:function(a,c,d){return c?Sb.test(_.css(a,"display"))&&0===a.offsetWidth?_.swap(a,Vb,function(){return A(a,b,d)}):A(a,b,d):void 0},set:function(a,c,d){var e=d&&Rb(a);return y(a,c,d?z(a,b,d,"border-box"===_.css(a,"boxSizing",!1,e),e):0)}}}),_.cssHooks.marginRight=w(Y.reliableMarginRight,function(a,b){return b?_.swap(a,{display:"inline-block"},v,[a,"marginRight"]):void 0}),_.each({margin:"",padding:"",border:"Width"},function(a,b){_.cssHooks[a+b]={expand:function(c){for(var d=0,e={},f="string"==typeof c?c.split(" "):[c];4>d;d++)e[a+wb[d]+b]=f[d]||f[d-2]||f[0];return e}},Pb.test(a)||(_.cssHooks[a+b].set=y)}),_.fn.extend({css:function(a,b){return qb(this,function(a,b,c){var d,e,f={},g=0;if(_.isArray(b)){for(d=Rb(a),e=b.length;e>g;g++)f[b[g]]=_.css(a,b[g],!1,d);return f}return void 0!==c?_.style(a,b,c):_.css(a,b)},a,b,arguments.length>1)},show:function(){return B(this,!0)},hide:function(){return B(this)},toggle:function(a){return"boolean"==typeof a?a?this.show():this.hide():this.each(function(){xb(this)?_(this).show():_(this).hide()})}}),_.Tween=C,C.prototype={constructor:C,init:function(a,b,c,d,e,f){this.elem=a,this.prop=c,this.easing=e||"swing",this.options=b,this.start=this.now=this.cur(),this.end=d,this.unit=f||(_.cssNumber[c]?"":"px")},cur:function(){var a=C.propHooks[this.prop];return a&&a.get?a.get(this):C.propHooks._default.get(this)},run:function(a){var b,c=C.propHooks[this.prop];return this.pos=b=this.options.duration?_.easing[this.easing](a,this.options.duration*a,0,1,this.options.duration):a,this.now=(this.end-this.start)*b+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),c&&c.set?c.set(this):C.propHooks._default.set(this),this}},C.prototype.init.prototype=C.prototype,C.propHooks={_default:{get:function(a){var b;return null==a.elem[a.prop]||a.elem.style&&null!=a.elem.style[a.prop]?(b=_.css(a.elem,a.prop,""),b&&"auto"!==b?b:0):a.elem[a.prop]},set:function(a){_.fx.step[a.prop]?_.fx.step[a.prop](a):a.elem.style&&(null!=a.elem.style[_.cssProps[a.prop]]||_.cssHooks[a.prop])?_.style(a.elem,a.prop,a.now+a.unit):a.elem[a.prop]=a.now}}},C.propHooks.scrollTop=C.propHooks.scrollLeft={set:function(a){a.elem.nodeType&&a.elem.parentNode&&(a.elem[a.prop]=a.now)}},_.easing={linear:function(a){return a},swing:function(a){return.5-Math.cos(a*Math.PI)/2}},_.fx=C.prototype.init,_.fx.step={};var Yb,Zb,$b=/^(?:toggle|show|hide)$/,_b=new RegExp("^(?:([+-])=|)("+vb+")([a-z%]*)$","i"),ac=/queueHooks$/,bc=[G],cc={"*":[function(a,b){var c=this.createTween(a,b),d=c.cur(),e=_b.exec(b),f=e&&e[3]||(_.cssNumber[a]?"":"px"),g=(_.cssNumber[a]||"px"!==f&&+d)&&_b.exec(_.css(c.elem,a)),h=1,i=20;if(g&&g[3]!==f){f=f||g[3],e=e||[],g=+d||1;do h=h||".5",g/=h,_.style(c.elem,a,g+f);while(h!==(h=c.cur()/d)&&1!==h&&--i)}return e&&(g=c.start=+g||+d||0,c.unit=f,c.end=e[1]?g+(e[1]+1)*e[2]:+e[2]),c}]};_.Animation=_.extend(I,{tweener:function(a,b){_.isFunction(a)?(b=a,a=["*"]):a=a.split(" ");for(var c,d=0,e=a.length;e>d;d++)c=a[d],cc[c]=cc[c]||[],cc[c].unshift(b)},prefilter:function(a,b){b?bc.unshift(a):bc.push(a)}}),_.speed=function(a,b,c){var d=a&&"object"==typeof a?_.extend({},a):{complete:c||!c&&b||_.isFunction(a)&&a,duration:a,easing:c&&b||b&&!_.isFunction(b)&&b};return d.duration=_.fx.off?0:"number"==typeof d.duration?d.duration:d.duration in _.fx.speeds?_.fx.speeds[d.duration]:_.fx.speeds._default,(null==d.queue||d.queue===!0)&&(d.queue="fx"),d.old=d.complete,d.complete=function(){_.isFunction(d.old)&&d.old.call(this),d.queue&&_.dequeue(this,d.queue)},d},_.fn.extend({fadeTo:function(a,b,c,d){return this.filter(xb).css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){var e=_.isEmptyObject(a),f=_.speed(b,c,d),g=function(){var b=I(this,_.extend({},a),f);(e||rb.get(this,"finish"))&&b.stop(!0)};return g.finish=g,e||f.queue===!1?this.each(g):this.queue(f.queue,g)},stop:function(a,b,c){var d=function(a){var b=a.stop;delete a.stop,b(c)};return"string"!=typeof a&&(c=b,b=a,a=void 0),b&&a!==!1&&this.queue(a||"fx",[]),this.each(function(){var b=!0,e=null!=a&&a+"queueHooks",f=_.timers,g=rb.get(this);if(e)g[e]&&g[e].stop&&d(g[e]);else for(e in g)g[e]&&g[e].stop&&ac.test(e)&&d(g[e]);for(e=f.length;e--;)f[e].elem!==this||null!=a&&f[e].queue!==a||(f[e].anim.stop(c),b=!1,f.splice(e,1));(b||!c)&&_.dequeue(this,a)})},finish:function(a){return a!==!1&&(a=a||"fx"),this.each(function(){var b,c=rb.get(this),d=c[a+"queue"],e=c[a+"queueHooks"],f=_.timers,g=d?d.length:0;for(c.finish=!0,_.queue(this,a,[]),e&&e.stop&&e.stop.call(this,!0),b=f.length;b--;)f[b].elem===this&&f[b].queue===a&&(f[b].anim.stop(!0),f.splice(b,1));for(b=0;g>b;b++)d[b]&&d[b].finish&&d[b].finish.call(this);delete c.finish})}}),_.each(["toggle","show","hide"],function(a,b){var c=_.fn[b];
_.fn[b]=function(a,d,e){return null==a||"boolean"==typeof a?c.apply(this,arguments):this.animate(E(b,!0),a,d,e)}}),_.each({slideDown:E("show"),slideUp:E("hide"),slideToggle:E("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){_.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),_.timers=[],_.fx.tick=function(){var a,b=0,c=_.timers;for(Yb=_.now();b<c.length;b++)a=c[b],a()||c[b]!==a||c.splice(b--,1);c.length||_.fx.stop(),Yb=void 0},_.fx.timer=function(a){_.timers.push(a),a()?_.fx.start():_.timers.pop()},_.fx.interval=13,_.fx.start=function(){Zb||(Zb=setInterval(_.fx.tick,_.fx.interval))},_.fx.stop=function(){clearInterval(Zb),Zb=null},_.fx.speeds={slow:600,fast:200,_default:400},_.fn.delay=function(a,b){return a=_.fx?_.fx.speeds[a]||a:a,b=b||"fx",this.queue(b,function(b,c){var d=setTimeout(b,a);c.stop=function(){clearTimeout(d)}})},function(){var a=Z.createElement("input"),b=Z.createElement("select"),c=b.appendChild(Z.createElement("option"));a.type="checkbox",Y.checkOn=""!==a.value,Y.optSelected=c.selected,b.disabled=!0,Y.optDisabled=!c.disabled,a=Z.createElement("input"),a.value="t",a.type="radio",Y.radioValue="t"===a.value}();var dc,ec,fc=_.expr.attrHandle;_.fn.extend({attr:function(a,b){return qb(this,_.attr,a,b,arguments.length>1)},removeAttr:function(a){return this.each(function(){_.removeAttr(this,a)})}}),_.extend({attr:function(a,b,c){var d,e,f=a.nodeType;return a&&3!==f&&8!==f&&2!==f?typeof a.getAttribute===zb?_.prop(a,b,c):(1===f&&_.isXMLDoc(a)||(b=b.toLowerCase(),d=_.attrHooks[b]||(_.expr.match.bool.test(b)?ec:dc)),void 0===c?d&&"get"in d&&null!==(e=d.get(a,b))?e:(e=_.find.attr(a,b),null==e?void 0:e):null!==c?d&&"set"in d&&void 0!==(e=d.set(a,c,b))?e:(a.setAttribute(b,c+""),c):void _.removeAttr(a,b)):void 0},removeAttr:function(a,b){var c,d,e=0,f=b&&b.match(nb);if(f&&1===a.nodeType)for(;c=f[e++];)d=_.propFix[c]||c,_.expr.match.bool.test(c)&&(a[d]=!1),a.removeAttribute(c)},attrHooks:{type:{set:function(a,b){if(!Y.radioValue&&"radio"===b&&_.nodeName(a,"input")){var c=a.value;return a.setAttribute("type",b),c&&(a.value=c),b}}}}}),ec={set:function(a,b,c){return b===!1?_.removeAttr(a,c):a.setAttribute(c,c),c}},_.each(_.expr.match.bool.source.match(/\w+/g),function(a,b){var c=fc[b]||_.find.attr;fc[b]=function(a,b,d){var e,f;return d||(f=fc[b],fc[b]=e,e=null!=c(a,b,d)?b.toLowerCase():null,fc[b]=f),e}});var gc=/^(?:input|select|textarea|button)$/i;_.fn.extend({prop:function(a,b){return qb(this,_.prop,a,b,arguments.length>1)},removeProp:function(a){return this.each(function(){delete this[_.propFix[a]||a]})}}),_.extend({propFix:{"for":"htmlFor","class":"className"},prop:function(a,b,c){var d,e,f,g=a.nodeType;return a&&3!==g&&8!==g&&2!==g?(f=1!==g||!_.isXMLDoc(a),f&&(b=_.propFix[b]||b,e=_.propHooks[b]),void 0!==c?e&&"set"in e&&void 0!==(d=e.set(a,c,b))?d:a[b]=c:e&&"get"in e&&null!==(d=e.get(a,b))?d:a[b]):void 0},propHooks:{tabIndex:{get:function(a){return a.hasAttribute("tabindex")||gc.test(a.nodeName)||a.href?a.tabIndex:-1}}}}),Y.optSelected||(_.propHooks.selected={get:function(a){var b=a.parentNode;return b&&b.parentNode&&b.parentNode.selectedIndex,null}}),_.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){_.propFix[this.toLowerCase()]=this});var hc=/[\t\r\n\f]/g;_.fn.extend({addClass:function(a){var b,c,d,e,f,g,h="string"==typeof a&&a,i=0,j=this.length;if(_.isFunction(a))return this.each(function(b){_(this).addClass(a.call(this,b,this.className))});if(h)for(b=(a||"").match(nb)||[];j>i;i++)if(c=this[i],d=1===c.nodeType&&(c.className?(" "+c.className+" ").replace(hc," "):" ")){for(f=0;e=b[f++];)d.indexOf(" "+e+" ")<0&&(d+=e+" ");g=_.trim(d),c.className!==g&&(c.className=g)}return this},removeClass:function(a){var b,c,d,e,f,g,h=0===arguments.length||"string"==typeof a&&a,i=0,j=this.length;if(_.isFunction(a))return this.each(function(b){_(this).removeClass(a.call(this,b,this.className))});if(h)for(b=(a||"").match(nb)||[];j>i;i++)if(c=this[i],d=1===c.nodeType&&(c.className?(" "+c.className+" ").replace(hc," "):"")){for(f=0;e=b[f++];)for(;d.indexOf(" "+e+" ")>=0;)d=d.replace(" "+e+" "," ");g=a?_.trim(d):"",c.className!==g&&(c.className=g)}return this},toggleClass:function(a,b){var c=typeof a;return"boolean"==typeof b&&"string"===c?b?this.addClass(a):this.removeClass(a):this.each(_.isFunction(a)?function(c){_(this).toggleClass(a.call(this,c,this.className,b),b)}:function(){if("string"===c)for(var b,d=0,e=_(this),f=a.match(nb)||[];b=f[d++];)e.hasClass(b)?e.removeClass(b):e.addClass(b);else(c===zb||"boolean"===c)&&(this.className&&rb.set(this,"__className__",this.className),this.className=this.className||a===!1?"":rb.get(this,"__className__")||"")})},hasClass:function(a){for(var b=" "+a+" ",c=0,d=this.length;d>c;c++)if(1===this[c].nodeType&&(" "+this[c].className+" ").replace(hc," ").indexOf(b)>=0)return!0;return!1}});var ic=/\r/g;_.fn.extend({val:function(a){var b,c,d,e=this[0];return arguments.length?(d=_.isFunction(a),this.each(function(c){var e;1===this.nodeType&&(e=d?a.call(this,c,_(this).val()):a,null==e?e="":"number"==typeof e?e+="":_.isArray(e)&&(e=_.map(e,function(a){return null==a?"":a+""})),b=_.valHooks[this.type]||_.valHooks[this.nodeName.toLowerCase()],b&&"set"in b&&void 0!==b.set(this,e,"value")||(this.value=e))})):e?(b=_.valHooks[e.type]||_.valHooks[e.nodeName.toLowerCase()],b&&"get"in b&&void 0!==(c=b.get(e,"value"))?c:(c=e.value,"string"==typeof c?c.replace(ic,""):null==c?"":c)):void 0}}),_.extend({valHooks:{option:{get:function(a){var b=_.find.attr(a,"value");return null!=b?b:_.trim(_.text(a))}},select:{get:function(a){for(var b,c,d=a.options,e=a.selectedIndex,f="select-one"===a.type||0>e,g=f?null:[],h=f?e+1:d.length,i=0>e?h:f?e:0;h>i;i++)if(c=d[i],!(!c.selected&&i!==e||(Y.optDisabled?c.disabled:null!==c.getAttribute("disabled"))||c.parentNode.disabled&&_.nodeName(c.parentNode,"optgroup"))){if(b=_(c).val(),f)return b;g.push(b)}return g},set:function(a,b){for(var c,d,e=a.options,f=_.makeArray(b),g=e.length;g--;)d=e[g],(d.selected=_.inArray(d.value,f)>=0)&&(c=!0);return c||(a.selectedIndex=-1),f}}}}),_.each(["radio","checkbox"],function(){_.valHooks[this]={set:function(a,b){return _.isArray(b)?a.checked=_.inArray(_(a).val(),b)>=0:void 0}},Y.checkOn||(_.valHooks[this].get=function(a){return null===a.getAttribute("value")?"on":a.value})}),_.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(a,b){_.fn[b]=function(a,c){return arguments.length>0?this.on(b,null,a,c):this.trigger(b)}}),_.fn.extend({hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)},bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return 1===arguments.length?this.off(a,"**"):this.off(b,a||"**",c)}});var jc=_.now(),kc=/\?/;_.parseJSON=function(a){return JSON.parse(a+"")},_.parseXML=function(a){var b,c;if(!a||"string"!=typeof a)return null;try{c=new DOMParser,b=c.parseFromString(a,"text/xml")}catch(d){b=void 0}return(!b||b.getElementsByTagName("parsererror").length)&&_.error("Invalid XML: "+a),b};var lc,mc,nc=/#.*$/,oc=/([?&])_=[^&]*/,pc=/^(.*?):[ \t]*([^\r\n]*)$/gm,qc=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,rc=/^(?:GET|HEAD)$/,sc=/^\/\//,tc=/^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,uc={},vc={},wc="*/".concat("*");try{mc=location.href}catch(xc){mc=Z.createElement("a"),mc.href="",mc=mc.href}lc=tc.exec(mc.toLowerCase())||[],_.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:mc,type:"GET",isLocal:qc.test(lc[1]),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":wc,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":_.parseJSON,"text xml":_.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(a,b){return b?L(L(a,_.ajaxSettings),b):L(_.ajaxSettings,a)},ajaxPrefilter:J(uc),ajaxTransport:J(vc),ajax:function(a,b){function c(a,b,c,g){var i,k,r,s,u,w=b;2!==t&&(t=2,h&&clearTimeout(h),d=void 0,f=g||"",v.readyState=a>0?4:0,i=a>=200&&300>a||304===a,c&&(s=M(l,v,c)),s=N(l,s,v,i),i?(l.ifModified&&(u=v.getResponseHeader("Last-Modified"),u&&(_.lastModified[e]=u),u=v.getResponseHeader("etag"),u&&(_.etag[e]=u)),204===a||"HEAD"===l.type?w="nocontent":304===a?w="notmodified":(w=s.state,k=s.data,r=s.error,i=!r)):(r=w,(a||!w)&&(w="error",0>a&&(a=0))),v.status=a,v.statusText=(b||w)+"",i?o.resolveWith(m,[k,w,v]):o.rejectWith(m,[v,w,r]),v.statusCode(q),q=void 0,j&&n.trigger(i?"ajaxSuccess":"ajaxError",[v,l,i?k:r]),p.fireWith(m,[v,w]),j&&(n.trigger("ajaxComplete",[v,l]),--_.active||_.event.trigger("ajaxStop")))}"object"==typeof a&&(b=a,a=void 0),b=b||{};var d,e,f,g,h,i,j,k,l=_.ajaxSetup({},b),m=l.context||l,n=l.context&&(m.nodeType||m.jquery)?_(m):_.event,o=_.Deferred(),p=_.Callbacks("once memory"),q=l.statusCode||{},r={},s={},t=0,u="canceled",v={readyState:0,getResponseHeader:function(a){var b;if(2===t){if(!g)for(g={};b=pc.exec(f);)g[b[1].toLowerCase()]=b[2];b=g[a.toLowerCase()]}return null==b?null:b},getAllResponseHeaders:function(){return 2===t?f:null},setRequestHeader:function(a,b){var c=a.toLowerCase();return t||(a=s[c]=s[c]||a,r[a]=b),this},overrideMimeType:function(a){return t||(l.mimeType=a),this},statusCode:function(a){var b;if(a)if(2>t)for(b in a)q[b]=[q[b],a[b]];else v.always(a[v.status]);return this},abort:function(a){var b=a||u;return d&&d.abort(b),c(0,b),this}};if(o.promise(v).complete=p.add,v.success=v.done,v.error=v.fail,l.url=((a||l.url||mc)+"").replace(nc,"").replace(sc,lc[1]+"//"),l.type=b.method||b.type||l.method||l.type,l.dataTypes=_.trim(l.dataType||"*").toLowerCase().match(nb)||[""],null==l.crossDomain&&(i=tc.exec(l.url.toLowerCase()),l.crossDomain=!(!i||i[1]===lc[1]&&i[2]===lc[2]&&(i[3]||("http:"===i[1]?"80":"443"))===(lc[3]||("http:"===lc[1]?"80":"443")))),l.data&&l.processData&&"string"!=typeof l.data&&(l.data=_.param(l.data,l.traditional)),K(uc,l,b,v),2===t)return v;j=l.global,j&&0===_.active++&&_.event.trigger("ajaxStart"),l.type=l.type.toUpperCase(),l.hasContent=!rc.test(l.type),e=l.url,l.hasContent||(l.data&&(e=l.url+=(kc.test(e)?"&":"?")+l.data,delete l.data),l.cache===!1&&(l.url=oc.test(e)?e.replace(oc,"$1_="+jc++):e+(kc.test(e)?"&":"?")+"_="+jc++)),l.ifModified&&(_.lastModified[e]&&v.setRequestHeader("If-Modified-Since",_.lastModified[e]),_.etag[e]&&v.setRequestHeader("If-None-Match",_.etag[e])),(l.data&&l.hasContent&&l.contentType!==!1||b.contentType)&&v.setRequestHeader("Content-Type",l.contentType),v.setRequestHeader("Accept",l.dataTypes[0]&&l.accepts[l.dataTypes[0]]?l.accepts[l.dataTypes[0]]+("*"!==l.dataTypes[0]?", "+wc+"; q=0.01":""):l.accepts["*"]);for(k in l.headers)v.setRequestHeader(k,l.headers[k]);if(l.beforeSend&&(l.beforeSend.call(m,v,l)===!1||2===t))return v.abort();u="abort";for(k in{success:1,error:1,complete:1})v[k](l[k]);if(d=K(vc,l,b,v)){v.readyState=1,j&&n.trigger("ajaxSend",[v,l]),l.async&&l.timeout>0&&(h=setTimeout(function(){v.abort("timeout")},l.timeout));try{t=1,d.send(r,c)}catch(w){if(!(2>t))throw w;c(-1,w)}}else c(-1,"No Transport");return v},getJSON:function(a,b,c){return _.get(a,b,c,"json")},getScript:function(a,b){return _.get(a,void 0,b,"script")}}),_.each(["get","post"],function(a,b){_[b]=function(a,c,d,e){return _.isFunction(c)&&(e=e||d,d=c,c=void 0),_.ajax({url:a,type:b,dataType:e,data:c,success:d})}}),_.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(a,b){_.fn[b]=function(a){return this.on(b,a)}}),_._evalUrl=function(a){return _.ajax({url:a,type:"GET",dataType:"script",async:!1,global:!1,"throws":!0})},_.fn.extend({wrapAll:function(a){var b;return _.isFunction(a)?this.each(function(b){_(this).wrapAll(a.call(this,b))}):(this[0]&&(b=_(a,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){for(var a=this;a.firstElementChild;)a=a.firstElementChild;return a}).append(this)),this)},wrapInner:function(a){return this.each(_.isFunction(a)?function(b){_(this).wrapInner(a.call(this,b))}:function(){var b=_(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){var b=_.isFunction(a);return this.each(function(c){_(this).wrapAll(b?a.call(this,c):a)})},unwrap:function(){return this.parent().each(function(){_.nodeName(this,"body")||_(this).replaceWith(this.childNodes)}).end()}}),_.expr.filters.hidden=function(a){return a.offsetWidth<=0&&a.offsetHeight<=0},_.expr.filters.visible=function(a){return!_.expr.filters.hidden(a)};var yc=/%20/g,zc=/\[\]$/,Ac=/\r?\n/g,Bc=/^(?:submit|button|image|reset|file)$/i,Cc=/^(?:input|select|textarea|keygen)/i;_.param=function(a,b){var c,d=[],e=function(a,b){b=_.isFunction(b)?b():null==b?"":b,d[d.length]=encodeURIComponent(a)+"="+encodeURIComponent(b)};if(void 0===b&&(b=_.ajaxSettings&&_.ajaxSettings.traditional),_.isArray(a)||a.jquery&&!_.isPlainObject(a))_.each(a,function(){e(this.name,this.value)});else for(c in a)O(c,a[c],b,e);return d.join("&").replace(yc,"+")},_.fn.extend({serialize:function(){return _.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var a=_.prop(this,"elements");return a?_.makeArray(a):this}).filter(function(){var a=this.type;return this.name&&!_(this).is(":disabled")&&Cc.test(this.nodeName)&&!Bc.test(a)&&(this.checked||!yb.test(a))}).map(function(a,b){var c=_(this).val();return null==c?null:_.isArray(c)?_.map(c,function(a){return{name:b.name,value:a.replace(Ac,"\r\n")}}):{name:b.name,value:c.replace(Ac,"\r\n")}}).get()}}),_.ajaxSettings.xhr=function(){try{return new XMLHttpRequest}catch(a){}};var Dc=0,Ec={},Fc={0:200,1223:204},Gc=_.ajaxSettings.xhr();a.ActiveXObject&&_(a).on("unload",function(){for(var a in Ec)Ec[a]()}),Y.cors=!!Gc&&"withCredentials"in Gc,Y.ajax=Gc=!!Gc,_.ajaxTransport(function(a){var b;return Y.cors||Gc&&!a.crossDomain?{send:function(c,d){var e,f=a.xhr(),g=++Dc;if(f.open(a.type,a.url,a.async,a.username,a.password),a.xhrFields)for(e in a.xhrFields)f[e]=a.xhrFields[e];a.mimeType&&f.overrideMimeType&&f.overrideMimeType(a.mimeType),a.crossDomain||c["X-Requested-With"]||(c["X-Requested-With"]="XMLHttpRequest");for(e in c)f.setRequestHeader(e,c[e]);b=function(a){return function(){b&&(delete Ec[g],b=f.onload=f.onerror=null,"abort"===a?f.abort():"error"===a?d(f.status,f.statusText):d(Fc[f.status]||f.status,f.statusText,"string"==typeof f.responseText?{text:f.responseText}:void 0,f.getAllResponseHeaders()))}},f.onload=b(),f.onerror=b("error"),b=Ec[g]=b("abort");try{f.send(a.hasContent&&a.data||null)}catch(h){if(b)throw h}},abort:function(){b&&b()}}:void 0}),_.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/(?:java|ecma)script/},converters:{"text script":function(a){return _.globalEval(a),a}}}),_.ajaxPrefilter("script",function(a){void 0===a.cache&&(a.cache=!1),a.crossDomain&&(a.type="GET")}),_.ajaxTransport("script",function(a){if(a.crossDomain){var b,c;return{send:function(d,e){b=_("<script>").prop({async:!0,charset:a.scriptCharset,src:a.url}).on("load error",c=function(a){b.remove(),c=null,a&&e("error"===a.type?404:200,a.type)}),Z.head.appendChild(b[0])},abort:function(){c&&c()}}}});var Hc=[],Ic=/(=)\?(?=&|$)|\?\?/;_.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var a=Hc.pop()||_.expando+"_"+jc++;return this[a]=!0,a}}),_.ajaxPrefilter("json jsonp",function(b,c,d){var e,f,g,h=b.jsonp!==!1&&(Ic.test(b.url)?"url":"string"==typeof b.data&&!(b.contentType||"").indexOf("application/x-www-form-urlencoded")&&Ic.test(b.data)&&"data");return h||"jsonp"===b.dataTypes[0]?(e=b.jsonpCallback=_.isFunction(b.jsonpCallback)?b.jsonpCallback():b.jsonpCallback,h?b[h]=b[h].replace(Ic,"$1"+e):b.jsonp!==!1&&(b.url+=(kc.test(b.url)?"&":"?")+b.jsonp+"="+e),b.converters["script json"]=function(){return g||_.error(e+" was not called"),g[0]},b.dataTypes[0]="json",f=a[e],a[e]=function(){g=arguments},d.always(function(){a[e]=f,b[e]&&(b.jsonpCallback=c.jsonpCallback,Hc.push(e)),g&&_.isFunction(f)&&f(g[0]),g=f=void 0}),"script"):void 0}),_.parseHTML=function(a,b,c){if(!a||"string"!=typeof a)return null;"boolean"==typeof b&&(c=b,b=!1),b=b||Z;var d=gb.exec(a),e=!c&&[];return d?[b.createElement(d[1])]:(d=_.buildFragment([a],b,e),e&&e.length&&_(e).remove(),_.merge([],d.childNodes))};var Jc=_.fn.load;_.fn.load=function(a,b,c){if("string"!=typeof a&&Jc)return Jc.apply(this,arguments);var d,e,f,g=this,h=a.indexOf(" ");return h>=0&&(d=_.trim(a.slice(h)),a=a.slice(0,h)),_.isFunction(b)?(c=b,b=void 0):b&&"object"==typeof b&&(e="POST"),g.length>0&&_.ajax({url:a,type:e,dataType:"html",data:b}).done(function(a){f=arguments,g.html(d?_("<div>").append(_.parseHTML(a)).find(d):a)}).complete(c&&function(a,b){g.each(c,f||[a.responseText,b,a])}),this},_.expr.filters.animated=function(a){return _.grep(_.timers,function(b){return a===b.elem}).length};var Kc=a.document.documentElement;_.offset={setOffset:function(a,b,c){var d,e,f,g,h,i,j,k=_.css(a,"position"),l=_(a),m={};"static"===k&&(a.style.position="relative"),h=l.offset(),f=_.css(a,"top"),i=_.css(a,"left"),j=("absolute"===k||"fixed"===k)&&(f+i).indexOf("auto")>-1,j?(d=l.position(),g=d.top,e=d.left):(g=parseFloat(f)||0,e=parseFloat(i)||0),_.isFunction(b)&&(b=b.call(a,c,h)),null!=b.top&&(m.top=b.top-h.top+g),null!=b.left&&(m.left=b.left-h.left+e),"using"in b?b.using.call(a,m):l.css(m)}},_.fn.extend({offset:function(a){if(arguments.length)return void 0===a?this:this.each(function(b){_.offset.setOffset(this,a,b)});var b,c,d=this[0],e={top:0,left:0},f=d&&d.ownerDocument;return f?(b=f.documentElement,_.contains(b,d)?(typeof d.getBoundingClientRect!==zb&&(e=d.getBoundingClientRect()),c=P(f),{top:e.top+c.pageYOffset-b.clientTop,left:e.left+c.pageXOffset-b.clientLeft}):e):void 0},position:function(){if(this[0]){var a,b,c=this[0],d={top:0,left:0};return"fixed"===_.css(c,"position")?b=c.getBoundingClientRect():(a=this.offsetParent(),b=this.offset(),_.nodeName(a[0],"html")||(d=a.offset()),d.top+=_.css(a[0],"borderTopWidth",!0),d.left+=_.css(a[0],"borderLeftWidth",!0)),{top:b.top-d.top-_.css(c,"marginTop",!0),left:b.left-d.left-_.css(c,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){for(var a=this.offsetParent||Kc;a&&!_.nodeName(a,"html")&&"static"===_.css(a,"position");)a=a.offsetParent;return a||Kc})}}),_.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(b,c){var d="pageYOffset"===c;_.fn[b]=function(e){return qb(this,function(b,e,f){var g=P(b);return void 0===f?g?g[c]:b[e]:void(g?g.scrollTo(d?a.pageXOffset:f,d?f:a.pageYOffset):b[e]=f)},b,e,arguments.length,null)}}),_.each(["top","left"],function(a,b){_.cssHooks[b]=w(Y.pixelPosition,function(a,c){return c?(c=v(a,b),Qb.test(c)?_(a).position()[b]+"px":c):void 0})}),_.each({Height:"height",Width:"width"},function(a,b){_.each({padding:"inner"+a,content:b,"":"outer"+a},function(c,d){_.fn[d]=function(d,e){var f=arguments.length&&(c||"boolean"!=typeof d),g=c||(d===!0||e===!0?"margin":"border");return qb(this,function(b,c,d){var e;return _.isWindow(b)?b.document.documentElement["client"+a]:9===b.nodeType?(e=b.documentElement,Math.max(b.body["scroll"+a],e["scroll"+a],b.body["offset"+a],e["offset"+a],e["client"+a])):void 0===d?_.css(b,c,g):_.style(b,c,d,g)},b,f?d:void 0,f,null)}})}),_.fn.size=function(){return this.length},_.fn.andSelf=_.fn.addBack,"function"==typeof define&&define.amd&&define("jquery",[],function(){return _});var Lc=a.jQuery,Mc=a.$;return _.noConflict=function(b){return a.$===_&&(a.$=Mc),b&&a.jQuery===_&&(a.jQuery=Lc),_},typeof b===zb&&(a.jQuery=a.$=_),_}),!function(a){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=a();else if("function"==typeof define&&define.amd)define([],a);else{var b;"undefined"!=typeof window?b=window:"undefined"!=typeof global?b=global:"undefined"!=typeof self&&(b=self),b.JSZip=a()}}(function(){return function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);throw new Error("Cannot find module '"+g+"'")}var j=c[g]={exports:{}};b[g][0].call(j.exports,function(a){var c=b[g][1][a];return e(c?c:a)},j,j.exports,a,b,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(a,b,c){"use strict";var d="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";c.encode=function(a){for(var b,c,e,f,g,h,i,j="",k=0;k<a.length;)b=a.charCodeAt(k++),c=a.charCodeAt(k++),e=a.charCodeAt(k++),f=b>>2,g=(3&b)<<4|c>>4,h=(15&c)<<2|e>>6,i=63&e,isNaN(c)?h=i=64:isNaN(e)&&(i=64),j=j+d.charAt(f)+d.charAt(g)+d.charAt(h)+d.charAt(i);return j},c.decode=function(a){var b,c,e,f,g,h,i,j="",k=0;for(a=a.replace(/[^A-Za-z0-9\+\/\=]/g,"");k<a.length;)f=d.indexOf(a.charAt(k++)),g=d.indexOf(a.charAt(k++)),h=d.indexOf(a.charAt(k++)),i=d.indexOf(a.charAt(k++)),b=f<<2|g>>4,c=(15&g)<<4|h>>2,e=(3&h)<<6|i,j+=String.fromCharCode(b),64!=h&&(j+=String.fromCharCode(c)),64!=i&&(j+=String.fromCharCode(e));return j}},{}],2:[function(a,b){"use strict";function c(){this.compressedSize=0,this.uncompressedSize=0,this.crc32=0,this.compressionMethod=null,this.compressedContent=null}c.prototype={getContent:function(){return null},getCompressedContent:function(){return null}},b.exports=c},{}],3:[function(a,b,c){"use strict";c.STORE={magic:"\x00\x00",compress:function(a){return a},uncompress:function(a){return a},compressInputType:null,uncompressInputType:null},c.DEFLATE=a("./flate")},{"./flate":8}],4:[function(a,b){"use strict";var c=a("./utils"),d=[0,1996959894,3993919788,2567524794,124634137,1886057615,3915621685,2657392035,249268274,2044508324,3772115230,2547177864,162941995,2125561021,3887607047,2428444049,498536548,1789927666,4089016648,2227061214,450548861,1843258603,4107580753,2211677639,325883990,1684777152,4251122042,2321926636,335633487,1661365465,4195302755,2366115317,997073096,1281953886,3579855332,2724688242,1006888145,1258607687,3524101629,2768942443,901097722,1119000684,3686517206,2898065728,853044451,1172266101,3705015759,2882616665,651767980,1373503546,3369554304,3218104598,565507253,1454621731,3485111705,3099436303,671266974,1594198024,3322730930,2970347812,795835527,1483230225,3244367275,3060149565,1994146192,31158534,2563907772,4023717930,1907459465,112637215,2680153253,3904427059,2013776290,251722036,2517215374,3775830040,2137656763,141376813,2439277719,3865271297,1802195444,476864866,2238001368,4066508878,1812370925,453092731,2181625025,4111451223,1706088902,314042704,2344532202,4240017532,1658658271,366619977,2362670323,4224994405,1303535960,984961486,2747007092,3569037538,1256170817,1037604311,2765210733,3554079995,1131014506,879679996,2909243462,3663771856,1141124467,855842277,2852801631,3708648649,1342533948,654459306,3188396048,3373015174,1466479909,544179635,3110523913,3462522015,1591671054,702138776,2966460450,3352799412,1504918807,783551873,3082640443,3233442989,3988292384,2596254646,62317068,1957810842,3939845945,2647816111,81470997,1943803523,3814918930,2489596804,225274430,2053790376,3826175755,2466906013,167816743,2097651377,4027552580,2265490386,503444072,1762050814,4150417245,2154129355,426522225,1852507879,4275313526,2312317920,282753626,1742555852,4189708143,2394877945,397917763,1622183637,3604390888,2714866558,953729732,1340076626,3518719985,2797360999,1068828381,1219638859,3624741850,2936675148,906185462,1090812512,3747672003,2825379669,829329135,1181335161,3412177804,3160834842,628085408,1382605366,3423369109,3138078467,570562233,1426400815,3317316542,2998733608,733239954,1555261956,3268935591,3050360625,752459403,1541320221,2607071920,3965973030,1969922972,40735498,2617837225,3943577151,1913087877,83908371,2512341634,3803740692,2075208622,213261112,2463272603,3855990285,2094854071,198958881,2262029012,4057260610,1759359992,534414190,2176718541,4139329115,1873836001,414664567,2282248934,4279200368,1711684554,285281116,2405801727,4167216745,1634467795,376229701,2685067896,3608007406,1308918612,956543938,2808555105,3495958263,1231636301,1047427035,2932959818,3654703836,1088359270,936918e3,2847714899,3736837829,1202900863,817233897,3183342108,3401237130,1404277552,615818150,3134207493,3453421203,1423857449,601450431,3009837614,3294710456,1567103746,711928724,3020668471,3272380065,1510334235,755167117];b.exports=function(a,b){if("undefined"==typeof a||!a.length)return 0;var e="string"!==c.getTypeOf(a);"undefined"==typeof b&&(b=0);var f=0,g=0,h=0;b=-1^b;for(var i=0,j=a.length;j>i;i++)h=e?a[i]:a.charCodeAt(i),g=255&(b^h),f=d[g],b=b>>>8^f;return-1^b}},{"./utils":19}],5:[function(a,b){"use strict";function c(){this.data=null,this.length=0,this.index=0}var d=a("./utils");c.prototype={checkOffset:function(a){this.checkIndex(this.index+a)},checkIndex:function(a){if(this.length<a||0>a)throw new Error("End of data reached (data length = "+this.length+", asked index = "+a+"). Corrupted zip ?")},setIndex:function(a){this.checkIndex(a),this.index=a},skip:function(a){this.setIndex(this.index+a)},byteAt:function(){},readInt:function(a){var b,c=0;for(this.checkOffset(a),b=this.index+a-1;b>=this.index;b--)c=(c<<8)+this.byteAt(b);return this.index+=a,c},readString:function(a){return d.transformTo("string",this.readData(a))},readData:function(){},lastIndexOfSignature:function(){},readDate:function(){var a=this.readInt(4);return new Date((a>>25&127)+1980,(a>>21&15)-1,a>>16&31,a>>11&31,a>>5&63,(31&a)<<1)}},b.exports=c},{"./utils":19}],6:[function(a,b,c){"use strict";c.base64=!1,c.binary=!1,c.dir=!1,c.date=null,c.compression=null,c.comment=null},{}],7:[function(a,b,c){"use strict";var d=a("./utils");c.string2binary=function(a){return d.string2binary(a)},c.string2Uint8Array=function(a){return d.transformTo("uint8array",a)},c.uint8Array2String=function(a){return d.transformTo("string",a)},c.string2Blob=function(a){var b=d.transformTo("arraybuffer",a);return d.arrayBuffer2Blob(b)},c.arrayBuffer2Blob=function(a){return d.arrayBuffer2Blob(a)},c.transformTo=function(a,b){return d.transformTo(a,b)},c.getTypeOf=function(a){return d.getTypeOf(a)},c.checkSupport=function(a){return d.checkSupport(a)},c.MAX_VALUE_16BITS=d.MAX_VALUE_16BITS,c.MAX_VALUE_32BITS=d.MAX_VALUE_32BITS,c.pretty=function(a){return d.pretty(a)},c.findCompression=function(a){return d.findCompression(a)},c.isRegExp=function(a){return d.isRegExp(a)}},{"./utils":19}],8:[function(a,b,c){"use strict";var d="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Uint32Array,e=a("pako");c.uncompressInputType=d?"uint8array":"array",c.compressInputType=d?"uint8array":"array",c.magic="\b\x00",c.compress=function(a){return e.deflateRaw(a)},c.uncompress=function(a){return e.inflateRaw(a)}},{pako:24}],9:[function(a,b){"use strict";function c(a,b){return this instanceof c?(this.files={},this.comment=null,this.root="",a&&this.load(a,b),void(this.clone=function(){var a=new c;for(var b in this)"function"!=typeof this[b]&&(a[b]=this[b]);return a})):new c(a,b)}var d=a("./base64");c.prototype=a("./object"),c.prototype.load=a("./load"),c.support=a("./support"),c.defaults=a("./defaults"),c.utils=a("./deprecatedPublicUtils"),c.base64={encode:function(a){return d.encode(a)},decode:function(a){return d.decode(a)}},c.compressions=a("./compressions"),b.exports=c},{"./base64":1,"./compressions":3,"./defaults":6,"./deprecatedPublicUtils":7,"./load":10,"./object":11,"./support":15}],10:[function(a,b){"use strict";var c=a("./base64"),d=a("./zipEntries");b.exports=function(a,b){var e,f,g,h;for(b=b||{},b.base64&&(a=c.decode(a)),f=new d(a,b),e=f.files,g=0;g<e.length;g++)h=e[g],this.file(h.fileName,h.decompressed,{binary:!0,optimizedBinaryString:!0,date:h.date,dir:h.dir,comment:h.fileComment.length?h.fileComment:null});return f.zipComment.length&&(this.comment=f.zipComment),this}},{"./base64":1,"./zipEntries":20}],11:[function(a,b){"use strict";var c,d=a("./support"),e=a("./utils"),f=a("./crc32"),g=a("./signature"),h=a("./defaults"),i=a("./base64"),j=a("./compressions"),k=a("./compressedObject"),l=a("./nodeBuffer"),m=a("./utf8"),n=a("./stringWriter"),o=a("./uint8ArrayWriter");d.uint8array&&"function"==typeof TextEncoder&&(c=new TextEncoder("utf-8"));var p=function(a){if(a._data instanceof k&&(a._data=a._data.getContent(),a.options.binary=!0,a.options.base64=!1,"uint8array"===e.getTypeOf(a._data))){var b=a._data;a._data=new Uint8Array(b.length),0!==b.length&&a._data.set(b,0)}return a._data},q=function(a){var b=p(a),f=e.getTypeOf(b);if("string"===f){if(!a.options.binary){if(c)return c.encode(b);if(d.nodebuffer)return l(b,"utf-8")}return a.asBinary()}return b},r=function(a){var b=p(this);return null===b||"undefined"==typeof b?"":(this.options.base64&&(b=i.decode(b)),b=a&&this.options.binary?A.utf8decode(b):e.transformTo("string",b),a||this.options.binary||(b=e.transformTo("string",A.utf8encode(b))),b)},s=function(a,b,c){this.name=a,this.dir=c.dir,this.date=c.date,this.comment=c.comment,this._data=b,this.options=c,this._initialMetadata={dir:c.dir,date:c.date}};s.prototype={asText:function(){return r.call(this,!0)},asBinary:function(){return r.call(this,!1)},asNodeBuffer:function(){var a=q(this);return e.transformTo("nodebuffer",a)},asUint8Array:function(){var a=q(this);return e.transformTo("uint8array",a)},asArrayBuffer:function(){return this.asUint8Array().buffer}};var t=function(a,b){var c,d="";for(c=0;b>c;c++)d+=String.fromCharCode(255&a),a>>>=8;return d},u=function(){var a,b,c={};for(a=0;a<arguments.length;a++)for(b in arguments[a])arguments[a].hasOwnProperty(b)&&"undefined"==typeof c[b]&&(c[b]=arguments[a][b]);return c},v=function(a){return a=a||{},a.base64!==!0||null!==a.binary&&void 0!==a.binary||(a.binary=!0),a=u(a,h),a.date=a.date||new Date,null!==a.compression&&(a.compression=a.compression.toUpperCase()),a},w=function(a,b,c){var d=e.getTypeOf(b);if(c=v(c),c.dir||null===b||"undefined"==typeof b)c.base64=!1,c.binary=!1,b=null;else if("string"===d)c.binary&&!c.base64&&c.optimizedBinaryString!==!0&&(b=e.string2binary(b));else{if(c.base64=!1,c.binary=!0,!(d||b instanceof k))throw new Error("The data of '"+a+"' is in an unsupported format !");"arraybuffer"===d&&(b=e.transformTo("uint8array",b))}var f=new s(a,b,c);return this.files[a]=f,f},x=function(a){return"/"!=a.slice(-1)&&(a+="/"),this.files[a]||w.call(this,a,null,{dir:!0}),this.files[a]},y=function(a,b){var c,d=new k;return a._data instanceof k?(d.uncompressedSize=a._data.uncompressedSize,d.crc32=a._data.crc32,0===d.uncompressedSize||a.dir?(b=j.STORE,d.compressedContent="",d.crc32=0):a._data.compressionMethod===b.magic?d.compressedContent=a._data.getCompressedContent():(c=a._data.getContent(),d.compressedContent=b.compress(e.transformTo(b.compressInputType,c)))):(c=q(a),(!c||0===c.length||a.dir)&&(b=j.STORE,c=""),d.uncompressedSize=c.length,d.crc32=f(c),d.compressedContent=b.compress(e.transformTo(b.compressInputType,c))),d.compressedSize=d.compressedContent.length,d.compressionMethod=b.magic,d},z=function(a,b,c,d){var h,i,j,k,l=(c.compressedContent,e.transformTo("string",m.utf8encode(b.name))),n=b.comment||"",o=e.transformTo("string",m.utf8encode(n)),p=l.length!==b.name.length,q=o.length!==n.length,r=b.options,s="",u="",v="";j=b._initialMetadata.dir!==b.dir?b.dir:r.dir,k=b._initialMetadata.date!==b.date?b.date:r.date,h=k.getHours(),h<<=6,h|=k.getMinutes(),h<<=5,h|=k.getSeconds()/2,i=k.getFullYear()-1980,i<<=4,i|=k.getMonth()+1,i<<=5,i|=k.getDate(),p&&(u=t(1,1)+t(f(l),4)+l,s+="up"+t(u.length,2)+u),q&&(v=t(1,1)+t(this.crc32(o),4)+o,s+="uc"+t(v.length,2)+v);var w="";w+="\n\x00",w+=p||q?"\x00\b":"\x00\x00",w+=c.compressionMethod,w+=t(h,2),w+=t(i,2),w+=t(c.crc32,4),w+=t(c.compressedSize,4),w+=t(c.uncompressedSize,4),w+=t(l.length,2),w+=t(s.length,2);
var x=g.LOCAL_FILE_HEADER+w+l+s,y=g.CENTRAL_FILE_HEADER+"\x00"+w+t(o.length,2)+"\x00\x00\x00\x00"+(j===!0?"\x00\x00\x00":"\x00\x00\x00\x00")+t(d,4)+l+s+o;return{fileRecord:x,dirRecord:y,compressedObject:c}},A={load:function(){throw new Error("Load method is not defined. Is the file jszip-load.js included ?")},filter:function(a){var b,c,d,e,f=[];for(b in this.files)this.files.hasOwnProperty(b)&&(d=this.files[b],e=new s(d.name,d._data,u(d.options)),c=b.slice(this.root.length,b.length),b.slice(0,this.root.length)===this.root&&a(c,e)&&f.push(e));return f},file:function(a,b,c){if(1===arguments.length){if(e.isRegExp(a)){var d=a;return this.filter(function(a,b){return!b.dir&&d.test(a)})}return this.filter(function(b,c){return!c.dir&&b===a})[0]||null}return a=this.root+a,w.call(this,a,b,c),this},folder:function(a){if(!a)return this;if(e.isRegExp(a))return this.filter(function(b,c){return c.dir&&a.test(b)});var b=this.root+a,c=x.call(this,b),d=this.clone();return d.root=c.name,d},remove:function(a){a=this.root+a;var b=this.files[a];if(b||("/"!=a.slice(-1)&&(a+="/"),b=this.files[a]),b&&!b.dir)delete this.files[a];else for(var c=this.filter(function(b,c){return c.name.slice(0,a.length)===a}),d=0;d<c.length;d++)delete this.files[c[d].name];return this},generate:function(a){a=u(a||{},{base64:!0,compression:"STORE",type:"base64",comment:null}),e.checkSupport(a.type);var b,c,d=[],f=0,h=0,k=e.transformTo("string",this.utf8encode(a.comment||this.comment||""));for(var l in this.files)if(this.files.hasOwnProperty(l)){var m=this.files[l],p=m.options.compression||a.compression.toUpperCase(),q=j[p];if(!q)throw new Error(p+" is not a valid compression method !");var r=y.call(this,m,q),s=z.call(this,l,m,r,f);f+=s.fileRecord.length+r.compressedSize,h+=s.dirRecord.length,d.push(s)}var v="";v=g.CENTRAL_DIRECTORY_END+"\x00\x00\x00\x00"+t(d.length,2)+t(d.length,2)+t(h,4)+t(f,4)+t(k.length,2)+k;var w=a.type.toLowerCase();for(b="uint8array"===w||"arraybuffer"===w||"blob"===w||"nodebuffer"===w?new o(f+h+v.length):new n(f+h+v.length),c=0;c<d.length;c++)b.append(d[c].fileRecord),b.append(d[c].compressedObject.compressedContent);for(c=0;c<d.length;c++)b.append(d[c].dirRecord);b.append(v);var x=b.finalize();switch(a.type.toLowerCase()){case"uint8array":case"arraybuffer":case"nodebuffer":return e.transformTo(a.type.toLowerCase(),x);case"blob":return e.arrayBuffer2Blob(e.transformTo("arraybuffer",x));case"base64":return a.base64?i.encode(x):x;default:return x}},crc32:function(a,b){return f(a,b)},utf8encode:function(a){return e.transformTo("string",m.utf8encode(a))},utf8decode:function(a){return m.utf8decode(a)}};b.exports=A},{"./base64":1,"./compressedObject":2,"./compressions":3,"./crc32":4,"./defaults":6,"./nodeBuffer":22,"./signature":12,"./stringWriter":14,"./support":15,"./uint8ArrayWriter":17,"./utf8":18,"./utils":19}],12:[function(a,b,c){"use strict";c.LOCAL_FILE_HEADER="PK",c.CENTRAL_FILE_HEADER="PK",c.CENTRAL_DIRECTORY_END="PK",c.ZIP64_CENTRAL_DIRECTORY_LOCATOR="PK",c.ZIP64_CENTRAL_DIRECTORY_END="PK",c.DATA_DESCRIPTOR="PK\b"},{}],13:[function(a,b){"use strict";function c(a,b){this.data=a,b||(this.data=e.string2binary(this.data)),this.length=this.data.length,this.index=0}var d=a("./dataReader"),e=a("./utils");c.prototype=new d,c.prototype.byteAt=function(a){return this.data.charCodeAt(a)},c.prototype.lastIndexOfSignature=function(a){return this.data.lastIndexOf(a)},c.prototype.readData=function(a){this.checkOffset(a);var b=this.data.slice(this.index,this.index+a);return this.index+=a,b},b.exports=c},{"./dataReader":5,"./utils":19}],14:[function(a,b){"use strict";var c=a("./utils"),d=function(){this.data=[]};d.prototype={append:function(a){a=c.transformTo("string",a),this.data.push(a)},finalize:function(){return this.data.join("")}},b.exports=d},{"./utils":19}],15:[function(a,b,c){(function(a){"use strict";if(c.base64=!0,c.array=!0,c.string=!0,c.arraybuffer="undefined"!=typeof ArrayBuffer&&"undefined"!=typeof Uint8Array,c.nodebuffer=!a.browser,c.uint8array="undefined"!=typeof Uint8Array,"undefined"==typeof ArrayBuffer)c.blob=!1;else{var b=new ArrayBuffer(0);try{c.blob=0===new Blob([b],{type:"application/zip"}).size}catch(d){try{var e=window.BlobBuilder||window.WebKitBlobBuilder||window.MozBlobBuilder||window.MSBlobBuilder,f=new e;f.append(b),c.blob=0===f.getBlob("application/zip").size}catch(d){c.blob=!1}}}}).call(this,a("FWaASH"))},{FWaASH:23}],16:[function(a,b){"use strict";function c(a){a&&(this.data=a,this.length=this.data.length,this.index=0)}var d=a("./dataReader");c.prototype=new d,c.prototype.byteAt=function(a){return this.data[a]},c.prototype.lastIndexOfSignature=function(a){for(var b=a.charCodeAt(0),c=a.charCodeAt(1),d=a.charCodeAt(2),e=a.charCodeAt(3),f=this.length-4;f>=0;--f)if(this.data[f]===b&&this.data[f+1]===c&&this.data[f+2]===d&&this.data[f+3]===e)return f;return-1},c.prototype.readData=function(a){if(this.checkOffset(a),0===a)return new Uint8Array(0);var b=this.data.subarray(this.index,this.index+a);return this.index+=a,b},b.exports=c},{"./dataReader":5}],17:[function(a,b){"use strict";var c=a("./utils"),d=function(a){this.data=new Uint8Array(a),this.index=0};d.prototype={append:function(a){0!==a.length&&(a=c.transformTo("uint8array",a),this.data.set(a,this.index),this.index+=a.length)},finalize:function(){return this.data}},b.exports=d},{"./utils":19}],18:[function(a,b,c){"use strict";var d,e,f=a("./utils"),g=a("./support"),h=a("./nodeBuffer");g.uint8array&&"function"==typeof TextEncoder&&"function"==typeof TextDecoder&&(d=new TextEncoder("utf-8"),e=new TextDecoder("utf-8"));for(var i=new Array(256),j=0;256>j;j++)i[j]=j>=252?6:j>=248?5:j>=240?4:j>=224?3:j>=192?2:1;i[254]=i[254]=1;var k=function(a){var b,c,d,e,f,h=a.length,i=0;for(e=0;h>e;e++)c=a.charCodeAt(e),55296===(64512&c)&&h>e+1&&(d=a.charCodeAt(e+1),56320===(64512&d)&&(c=65536+(c-55296<<10)+(d-56320),e++)),i+=128>c?1:2048>c?2:65536>c?3:4;for(b=g.uint8array?new Uint8Array(i):new Array(i),f=0,e=0;i>f;e++)c=a.charCodeAt(e),55296===(64512&c)&&h>e+1&&(d=a.charCodeAt(e+1),56320===(64512&d)&&(c=65536+(c-55296<<10)+(d-56320),e++)),128>c?b[f++]=c:2048>c?(b[f++]=192|c>>>6,b[f++]=128|63&c):65536>c?(b[f++]=224|c>>>12,b[f++]=128|c>>>6&63,b[f++]=128|63&c):(b[f++]=240|c>>>18,b[f++]=128|c>>>12&63,b[f++]=128|c>>>6&63,b[f++]=128|63&c);return b},l=function(a,b){var c;for(b=b||a.length,b>a.length&&(b=a.length),c=b-1;c>=0&&128===(192&a[c]);)c--;return 0>c?b:0===c?b:c+i[a[c]]>b?c:b},m=function(a){var b,c,d,e,g=a.length,h=new Array(2*g);for(c=0,b=0;g>b;)if(d=a[b++],128>d)h[c++]=d;else if(e=i[d],e>4)h[c++]=65533,b+=e-1;else{for(d&=2===e?31:3===e?15:7;e>1&&g>b;)d=d<<6|63&a[b++],e--;e>1?h[c++]=65533:65536>d?h[c++]=d:(d-=65536,h[c++]=55296|d>>10&1023,h[c++]=56320|1023&d)}return h.length!==c&&(h.subarray?h=h.subarray(0,c):h.length=c),f.applyFromCharCode(h)};c.utf8encode=function(a){return d?d.encode(a):g.nodebuffer?h(a,"utf-8"):k(a)},c.utf8decode=function(a){if(e)return e.decode(f.transformTo("uint8array",a));if(g.nodebuffer)return f.transformTo("nodebuffer",a).toString("utf-8");a=f.transformTo(g.uint8array?"uint8array":"array",a);for(var b=[],c=0,d=a.length,h=65536;d>c;){var i=l(a,Math.min(c+h,d));b.push(m(g.uint8array?a.subarray(c,i):a.slice(c,i))),c=i}return b.join("")}},{"./nodeBuffer":22,"./support":15,"./utils":19}],19:[function(a,b,c){"use strict";function d(a){return a}function e(a,b){for(var c=0;c<a.length;++c)b[c]=255&a.charCodeAt(c);return b}function f(a){var b=65536,d=[],e=a.length,f=c.getTypeOf(a),g=0,h=!0;try{switch(f){case"uint8array":String.fromCharCode.apply(null,new Uint8Array(0));break;case"nodebuffer":String.fromCharCode.apply(null,j(0))}}catch(i){h=!1}if(!h){for(var k="",l=0;l<a.length;l++)k+=String.fromCharCode(a[l]);return k}for(;e>g&&b>1;)try{d.push("array"===f||"nodebuffer"===f?String.fromCharCode.apply(null,a.slice(g,Math.min(g+b,e))):String.fromCharCode.apply(null,a.subarray(g,Math.min(g+b,e)))),g+=b}catch(i){b=Math.floor(b/2)}return d.join("")}function g(a,b){for(var c=0;c<a.length;c++)b[c]=a[c];return b}var h=a("./support"),i=a("./compressions"),j=a("./nodeBuffer");c.string2binary=function(a){for(var b="",c=0;c<a.length;c++)b+=String.fromCharCode(255&a.charCodeAt(c));return b},c.arrayBuffer2Blob=function(a){c.checkSupport("blob");try{return new Blob([a],{type:"application/zip"})}catch(b){try{var d=window.BlobBuilder||window.WebKitBlobBuilder||window.MozBlobBuilder||window.MSBlobBuilder,e=new d;return e.append(a),e.getBlob("application/zip")}catch(b){throw new Error("Bug : can't construct the Blob.")}}},c.applyFromCharCode=f;var k={};k.string={string:d,array:function(a){return e(a,new Array(a.length))},arraybuffer:function(a){return k.string.uint8array(a).buffer},uint8array:function(a){return e(a,new Uint8Array(a.length))},nodebuffer:function(a){return e(a,j(a.length))}},k.array={string:f,array:d,arraybuffer:function(a){return new Uint8Array(a).buffer},uint8array:function(a){return new Uint8Array(a)},nodebuffer:function(a){return j(a)}},k.arraybuffer={string:function(a){return f(new Uint8Array(a))},array:function(a){return g(new Uint8Array(a),new Array(a.byteLength))},arraybuffer:d,uint8array:function(a){return new Uint8Array(a)},nodebuffer:function(a){return j(new Uint8Array(a))}},k.uint8array={string:f,array:function(a){return g(a,new Array(a.length))},arraybuffer:function(a){return a.buffer},uint8array:d,nodebuffer:function(a){return j(a)}},k.nodebuffer={string:f,array:function(a){return g(a,new Array(a.length))},arraybuffer:function(a){return k.nodebuffer.uint8array(a).buffer},uint8array:function(a){return g(a,new Uint8Array(a.length))},nodebuffer:d},c.transformTo=function(a,b){if(b||(b=""),!a)return b;c.checkSupport(a);var d=c.getTypeOf(b),e=k[d][a](b);return e},c.getTypeOf=function(a){return"string"==typeof a?"string":"[object Array]"===Object.prototype.toString.call(a)?"array":h.nodebuffer&&j.test(a)?"nodebuffer":h.uint8array&&a instanceof Uint8Array?"uint8array":h.arraybuffer&&a instanceof ArrayBuffer?"arraybuffer":void 0},c.checkSupport=function(a){var b=h[a.toLowerCase()];if(!b)throw new Error(a+" is not supported by this browser")},c.MAX_VALUE_16BITS=65535,c.MAX_VALUE_32BITS=-1,c.pretty=function(a){var b,c,d="";for(c=0;c<(a||"").length;c++)b=a.charCodeAt(c),d+="\\x"+(16>b?"0":"")+b.toString(16).toUpperCase();return d},c.findCompression=function(a){for(var b in i)if(i.hasOwnProperty(b)&&i[b].magic===a)return i[b];return null},c.isRegExp=function(a){return"[object RegExp]"===Object.prototype.toString.call(a)}},{"./compressions":3,"./nodeBuffer":22,"./support":15}],20:[function(a,b){"use strict";function c(a,b){this.files=[],this.loadOptions=b,a&&this.load(a)}var d=a("./stringReader"),e=a("./nodeBufferReader"),f=a("./uint8ArrayReader"),g=a("./utils"),h=a("./signature"),i=a("./zipEntry"),j=a("./support"),k=a("./object");c.prototype={checkSignature:function(a){var b=this.reader.readString(4);if(b!==a)throw new Error("Corrupted zip or bug : unexpected signature ("+g.pretty(b)+", expected "+g.pretty(a)+")")},readBlockEndOfCentral:function(){this.diskNumber=this.reader.readInt(2),this.diskWithCentralDirStart=this.reader.readInt(2),this.centralDirRecordsOnThisDisk=this.reader.readInt(2),this.centralDirRecords=this.reader.readInt(2),this.centralDirSize=this.reader.readInt(4),this.centralDirOffset=this.reader.readInt(4),this.zipCommentLength=this.reader.readInt(2),this.zipComment=this.reader.readString(this.zipCommentLength),this.zipComment=k.utf8decode(this.zipComment)},readBlockZip64EndOfCentral:function(){this.zip64EndOfCentralSize=this.reader.readInt(8),this.versionMadeBy=this.reader.readString(2),this.versionNeeded=this.reader.readInt(2),this.diskNumber=this.reader.readInt(4),this.diskWithCentralDirStart=this.reader.readInt(4),this.centralDirRecordsOnThisDisk=this.reader.readInt(8),this.centralDirRecords=this.reader.readInt(8),this.centralDirSize=this.reader.readInt(8),this.centralDirOffset=this.reader.readInt(8),this.zip64ExtensibleData={};for(var a,b,c,d=this.zip64EndOfCentralSize-44,e=0;d>e;)a=this.reader.readInt(2),b=this.reader.readInt(4),c=this.reader.readString(b),this.zip64ExtensibleData[a]={id:a,length:b,value:c}},readBlockZip64EndOfCentralLocator:function(){if(this.diskWithZip64CentralDirStart=this.reader.readInt(4),this.relativeOffsetEndOfZip64CentralDir=this.reader.readInt(8),this.disksCount=this.reader.readInt(4),this.disksCount>1)throw new Error("Multi-volumes zip are not supported")},readLocalFiles:function(){var a,b;for(a=0;a<this.files.length;a++)b=this.files[a],this.reader.setIndex(b.localHeaderOffset),this.checkSignature(h.LOCAL_FILE_HEADER),b.readLocalPart(this.reader),b.handleUTF8()},readCentralDir:function(){var a;for(this.reader.setIndex(this.centralDirOffset);this.reader.readString(4)===h.CENTRAL_FILE_HEADER;)a=new i({zip64:this.zip64},this.loadOptions),a.readCentralPart(this.reader),this.files.push(a)},readEndOfCentral:function(){var a=this.reader.lastIndexOfSignature(h.CENTRAL_DIRECTORY_END);if(-1===a)throw new Error("Corrupted zip : can't find end of central directory");if(this.reader.setIndex(a),this.checkSignature(h.CENTRAL_DIRECTORY_END),this.readBlockEndOfCentral(),this.diskNumber===g.MAX_VALUE_16BITS||this.diskWithCentralDirStart===g.MAX_VALUE_16BITS||this.centralDirRecordsOnThisDisk===g.MAX_VALUE_16BITS||this.centralDirRecords===g.MAX_VALUE_16BITS||this.centralDirSize===g.MAX_VALUE_32BITS||this.centralDirOffset===g.MAX_VALUE_32BITS){if(this.zip64=!0,a=this.reader.lastIndexOfSignature(h.ZIP64_CENTRAL_DIRECTORY_LOCATOR),-1===a)throw new Error("Corrupted zip : can't find the ZIP64 end of central directory locator");this.reader.setIndex(a),this.checkSignature(h.ZIP64_CENTRAL_DIRECTORY_LOCATOR),this.readBlockZip64EndOfCentralLocator(),this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir),this.checkSignature(h.ZIP64_CENTRAL_DIRECTORY_END),this.readBlockZip64EndOfCentral()}},prepareReader:function(a){var b=g.getTypeOf(a);this.reader="string"!==b||j.uint8array?"nodebuffer"===b?new e(a):new f(g.transformTo("uint8array",a)):new d(a,this.loadOptions.optimizedBinaryString)},load:function(a){this.prepareReader(a),this.readEndOfCentral(),this.readCentralDir(),this.readLocalFiles()}},b.exports=c},{"./nodeBufferReader":22,"./object":11,"./signature":12,"./stringReader":13,"./support":15,"./uint8ArrayReader":16,"./utils":19,"./zipEntry":21}],21:[function(a,b){"use strict";function c(a,b){this.options=a,this.loadOptions=b}var d=a("./stringReader"),e=a("./utils"),f=a("./compressedObject"),g=a("./object");c.prototype={isEncrypted:function(){return 1===(1&this.bitFlag)},useUTF8:function(){return 2048===(2048&this.bitFlag)},prepareCompressedContent:function(a,b,c){return function(){var d=a.index;a.setIndex(b);var e=a.readData(c);return a.setIndex(d),e}},prepareContent:function(a,b,c,d,f){return function(){var a=e.transformTo(d.uncompressInputType,this.getCompressedContent()),b=d.uncompress(a);if(b.length!==f)throw new Error("Bug : uncompressed data size mismatch");return b}},readLocalPart:function(a){var b,c;if(a.skip(22),this.fileNameLength=a.readInt(2),c=a.readInt(2),this.fileName=a.readString(this.fileNameLength),a.skip(c),-1==this.compressedSize||-1==this.uncompressedSize)throw new Error("Bug or corrupted zip : didn't get enough informations from the central directory (compressedSize == -1 || uncompressedSize == -1)");if(b=e.findCompression(this.compressionMethod),null===b)throw new Error("Corrupted zip : compression "+e.pretty(this.compressionMethod)+" unknown (inner file : "+this.fileName+")");if(this.decompressed=new f,this.decompressed.compressedSize=this.compressedSize,this.decompressed.uncompressedSize=this.uncompressedSize,this.decompressed.crc32=this.crc32,this.decompressed.compressionMethod=this.compressionMethod,this.decompressed.getCompressedContent=this.prepareCompressedContent(a,a.index,this.compressedSize,b),this.decompressed.getContent=this.prepareContent(a,a.index,this.compressedSize,b,this.uncompressedSize),this.loadOptions.checkCRC32&&(this.decompressed=e.transformTo("string",this.decompressed.getContent()),g.crc32(this.decompressed)!==this.crc32))throw new Error("Corrupted zip : CRC32 mismatch")},readCentralPart:function(a){if(this.versionMadeBy=a.readString(2),this.versionNeeded=a.readInt(2),this.bitFlag=a.readInt(2),this.compressionMethod=a.readString(2),this.date=a.readDate(),this.crc32=a.readInt(4),this.compressedSize=a.readInt(4),this.uncompressedSize=a.readInt(4),this.fileNameLength=a.readInt(2),this.extraFieldsLength=a.readInt(2),this.fileCommentLength=a.readInt(2),this.diskNumberStart=a.readInt(2),this.internalFileAttributes=a.readInt(2),this.externalFileAttributes=a.readInt(4),this.localHeaderOffset=a.readInt(4),this.isEncrypted())throw new Error("Encrypted zip are not supported");this.fileName=a.readString(this.fileNameLength),this.readExtraFields(a),this.parseZIP64ExtraField(a),this.fileComment=a.readString(this.fileCommentLength),this.dir=16&this.externalFileAttributes?!0:!1},parseZIP64ExtraField:function(){if(this.extraFields[1]){var a=new d(this.extraFields[1].value);this.uncompressedSize===e.MAX_VALUE_32BITS&&(this.uncompressedSize=a.readInt(8)),this.compressedSize===e.MAX_VALUE_32BITS&&(this.compressedSize=a.readInt(8)),this.localHeaderOffset===e.MAX_VALUE_32BITS&&(this.localHeaderOffset=a.readInt(8)),this.diskNumberStart===e.MAX_VALUE_32BITS&&(this.diskNumberStart=a.readInt(4))}},readExtraFields:function(a){var b,c,d,e=a.index;for(this.extraFields=this.extraFields||{};a.index<e+this.extraFieldsLength;)b=a.readInt(2),c=a.readInt(2),d=a.readString(c),this.extraFields[b]={id:b,length:c,value:d}},handleUTF8:function(){if(this.useUTF8())this.fileName=g.utf8decode(this.fileName),this.fileComment=g.utf8decode(this.fileComment);else{var a=this.findExtraFieldUnicodePath();null!==a&&(this.fileName=a);var b=this.findExtraFieldUnicodeComment();null!==b&&(this.fileComment=b)}},findExtraFieldUnicodePath:function(){var a=this.extraFields[28789];if(a){var b=new d(a.value);return 1!==b.readInt(1)?null:g.crc32(this.fileName)!==b.readInt(4)?null:g.utf8decode(b.readString(a.length-5))}return null},findExtraFieldUnicodeComment:function(){var a=this.extraFields[25461];if(a){var b=new d(a.value);return 1!==b.readInt(1)?null:g.crc32(this.fileComment)!==b.readInt(4)?null:g.utf8decode(b.readString(a.length-5))}return null}},b.exports=c},{"./compressedObject":2,"./object":11,"./stringReader":13,"./utils":19}],22:[function(){},{}],23:[function(a,b){function c(){}var d=b.exports={};d.nextTick=function(){var a="undefined"!=typeof window&&window.setImmediate,b="undefined"!=typeof window&&window.postMessage&&window.addEventListener;if(a)return function(a){return window.setImmediate(a)};if(b){var c=[];return window.addEventListener("message",function(a){var b=a.source;if((b===window||null===b)&&"process-tick"===a.data&&(a.stopPropagation(),c.length>0)){var d=c.shift();d()}},!0),function(a){c.push(a),window.postMessage("process-tick","*")}}return function(a){setTimeout(a,0)}}(),d.title="browser",d.browser=!0,d.env={},d.argv=[],d.on=c,d.addListener=c,d.once=c,d.off=c,d.removeListener=c,d.removeAllListeners=c,d.emit=c,d.binding=function(){throw new Error("process.binding is not supported")},d.cwd=function(){return"/"},d.chdir=function(){throw new Error("process.chdir is not supported")}},{}],24:[function(a,b){"use strict";var c=a("./lib/utils/common").assign,d=a("./lib/deflate"),e=a("./lib/inflate"),f=a("./lib/zlib/constants"),g={};c(g,d,e,f),b.exports=g},{"./lib/deflate":25,"./lib/inflate":26,"./lib/utils/common":27,"./lib/zlib/constants":30}],25:[function(a,b,c){"use strict";function d(a,b){var c=new s(b);if(c.push(a,!0),c.err)throw c.msg;return c.result}function e(a,b){return b=b||{},b.raw=!0,d(a,b)}function f(a,b){return b=b||{},b.gzip=!0,d(a,b)}var g=a("./zlib/deflate.js"),h=a("./utils/common"),i=a("./utils/strings"),j=a("./zlib/messages"),k=a("./zlib/zstream"),l=0,m=4,n=0,o=1,p=-1,q=0,r=8,s=function(a){this.options=h.assign({level:p,method:r,chunkSize:16384,windowBits:15,memLevel:8,strategy:q,to:""},a||{});var b=this.options;b.raw&&b.windowBits>0?b.windowBits=-b.windowBits:b.gzip&&b.windowBits>0&&b.windowBits<16&&(b.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new k,this.strm.avail_out=0;var c=g.deflateInit2(this.strm,b.level,b.method,b.windowBits,b.memLevel,b.strategy);if(c!==n)throw new Error(j[c]);b.header&&g.deflateSetHeader(this.strm,b.header)};s.prototype.push=function(a,b){var c,d,e=this.strm,f=this.options.chunkSize;if(this.ended)return!1;d=b===~~b?b:b===!0?m:l,e.input="string"==typeof a?i.string2buf(a):a,e.next_in=0,e.avail_in=e.input.length;do{if(0===e.avail_out&&(e.output=new h.Buf8(f),e.next_out=0,e.avail_out=f),c=g.deflate(e,d),c!==o&&c!==n)return this.onEnd(c),this.ended=!0,!1;(0===e.avail_out||0===e.avail_in&&d===m)&&this.onData("string"===this.options.to?i.buf2binstring(h.shrinkBuf(e.output,e.next_out)):h.shrinkBuf(e.output,e.next_out))}while((e.avail_in>0||0===e.avail_out)&&c!==o);return d===m?(c=g.deflateEnd(this.strm),this.onEnd(c),this.ended=!0,c===n):!0},s.prototype.onData=function(a){this.chunks.push(a)},s.prototype.onEnd=function(a){a===n&&(this.result="string"===this.options.to?this.chunks.join(""):h.flattenChunks(this.chunks)),this.chunks=[],this.err=a,this.msg=this.strm.msg},c.Deflate=s,c.deflate=d,c.deflateRaw=e,c.gzip=f},{"./utils/common":27,"./utils/strings":28,"./zlib/deflate.js":32,"./zlib/messages":37,"./zlib/zstream":39}],26:[function(a,b,c){"use strict";function d(a,b){var c=new m(b);if(c.push(a,!0),c.err)throw c.msg;return c.result}function e(a,b){return b=b||{},b.raw=!0,d(a,b)}var f=a("./zlib/inflate.js"),g=a("./utils/common"),h=a("./utils/strings"),i=a("./zlib/constants"),j=a("./zlib/messages"),k=a("./zlib/zstream"),l=a("./zlib/gzheader"),m=function(a){this.options=g.assign({chunkSize:16384,windowBits:0,to:""},a||{});var b=this.options;b.raw&&b.windowBits>=0&&b.windowBits<16&&(b.windowBits=-b.windowBits,0===b.windowBits&&(b.windowBits=-15)),!(b.windowBits>=0&&b.windowBits<16)||a&&a.windowBits||(b.windowBits+=32),b.windowBits>15&&b.windowBits<48&&0===(15&b.windowBits)&&(b.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new k,this.strm.avail_out=0;var c=f.inflateInit2(this.strm,b.windowBits);if(c!==i.Z_OK)throw new Error(j[c]);this.header=new l,f.inflateGetHeader(this.strm,this.header)};m.prototype.push=function(a,b){var c,d,e,j,k,l=this.strm,m=this.options.chunkSize;if(this.ended)return!1;d=b===~~b?b:b===!0?i.Z_FINISH:i.Z_NO_FLUSH,l.input="string"==typeof a?h.binstring2buf(a):a,l.next_in=0,l.avail_in=l.input.length;do{if(0===l.avail_out&&(l.output=new g.Buf8(m),l.next_out=0,l.avail_out=m),c=f.inflate(l,i.Z_NO_FLUSH),c!==i.Z_STREAM_END&&c!==i.Z_OK)return this.onEnd(c),this.ended=!0,!1;l.next_out&&(0===l.avail_out||c===i.Z_STREAM_END||0===l.avail_in&&d===i.Z_FINISH)&&("string"===this.options.to?(e=h.utf8border(l.output,l.next_out),j=l.next_out-e,k=h.buf2string(l.output,e),l.next_out=j,l.avail_out=m-j,j&&g.arraySet(l.output,l.output,e,j,0),this.onData(k)):this.onData(g.shrinkBuf(l.output,l.next_out)))}while((l.avail_in>0||0===l.avail_out)&&c!==i.Z_STREAM_END);return c===i.Z_STREAM_END&&(d=i.Z_FINISH),d===i.Z_FINISH?(c=f.inflateEnd(this.strm),this.onEnd(c),this.ended=!0,c===i.Z_OK):!0},m.prototype.onData=function(a){this.chunks.push(a)},m.prototype.onEnd=function(a){a===i.Z_OK&&(this.result="string"===this.options.to?this.chunks.join(""):g.flattenChunks(this.chunks)),this.chunks=[],this.err=a,this.msg=this.strm.msg},c.Inflate=m,c.inflate=d,c.inflateRaw=e,c.ungzip=d},{"./utils/common":27,"./utils/strings":28,"./zlib/constants":30,"./zlib/gzheader":33,"./zlib/inflate.js":35,"./zlib/messages":37,"./zlib/zstream":39}],27:[function(a,b,c){"use strict";var d="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Int32Array;c.assign=function(a){for(var b=Array.prototype.slice.call(arguments,1);b.length;){var c=b.shift();if(c){if("object"!=typeof c)throw new TypeError(c+"must be non-object");for(var d in c)c.hasOwnProperty(d)&&(a[d]=c[d])}}return a},c.shrinkBuf=function(a,b){return a.length===b?a:a.subarray?a.subarray(0,b):(a.length=b,a)};var e={arraySet:function(a,b,c,d,e){if(b.subarray&&a.subarray)return void a.set(b.subarray(c,c+d),e);for(var f=0;d>f;f++)a[e+f]=b[c+f]},flattenChunks:function(a){var b,c,d,e,f,g;for(d=0,b=0,c=a.length;c>b;b++)d+=a[b].length;for(g=new Uint8Array(d),e=0,b=0,c=a.length;c>b;b++)f=a[b],g.set(f,e),e+=f.length;return g}},f={arraySet:function(a,b,c,d,e){for(var f=0;d>f;f++)a[e+f]=b[c+f]},flattenChunks:function(a){return[].concat.apply([],a)}};c.setTyped=function(a){a?(c.Buf8=Uint8Array,c.Buf16=Uint16Array,c.Buf32=Int32Array,c.assign(c,e)):(c.Buf8=Array,c.Buf16=Array,c.Buf32=Array,c.assign(c,f))},c.setTyped(d)},{}],28:[function(a,b,c){"use strict";function d(a,b){if(65537>b&&(a.subarray&&g||!a.subarray&&f))return String.fromCharCode.apply(null,e.shrinkBuf(a,b));for(var c="",d=0;b>d;d++)c+=String.fromCharCode(a[d]);return c}var e=a("./common"),f=!0,g=!0;try{String.fromCharCode.apply(null,[0])}catch(h){f=!1}try{String.fromCharCode.apply(null,new Uint8Array(1))}catch(h){g=!1}for(var i=new e.Buf8(256),j=0;256>j;j++)i[j]=j>=252?6:j>=248?5:j>=240?4:j>=224?3:j>=192?2:1;i[254]=i[254]=1,c.string2buf=function(a){var b,c,d,f,g,h=a.length,i=0;for(f=0;h>f;f++)c=a.charCodeAt(f),55296===(64512&c)&&h>f+1&&(d=a.charCodeAt(f+1),56320===(64512&d)&&(c=65536+(c-55296<<10)+(d-56320),f++)),i+=128>c?1:2048>c?2:65536>c?3:4;for(b=new e.Buf8(i),g=0,f=0;i>g;f++)c=a.charCodeAt(f),55296===(64512&c)&&h>f+1&&(d=a.charCodeAt(f+1),56320===(64512&d)&&(c=65536+(c-55296<<10)+(d-56320),f++)),128>c?b[g++]=c:2048>c?(b[g++]=192|c>>>6,b[g++]=128|63&c):65536>c?(b[g++]=224|c>>>12,b[g++]=128|c>>>6&63,b[g++]=128|63&c):(b[g++]=240|c>>>18,b[g++]=128|c>>>12&63,b[g++]=128|c>>>6&63,b[g++]=128|63&c);return b},c.buf2binstring=function(a){return d(a,a.length)},c.binstring2buf=function(a){for(var b=new e.Buf8(a.length),c=0,d=b.length;d>c;c++)b[c]=a.charCodeAt(c);return b},c.buf2string=function(a,b){var c,e,f,g,h=b||a.length,j=new Array(2*h);for(e=0,c=0;h>c;)if(f=a[c++],128>f)j[e++]=f;else if(g=i[f],g>4)j[e++]=65533,c+=g-1;else{for(f&=2===g?31:3===g?15:7;g>1&&h>c;)f=f<<6|63&a[c++],g--;g>1?j[e++]=65533:65536>f?j[e++]=f:(f-=65536,j[e++]=55296|f>>10&1023,j[e++]=56320|1023&f)}return d(j,e)},c.utf8border=function(a,b){var c;for(b=b||a.length,b>a.length&&(b=a.length),c=b-1;c>=0&&128===(192&a[c]);)c--;return 0>c?b:0===c?b:c+i[a[c]]>b?c:b}},{"./common":27}],29:[function(a,b){"use strict";function c(a,b,c,d){for(var e=65535&a|0,f=a>>>16&65535|0,g=0;0!==c;){g=c>2e3?2e3:c,c-=g;do e=e+b[d++]|0,f=f+e|0;while(--g);e%=65521,f%=65521}return e|f<<16|0}b.exports=c},{}],30:[function(a,b){b.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}},{}],31:[function(a,b){"use strict";function c(){for(var a,b=[],c=0;256>c;c++){a=c;for(var d=0;8>d;d++)a=1&a?3988292384^a>>>1:a>>>1;b[c]=a}return b}function d(a,b,c,d){var f=e,g=d+c;a=-1^a;for(var h=d;g>h;h++)a=a>>>8^f[255&(a^b[h])];return-1^a}var e=c();b.exports=d},{}],32:[function(a,b,c){"use strict";function d(a,b){return a.msg=G[b],b}function e(a){return(a<<1)-(a>4?9:0)}function f(a){for(var b=a.length;--b>=0;)a[b]=0}function g(a){var b=a.state,c=b.pending;c>a.avail_out&&(c=a.avail_out),0!==c&&(C.arraySet(a.output,b.pending_buf,b.pending_out,c,a.next_out),a.next_out+=c,b.pending_out+=c,a.total_out+=c,a.avail_out-=c,b.pending-=c,0===b.pending&&(b.pending_out=0))}function h(a,b){D._tr_flush_block(a,a.block_start>=0?a.block_start:-1,a.strstart-a.block_start,b),a.block_start=a.strstart,g(a.strm)}function i(a,b){a.pending_buf[a.pending++]=b}function j(a,b){a.pending_buf[a.pending++]=b>>>8&255,a.pending_buf[a.pending++]=255&b}function k(a,b,c,d){var e=a.avail_in;return e>d&&(e=d),0===e?0:(a.avail_in-=e,C.arraySet(b,a.input,a.next_in,e,c),1===a.state.wrap?a.adler=E(a.adler,b,e,c):2===a.state.wrap&&(a.adler=F(a.adler,b,e,c)),a.next_in+=e,a.total_in+=e,e)}function l(a,b){var c,d,e=a.max_chain_length,f=a.strstart,g=a.prev_length,h=a.nice_match,i=a.strstart>a.w_size-jb?a.strstart-(a.w_size-jb):0,j=a.window,k=a.w_mask,l=a.prev,m=a.strstart+ib,n=j[f+g-1],o=j[f+g];a.prev_length>=a.good_match&&(e>>=2),h>a.lookahead&&(h=a.lookahead);do if(c=b,j[c+g]===o&&j[c+g-1]===n&&j[c]===j[f]&&j[++c]===j[f+1]){f+=2,c++;do;while(j[++f]===j[++c]&&j[++f]===j[++c]&&j[++f]===j[++c]&&j[++f]===j[++c]&&j[++f]===j[++c]&&j[++f]===j[++c]&&j[++f]===j[++c]&&j[++f]===j[++c]&&m>f);if(d=ib-(m-f),f=m-ib,d>g){if(a.match_start=b,g=d,d>=h)break;n=j[f+g-1],o=j[f+g]}}while((b=l[b&k])>i&&0!==--e);return g<=a.lookahead?g:a.lookahead}function m(a){var b,c,d,e,f,g=a.w_size;do{if(e=a.window_size-a.lookahead-a.strstart,a.strstart>=g+(g-jb)){C.arraySet(a.window,a.window,g,g,0),a.match_start-=g,a.strstart-=g,a.block_start-=g,c=a.hash_size,b=c;do d=a.head[--b],a.head[b]=d>=g?d-g:0;while(--c);c=g,b=c;do d=a.prev[--b],a.prev[b]=d>=g?d-g:0;while(--c);e+=g}if(0===a.strm.avail_in)break;if(c=k(a.strm,a.window,a.strstart+a.lookahead,e),a.lookahead+=c,a.lookahead+a.insert>=hb)for(f=a.strstart-a.insert,a.ins_h=a.window[f],a.ins_h=(a.ins_h<<a.hash_shift^a.window[f+1])&a.hash_mask;a.insert&&(a.ins_h=(a.ins_h<<a.hash_shift^a.window[f+hb-1])&a.hash_mask,a.prev[f&a.w_mask]=a.head[a.ins_h],a.head[a.ins_h]=f,f++,a.insert--,!(a.lookahead+a.insert<hb)););}while(a.lookahead<jb&&0!==a.strm.avail_in)}function n(a,b){var c=65535;for(c>a.pending_buf_size-5&&(c=a.pending_buf_size-5);;){if(a.lookahead<=1){if(m(a),0===a.lookahead&&b===H)return sb;if(0===a.lookahead)break}a.strstart+=a.lookahead,a.lookahead=0;var d=a.block_start+c;if((0===a.strstart||a.strstart>=d)&&(a.lookahead=a.strstart-d,a.strstart=d,h(a,!1),0===a.strm.avail_out))return sb;if(a.strstart-a.block_start>=a.w_size-jb&&(h(a,!1),0===a.strm.avail_out))return sb}return a.insert=0,b===K?(h(a,!0),0===a.strm.avail_out?ub:vb):a.strstart>a.block_start&&(h(a,!1),0===a.strm.avail_out)?sb:sb}function o(a,b){for(var c,d;;){if(a.lookahead<jb){if(m(a),a.lookahead<jb&&b===H)return sb;if(0===a.lookahead)break}if(c=0,a.lookahead>=hb&&(a.ins_h=(a.ins_h<<a.hash_shift^a.window[a.strstart+hb-1])&a.hash_mask,c=a.prev[a.strstart&a.w_mask]=a.head[a.ins_h],a.head[a.ins_h]=a.strstart),0!==c&&a.strstart-c<=a.w_size-jb&&(a.match_length=l(a,c)),a.match_length>=hb)if(d=D._tr_tally(a,a.strstart-a.match_start,a.match_length-hb),a.lookahead-=a.match_length,a.match_length<=a.max_lazy_match&&a.lookahead>=hb){a.match_length--;do a.strstart++,a.ins_h=(a.ins_h<<a.hash_shift^a.window[a.strstart+hb-1])&a.hash_mask,c=a.prev[a.strstart&a.w_mask]=a.head[a.ins_h],a.head[a.ins_h]=a.strstart;while(0!==--a.match_length);a.strstart++}else a.strstart+=a.match_length,a.match_length=0,a.ins_h=a.window[a.strstart],a.ins_h=(a.ins_h<<a.hash_shift^a.window[a.strstart+1])&a.hash_mask;else d=D._tr_tally(a,0,a.window[a.strstart]),a.lookahead--,a.strstart++;if(d&&(h(a,!1),0===a.strm.avail_out))return sb}return a.insert=a.strstart<hb-1?a.strstart:hb-1,b===K?(h(a,!0),0===a.strm.avail_out?ub:vb):a.last_lit&&(h(a,!1),0===a.strm.avail_out)?sb:tb}function p(a,b){for(var c,d,e;;){if(a.lookahead<jb){if(m(a),a.lookahead<jb&&b===H)return sb;if(0===a.lookahead)break}if(c=0,a.lookahead>=hb&&(a.ins_h=(a.ins_h<<a.hash_shift^a.window[a.strstart+hb-1])&a.hash_mask,c=a.prev[a.strstart&a.w_mask]=a.head[a.ins_h],a.head[a.ins_h]=a.strstart),a.prev_length=a.match_length,a.prev_match=a.match_start,a.match_length=hb-1,0!==c&&a.prev_length<a.max_lazy_match&&a.strstart-c<=a.w_size-jb&&(a.match_length=l(a,c),a.match_length<=5&&(a.strategy===S||a.match_length===hb&&a.strstart-a.match_start>4096)&&(a.match_length=hb-1)),a.prev_length>=hb&&a.match_length<=a.prev_length){e=a.strstart+a.lookahead-hb,d=D._tr_tally(a,a.strstart-1-a.prev_match,a.prev_length-hb),a.lookahead-=a.prev_length-1,a.prev_length-=2;
do++a.strstart<=e&&(a.ins_h=(a.ins_h<<a.hash_shift^a.window[a.strstart+hb-1])&a.hash_mask,c=a.prev[a.strstart&a.w_mask]=a.head[a.ins_h],a.head[a.ins_h]=a.strstart);while(0!==--a.prev_length);if(a.match_available=0,a.match_length=hb-1,a.strstart++,d&&(h(a,!1),0===a.strm.avail_out))return sb}else if(a.match_available){if(d=D._tr_tally(a,0,a.window[a.strstart-1]),d&&h(a,!1),a.strstart++,a.lookahead--,0===a.strm.avail_out)return sb}else a.match_available=1,a.strstart++,a.lookahead--}return a.match_available&&(d=D._tr_tally(a,0,a.window[a.strstart-1]),a.match_available=0),a.insert=a.strstart<hb-1?a.strstart:hb-1,b===K?(h(a,!0),0===a.strm.avail_out?ub:vb):a.last_lit&&(h(a,!1),0===a.strm.avail_out)?sb:tb}function q(a,b){for(var c,d,e,f,g=a.window;;){if(a.lookahead<=ib){if(m(a),a.lookahead<=ib&&b===H)return sb;if(0===a.lookahead)break}if(a.match_length=0,a.lookahead>=hb&&a.strstart>0&&(e=a.strstart-1,d=g[e],d===g[++e]&&d===g[++e]&&d===g[++e])){f=a.strstart+ib;do;while(d===g[++e]&&d===g[++e]&&d===g[++e]&&d===g[++e]&&d===g[++e]&&d===g[++e]&&d===g[++e]&&d===g[++e]&&f>e);a.match_length=ib-(f-e),a.match_length>a.lookahead&&(a.match_length=a.lookahead)}if(a.match_length>=hb?(c=D._tr_tally(a,1,a.match_length-hb),a.lookahead-=a.match_length,a.strstart+=a.match_length,a.match_length=0):(c=D._tr_tally(a,0,a.window[a.strstart]),a.lookahead--,a.strstart++),c&&(h(a,!1),0===a.strm.avail_out))return sb}return a.insert=0,b===K?(h(a,!0),0===a.strm.avail_out?ub:vb):a.last_lit&&(h(a,!1),0===a.strm.avail_out)?sb:tb}function r(a,b){for(var c;;){if(0===a.lookahead&&(m(a),0===a.lookahead)){if(b===H)return sb;break}if(a.match_length=0,c=D._tr_tally(a,0,a.window[a.strstart]),a.lookahead--,a.strstart++,c&&(h(a,!1),0===a.strm.avail_out))return sb}return a.insert=0,b===K?(h(a,!0),0===a.strm.avail_out?ub:vb):a.last_lit&&(h(a,!1),0===a.strm.avail_out)?sb:tb}function s(a){a.window_size=2*a.w_size,f(a.head),a.max_lazy_match=B[a.level].max_lazy,a.good_match=B[a.level].good_length,a.nice_match=B[a.level].nice_length,a.max_chain_length=B[a.level].max_chain,a.strstart=0,a.block_start=0,a.lookahead=0,a.insert=0,a.match_length=a.prev_length=hb-1,a.match_available=0,a.ins_h=0}function t(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=Y,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new C.Buf16(2*fb),this.dyn_dtree=new C.Buf16(2*(2*db+1)),this.bl_tree=new C.Buf16(2*(2*eb+1)),f(this.dyn_ltree),f(this.dyn_dtree),f(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new C.Buf16(gb+1),this.heap=new C.Buf16(2*cb+1),f(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new C.Buf16(2*cb+1),f(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function u(a){var b;return a&&a.state?(a.total_in=a.total_out=0,a.data_type=X,b=a.state,b.pending=0,b.pending_out=0,b.wrap<0&&(b.wrap=-b.wrap),b.status=b.wrap?lb:qb,a.adler=2===b.wrap?0:1,b.last_flush=H,D._tr_init(b),M):d(a,O)}function v(a){var b=u(a);return b===M&&s(a.state),b}function w(a,b){return a&&a.state?2!==a.state.wrap?O:(a.state.gzhead=b,M):O}function x(a,b,c,e,f,g){if(!a)return O;var h=1;if(b===R&&(b=6),0>e?(h=0,e=-e):e>15&&(h=2,e-=16),1>f||f>Z||c!==Y||8>e||e>15||0>b||b>9||0>g||g>V)return d(a,O);8===e&&(e=9);var i=new t;return a.state=i,i.strm=a,i.wrap=h,i.gzhead=null,i.w_bits=e,i.w_size=1<<i.w_bits,i.w_mask=i.w_size-1,i.hash_bits=f+7,i.hash_size=1<<i.hash_bits,i.hash_mask=i.hash_size-1,i.hash_shift=~~((i.hash_bits+hb-1)/hb),i.window=new C.Buf8(2*i.w_size),i.head=new C.Buf16(i.hash_size),i.prev=new C.Buf16(i.w_size),i.lit_bufsize=1<<f+6,i.pending_buf_size=4*i.lit_bufsize,i.pending_buf=new C.Buf8(i.pending_buf_size),i.d_buf=i.lit_bufsize>>1,i.l_buf=3*i.lit_bufsize,i.level=b,i.strategy=g,i.method=c,v(a)}function y(a,b){return x(a,b,Y,$,_,W)}function z(a,b){var c,h,k,l;if(!a||!a.state||b>L||0>b)return a?d(a,O):O;if(h=a.state,!a.output||!a.input&&0!==a.avail_in||h.status===rb&&b!==K)return d(a,0===a.avail_out?Q:O);if(h.strm=a,c=h.last_flush,h.last_flush=b,h.status===lb)if(2===h.wrap)a.adler=0,i(h,31),i(h,139),i(h,8),h.gzhead?(i(h,(h.gzhead.text?1:0)+(h.gzhead.hcrc?2:0)+(h.gzhead.extra?4:0)+(h.gzhead.name?8:0)+(h.gzhead.comment?16:0)),i(h,255&h.gzhead.time),i(h,h.gzhead.time>>8&255),i(h,h.gzhead.time>>16&255),i(h,h.gzhead.time>>24&255),i(h,9===h.level?2:h.strategy>=T||h.level<2?4:0),i(h,255&h.gzhead.os),h.gzhead.extra&&h.gzhead.extra.length&&(i(h,255&h.gzhead.extra.length),i(h,h.gzhead.extra.length>>8&255)),h.gzhead.hcrc&&(a.adler=F(a.adler,h.pending_buf,h.pending,0)),h.gzindex=0,h.status=mb):(i(h,0),i(h,0),i(h,0),i(h,0),i(h,0),i(h,9===h.level?2:h.strategy>=T||h.level<2?4:0),i(h,wb),h.status=qb);else{var m=Y+(h.w_bits-8<<4)<<8,n=-1;n=h.strategy>=T||h.level<2?0:h.level<6?1:6===h.level?2:3,m|=n<<6,0!==h.strstart&&(m|=kb),m+=31-m%31,h.status=qb,j(h,m),0!==h.strstart&&(j(h,a.adler>>>16),j(h,65535&a.adler)),a.adler=1}if(h.status===mb)if(h.gzhead.extra){for(k=h.pending;h.gzindex<(65535&h.gzhead.extra.length)&&(h.pending!==h.pending_buf_size||(h.gzhead.hcrc&&h.pending>k&&(a.adler=F(a.adler,h.pending_buf,h.pending-k,k)),g(a),k=h.pending,h.pending!==h.pending_buf_size));)i(h,255&h.gzhead.extra[h.gzindex]),h.gzindex++;h.gzhead.hcrc&&h.pending>k&&(a.adler=F(a.adler,h.pending_buf,h.pending-k,k)),h.gzindex===h.gzhead.extra.length&&(h.gzindex=0,h.status=nb)}else h.status=nb;if(h.status===nb)if(h.gzhead.name){k=h.pending;do{if(h.pending===h.pending_buf_size&&(h.gzhead.hcrc&&h.pending>k&&(a.adler=F(a.adler,h.pending_buf,h.pending-k,k)),g(a),k=h.pending,h.pending===h.pending_buf_size)){l=1;break}l=h.gzindex<h.gzhead.name.length?255&h.gzhead.name.charCodeAt(h.gzindex++):0,i(h,l)}while(0!==l);h.gzhead.hcrc&&h.pending>k&&(a.adler=F(a.adler,h.pending_buf,h.pending-k,k)),0===l&&(h.gzindex=0,h.status=ob)}else h.status=ob;if(h.status===ob)if(h.gzhead.comment){k=h.pending;do{if(h.pending===h.pending_buf_size&&(h.gzhead.hcrc&&h.pending>k&&(a.adler=F(a.adler,h.pending_buf,h.pending-k,k)),g(a),k=h.pending,h.pending===h.pending_buf_size)){l=1;break}l=h.gzindex<h.gzhead.comment.length?255&h.gzhead.comment.charCodeAt(h.gzindex++):0,i(h,l)}while(0!==l);h.gzhead.hcrc&&h.pending>k&&(a.adler=F(a.adler,h.pending_buf,h.pending-k,k)),0===l&&(h.status=pb)}else h.status=pb;if(h.status===pb&&(h.gzhead.hcrc?(h.pending+2>h.pending_buf_size&&g(a),h.pending+2<=h.pending_buf_size&&(i(h,255&a.adler),i(h,a.adler>>8&255),a.adler=0,h.status=qb)):h.status=qb),0!==h.pending){if(g(a),0===a.avail_out)return h.last_flush=-1,M}else if(0===a.avail_in&&e(b)<=e(c)&&b!==K)return d(a,Q);if(h.status===rb&&0!==a.avail_in)return d(a,Q);if(0!==a.avail_in||0!==h.lookahead||b!==H&&h.status!==rb){var o=h.strategy===T?r(h,b):h.strategy===U?q(h,b):B[h.level].func(h,b);if((o===ub||o===vb)&&(h.status=rb),o===sb||o===ub)return 0===a.avail_out&&(h.last_flush=-1),M;if(o===tb&&(b===I?D._tr_align(h):b!==L&&(D._tr_stored_block(h,0,0,!1),b===J&&(f(h.head),0===h.lookahead&&(h.strstart=0,h.block_start=0,h.insert=0))),g(a),0===a.avail_out))return h.last_flush=-1,M}return b!==K?M:h.wrap<=0?N:(2===h.wrap?(i(h,255&a.adler),i(h,a.adler>>8&255),i(h,a.adler>>16&255),i(h,a.adler>>24&255),i(h,255&a.total_in),i(h,a.total_in>>8&255),i(h,a.total_in>>16&255),i(h,a.total_in>>24&255)):(j(h,a.adler>>>16),j(h,65535&a.adler)),g(a),h.wrap>0&&(h.wrap=-h.wrap),0!==h.pending?M:N)}function A(a){var b;return a&&a.state?(b=a.state.status,b!==lb&&b!==mb&&b!==nb&&b!==ob&&b!==pb&&b!==qb&&b!==rb?d(a,O):(a.state=null,b===qb?d(a,P):M)):O}var B,C=a("../utils/common"),D=a("./trees"),E=a("./adler32"),F=a("./crc32"),G=a("./messages"),H=0,I=1,J=3,K=4,L=5,M=0,N=1,O=-2,P=-3,Q=-5,R=-1,S=1,T=2,U=3,V=4,W=0,X=2,Y=8,Z=9,$=15,_=8,ab=29,bb=256,cb=bb+1+ab,db=30,eb=19,fb=2*cb+1,gb=15,hb=3,ib=258,jb=ib+hb+1,kb=32,lb=42,mb=69,nb=73,ob=91,pb=103,qb=113,rb=666,sb=1,tb=2,ub=3,vb=4,wb=3,xb=function(a,b,c,d,e){this.good_length=a,this.max_lazy=b,this.nice_length=c,this.max_chain=d,this.func=e};B=[new xb(0,0,0,0,n),new xb(4,4,8,4,o),new xb(4,5,16,8,o),new xb(4,6,32,32,o),new xb(4,4,16,16,p),new xb(8,16,32,32,p),new xb(8,16,128,128,p),new xb(8,32,128,256,p),new xb(32,128,258,1024,p),new xb(32,258,258,4096,p)],c.deflateInit=y,c.deflateInit2=x,c.deflateReset=v,c.deflateResetKeep=u,c.deflateSetHeader=w,c.deflate=z,c.deflateEnd=A,c.deflateInfo="pako deflate (from Nodeca project)"},{"../utils/common":27,"./adler32":29,"./crc32":31,"./messages":37,"./trees":38}],33:[function(a,b){"use strict";function c(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1}b.exports=c},{}],34:[function(a,b){"use strict";var c=30,d=12;b.exports=function(a,b){var e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C;e=a.state,f=a.next_in,B=a.input,g=f+(a.avail_in-5),h=a.next_out,C=a.output,i=h-(b-a.avail_out),j=h+(a.avail_out-257),k=e.dmax,l=e.wsize,m=e.whave,n=e.wnext,o=e.window,p=e.hold,q=e.bits,r=e.lencode,s=e.distcode,t=(1<<e.lenbits)-1,u=(1<<e.distbits)-1;a:do{15>q&&(p+=B[f++]<<q,q+=8,p+=B[f++]<<q,q+=8),v=r[p&t];b:for(;;){if(w=v>>>24,p>>>=w,q-=w,w=v>>>16&255,0===w)C[h++]=65535&v;else{if(!(16&w)){if(0===(64&w)){v=r[(65535&v)+(p&(1<<w)-1)];continue b}if(32&w){e.mode=d;break a}a.msg="invalid literal/length code",e.mode=c;break a}x=65535&v,w&=15,w&&(w>q&&(p+=B[f++]<<q,q+=8),x+=p&(1<<w)-1,p>>>=w,q-=w),15>q&&(p+=B[f++]<<q,q+=8,p+=B[f++]<<q,q+=8),v=s[p&u];c:for(;;){if(w=v>>>24,p>>>=w,q-=w,w=v>>>16&255,!(16&w)){if(0===(64&w)){v=s[(65535&v)+(p&(1<<w)-1)];continue c}a.msg="invalid distance code",e.mode=c;break a}if(y=65535&v,w&=15,w>q&&(p+=B[f++]<<q,q+=8,w>q&&(p+=B[f++]<<q,q+=8)),y+=p&(1<<w)-1,y>k){a.msg="invalid distance too far back",e.mode=c;break a}if(p>>>=w,q-=w,w=h-i,y>w){if(w=y-w,w>m&&e.sane){a.msg="invalid distance too far back",e.mode=c;break a}if(z=0,A=o,0===n){if(z+=l-w,x>w){x-=w;do C[h++]=o[z++];while(--w);z=h-y,A=C}}else if(w>n){if(z+=l+n-w,w-=n,x>w){x-=w;do C[h++]=o[z++];while(--w);if(z=0,x>n){w=n,x-=w;do C[h++]=o[z++];while(--w);z=h-y,A=C}}}else if(z+=n-w,x>w){x-=w;do C[h++]=o[z++];while(--w);z=h-y,A=C}for(;x>2;)C[h++]=A[z++],C[h++]=A[z++],C[h++]=A[z++],x-=3;x&&(C[h++]=A[z++],x>1&&(C[h++]=A[z++]))}else{z=h-y;do C[h++]=C[z++],C[h++]=C[z++],C[h++]=C[z++],x-=3;while(x>2);x&&(C[h++]=C[z++],x>1&&(C[h++]=C[z++]))}break}}break}}while(g>f&&j>h);x=q>>3,f-=x,q-=x<<3,p&=(1<<q)-1,a.next_in=f,a.next_out=h,a.avail_in=g>f?5+(g-f):5-(f-g),a.avail_out=j>h?257+(j-h):257-(h-j),e.hold=p,e.bits=q}},{}],35:[function(a,b,c){"use strict";function d(a){return(a>>>24&255)+(a>>>8&65280)+((65280&a)<<8)+((255&a)<<24)}function e(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new r.Buf16(320),this.work=new r.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}function f(a){var b;return a&&a.state?(b=a.state,a.total_in=a.total_out=b.total=0,a.msg="",b.wrap&&(a.adler=1&b.wrap),b.mode=K,b.last=0,b.havedict=0,b.dmax=32768,b.head=null,b.hold=0,b.bits=0,b.lencode=b.lendyn=new r.Buf32(ob),b.distcode=b.distdyn=new r.Buf32(pb),b.sane=1,b.back=-1,C):F}function g(a){var b;return a&&a.state?(b=a.state,b.wsize=0,b.whave=0,b.wnext=0,f(a)):F}function h(a,b){var c,d;return a&&a.state?(d=a.state,0>b?(c=0,b=-b):(c=(b>>4)+1,48>b&&(b&=15)),b&&(8>b||b>15)?F:(null!==d.window&&d.wbits!==b&&(d.window=null),d.wrap=c,d.wbits=b,g(a))):F}function i(a,b){var c,d;return a?(d=new e,a.state=d,d.window=null,c=h(a,b),c!==C&&(a.state=null),c):F}function j(a){return i(a,rb)}function k(a){if(sb){var b;for(p=new r.Buf32(512),q=new r.Buf32(32),b=0;144>b;)a.lens[b++]=8;for(;256>b;)a.lens[b++]=9;for(;280>b;)a.lens[b++]=7;for(;288>b;)a.lens[b++]=8;for(v(x,a.lens,0,288,p,0,a.work,{bits:9}),b=0;32>b;)a.lens[b++]=5;v(y,a.lens,0,32,q,0,a.work,{bits:5}),sb=!1}a.lencode=p,a.lenbits=9,a.distcode=q,a.distbits=5}function l(a,b,c,d){var e,f=a.state;return null===f.window&&(f.wsize=1<<f.wbits,f.wnext=0,f.whave=0,f.window=new r.Buf8(f.wsize)),d>=f.wsize?(r.arraySet(f.window,b,c-f.wsize,f.wsize,0),f.wnext=0,f.whave=f.wsize):(e=f.wsize-f.wnext,e>d&&(e=d),r.arraySet(f.window,b,c-d,e,f.wnext),d-=e,d?(r.arraySet(f.window,b,c-d,d,0),f.wnext=d,f.whave=f.wsize):(f.wnext+=e,f.wnext===f.wsize&&(f.wnext=0),f.whave<f.wsize&&(f.whave+=e))),0}function m(a,b){var c,e,f,g,h,i,j,m,n,o,p,q,ob,pb,qb,rb,sb,tb,ub,vb,wb,xb,yb,zb,Ab=0,Bb=new r.Buf8(4),Cb=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!a||!a.state||!a.output||!a.input&&0!==a.avail_in)return F;c=a.state,c.mode===V&&(c.mode=W),h=a.next_out,f=a.output,j=a.avail_out,g=a.next_in,e=a.input,i=a.avail_in,m=c.hold,n=c.bits,o=i,p=j,xb=C;a:for(;;)switch(c.mode){case K:if(0===c.wrap){c.mode=W;break}for(;16>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(2&c.wrap&&35615===m){c.check=0,Bb[0]=255&m,Bb[1]=m>>>8&255,c.check=t(c.check,Bb,2,0),m=0,n=0,c.mode=L;break}if(c.flags=0,c.head&&(c.head.done=!1),!(1&c.wrap)||(((255&m)<<8)+(m>>8))%31){a.msg="incorrect header check",c.mode=lb;break}if((15&m)!==J){a.msg="unknown compression method",c.mode=lb;break}if(m>>>=4,n-=4,wb=(15&m)+8,0===c.wbits)c.wbits=wb;else if(wb>c.wbits){a.msg="invalid window size",c.mode=lb;break}c.dmax=1<<wb,a.adler=c.check=1,c.mode=512&m?T:V,m=0,n=0;break;case L:for(;16>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(c.flags=m,(255&c.flags)!==J){a.msg="unknown compression method",c.mode=lb;break}if(57344&c.flags){a.msg="unknown header flags set",c.mode=lb;break}c.head&&(c.head.text=m>>8&1),512&c.flags&&(Bb[0]=255&m,Bb[1]=m>>>8&255,c.check=t(c.check,Bb,2,0)),m=0,n=0,c.mode=M;case M:for(;32>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}c.head&&(c.head.time=m),512&c.flags&&(Bb[0]=255&m,Bb[1]=m>>>8&255,Bb[2]=m>>>16&255,Bb[3]=m>>>24&255,c.check=t(c.check,Bb,4,0)),m=0,n=0,c.mode=N;case N:for(;16>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}c.head&&(c.head.xflags=255&m,c.head.os=m>>8),512&c.flags&&(Bb[0]=255&m,Bb[1]=m>>>8&255,c.check=t(c.check,Bb,2,0)),m=0,n=0,c.mode=O;case O:if(1024&c.flags){for(;16>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}c.length=m,c.head&&(c.head.extra_len=m),512&c.flags&&(Bb[0]=255&m,Bb[1]=m>>>8&255,c.check=t(c.check,Bb,2,0)),m=0,n=0}else c.head&&(c.head.extra=null);c.mode=P;case P:if(1024&c.flags&&(q=c.length,q>i&&(q=i),q&&(c.head&&(wb=c.head.extra_len-c.length,c.head.extra||(c.head.extra=new Array(c.head.extra_len)),r.arraySet(c.head.extra,e,g,q,wb)),512&c.flags&&(c.check=t(c.check,e,q,g)),i-=q,g+=q,c.length-=q),c.length))break a;c.length=0,c.mode=Q;case Q:if(2048&c.flags){if(0===i)break a;q=0;do wb=e[g+q++],c.head&&wb&&c.length<65536&&(c.head.name+=String.fromCharCode(wb));while(wb&&i>q);if(512&c.flags&&(c.check=t(c.check,e,q,g)),i-=q,g+=q,wb)break a}else c.head&&(c.head.name=null);c.length=0,c.mode=R;case R:if(4096&c.flags){if(0===i)break a;q=0;do wb=e[g+q++],c.head&&wb&&c.length<65536&&(c.head.comment+=String.fromCharCode(wb));while(wb&&i>q);if(512&c.flags&&(c.check=t(c.check,e,q,g)),i-=q,g+=q,wb)break a}else c.head&&(c.head.comment=null);c.mode=S;case S:if(512&c.flags){for(;16>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(m!==(65535&c.check)){a.msg="header crc mismatch",c.mode=lb;break}m=0,n=0}c.head&&(c.head.hcrc=c.flags>>9&1,c.head.done=!0),a.adler=c.check=0,c.mode=V;break;case T:for(;32>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}a.adler=c.check=d(m),m=0,n=0,c.mode=U;case U:if(0===c.havedict)return a.next_out=h,a.avail_out=j,a.next_in=g,a.avail_in=i,c.hold=m,c.bits=n,E;a.adler=c.check=1,c.mode=V;case V:if(b===A||b===B)break a;case W:if(c.last){m>>>=7&n,n-=7&n,c.mode=ib;break}for(;3>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}switch(c.last=1&m,m>>>=1,n-=1,3&m){case 0:c.mode=X;break;case 1:if(k(c),c.mode=bb,b===B){m>>>=2,n-=2;break a}break;case 2:c.mode=$;break;case 3:a.msg="invalid block type",c.mode=lb}m>>>=2,n-=2;break;case X:for(m>>>=7&n,n-=7&n;32>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if((65535&m)!==(m>>>16^65535)){a.msg="invalid stored block lengths",c.mode=lb;break}if(c.length=65535&m,m=0,n=0,c.mode=Y,b===B)break a;case Y:c.mode=Z;case Z:if(q=c.length){if(q>i&&(q=i),q>j&&(q=j),0===q)break a;r.arraySet(f,e,g,q,h),i-=q,g+=q,j-=q,h+=q,c.length-=q;break}c.mode=V;break;case $:for(;14>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(c.nlen=(31&m)+257,m>>>=5,n-=5,c.ndist=(31&m)+1,m>>>=5,n-=5,c.ncode=(15&m)+4,m>>>=4,n-=4,c.nlen>286||c.ndist>30){a.msg="too many length or distance symbols",c.mode=lb;break}c.have=0,c.mode=_;case _:for(;c.have<c.ncode;){for(;3>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}c.lens[Cb[c.have++]]=7&m,m>>>=3,n-=3}for(;c.have<19;)c.lens[Cb[c.have++]]=0;if(c.lencode=c.lendyn,c.lenbits=7,yb={bits:c.lenbits},xb=v(w,c.lens,0,19,c.lencode,0,c.work,yb),c.lenbits=yb.bits,xb){a.msg="invalid code lengths set",c.mode=lb;break}c.have=0,c.mode=ab;case ab:for(;c.have<c.nlen+c.ndist;){for(;Ab=c.lencode[m&(1<<c.lenbits)-1],qb=Ab>>>24,rb=Ab>>>16&255,sb=65535&Ab,!(n>=qb);){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(16>sb)m>>>=qb,n-=qb,c.lens[c.have++]=sb;else{if(16===sb){for(zb=qb+2;zb>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(m>>>=qb,n-=qb,0===c.have){a.msg="invalid bit length repeat",c.mode=lb;break}wb=c.lens[c.have-1],q=3+(3&m),m>>>=2,n-=2}else if(17===sb){for(zb=qb+3;zb>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}m>>>=qb,n-=qb,wb=0,q=3+(7&m),m>>>=3,n-=3}else{for(zb=qb+7;zb>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}m>>>=qb,n-=qb,wb=0,q=11+(127&m),m>>>=7,n-=7}if(c.have+q>c.nlen+c.ndist){a.msg="invalid bit length repeat",c.mode=lb;break}for(;q--;)c.lens[c.have++]=wb}}if(c.mode===lb)break;if(0===c.lens[256]){a.msg="invalid code -- missing end-of-block",c.mode=lb;break}if(c.lenbits=9,yb={bits:c.lenbits},xb=v(x,c.lens,0,c.nlen,c.lencode,0,c.work,yb),c.lenbits=yb.bits,xb){a.msg="invalid literal/lengths set",c.mode=lb;break}if(c.distbits=6,c.distcode=c.distdyn,yb={bits:c.distbits},xb=v(y,c.lens,c.nlen,c.ndist,c.distcode,0,c.work,yb),c.distbits=yb.bits,xb){a.msg="invalid distances set",c.mode=lb;break}if(c.mode=bb,b===B)break a;case bb:c.mode=cb;case cb:if(i>=6&&j>=258){a.next_out=h,a.avail_out=j,a.next_in=g,a.avail_in=i,c.hold=m,c.bits=n,u(a,p),h=a.next_out,f=a.output,j=a.avail_out,g=a.next_in,e=a.input,i=a.avail_in,m=c.hold,n=c.bits,c.mode===V&&(c.back=-1);break}for(c.back=0;Ab=c.lencode[m&(1<<c.lenbits)-1],qb=Ab>>>24,rb=Ab>>>16&255,sb=65535&Ab,!(n>=qb);){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(rb&&0===(240&rb)){for(tb=qb,ub=rb,vb=sb;Ab=c.lencode[vb+((m&(1<<tb+ub)-1)>>tb)],qb=Ab>>>24,rb=Ab>>>16&255,sb=65535&Ab,!(n>=tb+qb);){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}m>>>=tb,n-=tb,c.back+=tb}if(m>>>=qb,n-=qb,c.back+=qb,c.length=sb,0===rb){c.mode=hb;break}if(32&rb){c.back=-1,c.mode=V;break}if(64&rb){a.msg="invalid literal/length code",c.mode=lb;break}c.extra=15&rb,c.mode=db;case db:if(c.extra){for(zb=c.extra;zb>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}c.length+=m&(1<<c.extra)-1,m>>>=c.extra,n-=c.extra,c.back+=c.extra}c.was=c.length,c.mode=eb;case eb:for(;Ab=c.distcode[m&(1<<c.distbits)-1],qb=Ab>>>24,rb=Ab>>>16&255,sb=65535&Ab,!(n>=qb);){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(0===(240&rb)){for(tb=qb,ub=rb,vb=sb;Ab=c.distcode[vb+((m&(1<<tb+ub)-1)>>tb)],qb=Ab>>>24,rb=Ab>>>16&255,sb=65535&Ab,!(n>=tb+qb);){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}m>>>=tb,n-=tb,c.back+=tb}if(m>>>=qb,n-=qb,c.back+=qb,64&rb){a.msg="invalid distance code",c.mode=lb;break}c.offset=sb,c.extra=15&rb,c.mode=fb;case fb:if(c.extra){for(zb=c.extra;zb>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}c.offset+=m&(1<<c.extra)-1,m>>>=c.extra,n-=c.extra,c.back+=c.extra}if(c.offset>c.dmax){a.msg="invalid distance too far back",c.mode=lb;break}c.mode=gb;case gb:if(0===j)break a;if(q=p-j,c.offset>q){if(q=c.offset-q,q>c.whave&&c.sane){a.msg="invalid distance too far back",c.mode=lb;break}q>c.wnext?(q-=c.wnext,ob=c.wsize-q):ob=c.wnext-q,q>c.length&&(q=c.length),pb=c.window}else pb=f,ob=h-c.offset,q=c.length;q>j&&(q=j),j-=q,c.length-=q;do f[h++]=pb[ob++];while(--q);0===c.length&&(c.mode=cb);break;case hb:if(0===j)break a;f[h++]=c.length,j--,c.mode=cb;break;case ib:if(c.wrap){for(;32>n;){if(0===i)break a;i--,m|=e[g++]<<n,n+=8}if(p-=j,a.total_out+=p,c.total+=p,p&&(a.adler=c.check=c.flags?t(c.check,f,p,h-p):s(c.check,f,p,h-p)),p=j,(c.flags?m:d(m))!==c.check){a.msg="incorrect data check",c.mode=lb;break}m=0,n=0}c.mode=jb;case jb:if(c.wrap&&c.flags){for(;32>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(m!==(4294967295&c.total)){a.msg="incorrect length check",c.mode=lb;break}m=0,n=0}c.mode=kb;case kb:xb=D;break a;case lb:xb=G;break a;case mb:return H;case nb:default:return F}return a.next_out=h,a.avail_out=j,a.next_in=g,a.avail_in=i,c.hold=m,c.bits=n,(c.wsize||p!==a.avail_out&&c.mode<lb&&(c.mode<ib||b!==z))&&l(a,a.output,a.next_out,p-a.avail_out)?(c.mode=mb,H):(o-=a.avail_in,p-=a.avail_out,a.total_in+=o,a.total_out+=p,c.total+=p,c.wrap&&p&&(a.adler=c.check=c.flags?t(c.check,f,p,a.next_out-p):s(c.check,f,p,a.next_out-p)),a.data_type=c.bits+(c.last?64:0)+(c.mode===V?128:0)+(c.mode===bb||c.mode===Y?256:0),(0===o&&0===p||b===z)&&xb===C&&(xb=I),xb)}function n(a){if(!a||!a.state)return F;var b=a.state;return b.window&&(b.window=null),a.state=null,C}function o(a,b){var c;return a&&a.state?(c=a.state,0===(2&c.wrap)?F:(c.head=b,b.done=!1,C)):F}var p,q,r=a("../utils/common"),s=a("./adler32"),t=a("./crc32"),u=a("./inffast"),v=a("./inftrees"),w=0,x=1,y=2,z=4,A=5,B=6,C=0,D=1,E=2,F=-2,G=-3,H=-4,I=-5,J=8,K=1,L=2,M=3,N=4,O=5,P=6,Q=7,R=8,S=9,T=10,U=11,V=12,W=13,X=14,Y=15,Z=16,$=17,_=18,ab=19,bb=20,cb=21,db=22,eb=23,fb=24,gb=25,hb=26,ib=27,jb=28,kb=29,lb=30,mb=31,nb=32,ob=852,pb=592,qb=15,rb=qb,sb=!0;c.inflateReset=g,c.inflateReset2=h,c.inflateResetKeep=f,c.inflateInit=j,c.inflateInit2=i,c.inflate=m,c.inflateEnd=n,c.inflateGetHeader=o,c.inflateInfo="pako inflate (from Nodeca project)"},{"../utils/common":27,"./adler32":29,"./crc32":31,"./inffast":34,"./inftrees":36}],36:[function(a,b){"use strict";var c=a("../utils/common"),d=15,e=852,f=592,g=0,h=1,i=2,j=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],k=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],l=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],m=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];b.exports=function(a,b,n,o,p,q,r,s){var t,u,v,w,x,y,z,A,B,C=s.bits,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=null,O=0,P=new c.Buf16(d+1),Q=new c.Buf16(d+1),R=null,S=0;for(D=0;d>=D;D++)P[D]=0;for(E=0;o>E;E++)P[b[n+E]]++;for(H=C,G=d;G>=1&&0===P[G];G--);if(H>G&&(H=G),0===G)return p[q++]=20971520,p[q++]=20971520,s.bits=1,0;for(F=1;G>F&&0===P[F];F++);for(F>H&&(H=F),K=1,D=1;d>=D;D++)if(K<<=1,K-=P[D],0>K)return-1;if(K>0&&(a===g||1!==G))return-1;for(Q[1]=0,D=1;d>D;D++)Q[D+1]=Q[D]+P[D];for(E=0;o>E;E++)0!==b[n+E]&&(r[Q[b[n+E]]++]=E);switch(a){case g:N=R=r,y=19;break;case h:N=j,O-=257,R=k,S-=257,y=256;break;default:N=l,R=m,y=-1}if(M=0,E=0,D=F,x=q,I=H,J=0,v=-1,L=1<<H,w=L-1,a===h&&L>e||a===i&&L>f)return 1;for(var T=0;;){T++,z=D-J,r[E]<y?(A=0,B=r[E]):r[E]>y?(A=R[S+r[E]],B=N[O+r[E]]):(A=96,B=0),t=1<<D-J,u=1<<I,F=u;do u-=t,p[x+(M>>J)+u]=z<<24|A<<16|B|0;while(0!==u);for(t=1<<D-1;M&t;)t>>=1;if(0!==t?(M&=t-1,M+=t):M=0,E++,0===--P[D]){if(D===G)break;D=b[n+r[E]]}if(D>H&&(M&w)!==v){for(0===J&&(J=H),x+=F,I=D-J,K=1<<I;G>I+J&&(K-=P[I+J],!(0>=K));)I++,K<<=1;if(L+=1<<I,a===h&&L>e||a===i&&L>f)return 1;v=M&w,p[v]=H<<24|I<<16|x-q|0}}return 0!==M&&(p[x+M]=D-J<<24|64<<16|0),s.bits=H,0}},{"../utils/common":27}],37:[function(a,b){"use strict";b.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"}},{}],38:[function(a,b,c){"use strict";function d(a){for(var b=a.length;--b>=0;)a[b]=0}function e(a){return 256>a?gb[a]:gb[256+(a>>>7)]}function f(a,b){a.pending_buf[a.pending++]=255&b,a.pending_buf[a.pending++]=b>>>8&255}function g(a,b,c){a.bi_valid>V-c?(a.bi_buf|=b<<a.bi_valid&65535,f(a,a.bi_buf),a.bi_buf=b>>V-a.bi_valid,a.bi_valid+=c-V):(a.bi_buf|=b<<a.bi_valid&65535,a.bi_valid+=c)}function h(a,b,c){g(a,c[2*b],c[2*b+1])}function i(a,b){var c=0;do c|=1&a,a>>>=1,c<<=1;while(--b>0);return c>>>1}function j(a){16===a.bi_valid?(f(a,a.bi_buf),a.bi_buf=0,a.bi_valid=0):a.bi_valid>=8&&(a.pending_buf[a.pending++]=255&a.bi_buf,a.bi_buf>>=8,a.bi_valid-=8)}function k(a,b){var c,d,e,f,g,h,i=b.dyn_tree,j=b.max_code,k=b.stat_desc.static_tree,l=b.stat_desc.has_stree,m=b.stat_desc.extra_bits,n=b.stat_desc.extra_base,o=b.stat_desc.max_length,p=0;for(f=0;U>=f;f++)a.bl_count[f]=0;for(i[2*a.heap[a.heap_max]+1]=0,c=a.heap_max+1;T>c;c++)d=a.heap[c],f=i[2*i[2*d+1]+1]+1,f>o&&(f=o,p++),i[2*d+1]=f,d>j||(a.bl_count[f]++,g=0,d>=n&&(g=m[d-n]),h=i[2*d],a.opt_len+=h*(f+g),l&&(a.static_len+=h*(k[2*d+1]+g)));if(0!==p){do{for(f=o-1;0===a.bl_count[f];)f--;a.bl_count[f]--,a.bl_count[f+1]+=2,a.bl_count[o]--,p-=2}while(p>0);for(f=o;0!==f;f--)for(d=a.bl_count[f];0!==d;)e=a.heap[--c],e>j||(i[2*e+1]!==f&&(a.opt_len+=(f-i[2*e+1])*i[2*e],i[2*e+1]=f),d--)}}function l(a,b,c){var d,e,f=new Array(U+1),g=0;for(d=1;U>=d;d++)f[d]=g=g+c[d-1]<<1;for(e=0;b>=e;e++){var h=a[2*e+1];0!==h&&(a[2*e]=i(f[h]++,h))}}function m(){var a,b,c,d,e,f=new Array(U+1);for(c=0,d=0;O-1>d;d++)for(ib[d]=c,a=0;a<1<<_[d];a++)hb[c++]=d;for(hb[c-1]=d,e=0,d=0;16>d;d++)for(jb[d]=e,a=0;a<1<<ab[d];a++)gb[e++]=d;for(e>>=7;R>d;d++)for(jb[d]=e<<7,a=0;a<1<<ab[d]-7;a++)gb[256+e++]=d;for(b=0;U>=b;b++)f[b]=0;for(a=0;143>=a;)eb[2*a+1]=8,a++,f[8]++;for(;255>=a;)eb[2*a+1]=9,a++,f[9]++;for(;279>=a;)eb[2*a+1]=7,a++,f[7]++;for(;287>=a;)eb[2*a+1]=8,a++,f[8]++;for(l(eb,Q+1,f),a=0;R>a;a++)fb[2*a+1]=5,fb[2*a]=i(a,5);kb=new nb(eb,_,P+1,Q,U),lb=new nb(fb,ab,0,R,U),mb=new nb(new Array(0),bb,0,S,W)}function n(a){var b;for(b=0;Q>b;b++)a.dyn_ltree[2*b]=0;for(b=0;R>b;b++)a.dyn_dtree[2*b]=0;for(b=0;S>b;b++)a.bl_tree[2*b]=0;a.dyn_ltree[2*X]=1,a.opt_len=a.static_len=0,a.last_lit=a.matches=0}function o(a){a.bi_valid>8?f(a,a.bi_buf):a.bi_valid>0&&(a.pending_buf[a.pending++]=a.bi_buf),a.bi_buf=0,a.bi_valid=0}function p(a,b,c,d){o(a),d&&(f(a,c),f(a,~c)),E.arraySet(a.pending_buf,a.window,b,c,a.pending),a.pending+=c}function q(a,b,c,d){var e=2*b,f=2*c;return a[e]<a[f]||a[e]===a[f]&&d[b]<=d[c]}function r(a,b,c){for(var d=a.heap[c],e=c<<1;e<=a.heap_len&&(e<a.heap_len&&q(b,a.heap[e+1],a.heap[e],a.depth)&&e++,!q(b,d,a.heap[e],a.depth));)a.heap[c]=a.heap[e],c=e,e<<=1;a.heap[c]=d}function s(a,b,c){var d,f,i,j,k=0;if(0!==a.last_lit)do d=a.pending_buf[a.d_buf+2*k]<<8|a.pending_buf[a.d_buf+2*k+1],f=a.pending_buf[a.l_buf+k],k++,0===d?h(a,f,b):(i=hb[f],h(a,i+P+1,b),j=_[i],0!==j&&(f-=ib[i],g(a,f,j)),d--,i=e(d),h(a,i,c),j=ab[i],0!==j&&(d-=jb[i],g(a,d,j)));while(k<a.last_lit);h(a,X,b)}function t(a,b){var c,d,e,f=b.dyn_tree,g=b.stat_desc.static_tree,h=b.stat_desc.has_stree,i=b.stat_desc.elems,j=-1;for(a.heap_len=0,a.heap_max=T,c=0;i>c;c++)0!==f[2*c]?(a.heap[++a.heap_len]=j=c,a.depth[c]=0):f[2*c+1]=0;for(;a.heap_len<2;)e=a.heap[++a.heap_len]=2>j?++j:0,f[2*e]=1,a.depth[e]=0,a.opt_len--,h&&(a.static_len-=g[2*e+1]);for(b.max_code=j,c=a.heap_len>>1;c>=1;c--)r(a,f,c);e=i;do c=a.heap[1],a.heap[1]=a.heap[a.heap_len--],r(a,f,1),d=a.heap[1],a.heap[--a.heap_max]=c,a.heap[--a.heap_max]=d,f[2*e]=f[2*c]+f[2*d],a.depth[e]=(a.depth[c]>=a.depth[d]?a.depth[c]:a.depth[d])+1,f[2*c+1]=f[2*d+1]=e,a.heap[1]=e++,r(a,f,1);while(a.heap_len>=2);a.heap[--a.heap_max]=a.heap[1],k(a,b),l(f,j,a.bl_count)}function u(a,b,c){var d,e,f=-1,g=b[1],h=0,i=7,j=4;for(0===g&&(i=138,j=3),b[2*(c+1)+1]=65535,d=0;c>=d;d++)e=g,g=b[2*(d+1)+1],++h<i&&e===g||(j>h?a.bl_tree[2*e]+=h:0!==e?(e!==f&&a.bl_tree[2*e]++,a.bl_tree[2*Y]++):10>=h?a.bl_tree[2*Z]++:a.bl_tree[2*$]++,h=0,f=e,0===g?(i=138,j=3):e===g?(i=6,j=3):(i=7,j=4))}function v(a,b,c){var d,e,f=-1,i=b[1],j=0,k=7,l=4;for(0===i&&(k=138,l=3),d=0;c>=d;d++)if(e=i,i=b[2*(d+1)+1],!(++j<k&&e===i)){if(l>j){do h(a,e,a.bl_tree);while(0!==--j)}else 0!==e?(e!==f&&(h(a,e,a.bl_tree),j--),h(a,Y,a.bl_tree),g(a,j-3,2)):10>=j?(h(a,Z,a.bl_tree),g(a,j-3,3)):(h(a,$,a.bl_tree),g(a,j-11,7));j=0,f=e,0===i?(k=138,l=3):e===i?(k=6,l=3):(k=7,l=4)}}function w(a){var b;for(u(a,a.dyn_ltree,a.l_desc.max_code),u(a,a.dyn_dtree,a.d_desc.max_code),t(a,a.bl_desc),b=S-1;b>=3&&0===a.bl_tree[2*cb[b]+1];b--);return a.opt_len+=3*(b+1)+5+5+4,b}function x(a,b,c,d){var e;for(g(a,b-257,5),g(a,c-1,5),g(a,d-4,4),e=0;d>e;e++)g(a,a.bl_tree[2*cb[e]+1],3);v(a,a.dyn_ltree,b-1),v(a,a.dyn_dtree,c-1)}function y(a){var b,c=4093624447;for(b=0;31>=b;b++,c>>>=1)if(1&c&&0!==a.dyn_ltree[2*b])return G;if(0!==a.dyn_ltree[18]||0!==a.dyn_ltree[20]||0!==a.dyn_ltree[26])return H;for(b=32;P>b;b++)if(0!==a.dyn_ltree[2*b])return H;return G}function z(a){pb||(m(),pb=!0),a.l_desc=new ob(a.dyn_ltree,kb),a.d_desc=new ob(a.dyn_dtree,lb),a.bl_desc=new ob(a.bl_tree,mb),a.bi_buf=0,a.bi_valid=0,n(a)}function A(a,b,c,d){g(a,(J<<1)+(d?1:0),3),p(a,b,c,!0)}function B(a){g(a,K<<1,3),h(a,X,eb),j(a)}function C(a,b,c,d){var e,f,h=0;a.level>0?(a.strm.data_type===I&&(a.strm.data_type=y(a)),t(a,a.l_desc),t(a,a.d_desc),h=w(a),e=a.opt_len+3+7>>>3,f=a.static_len+3+7>>>3,e>=f&&(e=f)):e=f=c+5,e>=c+4&&-1!==b?A(a,b,c,d):a.strategy===F||f===e?(g(a,(K<<1)+(d?1:0),3),s(a,eb,fb)):(g(a,(L<<1)+(d?1:0),3),x(a,a.l_desc.max_code+1,a.d_desc.max_code+1,h+1),s(a,a.dyn_ltree,a.dyn_dtree)),n(a),d&&o(a)}function D(a,b,c){return a.pending_buf[a.d_buf+2*a.last_lit]=b>>>8&255,a.pending_buf[a.d_buf+2*a.last_lit+1]=255&b,a.pending_buf[a.l_buf+a.last_lit]=255&c,a.last_lit++,0===b?a.dyn_ltree[2*c]++:(a.matches++,b--,a.dyn_ltree[2*(hb[c]+P+1)]++,a.dyn_dtree[2*e(b)]++),a.last_lit===a.lit_bufsize-1}var E=a("../utils/common"),F=4,G=0,H=1,I=2,J=0,K=1,L=2,M=3,N=258,O=29,P=256,Q=P+1+O,R=30,S=19,T=2*Q+1,U=15,V=16,W=7,X=256,Y=16,Z=17,$=18,_=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],ab=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],bb=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],cb=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],db=512,eb=new Array(2*(Q+2));d(eb);var fb=new Array(2*R);d(fb);var gb=new Array(db);d(gb);var hb=new Array(N-M+1);d(hb);var ib=new Array(O);d(ib);var jb=new Array(R);d(jb);var kb,lb,mb,nb=function(a,b,c,d,e){this.static_tree=a,this.extra_bits=b,this.extra_base=c,this.elems=d,this.max_length=e,this.has_stree=a&&a.length},ob=function(a,b){this.dyn_tree=a,this.max_code=0,this.stat_desc=b},pb=!1;c._tr_init=z,c._tr_stored_block=A,c._tr_flush_block=C,c._tr_tally=D,c._tr_align=B},{"../utils/common":27}],39:[function(a,b){"use strict";function c(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}b.exports=c},{}]},{},[9])(9)});var XLSX={};!function(a){function b(){Ed(1252)}function c(a){for(var b=[],c=0,d=a.length;d>c;++c)b[c]=a.charCodeAt(c);return b}function d(a){return void 0!==a&&null!==a}function e(a){return Object.keys(a)}function f(a,b){for(var c=[],d=e(a),f=0;f!==d.length;++f)c[a[d[f]][b]]=d[f];return c}function g(a){for(var b=[],c=e(a),d=0;d!==c.length;++d)b[a[c[d]]]=c[d];return b}function h(a){for(var b=[],c=e(a),d=0;d!==c.length;++d)b[a[c[d]]]=parseInt(c[d],10);return b}function i(a){for(var b=[],c=e(a),d=0;d!==c.length;++d)null==b[a[c[d]]]&&(b[a[c[d]]]=[]),b[a[c[d]]].push(c[d]);
return b}function j(a,b){b&&(a+=1462);var c=Date.parse(a);return(c+22091616e5)/864e5}function k(a){for(var b="",c=0;c!=a.length;++c)b+=String.fromCharCode(a[c]);return b}function l(a){if(!a)return null;if(".bin"===a.name.substr(-4)){if(a.data)return c(a.data);if(a.asNodeBuffer&&Kd)return a.asNodeBuffer();if(a._data&&a._data.getContent)return Array.prototype.slice.call(a._data.getContent())}else{if(a.data)return".bin"!==a.name.substr(-4)?Fd(a.data):c(a.data);if(a.asNodeBuffer&&Kd)return Fd(a.asNodeBuffer().toString("binary"));if(a.asBinary)return Fd(a.asBinary());if(a._data&&a._data.getContent)return Fd(k(Array.prototype.slice.call(a._data.getContent(),0)))}return null}function m(a,b){var c=b;if(a.files[c])return a.files[c];if(c=b.toLowerCase(),a.files[c])return a.files[c];if(c=c.replace(/\//g,"\\"),a.files[c])return a.files[c];throw new Error("Cannot find file "+b+" in zip")}function n(a,b,c){if(!c)return l(m(a,b));if(!b)return null;try{return n(a,b)}catch(d){return null}}function o(a,b){for(var c=[],d=0,e=0;d!==a.length&&(32!==(e=a.charCodeAt(d))&&10!==e&&13!==e);++d);if(b||(c[0]=a.substr(0,d)),d===a.length)return c;var f=a.match(Ld),g=0,h="",i=0,j="",k="";if(f)for(i=0;i!=f.length;++i){for(k=f[i],e=0;e!=k.length&&61!==k.charCodeAt(e);++e);for(j=k.substr(0,e),h=k.substring(e+2,k.length-1),g=0;g!=j.length&&58!==j.charCodeAt(g);++g);g===j.length?c[j]=h:c[(5===g&&"xmlns"===j.substr(0,5)?"xmlns":"")+j.substr(g+1)]=h}return c}function p(a){return a.replace(Od,"<$1")}function q(a){var b=a+"";return b.replace(Rd,function(a){return Pd[a]}).replace(Sd,function(a,b){return String.fromCharCode(parseInt(b,16))})}function r(a){var b=a+"";return b.replace(Td,function(a){return Qd[a]}).replace(Ud,function(a){return"_x"+("000"+a.charCodeAt(0).toString(16)).substr(-4)+"_"})}function s(a){switch(a){case"1":case"true":case"TRUE":return!0;default:return!1}}function t(a){var b=o(a),c=a.match($d(b.baseType))||[];if(c.length!=b.size)throw"unexpected vector length "+c.length+" != "+b.size;var d=[];return c.forEach(function(a){var b=a.replace(_d,"").match(ae);d.push({v:b[2],t:b[1]})}),d}function u(a,b){return"<"+a+(b.match(be)?' xml:space="preserve"':"")+">"+b+"</"+a+">"}function v(a){return e(a).map(function(b){return" "+b+'="'+a[b]+'"'}).join("")}function w(a,b,c){return"<"+a+(d(c)?v(c):"")+(d(b)?(b.match(be)?' xml:space="preserve"':"")+">"+b+"</"+a:"/")+">"}function x(a,b){try{return a.toISOString().replace(/\.\d*/,"")}catch(c){if(b)throw c}}function y(a){switch(typeof a){case"string":return w("vt:lpwstr",a);case"number":return w((0|a)==a?"vt:i4":"vt:r8",String(a));case"boolean":return w("vt:bool",a?"true":"false")}if(a instanceof Date)return w("vt:filetime",x(a));throw new Error("Unable to serialize "+a)}function z(a,b,c,d,e){void 0===c&&(c=!0),d||(d=8),e||8!==d||(e=52);var f,g,h=8*d-e-1,i=(1<<h)-1,j=i>>1,k=-7,l=c?-1:1,m=c?d-1:0,n=a[b+m];for(m+=l,f=n&(1<<-k)-1,n>>>=-k,k+=h;k>0;f=256*f+a[b+m],m+=l,k-=8);for(g=f&(1<<-k)-1,f>>>=-k,k+=e;k>0;g=256*g+a[b+m],m+=l,k-=8);return f===i?g?0/0:1/0*(n?-1:1):(0===f?f=1-j:(g+=Math.pow(2,e),f-=j),(n?-1:1)*g*Math.pow(2,f-e))}function A(a,b){var c,d,e="";if("dbcs"===b){if(d=this.l,Kd&&Buffer.isBuffer(this))e=this.slice(this.l,this.l+2*a).toString("utf16le");else for(c=0;c!=a;++c)e+=String.fromCharCode(ke(this,d)),d+=2;a*=2}else switch(a){case 1:e=je(this,this.l);break;case 2:e=("i"===b?le:ke)(this,this.l);break;case 4:e=me(this,this.l);break;case 8:if("f"===b){e=ge(this,this.l);break}}return this.l+=a,e}function B(a,b,c){var d,e;if("dbcs"===c){for(e=0;e!=b.length;++e)this.writeUInt16LE(b.charCodeAt(e),this.l+2*e);d=2*b.length}else switch(a){case 1:d=1,this[this.l]=255&b;break;case 3:d=3,this[this.l+2]=255&b,b>>>=8,this[this.l+1]=255&b,b>>>=8,this[this.l]=255&b;break;case 4:d=4,this.writeUInt32LE(b,this.l);break;case 8:if(d=8,"f"===c){this.writeDoubleLE(b,this.l);break}case 16:break;case-4:d=4,this.writeInt32LE(b,this.l)}return this.l+=d,this}function C(a,b){a.l=b,a.read_shift=A,a.write_shift=B}function D(a,b){a.l+=b}function E(a){var b=Kd?new Buffer(a):new Array(a);return C(b,0),b}function F(a,b,c){var d,e,f;for(C(a,a.l||0);a.l<a.length;){var g=a.read_shift(1);128&g&&(g=(127&g)+((127&a.read_shift(1))<<7));var h=rf[g]||rf[65535];for(d=a.read_shift(1),f=127&d,e=1;4>e&&128&d;++e)f+=(127&(d=a.read_shift(1)))<<7*e;var i=h.f(a,f,c);if(b(i,h,g))return}}function G(){var a=[],b=2048,c=function(a){var b=E(a);return C(b,0),b},d=c(b),e=function(){d.length=d.l,d.length>0&&a.push(d),d=null},f=function(a){return a<d.length-d.l?d:(e(),d=c(Math.max(a+1,b)))},g=function(){return e(),ee([a])},h=function(a){e(),d=a,f(b)};return{next:f,push:h,end:g,_bufs:a}}function H(a,b,c,d){var e,f=sf[b];d||(d=rf[f].p||(c||[]).length||0),e=1+(f>=128?1:0)+1+d,d>=128&&++e,d>=16384&&++e,d>=2097152&&++e;var g=a.next(e);127>=f?g.write_shift(1,f):(g.write_shift(1,(127&f)+128),g.write_shift(1,f>>7));for(var h=0;4!=h;++h){if(!(d>=128)){g.write_shift(1,d);break}g.write_shift(1,(127&d)+128),d>>=7}d>0&&ie(c)&&a.push(c)}function I(a){return{ich:a.read_shift(2),ifnt:a.read_shift(2)}}function J(a,b){var c=a.l,d=a.read_shift(1),e=Q(a),f=[],g={t:e,h:e};if(0!==(1&d)){for(var h=a.read_shift(4),i=0;i!=h;++i)f.push(I(a));g.r=f}else g.r="<t>"+r(e)+"</t>";return a.l=c+b,g}function K(a,b){return null==b&&(b=E(5+2*a.t.length)),b.write_shift(1,0),R(a.t,b),b}function L(a){var b=a.read_shift(4),c=a.read_shift(2);c+=a.read_shift(1)<<16;a.read_shift(1);return{c:b,iStyleRef:c}}function M(a,b){return null==b&&(b=E(8)),b.write_shift(-4,a.c),b.write_shift(3,void 0===a.iStyleRef?a.iStyleRef:a.s),b.write_shift(1,0),b}function N(a,b){return Q(a,b)}function O(a){var b=a.read_shift(4);return 0===b||4294967295===b?"":a.read_shift(b,"dbcs")}function P(a,b){return b||(b=E(127)),b.write_shift(4,a.length>0?a.length:4294967295),a.length>0&&b.write_shift(0,a,"dbcs"),b}function Q(a){var b=a.read_shift(4);return 0===b?"":a.read_shift(b,"dbcs")}function R(a,b){return null==b&&(b=E(4+2*a.length)),b.write_shift(4,a.length),a.length>0&&b.write_shift(0,a,"dbcs"),b}function S(a){var b=a.slice(a.l,a.l+4),c=1&b[0],d=2&b[0];a.l+=4,b[0]&=252;var e=0===d?ge([0,0,0,0,b[0],b[1],b[2],b[3]],0):ne(b,0)>>2;return c?e/100:e}function T(a){var b={s:{},e:{}};return b.s.r=a.read_shift(4),b.e.r=a.read_shift(4),b.s.c=a.read_shift(4),b.e.c=a.read_shift(4),b}function U(a,b){return b||(b=E(16)),b.write_shift(4,a.s.r),b.write_shift(4,a.e.r),b.write_shift(4,a.s.c),b.write_shift(4,a.e.c),b}function V(a){return a.read_shift(8,"f")}function W(a,b){return(b||E(8)).write_shift(8,"f",a)}function X(a){var b={},c=a.read_shift(1);b.fValidRGB=1&c,b.xColorType=c>>>1,b.index=a.read_shift(1),b.nTintAndShade=a.read_shift(2,"i"),b.bRed=a.read_shift(1),b.bGreen=a.read_shift(1),b.bBlue=a.read_shift(1),b.bAlpha=a.read_shift(1)}function Y(a){var b=a.read_shift(1);a.l++;var c={fItalic:2&b,fStrikeout:8&b,fOutline:16&b,fShadow:32&b,fCondense:64&b,fExtend:128&b};return c}function Z(a,b){var c={};if(!a||!a.match)return a;var d={workbooks:[],sheets:[],calcchains:[],themes:[],styles:[],coreprops:[],extprops:[],custprops:[],strs:[],comments:[],vba:[],TODO:[],rels:[],xmlns:""};if((a.match(Md)||[]).forEach(function(a){var e=o(a);switch(e[0].replace(Nd,"<")){case"<?xml":break;case"<Types":d.xmlns=e["xmlns"+(e[0].match(/<(\w+):/)||["",""])[1]];break;case"<Default":c[e.Extension]=e.ContentType;break;case"<Override":void 0!==d[se[e.ContentType]]?d[se[e.ContentType]].push(e.PartName):b.WTF&&console.error(e)}}),d.xmlns!==de.CT)throw new Error("Unknown Namespace: "+d.xmlns);return d.calcchain=d.calcchains.length>0?d.calcchains[0]:"",d.sst=d.strs.length>0?d.strs[0]:"",d.style=d.styles.length>0?d.styles[0]:"",d.defaults=c,delete d.calcchains,d}function $(a,b){var c,d=[];d[d.length]=ce,d[d.length]=ve,d=d.concat(we);var e=function(e){a[e]&&a[e].length>0&&(c=a[e][0],d[d.length]=w("Override",null,{PartName:("/"==c[0]?"":"/")+c,ContentType:te[e][b.bookType||"xlsx"]}))},f=function(c){a[c].forEach(function(a){d[d.length]=w("Override",null,{PartName:("/"==a[0]?"":"/")+a,ContentType:te[c][b.bookType||"xlsx"]})})},g=function(b){(a[b]||[]).forEach(function(a){d[d.length]=w("Override",null,{PartName:("/"==a[0]?"":"/")+a,ContentType:ue[b][0]})})};return e("workbooks"),f("sheets"),g("themes"),["strs","styles"].forEach(e),["coreprops","extprops","custprops"].forEach(g),d.length>2&&(d[d.length]="</Types>",d[1]=d[1].replace("/>",">")),d.join("")}function _(a,b){if(!a)return a;"/"!==b.charAt(0)&&(b="/"+b);var c={},d={},e=function(a){var c=b.split("/");c.pop();for(var d=a.split("/");0!==d.length;){var e=d.shift();".."===e?c.pop():"."!==e&&c.push(e)}return c.join("/")};return a.match(Md).forEach(function(a){var b=o(a);if("<Relationship"===b[0]){var f={};f.Type=b.Type,f.Target=b.Target,f.Id=b.Id,f.TargetMode=b.TargetMode;var g="External"===b.TargetMode?b.Target:e(b.Target);c[g]=f,d[b.Id]=f}}),c["!id"]=d,c}function ab(a){var b=[];return b[b.length]=ce,b[b.length]=ye,e(a["!id"]).forEach(function(c){var d=a["!id"][c];b[b.length]=w("Relationship",null,d)}),b.length>2&&(b[b.length]="</Relationships>",b[1]=b[1].replace("/>",">")),b.join("")}function bb(a){for(var b={},c=0;c<ze.length;++c){var d=ze[c],e=a.match(Ae[c]);null!=e&&e.length>0&&(b[d[1]]=e[1]),"date"===d[2]&&b[d[1]]&&(b[d[1]]=new Date(b[d[1]]))}return b}function cb(a,b,c,d,e){null==e[a]&&null!=b&&""!==b&&(e[a]=b,d[d.length]=c?w(a,b,c):u(a,b))}function db(a,b){var c=[ce,Be],d={};if(!a)return c.join("");null!=a.CreatedDate&&cb("dcterms:created","string"==typeof a.CreatedDate?a.CreatedDate:x(a.CreatedDate,b.WTF),{"xsi:type":"dcterms:W3CDTF"},c,d),null!=a.ModifiedDate&&cb("dcterms:modified","string"==typeof a.ModifiedDate?a.ModifiedDate:x(a.ModifiedDate,b.WTF),{"xsi:type":"dcterms:W3CDTF"},c,d);for(var e=0;e!=ze.length;++e){var f=ze[e];cb(f[0],a[f[1]],null,c,d)}return c.length>2&&(c[c.length]="</cp:coreProperties>",c[1]=c[1].replace("/>",">")),c.join("")}function eb(a,b){var c={};if(b||(b={}),Ce.forEach(function(d){switch(d[2]){case"string":b[d[1]]=(a.match(Zd(d[0]))||[])[1];break;case"bool":b[d[1]]="true"===(a.match(Zd(d[0]))||[])[1];break;case"raw":var e=a.match(new RegExp("<"+d[0]+"[^>]*>(.*)</"+d[0]+">"));e&&e.length>0&&(c[d[1]]=e[1])}}),c.HeadingPairs&&c.TitlesOfParts){for(var d=t(c.HeadingPairs),e=0,f=0,g=0;g!==d.length;++g)switch(d[g].v){case"Worksheets":f=e,b.Worksheets=+d[++g].v;break;case"Named Ranges":++g}var h=t(c.TitlesOfParts).map(function(a){return Vd(a.v)});b.SheetNames=h.slice(f,f+b.Worksheets)}return b}function fb(a){var b=[],c=w;return a||(a={}),a.Application="SheetJS",b[b.length]=ce,b[b.length]=De,Ce.forEach(function(d){if(void 0!==a[d[1]]){var e;switch(d[2]){case"string":e=a[d[1]];break;case"bool":e=a[d[1]]?"true":"false"}void 0!==e&&(b[b.length]=c(d[0],e))}}),b[b.length]=c("HeadingPairs",c("vt:vector",c("vt:variant","<vt:lpstr>Worksheets</vt:lpstr>")+c("vt:variant",c("vt:i4",String(a.Worksheets))),{size:2,baseType:"variant"})),b[b.length]=c("TitlesOfParts",c("vt:vector",a.SheetNames.map(function(a){return"<vt:lpstr>"+a+"</vt:lpstr>"}).join(""),{size:a.Worksheets,baseType:"lpstr"})),b.length>2&&(b[b.length]="</Properties>",b[1]=b[1].replace("/>",">")),b.join("")}function gb(a,b){var c,d={},e=a.match(Ee);if(e)for(var f=0;f!=e.length;++f){var g=e[f],h=o(g);switch(h[0]){case"<?xml":break;case"<Properties":if(h.xmlns!==de.CUST_PROPS)throw"unrecognized xmlns "+h.xmlns;if(h.xmlnsvt&&h.xmlnsvt!==de.vt)throw"unrecognized vt "+h.xmlnsvt;break;case"<property":c=h.name;break;case"</property>":c=null;break;default:if(0===g.indexOf("<vt:")){var i=g.split(">"),j=i[0].substring(4),k=i[1];switch(j){case"lpstr":case"lpwstr":case"bstr":case"lpwstr":d[c]=q(k);break;case"bool":d[c]=s(k,"<vt:bool>");break;case"i1":case"i2":case"i4":case"i8":case"int":case"uint":d[c]=parseInt(k,10);break;case"r4":case"r8":case"decimal":d[c]=parseFloat(k);break;case"filetime":case"date":d[c]=new Date(k);break;case"cy":case"error":d[c]=q(k);break;default:"undefined"!=typeof console&&console.warn("Unexpected",g,j,i)}}else if("</"===g.substr(0,2));else if(b.WTF)throw new Error(g)}}return d}function hb(a){var b=[ce,Fe];if(!a)return b.join("");var c=1;return e(a).forEach(function(d){++c,b[b.length]=w("property",y(a[d]),{fmtid:"{D5CDD505-2E9C-101B-9397-08002B2CF9AE}",pid:c,name:d})}),b.length>2&&(b[b.length]="</Properties>",b[1]=b[1].replace("/>",">")),b.join("")}function ib(a,b){var c=b?b.cellHTML:!0,d={};if(!a)return null;var e;return 116===a.charCodeAt(1)?(d.t=Vd(q(a.substr(a.indexOf(">")+1).split(/<\/t>/)[0])),d.r=a,c&&(d.h=d.t)):(e=a.match(Je))&&(d.r=a,d.t=Vd(q(a.match(Ie).join("").replace(Md,""))),c&&(d.h=He(a))),d}function jb(a,b){var c,e=[],f=a.match(Ke);if(d(f)){c=f[2].replace(Le,"").split(Me);for(var g=0;g!=c.length;++g){var h=ib(c[g],b);null!=h&&(e[e.length]=h)}f=o(f[1]),e.Count=f.count,e.Unique=f.uniqueCount}return e}function kb(a,b){if(!b.bookSST)return"";var c=[ce];c[c.length]=w("sst",null,{xmlns:de.main[0],count:a.Count,uniqueCount:a.Unique});for(var d=0;d!=a.length;++d)if(null!=a[d]){var e=a[d],f="<si>";e.r?f+=e.r:(f+="<t",e.t.match(Ne)&&(f+=' xml:space="preserve"'),f+=">"+r(e.t)+"</t>"),f+="</si>",c[c.length]=f}return c.length>2&&(c[c.length]="</sst>",c[1]=c[1].replace("/>",">")),c.join("")}function lb(a){return[a.read_shift(4),a.read_shift(4)]}function mb(a,b){var c=[],d=!1;return F(a,function(a,e,f){switch(e.n){case"BrtBeginSst":c.Count=a[0],c.Unique=a[1];break;case"BrtSSTItem":c.push(a);break;case"BrtEndSst":return!0;case"BrtFRTBegin":d=!0;break;case"BrtFRTEnd":d=!1;break;default:if(!d||b.WTF)throw new Error("Unexpected record "+f+" "+e.n)}}),c}function nb(a,b){return b||(b=E(8)),b.write_shift(4,a.Count),b.write_shift(4,a.Unique),b}function ob(a){var b=G();H(b,"BrtBeginSst",nb(a));for(var c=0;c<a.length;++c)H(b,"BrtSSTItem",Oe(a[c]));return H(b,"BrtEndSst"),b.end()}function pb(a){var b=a.substr("#"===a[0]?1:0,6);return[parseInt(b.substr(0,2),16),parseInt(b.substr(0,2),16),parseInt(b.substr(0,2),16)]}function qb(a){for(var b=0,c=1;3!=b;++b)c=256*c+(a[b]>255?255:a[b]<0?0:a[b]);return c.toString(16).toUpperCase().substr(1)}function rb(a){var b=a[0]/255,c=a[1]/255,d=a[2]/255,e=Math.max(b,c,d),f=Math.min(b,c,d),g=e-f;if(0===g)return[0,0,b];var h=0,i=0,j=e+f;switch(i=g/(j>1?2-j:j),e){case b:h=((c-d)/g+6)%6;break;case c:h=(d-b)/g+2;break;case d:h=(b-c)/g+4}return[h/6,i,j/2]}function sb(a){var b,c=a[0],d=a[1],e=a[2],f=2*d*(.5>e?e:1-e),g=e-f/2,h=[g,g,g],i=6*c;if(0!==d)switch(0|i){case 0:case 6:b=f*i,h[0]+=f,h[1]+=b;break;case 1:b=f*(2-i),h[0]+=b,h[1]+=f;break;case 2:b=f*(i-2),h[1]+=f,h[2]+=b;break;case 3:b=f*(4-i),h[1]+=b,h[2]+=f;break;case 4:b=f*(i-4),h[2]+=f,h[0]+=b;break;case 5:b=f*(6-i),h[2]+=b,h[0]+=f}for(var j=0;3!=j;++j)h[j]=Math.round(255*h[j]);return h}function tb(a,b){if(0===b)return a;var c=rb(pb(a));return c[2]=0>b?c[2]*(1+b):1-(1-c[2])*(1-b),qb(sb(c))}function ub(a){return(a+(128/Se|0)/256)*Se|0}function vb(a){return((a-5)/Se*100+.5|0)/100}function wb(a){return((a*Se+5)/Se*256|0)/256}function xb(a){return wb(vb(ub(a)))}function yb(a){if(xb(a)!=a){for(Se=Pe;Se>Re&&xb(a)!==a;--Se);if(Se===Re)for(Se=Pe+1;Qe>Se&&xb(a)!==a;++Se);Se===Qe&&(Se=Pe)}}function zb(a,b){Te.Fills=[];var c={};a[0].match(Md).forEach(function(a){var d=o(a);switch(d[0]){case"<fills":case"<fills>":case"</fills>":break;case"<fill>":break;case"</fill>":Te.Fills.push(c),c={};break;case"<patternFill":d.patternType&&(c.patternType=d.patternType);break;case"<patternFill/>":case"</patternFill>":break;case"<bgColor":c.bgColor||(c.bgColor={}),d.indexed&&(c.bgColor.indexed=parseInt(d.indexed,10)),d.theme&&(c.bgColor.theme=parseInt(d.theme,10)),d.tint&&(c.bgColor.tint=parseFloat(d.tint)),d.rgb&&(c.bgColor.rgb=d.rgb.substring(d.rgb.length-6));break;case"<bgColor/>":case"</bgColor>":break;case"<fgColor":c.fgColor||(c.fgColor={}),d.theme&&(c.fgColor.theme=parseInt(d.theme,10)),d.tint&&(c.fgColor.tint=parseFloat(d.tint)),d.rgb&&(c.fgColor.rgb=d.rgb.substring(d.rgb.length-6));break;case"<bgColor/>":case"</fgColor>":break;default:if(b.WTF)throw"unrecognized "+d[0]+" in fills"}})}function Ab(a,b){Te.NumberFmt=[];for(var c=e(Gd._table),d=0;d<c.length;++d)Te.NumberFmt[c[d]]=Gd._table[c[d]];var f=a[0].match(Md);for(d=0;d<f.length;++d){var g=o(f[d]);switch(g[0]){case"<numFmts":case"</numFmts>":case"<numFmts/>":case"<numFmts>":break;case"<numFmt":var h=q(Vd(g.formatCode)),i=parseInt(g.numFmtId,10);Te.NumberFmt[i]=h,i>0&&Gd.load(h,i);break;default:if(b.WTF)throw"unrecognized "+g[0]+" in numFmts"}}}function Bb(a){var b=["<numFmts>"];return[[5,8],[23,26],[41,44],[63,66],[164,392]].forEach(function(c){for(var d=c[0];d<=c[1];++d)void 0!==a[d]&&(b[b.length]=w("numFmt",null,{numFmtId:d,formatCode:r(a[d])}))}),1===b.length?"":(b[b.length]="</numFmts>",b[0]=w("numFmts",null,{count:b.length-2}).replace("/>",">"),b.join(""))}function Cb(a,b){Te.CellXf=[],a[0].match(Md).forEach(function(a){var c=o(a);switch(c[0]){case"<cellXfs":case"<cellXfs>":case"<cellXfs/>":case"</cellXfs>":break;case"<xf":delete c[0],c.numFmtId&&(c.numFmtId=parseInt(c.numFmtId,10)),c.fillId&&(c.fillId=parseInt(c.fillId,10)),Te.CellXf.push(c);break;case"</xf>":break;case"<alignment":case"<alignment/>":break;case"<protection":case"</protection>":case"<protection/>":break;case"<extLst":case"</extLst>":break;case"<ext":break;default:if(b.WTF)throw"unrecognized "+c[0]+" in cellXfs"}})}function Db(a){var b=[];return b[b.length]=w("cellXfs",null),a.forEach(function(a){b[b.length]=w("xf",null,a)}),b[b.length]="</cellXfs>",2===b.length?"":(b[0]=w("cellXfs",null,{count:b.length-2}).replace("/>",">"),b.join(""))}function Eb(a,b){var c,d=[ce,We];return null!=(c=Bb(a.SSF))&&(d[d.length]=c),d[d.length]='<fonts count="1"><font><sz val="12"/><color theme="1"/><name val="Calibri"/><family val="2"/><scheme val="minor"/></font></fonts>',d[d.length]='<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>',d[d.length]='<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>',d[d.length]='<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>',(c=Db(b.cellXfs))&&(d[d.length]=c),d[d.length]='<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>',d[d.length]='<dxfs count="0"/>',d[d.length]='<tableStyles count="0" defaultTableStyle="TableStyleMedium9" defaultPivotStyle="PivotStyleMedium4"/>',d.length>2&&(d[d.length]="</styleSheet>",d[1]=d[1].replace("/>",">")),d.join("")}function Fb(a,b){var c=a.read_shift(2),d=Q(a,b-2);return[c,d]}function Gb(a,b){var c={flags:{}};return c.dyHeight=a.read_shift(2),c.grbit=Y(a,2),c.bls=a.read_shift(2),c.sss=a.read_shift(2),c.uls=a.read_shift(1),c.bFamily=a.read_shift(1),c.bCharSet=a.read_shift(1),a.l++,c.brtColor=X(a,8),c.bFontScheme=a.read_shift(1),c.name=Q(a,b-21),c.flags.Bold=700===c.bls,c.flags.Italic=c.grbit.fItalic,c.flags.Strikeout=c.grbit.fStrikeout,c.flags.Outline=c.grbit.fOutline,c.flags.Shadow=c.grbit.fShadow,c.flags.Condense=c.grbit.fCondense,c.flags.Extend=c.grbit.fExtend,c.flags.Sub=2&c.sss,c.flags.Sup=1&c.sss,c}function Hb(a,b){var c=a.read_shift(2),d=a.read_shift(2);return D(a,b-4),{ixfe:c,ifmt:d}}function Ib(a,b){Te.NumberFmt=[];for(var c in Gd._table)Te.NumberFmt[c]=Gd._table[c];Te.CellXf=[];var d="",e=!1;return F(a,function(a,c,f){switch(c.n){case"BrtFmt":Te.NumberFmt[a[0]]=a[1],Gd.load(a[1],a[0]);break;case"BrtFont":break;case"BrtKnownFonts":break;case"BrtFill":break;case"BrtBorder":break;case"BrtXF":"CELLXFS"===d&&Te.CellXf.push(a);break;case"BrtStyle":break;case"BrtDXF":break;case"BrtMRUColor":break;case"BrtIndexedColor":break;case"BrtBeginStyleSheet":break;case"BrtEndStyleSheet":break;case"BrtBeginTableStyle":break;case"BrtTableStyleElement":break;case"BrtEndTableStyle":break;case"BrtBeginFmts":d="FMTS";break;case"BrtEndFmts":d="";break;case"BrtBeginFonts":d="FONTS";break;case"BrtEndFonts":d="";break;case"BrtACBegin":d="ACFONTS";break;case"BrtACEnd":d="";break;case"BrtBeginFills":d="FILLS";break;case"BrtEndFills":d="";break;case"BrtBeginBorders":d="BORDERS";break;case"BrtEndBorders":d="";break;case"BrtBeginCellStyleXFs":d="CELLSTYLEXFS";break;case"BrtEndCellStyleXFs":d="";break;case"BrtBeginCellXFs":d="CELLXFS";break;case"BrtEndCellXFs":d="";break;case"BrtBeginStyles":d="STYLES";break;case"BrtEndStyles":d="";break;case"BrtBeginDXFs":d="DXFS";break;case"BrtEndDXFs":d="";break;case"BrtBeginTableStyles":d="TABLESTYLES";break;case"BrtEndTableStyles":d="";break;case"BrtBeginColorPalette":d="COLORPALETTE";break;case"BrtEndColorPalette":d="";break;case"BrtBeginIndexedColors":d="INDEXEDCOLORS";break;case"BrtEndIndexedColors":d="";break;case"BrtBeginMRUColors":d="MRUCOLORS";break;case"BrtEndMRUColors":d="";break;case"BrtFRTBegin":e=!0;break;case"BrtFRTEnd":e=!1;break;case"BrtBeginStyleSheetExt14":break;case"BrtBeginSlicerStyles":break;case"BrtEndSlicerStyles":break;case"BrtBeginTimelineStylesheetExt15":break;case"BrtEndTimelineStylesheetExt15":break;case"BrtBeginTimelineStyles":break;case"BrtEndTimelineStyles":break;case"BrtEndStyleSheetExt14":break;default:if(!e||b.WTF)throw new Error("Unexpected record "+f+" "+c.n)}}),Te}function Jb(){var a=G();return H(a,"BrtBeginStyleSheet"),H(a,"BrtEndStyleSheet"),a.end()}function Kb(a,b){Ue.themeElements.clrScheme=[];var c={};a[0].match(Md).forEach(function(a){var d=o(a);switch(d[0]){case"<a:clrScheme":case"</a:clrScheme>":break;case"<a:srgbClr":c.rgb=d.val;break;case"<a:sysClr":c.rgb=d.lastClr;break;case"<a:dk1>":case"</a:dk1>":case"<a:dk2>":case"</a:dk2>":case"<a:lt1>":case"</a:lt1>":case"<a:lt2>":case"</a:lt2>":case"<a:accent1>":case"</a:accent1>":case"<a:accent2>":case"</a:accent2>":case"<a:accent3>":case"</a:accent3>":case"<a:accent4>":case"</a:accent4>":case"<a:accent5>":case"</a:accent5>":case"<a:accent6>":case"</a:accent6>":case"<a:hlink>":case"</a:hlink>":case"<a:folHlink>":case"</a:folHlink>":"/"===d[0][1]?(Ue.themeElements.clrScheme.push(c),c={}):c.name=d[0].substring(3,d[0].length-1);break;default:if(b.WTF)throw"unrecognized "+d[0]+" in clrScheme"}})}function Lb(a,b){if(!a||0===a.length)return Ue;Ue.themeElements={};var c;return(c=a.match(Xe))&&Kb(c,b),Ue}function Mb(){return'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme"><a:themeElements><a:clrScheme name="Office"><a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1><a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="1F497D"/></a:dk2><a:lt2><a:srgbClr val="EEECE1"/></a:lt2><a:accent1><a:srgbClr val="4F81BD"/></a:accent1><a:accent2><a:srgbClr val="C0504D"/></a:accent2><a:accent3><a:srgbClr val="9BBB59"/></a:accent3><a:accent4><a:srgbClr val="8064A2"/></a:accent4><a:accent5><a:srgbClr val="4BACC6"/></a:accent5><a:accent6><a:srgbClr val="F79646"/></a:accent6><a:hlink><a:srgbClr val="0000FF"/></a:hlink><a:folHlink><a:srgbClr val="800080"/></a:folHlink></a:clrScheme><a:fontScheme name="Office"><a:majorFont><a:latin typeface="Cambria"/><a:ea typeface=""/><a:cs typeface=""/><a:font script="Jpan" typeface="ＭＳ Ｐゴシック"/><a:font script="Hang" typeface="맑은 고딕"/><a:font script="Hans" typeface="宋体"/><a:font script="Hant" typeface="新細明體"/><a:font script="Arab" typeface="Times New Roman"/><a:font script="Hebr" typeface="Times New Roman"/><a:font script="Thai" typeface="Tahoma"/><a:font script="Ethi" typeface="Nyala"/><a:font script="Beng" typeface="Vrinda"/><a:font script="Gujr" typeface="Shruti"/><a:font script="Khmr" typeface="MoolBoran"/><a:font script="Knda" typeface="Tunga"/><a:font script="Guru" typeface="Raavi"/><a:font script="Cans" typeface="Euphemia"/><a:font script="Cher" typeface="Plantagenet Cherokee"/><a:font script="Yiii" typeface="Microsoft Yi Baiti"/><a:font script="Tibt" typeface="Microsoft Himalaya"/><a:font script="Thaa" typeface="MV Boli"/><a:font script="Deva" typeface="Mangal"/><a:font script="Telu" typeface="Gautami"/><a:font script="Taml" typeface="Latha"/><a:font script="Syrc" typeface="Estrangelo Edessa"/><a:font script="Orya" typeface="Kalinga"/><a:font script="Mlym" typeface="Kartika"/><a:font script="Laoo" typeface="DokChampa"/><a:font script="Sinh" typeface="Iskoola Pota"/><a:font script="Mong" typeface="Mongolian Baiti"/><a:font script="Viet" typeface="Times New Roman"/><a:font script="Uigh" typeface="Microsoft Uighur"/><a:font script="Geor" typeface="Sylfaen"/></a:majorFont><a:minorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/><a:font script="Jpan" typeface="ＭＳ Ｐゴシック"/><a:font script="Hang" typeface="맑은 고딕"/><a:font script="Hans" typeface="宋体"/><a:font script="Hant" typeface="新細明體"/><a:font script="Arab" typeface="Arial"/><a:font script="Hebr" typeface="Arial"/><a:font script="Thai" typeface="Tahoma"/><a:font script="Ethi" typeface="Nyala"/><a:font script="Beng" typeface="Vrinda"/><a:font script="Gujr" typeface="Shruti"/><a:font script="Khmr" typeface="DaunPenh"/><a:font script="Knda" typeface="Tunga"/><a:font script="Guru" typeface="Raavi"/><a:font script="Cans" typeface="Euphemia"/><a:font script="Cher" typeface="Plantagenet Cherokee"/><a:font script="Yiii" typeface="Microsoft Yi Baiti"/><a:font script="Tibt" typeface="Microsoft Himalaya"/><a:font script="Thaa" typeface="MV Boli"/><a:font script="Deva" typeface="Mangal"/><a:font script="Telu" typeface="Gautami"/><a:font script="Taml" typeface="Latha"/><a:font script="Syrc" typeface="Estrangelo Edessa"/><a:font script="Orya" typeface="Kalinga"/><a:font script="Mlym" typeface="Kartika"/><a:font script="Laoo" typeface="DokChampa"/><a:font script="Sinh" typeface="Iskoola Pota"/><a:font script="Mong" typeface="Mongolian Baiti"/><a:font script="Viet" typeface="Arial"/><a:font script="Uigh" typeface="Microsoft Uighur"/><a:font script="Geor" typeface="Sylfaen"/></a:minorFont></a:fontScheme><a:fmtScheme name="Office"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="50000"/><a:satMod val="300000"/></a:schemeClr></a:gs><a:gs pos="35000"><a:schemeClr val="phClr"><a:tint val="37000"/><a:satMod val="300000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:tint val="15000"/><a:satMod val="350000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="16200000" scaled="1"/></a:gradFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="100000"/><a:shade val="100000"/><a:satMod val="130000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:tint val="50000"/><a:shade val="100000"/><a:satMod val="350000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="16200000" scaled="0"/></a:gradFill></a:fillStyleLst><a:lnStyleLst><a:ln w="9525" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"><a:shade val="95000"/><a:satMod val="105000"/></a:schemeClr></a:solidFill><a:prstDash val="solid"/></a:ln><a:ln w="25400" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln><a:ln w="38100" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst><a:outerShdw blurRad="40000" dist="20000" dir="5400000" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="38000"/></a:srgbClr></a:outerShdw></a:effectLst></a:effectStyle><a:effectStyle><a:effectLst><a:outerShdw blurRad="40000" dist="23000" dir="5400000" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="35000"/></a:srgbClr></a:outerShdw></a:effectLst></a:effectStyle><a:effectStyle><a:effectLst><a:outerShdw blurRad="40000" dist="23000" dir="5400000" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="35000"/></a:srgbClr></a:outerShdw></a:effectLst><a:scene3d><a:camera prst="orthographicFront"><a:rot lat="0" lon="0" rev="0"/></a:camera><a:lightRig rig="threePt" dir="t"><a:rot lat="0" lon="0" rev="1200000"/></a:lightRig></a:scene3d><a:sp3d><a:bevelT w="63500" h="25400"/></a:sp3d></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="40000"/><a:satMod val="350000"/></a:schemeClr></a:gs><a:gs pos="40000"><a:schemeClr val="phClr"><a:tint val="45000"/><a:shade val="99000"/><a:satMod val="350000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="20000"/><a:satMod val="255000"/></a:schemeClr></a:gs></a:gsLst><a:path path="circle"><a:fillToRect l="50000" t="-80000" r="50000" b="180000"/></a:path></a:gradFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="80000"/><a:satMod val="300000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="30000"/><a:satMod val="200000"/></a:schemeClr></a:gs></a:gsLst><a:path path="circle"><a:fillToRect l="50000" t="50000" r="50000" b="50000"/></a:path></a:gradFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements><a:objectDefaults><a:spDef><a:spPr/><a:bodyPr/><a:lstStyle/><a:style><a:lnRef idx="1"><a:schemeClr val="accent1"/></a:lnRef><a:fillRef idx="3"><a:schemeClr val="accent1"/></a:fillRef><a:effectRef idx="2"><a:schemeClr val="accent1"/></a:effectRef><a:fontRef idx="minor"><a:schemeClr val="lt1"/></a:fontRef></a:style></a:spDef><a:lnDef><a:spPr/><a:bodyPr/><a:lstStyle/><a:style><a:lnRef idx="2"><a:schemeClr val="accent1"/></a:lnRef><a:fillRef idx="0"><a:schemeClr val="accent1"/></a:fillRef><a:effectRef idx="1"><a:schemeClr val="accent1"/></a:effectRef><a:fontRef idx="minor"><a:schemeClr val="tx1"/></a:fontRef></a:style></a:lnDef></a:objectDefaults><a:extraClrSchemeLst/></a:theme>'}function Nb(a){var b=[],c=1;return(a.match(Md)||[]).forEach(function(a){var d=o(a);switch(d[0]){case"<?xml":break;case"<calcChain":case"<calcChain>":case"</calcChain>":break;case"<c":delete d[0],d.i?c=d.i:d.i=c,b.push(d)}}),b}function Ob(a){var b={};b.i=a.read_shift(4);var c={};c.r=a.read_shift(4),c.c=a.read_shift(4),b.r=sd(c);var d=a.read_shift(1);return 2&d&&(b.l="1"),8&d&&(b.a="1"),b}function Pb(a,b){var c=[],d=!1;return F(a,function(a,e,f){switch(e.n){case"BrtCalcChainItem$":c.push(a);break;case"BrtBeginCalcChain$":break;case"BrtEndCalcChain$":break;default:if(!d||b.WTF)throw new Error("Unexpected record "+f+" "+e.n)}}),c}function Qb(a,b,c,d,f){for(var g=0;g!=b.length;++g){var h=b[g],i=Wc(n(a,h.replace(/^\//,""),!0),h,f);if(i&&i.length)for(var j=e(c),k=0;k!=j.length;++k){var l=j[k],m=d[l];if(m){var o=m[h];o&&Rb(l,c[l],i)}}}}function Rb(a,b,c){c.forEach(function(a){var c=b[a.ref];if(!c){c={},b[a.ref]=c;var d=vd(b["!ref"]||"BDWGO1000001:A1"),e=rd(a.ref);d.s.r>e.r&&(d.s.r=e.r),d.e.r<e.r&&(d.e.r=e.r),d.s.c>e.c&&(d.s.c=e.c),d.e.c<e.c&&(d.e.c=e.c);var f=ud(d);f!==b["!ref"]&&(b["!ref"]=f)}c.c||(c.c=[]);var g={a:a.author,t:a.t,r:a.r};a.h&&(g.h=a.h),c.c.push(g)})}function Sb(a,b){if(a.match(/<(?:\w+:)?comments *\/>/))return[];var c=[],d=[];return a.match(/<(?:\w+:)?authors>([^\u2603]*)<\/(?:\w+:)?authors>/)[1].split(/<\/\w*:?author>/).forEach(function(a){""!==a&&""!==a.trim()&&c.push(a.match(/<(?:\w+:)?author[^>]*>(.*)/)[1])}),(a.match(/<(?:\w+:)?commentList>([^\u2603]*)<\/(?:\w+:)?commentList>/)||["",""])[1].split(/<\/\w*:?comment>/).forEach(function(a){if(""!==a&&""!==a.trim()){var e=o(a.match(/<(?:\w+:)?comment[^>]*>/)[0]),f={author:e.authorId&&c[e.authorId]?c[e.authorId]:void 0,ref:e.ref,guid:e.guid},g=rd(e.ref);if(!(b.sheetRows&&b.sheetRows<=g.r)){var h=a.match(/<text>([^\u2603]*)<\/text>/);if(h&&h[1]){var i=ib(h[1]);f.r=i.r,f.t=i.t,b.cellHTML&&(f.h=i.h),d.push(f)}}}}),d}function Tb(a){var b={};b.iauthor=a.read_shift(4);var c=T(a,16);return b.rfx=c.s,b.ref=sd(c.s),a.l+=16,b}function Ub(a,b){var c=[],d=[],e={},f=!1;return F(a,function(a,g,h){switch(g.n){case"BrtCommentAuthor":d.push(a);break;case"BrtBeginComment":e=a;break;case"BrtCommentText":e.t=a.t,e.h=a.h,e.r=a.r;break;case"BrtEndComment":if(e.author=d[e.iauthor],delete e.iauthor,b.sheetRows&&b.sheetRows<=e.rfx.r)break;delete e.rfx,c.push(e);break;case"BrtBeginComments":break;case"BrtEndComments":break;
case"BrtBeginCommentAuthors":break;case"BrtEndCommentAuthors":break;case"BrtBeginCommentList":break;case"BrtEndCommentList":break;default:if(!f||b.WTF)throw new Error("Unexpected record "+h+" "+g.n)}}),c}function Vb(a,b){a.read_shift(4);return D(a,b-4)}function Wb(a,b){for(var c=0,d=a.length;d>c;++c)if(a[c].t===b)return a.Count++,c;return a[d]={t:b},a.Count++,a.Unique++,d}function Xb(a,b,c){for(var d=c.revssf[null!=b.z?b.z:"General"],e=0,f=a.length;e!=f;++e)if(a[e].numFmtId===d)return e;return a[f]={numFmtId:d,fontId:0,fillId:0,borderId:0,xfId:0,applyNumberFormat:1},f}function Yb(a,b,c,d){try{if(0===b)if("n"===a.t)a.w=(0|a.v)===a.v?Gd._general_int(a.v,_e):Gd._general_num(a.v,_e);else{if(void 0===a.v)return"";a.w=Gd._general(a.v,_e)}else a.w=Gd.format(b,a.v,_e);d.cellNF&&(a.z=Gd._table[b])}catch(e){if(d.WTF)throw e}if(c)try{a.s=Te.Fills[c],a.s.fgColor&&a.s.fgColor.theme&&(a.s.fgColor.rgb=tb(Ue.themeElements.clrScheme[a.s.fgColor.theme].rgb,a.s.fgColor.tint||0),d.WTF&&(a.s.fgColor.raw_rgb=Ue.themeElements.clrScheme[a.s.fgColor.theme].rgb)),a.s.bgColor&&a.s.bgColor.theme&&(a.s.bgColor.rgb=tb(Ue.themeElements.clrScheme[a.s.bgColor.theme].rgb,a.s.bgColor.tint||0),d.WTF&&(a.s.bgColor.raw_rgb=Ue.themeElements.clrScheme[a.s.bgColor.theme].rgb))}catch(e){if(d.WTF)throw e}}function Zb(a,b){var c=vd(b);c.s.r<=c.e.r&&c.s.c<=c.e.c&&c.s.r>=0&&c.s.c>=0&&(a["!ref"]=ud(c))}function $b(a,b,c){if(!a)return a;var d={},e=a.indexOf("<dimension");if(e>0){var f=a.substr(e,50).match(df);null!=f&&Zb(d,f[1])}var g=[];if(-1!==a.indexOf("</mergeCells>")){var h=a.match(af);for(e=0;e!=h.length;++e)g[e]=vd(h[e].substr(h[e].indexOf('"')+1))}var i=[];if(b.cellStyles&&-1!==a.indexOf("</cols>")){var j=a.match(ef);bc(i,j)}var k={s:{r:1e6,c:1e6},e:{r:0,c:0}},l=a.match(bf);if(l&&ff(l[1],d,b,k),-1!==a.indexOf("</hyperlinks>")&&ac(d,a.match(cf),c),!d["!ref"]&&k.e.c>=k.s.c&&k.e.r>=k.s.r&&(d["!ref"]=ud(k)),b.sheetRows>0&&d["!ref"]){var m=vd(d["!ref"]);b.sheetRows<+m.e.r&&(m.e.r=b.sheetRows-1,m.e.r>k.e.r&&(m.e.r=k.e.r),m.e.r<m.s.r&&(m.s.r=m.e.r),m.e.c>k.e.c&&(m.e.c=k.e.c),m.e.c<m.s.c&&(m.s.c=m.e.c),d["!fullref"]=d["!ref"],d["!ref"]=ud(m))}return g.length>0&&(d["!merges"]=g),i.length>0&&(d["!cols"]=i),d}function _b(a){if(0==a.length)return"";for(var b='<mergeCells count="'+a.length+'">',c=0;c!=a.length;++c)b+='<mergeCell ref="'+ud(a[c])+'"/>';return b+"</mergeCells>"}function ac(a,b,c){for(var d=0;d!=b.length;++d){var e=o(b[d],!0);if(!e.ref)return;var f=c["!id"][e.id];f&&(e.Target=f.Target,e.location&&(e.Target+="#"+e.location),e.Rel=f);for(var g=vd(e.ref),h=g.s.r;h<=g.e.r;++h)for(var i=g.s.c;i<=g.e.c;++i){var j=sd({c:i,r:h});a[j]||(a[j]={t:"str",v:void 0}),a[j].l=e}}}function bc(a,b){for(var c=!1,d=0;d!=b.length;++d){var e=o(b[d],!0),f=parseInt(e.min,10)-1,g=parseInt(e.max,10)-1;for(delete e.min,delete e.max,!c&&e.width&&(c=!0,yb(+e.width,e)),e.width&&(e.wpx=ub(+e.width),e.wch=vb(e.wpx),e.MDW=Se);g>=f;)a[f++]=e}}function cc(a,b){for(var c,d,e=["<cols>"],f=0;f!=b.length;++f)if(c=b[f]){var g={min:f+1,max:f+1};d=-1,c.wpx?d=vb(c.wpx):c.wch&&(d=c.wch),d>-1&&(g.width=wb(d),g.customWidth=1),e[e.length]=w("col",null,g)}return e[e.length]="</cols>",e.join("")}function dc(a,b,c,d){if(void 0===a.v)return"";var e="";switch(a.t){case"b":e=a.v?"1":"0";break;case"n":case"e":e=""+a.v;break;default:e=a.v}var f=u("v",r(e)),g={r:b},h=Xb(d.cellXfs,a,d);switch(0!==h&&(g.s=h),a.t){case"n":break;case"b":g.t="b";break;case"e":g.t="e";break;default:if(d.bookSST){f=u("v",""+Wb(d.Strings,a.v)),g.t="s";break}g.t="str"}return w("c",f,g)}function ec(a,b,c,d){var e,f,g,h,i=[],j=[],k=vd(a["!ref"]),l="",m=[];for(h=k.s.c;h<=k.e.c;++h)m[h]=od(h);for(g=k.s.r;g<=k.e.r;++g){for(j=[],l=ld(g),h=k.s.c;h<=k.e.c;++h)f=m[h]+l,void 0!==a[f]&&null!=(e=dc(a[f],f,a,b,c,d))&&j.push(e);j.length>0&&(i[i.length]=w("row",j.join(""),{r:l}))}return i.join("")}function fc(a,b,c){var d=[ce,gf],e=c.SheetNames[a],f=0,g="",h=c.Sheets[e];void 0===h&&(h={});var i=h["!ref"];return void 0===i&&(i="A1"),d[d.length]=w("dimension",null,{ref:i}),void 0!==h["!cols"]&&h["!cols"].length>0&&(d[d.length]=cc(h,h["!cols"])),d[f=d.length]="<sheetData/>",void 0!==h["!ref"]&&(g=ec(h,b,a,c),g.length>0&&(d[d.length]=g)),d.length>f+1&&(d[d.length]="</sheetData>",d[f]=d[f].replace("/>",">")),void 0!==h["!merges"]&&h["!merges"].length>0&&(d[d.length]=_b(h["!merges"])),d.length>2&&(d[d.length]="</worksheet>",d[1]=d[1].replace("/>",">")),d.join("")}function gc(a,b){var c=[];return c.r=a.read_shift(4),a.l+=b-4,c}function hc(a,b){var c={};return a.l+=19,c.name=N(a,b-19),c}function ic(a){var b=L(a);return[b]}function jc(a,b,c){return null==c&&(c=E(8)),M(b,c)}function kc(a){var b=L(a),c=a.read_shift(1);return[b,c,"b"]}function lc(a){var b=L(a),c=a.read_shift(1);return[b,c,"e"]}function mc(a){var b=L(a),c=a.read_shift(4);return[b,c,"s"]}function nc(a){var b=L(a),c=V(a);return[b,c,"n"]}function oc(a){var b=L(a),c=S(a);return[b,c,"n"]}function pc(a){var b=L(a),c=Q(a);return[b,c,"str"]}function qc(a,b,c){var d=L(a),e=a.read_shift(1),f=[d,e,"b"];if(c.cellFormula){{Vb(a,b-9)}f[3]=""}else a.l+=b-9;return f}function rc(a,b,c){var d=L(a),e=a.read_shift(1),f=[d,e,"e"];if(c.cellFormula){{Vb(a,b-9)}f[3]=""}else a.l+=b-9;return f}function sc(a,b,c){var d=L(a),e=V(a),f=[d,e,"n"];if(c.cellFormula){{Vb(a,b-16)}f[3]=""}else a.l+=b-16;return f}function tc(a,b,c){var d=a.l,e=L(a),f=Q(a),g=[e,f,"str"];if(c.cellFormula){Vb(a,d+b-a.l)}else a.l=d+b;return g}function uc(a,b){var c=a.l+b,d=T(a,16),e=O(a),f=Q(a),g=Q(a),h=Q(a);return a.l=c,{rfx:d,relId:e,loc:f,tooltip:g,display:h}}function vc(a,b,c){if(!a)return a;c||(c={"!id":{}});var d,e,f,g,h,i,j,k,l={},m={s:{r:1e6,c:1e6},e:{r:0,c:0}},n=!1,o=!1,p=[];if(F(a,function(a,q){if(!o)switch(q.n){case"BrtWsDim":d=a;break;case"BrtRowHdr":e=a,b.sheetRows&&b.sheetRows<=e.r&&(o=!0),k=ld(e.r);break;case"BrtFmlaBool":case"BrtFmlaError":case"BrtFmlaNum":case"BrtFmlaString":case"BrtCellBool":case"BrtCellError":case"BrtCellIsst":case"BrtCellReal":case"BrtCellRk":case"BrtCellSt":switch(f={t:a[2]},a[2]){case"n":f.v=a[1];break;case"s":j=$e[a[1]],f.v=j.t,f.r=j.r;break;case"b":f.v=a[1]?!0:!1;break;case"e":f.raw=a[1],f.v=qe[f.raw];break;case"str":f.v=Vd(a[1])}b.cellFormula&&a.length>3&&(f.f=a[3]),(g=Te.CellXf[a[0].iStyleRef])&&Yb(f,g.ifmt,null,b),l[od(h=a[0].c)+k]=f,m.s.r>e.r&&(m.s.r=e.r),m.s.c>h&&(m.s.c=h),m.e.r<e.r&&(m.e.r=e.r),m.e.c<h&&(m.e.c=h);break;case"BrtCellBlank":if(!b.sheetStubs)break;f={t:"str",v:void 0},l[od(h=a[0].c)+k]=f,m.s.r>e.r&&(m.s.r=e.r),m.s.c>h&&(m.s.c=h),m.e.r<e.r&&(m.e.r=e.r),m.e.c<h&&(m.e.c=h);break;case"BrtBeginMergeCells":break;case"BrtEndMergeCells":break;case"BrtMergeCell":p.push(a);break;case"BrtHLink":var r=c["!id"][a.relId];for(r&&(a.Target=r.Target,a.loc&&(a.Target+="#"+a.loc),a.Rel=r),q=a.rfx.s.r;q<=a.rfx.e.r;++q)for(h=a.rfx.s.c;h<=a.rfx.e.c;++h)i=sd({c:h,r:q}),l[i]||(l[i]={t:"str",v:void 0}),l[i].l=a;break;case"BrtArrFmla":break;case"BrtShrFmla":break;case"BrtBeginSheet":break;case"BrtWsProp":break;case"BrtSheetCalcProp":break;case"BrtBeginWsViews":break;case"BrtBeginWsView":break;case"BrtPane":break;case"BrtSel":break;case"BrtEndWsView":break;case"BrtEndWsViews":break;case"BrtACBegin":break;case"BrtRwDescent":break;case"BrtACEnd":break;case"BrtWsFmtInfoEx14":break;case"BrtWsFmtInfo":break;case"BrtBeginColInfos":break;case"BrtColInfo":break;case"BrtEndColInfos":break;case"BrtBeginSheetData":break;case"BrtEndSheetData":break;case"BrtSheetProtection":break;case"BrtPrintOptions":break;case"BrtMargins":break;case"BrtPageSetup":break;case"BrtFRTBegin":n=!0;break;case"BrtFRTEnd":n=!1;break;case"BrtEndSheet":break;case"BrtDrawing":break;case"BrtLegacyDrawing":break;case"BrtLegacyDrawingHF":break;case"BrtPhoneticInfo":break;case"BrtBeginHeaderFooter":break;case"BrtEndHeaderFooter":break;case"BrtBrk":break;case"BrtBeginRwBrk":break;case"BrtEndRwBrk":break;case"BrtBeginColBrk":break;case"BrtEndColBrk":break;case"BrtBeginUserShViews":break;case"BrtBeginUserShView":break;case"BrtEndUserShView":break;case"BrtEndUserShViews":break;case"BrtBkHim":break;case"BrtBeginOleObjects":break;case"BrtOleObject":break;case"BrtEndOleObjects":break;case"BrtBeginListParts":break;case"BrtListPart":break;case"BrtEndListParts":break;case"BrtBeginSortState":break;case"BrtBeginSortCond":break;case"BrtEndSortCond":break;case"BrtEndSortState":break;case"BrtBeginConditionalFormatting":break;case"BrtEndConditionalFormatting":break;case"BrtBeginCFRule":break;case"BrtEndCFRule":break;case"BrtBeginDVals":break;case"BrtDVal":break;case"BrtEndDVals":break;case"BrtRangeProtection":break;case"BrtBeginDCon":break;case"BrtEndDCon":break;case"BrtBeginDRefs":break;case"BrtDRef":break;case"BrtEndDRefs":break;case"BrtBeginActiveXControls":break;case"BrtActiveX":break;case"BrtEndActiveXControls":break;case"BrtBeginAFilter":break;case"BrtEndAFilter":break;case"BrtBeginFilterColumn":break;case"BrtBeginFilters":break;case"BrtFilter":break;case"BrtEndFilters":break;case"BrtEndFilterColumn":break;case"BrtDynamicFilter":break;case"BrtTop10Filter":break;case"BrtBeginCustomFilters":break;case"BrtCustomFilter":break;case"BrtEndCustomFilters":break;case"BrtBeginSmartTags":break;case"BrtBeginCellSmartTags":break;case"BrtBeginCellSmartTag":break;case"BrtCellSmartTagProperty":break;case"BrtEndCellSmartTag":break;case"BrtEndCellSmartTags":break;case"BrtEndSmartTags":break;case"BrtBeginCellWatches":break;case"BrtCellWatch":break;case"BrtEndCellWatches":break;case"BrtTable":break;case"BrtBeginCellIgnoreECs":break;case"BrtCellIgnoreEC":break;case"BrtEndCellIgnoreECs":break;default:if(!n||b.WTF)throw new Error("Unexpected record "+q.n)}},b),!l["!ref"]&&(m.s.r<1e6||d.e.r>0||d.e.c>0||d.s.r>0||d.s.c>0)&&(l["!ref"]=ud(d)),b.sheetRows&&l["!ref"]){var q=vd(l["!ref"]);b.sheetRows<+q.e.r&&(q.e.r=b.sheetRows-1,q.e.r>m.e.r&&(q.e.r=m.e.r),q.e.r<q.s.r&&(q.s.r=q.e.r),q.e.c>m.e.c&&(q.e.c=m.e.c),q.e.c<q.s.c&&(q.s.c=q.e.c),l["!fullref"]=l["!ref"],l["!ref"]=ud(q))}return p.length>0&&(l["!merges"]=p),l}function wc(a,b,c,d,e){if(void 0===b.v)return"";var f="";switch(b.t){case"b":f=b.v?"1":"0";break;case"n":case"e":f=""+b.v;break;default:f=b.v}var g={r:c,c:d};switch(g.s=Xb(e.cellXfs,b,e),b.t){case"s":case"str":if(e.bookSST){f=Wb(e.Strings,b.v),g.t="s";break}g.t="str";break;case"n":break;case"b":g.t="b";break;case"e":g.t="e"}H(a,"BrtCellBlank",jc(b,g))}function xc(a,b,c,d){var e,f=vd(b["!ref"]||"A1"),g="",h=[];H(a,"BrtBeginSheetData");for(var i=f.s.r;i<=f.e.r;++i){g=ld(i);for(var j=f.s.c;j<=f.e.c;++j)i===f.s.r&&(h[j]=od(j)),e=h[j]+g,b[e]&&wc(a,b[e],i,j,d)}H(a,"BrtEndSheetData")}function yc(a,b,c){var d=G(),e=c.SheetNames[a],f=c.Sheets[e]||{},g=vd(f["!ref"]||"A1");return H(d,"BrtBeginSheet"),H(d,"BrtWsDim",jf(g)),xc(d,f,a,b,c),H(d,"BrtEndSheet"),d.end()}function zc(a,b){for(var c=0;c!=a.length;++c)for(var d=a[c],e=0;e!=b.length;++e){var f=b[e];null==d[f[0]]&&(d[f[0]]=f[1])}}function Ac(a,b){for(var c=0;c!=b.length;++c){var d=b[c];null==a[d[0]]&&(a[d[0]]=d[1])}}function Bc(a){Ac(a.WBProps,lf),Ac(a.CalcPr,of),zc(a.WBView,mf),zc(a.Sheets,nf),_e.date1904=s(a.WBProps.date1904,"date1904")}function Cc(a,b){var c={AppVersion:{},WBProps:{},WBView:[],Sheets:[],CalcPr:{},xmlns:""},d=!1,e="xmlns";if(a.match(Md).forEach(function(a){var f=o(a);switch(p(f[0])){case"<?xml":break;case"<workbook":a.match(pf)&&(e="xmlns"+a.match(/<(\w+):/)[1]),c.xmlns=f[e];break;case"</workbook>":break;case"<fileVersion":delete f[0],c.AppVersion=f;break;case"<fileVersion/>":break;case"<fileSharing":case"<fileSharing/>":break;case"<workbookPr":delete f[0],c.WBProps=f;break;case"<workbookPr/>":delete f[0],c.WBProps=f;break;case"<workbookProtection":break;case"<workbookProtection/>":break;case"<bookViews>":case"</bookViews>":break;case"<workbookView":delete f[0],c.WBView.push(f);break;case"<sheets>":case"</sheets>":break;case"<sheet":delete f[0],f.name=Vd(f.name),c.Sheets.push(f);break;case"<functionGroups":case"<functionGroups/>":break;case"<functionGroup":break;case"<externalReferences":case"</externalReferences>":case"<externalReferences>":break;case"<externalReference":break;case"<definedNames/>":break;case"<definedNames>":case"<definedNames":d=!0;break;case"</definedNames>":d=!1;break;case"<definedName":case"<definedName/>":case"</definedName>":break;case"<calcPr":delete f[0],c.CalcPr=f;break;case"<calcPr/>":delete f[0],c.CalcPr=f;break;case"<oleSize":break;case"<customWorkbookViews>":case"</customWorkbookViews>":case"<customWorkbookViews":break;case"<customWorkbookView":case"</customWorkbookView>":break;case"<pivotCaches>":case"</pivotCaches>":case"<pivotCaches":break;case"<pivotCache":break;case"<smartTagPr":case"<smartTagPr/>":break;case"<smartTagTypes":case"<smartTagTypes>":case"</smartTagTypes>":break;case"<smartTagType":break;case"<webPublishing":case"<webPublishing/>":break;case"<fileRecoveryPr":case"<fileRecoveryPr/>":break;case"<webPublishObjects>":case"<webPublishObjects":case"</webPublishObjects>":break;case"<webPublishObject":break;case"<extLst>":case"</extLst>":case"<extLst/>":break;case"<ext":d=!0;break;case"</ext>":d=!1;break;case"<ArchID":break;case"<AlternateContent":d=!0;break;case"</AlternateContent>":d=!1;break;default:if(!d&&b.WTF)throw"unrecognized "+f[0]+" in workbook"}}),-1===de.main.indexOf(c.xmlns))throw new Error("Unknown Namespace: "+c.xmlns);return Bc(c),c}function Dc(a){try{return s(a.Workbook.WBProps.date1904)?"true":"false"}catch(b){return"false"}}function Ec(a){var b=[ce];b[b.length]=qf,b[b.length]=w("workbookPr",null,{date1904:Dc(a)}),b[b.length]="<sheets>";for(var c=0;c!=a.SheetNames.length;++c)b[b.length]=w("sheet",null,{name:a.SheetNames[c].substr(0,31),sheetId:""+(c+1),"r:id":"rId"+(c+1)});return b[b.length]="</sheets>",b.length>2&&(b[b.length]="</workbook>",b[1]=b[1].replace("/>",">")),b.join("")}function Fc(a,b){var c={};return c.hsState=a.read_shift(4),c.iTabID=a.read_shift(4),c.strRelID=oe(a,b-8),c.name=Q(a),c}function Gc(a,b){return b||(b=E(127)),b.write_shift(4,a.hsState),b.write_shift(4,a.iTabID),pe(a.strRelID,b),R(a.name.substr(0,31),b),b}function Hc(a,b){a.read_shift(4);var c=a.read_shift(4),d=b>8?Q(a):"";return[c,d]}function Ic(a,b){return b||(b=E(8)),b.write_shift(4,0),b.write_shift(4,0),b}function Jc(a,b){var c={};return a.read_shift(4),c.ArchID=a.read_shift(4),a.l+=b-8,c}function Kc(a,b){var c={AppVersion:{},WBProps:{},WBView:[],Sheets:[],CalcPr:{},xmlns:""},d=!1;return F(a,function(a,e){switch(e.n){case"BrtBundleSh":c.Sheets.push(a);break;case"BrtBeginBook":break;case"BrtFileVersion":break;case"BrtWbProp":break;case"BrtACBegin":break;case"BrtAbsPath15":break;case"BrtACEnd":break;case"BrtWbFactoid":break;case"BrtBookProtection":break;case"BrtBeginBookViews":break;case"BrtBookView":break;case"BrtEndBookViews":break;case"BrtBeginBundleShs":break;case"BrtEndBundleShs":break;case"BrtBeginFnGroup":break;case"BrtEndFnGroup":break;case"BrtBeginExternals":break;case"BrtSupSelf":break;case"BrtSupBookSrc":break;case"BrtExternSheet":break;case"BrtEndExternals":break;case"BrtName":break;case"BrtCalcProp":break;case"BrtUserBookView":break;case"BrtBeginPivotCacheIDs":break;case"BrtBeginPivotCacheID":break;case"BrtEndPivotCacheID":break;case"BrtEndPivotCacheIDs":break;case"BrtWebOpt":break;case"BrtFileRecover":break;case"BrtFileSharing":break;case"BrtBeginSmartTagTypes":break;case"BrtSmartTagType":break;case"BrtEndSmartTagTypes":break;case"BrtFRTBegin":d=!0;break;case"BrtFRTArchID$":break;case"BrtWorkBookPr15":break;case"BrtFRTEnd":d=!1;break;case"BrtEndBook":break;default:if(!d||b.WTF)throw new Error("Unexpected record "+e.n)}}),Bc(c),c}function Lc(a,b){H(a,"BrtBeginBundleShs");for(var c=0;c!=b.SheetNames.length;++c){var d={hsState:0,iTabID:c+1,strRelID:"rId"+(c+1),name:b.SheetNames[c]};H(a,"BrtBundleSh",Gc(d))}H(a,"BrtEndBundleShs")}function Mc(b,c){c||(c=E(127));for(var d=0;4!=d;++d)c.write_shift(4,0);return R("SheetJS",c),R(a.version,c),R(a.version,c),R("7262",c),c.length=c.l,c}function Nc(a){H(a,"BrtBeginBookViews"),H(a,"BrtEndBookViews")}function Oc(a,b){return b||(b=E(26)),b.write_shift(4,0),b.write_shift(4,1),b.write_shift(4,0),W(0,b),b.write_shift(-4,1023),b.write_shift(1,51),b.write_shift(1,0),b}function Pc(a,b){return b||(b=E(1)),b.write_shift(1,0),b}function Qc(a,b){var c=G();return H(c,"BrtBeginBook"),H(c,"BrtFileVersion",Mc()),H(c,"BrtWbProp",Ic()),Nc(c,a,b),Lc(c,a,b),H(c,"BrtCalcProp",Oc()),H(c,"BrtFileRecover",Pc()),H(c,"BrtEndBook"),c.end()}function Rc(a,b,c){return(".bin"===b.substr(-4)?Kc:Cc)(a,c)}function Sc(a,b,c,d){return(".bin"===b.substr(-4)?vc:$b)(a,c,d)}function Tc(a,b,c){return(".bin"===b.substr(-4)?Ib:Ve)(a,c)}function Uc(a,b,c){return Lb(a,c)}function Vc(a,b,c){return(".bin"===b.substr(-4)?mb:jb)(a,c)}function Wc(a,b,c){return(".bin"===b.substr(-4)?Ub:Sb)(a,c)}function Xc(a,b,c){return(".bin"===b.substr(-4)?Pb:Nb)(a,c)}function Yc(a,b,c){return(".bin"===b.substr(-4)?Qc:Ec)(a,c)}function Zc(a,b,c,d){return(".bin"===b.substr(-4)?yc:fc)(a,c,d)}function $c(a,b,c){return(".bin"===b.substr(-4)?Jb:Eb)(a,c)}function _c(a,b,c){return(".bin"===b.substr(-4)?ob:kb)(a,c)}function ad(a){return function(b){for(var c=0;c!=a.length;++c){var d=a[c];void 0===b[d[0]]&&(b[d[0]]=d[1]),"n"===d[2]&&(b[d[0]]=Number(b[d[0]]))}}}function bd(a,b){if(!a)return 0;try{a=b.map(function(b){return[b.name,a["!id"][b.id].Target]})}catch(c){return null}return a&&0!==a.length?a:null}function cd(a,b,c,d,e,f,g){try{e[d]=_(n(a,c,!0),b),f[d]=Sc(n(a,b),b,g,e[d])}catch(h){if(g.WTF)throw h}}function dd(a,c){Hd(Gd),c=c||{},tf(c),b();var d,f,g=e(a.files).filter(vf).sort(),h=Z(n(a,"[Content_Types].xml"),c),i=!1;if(0===h.workbooks.length&&(f="xl/workbook.xml",n(a,f,!0)&&h.workbooks.push(f)),0===h.workbooks.length){if(f="xl/workbook.bin",!m(a,f,!0))throw new Error("Could not find workbook");h.workbooks.push(f),i=!0}"bin"==h.workbooks[0].substr(-3)&&(i=!0),i&&Ed(1200),c.bookSheets||c.bookProps||($e=[],h.sst&&($e=Vc(n(a,h.sst.replace(/^\//,"")),h.sst,c)),Te={},h.style&&(Te=Tc(n(a,h.style.replace(/^\//,"")),h.style,c)),Ue={},c.cellStyles&&h.themes.length&&(Ue=Uc(n(a,h.themes[0].replace(/^\//,""),!0),h.themes[0],c)));var j=Rc(n(a,h.workbooks[0].replace(/^\//,"")),h.workbooks[0],c),k={},l="";0!==h.coreprops.length&&(l=n(a,h.coreprops[0].replace(/^\//,""),!0),l&&(k=bb(l)),0!==h.extprops.length&&(l=n(a,h.extprops[0].replace(/^\//,""),!0),l&&eb(l,k)));var o={};(!c.bookSheets||c.bookProps)&&0!==h.custprops.length&&(l=n(a,h.custprops[0].replace(/^\//,""),!0),l&&(o=gb(l,c)));var p={};if((c.bookSheets||c.bookProps)&&(k.Worksheets&&k.SheetNames.length>0?d=k.SheetNames:j.Sheets&&(d=j.Sheets.map(function(a){return a.name})),c.bookProps&&(p.Props=k,p.Custprops=o),"undefined"!=typeof d&&(p.SheetNames=d),c.bookSheets?p.SheetNames:c.bookProps))return p;d={};var q={};c.bookDeps&&h.calcchain&&(q=Xc(n(a,h.calcchain.replace(/^\//,"")),h.calcchain,c));var r,s,t=0,u={};if(!k.Worksheets){var v=j.Sheets;k.Worksheets=v.length,k.SheetNames=[];for(var w=0;w!=v.length;++w)k.SheetNames[w]=v[w].name}var x=i?"bin":"xml",y="xl/_rels/workbook."+x+".rels",z=_(n(a,y,!0),y);z&&(z=bd(z,j.Sheets));var A=n(a,"xl/worksheets/sheet.xml",!0)?1:0;for(t=0;t!=k.Worksheets;++t)z?r="xl/"+z[t][1].replace(/[\/]?xl\//,""):(r="xl/worksheets/sheet"+(t+1-A)+"."+x,r=r.replace(/sheet0\./,"sheet.")),s=r.replace(/^(.*)(\/)([^\/]*)$/,"$1/_rels/$3.rels"),cd(a,r,s,k.SheetNames[t],u,d,c);return h.comments&&Qb(a,h.comments,d,u,c),p={Directory:h,Workbook:j,Props:k,Custprops:o,Deps:q,Sheets:d,SheetNames:k.SheetNames,Strings:$e,Styles:Te,Themes:Ue,SSF:Gd.get_table()},c.bookFiles&&(p.keys=g,p.files=a.files),c.bookVBA&&(h.vba.length>0?p.vbaraw=n(a,h.vba[0],!0):"application/vnd.ms-office.vbaProject"===h.defaults.bin&&(p.vbaraw=n(a,"xl/vbaProject.bin",!0))),p}function ed(a,b,c,d,e){if(e||(e={}),a["!id"]||(a["!id"]={}),e.Id="rId"+b,e.Type=d,e.Target=c,a["!id"][e.Id])throw new Error("Cannot rewrite rId "+b);a["!id"][e.Id]=e,a[("/"+e.Target).replace("//","/")]=e}function fd(a,b){a&&!a.SSF&&(a.SSF=Gd.get_table()),a&&a.SSF&&(Hd(Gd),Gd.load_table(a.SSF),b.revssf=h(a.SSF),b.revssf[a.SSF[65535]]=0),b.rels={},b.wbrels={},b.Strings=[],b.Strings.Count=0,b.Strings.Unique=0;var c="xlsb"==b.bookType?"bin":"xml",d={workbooks:[],sheets:[],calcchains:[],themes:[],styles:[],coreprops:[],extprops:[],custprops:[],strs:[],comments:[],vba:[],TODO:[],rels:[],xmlns:""};uf(b=b||{});var f=new Jd,g="",i=0;for(b.cellXfs=[],Xb(b.cellXfs,{},{revssf:{General:0}}),g="docProps/core.xml",f.file(g,db(a.Props,b)),d.coreprops.push(g),ed(b.rels,2,g,xe.CORE_PROPS),g="docProps/app.xml",a.Props||(a.Props={}),a.Props.SheetNames=a.SheetNames,a.Props.Worksheets=a.SheetNames.length,f.file(g,fb(a.Props,b)),d.extprops.push(g),ed(b.rels,3,g,xe.EXT_PROPS),a.Custprops!==a.Props&&e(a.Custprops||{}).length>0&&(g="docProps/custom.xml",f.file(g,hb(a.Custprops,b)),d.custprops.push(g),ed(b.rels,4,g,xe.CUST_PROPS)),g="xl/workbook."+c,f.file(g,Yc(a,g,b)),d.workbooks.push(g),ed(b.rels,1,g,xe.WB),i=1;i<=a.SheetNames.length;++i)g="xl/worksheets/sheet"+i+"."+c,f.file(g,Zc(i-1,g,b,a)),d.sheets.push(g),ed(b.wbrels,i,"worksheets/sheet"+i+"."+c,xe.WS);return null!=b.Strings&&b.Strings.length>0&&(g="xl/sharedStrings."+c,f.file(g,_c(b.Strings,g,b)),d.strs.push(g),ed(b.wbrels,++i,"sharedStrings."+c,xe.SST)),g="xl/theme/theme1.xml",f.file(g,Mb()),d.themes.push(g),ed(b.wbrels,++i,"theme/theme1.xml",xe.THEME),g="xl/styles."+c,f.file(g,$c(a,g,b)),d.styles.push(g),ed(b.wbrels,++i,"styles."+c,xe.STY),f.file("[Content_Types].xml",$(d,b)),f.file("_rels/.rels",ab(b.rels)),f.file("xl/_rels/workbook."+c+".rels",ab(b.wbrels)),f}function gd(a,b){var c,d=a,e=b||{};switch(e.type||(e.type=Kd&&Buffer.isBuffer(a)?"buffer":"base64"),e.type){case"base64":c=new Jd(d,{base64:!0});break;case"binary":c=new Jd(d,{base64:!1});break;case"buffer":c=new Jd(d);break;case"file":c=new Jd(d=Id.readFileSync(a));break;default:throw new Error("Unrecognized type "+e.type)}return dd(c,e)}function hd(a,b){var c=b||{};return c.type="file",gd(a,c)}function id(a,b){var c=b||{},d=fd(a,c);switch(c.type){case"base64":return d.generate({type:"base64"});case"binary":return d.generate({type:"string"});case"buffer":return d.generate({type:"nodebuffer"});case"file":return Id.writeFileSync(c.file,d.generate({type:"nodebuffer"}));default:throw new Error("Unrecognized type "+c.type)}}function jd(a,b,c){var d=c||{};switch(d.type="file",d.file=b,d.file.substr(-5).toLowerCase()){case".xlsm":d.bookType="xlsm";break;case".xlsb":d.bookType="xlsb"}return id(a,d)}function kd(a){return parseInt(md(a),10)-1}function ld(a){return""+(a+1)}function md(a){return a.replace(/\$(\d+)$/,"$1")}function nd(a){for(var b=pd(a),c=0,d=0;d!==b.length;++d)c=26*c+b.charCodeAt(d)-64;return c-1}function od(a){var b="";for(++a;a;a=Math.floor((a-1)/26))b=String.fromCharCode((a-1)%26+65)+b;return b}function pd(a){return a.replace(/^\$([A-Z])/,"$1")}function qd(a){return a.replace(/(\$?[A-Z]*)(\$?\d*)/,"$1,$2").split(",")}function rd(a){var b=qd(a);return{c:nd(b[0]),r:kd(b[1])}}function sd(a){return od(a.c)+ld(a.r)}function td(a){var b=a.split(":").map(rd);return{s:b[0],e:b[b.length-1]}}function ud(a,b){return void 0===b||"number"==typeof b?ud(a.s,a.e):("string"!=typeof a&&(a=sd(a)),"string"!=typeof b&&(b=sd(b)),a==b?a:a+":"+b)}function vd(a){var b={s:{c:0,r:0},e:{c:0,r:0}},c=0,d=0,e=0,f=a.length;for(c=0;f>d&&!((e=a.charCodeAt(d)-64)<1||e>26);++d)c=26*c+e;for(b.s.c=--c,c=0;f>d&&!((e=a.charCodeAt(d)-48)<0||e>9);++d)c=10*c+e;if(b.s.r=--c,d===f||58===a.charCodeAt(++d))return b.e.c=b.s.c,b.e.r=b.s.r,b;for(c=0;d!=f&&!((e=a.charCodeAt(d)-64)<1||e>26);++d)c=26*c+e;for(b.e.c=--c,c=0;d!=f&&!((e=a.charCodeAt(d)-48)<0||e>9);++d)c=10*c+e;return b.e.r=--c,b}function wd(a,b){if(void 0!==a.z)try{return a.w=Gd.format(a.z,b)}catch(c){}if(!a.XF)return b;try{return a.w=Gd.format(a.XF.ifmt||0,b)}catch(c){return""+b}}function xd(a,b){return null==a||null==a.t?"":void 0!==a.w?a.w:void 0===b?wd(a,a.v):wd(a,b)}function yd(a,b){var c,d,e,f,g,h,i,j,k=0,l=1,m=[],n=null!=b?b:{},o=n.raw;if(null==a||null==a["!ref"])return[];switch(e=void 0!==n.range?n.range:a["!ref"],1===n.header?k=1:"A"===n.header?k=2:Array.isArray(n.header)&&(k=3),typeof e){case"string":f=vd(e);break;case"number":f=vd(a["!ref"]),f.s.r=e;break;default:f=e}k>0&&(l=0);var p=ld(f.s.r),q=new Array(f.e.c-f.s.c+1),r=new Array(f.e.r-f.s.r-l+1),s=0;for(i=f.s.c;i<=f.e.c;++i)switch(q[i]=od(i),c=a[q[i]+p],k){case 1:m[i]=i;break;case 2:m[i]=q[i];break;case 3:m[i]=n.header[i-f.s.c];break;default:if(void 0===c)continue;m[i]=xd(c)}for(h=f.s.r+l;h<=f.e.r;++h){for(p=ld(h),g=!0,d=1===k?[]:Object.create({__rowNum__:h}),i=f.s.c;i<=f.e.c;++i)if(c=a[q[i]+p],void 0!==c&&void 0!==c.t){switch(j=c.v,c.t){case"e":continue;case"s":case"str":break;case"b":case"n":break;default:throw"unrecognized type "+c.t}void 0!==j&&(d[m[i]]=o?j:xd(c,j),g=!1)}g===!1&&(r[s++]=d)}return r.length=s,r}function zd(a,b){return yd(a,null!=b?b:{})}function Ad(a,b){var c="",d="",e=/"/g,f=null==b?{}:b;if(null==a||null==a["!ref"])return"";var g,h=vd(a["!ref"]),i=void 0!==f.FS?f.FS:",",j=i.charCodeAt(0),k=void 0!==f.RS?f.RS:"\n",l=k.charCodeAt(0),m="",n="",o=[],p=0,q=0,r=0,s=0;for(s=h.s.c;s<=h.e.c;++s)o[s]=od(s);for(r=h.s.r;r<=h.e.r;++r){for(m="",n=ld(r),s=h.s.c;s<=h.e.c;++s){for(g=a[o[s]+n],d=void 0!==g?""+xd(g):"",p=0,q=0;p!==d.length;++p)if((q=d.charCodeAt(p))===j||q===l||34===q){d='"'+d.replace(e,'""')+'"';break}m+=(s===h.s.c?"":i)+d}c+=m+k}return c}function Bd(a){var b,c,d="",e="";if(null==a||null==a["!ref"])return"";var f,g=vd(a["!ref"]),h="",i=[];b=new Array((g.e.r-g.s.r+1)*(g.e.c-g.s.c+1));var j=0;for(f=g.s.c;f<=g.e.c;++f)i[f]=od(f);for(var k=g.s.r;k<=g.e.r;++k)for(h=ld(k),f=g.s.c;f<=g.e.c;++f)if(d=i[f]+h,c=a[d],e="",void 0!==c){if(null!=c.f)e=c.f;else if(void 0!==c.w)e="'"+c.w;else{if(void 0===c.v)continue;e=""+c.v}b[j++]=d+"="+e}return b.length=j,b}a.version="0.7.10";var Cd,Dd=1252;"undefined"!=typeof module&&"undefined"!=typeof require&&("undefined"==typeof cptable&&(cptable=require("./dist/cpexcel")),Cd=cptable[Dd]);var Ed=function(a){Dd=a},Fd=function(a){return a};"undefined"!=typeof cptable&&(Ed=function(a){Dd=a,Cd=cptable[a]},Fd=function(a){return 255===a.charCodeAt(0)&&254===a.charCodeAt(1)?cptable.utils.decode(1200,c(a.substr(2))):a});var Gd={},Hd=function(a){function b(a){for(var b="",c=a.length-1;c>=0;)b+=a.charAt(c--);return b}function c(a,b){for(var c="";c.length<b;)c+=a;return c}function d(a,b){var d=""+a;return d.length>=b?d:c("0",b-d.length)+d}function e(a,b){var d=""+a;return d.length>=b?d:c(" ",b-d.length)+d}function f(a,b){var d=""+a;return d.length>=b?d:d+c(" ",b-d.length)}function g(a,b){var d=""+Math.round(a);return d.length>=b?d:c("0",b-d.length)+d}function h(a,b){var d=""+a;return d.length>=b?d:c("0",b-d.length)+d}function i(a,b){if(a>x||-x>a)return g(a,b);var c=Math.round(a);return h(c,b)}function j(a,b){return a.length>=7+b&&103===(32|a.charCodeAt(b))&&101===(32|a.charCodeAt(b+1))&&110===(32|a.charCodeAt(b+2))&&101===(32|a.charCodeAt(b+3))&&114===(32|a.charCodeAt(b+4))&&97===(32|a.charCodeAt(b+5))&&108===(32|a.charCodeAt(b+6))}function k(a){for(var b=0;b!=y.length;++b)void 0===a[y[b][0]]&&(a[y[b][0]]=y[b][1])}function l(a,b,c){for(var d=0>a?-1:1,e=a*d,f=0,g=1,h=0,i=1,j=0,k=0,l=Math.floor(e);b>j&&(l=Math.floor(e),h=l*g+f,k=l*j+i,!(5e-10>e-l));)e=1/(e-l),f=g,g=h,i=j,j=k;if(k>b&&(k=j,h=g),k>b&&(k=i,h=f),!c)return[0,d*h,k];if(0===k)throw"Unexpected state: "+h+" "+g+" "+f+" "+k+" "+j+" "+i;var m=Math.floor(d*h/k);return[m,d*h-m*k,k]}function m(a){return""+a}function n(a,b){switch(typeof a){case"string":return a;case"boolean":return a?"TRUE":"FALSE";case"number":return(0|a)===a?m(a,b):C(a,b)}throw new Error("unsupported value in General format: "+a)}function o(){return 0}function p(a,b,c){if(a>2958465||0>a)return null;var d=0|a,e=Math.floor(86400*(a-d)),f=0,g=[],h={D:d,T:e,u:86400*(a-d)-e,y:0,m:0,d:0,H:0,M:0,S:0,q:0};if(Math.abs(h.u)<1e-6&&(h.u=0),k(null!=b?b:b=[]),b.date1904&&(d+=1462),h.u>.999&&(h.u=0,86400==++e&&(e=0,++d)),60===d)g=c?[1317,10,29]:[1900,2,29],f=3;else if(0===d)g=c?[1317,8,29]:[1900,1,0],f=6;else{d>60&&--d;var i=new Date(1900,0,1);i.setDate(i.getDate()+d-1),g=[i.getFullYear(),i.getMonth()+1,i.getDate()],f=i.getDay(),60>d&&(f=(f+6)%7),c&&(f=o(i,g))}return h.y=g[0],h.m=g[1],h.d=g[2],h.S=e%60,e=Math.floor(e/60),h.M=e%60,e=Math.floor(e/60),h.H=e,h.q=f,h}function q(a,b,c,e){var f,g="",h=0,i=0,j=c.y,k=0;switch(a){case 98:j=c.y+543;case 121:switch(b.length){case 1:case 2:f=j%100,k=2;break;default:f=j%1e4,k=4}break;case 109:switch(b.length){case 1:case 2:f=c.m,k=b.length;break;case 3:return B[c.m-1][1];case 5:return B[c.m-1][0];default:return B[c.m-1][2]}break;case 100:switch(b.length){case 1:case 2:f=c.d,k=b.length;break;case 3:return A[c.q][0];default:return A[c.q][1]}break;case 104:switch(b.length){case 1:case 2:f=1+(c.H+11)%12,k=b.length;break;default:throw"bad hour format: "+b}break;case 72:switch(b.length){case 1:case 2:f=c.H,k=b.length;break;default:throw"bad hour format: "+b}break;case 77:switch(b.length){case 1:case 2:f=c.M,k=b.length;break;default:throw"bad minute format: "+b}break;case 115:if(0===c.u)switch(b){case"s":case"ss":return d(c.S,b.length);case".0":case".00":case".000":}switch(b){case"s":case"ss":case".0":case".00":case".000":return i=e>=2?3===e?1e3:100:1===e?10:1,h=Math.round(i*(c.S+c.u)),h>=60*i&&(h=0),"s"===b?0===h?"0":""+h/i:(g=d(h,2+e),"ss"===b?g.substr(0,2):"."+g.substr(2,b.length-1));default:throw"bad second format: "+b}case 90:switch(b){case"[h]":case"[hh]":f=24*c.D+c.H;break;case"[m]":case"[mm]":f=60*(24*c.D+c.H)+c.M;break;case"[s]":case"[ss]":f=60*(60*(24*c.D+c.H)+c.M)+Math.round(c.S+c.u);break;default:throw"bad abstime format: "+b}k=3===b.length?1:2;break;case 101:f=j,k=1}return k>0?d(f,k):""}function r(a){if(a.length<=3)return a;for(var b=a.length%3,c=a.substr(0,b);b!=a.length;b+=3)c+=(c.length>0?",":"")+a.substr(b,3);return c}function s(a){for(var b,c=[],d=!1,e=0,f=0;e<a.length;++e)switch(b=a.charCodeAt(e)){case 34:d=!d;break;case 95:case 42:case 92:++e;break;case 59:c[c.length]=a.substr(f,e-f),f=e+1}if(c[c.length]=a.substr(f),d===!0)throw new Error("Format |"+a+"| unterminated string ");return c}function t(a,b,c,d){for(var e,f,g,h,i=[],k="",l=0,m="",o="t",r="H";l<a.length;)switch(m=a[l]){case"G":if(!j(a,l))throw new Error("unrecognized character "+m+" in "+a);i[i.length]={t:"G",v:"General"},l+=7;break;case'"':for(k="";34!==(h=a.charCodeAt(++l))&&l<a.length;)k+=String.fromCharCode(h);i[i.length]={t:"t",v:k},++l;break;case"\\":var s=a[++l],t="("===s||")"===s?s:"t";i[i.length]={t:t,v:s},++l;break;case"_":i[i.length]={t:"t",v:" "},l+=2;break;case"@":i[i.length]={t:"T",v:b},++l;break;case"B":case"b":if("1"===a[l+1]||"2"===a[l+1]){if(null==f&&(f=p(b,c,"2"===a[l+1]),null==f))return"";i[i.length]={t:"X",v:a.substr(l,2)},o=m,l+=2;break}case"M":case"D":case"Y":case"H":case"S":case"E":m=m.toLowerCase();case"m":case"d":case"y":case"h":case"s":case"e":case"g":if(0>b)return"";if(null==f&&(f=p(b,c),null==f))return"";for(k=m;++l<a.length&&a[l].toLowerCase()===m;)k+=m;"m"===m&&"h"===o.toLowerCase()&&(m="M"),"h"===m&&(m=r),i[i.length]={t:m,v:k},o=m;break;case"A":if(e={t:m,v:"A"},null==f&&(f=p(b,c)),"A/P"===a.substr(l,3)?(null!=f&&(e.v=f.H>=12?"P":"A"),e.t="T",r="h",l+=3):"AM/PM"===a.substr(l,5)?(null!=f&&(e.v=f.H>=12?"PM":"AM"),e.t="T",l+=5,r="h"):(e.t="t",++l),null==f&&"T"===e.t)return"";i[i.length]=e,o=m;break;case"[":for(k=m;"]"!==a[l++]&&l<a.length;)k+=a[l];if("]"!==k.substr(-1))throw'unterminated "[" block: |'+k+"|";if(k.match(E)){if(null==f&&(f=p(b,c),null==f))return"";i[i.length]={t:"Z",v:k.toLowerCase()}}else k="";break;case".":if(null!=f){for(k=m;"0"===(m=a[++l]);)k+=m;i[i.length]={t:"s",v:k};break}case"0":case"#":for(k=m;"0#?.,E+-%".indexOf(m=a[++l])>-1||"\\"==m&&"-"==a[l+1]&&"0#".indexOf(a[l+2])>-1;)k+=m;i[i.length]={t:"n",v:k};break;case"?":for(k=m;a[++l]===m;)k+=m;e={t:m,v:k},i[i.length]=e,o=m;break;case"*":++l,(" "==a[l]||"*"==a[l])&&++l;break;case"(":case")":i[i.length]={t:1===d?"t":m,v:m},++l;break;case"1":case"2":case"3":case"4":case"5":case"6":case"7":case"8":case"9":for(k=m;"0123456789".indexOf(a[++l])>-1;)k+=a[l];i[i.length]={t:"D",v:k};break;case" ":i[i.length]={t:m,v:m},++l;break;default:if(-1===",$-+/():!^&'~{}<>=€acfijklopqrtuvwxz".indexOf(m))throw new Error("unrecognized character "+m+" in "+a);
i[i.length]={t:"t",v:m},++l}var u,v=0,w=0;for(l=i.length-1,o="t";l>=0;--l)switch(i[l].t){case"h":case"H":i[l].t=r,o="h",1>v&&(v=1);break;case"s":(u=i[l].v.match(/\.0+$/))&&(w=Math.max(w,u[0].length-1)),3>v&&(v=3);case"d":case"y":case"M":case"e":o=i[l].t;break;case"m":"s"===o&&(i[l].t="M",2>v&&(v=2));break;case"X":"B2"===i[l].v;break;case"Z":1>v&&i[l].v.match(/[Hh]/)&&(v=1),2>v&&i[l].v.match(/[Mm]/)&&(v=2),3>v&&i[l].v.match(/[Ss]/)&&(v=3)}switch(v){case 0:break;case 1:f.u>=.5&&(f.u=0,++f.S),f.S>=60&&(f.S=0,++f.M),f.M>=60&&(f.M=0,++f.H);break;case 2:f.u>=.5&&(f.u=0,++f.S),f.S>=60&&(f.S=0,++f.M)}var x,y="";for(l=0;l<i.length;++l)switch(i[l].t){case"t":case"T":case" ":case"D":break;case"X":i[l]=void 0;break;case"d":case"m":case"y":case"h":case"H":case"M":case"s":case"e":case"b":case"Z":i[l].v=q(i[l].t.charCodeAt(0),i[l].v,f,w),i[l].t="t";break;case"n":case"(":case"?":for(x=l+1;null!=i[x]&&("?"===(m=i[x].t)||"D"===m||(" "===m||"t"===m)&&null!=i[x+1]&&("?"===i[x+1].t||"t"===i[x+1].t&&"/"===i[x+1].v)||"("===i[l].t&&(" "===m||"n"===m||")"===m)||"t"===m&&("/"===i[x].v||"$€".indexOf(i[x].v)>-1||" "===i[x].v&&null!=i[x+1]&&"?"==i[x+1].t));)i[l].v+=i[x].v,i[x]=void 0,++x;y+=i[l].v,l=x-1;break;case"G":i[l].t="t",i[l].v=n(b,c)}var z,A,B="";if(y.length>0){z=0>b&&45===y.charCodeAt(0)?-b:b,A=D(40===y.charCodeAt(0)?"(":"n",y,z),x=A.length-1;var C=i.length;for(l=0;l<i.length;++l)if(null!=i[l]&&i[l].v.indexOf(".")>-1){C=l;break}var F=i.length;if(C===i.length&&-1===A.indexOf("E")){for(l=i.length-1;l>=0;--l)null!=i[l]&&-1!=="n?(".indexOf(i[l].t)&&(x>=i[l].v.length-1?(x-=i[l].v.length,i[l].v=A.substr(x+1,i[l].v.length)):0>x?i[l].v="":(i[l].v=A.substr(0,x+1),x=-1),i[l].t="t",F=l);x>=0&&F<i.length&&(i[F].v=A.substr(0,x+1)+i[F].v)}else if(C!==i.length&&-1===A.indexOf("E")){for(x=A.indexOf(".")-1,l=C;l>=0;--l)if(null!=i[l]&&-1!=="n?(".indexOf(i[l].t)){for(g=i[l].v.indexOf(".")>-1&&l===C?i[l].v.indexOf(".")-1:i[l].v.length-1,B=i[l].v.substr(g+1);g>=0;--g)x>=0&&("0"===i[l].v[g]||"#"===i[l].v[g])&&(B=A[x--]+B);i[l].v=B,i[l].t="t",F=l}for(x>=0&&F<i.length&&(i[F].v=A.substr(0,x+1)+i[F].v),x=A.indexOf(".")+1,l=C;l<i.length;++l)if(null!=i[l]&&(-1!=="n?(".indexOf(i[l].t)||l===C)){for(g=i[l].v.indexOf(".")>-1&&l===C?i[l].v.indexOf(".")+1:0,B=i[l].v.substr(0,g);g<i[l].v.length;++g)x<A.length&&(B+=A[x++]);i[l].v=B,i[l].t="t",F=l}}}for(l=0;l<i.length;++l)null!=i[l]&&"n(?".indexOf(i[l].t)>-1&&(z=d>1&&0>b&&l>0&&"-"===i[l-1].v?-b:b,i[l].v=D(i[l].t,i[l].v,z),i[l].t="t");var G="";for(l=0;l!==i.length;++l)null!=i[l]&&(G+=i[l].v);return G}function u(a,b){if(null==b)return!1;var c=parseFloat(b[2]);switch(b[1]){case"=":if(a==c)return!0;break;case">":if(a>c)return!0;break;case"<":if(c>a)return!0;break;case"<>":if(a!=c)return!0;break;case">=":if(a>=c)return!0;break;case"<=":if(c>=a)return!0}return!1}function v(a,b){var c=s(a),d=c.length,e=c[d-1].indexOf("@");if(4>d&&e>-1&&--d,c.length>4)throw"cannot find right format for |"+c+"|";if("number"!=typeof b)return[4,4===c.length||e>-1?c[c.length-1]:"@"];switch(c.length){case 1:c=e>-1?["General","General","General",c[0]]:[c[0],c[0],c[0],"@"];break;case 2:c=e>-1?[c[0],c[0],c[0],c[1]]:[c[0],c[1],c[0],"@"];break;case 3:c=e>-1?[c[0],c[1],c[0],c[2]]:[c[0],c[1],c[2],"@"];break;case 4:}var f=b>0?c[0]:0>b?c[1]:c[2];if(-1===c[0].indexOf("[")&&-1===c[1].indexOf("["))return[d,f];if(null!=c[0].match(F)||null!=c[1].match(F)){var g=c[0].match(G),h=c[1].match(G);return u(b,g)?[d,c[0]]:u(b,h)?[d,c[1]]:[d,c[null!=g&&null!=h?2:1]]}return[d,f]}function w(a,b,c){k(null!=c?c:c=[]);var d="";switch(typeof a){case"string":d=a;break;case"number":d=(null!=c.table?c.table:z)[a]}if(j(d,0))return n(b,c);var e=v(d,b);if(j(e[1]))return n(b,c);if(b===!0)b="TRUE";else if(b===!1)b="FALSE";else if(""===b||null==b)return"";return t(e[1],b,c,e[0])}a.version="0.8.1";var x=Math.pow(2,32),y=[["date1904",0],["output",""],["WTF",!1]];a.opts=y;var z={0:"General",1:"0",2:"0.00",3:"#,##0",4:"#,##0.00",9:"0%",10:"0.00%",11:"0.00E+00",12:"# ?/?",13:"# ??/??",14:"m/d/yy",15:"d-mmm-yy",16:"d-mmm",17:"mmm-yy",18:"h:mm AM/PM",19:"h:mm:ss AM/PM",20:"h:mm",21:"h:mm:ss",22:"m/d/yy h:mm",37:"#,##0 ;(#,##0)",38:"#,##0 ;[Red](#,##0)",39:"#,##0.00;(#,##0.00)",40:"#,##0.00;[Red](#,##0.00)",45:"mm:ss",46:"[h]:mm:ss",47:"mmss.0",48:"##0.0E+0",49:"@",56:'"上午/下午 "hh"時"mm"分"ss"秒 "',65535:"General"},A=[["Sun","Sunday"],["Mon","Monday"],["Tue","Tuesday"],["Wed","Wednesday"],["Thu","Thursday"],["Fri","Friday"],["Sat","Saturday"]],B=[["J","Jan","January"],["F","Feb","February"],["M","Mar","March"],["A","Apr","April"],["M","May","May"],["J","Jun","June"],["J","Jul","July"],["A","Aug","August"],["S","Sep","September"],["O","Oct","October"],["N","Nov","November"],["D","Dec","December"]];a._general_int=m;var C=function(){function a(a){var b=0>a?12:11,c=d(a.toFixed(12));return c.length<=b?c:(c=a.toPrecision(10),c.length<=b?c:a.toExponential(5))}function b(a){var b=a.toFixed(11).replace(e,".$1");return b.length>(0>a?12:11)&&(b=a.toPrecision(6)),b}function c(a){for(var b=0;b!=a.length;++b)if(101===(32|a.charCodeAt(b)))return a.replace(g,".$1").replace(h,"E").replace("e","E").replace(i,"$10$2");return a}function d(a){return a.indexOf(".")>-1?a.replace(f,"").replace(e,".$1"):a}var e=/\.(\d*[1-9])0+$/,f=/\.0*$/,g=/\.(\d*[1-9])0+/,h=/\.0*[Ee]/,i=/(E[+-])(\d)$/;return function(e){var f,g=Math.floor(Math.log(Math.abs(e))*Math.LOG10E);return f=g>=-4&&-1>=g?e.toPrecision(10+g):Math.abs(g)<=9?a(e):10===g?e.toFixed(10).substr(0,12):b(e),d(c(f))}}();a._general_num=C,a._general=n,a.parse_date_code=p;var D=function(){function a(a,b,d){var e=b.replace(w,""),f=b.length-e.length;return D(a,e,d*Math.pow(10,2*f))+c("%",f)}function g(a,b,c){for(var d=b.length-1;44===b.charCodeAt(d-1);)--d;return D(a,b.substr(0,d),c/Math.pow(10,3*(b.length-d)))}function h(a,b){var c,d=a.indexOf("E")-a.indexOf(".")-1;if(a.match(/^#+0.0E\+0$/)){var e=a.indexOf(".");-1===e&&(e=a.indexOf("E"));var f=Math.floor(Math.log(Math.abs(b))*Math.LOG10E)%e;if(0>f&&(f+=e),c=(b/Math.pow(10,f)).toPrecision(d+1+(e+f)%e),-1===c.indexOf("e")){var g=Math.floor(Math.log(Math.abs(b))*Math.LOG10E);for(-1===c.indexOf(".")?c=c[0]+"."+c.substr(1)+"E+"+(g-c.length+f):c+="E+"+(g-f);"0."===c.substr(0,2);)c=c[0]+c.substr(2,e)+"."+c.substr(2+e),c=c.replace(/^0+([1-9])/,"$1").replace(/^0+\./,"0.");c=c.replace(/\+-/,"-")}c=c.replace(/^([+-]?)(\d*)\.(\d*)[Ee]/,function(a,b,c,d){return b+c+d.substr(0,(e+f)%e)+"."+d.substr(f)+"E"})}else c=b.toExponential(d);return a.match(/E\+00$/)&&c.match(/e[+-]\d$/)&&(c=c.substr(0,c.length-1)+"0"+c[c.length-1]),a.match(/E\-/)&&c.match(/e\+/)&&(c=c.replace(/e\+/,"e")),c.replace("e","E")}function j(a,b,f){var g=parseInt(a[4]),h=Math.round(b*g),i=Math.floor(h/g),j=h-i*g,k=g;return f+(0===i?"":""+i)+" "+(0===j?c(" ",a[1].length+1+a[4].length):e(j,a[1].length)+a[2]+"/"+a[3]+d(k,a[4].length))}function k(a,b,d){return d+(0===b?"":""+b)+c(" ",a[1].length+2+a[4].length)}function m(a){for(var b,c="",d=0;d!=a.length;++d)switch(b=a.charCodeAt(d)){case 35:break;case 63:c+=" ";break;case 48:c+="0";break;default:c+=String.fromCharCode(b)}return c}function n(a,b){var c=Math.pow(10,b);return""+Math.round(a*c)/c}function o(a,b){return Math.round((a-Math.floor(a))*Math.pow(10,b))}function p(a){return 2147483647>a&&a>-2147483648?""+(a>=0?0|a:a-1|0):""+Math.floor(a)}function q(k,s,t){if(40===k.charCodeAt(0)&&!s.match(z)){var u=s.replace(/\( */,"").replace(/ \)/,"").replace(/\)/,"");return t>=0?q("n",u,t):"("+q("n",u,-t)+")"}if(44===s.charCodeAt(s.length-1))return g(k,s,t);if(-1!==s.indexOf("%"))return a(k,s,t);if(-1!==s.indexOf("E"))return h(s,t);if(36===s.charCodeAt(0))return"$"+q(k,s.substr(" "==s[1]?2:1),t);var v,w,B,C,E=Math.abs(t),F=0>t?"-":"";if(s.match(/^00+$/))return F+i(E,s.length);if(s.match(/^[#?]+$/))return v=i(t,0),"0"===v&&(v=""),v.length>s.length?v:m(s.substr(0,s.length-v.length))+v;if(null!==(w=s.match(x)))return j(w,E,F);if(null!==s.match(/^#+0+$/))return F+i(E,s.length-s.indexOf("0"));if(null!==(w=s.match(y)))return v=n(t,w[1].length).replace(/^([^\.]+)$/,"$1."+w[1]).replace(/\.$/,"."+w[1]).replace(/\.(\d*)$/,function(a,b){return"."+b+c("0",w[1].length-b.length)}),-1!==s.indexOf("0.")?v:v.replace(/^0\./,".");if(s=s.replace(/^#+([0.])/,"$1"),null!==(w=s.match(/^(0*)\.(#*)$/)))return F+n(E,w[2].length).replace(/\.(\d*[1-9])0*$/,".$1").replace(/^(-?\d*)$/,"$1.").replace(/^0\./,w[1].length?"0.":".");if(null!==(w=s.match(/^#,##0(\.?)$/)))return F+r(i(E,0));if(null!==(w=s.match(/^#,##0\.([#0]*0)$/)))return 0>t?"-"+q(k,s,-t):r(""+Math.floor(t))+"."+d(o(t,w[1].length),w[1].length);if(null!==(w=s.match(/^#,#*,#0/)))return q(k,s.replace(/^#,#*,/,""),t);if(null!==(w=s.match(/^([0#]+)(\\?-([0#]+))+$/)))return v=b(q(k,s.replace(/[\\-]/g,""),t)),B=0,b(b(s.replace(/\\/g,"")).replace(/[0#]/g,function(a){return B<v.length?v[B++]:"0"===a?"0":""}));if(null!==s.match(A))return v=q(k,"##########",t),"("+v.substr(0,3)+") "+v.substr(3,3)+"-"+v.substr(6);var G="";if(null!==(w=s.match(/^([#0?]+)( ?)\/( ?)([#0?]+)/)))return B=Math.min(w[4].length,7),C=l(E,Math.pow(10,B)-1,!1),v=""+F,G=D("n",w[1],C[1])," "==G[G.length-1]&&(G=G.substr(0,G.length-1)+"0"),v+=G+w[2]+"/"+w[3],G=f(C[2],B),G.length<w[4].length&&(G=m(w[4].substr(w[4].length-G.length))+G),v+=G;if(null!==(w=s.match(/^# ([#0?]+)( ?)\/( ?)([#0?]+)/)))return B=Math.min(Math.max(w[1].length,w[4].length),7),C=l(E,Math.pow(10,B)-1,!0),F+(C[0]||(C[1]?"":"0"))+" "+(C[1]?e(C[1],B)+w[2]+"/"+w[3]+f(C[2],B):c(" ",2*B+1+w[2].length+w[3].length));if(null!==(w=s.match(/^[#0?]+$/)))return v=i(t,0),s.length<=v.length?v:m(s.substr(0,s.length-v.length))+v;if(null!==(w=s.match(/^([#0?]+)\.([#0]+)$/))){v=""+t.toFixed(Math.min(w[2].length,10)).replace(/([^0])0+$/,"$1"),B=v.indexOf(".");var H=s.indexOf(".")-B,I=s.length-v.length-H;return m(s.substr(0,H)+v+s.substr(s.length-I))}if(null!==(w=s.match(/^00,000\.([#0]*0)$/)))return B=o(t,w[1].length),0>t?"-"+q(k,s,-t):r(p(t)).replace(/^\d,\d{3}$/,"0$&").replace(/^\d*$/,function(a){return"00,"+(a.length<3?d(0,3-a.length):"")+a})+"."+d(B,w[1].length);switch(s){case"#,###":var J=r(i(E,0));return"0"!==J?F+J:""}throw new Error("unsupported format |"+s+"|")}function s(a,b,c){for(var d=b.length-1;44===b.charCodeAt(d-1);)--d;return D(a,b.substr(0,d),c/Math.pow(10,3*(b.length-d)))}function t(a,b,d){var e=b.replace(w,""),f=b.length-e.length;return D(a,e,d*Math.pow(10,2*f))+c("%",f)}function u(a,b){var c,d=a.indexOf("E")-a.indexOf(".")-1;if(a.match(/^#+0.0E\+0$/)){var e=a.indexOf(".");-1===e&&(e=a.indexOf("E"));var f=Math.floor(Math.log(Math.abs(b))*Math.LOG10E)%e;if(0>f&&(f+=e),c=(b/Math.pow(10,f)).toPrecision(d+1+(e+f)%e),!c.match(/[Ee]/)){var g=Math.floor(Math.log(Math.abs(b))*Math.LOG10E);-1===c.indexOf(".")?c=c[0]+"."+c.substr(1)+"E+"+(g-c.length+f):c+="E+"+(g-f),c=c.replace(/\+-/,"-")}c=c.replace(/^([+-]?)(\d*)\.(\d*)[Ee]/,function(a,b,c,d){return b+c+d.substr(0,(e+f)%e)+"."+d.substr(f)+"E"})}else c=b.toExponential(d);return a.match(/E\+00$/)&&c.match(/e[+-]\d$/)&&(c=c.substr(0,c.length-1)+"0"+c[c.length-1]),a.match(/E\-/)&&c.match(/e\+/)&&(c=c.replace(/e\+/,"e")),c.replace("e","E")}function v(a,g,h){if(40===a.charCodeAt(0)&&!g.match(z)){var i=g.replace(/\( */,"").replace(/ \)/,"").replace(/\)/,"");return h>=0?v("n",i,h):"("+v("n",i,-h)+")"}if(44===g.charCodeAt(g.length-1))return s(a,g,h);if(-1!==g.indexOf("%"))return t(a,g,h);if(-1!==g.indexOf("E"))return u(g,h);if(36===g.charCodeAt(0))return"$"+v(a,g.substr(" "==g[1]?2:1),h);var j,n,o,p,q=Math.abs(h),w=0>h?"-":"";if(g.match(/^00+$/))return w+d(q,g.length);if(g.match(/^[#?]+$/))return j=""+h,0===h&&(j=""),j.length>g.length?j:m(g.substr(0,g.length-j.length))+j;if(null!==(n=g.match(x)))return k(n,q,w);if(null!==g.match(/^#+0+$/))return w+d(q,g.length-g.indexOf("0"));if(null!==(n=g.match(y)))return j=(""+h).replace(/^([^\.]+)$/,"$1."+n[1]).replace(/\.$/,"."+n[1]).replace(/\.(\d*)$/,function(a,b){return"."+b+c("0",n[1].length-b.length)}),-1!==g.indexOf("0.")?j:j.replace(/^0\./,".");if(g=g.replace(/^#+([0.])/,"$1"),null!==(n=g.match(/^(0*)\.(#*)$/)))return w+(""+q).replace(/\.(\d*[1-9])0*$/,".$1").replace(/^(-?\d*)$/,"$1.").replace(/^0\./,n[1].length?"0.":".");if(null!==(n=g.match(/^#,##0(\.?)$/)))return w+r(""+q);if(null!==(n=g.match(/^#,##0\.([#0]*0)$/)))return 0>h?"-"+v(a,g,-h):r(""+h)+"."+c("0",n[1].length);if(null!==(n=g.match(/^#,#*,#0/)))return v(a,g.replace(/^#,#*,/,""),h);if(null!==(n=g.match(/^([0#]+)(\\?-([0#]+))+$/)))return j=b(v(a,g.replace(/[\\-]/g,""),h)),o=0,b(b(g.replace(/\\/g,"")).replace(/[0#]/g,function(a){return o<j.length?j[o++]:"0"===a?"0":""}));if(null!==g.match(A))return j=v(a,"##########",h),"("+j.substr(0,3)+") "+j.substr(3,3)+"-"+j.substr(6);var B="";if(null!==(n=g.match(/^([#0?]+)( ?)\/( ?)([#0?]+)/)))return o=Math.min(n[4].length,7),p=l(q,Math.pow(10,o)-1,!1),j=""+w,B=D("n",n[1],p[1])," "==B[B.length-1]&&(B=B.substr(0,B.length-1)+"0"),j+=B+n[2]+"/"+n[3],B=f(p[2],o),B.length<n[4].length&&(B=m(n[4].substr(n[4].length-B.length))+B),j+=B;if(null!==(n=g.match(/^# ([#0?]+)( ?)\/( ?)([#0?]+)/)))return o=Math.min(Math.max(n[1].length,n[4].length),7),p=l(q,Math.pow(10,o)-1,!0),w+(p[0]||(p[1]?"":"0"))+" "+(p[1]?e(p[1],o)+n[2]+"/"+n[3]+f(p[2],o):c(" ",2*o+1+n[2].length+n[3].length));if(null!==(n=g.match(/^[#0?]+$/)))return j=""+h,g.length<=j.length?j:m(g.substr(0,g.length-j.length))+j;if(null!==(n=g.match(/^([#0]+)\.([#0]+)$/))){j=""+h.toFixed(Math.min(n[2].length,10)).replace(/([^0])0+$/,"$1"),o=j.indexOf(".");var C=g.indexOf(".")-o,E=g.length-j.length-C;return m(g.substr(0,C)+j+g.substr(g.length-E))}if(null!==(n=g.match(/^00,000\.([#0]*0)$/)))return 0>h?"-"+v(a,g,-h):r(""+h).replace(/^\d,\d{3}$/,"0$&").replace(/^\d*$/,function(a){return"00,"+(a.length<3?d(0,3-a.length):"")+a})+"."+d(0,n[1].length);switch(g){case"#,###":var F=r(""+q);return"0"!==F?w+F:""}throw new Error("unsupported format |"+g+"|")}var w=/%/g,x=/# (\?+)( ?)\/( ?)(\d+)/,y=/^#*0*\.(0+)/,z=/\).*[0#]/,A=/\(###\) ###\\?-####/;return function(a,b,c){return(0|c)===c?v(a,b,c):q(a,b,c)}}();a._split=s;var E=/\[[HhMmSs]*\]/;a._eval=t;var F=/\[[=<>]/,G=/\[([=<>]*)(-?\d+\.?\d*)\]/;a._table=z,a.load=function(a,b){z[b]=a},a.format=w,a.get_table=function(){return z},a.load_table=function(b){for(var c=0;392!=c;++c)void 0!==b[c]&&a.load(b[c],c)}};Hd(Gd);var Id,Jd,Kd="undefined"!=typeof Buffer;"undefined"!=typeof JSZip&&(Jd=JSZip),"undefined"!=typeof exports&&"undefined"!=typeof module&&module.exports&&(Kd&&"undefined"==typeof Jd&&(Jd=require("jszip")),"undefined"==typeof Jd&&(Jd=require("./jszip").JSZip),Id=require("fs"));var Ld=/\b[\w:]+=["'][^"]*['"]/g,Md=/<[^>]*>/g,Nd=/<\w*:/,Od=/<(\/?)\w+:/,Pd={"&quot;":'"',"&apos;":"'","&gt;":">","&lt;":"<","&amp;":"&"},Qd=g(Pd),Rd=("&<>'\"".split(""),/&[a-z]*;/g),Sd=/_x([\da-fA-F]+)_/g,Td=/[&<>'"]/g,Ud=/[\u0000-\u0008\u000b-\u001f]/g,Vd=function(a){for(var b="",c=0,d=0,e=0,f=0,g=0,h=0;c<a.length;)d=a.charCodeAt(c++),128>d?b+=String.fromCharCode(d):(e=a.charCodeAt(c++),d>191&&224>d?b+=String.fromCharCode((31&d)<<6|63&e):(f=a.charCodeAt(c++),240>d?b+=String.fromCharCode((15&d)<<12|(63&e)<<6|63&f):(g=a.charCodeAt(c++),h=((7&d)<<18|(63&e)<<12|(63&f)<<6|63&g)-65536,b+=String.fromCharCode(55296+(h>>>10&1023)),b+=String.fromCharCode(56320+(1023&h)))));return b};if(Kd){var Wd=function(a){var b,c,d,e=new Buffer(2*a.length),f=1,g=0,h=0;for(c=0;c<a.length;c+=f)f=1,(d=a.charCodeAt(c))<128?b=d:224>d?(b=64*(31&d)+(63&a.charCodeAt(c+1)),f=2):240>d?(b=4096*(15&d)+64*(63&a.charCodeAt(c+1))+(63&a.charCodeAt(c+2)),f=3):(f=4,b=262144*(7&d)+4096*(63&a.charCodeAt(c+1))+64*(63&a.charCodeAt(c+2))+(63&a.charCodeAt(c+3)),b-=65536,h=55296+(b>>>10&1023),b=56320+(1023&b)),0!==h&&(e[g++]=255&h,e[g++]=h>>>8,h=0),e[g++]=b%256,e[g++]=b>>>8;return e.length=g,e.toString("ucs2")},Xd="foo bar bazâð£";Vd(Xd)==Wd(Xd)&&(Vd=Wd);var Yd=function(a){return Buffer(a,"binary").toString("utf8")};Vd(Xd)==Yd(Xd)&&(Vd=Yd)}var Zd=function(){var a={};return function(b,c){var d=b+"|"+c;return void 0!==a[d]?a[d]:a[d]=new RegExp("<(?:\\w+:)?"+b+'(?: xml:space="preserve")?(?:[^>]*)>([^☃]*)</(?:\\w+:)?'+b+">",c||"")}}(),$d=function(){var a={};return function(b){return void 0!==a[b]?a[b]:a[b]=new RegExp("<vt:"+b+">(.*?)</vt:"+b+">","g")}}(),_d=/<\/?vt:variant>/g,ae=/<vt:([^>]*)>(.*)</,be=/(^\s|\s$|\n)/,ce='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n',de={dc:"http://purl.org/dc/elements/1.1/",dcterms:"http://purl.org/dc/terms/",dcmitype:"http://purl.org/dc/dcmitype/",mx:"http://schemas.microsoft.com/office/mac/excel/2008/main",r:"http://schemas.openxmlformats.org/officeDocument/2006/relationships",sjs:"http://schemas.openxmlformats.org/package/2006/sheetjs/core-properties",vt:"http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes",xsi:"http://www.w3.org/2001/XMLSchema-instance",xsd:"http://www.w3.org/2001/XMLSchema"};de.main=["http://schemas.openxmlformats.org/spreadsheetml/2006/main","http://purl.oclc.org/ooxml/spreadsheetml/main","http://schemas.microsoft.com/office/excel/2006/main","http://schemas.microsoft.com/office/excel/2006/2"];var ee,fe;ee=fe=function(a){for(var b=[],c=0;c<a[0].length;++c)b.push.apply(b,a[0][c]);return b};var ge,he;ge=he=function(a,b){return z(a,b)};var ie=function(a){return Array.isArray(a)};Kd&&(ee=function(a){return a[0].length>0&&Buffer.isBuffer(a[0][0])?Buffer.concat(a[0]):fe(a)},ge=function(a,b){return Buffer.isBuffer(a)?a.readDoubleLE(b):he(a,b)},ie=function(a){return Buffer.isBuffer(a)||Array.isArray(a)});var je=function(a,b){return a[b]},ke=function(a,b){return 256*a[b+1]+a[b]},le=function(a,b){var c=256*a[b+1]+a[b];return 32768>c?c:-1*(65535-c+1)},me=function(a,b){return a[b+3]*(1<<24)+(a[b+2]<<16)+(a[b+1]<<8)+a[b]},ne=function(a,b){return a[b+3]<<24|a[b+2]<<16|a[b+1]<<8|a[b]},oe=O,pe=P,qe={0:"#NULL!",7:"#DIV/0!",15:"#VALUE!",23:"#REF!",29:"#NAME?",36:"#NUM!",42:"#N/A",43:"#GETTING_DATA",255:"#WTF?"},re=h(qe),se={"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml":"workbooks","application/vnd.ms-excel.binIndexWs":"TODO","application/vnd.ms-excel.chartsheet":"TODO","application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml":"TODO","application/vnd.ms-excel.dialogsheet":"TODO","application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml":"TODO","application/vnd.ms-excel.macrosheet":"TODO","application/vnd.ms-excel.macrosheet+xml":"TODO","application/vnd.ms-excel.intlmacrosheet":"TODO","application/vnd.ms-excel.binIndexMs":"TODO","application/vnd.openxmlformats-package.core-properties+xml":"coreprops","application/vnd.openxmlformats-officedocument.custom-properties+xml":"custprops","application/vnd.openxmlformats-officedocument.extended-properties+xml":"extprops","application/vnd.openxmlformats-officedocument.customXmlProperties+xml":"TODO","application/vnd.ms-excel.comments":"comments","application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml":"comments","application/vnd.ms-excel.pivotTable":"TODO","application/vnd.openxmlformats-officedocument.spreadsheetml.pivotTable+xml":"TODO","application/vnd.ms-excel.calcChain":"calcchains","application/vnd.openxmlformats-officedocument.spreadsheetml.calcChain+xml":"calcchains","application/vnd.openxmlformats-officedocument.spreadsheetml.printerSettings":"TODO","application/vnd.ms-office.activeX":"TODO","application/vnd.ms-office.activeX+xml":"TODO","application/vnd.ms-excel.attachedToolbars":"TODO","application/vnd.ms-excel.connections":"TODO","application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml":"TODO","application/vnd.ms-excel.externalLink":"TODO","application/vnd.openxmlformats-officedocument.spreadsheetml.externalLink+xml":"TODO","application/vnd.ms-excel.sheetMetadata":"TODO","application/vnd.openxmlformats-officedocument.spreadsheetml.sheetMetadata+xml":"TODO","application/vnd.ms-excel.pivotCacheDefinition":"TODO","application/vnd.ms-excel.pivotCacheRecords":"TODO","application/vnd.openxmlformats-officedocument.spreadsheetml.pivotCacheDefinition+xml":"TODO","application/vnd.openxmlformats-officedocument.spreadsheetml.pivotCacheRecords+xml":"TODO","application/vnd.ms-excel.queryTable":"TODO","application/vnd.openxmlformats-officedocument.spreadsheetml.queryTable+xml":"TODO","application/vnd.ms-excel.userNames":"TODO","application/vnd.ms-excel.revisionHeaders":"TODO","application/vnd.ms-excel.revisionLog":"TODO","application/vnd.openxmlformats-officedocument.spreadsheetml.revisionHeaders+xml":"TODO","application/vnd.openxmlformats-officedocument.spreadsheetml.revisionLog+xml":"TODO","application/vnd.openxmlformats-officedocument.spreadsheetml.userNames+xml":"TODO","application/vnd.ms-excel.tableSingleCells":"TODO","application/vnd.openxmlformats-officedocument.spreadsheetml.tableSingleCells+xml":"TODO","application/vnd.ms-excel.slicer":"TODO","application/vnd.ms-excel.slicerCache":"TODO","application/vnd.ms-excel.slicer+xml":"TODO","application/vnd.ms-excel.slicerCache+xml":"TODO","application/vnd.ms-excel.wsSortMap":"TODO","application/vnd.ms-excel.table":"TODO","application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml":"TODO","application/vnd.openxmlformats-officedocument.theme+xml":"themes","application/vnd.ms-excel.Timeline+xml":"TODO","application/vnd.ms-excel.TimelineCache+xml":"TODO","application/vnd.ms-office.vbaProject":"vba","application/vnd.ms-office.vbaProjectSignature":"vba","application/vnd.ms-office.volatileDependencies":"TODO","application/vnd.openxmlformats-officedocument.spreadsheetml.volatileDependencies+xml":"TODO","application/vnd.ms-excel.controlproperties+xml":"TODO","application/vnd.openxmlformats-officedocument.model+data":"TODO","application/vnd.ms-excel.Survey+xml":"TODO","application/vnd.openxmlformats-officedocument.drawing+xml":"TODO","application/vnd.openxmlformats-officedocument.drawingml.chart+xml":"TODO","application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml":"TODO","application/vnd.openxmlformats-officedocument.drawingml.diagramColors+xml":"TODO","application/vnd.openxmlformats-officedocument.drawingml.diagramData+xml":"TODO","application/vnd.openxmlformats-officedocument.drawingml.diagramLayout+xml":"TODO","application/vnd.openxmlformats-officedocument.drawingml.diagramStyle+xml":"TODO","application/vnd.openxmlformats-officedocument.vmlDrawing":"TODO","application/vnd.openxmlformats-package.relationships+xml":"rels","application/vnd.openxmlformats-officedocument.oleObject":"TODO",sheet:"js"},te=function(){var a={workbooks:{xlsx:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml",xlsm:"application/vnd.ms-excel.sheet.macroEnabled.main+xml",xlsb:"application/vnd.ms-excel.sheet.binary.macroEnabled.main",xltx:"application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml"},strs:{xlsx:"application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml",xlsb:"application/vnd.ms-excel.sharedStrings"},sheets:{xlsx:"application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml",xlsb:"application/vnd.ms-excel.worksheet"},styles:{xlsx:"application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml",xlsb:"application/vnd.ms-excel.styles"}};return e(a).forEach(function(b){a[b].xlsm||(a[b].xlsm=a[b].xlsx)}),e(a).forEach(function(b){e(a[b]).forEach(function(c){se[a[b][c]]=b})}),a}(),ue=i(se);de.CT="http://schemas.openxmlformats.org/package/2006/content-types";var ve=w("Types",null,{xmlns:de.CT,"xmlns:xsd":de.xsd,"xmlns:xsi":de.xsi}),we=[["xml","application/xml"],["bin","application/vnd.ms-excel.sheet.binary.macroEnabled.main"],["rels",ue.rels[0]]].map(function(a){return w("Default",null,{Extension:a[0],ContentType:a[1]})}),xe={WB:"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument",SHEET:"http://sheetjs.openxmlformats.org/officeDocument/2006/relationships/officeDocument"};de.RELS="http://schemas.openxmlformats.org/package/2006/relationships";var ye=w("Relationships",null,{xmlns:de.RELS}),ze=[["cp:category","Category"],["cp:contentStatus","ContentStatus"],["cp:keywords","Keywords"],["cp:lastModifiedBy","LastAuthor"],["cp:lastPrinted","LastPrinted"],["cp:revision","RevNumber"],["cp:version","Version"],["dc:creator","Author"],["dc:description","Comments"],["dc:identifier","Identifier"],["dc:language","Language"],["dc:subject","Subject"],["dc:title","Title"],["dcterms:created","CreatedDate","date"],["dcterms:modified","ModifiedDate","date"]];de.CORE_PROPS="http://schemas.openxmlformats.org/package/2006/metadata/core-properties",xe.CORE_PROPS="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties";var Ae=function(){for(var a=new Array(ze.length),b=0;b<ze.length;++b){var c=ze[b],d="(?:"+c[0].substr(0,c[0].indexOf(":"))+":)"+c[0].substr(c[0].indexOf(":")+1);a[b]=new RegExp("<"+d+"[^>]*>(.*)</"+d+">")}return a}(),Be=w("cp:coreProperties",null,{"xmlns:cp":de.CORE_PROPS,"xmlns:dc":de.dc,"xmlns:dcterms":de.dcterms,"xmlns:dcmitype":de.dcmitype,"xmlns:xsi":de.xsi}),Ce=[["Application","Application","string"],["AppVersion","AppVersion","string"],["Company","Company","string"],["DocSecurity","DocSecurity","string"],["Manager","Manager","string"],["HyperlinksChanged","HyperlinksChanged","bool"],["SharedDoc","SharedDoc","bool"],["LinksUpToDate","LinksUpToDate","bool"],["ScaleCrop","ScaleCrop","bool"],["HeadingPairs","HeadingPairs","raw"],["TitlesOfParts","TitlesOfParts","raw"]];de.EXT_PROPS="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties",xe.EXT_PROPS="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties";var De=w("Properties",null,{xmlns:de.EXT_PROPS,"xmlns:vt":de.vt});de.CUST_PROPS="http://schemas.openxmlformats.org/officeDocument/2006/custom-properties",xe.CUST_PROPS="http://schemas.openxmlformats.org/officeDocument/2006/relationships/custom-properties";var Ee=/<[^>]+>[^<]*/g,Fe=w("Properties",null,{xmlns:de.CUST_PROPS,"xmlns:vt":de.vt}),Ge={0:1252,1:65001,2:65001,77:1e4,128:932,129:949,130:1361,134:936,136:950,161:1253,162:1254,163:1258,177:1255,178:1256,186:1257,204:1251,222:874,238:1250,255:1252,69:6969},He=function(){function a(a){var e=[[],"",[]],f=a.match(b),i=65001;if(!d(f))return"";e[1]=f[1];var j=a.match(c);return d(j)&&(i=h(j[1],e[0],e[2])),e[0].join("")+e[1].replace(g,"<br/>")+e[2].join("")}var b=Zd("t"),c=Zd("rPr"),e=/<r>/g,f=/<\/r>/,g=/\r\n/g,h=function(a,b,c){var d={},e=65001,f=a.match(Md),g=0;if(f)for(;g!=f.length;++g){var h=o(f[g]);switch(h[0]){case"<condense":break;case"<extend":break;case"<shadow":case"<shadow/>":break;case"<charset":if("1"==h.val)break;e=Ge[parseInt(h.val,10)];break;case"<outline":case"<outline/>":break;case"<rFont":d.name=h.val;break;case"<sz":d.sz=h.val;break;case"<strike":if(!h.val)break;case"<strike/>":d.strike=1;break;case"</strike>":break;case"<u":if(!h.val)break;case"<u/>":d.u=1;break;case"</u>":break;case"<b":if(!h.val)break;case"<b/>":d.b=1;break;case"</b>":break;case"<i":if(!h.val)break;case"<i/>":d.i=1;break;case"</i>":break;case"<color":h.rgb&&(d.color=h.rgb.substr(2,6));break;case"<family":d.family=h.val;break;case"<vertAlign":break;case"<scheme":break;default:if(47!==h[0].charCodeAt(1))throw"Unrecognized rich format "+h[0]}}var i=[];return d.b&&i.push("font-weight: bold;"),d.i&&i.push("font-style: italic;"),b.push('<span style="'+i.join("")+'">'),c.push("</span>"),e};return function(b){return b.replace(e,"").split(f).map(a).join("")}}(),Ie=/<t[^>]*>([^<]*)<\/t>/g,Je=/<r>/,Ke=/<sst([^>]*)>([\s\S]*)<\/sst>/,Le=/<(?:si|sstItem)>/g,Me=/<\/(?:si|sstItem)>/;xe.SST="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings";var Ne=/^\s|\s$|[\t\n\r]/,Oe=K,Pe=7,Qe=15,Re=1,Se=Pe,Te={},Ue={},Ve=function(){var a=/<numFmts([^>]*)>.*<\/numFmts>/,b=/<cellXfs([^>]*)>.*<\/cellXfs>/,c=/<fills([^>]*)>.*<\/fills>/;return function(d,e){var f;return(f=d.match(a))&&Ab(f,e),(f=d.match(c))&&zb(f,e),(f=d.match(b))&&Cb(f,e),Te}}(),We=w("styleSheet",null,{xmlns:de.main[0],"xmlns:vt":de.vt});xe.STY="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles",xe.THEME="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme";var Xe=/<a:clrScheme([^>]*)>.*<\/a:clrScheme>/,Ye=Q,Ze=J,$e={},_e={};xe.WS="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet";var af=/<mergeCell ref="[A-Z0-9:]+"\s*\/>/g,bf=/<(?:\w+:)?sheetData>([^\u2603]*)<\/(?:\w+:)?sheetData>/,cf=/<hyperlink[^>]*\/>/g,df=/"(\w*:\w*)"/,ef=/<col[^>]*\/>/g,ff=function(){var a=/<(?:\w+:)?c /,b=/<\/(?:\w+:)?row>/,c=/r=["']([^"']*)["']/,d=/<is>([\S\s]*?)<\/is>/,e=Zd("v"),f=Zd("f");return function(g,h,i,k){for(var l,m,n,p,r=0,t="",u=[],v=[],w=0,x=0,y=0,z="",A=0,B=0,C=Array.isArray(Te.CellXf),D=g.split(b),E=0,F=D.length;E!=F;++E){t=D[E].trim();var G=t.length;if(0!==G){for(r=0;G>r&&62!==t.charCodeAt(r);++r);++r,m=o(t.substr(0,r),!0);var H=parseInt(m.r,10);if(!(i.sheetRows&&i.sheetRows<H))for(k.s.r>H-1&&(k.s.r=H-1),k.e.r<H-1&&(k.e.r=H-1),u=t.substr(r).split(a),r=1,cellen=u.length;r!=cellen;++r)if(t=u[r].trim(),0!==t.length){if(v=t.match(c),w=r,x=0,y=0,t="<c "+t,null!==v&&2===v.length){for(w=0,z=v[1],x=0;x!=z.length&&!((y=z.charCodeAt(x)-64)<1||y>26);++x)w=26*w+y;--w}for(x=0;x!=t.length&&62!==t.charCodeAt(x);++x);if(++x,m=o(t.substr(0,x),!0),z=t.substr(x),l={t:""},null!==(v=z.match(e))&&""!==v[1]&&(l.v=q(v[1])),i.cellFormula&&null!==(v=z.match(f))&&(l.f=q(v[1])),void 0===m.t&&void 0===l.v){if(!i.sheetStubs)continue;l.t="str"}else l.t=m.t||"n";switch(k.s.c>w&&(k.s.c=w),k.e.c<w&&(k.e.c=w),l.t){case"n":l.v=parseFloat(l.v);break;case"s":n=$e[parseInt(l.v,10)],l.v=n.t,l.r=n.r,i.cellHTML&&(l.h=n.h);break;case"str":l.v=null!=l.v?Vd(l.v):"";break;case"inlineStr":v=z.match(d),l.t="str",null!==v?(n=ib(v[1]),l.v=n.t):l.v="";break;case"b":l.v=s(l.v);break;case"d":l.v=j(l.v),l.t="n";break;case"e":l.raw=re[l.v]}A=B=0,C&&void 0!==m.s&&(p=Te.CellXf[m.s],null!=p&&(null!=p.numFmtId&&(A=p.numFmtId),i.cellStyles&&null!=p.fillId&&(B=p.fillId))),Yb(l,A,B,i),h[m.r]=l}}}}}(),gf=w("worksheet",null,{xmlns:de.main[0],"xmlns:r":de.r}),hf=T,jf=U,kf=T,lf=[["allowRefreshQuery","0"],["autoCompressPictures","1"],["backupFile","0"],["checkCompatibility","0"],["codeName",""],["date1904","0"],["dateCompatibility","1"],["filterPrivacy","0"],["hidePivotFieldList","0"],["promptedSolutions","0"],["publishItems","0"],["refreshAllConnections",!1],["saveExternalLinkValues","1"],["showBorderUnselectedTables","1"],["showInkAnnotation","1"],["showObjects","all"],["showPivotChartFilter","0"]],mf=[["activeTab","0"],["autoFilterDateGrouping","1"],["firstSheet","0"],["minimized","0"],["showHorizontalScroll","1"],["showSheetTabs","1"],["showVerticalScroll","1"],["tabRatio","600"],["visibility","visible"]],nf=[["state","visible"]],of=[["calcCompleted","true"],["calcMode","auto"],["calcOnSave","true"],["concurrentCalc","true"],["fullCalcOnLoad","false"],["fullPrecision","true"],["iterate","false"],["iterateCount","100"],["iterateDelta","0.001"],["refMode","A1"]],pf=/<\w+:workbook/,qf=w("workbook",null,{xmlns:de.main[0],"xmlns:r":de.r}),rf={0:{n:"BrtRowHdr",f:gc},1:{n:"BrtCellBlank",f:ic},2:{n:"BrtCellRk",f:oc},3:{n:"BrtCellError",f:lc},4:{n:"BrtCellBool",f:kc},5:{n:"BrtCellReal",f:nc},6:{n:"BrtCellSt",f:pc},7:{n:"BrtCellIsst",f:mc},8:{n:"BrtFmlaString",f:tc},9:{n:"BrtFmlaNum",f:sc},10:{n:"BrtFmlaBool",f:qc},11:{n:"BrtFmlaError",f:rc},16:{n:"BrtFRTArchID$",f:Jc},19:{n:"BrtSSTItem",f:J},20:{n:"BrtPCDIMissing",f:D},21:{n:"BrtPCDINumber",f:D},22:{n:"BrtPCDIBoolean",f:D},23:{n:"BrtPCDIError",f:D},24:{n:"BrtPCDIString",f:D},25:{n:"BrtPCDIDatetime",f:D},26:{n:"BrtPCDIIndex",f:D},27:{n:"BrtPCDIAMissing",f:D},28:{n:"BrtPCDIANumber",f:D},29:{n:"BrtPCDIABoolean",f:D},30:{n:"BrtPCDIAError",f:D},31:{n:"BrtPCDIAString",f:D},32:{n:"BrtPCDIADatetime",f:D},33:{n:"BrtPCRRecord",f:D},34:{n:"BrtPCRRecordDt",f:D},35:{n:"BrtFRTBegin",f:D},36:{n:"BrtFRTEnd",f:D},37:{n:"BrtACBegin",f:D},38:{n:"BrtACEnd",f:D},39:{n:"BrtName",f:D},40:{n:"BrtIndexRowBlock",f:D},42:{n:"BrtIndexBlock",f:D},43:{n:"BrtFont",f:Gb},44:{n:"BrtFmt",f:Fb},45:{n:"BrtFill",f:D},46:{n:"BrtBorder",f:D},47:{n:"BrtXF",f:Hb},48:{n:"BrtStyle",f:D},49:{n:"BrtCellMeta",f:D},50:{n:"BrtValueMeta",f:D},51:{n:"BrtMdb",f:D},52:{n:"BrtBeginFmd",f:D},53:{n:"BrtEndFmd",f:D},54:{n:"BrtBeginMdx",f:D},55:{n:"BrtEndMdx",f:D},56:{n:"BrtBeginMdxTuple",f:D},57:{n:"BrtEndMdxTuple",f:D},58:{n:"BrtMdxMbrIstr",f:D},59:{n:"BrtStr",f:D},60:{n:"BrtColInfo",f:D},62:{n:"BrtCellRString",f:D},63:{n:"BrtCalcChainItem$",f:Ob},64:{n:"BrtDVal",f:D},65:{n:"BrtSxvcellNum",f:D},66:{n:"BrtSxvcellStr",f:D},67:{n:"BrtSxvcellBool",f:D},68:{n:"BrtSxvcellErr",f:D},69:{n:"BrtSxvcellDate",f:D},70:{n:"BrtSxvcellNil",f:D},128:{n:"BrtFileVersion",f:D},129:{n:"BrtBeginSheet",f:D},130:{n:"BrtEndSheet",f:D},131:{n:"BrtBeginBook",f:D,p:0},132:{n:"BrtEndBook",f:D},133:{n:"BrtBeginWsViews",f:D},134:{n:"BrtEndWsViews",f:D},135:{n:"BrtBeginBookViews",f:D},136:{n:"BrtEndBookViews",f:D},137:{n:"BrtBeginWsView",f:D},138:{n:"BrtEndWsView",f:D},139:{n:"BrtBeginCsViews",f:D},140:{n:"BrtEndCsViews",f:D},141:{n:"BrtBeginCsView",f:D},142:{n:"BrtEndCsView",f:D},143:{n:"BrtBeginBundleShs",f:D},144:{n:"BrtEndBundleShs",f:D},145:{n:"BrtBeginSheetData",f:D},146:{n:"BrtEndSheetData",f:D},147:{n:"BrtWsProp",f:hc},148:{n:"BrtWsDim",f:hf,p:16},151:{n:"BrtPane",f:D},152:{n:"BrtSel",f:D},153:{n:"BrtWbProp",f:Hc},154:{n:"BrtWbFactoid",f:D},155:{n:"BrtFileRecover",f:D},156:{n:"BrtBundleSh",f:Fc},157:{n:"BrtCalcProp",f:D},158:{n:"BrtBookView",f:D},159:{n:"BrtBeginSst",f:lb},160:{n:"BrtEndSst",f:D},161:{n:"BrtBeginAFilter",f:D},162:{n:"BrtEndAFilter",f:D},163:{n:"BrtBeginFilterColumn",f:D},164:{n:"BrtEndFilterColumn",f:D},165:{n:"BrtBeginFilters",f:D},166:{n:"BrtEndFilters",f:D},167:{n:"BrtFilter",f:D},168:{n:"BrtColorFilter",f:D},169:{n:"BrtIconFilter",f:D},170:{n:"BrtTop10Filter",f:D},171:{n:"BrtDynamicFilter",f:D},172:{n:"BrtBeginCustomFilters",f:D},173:{n:"BrtEndCustomFilters",f:D},174:{n:"BrtCustomFilter",f:D},175:{n:"BrtAFilterDateGroupItem",f:D},176:{n:"BrtMergeCell",f:kf},177:{n:"BrtBeginMergeCells",f:D},178:{n:"BrtEndMergeCells",f:D},179:{n:"BrtBeginPivotCacheDef",f:D},180:{n:"BrtEndPivotCacheDef",f:D},181:{n:"BrtBeginPCDFields",f:D},182:{n:"BrtEndPCDFields",f:D},183:{n:"BrtBeginPCDField",f:D},184:{n:"BrtEndPCDField",f:D},185:{n:"BrtBeginPCDSource",f:D},186:{n:"BrtEndPCDSource",f:D},187:{n:"BrtBeginPCDSRange",f:D},188:{n:"BrtEndPCDSRange",f:D},189:{n:"BrtBeginPCDFAtbl",f:D},190:{n:"BrtEndPCDFAtbl",f:D},191:{n:"BrtBeginPCDIRun",f:D},192:{n:"BrtEndPCDIRun",f:D},193:{n:"BrtBeginPivotCacheRecords",f:D},194:{n:"BrtEndPivotCacheRecords",f:D},195:{n:"BrtBeginPCDHierarchies",f:D},196:{n:"BrtEndPCDHierarchies",f:D},197:{n:"BrtBeginPCDHierarchy",f:D},198:{n:"BrtEndPCDHierarchy",f:D},199:{n:"BrtBeginPCDHFieldsUsage",f:D},200:{n:"BrtEndPCDHFieldsUsage",f:D},201:{n:"BrtBeginExtConnection",f:D},202:{n:"BrtEndExtConnection",f:D},203:{n:"BrtBeginECDbProps",f:D},204:{n:"BrtEndECDbProps",f:D},205:{n:"BrtBeginECOlapProps",f:D},206:{n:"BrtEndECOlapProps",f:D},207:{n:"BrtBeginPCDSConsol",f:D},208:{n:"BrtEndPCDSConsol",f:D},209:{n:"BrtBeginPCDSCPages",f:D},210:{n:"BrtEndPCDSCPages",f:D},211:{n:"BrtBeginPCDSCPage",f:D},212:{n:"BrtEndPCDSCPage",f:D},213:{n:"BrtBeginPCDSCPItem",f:D},214:{n:"BrtEndPCDSCPItem",f:D},215:{n:"BrtBeginPCDSCSets",f:D},216:{n:"BrtEndPCDSCSets",f:D},217:{n:"BrtBeginPCDSCSet",f:D},218:{n:"BrtEndPCDSCSet",f:D},219:{n:"BrtBeginPCDFGroup",f:D},220:{n:"BrtEndPCDFGroup",f:D},221:{n:"BrtBeginPCDFGItems",f:D},222:{n:"BrtEndPCDFGItems",f:D},223:{n:"BrtBeginPCDFGRange",f:D},224:{n:"BrtEndPCDFGRange",f:D},225:{n:"BrtBeginPCDFGDiscrete",f:D},226:{n:"BrtEndPCDFGDiscrete",f:D},227:{n:"BrtBeginPCDSDTupleCache",f:D},228:{n:"BrtEndPCDSDTupleCache",f:D},229:{n:"BrtBeginPCDSDTCEntries",f:D},230:{n:"BrtEndPCDSDTCEntries",f:D},231:{n:"BrtBeginPCDSDTCEMembers",f:D},232:{n:"BrtEndPCDSDTCEMembers",f:D},233:{n:"BrtBeginPCDSDTCEMember",f:D},234:{n:"BrtEndPCDSDTCEMember",f:D},235:{n:"BrtBeginPCDSDTCQueries",f:D},236:{n:"BrtEndPCDSDTCQueries",f:D},237:{n:"BrtBeginPCDSDTCQuery",f:D},238:{n:"BrtEndPCDSDTCQuery",f:D},239:{n:"BrtBeginPCDSDTCSets",f:D},240:{n:"BrtEndPCDSDTCSets",f:D},241:{n:"BrtBeginPCDSDTCSet",f:D},242:{n:"BrtEndPCDSDTCSet",f:D},243:{n:"BrtBeginPCDCalcItems",f:D},244:{n:"BrtEndPCDCalcItems",f:D},245:{n:"BrtBeginPCDCalcItem",f:D},246:{n:"BrtEndPCDCalcItem",f:D},247:{n:"BrtBeginPRule",f:D},248:{n:"BrtEndPRule",f:D},249:{n:"BrtBeginPRFilters",f:D},250:{n:"BrtEndPRFilters",f:D},251:{n:"BrtBeginPRFilter",f:D},252:{n:"BrtEndPRFilter",f:D},253:{n:"BrtBeginPNames",f:D},254:{n:"BrtEndPNames",f:D},255:{n:"BrtBeginPName",f:D},256:{n:"BrtEndPName",f:D},257:{n:"BrtBeginPNPairs",f:D},258:{n:"BrtEndPNPairs",f:D},259:{n:"BrtBeginPNPair",f:D},260:{n:"BrtEndPNPair",f:D},261:{n:"BrtBeginECWebProps",f:D},262:{n:"BrtEndECWebProps",f:D},263:{n:"BrtBeginEcWpTables",f:D},264:{n:"BrtEndECWPTables",f:D},265:{n:"BrtBeginECParams",f:D},266:{n:"BrtEndECParams",f:D},267:{n:"BrtBeginECParam",f:D},268:{n:"BrtEndECParam",f:D},269:{n:"BrtBeginPCDKPIs",f:D},270:{n:"BrtEndPCDKPIs",f:D},271:{n:"BrtBeginPCDKPI",f:D},272:{n:"BrtEndPCDKPI",f:D},273:{n:"BrtBeginDims",f:D},274:{n:"BrtEndDims",f:D},275:{n:"BrtBeginDim",f:D},276:{n:"BrtEndDim",f:D},277:{n:"BrtIndexPartEnd",f:D},278:{n:"BrtBeginStyleSheet",f:D},279:{n:"BrtEndStyleSheet",f:D},280:{n:"BrtBeginSXView",f:D},281:{n:"BrtEndSXVI",f:D},282:{n:"BrtBeginSXVI",f:D},283:{n:"BrtBeginSXVIs",f:D},284:{n:"BrtEndSXVIs",f:D},285:{n:"BrtBeginSXVD",f:D},286:{n:"BrtEndSXVD",f:D},287:{n:"BrtBeginSXVDs",f:D},288:{n:"BrtEndSXVDs",f:D},289:{n:"BrtBeginSXPI",f:D},290:{n:"BrtEndSXPI",f:D},291:{n:"BrtBeginSXPIs",f:D},292:{n:"BrtEndSXPIs",f:D},293:{n:"BrtBeginSXDI",f:D},294:{n:"BrtEndSXDI",f:D},295:{n:"BrtBeginSXDIs",f:D},296:{n:"BrtEndSXDIs",f:D},297:{n:"BrtBeginSXLI",f:D},298:{n:"BrtEndSXLI",f:D},299:{n:"BrtBeginSXLIRws",f:D},300:{n:"BrtEndSXLIRws",f:D},301:{n:"BrtBeginSXLICols",f:D},302:{n:"BrtEndSXLICols",f:D},303:{n:"BrtBeginSXFormat",f:D},304:{n:"BrtEndSXFormat",f:D},305:{n:"BrtBeginSXFormats",f:D},306:{n:"BrtEndSxFormats",f:D},307:{n:"BrtBeginSxSelect",f:D},308:{n:"BrtEndSxSelect",f:D},309:{n:"BrtBeginISXVDRws",f:D},310:{n:"BrtEndISXVDRws",f:D},311:{n:"BrtBeginISXVDCols",f:D},312:{n:"BrtEndISXVDCols",f:D},313:{n:"BrtEndSXLocation",f:D},314:{n:"BrtBeginSXLocation",f:D},315:{n:"BrtEndSXView",f:D},316:{n:"BrtBeginSXTHs",f:D},317:{n:"BrtEndSXTHs",f:D},318:{n:"BrtBeginSXTH",f:D},319:{n:"BrtEndSXTH",f:D},320:{n:"BrtBeginISXTHRws",f:D},321:{n:"BrtEndISXTHRws",f:D},322:{n:"BrtBeginISXTHCols",f:D},323:{n:"BrtEndISXTHCols",f:D},324:{n:"BrtBeginSXTDMPS",f:D},325:{n:"BrtEndSXTDMPs",f:D},326:{n:"BrtBeginSXTDMP",f:D},327:{n:"BrtEndSXTDMP",f:D},328:{n:"BrtBeginSXTHItems",f:D},329:{n:"BrtEndSXTHItems",f:D},330:{n:"BrtBeginSXTHItem",f:D},331:{n:"BrtEndSXTHItem",f:D},332:{n:"BrtBeginMetadata",f:D},333:{n:"BrtEndMetadata",f:D},334:{n:"BrtBeginEsmdtinfo",f:D},335:{n:"BrtMdtinfo",f:D},336:{n:"BrtEndEsmdtinfo",f:D},337:{n:"BrtBeginEsmdb",f:D},338:{n:"BrtEndEsmdb",f:D},339:{n:"BrtBeginEsfmd",f:D},340:{n:"BrtEndEsfmd",f:D},341:{n:"BrtBeginSingleCells",f:D},342:{n:"BrtEndSingleCells",f:D},343:{n:"BrtBeginList",f:D},344:{n:"BrtEndList",f:D},345:{n:"BrtBeginListCols",f:D},346:{n:"BrtEndListCols",f:D},347:{n:"BrtBeginListCol",f:D},348:{n:"BrtEndListCol",f:D},349:{n:"BrtBeginListXmlCPr",f:D},350:{n:"BrtEndListXmlCPr",f:D},351:{n:"BrtListCCFmla",f:D},352:{n:"BrtListTrFmla",f:D},353:{n:"BrtBeginExternals",f:D},354:{n:"BrtEndExternals",f:D},355:{n:"BrtSupBookSrc",f:D},357:{n:"BrtSupSelf",f:D},358:{n:"BrtSupSame",f:D},359:{n:"BrtSupTabs",f:D},360:{n:"BrtBeginSupBook",f:D},361:{n:"BrtPlaceholderName",f:D},362:{n:"BrtExternSheet",f:D},363:{n:"BrtExternTableStart",f:D},364:{n:"BrtExternTableEnd",f:D},366:{n:"BrtExternRowHdr",f:D},367:{n:"BrtExternCellBlank",f:D},368:{n:"BrtExternCellReal",f:D},369:{n:"BrtExternCellBool",f:D},370:{n:"BrtExternCellError",f:D},371:{n:"BrtExternCellString",f:D},372:{n:"BrtBeginEsmdx",f:D},373:{n:"BrtEndEsmdx",f:D},374:{n:"BrtBeginMdxSet",f:D},375:{n:"BrtEndMdxSet",f:D},376:{n:"BrtBeginMdxMbrProp",f:D},377:{n:"BrtEndMdxMbrProp",f:D},378:{n:"BrtBeginMdxKPI",f:D},379:{n:"BrtEndMdxKPI",f:D},380:{n:"BrtBeginEsstr",f:D},381:{n:"BrtEndEsstr",f:D},382:{n:"BrtBeginPRFItem",f:D},383:{n:"BrtEndPRFItem",f:D},384:{n:"BrtBeginPivotCacheIDs",f:D},385:{n:"BrtEndPivotCacheIDs",f:D},386:{n:"BrtBeginPivotCacheID",f:D},387:{n:"BrtEndPivotCacheID",f:D},388:{n:"BrtBeginISXVIs",f:D},389:{n:"BrtEndISXVIs",f:D},390:{n:"BrtBeginColInfos",f:D},391:{n:"BrtEndColInfos",f:D},392:{n:"BrtBeginRwBrk",f:D},393:{n:"BrtEndRwBrk",f:D},394:{n:"BrtBeginColBrk",f:D},395:{n:"BrtEndColBrk",f:D},396:{n:"BrtBrk",f:D},397:{n:"BrtUserBookView",f:D},398:{n:"BrtInfo",f:D},399:{n:"BrtCUsr",f:D},400:{n:"BrtUsr",f:D},401:{n:"BrtBeginUsers",f:D},403:{n:"BrtEOF",f:D},404:{n:"BrtUCR",f:D},405:{n:"BrtRRInsDel",f:D},406:{n:"BrtRREndInsDel",f:D},407:{n:"BrtRRMove",f:D},408:{n:"BrtRREndMove",f:D},409:{n:"BrtRRChgCell",f:D},410:{n:"BrtRREndChgCell",f:D},411:{n:"BrtRRHeader",f:D},412:{n:"BrtRRUserView",f:D},413:{n:"BrtRRRenSheet",f:D},414:{n:"BrtRRInsertSh",f:D},415:{n:"BrtRRDefName",f:D},416:{n:"BrtRRNote",f:D},417:{n:"BrtRRConflict",f:D},418:{n:"BrtRRTQSIF",f:D},419:{n:"BrtRRFormat",f:D},420:{n:"BrtRREndFormat",f:D},421:{n:"BrtRRAutoFmt",f:D},422:{n:"BrtBeginUserShViews",f:D},423:{n:"BrtBeginUserShView",f:D},424:{n:"BrtEndUserShView",f:D},425:{n:"BrtEndUserShViews",f:D},426:{n:"BrtArrFmla",f:D},427:{n:"BrtShrFmla",f:D},428:{n:"BrtTable",f:D},429:{n:"BrtBeginExtConnections",f:D},430:{n:"BrtEndExtConnections",f:D},431:{n:"BrtBeginPCDCalcMems",f:D},432:{n:"BrtEndPCDCalcMems",f:D},433:{n:"BrtBeginPCDCalcMem",f:D},434:{n:"BrtEndPCDCalcMem",f:D},435:{n:"BrtBeginPCDHGLevels",f:D},436:{n:"BrtEndPCDHGLevels",f:D},437:{n:"BrtBeginPCDHGLevel",f:D},438:{n:"BrtEndPCDHGLevel",f:D},439:{n:"BrtBeginPCDHGLGroups",f:D},440:{n:"BrtEndPCDHGLGroups",f:D},441:{n:"BrtBeginPCDHGLGroup",f:D},442:{n:"BrtEndPCDHGLGroup",f:D},443:{n:"BrtBeginPCDHGLGMembers",f:D},444:{n:"BrtEndPCDHGLGMembers",f:D},445:{n:"BrtBeginPCDHGLGMember",f:D},446:{n:"BrtEndPCDHGLGMember",f:D},447:{n:"BrtBeginQSI",f:D},448:{n:"BrtEndQSI",f:D},449:{n:"BrtBeginQSIR",f:D},450:{n:"BrtEndQSIR",f:D},451:{n:"BrtBeginDeletedNames",f:D},452:{n:"BrtEndDeletedNames",f:D},453:{n:"BrtBeginDeletedName",f:D},454:{n:"BrtEndDeletedName",f:D},455:{n:"BrtBeginQSIFs",f:D},456:{n:"BrtEndQSIFs",f:D},457:{n:"BrtBeginQSIF",f:D},458:{n:"BrtEndQSIF",f:D},459:{n:"BrtBeginAutoSortScope",f:D},460:{n:"BrtEndAutoSortScope",f:D},461:{n:"BrtBeginConditionalFormatting",f:D},462:{n:"BrtEndConditionalFormatting",f:D},463:{n:"BrtBeginCFRule",f:D},464:{n:"BrtEndCFRule",f:D},465:{n:"BrtBeginIconSet",f:D},466:{n:"BrtEndIconSet",f:D},467:{n:"BrtBeginDatabar",f:D},468:{n:"BrtEndDatabar",f:D},469:{n:"BrtBeginColorScale",f:D},470:{n:"BrtEndColorScale",f:D},471:{n:"BrtCFVO",f:D},472:{n:"BrtExternValueMeta",f:D},473:{n:"BrtBeginColorPalette",f:D},474:{n:"BrtEndColorPalette",f:D},475:{n:"BrtIndexedColor",f:D},476:{n:"BrtMargins",f:D},477:{n:"BrtPrintOptions",f:D},478:{n:"BrtPageSetup",f:D},479:{n:"BrtBeginHeaderFooter",f:D},480:{n:"BrtEndHeaderFooter",f:D},481:{n:"BrtBeginSXCrtFormat",f:D},482:{n:"BrtEndSXCrtFormat",f:D},483:{n:"BrtBeginSXCrtFormats",f:D},484:{n:"BrtEndSXCrtFormats",f:D},485:{n:"BrtWsFmtInfo",f:D},486:{n:"BrtBeginMgs",f:D},487:{n:"BrtEndMGs",f:D},488:{n:"BrtBeginMGMaps",f:D},489:{n:"BrtEndMGMaps",f:D},490:{n:"BrtBeginMG",f:D},491:{n:"BrtEndMG",f:D},492:{n:"BrtBeginMap",f:D},493:{n:"BrtEndMap",f:D},494:{n:"BrtHLink",f:uc},495:{n:"BrtBeginDCon",f:D},496:{n:"BrtEndDCon",f:D},497:{n:"BrtBeginDRefs",f:D},498:{n:"BrtEndDRefs",f:D},499:{n:"BrtDRef",f:D},500:{n:"BrtBeginScenMan",f:D},501:{n:"BrtEndScenMan",f:D},502:{n:"BrtBeginSct",f:D},503:{n:"BrtEndSct",f:D},504:{n:"BrtSlc",f:D},505:{n:"BrtBeginDXFs",f:D},506:{n:"BrtEndDXFs",f:D},507:{n:"BrtDXF",f:D},508:{n:"BrtBeginTableStyles",f:D},509:{n:"BrtEndTableStyles",f:D},510:{n:"BrtBeginTableStyle",f:D},511:{n:"BrtEndTableStyle",f:D},512:{n:"BrtTableStyleElement",f:D},513:{n:"BrtTableStyleClient",f:D},514:{n:"BrtBeginVolDeps",f:D},515:{n:"BrtEndVolDeps",f:D},516:{n:"BrtBeginVolType",f:D},517:{n:"BrtEndVolType",f:D},518:{n:"BrtBeginVolMain",f:D},519:{n:"BrtEndVolMain",f:D},520:{n:"BrtBeginVolTopic",f:D},521:{n:"BrtEndVolTopic",f:D},522:{n:"BrtVolSubtopic",f:D},523:{n:"BrtVolRef",f:D},524:{n:"BrtVolNum",f:D},525:{n:"BrtVolErr",f:D},526:{n:"BrtVolStr",f:D},527:{n:"BrtVolBool",f:D},528:{n:"BrtBeginCalcChain$",f:D},529:{n:"BrtEndCalcChain$",f:D},530:{n:"BrtBeginSortState",f:D},531:{n:"BrtEndSortState",f:D},532:{n:"BrtBeginSortCond",f:D},533:{n:"BrtEndSortCond",f:D},534:{n:"BrtBookProtection",f:D},535:{n:"BrtSheetProtection",f:D},536:{n:"BrtRangeProtection",f:D},537:{n:"BrtPhoneticInfo",f:D},538:{n:"BrtBeginECTxtWiz",f:D},539:{n:"BrtEndECTxtWiz",f:D},540:{n:"BrtBeginECTWFldInfoLst",f:D},541:{n:"BrtEndECTWFldInfoLst",f:D},542:{n:"BrtBeginECTwFldInfo",f:D},548:{n:"BrtFileSharing",f:D},549:{n:"BrtOleSize",f:D},550:{n:"BrtDrawing",f:D},551:{n:"BrtLegacyDrawing",f:D},552:{n:"BrtLegacyDrawingHF",f:D},553:{n:"BrtWebOpt",f:D},554:{n:"BrtBeginWebPubItems",f:D},555:{n:"BrtEndWebPubItems",f:D},556:{n:"BrtBeginWebPubItem",f:D},557:{n:"BrtEndWebPubItem",f:D},558:{n:"BrtBeginSXCondFmt",f:D},559:{n:"BrtEndSXCondFmt",f:D},560:{n:"BrtBeginSXCondFmts",f:D},561:{n:"BrtEndSXCondFmts",f:D},562:{n:"BrtBkHim",f:D},564:{n:"BrtColor",f:D},565:{n:"BrtBeginIndexedColors",f:D},566:{n:"BrtEndIndexedColors",f:D},569:{n:"BrtBeginMRUColors",f:D},570:{n:"BrtEndMRUColors",f:D},572:{n:"BrtMRUColor",f:D},573:{n:"BrtBeginDVals",f:D},574:{n:"BrtEndDVals",f:D},577:{n:"BrtSupNameStart",f:D},578:{n:"BrtSupNameValueStart",f:D},579:{n:"BrtSupNameValueEnd",f:D},580:{n:"BrtSupNameNum",f:D},581:{n:"BrtSupNameErr",f:D},582:{n:"BrtSupNameSt",f:D},583:{n:"BrtSupNameNil",f:D},584:{n:"BrtSupNameBool",f:D},585:{n:"BrtSupNameFmla",f:D},586:{n:"BrtSupNameBits",f:D},587:{n:"BrtSupNameEnd",f:D},588:{n:"BrtEndSupBook",f:D},589:{n:"BrtCellSmartTagProperty",f:D},590:{n:"BrtBeginCellSmartTag",f:D},591:{n:"BrtEndCellSmartTag",f:D},592:{n:"BrtBeginCellSmartTags",f:D},593:{n:"BrtEndCellSmartTags",f:D},594:{n:"BrtBeginSmartTags",f:D},595:{n:"BrtEndSmartTags",f:D},596:{n:"BrtSmartTagType",f:D},597:{n:"BrtBeginSmartTagTypes",f:D},598:{n:"BrtEndSmartTagTypes",f:D},599:{n:"BrtBeginSXFilters",f:D},600:{n:"BrtEndSXFilters",f:D},601:{n:"BrtBeginSXFILTER",f:D},602:{n:"BrtEndSXFilter",f:D},603:{n:"BrtBeginFills",f:D},604:{n:"BrtEndFills",f:D},605:{n:"BrtBeginCellWatches",f:D},606:{n:"BrtEndCellWatches",f:D},607:{n:"BrtCellWatch",f:D},608:{n:"BrtBeginCRErrs",f:D},609:{n:"BrtEndCRErrs",f:D},610:{n:"BrtCrashRecErr",f:D},611:{n:"BrtBeginFonts",f:D},612:{n:"BrtEndFonts",f:D},613:{n:"BrtBeginBorders",f:D},614:{n:"BrtEndBorders",f:D},615:{n:"BrtBeginFmts",f:D},616:{n:"BrtEndFmts",f:D},617:{n:"BrtBeginCellXFs",f:D},618:{n:"BrtEndCellXFs",f:D},619:{n:"BrtBeginStyles",f:D},620:{n:"BrtEndStyles",f:D},625:{n:"BrtBigName",f:D},626:{n:"BrtBeginCellStyleXFs",f:D},627:{n:"BrtEndCellStyleXFs",f:D},628:{n:"BrtBeginComments",f:D},629:{n:"BrtEndComments",f:D},630:{n:"BrtBeginCommentAuthors",f:D},631:{n:"BrtEndCommentAuthors",f:D},632:{n:"BrtCommentAuthor",f:Ye},633:{n:"BrtBeginCommentList",f:D},634:{n:"BrtEndCommentList",f:D},635:{n:"BrtBeginComment",f:Tb},636:{n:"BrtEndComment",f:D},637:{n:"BrtCommentText",f:Ze},638:{n:"BrtBeginOleObjects",f:D},639:{n:"BrtOleObject",f:D},640:{n:"BrtEndOleObjects",f:D},641:{n:"BrtBeginSxrules",f:D},642:{n:"BrtEndSxRules",f:D},643:{n:"BrtBeginActiveXControls",f:D},644:{n:"BrtActiveX",f:D},645:{n:"BrtEndActiveXControls",f:D},646:{n:"BrtBeginPCDSDTCEMembersSortBy",f:D},648:{n:"BrtBeginCellIgnoreECs",f:D},649:{n:"BrtCellIgnoreEC",f:D},650:{n:"BrtEndCellIgnoreECs",f:D},651:{n:"BrtCsProp",f:D},652:{n:"BrtCsPageSetup",f:D},653:{n:"BrtBeginUserCsViews",f:D},654:{n:"BrtEndUserCsViews",f:D},655:{n:"BrtBeginUserCsView",f:D},656:{n:"BrtEndUserCsView",f:D},657:{n:"BrtBeginPcdSFCIEntries",f:D},658:{n:"BrtEndPCDSFCIEntries",f:D},659:{n:"BrtPCDSFCIEntry",f:D},660:{n:"BrtBeginListParts",f:D},661:{n:"BrtListPart",f:D},662:{n:"BrtEndListParts",f:D},663:{n:"BrtSheetCalcProp",f:D},664:{n:"BrtBeginFnGroup",f:D},665:{n:"BrtFnGroup",f:D},666:{n:"BrtEndFnGroup",f:D},667:{n:"BrtSupAddin",f:D},668:{n:"BrtSXTDMPOrder",f:D},669:{n:"BrtCsProtection",f:D},671:{n:"BrtBeginWsSortMap",f:D},672:{n:"BrtEndWsSortMap",f:D},673:{n:"BrtBeginRRSort",f:D},674:{n:"BrtEndRRSort",f:D},675:{n:"BrtRRSortItem",f:D},676:{n:"BrtFileSharingIso",f:D},677:{n:"BrtBookProtectionIso",f:D},678:{n:"BrtSheetProtectionIso",f:D},679:{n:"BrtCsProtectionIso",f:D},680:{n:"BrtRangeProtectionIso",f:D},1024:{n:"BrtRwDescent",f:D},1025:{n:"BrtKnownFonts",f:D},1026:{n:"BrtBeginSXTupleSet",f:D},1027:{n:"BrtEndSXTupleSet",f:D},1028:{n:"BrtBeginSXTupleSetHeader",f:D},1029:{n:"BrtEndSXTupleSetHeader",f:D},1030:{n:"BrtSXTupleSetHeaderItem",f:D},1031:{n:"BrtBeginSXTupleSetData",f:D},1032:{n:"BrtEndSXTupleSetData",f:D},1033:{n:"BrtBeginSXTupleSetRow",f:D},1034:{n:"BrtEndSXTupleSetRow",f:D},1035:{n:"BrtSXTupleSetRowItem",f:D},1036:{n:"BrtNameExt",f:D},1037:{n:"BrtPCDH14",f:D},1038:{n:"BrtBeginPCDCalcMem14",f:D},1039:{n:"BrtEndPCDCalcMem14",f:D},1040:{n:"BrtSXTH14",f:D},1041:{n:"BrtBeginSparklineGroup",f:D},1042:{n:"BrtEndSparklineGroup",f:D},1043:{n:"BrtSparkline",f:D},1044:{n:"BrtSXDI14",f:D},1045:{n:"BrtWsFmtInfoEx14",f:D},1046:{n:"BrtBeginConditionalFormatting14",f:D},1047:{n:"BrtEndConditionalFormatting14",f:D},1048:{n:"BrtBeginCFRule14",f:D},1049:{n:"BrtEndCFRule14",f:D},1050:{n:"BrtCFVO14",f:D},1051:{n:"BrtBeginDatabar14",f:D},1052:{n:"BrtBeginIconSet14",f:D},1053:{n:"BrtDVal14",f:D},1054:{n:"BrtBeginDVals14",f:D},1055:{n:"BrtColor14",f:D},1056:{n:"BrtBeginSparklines",f:D},1057:{n:"BrtEndSparklines",f:D},1058:{n:"BrtBeginSparklineGroups",f:D},1059:{n:"BrtEndSparklineGroups",f:D},1061:{n:"BrtSXVD14",f:D},1062:{n:"BrtBeginSxview14",f:D},1063:{n:"BrtEndSxview14",f:D},1066:{n:"BrtBeginPCD14",f:D},1067:{n:"BrtEndPCD14",f:D},1068:{n:"BrtBeginExtConn14",f:D},1069:{n:"BrtEndExtConn14",f:D},1070:{n:"BrtBeginSlicerCacheIDs",f:D},1071:{n:"BrtEndSlicerCacheIDs",f:D},1072:{n:"BrtBeginSlicerCacheID",f:D},1073:{n:"BrtEndSlicerCacheID",f:D},1075:{n:"BrtBeginSlicerCache",f:D},1076:{n:"BrtEndSlicerCache",f:D},1077:{n:"BrtBeginSlicerCacheDef",f:D},1078:{n:"BrtEndSlicerCacheDef",f:D},1079:{n:"BrtBeginSlicersEx",f:D},1080:{n:"BrtEndSlicersEx",f:D},1081:{n:"BrtBeginSlicerEx",f:D},1082:{n:"BrtEndSlicerEx",f:D},1083:{n:"BrtBeginSlicer",f:D},1084:{n:"BrtEndSlicer",f:D},1085:{n:"BrtSlicerCachePivotTables",f:D},1086:{n:"BrtBeginSlicerCacheOlapImpl",f:D},1087:{n:"BrtEndSlicerCacheOlapImpl",f:D},1088:{n:"BrtBeginSlicerCacheLevelsData",f:D},1089:{n:"BrtEndSlicerCacheLevelsData",f:D},1090:{n:"BrtBeginSlicerCacheLevelData",f:D},1091:{n:"BrtEndSlicerCacheLevelData",f:D},1092:{n:"BrtBeginSlicerCacheSiRanges",f:D},1093:{n:"BrtEndSlicerCacheSiRanges",f:D},1094:{n:"BrtBeginSlicerCacheSiRange",f:D},1095:{n:"BrtEndSlicerCacheSiRange",f:D},1096:{n:"BrtSlicerCacheOlapItem",f:D},1097:{n:"BrtBeginSlicerCacheSelections",f:D},1098:{n:"BrtSlicerCacheSelection",f:D},1099:{n:"BrtEndSlicerCacheSelections",f:D},1100:{n:"BrtBeginSlicerCacheNative",f:D},1101:{n:"BrtEndSlicerCacheNative",f:D},1102:{n:"BrtSlicerCacheNativeItem",f:D},1103:{n:"BrtRangeProtection14",f:D},1104:{n:"BrtRangeProtectionIso14",f:D},1105:{n:"BrtCellIgnoreEC14",f:D},1111:{n:"BrtList14",f:D},1112:{n:"BrtCFIcon",f:D},1113:{n:"BrtBeginSlicerCachesPivotCacheIDs",f:D},1114:{n:"BrtEndSlicerCachesPivotCacheIDs",f:D},1115:{n:"BrtBeginSlicers",f:D},1116:{n:"BrtEndSlicers",f:D},1117:{n:"BrtWbProp14",f:D},1118:{n:"BrtBeginSXEdit",f:D},1119:{n:"BrtEndSXEdit",f:D},1120:{n:"BrtBeginSXEdits",f:D},1121:{n:"BrtEndSXEdits",f:D},1122:{n:"BrtBeginSXChange",f:D},1123:{n:"BrtEndSXChange",f:D},1124:{n:"BrtBeginSXChanges",f:D},1125:{n:"BrtEndSXChanges",f:D},1126:{n:"BrtSXTupleItems",f:D},1128:{n:"BrtBeginSlicerStyle",f:D},1129:{n:"BrtEndSlicerStyle",f:D},1130:{n:"BrtSlicerStyleElement",f:D},1131:{n:"BrtBeginStyleSheetExt14",f:D},1132:{n:"BrtEndStyleSheetExt14",f:D},1133:{n:"BrtBeginSlicerCachesPivotCacheID",f:D},1134:{n:"BrtEndSlicerCachesPivotCacheID",f:D},1135:{n:"BrtBeginConditionalFormattings",f:D},1136:{n:"BrtEndConditionalFormattings",f:D},1137:{n:"BrtBeginPCDCalcMemExt",f:D},1138:{n:"BrtEndPCDCalcMemExt",f:D},1139:{n:"BrtBeginPCDCalcMemsExt",f:D},1140:{n:"BrtEndPCDCalcMemsExt",f:D},1141:{n:"BrtPCDField14",f:D},1142:{n:"BrtBeginSlicerStyles",f:D},1143:{n:"BrtEndSlicerStyles",f:D},1144:{n:"BrtBeginSlicerStyleElements",f:D},1145:{n:"BrtEndSlicerStyleElements",f:D},1146:{n:"BrtCFRuleExt",f:D},1147:{n:"BrtBeginSXCondFmt14",f:D},1148:{n:"BrtEndSXCondFmt14",f:D},1149:{n:"BrtBeginSXCondFmts14",f:D},1150:{n:"BrtEndSXCondFmts14",f:D},1152:{n:"BrtBeginSortCond14",f:D},1153:{n:"BrtEndSortCond14",f:D},1154:{n:"BrtEndDVals14",f:D},1155:{n:"BrtEndIconSet14",f:D},1156:{n:"BrtEndDatabar14",f:D},1157:{n:"BrtBeginColorScale14",f:D},1158:{n:"BrtEndColorScale14",f:D},1159:{n:"BrtBeginSxrules14",f:D},1160:{n:"BrtEndSxrules14",f:D},1161:{n:"BrtBeginPRule14",f:D},1162:{n:"BrtEndPRule14",f:D},1163:{n:"BrtBeginPRFilters14",f:D},1164:{n:"BrtEndPRFilters14",f:D},1165:{n:"BrtBeginPRFilter14",f:D},1166:{n:"BrtEndPRFilter14",f:D},1167:{n:"BrtBeginPRFItem14",f:D},1168:{n:"BrtEndPRFItem14",f:D},1169:{n:"BrtBeginCellIgnoreECs14",f:D},1170:{n:"BrtEndCellIgnoreECs14",f:D},1171:{n:"BrtDxf14",f:D},1172:{n:"BrtBeginDxF14s",f:D},1173:{n:"BrtEndDxf14s",f:D},1177:{n:"BrtFilter14",f:D},1178:{n:"BrtBeginCustomFilters14",f:D},1180:{n:"BrtCustomFilter14",f:D},1181:{n:"BrtIconFilter14",f:D},1182:{n:"BrtPivotCacheConnectionName",f:D},2048:{n:"BrtBeginDecoupledPivotCacheIDs",f:D},2049:{n:"BrtEndDecoupledPivotCacheIDs",f:D},2050:{n:"BrtDecoupledPivotCacheID",f:D},2051:{n:"BrtBeginPivotTableRefs",f:D},2052:{n:"BrtEndPivotTableRefs",f:D},2053:{n:"BrtPivotTableRef",f:D},2054:{n:"BrtSlicerCacheBookPivotTables",f:D},2055:{n:"BrtBeginSxvcells",f:D},2056:{n:"BrtEndSxvcells",f:D},2057:{n:"BrtBeginSxRow",f:D},2058:{n:"BrtEndSxRow",f:D},2060:{n:"BrtPcdCalcMem15",f:D},2067:{n:"BrtQsi15",f:D},2068:{n:"BrtBeginWebExtensions",f:D},2069:{n:"BrtEndWebExtensions",f:D},2070:{n:"BrtWebExtension",f:D},2071:{n:"BrtAbsPath15",f:D},2072:{n:"BrtBeginPivotTableUISettings",f:D},2073:{n:"BrtEndPivotTableUISettings",f:D},2075:{n:"BrtTableSlicerCacheIDs",f:D},2076:{n:"BrtTableSlicerCacheID",f:D},2077:{n:"BrtBeginTableSlicerCache",f:D},2078:{n:"BrtEndTableSlicerCache",f:D},2079:{n:"BrtSxFilter15",f:D},2080:{n:"BrtBeginTimelineCachePivotCacheIDs",f:D},2081:{n:"BrtEndTimelineCachePivotCacheIDs",f:D},2082:{n:"BrtTimelineCachePivotCacheID",f:D},2083:{n:"BrtBeginTimelineCacheIDs",f:D},2084:{n:"BrtEndTimelineCacheIDs",f:D},2085:{n:"BrtBeginTimelineCacheID",f:D},2086:{n:"BrtEndTimelineCacheID",f:D},2087:{n:"BrtBeginTimelinesEx",f:D},2088:{n:"BrtEndTimelinesEx",f:D},2089:{n:"BrtBeginTimelineEx",f:D},2090:{n:"BrtEndTimelineEx",f:D},2091:{n:"BrtWorkBookPr15",f:D},2092:{n:"BrtPCDH15",f:D},2093:{n:"BrtBeginTimelineStyle",f:D},2094:{n:"BrtEndTimelineStyle",f:D},2095:{n:"BrtTimelineStyleElement",f:D},2096:{n:"BrtBeginTimelineStylesheetExt15",f:D},2097:{n:"BrtEndTimelineStylesheetExt15",f:D},2098:{n:"BrtBeginTimelineStyles",f:D},2099:{n:"BrtEndTimelineStyles",f:D},2100:{n:"BrtBeginTimelineStyleElements",f:D},2101:{n:"BrtEndTimelineStyleElements",f:D},2102:{n:"BrtDxf15",f:D},2103:{n:"BrtBeginDxfs15",f:D},2104:{n:"brtEndDxfs15",f:D},2105:{n:"BrtSlicerCacheHideItemsWithNoData",f:D},2106:{n:"BrtBeginItemUniqueNames",f:D},2107:{n:"BrtEndItemUniqueNames",f:D},2108:{n:"BrtItemUniqueName",f:D},2109:{n:"BrtBeginExtConn15",f:D},2110:{n:"BrtEndExtConn15",f:D},2111:{n:"BrtBeginOledbPr15",f:D},2112:{n:"BrtEndOledbPr15",f:D},2113:{n:"BrtBeginDataFeedPr15",f:D},2114:{n:"BrtEndDataFeedPr15",f:D},2115:{n:"BrtTextPr15",f:D},2116:{n:"BrtRangePr15",f:D},2117:{n:"BrtDbCommand15",f:D},2118:{n:"BrtBeginDbTables15",f:D},2119:{n:"BrtEndDbTables15",f:D},2120:{n:"BrtDbTable15",f:D},2121:{n:"BrtBeginDataModel",f:D},2122:{n:"BrtEndDataModel",f:D},2123:{n:"BrtBeginModelTables",f:D},2124:{n:"BrtEndModelTables",f:D},2125:{n:"BrtModelTable",f:D},2126:{n:"BrtBeginModelRelationships",f:D},2127:{n:"BrtEndModelRelationships",f:D},2128:{n:"BrtModelRelationship",f:D},2129:{n:"BrtBeginECTxtWiz15",f:D},2130:{n:"BrtEndECTxtWiz15",f:D},2131:{n:"BrtBeginECTWFldInfoLst15",f:D},2132:{n:"BrtEndECTWFldInfoLst15",f:D},2133:{n:"BrtBeginECTWFldInfo15",f:D},2134:{n:"BrtFieldListActiveItem",f:D},2135:{n:"BrtPivotCacheIdVersion",f:D},2136:{n:"BrtSXDI15",f:D},65535:{n:"",f:D}},sf=f(rf,"n"),tf=ad([["cellNF",!1],["cellHTML",!0],["cellFormula",!0],["cellStyles",!1],["sheetStubs",!1],["sheetRows",0,"n"],["bookDeps",!1],["bookSheets",!1],["bookProps",!1],["bookFiles",!1],["bookVBA",!1],["WTF",!1]]),uf=ad([["bookSST",!1],["bookType","xlsx"],["WTF",!1]]),vf=function(a){return"/"!=a.substr(-1)
},wf={encode_col:od,encode_row:ld,encode_cell:sd,encode_range:ud,decode_col:nd,decode_row:kd,split_cell:qd,decode_cell:rd,decode_range:td,format_cell:xd,get_formulae:Bd,make_csv:Ad,make_json:yd,make_formulae:Bd,sheet_to_csv:Ad,sheet_to_json:yd,sheet_to_formulae:Bd,sheet_to_row_object_array:zd};a.parseZip=dd,a.read=gd,a.readFile=hd,a.write=id,a.writeFile=jd,a.utils=wf,a.SSF=Gd}("undefined"!=typeof exports?exports:XLSX);var XLS={};!function(a){function b(){c(1252)}function c(a){Jd=a,"undefined"!=typeof cptable&&(Id=cptable[a])}function d(a){return new(Nd?Buffer:Array)(a)}function e(a){if(Nd)return new Buffer(a,"binary");var b=a.split("").map(function(a){return 255&a.charCodeAt(0)});return b}function f(a,b,c,d,e){void 0===c&&(c=!0),d||(d=8),e||8!==d||(e=52);var f,g,h=8*d-e-1,i=(1<<h)-1,j=i>>1,k=-7,l=c?-1:1,m=c?d-1:0,n=a[b+m];for(m+=l,f=n&(1<<-k)-1,n>>>=-k,k+=h;k>0;f=256*f+a[b+m],m+=l,k-=8);for(g=f&(1<<-k)-1,f>>>=-k,k+=e;k>0;g=256*g+a[b+m],m+=l,k-=8);return f===i?g?0/0:1/0*(n?-1:1):(0===f?f=1-j:(g+=Math.pow(2,e),f-=j),(n?-1:1)*g*Math.pow(2,f-e))}function g(a,b){var c,d,e,f,h,i,j,k=[];switch(b){case"lpstr":c=Xd(this,this.l),a=5+c.length;break;case"lpwstr":c=Zd(this,this.l),a=5+c.length,"\x00"==c[c.length-1]&&(a+=2);break;case"cstr":for(a=0,c="";0!==(f=ce(this,this.l+a++));)k.push(Kd(f));c=k.join("");break;case"wstr":for(a=0,c="";0!==(f=de(this,this.l+a));)k.push(Kd(f)),a+=2;a+=2,c=k.join("");break;case"dbcs":for(c="",j=this.l,i=0;i!=a;++i){if(this.lens&&-1!==this.lens.indexOf(j))return f=ce(this,j),this.l=j+1,h=g.call(this,a-i,f?"dbcs":"sbcs"),k.join("")+h;k.push(Kd(de(this,j))),j+=2}c=k.join(""),a*=2;break;case"sbcs":for(c="",j=this.l,i=0;i!=a;++i){if(this.lens&&-1!==this.lens.indexOf(j))return f=ce(this,j),this.l=j+1,h=g.call(this,a-i,f?"dbcs":"sbcs"),k.join("")+h;k.push(Kd(ce(this,j))),j+=1}c=k.join("");break;case"utf8":c=Vd(this,this.l,this.l+a);break;case"utf16le":a*=2,c=Rd(this,this.l,this.l+a);break;default:switch(a){case 1:return d=ce(this,this.l),this.l++,d;case 2:return d="i"!==b?de(this,this.l):ee(this,this.l),this.l+=2,d;case 4:return"i"===b||0===(128&this[this.l+3])?(d=ge(this,this.l),this.l+=4,d):(e=fe(this,this.l),this.l+=4,e);case 8:if("f"===b)return e=_d(this,this.l),this.l+=8,e;case 16:c=Td(this,this.l,a)}}return this.l+=a,c}function h(a,b){var c=Td(this,this.l,a.length>>1);if(c!==a)throw b+"Expected "+a+" saw "+c;this.l+=a.length>>1}function i(a,b){a.l=b,a.read_shift=g,a.chk=h}function j(a){var b=a.read_shift(4),c=a.read_shift(4);return new Date(1e3*(c/1e7*Math.pow(2,32)+b/1e7-11644473600)).toISOString().replace(/\.000/,"")}function k(a,b,c){var d=a.read_shift(0,"lpstr");return c&&(a.l+=4-(d.length+1&3)&3),d}function l(a,b,c){var d=a.read_shift(0,"lpwstr");return c&&(a.l+=4-(d.length+1&3)&3),d}function m(a,b,c){return 31===b?l(a):k(a,b,c)}function n(a,b,c){return m(a,b,c===!1?0:4)}function o(a,b){if(!b)throw new Error("dafuq?");return m(a,b,0)}function p(a){for(var b=a.read_shift(4),c=[],d=0;d!=b;++d)c[d]=a.read_shift(0,"lpstr");return c}function q(a){return p(a)}function r(a){var b=x(a,te),c=x(a,ke);return[b,c]}function s(a){for(var b=a.read_shift(4),c=[],d=0;d!=b/2;++d)c.push(r(a));return c}function t(a){return s(a)}function u(a,b){for(var c=a.read_shift(4),d={},e=0;e!=c;++e){var f=a.read_shift(4),g=a.read_shift(4);d[f]=a.read_shift(g,1200===b?"utf16le":"utf8").replace(Pd,"").replace(Qd,"!")}return 3&a.l&&(a.l=a.l>>3<<2),d}function v(a){var b=a.read_shift(4),c=a.slice(a.l,a.l+b);return b&!0&&(a.l+=4-(3&b)&3),c}function w(a){var b={};return b.Size=a.read_shift(4),a.l+=b.Size,b}function x(a,b,c){var d,e=a.read_shift(2),f=c||{};if(a.l+=2,b!==me&&e!==b&&-1===ue.indexOf(b))throw new Error("Expected type "+b+" saw "+e);switch(b===me?e:b){case 2:return d=a.read_shift(2,"i"),f.raw||(a.l+=2),d;case 3:return d=a.read_shift(4,"i");case 11:return 0!==a.read_shift(4);case 19:return d=a.read_shift(4);case 30:return k(a,e,4).replace(Pd,"");case 31:return l(a);case 64:return j(a);case 65:return v(a);case 71:return w(a);case 80:return n(a,e,!f.raw&&4).replace(Pd,"");case 81:return o(a,e,4).replace(Pd,"");case 4108:return t(a);case 4126:return q(a);default:throw new Error("TypedPropertyValue unrecognized type "+b+" "+e)}}function y(a,b){var d,e=a.l,f=a.read_shift(4),g=a.read_shift(4),h=[],i=0,k=0,l=-1;for(i=0;i!=g;++i){var m=a.read_shift(4),o=a.read_shift(4);h[i]=[m,o+e]}var p={};for(i=0;i!=g;++i){if(a.l!==h[i][1]){var q=!0;if(i>0&&b)switch(b[h[i-1][0]].t){case 2:a.l+2===h[i][1]&&(a.l+=2,q=!1);break;case 80:a.l<=h[i][1]&&(a.l=h[i][1],q=!1);break;case 4108:a.l<=h[i][1]&&(a.l=h[i][1],q=!1)}if(!b&&a.l<=h[i][1]&&(q=!1,a.l=h[i][1]),q)throw new Error("Read Error: Expected address "+h[i][1]+" at "+a.l+" :"+i)}if(b){var r=b[h[i][0]];if(p[r.n]=x(a,r.t,{raw:!0}),"version"===r.p&&(p[r.n]=String(p[r.n]>>16)+"."+String(65535&p[r.n])),"CodePage"==r.n)switch(p[r.n]){case 0:p[r.n]=1252;case 1e4:case 1252:case 874:case 1250:case 1251:case 1253:case 1254:case 1255:case 1256:case 1257:case 1258:case 932:case 936:case 949:case 950:case 1200:case 1201:case 65e3:case-536:case 65001:case-535:c(k=p[r.n]);break;default:throw new Error("Unsupported CodePage: "+p[r.n])}}else if(1===h[i][0]){if(k=p.CodePage=x(a,je),c(k),-1!==l){var s=a.l;a.l=h[l][1],d=u(a,k),a.l=s}}else if(0===h[i][0]){if(0===k){l=i,a.l=h[i+1][1];continue}d=u(a,k)}else{var t,w=d[h[i][0]];switch(a[a.l]){case 65:a.l+=4,t=v(a);break;case 30:a.l+=4,t=n(a,a[a.l-4]);break;case 31:a.l+=4,t=n(a,a[a.l-4]);break;case 3:a.l+=4,t=a.read_shift(4,"i");break;case 19:a.l+=4,t=a.read_shift(4);break;case 5:a.l+=4,t=a.read_shift(8,"f");break;case 11:a.l+=4,t=E(a,4);break;case 64:a.l+=4,t=new Date(j(a));break;default:throw new Error("unparsed value: "+a[a.l])}p[w]=t}}return a.l=e+f,p}function z(a,b){var c=a.content;i(c,0);var d,e,f,g,h;c.chk("feff","Byte Order: ");var j=(c.read_shift(2),c.read_shift(4));if(c.chk(ze.utils.consts.HEADER_CLSID,"CLSID: "),d=c.read_shift(4),1!==d&&2!==d)throw"Unrecognized #Sets: "+d;if(e=c.read_shift(16),g=c.read_shift(4),1===d&&g!==c.l)throw"Length mismatch";2===d&&(f=c.read_shift(16),h=c.read_shift(4));var k=y(c,b),l={SystemIdentifier:j};for(var m in k)l[m]=k[m];if(l.FMTID=e,1===d)return l;if(c.l!==h)throw"Length mismatch 2: "+c.l+" !== "+h;var n;try{n=y(c,null)}catch(o){}for(m in n)l[m]=n[m];return l.FMTID=[e,f],l}function A(a,b){a.read_shift(b)}function B(a,b){return a.read_shift(b),null}function C(a,b,c){for(var d=[],e=a.l+b;a.l<e;)d.push(c(a,e-a.l));if(e!==a.l)throw new Error("Slurp error");return d}function D(a,b,c){for(var d=[],e=a.l+b,f=a.read_shift(2);0!==f--;)d.push(c(a,e-a.l));if(e!==a.l)throw new Error("Slurp error");return d}function E(a,b){return 1===a.read_shift(b)}function F(a){return a.read_shift(2,"u")}function G(a,b){return C(a,b,F)}function H(a){var b=a.read_shift(1),c=a.read_shift(1);return 1===c?ul[b]:1===b}function I(a,b,c){var d=a.read_shift(1),e=1,f="sbcs";if(void 0===c||5!==c.biff){var g=a.read_shift(1);g&&(e=2,f="dbcs")}return d?a.read_shift(d,f):""}function J(a){var b,c,d=a.read_shift(2),e=a.read_shift(1),f=4&e,g=8&e,h={};g&&(b=a.read_shift(2)),f&&(c=a.read_shift(4));var i=1&e?"dbcs":"sbcs",j=0===d?"":a.read_shift(d,i);return g&&(a.l+=4*b),f&&(a.l+=c),h.t=j,g||(h.raw="<t>"+h.t+"</t>",h.r=h.t),h}function K(a,b){var c,d=a.read_shift(1);return c=0===d?a.read_shift(b,"sbcs"):a.read_shift(b,"dbcs")}function L(a,b,c){var d=a.read_shift(void 0!==c&&5===c.biff?1:2);return 0===d?(a.l++,""):K(a,d,c)}function M(a,b,c){if(5!==c.biff)return L(a,b,c);var d=a.read_shift(1);return 0===d?(a.l++,""):a.read_shift(d,"sbcs")}function N(a){return a.read_shift(8,"f")}function O(a){return Object.keys(a)}function P(a,b){for(var c={},d=O(a),e=0;e<d.length;++e){var f=d[e];b?(c[a[f]]=c[a[f]]||[]).push(f):c[a[f]]=f}return c}function Q(a){var b=a.read_shift(2),c=a.read_shift(2),d=a.read_shift(2);return{r:b,c:c,ixfe:d}}function R(a){var b=a.read_shift(2),c=a.read_shift(2);return a.l+=8,{type:b,flags:c}}function S(a,b,c){return 0===b?"":M(a,b,c)}function T(a){var b=a.read_shift(2),c=a.read_shift(2,"i"),d=a.read_shift(2,"i");return[b,c,d]}function U(a){var b=a.slice(a.l,a.l+4),c=1&b[0],d=2&b[0];a.l+=4,b[0]&=-4;var e=0===d?_d([0,0,0,0,b[0],b[1],b[2],b[3]],0):ge(b,0)>>2;return c?e/100:e}function V(a){var b=a.read_shift(2),c=U(a);return[b,c]}function W(a,b){a.l+=4,b-=4;var c=a.l+b,d=I(a,b),e=a.read_shift(2);if(c-=a.l,e!==c)throw"Malformed AddinUdf: padding = "+c+" != "+e;return a.l+=e,d}function X(a){var b=a.read_shift(2),c=a.read_shift(2),d=a.read_shift(2),e=a.read_shift(2);return{s:{c:d,r:b},e:{c:e,r:c}}}function Y(a){var b=a.read_shift(2),c=a.read_shift(2),d=a.read_shift(1),e=a.read_shift(1);return{s:{c:d,r:b},e:{c:e,r:c}}}function Z(a){a.l+=4;var b=a.read_shift(2),c=a.read_shift(2),d=a.read_shift(2);return a.l+=12,[c,b,d]}function $(a){var b={};return a.l+=4,a.l+=16,b.fSharedNote=a.read_shift(2),a.l+=4,b}function _(a){var b={};return a.l+=4,a.cf=a.read_shift(2),b}function ab(a,b){for(var c=a.l,d=[];a.l<c+b;){var e=a.read_shift(2);a.l-=2;try{d.push(Ie[e](a,c+b-a.l))}catch(f){return a.l=c+b,d}}return a.l!=c+b&&(a.l=c+b),d}function bb(a,b){var c={};if(c.BIFFVer=a.read_shift(2),b-=2,1536!==c.BIFFVer&&1280!==c.BIFFVer)throw"Unexpected BIFF Ver "+c.BIFFVer;return a.read_shift(b),c}function cb(a,b){if(0===b)return 1200;var c;if(1200!==(c=a.read_shift(2)))throw"InterfaceHdr codePage "+c;return 1200}function db(a,b,c){if(c.enc)return a.l+=b,"";var d=a.l,e=L(a,0,c);return a.read_shift(b+d-a.l),e}function eb(a,b,c){var d=a.read_shift(4),e=a.read_shift(1)>>6,f=a.read_shift(1);switch(f){case 0:f="Worksheet";break;case 1:f="Macrosheet";break;case 2:f="Chartsheet";break;case 6:f="VBAModule"}var g=I(a,0,c);return{pos:d,hs:e,dt:f,name:g}}function fb(a){for(var b=a.read_shift(4),c=a.read_shift(4),d=[],e=0;e!=c;++e)d.push(J(a));return d.Count=b,d.Unique=c,d}function gb(a,b){var c={};return c.dsst=a.read_shift(2),a.l+=b-2,c}function hb(a){{var b=a.read_shift(2),c=a.read_shift(2),d=a.read_shift(2);a.read_shift(2)}a.read_shift(4);a.read_shift(1);return a.read_shift(1),a.read_shift(2),{r:b,c:c,cnt:d-c}}function ib(a){var b=R(a);if(2211!=b.type)throw"Invalid Future Record "+b.type;var c=a.read_shift(4);return 0!==c}function jb(a){return a.read_shift(2),a.read_shift(4)}function kb(a){var b,c=a.read_shift(2);b=a.read_shift(2);var d={Unsynced:1&c,DyZero:(2&c)>>1,ExAsc:(4&c)>>2,ExDsc:(8&c)>>3};return[d,b]}function lb(a){var b=a.read_shift(2),c=a.read_shift(2),d=a.read_shift(2),e=a.read_shift(2),f=a.read_shift(2),g=a.read_shift(2),h=a.read_shift(2),i=a.read_shift(2),j=a.read_shift(2);return{Pos:[b,c],Dim:[d,e],Flags:f,CurTab:g,FirstTab:h,Selected:i,TabRatio:j}}function mb(a,b,c){a.l+=14;var d=I(a,0,c);return d}function nb(a){var b=Q(a);return b.isst=a.read_shift(4),b}function ob(a,b,c){var d=Q(a,6),e=L(a,b-6,c);return d.val=e,d}function pb(a,b,c){var d=a.read_shift(2),e=M(a,0,c);return[d,e]}function qb(a,b){var c=10===b?2:4,d=a.read_shift(c),e=a.read_shift(c),f=a.read_shift(2),g=a.read_shift(2);return a.l+=2,{s:{r:d,c:f},e:{r:e,c:g}}}function rb(a){var b=a.read_shift(2),c=a.read_shift(2),d=V(a);return{r:b,c:c,ixfe:d[0],rknum:d[1]}}function sb(a,b){for(var c=a.l+b-2,d=a.read_shift(2),e=a.read_shift(2),f=[];a.l<c;)f.push(V(a));if(a.l!==c)throw"MulRK read error";var g=a.read_shift(2);if(f.length!=g-e+1)throw"MulRK length mismatch";return{r:d,c:e,C:g,rkrec:f}}function tb(a,b){var c={};return c.ifnt=a.read_shift(2),c.ifmt=a.read_shift(2),c.flags=a.read_shift(2),c.fStyle=c.flags>>2&1,b-=6,c.data=c.fStyle?Me(a,b):Le(a,b),c}function ub(a){a.l+=4;var b=[a.read_shift(2),a.read_shift(2)];if(0!==b[0]&&b[0]--,0!==b[1]&&b[1]--,b[0]>7||b[1]>7)throw"Bad Gutters: "+b;return b}function vb(a){var b=Q(a,6),c=H(a,2);return b.val=c,b.t=c===!0||c===!1?"b":"e",b}function wb(a){var b=Q(a,6),c=N(a,8);return b.val=c,b}function xb(a,b,c){var d,e=a.l+b,f=a.read_shift(2),g=a.read_shift(2);g>=1&&255>=g&&(d=K(a,g));var h=a.read_shift(e-a.l);return c.sbcch=g,[g,f,d,h]}function yb(a,b,c){var d,e=a.read_shift(2),f={fBuiltIn:1&e,fWantAdvise:e>>>1&1,fWantPict:e>>>2&1,fOle:e>>>3&1,fOleLink:e>>>4&1,cf:e>>>5&1023,fIcon:e>>>15&1};return 14849===c.sbcch&&(d=W(a,b-2)),f.body=d||a.read_shift(b-2),f}function zb(a,b,c){if(c.biff<8)return ob(a,b,c);var d=a.l+b,e=(a.read_shift(2),a.read_shift(1)),f=a.read_shift(1),g=a.read_shift(2);a.l+=2;a.read_shift(2);a.l+=4;var h=K(a,f,c),i=Oc(a,d-a.l,c,g);return{chKey:e,Name:h,rgce:i}}function Ab(a,b,c){if(c.biff<8)return I(a,b,c);var d=D(a,b,T),e=[];if(1025===c.sbcch){for(var f=0;f!=d.length;++f)e.push(c.snames[d[f][1]]);return e}return d}function Bb(a,b,c){Y(a,6);a.l++;var d=a.read_shift(1);return b-=8,[Qc(a,b,c),d]}function Cb(a,b,c){var d=He(a,6);return a.l+=6,b-=12,[d,Rc(a,b,c,d)]}function Db(a){var b=0!==a.read_shift(4),c=0!==a.read_shift(4),d=a.read_shift(4);return[b,c,d]}function Eb(a,b,c){if(!(c.biff<8)){var d=a.read_shift(2),e=a.read_shift(2),f=a.read_shift(2),g=a.read_shift(2),h=M(a,0,c);return c.biff<8&&a.read_shift(1),[{r:d,c:e},h,g,f]}}function Fb(a,b,c){return Eb(a,b,c)}function Gb(a,b){for(var c=[],d=a.read_shift(2);d--;)c.push(X(a,b));return c}function Hb(a,b){var c=Z(a,22),d=ab(a,b-22,c[1]);return{cmo:c,ft:d}}function Ib(a,b,c){var d=a.l;try{a.l+=4;var e,f=(c.lastobj||{cmo:[0,0]}).cmo[1];-1==[0,5,7,11,12,14].indexOf(f)?a.l+=6:e=Ae(a,6,c);var g=a.read_shift(2),h=(a.read_shift(2),Je(a,2),a.read_shift(2));a.l+=h;for(var i="",j=1;j<a.lens.length-1;++j){if(a.l-d!=a.lens[j])throw"TxO: bad continue record";var k=a[a.l],l=K(a,a.lens[j+1]-a.lens[j]-1);if(i+=l,i.length>=(k?g:2*g))break}if(i.length!==g&&i.length!==2*g)throw"cchText: "+g+" != "+i.length;return a.l=d+b,{t:i}}catch(m){return a.l=d+b,{t:i||""}}}function Jb(a){var b,c=[];return b=a.read_shift(2),c[0]=Al[b]||b,b=a.read_shift(2),c[1]=Al[b]||b,c}function Kb(a,b){var c=a.split(/\s+/),d=[];if(b||(d[0]=c[0]),1===c.length)return d;var e,f,g,h,i=a.match(Ik);if(i)for(h=0;h!=i.length;++h)e=i[h].match(Jk),-1===(f=e[1].indexOf(":"))?d[e[1]]=e[2].substr(1,e[2].length-2):(g="xmlns:"===e[1].substr(0,6)?"xmlns"+e[1].substr(6):e[1].substr(f+1),d[g]=e[2].substr(1,e[2].length-2));return d}function Lb(a){var b=a.split(/\s+/),c={};if(1===b.length)return c;var d,e,f,g,h=a.match(Ik);if(h)for(g=0;g!=h.length;++g)d=h[g].match(Jk),-1===(e=d[1].indexOf(":"))?c[d[1]]=d[2].substr(1,d[2].length-2):(f="xmlns:"===d[1].substr(0,6)?"xmlns"+d[1].substr(6):d[1].substr(e+1),c[f]=d[2].substr(1,d[2].length-2));return c}function Mb(a){return"undefined"!=typeof cptable?cptable.utils.encode(1252,a):a.split("").map(function(a){return a.charCodeAt(0)})}function Nb(a){var b={};return b.Major=a.read_shift(2),b.Minor=a.read_shift(2),b}function Ob(a,b){var c={};c.Flags=a.read_shift(4);var d=a.read_shift(4);if(0!==d)throw"Unrecognized SizeExtra: "+d;switch(c.AlgID=a.read_shift(4),c.AlgID){case 0:case 26625:case 26126:case 26127:case 26128:break;default:throw"Unrecognized encryption algorithm: "+c.AlgID}return A(a,b-12),c}function Pb(a,b){return A(a,b)}function Qb(a,b){var c={},d=c.EncryptionVersionInfo=Nb(a,4);if(b-=4,2!=d.Minor)throw"unrecognized minor version code: "+d.Minor;if(d.Major>4||d.Major<2)throw"unrecognized major version code: "+d.Major;c.Flags=a.read_shift(4),b-=4;var e=a.read_shift(4);return b-=4,c.EncryptionHeader=Ob(a,e),b-=e,c.EncryptionVerifier=Pb(a,b),c}function Rb(a,b){var c={},d=c.EncryptionVersionInfo=Nb(a,4);if(b-=4,1!=d.Major||1!=d.Minor)throw"unrecognized version code "+d.Major+" : "+d.Minor;return c.Salt=a.read_shift(16),c.EncryptedVerifier=a.read_shift(16),c.EncryptedVerifierHash=a.read_shift(16),c}function Sb(a){var b,c,e,f,g,h,i=0,j=Mb(a),k=j.length+1;for(b=d(k),b[0]=j.length,c=1;c!=k;++c)b[c]=j[c-1];for(c=k-1;c>=0;--c)e=b[c],f=0===(16384&i)?0:1,g=i<<1&32767,h=f|g,i=h^e;return 52811^i}function Tb(a,b,c,d){var e={key:F(a),verificationBytes:F(a)};return c.password&&(e.verifier=Sb(c.password)),d.valid=e.verificationBytes===e.verifier,d.valid&&(d.insitu_decrypt=Pk(c.password)),e}function Ub(a,b,c){var d=c||{};return d.Info=a.read_shift(2),a.l-=2,d.Data=1===d.Info?Rb(a,b):Qb(a,b),d}function Vb(a,b,c){var d={Type:a.read_shift(2)};return d.Type?Ub(a,b-2,d):Tb(a,b-2,c,d),d}function Wb(a){return function(b){b.l+=a}}function Xb(a){a.l+=1}function Yb(a){var b=a.read_shift(2);return[16383&b,b>>14&1,b>>15&1]}function Zb(a){var b=a.read_shift(2),c=a.read_shift(2),d=Yb(a,2),e=Yb(a,2);return{s:{r:b,c:d[0],cRel:d[1],rRel:d[2]},e:{r:c,c:e[0],cRel:e[1],rRel:e[2]}}}function $b(a){var b=a.read_shift(2),c=a.read_shift(2),d=Yb(a,2),e=Yb(a,2);return{s:{r:b,c:d[0],cRel:d[1],rRel:d[2]},e:{r:c,c:e[0],cRel:e[1],rRel:e[2]}}}function _b(a){var b=a.read_shift(2),c=Yb(a,2);return{r:b,c:c[0],cRel:c[1],rRel:c[2]}}function ac(a){var b=a.read_shift(2),c=a.read_shift(2),d=(32768&c)>>15,e=(16384&c)>>14;if(c&=16383,0!==d)for(;c>=256;)c-=256;return{r:b,c:c,cRel:d,rRel:e}}function bc(a){var b=(96&a[a.l++])>>5,c=Zb(a,8);return[b,c]}function cc(a){var b=(96&a[a.l++])>>5,c=a.read_shift(2),d=Zb(a,8);return[b,c,d]}function dc(a){var b=(96&a[a.l++])>>5;return a.l+=8,[b]}function ec(a){var b=(96&a[a.l++])>>5,c=a.read_shift(2);return a.l+=8,[b,c]}function fc(a){var b=(96&a[a.l++])>>5,c=$b(a,8);return[b,c]}function gc(a){var b=(96&a[a.l++])>>5;return a.l+=7,[b]}function hc(a){var b=1&a[a.l+1],c=1;return a.l+=4,[b,c]}function ic(a){a.l+=2;for(var b=a.read_shift(2),c=[],d=0;b>=d;++d)c.push(a.read_shift(2));return c}function jc(a){var b=255&a[a.l+1]?1:0;return a.l+=2,[b,a.read_shift(2)]}function kc(a){var b=255&a[a.l+1]?1:0;return a.l+=2,[b,a.read_shift(2)]}function lc(a){var b=255&a[a.l+1]?1:0;return a.l+=4,[b]}function mc(a){var b=a.read_shift(1),c=a.read_shift(1);return[b,c]}function nc(a){return a.read_shift(2),mc(a,2)}function oc(a){return a.read_shift(2),mc(a,2)}function pc(a){var b=(31&a[a.l],(96&a[a.l])>>5);a.l+=1;var c=_b(a,4);return[b,c]}function qc(a){var b=(31&a[a.l],(96&a[a.l])>>5);a.l+=1;var c=ac(a,4);return[b,c]}function rc(a){var b=(31&a[a.l],(96&a[a.l])>>5);a.l+=1;var c=a.read_shift(2),d=_b(a,4);return[b,c,d]}function sc(a){31&a[a.l],(96&a[a.l])>>5;a.l+=1;var b=a.read_shift(2);return[xl[b],wl[b]]}function tc(a){a.l++;var b=a.read_shift(1),c=uc(a);return[b,(0===c[0]?wl:vl)[c[1]]]}function uc(a){return[a[a.l+1]>>7,32767&a.read_shift(2)]}function vc(a){a.l++;var b=a.read_shift(2),c=a.read_shift(2);return[b,c]}function wc(a){return a.l++,ul[a.read_shift(1)]}function xc(a){return a.l++,a.read_shift(2)}function yc(a){return a.l++,0!==a.read_shift(1)}function zc(a){return a.l++,N(a,8)}function Ac(a){return a.l++,I(a)}function Bc(a){var b=[];switch(b[0]=a.read_shift(1)){case 4:b[1]=E(a,1)?"TRUE":"FALSE",a.l+=7;break;case 16:b[1]=ul[a[a.l]],a.l+=8;break;case 0:a.l+=8;break;case 1:b[1]=N(a,8);break;case 2:b[1]=L(a)}return b}function Cc(a){for(var b=a.read_shift(2),c=[],d=0;d!=b;++d)c.push(X(a,8));return c}function Dc(a){for(var b=1+a.read_shift(1),c=1+a.read_shift(2),d=0,e=[];d!=c&&(e[d]=[]);++d)for(var f=0;f!=b;++f)e[d][f]=Bc(a);return e}function Ec(a){var b=a.read_shift(1)>>>5&3,c=a.read_shift(4);return[b,0,c]}function Fc(a){var b=a.read_shift(1)>>>5&3,c=a.read_shift(2),d=a.read_shift(4);return[b,c,d]}function Gc(a){var b=a.read_shift(1)>>>5&3;a.l+=4;var c=a.read_shift(2);return[b,c]}function Hc(a){var b=a.read_shift(1)>>>5&3,c=a.read_shift(2);return[b,c]}function Ic(a){var b=a.read_shift(1)>>>5&3;return a.l+=4,[b]}function Jc(a,b,c,d,e,f){var g=d.length>0?0|parseInt(d,10):0,h=f.length>0?0|parseInt(f,10):0;return 0>h&&0===e.length&&(h=0),e.length>0&&(h+=pl.c),c.length>0&&(g+=pl.r),b+ud(h)+rd(g)}function Kc(a,b){return pl=b,a.replace(tl,Jc)}function Lc(a,b,c){var d=Q(a,6),e=Mc(a,8),f=a.read_shift(1);a.read_shift(1);var g=(a.read_shift(4),"");return 5===c.biff?a.l+=b-20:g=Pc(a,b-20,c),{cell:d,val:e[0],formula:g,shared:f>>3&1,tt:e[1]}}function Mc(a){var b;if(65535!==de(a,a.l+6))return[N(a),"n"];switch(a[a.l]){case 0:return a.l+=8,["String","s"];case 1:return b=1===a[a.l+2],a.l+=8,[b,"b"];case 2:return b=ul[a[a.l+2]],a.l+=8,[b,"e"];case 3:return a.l+=8,["","s"]}}function Nc(a,b,c,d){if(d.biff<8)return A(a,b);for(var e=a.l+b,f=[],g=0;g!==c.length;++g)switch(c[g][0]){case"PtgArray":c[g][1]=Dc(a),f.push(c[g][1]);break;case"PtgMemArea":c[g][2]=Cc(a,c[g][1]),f.push(c[g][2])}return b=e-a.l,0!==b&&f.push(A(a,b)),f}function Oc(a,b,c,d){var e,f=a.l+b,g=Sc(a,d);return f!==a.l&&(e=Nc(a,f-a.l,g,c)),[g,e]}function Pc(a,b,c){var d,e=(a.l+b,a.read_shift(2));if(65535==e)return[[],A(a,b-2)];var f=Sc(a,e);return b!==e+2&&(d=Nc(a,b-e-2,f,c)),[f,d]}function Qc(a,b,c){var d,e=a.l+b,f=a.read_shift(2),g=Sc(a,f);return 65535==f?[[],A(a,b-2)]:(b!==f+2&&(d=Nc(a,e-f-2,g,c)),[g,d])}function Rc(a,b,c){var d,e=a.l+b,f=a.read_shift(2);if(65535==f)return[[],A(a,b-2)];var g=Sc(a,f);return b!==f+2&&(d=Nc(a,e-f-2,g,c)),[g,d]}function Sc(a,b){for(var c,d,e=a.l+b,f=[];e!=a.l;)b=e-a.l,d=a[a.l],c=nl[d],(24===d||25===d)&&(d=a[a.l+1],c=(24===d?rl:sl)[d]),f.push(c&&c.f?[c.n,c.f(a,b)]:A(a,b));return f}function Tc(a){return a.map(function(a){return a[1]}).join(",")}function Uc(a,b,c,d,e){if(void 0!==e&&5===e.biff)return"BIFF5??";var f,g,h,i,j,k,l,m=void 0!==b?b:{s:{c:0,r:0}},n=[];if(!a[0]||!a[0][0])return"";for(var o=0,p=a[0].length;p>o;++o){var q=a[0][o];switch(q[0]){case"PtgUminus":n.push("-"+n.pop());break;case"PtgUplus":n.push("+"+n.pop());break;case"PtgPercent":n.push(n.pop()+"%");break;case"PtgAdd":f=n.pop(),g=n.pop(),n.push(g+"+"+f);break;case"PtgSub":f=n.pop(),g=n.pop(),n.push(g+"-"+f);break;case"PtgMul":f=n.pop(),g=n.pop(),n.push(g+"*"+f);break;case"PtgDiv":f=n.pop(),g=n.pop(),n.push(g+"/"+f);break;case"PtgPower":f=n.pop(),g=n.pop(),n.push(g+"^"+f);break;case"PtgConcat":f=n.pop(),g=n.pop(),n.push(g+"&"+f);break;case"PtgLt":f=n.pop(),g=n.pop(),n.push(g+"<"+f);break;case"PtgLe":f=n.pop(),g=n.pop(),n.push(g+"<="+f);break;case"PtgEq":f=n.pop(),g=n.pop(),n.push(g+"="+f);break;case"PtgGe":f=n.pop(),g=n.pop(),n.push(g+">="+f);break;case"PtgGt":f=n.pop(),g=n.pop(),n.push(g+">"+f);break;case"PtgNe":f=n.pop(),g=n.pop(),n.push(g+"<>"+f);break;case"PtgIsect":f=n.pop(),g=n.pop(),n.push(g+" "+f);break;case"PtgUnion":f=n.pop(),g=n.pop(),n.push(g+","+f);break;case"PtgRange":break;case"PtgAttrChoose":break;case"PtgAttrGoto":break;case"PtgAttrIf":break;case"PtgRef":h=q[1][0],i=od(xd(yd(q[1][1])),m),n.push(yd(i));break;case"PtgRefN":h=q[1][0],i=od(xd(yd(q[1][1])),c),n.push(yd(i));break;case"PtgRef3d":h=q[1][0],j=q[1][1],i=od(q[1][2],m),n.push(d[1][j+1]+"!"+yd(i));break;case"PtgFunc":case"PtgFuncVar":var r=q[1][0],s=q[1][1];r||(r=0);var t=n.slice(-r);n.length-=r,"User"===s&&(s=t.shift()),n.push(s+"("+t.join(",")+")");break;case"PtgBool":n.push(q[1]?"TRUE":"FALSE");break;case"PtgInt":n.push(q[1]);break;case"PtgNum":n.push(String(q[1]));break;case"PtgStr":n.push('"'+q[1]+'"');break;case"PtgErr":n.push(q[1]);break;case"PtgArea":h=q[1][0],l=pd(q[1][1],m),n.push(Ad(l));break;case"PtgArea3d":h=q[1][0],j=q[1][1],l=q[1][2],n.push(d[1][j+1]+"!"+Ad(l));break;case"PtgAttrSum":n.push("SUM("+n.pop()+")");break;case"PtgAttrSemi":break;case"PtgName":k=q[1][2];var u=d[0][k],v=u.Name;v in yl&&(v=yl[v]),n.push(v);break;case"PtgNameX":var w=q[1][1];k=q[1][2];var x;d[w+1]?x=d[w+1][k]:d[w-1]&&(x=d[w-1][k]),x||(x={body:"??NAMEX??"}),n.push(x.body);break;case"PtgParen":n.push("("+n.pop()+")");break;case"PtgRefErr":n.push("#REF!");break;case"PtgExp":i={c:q[1][1],r:q[1][0]};var y={c:c.c,r:c.r};if(d.sharedf[yd(i)]){var z=d.sharedf[yd(i)];n.push(Uc(z,m,y,d,e))}else{var A=!1;for(f=0;f!=d.arrayf.length;++f)g=d.arrayf[f],i.c<g[0].s.c||i.c>g[0].e.c||i.r<g[0].s.r||i.r>g[0].e.r||n.push(Uc(g[1],m,y,d,e));A||n.push(q[1])}break;case"PtgArray":n.push("{"+q[1].map(Tc).join(";")+"}");break;case"PtgMemArea":break;case"PtgAttrSpace":break;case"PtgTbl":break;case"PtgMemErr":break;case"PtgMissArg":n.push("");break;case"PtgAreaErr":break;case"PtgAreaN":n.push("");break;case"PtgRefErr3d":break;case"PtgMemFunc":break;default:throw"Unrecognized Formula Token: "+q}}return n[0]}function Vc(a){return function(b){for(var c=0;c!=a.length;++c){var d=a[c];"undefined"==typeof b[d[0]]&&(b[d[0]]=d[1]),"n"===d[2]&&(b[d[0]]=Number(b[d[0]]))}}}function Wc(a){var b,c={},d=a.content,e=28;switch(b=Xd(d,e),e+=4+fe(d,e),c.UserType=b,b=fe(d,e),e+=4,b){case 0:break;case 4294967295:case 4294967294:e+=4;break;default:if(b>400)throw new Error("Unsupported Clipboard: "+b.toString(16));e+=b}if(b=Xd(d,e),e+=0===b.length?0:5+b.length,c.Reserved1=b,1907550708!==(b=fe(d,e)))return c;throw"Unsupported Unicode Extension"}function Xc(a,d){function e(a,b,c,d){var e=c,f=[],g=b.slice(b.l,b.l+e);if(d.enc&&d.enc.insitu_decrypt)switch(a.n){case"BOF":case"FilePass":case"FileLock":case"InterfaceHdr":case"RRDInfo":case"RRDHead":case"UsrExcl":break;default:if(0===g.length)break;d.enc.insitu_decrypt(g)}f.push(g),b.l+=e;for(var h=zl[de(b,b.l)];null!=h&&"Continue"===h.n;)e=de(b,b.l+2),f.push(b.slice(b.l+4,b.l+4+e)),b.l+=4+e,h=zl[de(b,b.l)];var j=be(f);i(j,0);var k=0;j.lens=[];for(var l=0;l<f.length;++l)j.lens.push(k),k+=f[l].length;return a.f(j,j.length,d)}function f(a,b){if(a.XF)try{var c=a.XF.ifmt||0;a.w=0===c?"n"===a.t?(0|a.v)===a.v?he._general_int(a.v):he._general_num(a.v):he._general(a.v):he.format(c,a.v),b.cellNF&&(a.z=he._table[c])}catch(d){if(b.WTF)throw d}}function g(a,b,c){return{v:a,ixfe:b,t:c}}function h(a,b){var d,h,i,j,k,l,m,n,o={opts:{}},p={},q={},r={},s={},t=null,u=[],v="",w={},x={},y=[],z=!0,A=[],B=function(a,b,c){z&&(d=a,h=yd(a),s.s&&(a.r<s.s.r&&(s.s.r=a.r),a.c<s.s.c&&(s.s.c=a.c)),s.e&&(a.r+1>s.e.r&&(s.e.r=a.r+1),a.c+1>s.e.c&&(s.e.c=a.c+1)),c.sheetRows&&d.r>=c.sheetRows?z=!1:q[h]=b)},C={enc:!1,sbcch:0,snames:[],sharedf:x,arrayf:y,rrtabid:[],lastuser:"",biff:8,codepage:0,winlocked:0,wtf:!1};b.password&&(C.password=b.password);var D=[],E=[],F=[[]],G=0,H=0,I=0;F.SheetNames=C.snames,F.sharedf=C.sharedf,F.arrayf=C.arrayf;for(var J="",K=0;a.l<a.length-1;){var L=a.l,M=a.read_shift(2);if(0===M&&"EOF"===J)break;var N=a.l===a.length?0:a.read_shift(2),O=zl[M];if(O&&O.f){if(b.bookSheets&&"BoundSheet8"===J&&"BoundSheet8"!==O.n)break;if(J=O.n,2===O.r||12==O.r){var P=a.read_shift(2);if(N-=2,!C.enc&&P!==M)throw"rt mismatch";12==O.r&&(a.l+=10,N-=10)}var Q;Q="EOF"===O.n?O.f(a,N,C):e(O,a,N,C);var R=O.n;if(5===C.biff)switch(R){case"Lbl":R="Label"}switch(R){case"Date1904":o.opts.Date1904=Q;break;case"WriteProtect":o.opts.WriteProtect=!0;break;case"FilePass":if(C.enc||(a.l=0),C.enc=Q,C.WTF&&console.error(Q),!b.password)throw new Error("File is password-protected");if(0!==Q.Type)throw new Error("Encryption scheme unsupported");if(!Q.valid)throw new Error("Password is incorrect");break;case"WriteAccess":C.lastuser=Q;break;case"FileSharing":break;case"CodePage":21010===Q&&(Q=1200),C.codepage=Q,c(Q);break;case"RRTabId":C.rrtabid=Q;break;case"WinProtect":C.winlocked=Q;break;case"Template":break;case"RefreshAll":o.opts.RefreshAll=Q;break;case"BookBool":break;case"UsesELFs":break;case"MTRSettings":if(Q[0]&&Q[1])throw"Unsupported threads: "+Q;break;case"CalcCount":o.opts.CalcCount=Q;break;case"CalcDelta":o.opts.CalcDelta=Q;break;case"CalcIter":o.opts.CalcIter=Q;break;case"CalcMode":o.opts.CalcMode=Q;break;case"CalcPrecision":o.opts.CalcPrecision=Q;break;case"CalcSaveRecalc":o.opts.CalcSaveRecalc=Q;break;case"CalcRefMode":C.CalcRefMode=Q;break;case"Uncalced":break;case"ForceFullCalculation":o.opts.FullCalc=Q;break;case"WsBool":break;case"XF":A.push(Q);break;case"ExtSST":break;case"BookExt":break;case"RichTextStream":break;case"BkHim":break;case"SupBook":F[++G]=[Q],H=0;break;case"ExternName":F[G][++H]=Q;break;case"Index":break;case"Lbl":F[0][++I]=Q;break;case"ExternSheet":F[G]=F[G].concat(Q),H+=Q.length;break;case"Protect":q["!protect"]=Q;break;case"Password":0!==Q&&C.WTF&&console.error("Password verifier: "+Q);break;case"Prot4Rev":case"Prot4RevPass":break;case"BoundSheet8":r[Q.pos]=Q,C.snames.push(Q.name);break;case"EOF":if(--K)break;s.e&&(q["!range"]=s,s.e.r>0&&s.e.c>0&&(s.e.r--,s.e.c--,q["!ref"]=Ad(s),s.e.r++,s.e.c++),D.length>0&&(q["!merges"]=D),E.length>0&&(q["!objects"]=E)),""===v?w=q:p[v]=q,q={};break;case"BOF":if(1280===Q.BIFFVer&&(C.biff=5),K++)break;z=!0,q={},v=(r[L]||{name:""}).name,D=[],E=[];break;case"Number":m={ixfe:Q.ixfe,XF:A[Q.ixfe],v:Q.val,t:"n"},m.XF&&f(m,b),B({c:Q.c,r:Q.r},m,b);break;case"BoolErr":m={ixfe:Q.ixfe,XF:A[Q.ixfe],v:Q.val,t:Q.t},m.XF&&f(m,b),B({c:Q.c,r:Q.r},m,b);break;case"RK":m={ixfe:Q.ixfe,XF:A[Q.ixfe],v:Q.rknum,t:"n"},m.XF&&f(m,b),B({c:Q.c,r:Q.r},m,b);break;case"MulRk":for(var S=Q.c;S<=Q.C;++S){var T=Q.rkrec[S-Q.c][0];m={ixfe:T,XF:A[T],v:Q.rkrec[S-Q.c][1],t:"n"},m.XF&&f(m,b),B({c:S,r:Q.r},m,b)}break;case"Formula":switch(Q.val){case"String":t=Q;break;case"Array Formula":throw"Array Formula unsupported";default:m={v:Q.val,ixfe:Q.cell.ixfe,t:Q.tt},m.XF=A[m.ixfe],b.cellFormula&&(m.f="="+Uc(Q.formula,s,Q.cell,F,C)),m.XF&&f(m,b),B(Q.cell,m,b),t=Q}break;case"String":t&&(t.val=Q,m={v:t.val,ixfe:t.cell.ixfe,t:"s"},m.XF=A[m.ixfe],b.cellFormula&&(m.f="="+Uc(t.formula,s,t.cell,F,C)),m.XF&&f(m,b),B(t.cell,m,b),t=null);break;case"Array":y.push(Q);break;case"ShrFmla":if(!z)break;x[yd(t.cell)]=Q[0];break;case"LabelSst":m=g(u[Q.isst].t,Q.ixfe,"s"),m.XF=A[m.ixfe],m.XF&&f(m,b),B({c:Q.c,r:Q.r},m,b);break;case"Label":m=g(Q.val,Q.ixfe,"s"),m.XF=A[m.ixfe],m.XF&&f(m,b),B({c:Q.c,r:Q.r},m,b);break;case"Dimensions":1===K&&(s=Q);break;case"SST":u=Q;break;case"Format":he.load(Q[1],Q[0]);break;case"MergeCells":D=D.concat(Q);break;case"Obj":E[Q.cmo[0]]=C.lastobj=Q;break;case"TxO":C.lastobj.TxO=Q;break;case"HLink":for(l=Q[0].s.r;l<=Q[0].e.r;++l)for(k=Q[0].s.c;k<=Q[0].e.c;++k)q[yd({c:k,r:l})]&&(q[yd({c:k,r:l})].l=Q[1]);break;case"HLinkTooltip":for(l=Q[0].s.r;l<=Q[0].e.r;++l)for(k=Q[0].s.c;k<=Q[0].e.c;++k)q[yd({c:k,r:l})]&&(q[yd({c:k,r:l})].l.tooltip=Q[1]);break;case"Note":if(5===C.biff)break;i=q[yd(Q[0])];var U=E[Q[2]];if(!i)break;i.c||(i.c=[]),j={a:Q[1],t:U.TxO.t},i.c.push(j);break;case"NameCmt":break;default:switch(O.n){case"Header":break;case"Footer":break;case"HCenter":break;case"VCenter":break;case"Pls":break;case"Setup":break;case"DefColWidth":break;case"GCW":break;case"LHRecord":break;case"ColInfo":break;case"Row":break;case"DBCell":break;case"MulBlank":break;case"EntExU2":break;case"SxView":break;case"Sxvd":break;case"SXVI":break;case"SXVDEx":break;case"SxIvd":break;case"SXDI":break;case"SXLI":break;case"SXEx":break;case"QsiSXTag":break;case"Selection":break;case"Feat":break;case"FeatHdr":case"FeatHdr11":break;case"Feature11":case"Feature12":case"List12":break;case"Blank":break;case"Country":n=Q;break;case"RecalcId":break;case"DefaultRowHeight":case"DxGCol":break;case"Fbi":case"Fbi2":case"GelFrame":break;case"Font":break;case"XFCRC":break;case"XFExt":break;case"Style":break;case"StyleExt":break;case"Palette":break;case"ClrtClient":break;case"Theme":break;case"ScenarioProtect":break;case"ObjProtect":break;case"CondFmt12":break;case"Table":break;case"TableStyles":break;case"TableStyle":break;case"TableStyleElement":break;case"SXStreamID":break;case"SXVS":break;case"DConRef":break;case"SXAddl":break;case"DConName":break;case"SXPI":break;case"SxFormat":break;case"SxSelect":break;case"SxRule":break;case"SxFilt":break;case"SxItm":break;case"SxDXF":break;case"ScenMan":break;case"DCon":break;case"CellWatch":break;case"PrintRowCol":break;case"PrintGrid":break;case"PrintSize":break;case"XCT":break;case"CRN":break;case"Scl":break;case"SheetExt":break;case"SheetExtOptional":break;case"ObNoMacros":break;case"ObProj":break;case"CodeName":break;case"GUIDTypeLib":break;case"WOpt":break;case"PhoneticInfo":break;case"OleObjectSize":break;case"DXF":case"DXFN":case"DXFN12":case"DXFN12List":case"DXFN12NoCB":break;case"Dv":case"DVal":break;case"BRAI":case"Series":case"SeriesText":break;case"DConn":break;case"DbOrParamQry":break;case"DBQueryExt":break;case"IFmtRecord":break;case"CondFmt":case"CF":case"CF12":case"CFEx":break;case"Excel9File":break;case"Units":break;case"InterfaceHdr":case"Mms":case"InterfaceEnd":case"DSF":case"BuiltInFnGroupCount":case"Window1":case"Window2":case"HideObj":case"GridSet":case"Guts":case"UserBView":case"UserSViewBegin":case"UserSViewEnd":case"Pane":break;default:switch(O.n){case"Dat":case"Begin":case"End":case"StartBlock":case"EndBlock":case"Frame":case"Area":case"Axis":case"AxisLine":case"Tick":break;case"AxesUsed":case"CrtLayout12":case"CrtLayout12A":case"CrtLink":case"CrtLine":case"CrtMlFrt":break;
case"LineFormat":case"AreaFormat":case"Chart":case"Chart3d":case"Chart3DBarShape":case"ChartFormat":case"ChartFrtInfo":break;case"PlotArea":case"PlotGrowth":break;case"SeriesList":case"SerParent":case"SerAuxTrend":break;case"DataFormat":case"SerToCrt":case"FontX":break;case"CatSerRange":case"AxcExt":case"SerFmt":break;case"ShtProps":break;case"DefaultText":case"Text":case"CatLab":break;case"DataLabExtContents":break;case"Legend":case"LegendException":break;case"Pie":case"Scatter":break;case"PieFormat":case"MarkerFormat":break;case"StartObject":case"EndObject":break;case"AlRuns":case"ObjectLink":break;case"SIIndex":break;case"AttachedLabel":break;case"Line":case"Bar":break;case"Surf":break;case"AxisParent":break;case"Pos":break;case"ValueRange":break;case"SXViewEx9":break;case"SXViewLink":break;case"PivotChartBits":break;case"SBaseRef":break;case"TextPropsStream":break;case"LnExt":break;case"MkrExt":break;case"CrtCoopt":break;case"Qsi":case"Qsif":case"Qsir":case"QsiSXTag":break;case"TxtQry":break;case"FilterMode":break;case"AutoFilter":case"AutoFilterInfo":break;case"AutoFilter12":break;case"DropDownObjIds":break;case"Sort":break;case"SortData":break;case"ShapePropsStream":break;case"MsoDrawing":case"MsoDrawingGroup":case"MsoDrawingSelection":break;case"ImData":break;case"WebPub":case"AutoWebPub":case"RightMargin":case"LeftMargin":case"TopMargin":case"BottomMargin":case"HeaderFooter":case"HFPicture":case"PLV":case"HorizontalPageBreaks":case"VerticalPageBreaks":case"Backup":case"CompressPictures":case"Compat12":break;case"Continue":case"ContinueFrt12":break;case"ExternCount":break;case"RString":break;case"TabIdConf":case"Radar":case"RadarArea":case"DropBar":case"Intl":case"CoordList":case"SerAuxErrBar":break;default:if(b.WTF)throw"Unrecognized Record "+O.n}}}}else a.l+=N}{var V=Object.keys(r).sort(function(a,b){return Number(a)-Number(b)}).map(function(a){return r[a].name});V.slice()}return o.Directory=V,o.SheetNames=V,b.bookSheets||(o.Sheets=p),o.Preamble=w,o.Strings=u,o.SSF=he.get_table(),C.enc&&(o.Encryption=C.enc),o.Metadata={},void 0!==n&&(o.Metadata.Country=n),o}d||(d={}),Bl(d),b();var j=a.find("!CompObj"),k=(a.find("!SummaryInformation"),a.find("/Workbook"));k||(k=a.find("/Book"));var l,m;if(j&&(l=Wc(j)),d.bookProps&&!d.bookSheets)m={};else{if(!k)throw new Error("Cannot find Workbook stream");m=h(k.content,d)}Yc(a);var n={};for(var o in a.Summary)n[o]=a.Summary[o];for(o in a.DocSummary)n[o]=a.DocSummary[o];return m.Props=m.Custprops=n,d.bookFiles&&(m.cfb=a),m.CompObjP=l,m}function Yc(a){var b=a.find("!DocumentSummaryInformation");if(b)try{a.DocSummary=z(b,ve)}catch(c){}var d=a.find("!SummaryInformation");if(d)try{a.Summary=z(d,we)}catch(c){}}function Zc(a,b){return Hk(parseInt(b,16))}function $c(a){return Kk[a]}function _c(a){return a.indexOf("&")>-1&&(a=a.replace(Cl,$c)),-1===a.indexOf("_")?a:a.replace(Dl,Zc)}function ad(a){switch(a){case"1":case"true":case"TRUE":return!0;default:return!1}}function bd(a,b){return String.fromCharCode(parseInt(b,10))}function cd(a){return a.replace(El,bd)}function dd(a,b){var c=Fl[a]||_c(a);return"General"===c?he._general(b):he.format(c,b)}function ed(a,b,c){switch(b){case"Description":b="Comments"}a[b]=c}function fd(a,b,c,d){switch((c[0].match(/dt:dt="([\w.]+)"/)||["",""])[1]){case"boolean":d=ad(d);break;case"i2":case"int":d=parseInt(d,10);break;case"r4":case"float":d=parseFloat(d);break;case"date":case"dateTime.tz":d=new Date(d);break;case"i8":case"string":case"fixed":case"uuid":case"bin.base64":break;default:throw"bad custprop:"+c[0]}a[_c(b[3])]=d}function gd(a,b,c){try{a.w="General"===b?"n"===a.t?(0|a.v)===a.v?he._general_int(a.v):he._general_num(a.v):he._general(a.v):dd(b||"General",a.v),c.cellNF&&(a.z=Fl[b]||b||"General")}catch(d){if(c.WTF)throw d}}function hd(a,b,c,d,e,f,g,h){var i="General",j=d.StyleID;for(h=h||{},void 0===j&&g&&(j=g.StyleID);void 0!==f[j]&&(f[j].nf&&(i=f[j].nf),f[j].Parent);)j=f[j].Parent;switch(c.Type){case"Boolean":d.t="b",d.v=ad(a);break;case"String":d.t="str",d.r=cd(_c(a)),d.v=a.indexOf("<")>-1?b:d.r;break;case"DateTime":d.v=(Date.parse(a)-new Date(Date.UTC(1899,11,30)))/864e5,d.v!==d.v?d.v=_c(a):d.v>=1&&d.v<60&&(d.v=d.v-1),i&&"General"!=i||(i="yyyy-mm-dd");case"Number":void 0===d.v&&(d.v=+a),d.t||(d.t="n");break;case"Error":d.t="e",d.v=a,d.w=a;break;default:d.t="s",d.v=cd(b)}"e"!==d.t&&gd(d,i,h),null!=h.cellFormula&&d.Formula&&(d.f=Kc(_c(d.Formula),e),d.Formula=void 0),d.ixfe=void 0!==d.StyleID?d.StyleID:"Default"}function id(a){a.t=a.v,a.v=a.w=a.ixfe=void 0}function jd(a){if(Nd&&Buffer.isBuffer(a))return a.toString("utf8");if("string"==typeof a)return a;throw"badf"}function kd(a,b){for(var c,d,e,f,g,h=jd(a),i=[],j={},k=[],l={},m="",n={},o={},p={},q=0,r=0,s={s:{r:1e6,c:1e6},e:{r:0,c:0}},t={},u={},v="",w=0,x=[],y={},z={},A=0,B={},C=[],D={},E=[];c=Gl.exec(h);)switch(c[3]){case"Data":if(i[i.length-1][1])break;"/"===c[1]?hd(h.slice(f,c.index),v,e,"Comment"==i[i.length-1][0]?D:o,{c:q,r:r},t,E[q],b):(v="",e=Kb(c[0]),f=c.index+c[0].length);break;case"Cell":if("/"===c[1]){if(C.length>0&&(o.c=C),(!b.sheetRows||b.sheetRows>r)&&void 0!==o.v&&(l[ud(q)+rd(r)]=o),o.HRef&&(o.l={Target:o.HRef,tooltip:o.HRefScreenTip},o.HRef=o.HRefScreenTip=void 0),o.MergeAcross||o.MergeDown){var F=q+(0|parseInt(o.MergeAcross,10)),G=r+(0|parseInt(o.MergeDown,10));x.push({s:{c:q,r:r},e:{c:F,r:G}})}++q,o.MergeAcross&&(q+=+o.MergeAcross)}else o=Lb(c[0]),o.Index&&(q=+o.Index-1),q<s.s.c&&(s.s.c=q),q>s.e.c&&(s.e.c=q),"/>"===c[0].substr(-2)&&++q,C=[];break;case"Row":"/"===c[1]||"/>"===c[0].substr(-2)?(r<s.s.r&&(s.s.r=r),r>s.e.r&&(s.e.r=r),"/>"===c[0].substr(-2)&&(p=Kb(c[0]),p.Index&&(r=+p.Index-1)),q=0,++r):(p=Kb(c[0]),p.Index&&(r=+p.Index-1));break;case"Worksheet":if("/"===c[1]){if((d=i.pop())[0]!==c[3])throw"Bad state: "+d;k.push(m),s.s.r<=s.e.r&&s.s.c<=s.e.c&&(l["!ref"]=Ad(s)),x.length&&(l["!merges"]=x),j[m]=l}else s={s:{r:1e6,c:1e6},e:{r:0,c:0}},r=q=0,i.push([c[3],!1]),d=Kb(c[0]),m=d.Name,l={},x=[];break;case"Table":if("/"===c[1]){if((d=i.pop())[0]!==c[3])throw"Bad state: "+d}else{if("/>"==c[0].slice(-2))break;n=Kb(c[0]),i.push([c[3],!1]),E=[]}break;case"Style":"/"===c[1]?t[u.ID]=u:u=Kb(c[0]);break;case"NumberFormat":u.nf=Kb(c[0]).Format||"General";break;case"Column":if("Table"!==i[i.length-1][0])break;g=Kb(c[0]),E[g.Index-1||E.length]=g;for(var H=0;H<+g.Span;++H)E[E.length]=g;break;case"NamedRange":break;case"NamedCell":break;case"B":break;case"I":break;case"U":break;case"S":break;case"Sub":break;case"Sup":break;case"Span":break;case"Border":break;case"Alignment":break;case"Borders":break;case"Font":if("/>"===c[0].substr(-2))break;"/"===c[1]?v+=h.slice(w,c.index):w=c.index+c[0].length;break;case"Interior":break;case"Protection":break;case"Author":case"Title":case"Description":case"Created":case"Keywords":case"Subject":case"Category":case"Company":case"LastAuthor":case"LastSaved":case"LastPrinted":case"Version":case"Revision":case"TotalTime":case"HyperlinkBase":case"Manager":if("/>"===c[0].substr(-2))break;"/"===c[1]?ed(y,c[3],h.slice(A,c.index)):A=c.index+c[0].length;break;case"Paragraphs":break;case"Styles":case"Workbook":if("/"===c[1]){if((d=i.pop())[0]!==c[3])throw"Bad state: "+d}else i.push([c[3],!1]);break;case"Comment":if("/"===c[1]){if((d=i.pop())[0]!==c[3])throw"Bad state: "+d;id(D),C.push(D)}else i.push([c[3],!1]),d=Kb(c[0]),D={a:d.Author};break;case"Name":break;case"ComponentOptions":case"DocumentProperties":case"CustomDocumentProperties":case"OfficeDocumentSettings":case"PivotTable":case"PivotCache":case"Names":case"MapInfo":case"PageBreaks":case"QueryTable":case"DataValidation":case"AutoFilter":case"Sorting":case"Schema":case"data":case"ConditionalFormatting":case"SmartTagType":case"SmartTags":case"ExcelWorkbook":case"WorkbookOptions":case"WorksheetOptions":if("/"===c[1]){if((d=i.pop())[0]!==c[3])throw"Bad state: "+d}else"/"!==c[0].charAt(c[0].length-2)&&i.push([c[3],!0]);break;default:var I=!0;switch(i[i.length-1][0]){case"OfficeDocumentSettings":switch(c[3]){case"AllowPNG":break;case"RemovePersonalInformation":break;case"DownloadComponents":break;case"LocationOfComponents":break;case"Colors":break;case"Color":break;case"Index":break;case"RGB":break;case"PixelsPerInch":break;case"TargetScreenSize":break;case"ReadOnlyRecommended":break;default:I=!1}break;case"ComponentOptions":switch(c[3]){case"Toolbar":break;case"HideOfficeLogo":break;case"SpreadsheetAutoFit":break;case"Label":break;case"Caption":break;case"MaxHeight":break;case"MaxWidth":break;case"NextSheetNumber":break;default:I=!1}break;case"ExcelWorkbook":switch(c[3]){case"WindowHeight":break;case"WindowWidth":break;case"WindowTopX":break;case"WindowTopY":break;case"TabRatio":break;case"ProtectStructure":break;case"ProtectWindows":break;case"ActiveSheet":break;case"DisplayInkNotes":break;case"FirstVisibleSheet":break;case"SupBook":break;case"SheetName":break;case"SheetIndex":break;case"SheetIndexFirst":break;case"SheetIndexLast":break;case"Dll":break;case"AcceptLabelsInFormulas":break;case"DoNotSaveLinkValues":break;case"Date1904":break;case"Iteration":break;case"MaxIterations":break;case"MaxChange":break;case"Path":break;case"Xct":break;case"Count":break;case"SelectedSheets":break;case"Calculation":break;case"Uncalced":break;case"StartupPrompt":break;case"Crn":break;case"ExternName":break;case"Formula":break;case"ColFirst":break;case"ColLast":break;case"WantAdvise":break;case"Boolean":break;case"Error":break;case"Text":break;case"OLE":break;case"NoAutoRecover":break;case"PublishObjects":break;case"DoNotCalculateBeforeSave":break;case"Number":break;case"RefModeR1C1":break;case"EmbedSaveSmartTags":break;default:I=!1}break;case"WorkbookOptions":switch(c[3]){case"OWCVersion":break;case"Height":break;case"Width":break;default:I=!1}break;case"WorksheetOptions":switch(c[3]){case"Unsynced":break;case"Visible":break;case"Print":break;case"Panes":break;case"Scale":break;case"Pane":break;case"Number":break;case"Layout":break;case"Header":break;case"Footer":break;case"PageSetup":break;case"PageMargins":break;case"Selected":break;case"ProtectObjects":break;case"EnableSelection":break;case"ProtectScenarios":break;case"ValidPrinterInfo":break;case"HorizontalResolution":break;case"VerticalResolution":break;case"NumberofCopies":break;case"ActiveRow":break;case"ActiveCol":break;case"ActivePane":break;case"TopRowVisible":break;case"TopRowBottomPane":break;case"LeftColumnVisible":break;case"LeftColumnRightPane":break;case"FitToPage":break;case"RangeSelection":break;case"PaperSizeIndex":break;case"PageLayoutZoom":break;case"PageBreakZoom":break;case"FilterOn":break;case"DoNotDisplayGridlines":break;case"SplitHorizontal":break;case"SplitVertical":break;case"FreezePanes":break;case"FrozenNoSplit":break;case"FitWidth":break;case"FitHeight":break;case"CommentsLayout":break;case"Zoom":break;case"LeftToRight":break;case"Gridlines":break;case"AllowSort":break;case"AllowFilter":break;case"AllowInsertRows":break;case"AllowDeleteRows":break;case"AllowInsertCols":break;case"AllowDeleteCols":break;case"AllowInsertHyperlinks":break;case"AllowFormatCells":break;case"AllowSizeCols":break;case"AllowSizeRows":break;case"NoSummaryRowsBelowDetail":break;case"TabColorIndex":break;case"DoNotDisplayHeadings":break;case"ShowPageLayoutZoom":break;case"NoSummaryColumnsRightDetail":break;case"BlackAndWhite":break;case"DoNotDisplayZeros":break;case"DisplayPageBreak":break;case"RowColHeadings":break;case"DoNotDisplayOutline":break;case"NoOrientation":break;case"AllowUsePivotTables":break;case"ZeroHeight":break;case"ViewableRange":break;case"Selection":break;case"ProtectContents":break;default:I=!1}break;case"PivotTable":case"PivotCache":switch(c[3]){case"ImmediateItemsOnDrop":break;case"ShowPageMultipleItemLabel":break;case"CompactRowIndent":break;case"Location":break;case"PivotField":break;case"Orientation":break;case"LayoutForm":break;case"LayoutSubtotalLocation":break;case"LayoutCompactRow":break;case"Position":break;case"PivotItem":break;case"DataType":break;case"DataField":break;case"SourceName":break;case"ParentField":break;case"PTLineItems":break;case"PTLineItem":break;case"CountOfSameItems":break;case"Item":break;case"ItemType":break;case"PTSource":break;case"CacheIndex":break;case"ConsolidationReference":break;case"FileName":break;case"Reference":break;case"NoColumnGrand":break;case"NoRowGrand":break;case"BlankLineAfterItems":break;case"Hidden":break;case"Subtotal":break;case"BaseField":break;case"MapChildItems":break;case"Function":break;case"RefreshOnFileOpen":break;case"PrintSetTitles":break;case"MergeLabels":break;case"DefaultVersion":break;case"RefreshName":break;case"RefreshDate":break;case"RefreshDateCopy":break;case"VersionLastRefresh":break;case"VersionLastUpdate":break;case"VersionUpdateableMin":break;case"VersionRefreshableMin":break;case"Calculation":break;default:I=!1}break;case"PageBreaks":switch(c[3]){case"ColBreaks":break;case"ColBreak":break;case"RowBreaks":break;case"RowBreak":break;case"ColStart":break;case"ColEnd":break;case"RowEnd":break;default:I=!1}break;case"AutoFilter":switch(c[3]){case"AutoFilterColumn":break;case"AutoFilterCondition":break;case"AutoFilterAnd":break;case"AutoFilterOr":break;default:I=!1}break;case"QueryTable":switch(c[3]){case"Id":break;case"AutoFormatFont":break;case"AutoFormatPattern":break;case"QuerySource":break;case"QueryType":break;case"EnableRedirections":break;case"RefreshedInXl9":break;case"URLString":break;case"HTMLTables":break;case"Connection":break;case"CommandText":break;case"RefreshInfo":break;case"NoTitles":break;case"NextId":break;case"ColumnInfo":break;case"OverwriteCells":break;case"DoNotPromptForFile":break;case"TextWizardSettings":break;case"Source":break;case"Number":break;case"Decimal":break;case"ThousandSeparator":break;case"TrailingMinusNumbers":break;case"FormatSettings":break;case"FieldType":break;case"Delimiters":break;case"Tab":break;case"Comma":break;case"AutoFormatName":break;case"VersionLastEdit":break;case"VersionLastRefresh":break;default:I=!1}break;case"Sorting":case"ConditionalFormatting":case"DataValidation":switch(c[3]){case"Range":break;case"Type":break;case"Min":break;case"Max":break;case"Sort":break;case"Descending":break;case"Order":break;case"CaseSensitive":break;case"Value":break;case"ErrorStyle":break;case"ErrorMessage":break;case"ErrorTitle":break;case"CellRangeList":break;case"InputMessage":break;case"InputTitle":break;case"ComboHide":break;case"InputHide":break;case"Condition":break;case"Qualifier":break;case"UseBlank":break;case"Value1":break;case"Value2":break;case"Format":break;default:I=!1}break;case"MapInfo":case"Schema":case"data":switch(c[3]){case"Map":break;case"Entry":break;case"Range":break;case"XPath":break;case"Field":break;case"XSDType":break;case"FilterOn":break;case"Aggregate":break;case"ElementType":break;case"AttributeType":break;case"schema":case"element":case"complexType":case"datatype":case"all":case"attribute":case"extends":break;case"row":break;default:I=!1}break;case"SmartTags":break;default:I=!1}if(I)break;if(!i[i.length-1][1])throw"Unrecognized tag: "+c[3]+"|"+i.join("|");if("CustomDocumentProperties"===i[i.length-1][0]){if("/>"===c[0].substr(-2))break;"/"===c[1]?fd(z,c,B,h.slice(A,c.index)):(B=c,A=c.index+c[0].length);break}if(b.WTF)throw"Unrecognized tag: "+c[3]+"|"+i.join("|")}var J={};return b.bookSheets||b.bookProps||(J.Sheets=j),J.SheetNames=k,J.SSF=he.get_table(),J.Props=y,J.Custprops=z,J}function ld(a,b){switch(Bl(b=b||{}),b.type||"base64"){case"base64":return kd(Od.decode(a),b);case"binary":case"buffer":case"file":return kd(a,b);case"array":return kd(a.map(Hk).join(""),b)}}function md(a,b){switch((b||{}).type||"base64"){case"buffer":return a[0];case"base64":return Od.decode(a.substr(0,12)).charCodeAt(0);case"binary":return a.charCodeAt(0);case"array":return a[0];default:throw new Error("Unrecognized type "+b.type)}}function nd(a,b){switch(b||(b={}),b.type||(b.type=Nd&&Buffer.isBuffer(a)?"buffer":"base64"),md(a,b)){case 208:return Xc(ze.read(a,b),b);case 60:return ld(a,b);default:throw"Unsupported file"}}function od(a,b){for(b.s?(a.cRel&&(a.c+=b.s.c),a.rRel&&(a.r+=b.s.r)):(a.c+=b.c,a.r+=b.r),a.cRel=a.rRel=0;a.c>=256;)a.c-=256;for(;a.r>=65536;)a.r-=65536;return a}function pd(a,b){return a.s=od(a.s,b.s),a.e=od(a.e,b.s),a}function qd(a){return parseInt(sd(a),10)-1}function rd(a){return""+(a+1)}function sd(a){return a.replace(/\$(\d+)$/,"$1")}function td(a){for(var b=vd(a),c=0,d=0;d!==b.length;++d)c=26*c+b.charCodeAt(d)-64;return c-1}function ud(a){var b="";for(++a;a;a=Math.floor((a-1)/26))b=String.fromCharCode((a-1)%26+65)+b;return b}function vd(a){return a.replace(/^\$([A-Z])/,"$1")}function wd(a){return a.replace(/(\$?[A-Z]*)(\$?\d*)/,"$1,$2").split(",")}function xd(a){var b=wd(a);return{c:td(b[0]),r:qd(b[1])}}function yd(a){return ud(a.c)+rd(a.r)}function zd(a){var b=a.split(":").map(xd);return{s:b[0],e:b[b.length-1]}}function Ad(a,b){return void 0===b||"number"==typeof b?Ad(a.s,a.e):("string"!=typeof a&&(a=yd(a)),"string"!=typeof b&&(b=yd(b)),a==b?a:a+":"+b)}function Bd(a){var b={s:{c:0,r:0},e:{c:0,r:0}},c=0,d=0,e=0,f=a.length;for(c=0;f>d&&!((e=a.charCodeAt(d)-64)<1||e>26);++d)c=26*c+e;for(b.s.c=--c,c=0;f>d&&!((e=a.charCodeAt(d)-48)<0||e>9);++d)c=10*c+e;if(b.s.r=--c,d===f||58===a.charCodeAt(++d))return b.e.c=b.s.c,b.e.r=b.s.r,b;for(c=0;d!=f&&!((e=a.charCodeAt(d)-64)<1||e>26);++d)c=26*c+e;for(b.e.c=--c,c=0;d!=f&&!((e=a.charCodeAt(d)-48)<0||e>9);++d)c=10*c+e;return b.e.r=--c,b}function Cd(a,b){if(void 0!==a.z)try{return a.w=he.format(a.z,b)}catch(c){}if(!a.XF)return b;try{return a.w=he.format(a.XF.ifmt||0,b)}catch(c){return""+b}}function Dd(a,b){return null==a||null==a.t?"":void 0!==a.w?a.w:void 0===b?Cd(a,a.v):Cd(a,b)}function Ed(a,b){var c,d,e,f,g,h,i,j,k=0,l=1,m=[],n=null!=b?b:{},o=n.raw;if(null==a||null==a["!ref"])return[];switch(e=void 0!==n.range?n.range:a["!ref"],1===n.header?k=1:"A"===n.header?k=2:Array.isArray(n.header)&&(k=3),typeof e){case"string":f=Bd(e);break;case"number":f=Bd(a["!ref"]),f.s.r=e;break;default:f=e}k>0&&(l=0);var p=rd(f.s.r),q=new Array(f.e.c-f.s.c+1),r=new Array(f.e.r-f.s.r-l+1),s=0;for(i=f.s.c;i<=f.e.c;++i)switch(q[i]=ud(i),c=a[q[i]+p],k){case 1:m[i]=i;break;case 2:m[i]=q[i];break;case 3:m[i]=n.header[i-f.s.c];break;default:if(void 0===c)continue;m[i]=Dd(c)}for(h=f.s.r+l;h<=f.e.r;++h){for(p=rd(h),g=!0,d=1===k?[]:Object.create({__rowNum__:h}),i=f.s.c;i<=f.e.c;++i)if(c=a[q[i]+p],void 0!==c&&void 0!==c.t){switch(j=c.v,c.t){case"e":continue;case"s":case"str":break;case"b":case"n":break;default:throw"unrecognized type "+c.t}void 0!==j&&(d[m[i]]=o?j:Dd(c,j),g=!1)}g===!1&&(r[s++]=d)}return r.length=s,r}function Fd(a,b){return Ed(a,null!=b?b:{})}function Gd(a,b){var c="",d="",e=/"/g,f=null==b?{}:b;if(null==a||null==a["!ref"])return"";var g,h=Bd(a["!ref"]),i=void 0!==f.FS?f.FS:",",j=i.charCodeAt(0),k=void 0!==f.RS?f.RS:"\n",l=k.charCodeAt(0),m="",n="",o=[],p=0,q=0,r=0,s=0;for(s=h.s.c;s<=h.e.c;++s)o[s]=ud(s);for(r=h.s.r;r<=h.e.r;++r){for(m="",n=rd(r),s=h.s.c;s<=h.e.c;++s){for(g=a[o[s]+n],d=void 0!==g?""+Dd(g):"",p=0,q=0;p!==d.length;++p)if((q=d.charCodeAt(p))===j||q===l||34===q){d='"'+d.replace(e,'""')+'"';break}m+=(s===h.s.c?"":i)+d}c+=m+k}return c}function Hd(a){var b,c,d="",e="";if(null==a||null==a["!ref"])return"";var f,g=Bd(a["!ref"]),h="",i=[];b=new Array((g.e.r-g.s.r+1)*(g.e.c-g.s.c+1));var j=0;for(f=g.s.c;f<=g.e.c;++f)i[f]=ud(f);for(var k=g.s.r;k<=g.e.r;++k)for(h=rd(k),f=g.s.c;f<=g.e.c;++f)if(d=i[f]+h,c=a[d],e="",void 0!==c){if(null!=c.f)e=c.f;else if(void 0!==c.w)e="'"+c.w;else{if(void 0===c.v)continue;e=""+c.v}b[j++]=d+"="+e}return b.length=j,b}a.version="0.7.1";var Id,Jd=1252;"undefined"!=typeof module&&"undefined"!=typeof require&&("undefined"==typeof cptable&&(cptable=require("./dist/cpexcel")),Id=cptable[Jd]);var Kd=function(a){return String.fromCharCode(a)};"undefined"!=typeof cptable&&(Kd=function(a){return 1200===Jd?String.fromCharCode(a):cptable.utils.decode(Jd,[255&a,a>>8])[0]});var Ld,Md,Nd="undefined"!=typeof Buffer,Od=function(){var a="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";return{decode:function(b){var c,d,e,f,g,h,i,j="";b=b.replace(/[^A-Za-z0-9\+\/\=]/g,"");for(var k=0;k<b.length;)f=a.indexOf(b.charAt(k++)),g=a.indexOf(b.charAt(k++)),h=a.indexOf(b.charAt(k++)),i=a.indexOf(b.charAt(k++)),c=f<<2|g>>4,d=(15&g)<<4|h>>2,e=(3&h)<<6|i,j+=String.fromCharCode(c),64!=h&&(j+=String.fromCharCode(d)),64!=i&&(j+=String.fromCharCode(e));return j}}}(),Pd=/\u0000/g,Qd=/[\u0001-\u0006]/;Ld=Md=function(a){for(var b=[],c=0;c<a[0].length;++c)b.push.apply(b,a[0][c]);return b};var Rd,Sd;Rd=Sd=function(a,b,c){for(var d=[],e=b;c>e;e+=2)d.push(String.fromCharCode(de(a,e)));return d.join("")};var Td,Ud;Td=Ud=function(a,b,c){return a.slice(b,b+c).map(function(a){return(16>a?"0":"")+a.toString(16)}).join("")};var Vd,Wd;Vd=Wd=function(a,b,c){for(var d=[],e=b;c>e;e++)d.push(String.fromCharCode(ce(a,e)));return d.join("")};var Xd,Yd;Xd=Yd=function(a,b){var c=fe(a,b);return c>0?Vd(a,b+4,b+4+c-1):""};var Zd,$d;Zd=$d=function(a,b){var c=2*fe(a,b);return c>0?Vd(a,b+4,b+4+c-1):""};var _d,ae;_d=ae=function(a,b){return f(a,b)};var be=function(a){return[].concat.apply([],a)};"undefined"!=typeof Buffer&&(Rd=function(a,b,c){return Buffer.isBuffer(a)?a.toString("utf16le",b,c):Sd(a,b,c)},Td=function(a,b,c){return Buffer.isBuffer(a)?a.toString("hex",b,b+c):Ud(a,b,c)},Xd=function(a,b){if(!Buffer.isBuffer(a))return Yd(a,b);var c=a.readUInt32LE(b);return c>0?a.toString("utf8",b+4,b+4+c-1):""},Zd=function(a,b){if(!Buffer.isBuffer(a))return $d(a,b);var c=2*a.readUInt32LE(b);return a.toString("utf16le",b+4,b+4+c-1)},Vd=function(a,b){return this.toString("utf8",a,b)},Ld=function(a){return a[0].length>0&&Buffer.isBuffer(a[0][0])?Buffer.concat(a[0]):Md(a)},be=function(a){return Buffer.isBuffer(a[0])?Buffer.concat(a):[].concat.apply([],a)},_d=function(a,b){return Buffer.isBuffer(a)?a.readDoubleLE(b):ae(a,b)});var ce=function(a,b){return a[b]},de=function(a,b){return 256*a[b+1]+a[b]},ee=function(a,b){var c=256*a[b+1]+a[b];return 32768>c?c:-1*(65535-c+1)},fe=function(a,b){return a[b+3]*(1<<24)+(a[b+2]<<16)+(a[b+1]<<8)+a[b]},ge=function(a,b){return a[b+3]<<24|a[b+2]<<16|a[b+1]<<8|a[b]};"undefined"!=typeof cptable&&(Rd=function(a,b,c){return cptable.utils.decode(1200,a.slice(b,c))},Vd=function(a,b,c){return cptable.utils.decode(65001,a.slice(b,c))},Xd=function(a,b){var c=fe(a,b);return c>0?cptable.utils.decode(Jd,a.slice(b+4,b+4+c-1)):""},Zd=function(a,b){var c=2*fe(a,b);return c>0?cptable.utils.decode(1200,a.slice(b+4,b+4+c-1)):""});var he={},ie=function(a){function b(a){for(var b="",c=a.length-1;c>=0;)b+=a.charAt(c--);return b}function c(a,b){for(var c="";c.length<b;)c+=a;return c}function d(a,b){var d=""+a;return d.length>=b?d:c("0",b-d.length)+d}function e(a,b){var d=""+a;return d.length>=b?d:c(" ",b-d.length)+d}function f(a,b){var d=""+a;return d.length>=b?d:d+c(" ",b-d.length)}function g(a,b){var d=""+Math.round(a);return d.length>=b?d:c("0",b-d.length)+d}function h(a,b){var d=""+a;return d.length>=b?d:c("0",b-d.length)+d}function i(a,b){if(a>x||-x>a)return g(a,b);var c=Math.round(a);return h(c,b)}function j(a,b){return a.length>=7+b&&103===(32|a.charCodeAt(b))&&101===(32|a.charCodeAt(b+1))&&110===(32|a.charCodeAt(b+2))&&101===(32|a.charCodeAt(b+3))&&114===(32|a.charCodeAt(b+4))&&97===(32|a.charCodeAt(b+5))&&108===(32|a.charCodeAt(b+6))}function k(a){for(var b=0;b!=y.length;++b)void 0===a[y[b][0]]&&(a[y[b][0]]=y[b][1])}function l(a,b,c){for(var d=0>a?-1:1,e=a*d,f=0,g=1,h=0,i=1,j=0,k=0,l=Math.floor(e);b>j&&(l=Math.floor(e),h=l*g+f,k=l*j+i,!(5e-10>e-l));)e=1/(e-l),f=g,g=h,i=j,j=k;if(k>b&&(k=j,h=g),k>b&&(k=i,h=f),!c)return[0,d*h,k];if(0===k)throw"Unexpected state: "+h+" "+g+" "+f+" "+k+" "+j+" "+i;var m=Math.floor(d*h/k);return[m,d*h-m*k,k]}function m(a){return""+a}function n(a,b){switch(typeof a){case"string":return a;case"boolean":return a?"TRUE":"FALSE";case"number":return(0|a)===a?m(a,b):C(a,b)}throw new Error("unsupported value in General format: "+a)}function o(){return 0}function p(a,b,c){if(a>2958465||0>a)return null;var d=0|a,e=Math.floor(86400*(a-d)),f=0,g=[],h={D:d,T:e,u:86400*(a-d)-e,y:0,m:0,d:0,H:0,M:0,S:0,q:0};if(Math.abs(h.u)<1e-6&&(h.u=0),k(null!=b?b:b=[]),b.date1904&&(d+=1462),h.u>.999&&(h.u=0,86400==++e&&(e=0,++d)),60===d)g=c?[1317,10,29]:[1900,2,29],f=3;else if(0===d)g=c?[1317,8,29]:[1900,1,0],f=6;else{d>60&&--d;var i=new Date(1900,0,1);i.setDate(i.getDate()+d-1),g=[i.getFullYear(),i.getMonth()+1,i.getDate()],f=i.getDay(),60>d&&(f=(f+6)%7),c&&(f=o(i,g))}return h.y=g[0],h.m=g[1],h.d=g[2],h.S=e%60,e=Math.floor(e/60),h.M=e%60,e=Math.floor(e/60),h.H=e,h.q=f,h}function q(a,b,c,e){var f,g="",h=0,i=0,j=c.y,k=0;switch(a){case 98:j=c.y+543;case 121:switch(b.length){case 1:case 2:f=j%100,k=2;break;default:f=j%1e4,k=4}break;case 109:switch(b.length){case 1:case 2:f=c.m,k=b.length;break;case 3:return B[c.m-1][1];case 5:return B[c.m-1][0];default:return B[c.m-1][2]}break;case 100:switch(b.length){case 1:case 2:f=c.d,k=b.length;break;case 3:return A[c.q][0];default:return A[c.q][1]}break;case 104:switch(b.length){case 1:case 2:f=1+(c.H+11)%12,k=b.length;break;default:throw"bad hour format: "+b}break;case 72:switch(b.length){case 1:case 2:f=c.H,k=b.length;break;default:throw"bad hour format: "+b}break;case 77:switch(b.length){case 1:case 2:f=c.M,k=b.length;break;default:throw"bad minute format: "+b}break;case 115:if(0===c.u)switch(b){case"s":case"ss":return d(c.S,b.length);case".0":case".00":case".000":}switch(b){case"s":case"ss":case".0":case".00":case".000":return i=e>=2?3===e?1e3:100:1===e?10:1,h=Math.round(i*(c.S+c.u)),h>=60*i&&(h=0),"s"===b?0===h?"0":""+h/i:(g=d(h,2+e),"ss"===b?g.substr(0,2):"."+g.substr(2,b.length-1));default:throw"bad second format: "+b}case 90:switch(b){case"[h]":case"[hh]":f=24*c.D+c.H;break;case"[m]":case"[mm]":f=60*(24*c.D+c.H)+c.M;break;case"[s]":case"[ss]":f=60*(60*(24*c.D+c.H)+c.M)+Math.round(c.S+c.u);break;default:throw"bad abstime format: "+b}k=3===b.length?1:2;break;case 101:f=j,k=1}return k>0?d(f,k):""}function r(a){if(a.length<=3)return a;for(var b=a.length%3,c=a.substr(0,b);b!=a.length;b+=3)c+=(c.length>0?",":"")+a.substr(b,3);return c}function s(a){for(var b,c=[],d=!1,e=0,f=0;e<a.length;++e)switch(b=a.charCodeAt(e)){case 34:d=!d;break;case 95:case 42:case 92:++e;break;case 59:c[c.length]=a.substr(f,e-f),f=e+1}if(c[c.length]=a.substr(f),d===!0)throw new Error("Format |"+a+"| unterminated string ");return c}function t(a,b,c,d){for(var e,f,g,h,i=[],k="",l=0,m="",o="t",r="H";l<a.length;)switch(m=a[l]){case"G":if(!j(a,l))throw new Error("unrecognized character "+m+" in "+a);i[i.length]={t:"G",v:"General"},l+=7;break;case'"':for(k="";34!==(h=a.charCodeAt(++l))&&l<a.length;)k+=String.fromCharCode(h);i[i.length]={t:"t",v:k},++l;break;case"\\":var s=a[++l],t="("===s||")"===s?s:"t";i[i.length]={t:t,v:s},++l;break;case"_":i[i.length]={t:"t",v:" "},l+=2;break;case"@":i[i.length]={t:"T",v:b},++l;break;case"B":case"b":if("1"===a[l+1]||"2"===a[l+1]){if(null==f&&(f=p(b,c,"2"===a[l+1]),null==f))return"";i[i.length]={t:"X",v:a.substr(l,2)},o=m,l+=2;break}case"M":case"D":case"Y":case"H":case"S":case"E":m=m.toLowerCase();case"m":case"d":case"y":case"h":case"s":case"e":case"g":if(0>b)return"";if(null==f&&(f=p(b,c),null==f))return"";for(k=m;++l<a.length&&a[l].toLowerCase()===m;)k+=m;"m"===m&&"h"===o.toLowerCase()&&(m="M"),"h"===m&&(m=r),i[i.length]={t:m,v:k},o=m;break;case"A":if(e={t:m,v:"A"},null==f&&(f=p(b,c)),"A/P"===a.substr(l,3)?(null!=f&&(e.v=f.H>=12?"P":"A"),e.t="T",r="h",l+=3):"AM/PM"===a.substr(l,5)?(null!=f&&(e.v=f.H>=12?"PM":"AM"),e.t="T",l+=5,r="h"):(e.t="t",++l),null==f&&"T"===e.t)return"";i[i.length]=e,o=m;break;case"[":for(k=m;"]"!==a[l++]&&l<a.length;)k+=a[l];if("]"!==k.substr(-1))throw'unterminated "[" block: |'+k+"|";if(k.match(E)){if(null==f&&(f=p(b,c),null==f))return"";i[i.length]={t:"Z",v:k.toLowerCase()}}else k="";break;case".":if(null!=f){for(k=m;"0"===(m=a[++l]);)k+=m;i[i.length]={t:"s",v:k};break}case"0":case"#":for(k=m;"0#?.,E+-%".indexOf(m=a[++l])>-1||"\\"==m&&"-"==a[l+1]&&"0#".indexOf(a[l+2])>-1;)k+=m;i[i.length]={t:"n",v:k};break;case"?":for(k=m;a[++l]===m;)k+=m;e={t:m,v:k},i[i.length]=e,o=m;break;case"*":++l,(" "==a[l]||"*"==a[l])&&++l;break;case"(":case")":i[i.length]={t:1===d?"t":m,v:m},++l;break;case"1":case"2":case"3":case"4":case"5":case"6":case"7":case"8":case"9":for(k=m;"0123456789".indexOf(a[++l])>-1;)k+=a[l];i[i.length]={t:"D",v:k};break;case" ":i[i.length]={t:m,v:m},++l;break;default:if(-1===",$-+/():!^&'~{}<>=€acfijklopqrtuvwxz".indexOf(m))throw new Error("unrecognized character "+m+" in "+a);i[i.length]={t:"t",v:m},++l}var u,v=0,w=0;for(l=i.length-1,o="t";l>=0;--l)switch(i[l].t){case"h":case"H":i[l].t=r,o="h",1>v&&(v=1);break;case"s":(u=i[l].v.match(/\.0+$/))&&(w=Math.max(w,u[0].length-1)),3>v&&(v=3);case"d":case"y":case"M":case"e":o=i[l].t;break;case"m":"s"===o&&(i[l].t="M",2>v&&(v=2));break;case"X":"B2"===i[l].v;break;case"Z":1>v&&i[l].v.match(/[Hh]/)&&(v=1),2>v&&i[l].v.match(/[Mm]/)&&(v=2),3>v&&i[l].v.match(/[Ss]/)&&(v=3)}switch(v){case 0:break;case 1:f.u>=.5&&(f.u=0,++f.S),f.S>=60&&(f.S=0,++f.M),f.M>=60&&(f.M=0,++f.H);break;case 2:f.u>=.5&&(f.u=0,++f.S),f.S>=60&&(f.S=0,++f.M)}var x,y="";for(l=0;l<i.length;++l)switch(i[l].t){case"t":case"T":case" ":case"D":break;case"X":i[l]=void 0;break;case"d":case"m":case"y":case"h":case"H":case"M":case"s":case"e":case"b":case"Z":i[l].v=q(i[l].t.charCodeAt(0),i[l].v,f,w),i[l].t="t";break;case"n":case"(":case"?":for(x=l+1;null!=i[x]&&("?"===(m=i[x].t)||"D"===m||(" "===m||"t"===m)&&null!=i[x+1]&&("?"===i[x+1].t||"t"===i[x+1].t&&"/"===i[x+1].v)||"("===i[l].t&&(" "===m||"n"===m||")"===m)||"t"===m&&("/"===i[x].v||"$€".indexOf(i[x].v)>-1||" "===i[x].v&&null!=i[x+1]&&"?"==i[x+1].t));)i[l].v+=i[x].v,i[x]=void 0,++x;y+=i[l].v,l=x-1;break;case"G":i[l].t="t",i[l].v=n(b,c)}var z,A,B="";if(y.length>0){z=0>b&&45===y.charCodeAt(0)?-b:b,A=D(40===y.charCodeAt(0)?"(":"n",y,z),x=A.length-1;var C=i.length;for(l=0;l<i.length;++l)if(null!=i[l]&&i[l].v.indexOf(".")>-1){C=l;break}var F=i.length;if(C===i.length&&-1===A.indexOf("E")){for(l=i.length-1;l>=0;--l)null!=i[l]&&-1!=="n?(".indexOf(i[l].t)&&(x>=i[l].v.length-1?(x-=i[l].v.length,i[l].v=A.substr(x+1,i[l].v.length)):0>x?i[l].v="":(i[l].v=A.substr(0,x+1),x=-1),i[l].t="t",F=l);x>=0&&F<i.length&&(i[F].v=A.substr(0,x+1)+i[F].v)}else if(C!==i.length&&-1===A.indexOf("E")){for(x=A.indexOf(".")-1,l=C;l>=0;--l)if(null!=i[l]&&-1!=="n?(".indexOf(i[l].t)){for(g=i[l].v.indexOf(".")>-1&&l===C?i[l].v.indexOf(".")-1:i[l].v.length-1,B=i[l].v.substr(g+1);g>=0;--g)x>=0&&("0"===i[l].v[g]||"#"===i[l].v[g])&&(B=A[x--]+B);i[l].v=B,i[l].t="t",F=l}for(x>=0&&F<i.length&&(i[F].v=A.substr(0,x+1)+i[F].v),x=A.indexOf(".")+1,l=C;l<i.length;++l)if(null!=i[l]&&(-1!=="n?(".indexOf(i[l].t)||l===C)){for(g=i[l].v.indexOf(".")>-1&&l===C?i[l].v.indexOf(".")+1:0,B=i[l].v.substr(0,g);g<i[l].v.length;++g)x<A.length&&(B+=A[x++]);i[l].v=B,i[l].t="t",F=l}}}for(l=0;l<i.length;++l)null!=i[l]&&"n(?".indexOf(i[l].t)>-1&&(z=d>1&&0>b&&l>0&&"-"===i[l-1].v?-b:b,i[l].v=D(i[l].t,i[l].v,z),i[l].t="t");var G="";for(l=0;l!==i.length;++l)null!=i[l]&&(G+=i[l].v);return G}function u(a,b){if(null==b)return!1;var c=parseFloat(b[2]);switch(b[1]){case"=":if(a==c)return!0;break;case">":if(a>c)return!0;break;case"<":if(c>a)return!0;break;case"<>":if(a!=c)return!0;break;case">=":if(a>=c)return!0;break;case"<=":if(c>=a)return!0}return!1}function v(a,b){var c=s(a),d=c.length,e=c[d-1].indexOf("@");if(4>d&&e>-1&&--d,c.length>4)throw"cannot find right format for |"+c+"|";if("number"!=typeof b)return[4,4===c.length||e>-1?c[c.length-1]:"@"];switch(c.length){case 1:c=e>-1?["General","General","General",c[0]]:[c[0],c[0],c[0],"@"];break;case 2:c=e>-1?[c[0],c[0],c[0],c[1]]:[c[0],c[1],c[0],"@"];break;case 3:c=e>-1?[c[0],c[1],c[0],c[2]]:[c[0],c[1],c[2],"@"];break;case 4:}var f=b>0?c[0]:0>b?c[1]:c[2];if(-1===c[0].indexOf("[")&&-1===c[1].indexOf("["))return[d,f];if(null!=c[0].match(F)||null!=c[1].match(F)){var g=c[0].match(G),h=c[1].match(G);return u(b,g)?[d,c[0]]:u(b,h)?[d,c[1]]:[d,c[null!=g&&null!=h?2:1]]}return[d,f]}function w(a,b,c){k(null!=c?c:c=[]);
var d="";switch(typeof a){case"string":d=a;break;case"number":d=(null!=c.table?c.table:z)[a]}if(j(d,0))return n(b,c);var e=v(d,b);if(j(e[1]))return n(b,c);if(b===!0)b="TRUE";else if(b===!1)b="FALSE";else if(""===b||null==b)return"";return t(e[1],b,c,e[0])}a.version="0.8.1";var x=Math.pow(2,32),y=[["date1904",0],["output",""],["WTF",!1]];a.opts=y;var z={0:"General",1:"0",2:"0.00",3:"#,##0",4:"#,##0.00",9:"0%",10:"0.00%",11:"0.00E+00",12:"# ?/?",13:"# ??/??",14:"m/d/yy",15:"d-mmm-yy",16:"d-mmm",17:"mmm-yy",18:"h:mm AM/PM",19:"h:mm:ss AM/PM",20:"h:mm",21:"h:mm:ss",22:"m/d/yy h:mm",37:"#,##0 ;(#,##0)",38:"#,##0 ;[Red](#,##0)",39:"#,##0.00;(#,##0.00)",40:"#,##0.00;[Red](#,##0.00)",45:"mm:ss",46:"[h]:mm:ss",47:"mmss.0",48:"##0.0E+0",49:"@",56:'"上午/下午 "hh"時"mm"分"ss"秒 "',65535:"General"},A=[["Sun","Sunday"],["Mon","Monday"],["Tue","Tuesday"],["Wed","Wednesday"],["Thu","Thursday"],["Fri","Friday"],["Sat","Saturday"]],B=[["J","Jan","January"],["F","Feb","February"],["M","Mar","March"],["A","Apr","April"],["M","May","May"],["J","Jun","June"],["J","Jul","July"],["A","Aug","August"],["S","Sep","September"],["O","Oct","October"],["N","Nov","November"],["D","Dec","December"]];a._general_int=m;var C=function(){function a(a){var b=0>a?12:11,c=d(a.toFixed(12));return c.length<=b?c:(c=a.toPrecision(10),c.length<=b?c:a.toExponential(5))}function b(a){var b=a.toFixed(11).replace(e,".$1");return b.length>(0>a?12:11)&&(b=a.toPrecision(6)),b}function c(a){for(var b=0;b!=a.length;++b)if(101===(32|a.charCodeAt(b)))return a.replace(g,".$1").replace(h,"E").replace("e","E").replace(i,"$10$2");return a}function d(a){return a.indexOf(".")>-1?a.replace(f,"").replace(e,".$1"):a}var e=/\.(\d*[1-9])0+$/,f=/\.0*$/,g=/\.(\d*[1-9])0+/,h=/\.0*[Ee]/,i=/(E[+-])(\d)$/;return function(e){var f,g=Math.floor(Math.log(Math.abs(e))*Math.LOG10E);return f=g>=-4&&-1>=g?e.toPrecision(10+g):Math.abs(g)<=9?a(e):10===g?e.toFixed(10).substr(0,12):b(e),d(c(f))}}();a._general_num=C,a._general=n,a.parse_date_code=p;var D=function(){function a(a,b,d){var e=b.replace(w,""),f=b.length-e.length;return D(a,e,d*Math.pow(10,2*f))+c("%",f)}function g(a,b,c){for(var d=b.length-1;44===b.charCodeAt(d-1);)--d;return D(a,b.substr(0,d),c/Math.pow(10,3*(b.length-d)))}function h(a,b){var c,d=a.indexOf("E")-a.indexOf(".")-1;if(a.match(/^#+0.0E\+0$/)){var e=a.indexOf(".");-1===e&&(e=a.indexOf("E"));var f=Math.floor(Math.log(Math.abs(b))*Math.LOG10E)%e;if(0>f&&(f+=e),c=(b/Math.pow(10,f)).toPrecision(d+1+(e+f)%e),-1===c.indexOf("e")){var g=Math.floor(Math.log(Math.abs(b))*Math.LOG10E);for(-1===c.indexOf(".")?c=c[0]+"."+c.substr(1)+"E+"+(g-c.length+f):c+="E+"+(g-f);"0."===c.substr(0,2);)c=c[0]+c.substr(2,e)+"."+c.substr(2+e),c=c.replace(/^0+([1-9])/,"$1").replace(/^0+\./,"0.");c=c.replace(/\+-/,"-")}c=c.replace(/^([+-]?)(\d*)\.(\d*)[Ee]/,function(a,b,c,d){return b+c+d.substr(0,(e+f)%e)+"."+d.substr(f)+"E"})}else c=b.toExponential(d);return a.match(/E\+00$/)&&c.match(/e[+-]\d$/)&&(c=c.substr(0,c.length-1)+"0"+c[c.length-1]),a.match(/E\-/)&&c.match(/e\+/)&&(c=c.replace(/e\+/,"e")),c.replace("e","E")}function j(a,b,f){var g=parseInt(a[4]),h=Math.round(b*g),i=Math.floor(h/g),j=h-i*g,k=g;return f+(0===i?"":""+i)+" "+(0===j?c(" ",a[1].length+1+a[4].length):e(j,a[1].length)+a[2]+"/"+a[3]+d(k,a[4].length))}function k(a,b,d){return d+(0===b?"":""+b)+c(" ",a[1].length+2+a[4].length)}function m(a){for(var b,c="",d=0;d!=a.length;++d)switch(b=a.charCodeAt(d)){case 35:break;case 63:c+=" ";break;case 48:c+="0";break;default:c+=String.fromCharCode(b)}return c}function n(a,b){var c=Math.pow(10,b);return""+Math.round(a*c)/c}function o(a,b){return Math.round((a-Math.floor(a))*Math.pow(10,b))}function p(a){return 2147483647>a&&a>-2147483648?""+(a>=0?0|a:a-1|0):""+Math.floor(a)}function q(k,s,t){if(40===k.charCodeAt(0)&&!s.match(z)){var u=s.replace(/\( */,"").replace(/ \)/,"").replace(/\)/,"");return t>=0?q("n",u,t):"("+q("n",u,-t)+")"}if(44===s.charCodeAt(s.length-1))return g(k,s,t);if(-1!==s.indexOf("%"))return a(k,s,t);if(-1!==s.indexOf("E"))return h(s,t);if(36===s.charCodeAt(0))return"$"+q(k,s.substr(" "==s[1]?2:1),t);var v,w,B,C,E=Math.abs(t),F=0>t?"-":"";if(s.match(/^00+$/))return F+i(E,s.length);if(s.match(/^[#?]+$/))return v=i(t,0),"0"===v&&(v=""),v.length>s.length?v:m(s.substr(0,s.length-v.length))+v;if(null!==(w=s.match(x)))return j(w,E,F);if(null!==s.match(/^#+0+$/))return F+i(E,s.length-s.indexOf("0"));if(null!==(w=s.match(y)))return v=n(t,w[1].length).replace(/^([^\.]+)$/,"$1."+w[1]).replace(/\.$/,"."+w[1]).replace(/\.(\d*)$/,function(a,b){return"."+b+c("0",w[1].length-b.length)}),-1!==s.indexOf("0.")?v:v.replace(/^0\./,".");if(s=s.replace(/^#+([0.])/,"$1"),null!==(w=s.match(/^(0*)\.(#*)$/)))return F+n(E,w[2].length).replace(/\.(\d*[1-9])0*$/,".$1").replace(/^(-?\d*)$/,"$1.").replace(/^0\./,w[1].length?"0.":".");if(null!==(w=s.match(/^#,##0(\.?)$/)))return F+r(i(E,0));if(null!==(w=s.match(/^#,##0\.([#0]*0)$/)))return 0>t?"-"+q(k,s,-t):r(""+Math.floor(t))+"."+d(o(t,w[1].length),w[1].length);if(null!==(w=s.match(/^#,#*,#0/)))return q(k,s.replace(/^#,#*,/,""),t);if(null!==(w=s.match(/^([0#]+)(\\?-([0#]+))+$/)))return v=b(q(k,s.replace(/[\\-]/g,""),t)),B=0,b(b(s.replace(/\\/g,"")).replace(/[0#]/g,function(a){return B<v.length?v[B++]:"0"===a?"0":""}));if(null!==s.match(A))return v=q(k,"##########",t),"("+v.substr(0,3)+") "+v.substr(3,3)+"-"+v.substr(6);var G="";if(null!==(w=s.match(/^([#0?]+)( ?)\/( ?)([#0?]+)/)))return B=Math.min(w[4].length,7),C=l(E,Math.pow(10,B)-1,!1),v=""+F,G=D("n",w[1],C[1])," "==G[G.length-1]&&(G=G.substr(0,G.length-1)+"0"),v+=G+w[2]+"/"+w[3],G=f(C[2],B),G.length<w[4].length&&(G=m(w[4].substr(w[4].length-G.length))+G),v+=G;if(null!==(w=s.match(/^# ([#0?]+)( ?)\/( ?)([#0?]+)/)))return B=Math.min(Math.max(w[1].length,w[4].length),7),C=l(E,Math.pow(10,B)-1,!0),F+(C[0]||(C[1]?"":"0"))+" "+(C[1]?e(C[1],B)+w[2]+"/"+w[3]+f(C[2],B):c(" ",2*B+1+w[2].length+w[3].length));if(null!==(w=s.match(/^[#0?]+$/)))return v=i(t,0),s.length<=v.length?v:m(s.substr(0,s.length-v.length))+v;if(null!==(w=s.match(/^([#0?]+)\.([#0]+)$/))){v=""+t.toFixed(Math.min(w[2].length,10)).replace(/([^0])0+$/,"$1"),B=v.indexOf(".");var H=s.indexOf(".")-B,I=s.length-v.length-H;return m(s.substr(0,H)+v+s.substr(s.length-I))}if(null!==(w=s.match(/^00,000\.([#0]*0)$/)))return B=o(t,w[1].length),0>t?"-"+q(k,s,-t):r(p(t)).replace(/^\d,\d{3}$/,"0$&").replace(/^\d*$/,function(a){return"00,"+(a.length<3?d(0,3-a.length):"")+a})+"."+d(B,w[1].length);switch(s){case"#,###":var J=r(i(E,0));return"0"!==J?F+J:""}throw new Error("unsupported format |"+s+"|")}function s(a,b,c){for(var d=b.length-1;44===b.charCodeAt(d-1);)--d;return D(a,b.substr(0,d),c/Math.pow(10,3*(b.length-d)))}function t(a,b,d){var e=b.replace(w,""),f=b.length-e.length;return D(a,e,d*Math.pow(10,2*f))+c("%",f)}function u(a,b){var c,d=a.indexOf("E")-a.indexOf(".")-1;if(a.match(/^#+0.0E\+0$/)){var e=a.indexOf(".");-1===e&&(e=a.indexOf("E"));var f=Math.floor(Math.log(Math.abs(b))*Math.LOG10E)%e;if(0>f&&(f+=e),c=(b/Math.pow(10,f)).toPrecision(d+1+(e+f)%e),!c.match(/[Ee]/)){var g=Math.floor(Math.log(Math.abs(b))*Math.LOG10E);-1===c.indexOf(".")?c=c[0]+"."+c.substr(1)+"E+"+(g-c.length+f):c+="E+"+(g-f),c=c.replace(/\+-/,"-")}c=c.replace(/^([+-]?)(\d*)\.(\d*)[Ee]/,function(a,b,c,d){return b+c+d.substr(0,(e+f)%e)+"."+d.substr(f)+"E"})}else c=b.toExponential(d);return a.match(/E\+00$/)&&c.match(/e[+-]\d$/)&&(c=c.substr(0,c.length-1)+"0"+c[c.length-1]),a.match(/E\-/)&&c.match(/e\+/)&&(c=c.replace(/e\+/,"e")),c.replace("e","E")}function v(a,g,h){if(40===a.charCodeAt(0)&&!g.match(z)){var i=g.replace(/\( */,"").replace(/ \)/,"").replace(/\)/,"");return h>=0?v("n",i,h):"("+v("n",i,-h)+")"}if(44===g.charCodeAt(g.length-1))return s(a,g,h);if(-1!==g.indexOf("%"))return t(a,g,h);if(-1!==g.indexOf("E"))return u(g,h);if(36===g.charCodeAt(0))return"$"+v(a,g.substr(" "==g[1]?2:1),h);var j,n,o,p,q=Math.abs(h),w=0>h?"-":"";if(g.match(/^00+$/))return w+d(q,g.length);if(g.match(/^[#?]+$/))return j=""+h,0===h&&(j=""),j.length>g.length?j:m(g.substr(0,g.length-j.length))+j;if(null!==(n=g.match(x)))return k(n,q,w);if(null!==g.match(/^#+0+$/))return w+d(q,g.length-g.indexOf("0"));if(null!==(n=g.match(y)))return j=(""+h).replace(/^([^\.]+)$/,"$1."+n[1]).replace(/\.$/,"."+n[1]).replace(/\.(\d*)$/,function(a,b){return"."+b+c("0",n[1].length-b.length)}),-1!==g.indexOf("0.")?j:j.replace(/^0\./,".");if(g=g.replace(/^#+([0.])/,"$1"),null!==(n=g.match(/^(0*)\.(#*)$/)))return w+(""+q).replace(/\.(\d*[1-9])0*$/,".$1").replace(/^(-?\d*)$/,"$1.").replace(/^0\./,n[1].length?"0.":".");if(null!==(n=g.match(/^#,##0(\.?)$/)))return w+r(""+q);if(null!==(n=g.match(/^#,##0\.([#0]*0)$/)))return 0>h?"-"+v(a,g,-h):r(""+h)+"."+c("0",n[1].length);if(null!==(n=g.match(/^#,#*,#0/)))return v(a,g.replace(/^#,#*,/,""),h);if(null!==(n=g.match(/^([0#]+)(\\?-([0#]+))+$/)))return j=b(v(a,g.replace(/[\\-]/g,""),h)),o=0,b(b(g.replace(/\\/g,"")).replace(/[0#]/g,function(a){return o<j.length?j[o++]:"0"===a?"0":""}));if(null!==g.match(A))return j=v(a,"##########",h),"("+j.substr(0,3)+") "+j.substr(3,3)+"-"+j.substr(6);var B="";if(null!==(n=g.match(/^([#0?]+)( ?)\/( ?)([#0?]+)/)))return o=Math.min(n[4].length,7),p=l(q,Math.pow(10,o)-1,!1),j=""+w,B=D("n",n[1],p[1])," "==B[B.length-1]&&(B=B.substr(0,B.length-1)+"0"),j+=B+n[2]+"/"+n[3],B=f(p[2],o),B.length<n[4].length&&(B=m(n[4].substr(n[4].length-B.length))+B),j+=B;if(null!==(n=g.match(/^# ([#0?]+)( ?)\/( ?)([#0?]+)/)))return o=Math.min(Math.max(n[1].length,n[4].length),7),p=l(q,Math.pow(10,o)-1,!0),w+(p[0]||(p[1]?"":"0"))+" "+(p[1]?e(p[1],o)+n[2]+"/"+n[3]+f(p[2],o):c(" ",2*o+1+n[2].length+n[3].length));if(null!==(n=g.match(/^[#0?]+$/)))return j=""+h,g.length<=j.length?j:m(g.substr(0,g.length-j.length))+j;if(null!==(n=g.match(/^([#0]+)\.([#0]+)$/))){j=""+h.toFixed(Math.min(n[2].length,10)).replace(/([^0])0+$/,"$1"),o=j.indexOf(".");var C=g.indexOf(".")-o,E=g.length-j.length-C;return m(g.substr(0,C)+j+g.substr(g.length-E))}if(null!==(n=g.match(/^00,000\.([#0]*0)$/)))return 0>h?"-"+v(a,g,-h):r(""+h).replace(/^\d,\d{3}$/,"0$&").replace(/^\d*$/,function(a){return"00,"+(a.length<3?d(0,3-a.length):"")+a})+"."+d(0,n[1].length);switch(g){case"#,###":var F=r(""+q);return"0"!==F?w+F:""}throw new Error("unsupported format |"+g+"|")}var w=/%/g,x=/# (\?+)( ?)\/( ?)(\d+)/,y=/^#*0*\.(0+)/,z=/\).*[0#]/,A=/\(###\) ###\\?-####/;return function(a,b,c){return(0|c)===c?v(a,b,c):q(a,b,c)}}();a._split=s;var E=/\[[HhMmSs]*\]/;a._eval=t;var F=/\[[=<>]/,G=/\[([=<>]*)(-?\d+\.?\d*)\]/;a._table=z,a.load=function(a,b){z[b]=a},a.format=w,a.get_table=function(){return z},a.load_table=function(b){for(var c=0;392!=c;++c)void 0!==b[c]&&a.load(b[c],c)}};ie(he);var je=2,ke=3,le=11,me=12,ne=19,oe=30,pe=64,qe=71,re=4096,se=80,te=81,ue=[se,te],ve={1:{n:"CodePage",t:je},2:{n:"Category",t:se},3:{n:"PresentationFormat",t:se},4:{n:"ByteCount",t:ke},5:{n:"LineCount",t:ke},6:{n:"ParagraphCount",t:ke},7:{n:"SlideCount",t:ke},8:{n:"NoteCount",t:ke},9:{n:"HiddenCount",t:ke},10:{n:"MultimediaClipCount",t:ke},11:{n:"Scale",t:le},12:{n:"HeadingPair",t:re|me},13:{n:"DocParts",t:re|oe},14:{n:"Manager",t:se},15:{n:"Company",t:se},16:{n:"LinksDirty",t:le},17:{n:"CharacterCount",t:ke},19:{n:"SharedDoc",t:le},22:{n:"HLinksChanged",t:le},23:{n:"AppVersion",t:ke,p:"version"},26:{n:"ContentType",t:se},27:{n:"ContentStatus",t:se},28:{n:"Language",t:se},29:{n:"Version",t:se},255:{}},we={1:{n:"CodePage",t:je},2:{n:"Title",t:se},3:{n:"Subject",t:se},4:{n:"Author",t:se},5:{n:"Keywords",t:se},6:{n:"Comments",t:se},7:{n:"Template",t:se},8:{n:"LastAuthor",t:se},9:{n:"RevNumber",t:se},10:{n:"EditTime",t:pe},11:{n:"LastPrinted",t:pe},12:{n:"CreatedDate",t:pe},13:{n:"ModifiedDate",t:pe},14:{n:"PageCount",t:ke},15:{n:"WordCount",t:ke},16:{n:"CharCount",t:ke},17:{n:"Thumbnail",t:qe},18:{n:"ApplicationName",t:oe},19:{n:"DocumentSecurity",t:ke},255:{}},xe={2147483648:{n:"Locale",t:ne},2147483651:{n:"Behavior",t:ne},1768515945:{}};!function(){for(var a in xe)xe.hasOwnProperty(a)&&(ve[a]=we[a]=xe[a])}();var ye=!0,ze=function(){function a(a){var e=3,g=512,h=0,n=0,o=0,p=0,q=0,r=[],s=a.slice(0,512);switch(i(s,0),e=b(s)){case 3:g=512;break;case 4:g=4096;break;default:throw"Major Version: Expected 3 or 4 saw "+e}512!==g&&(s=a.slice(0,g),i(s,28));var u=a.slice(0,g);c(s,e);var v=s.read_shift(4,"i");if(3===e&&0!==v)throw"# Directory Sectors: Expected 0 saw "+v;s.l+=4,o=s.read_shift(4,"i"),s.l+=4,s.chk("00100000","Mini Stream Cutoff Size: "),p=s.read_shift(4,"i"),h=s.read_shift(4,"i"),q=s.read_shift(4,"i"),n=s.read_shift(4,"i");for(var w,x=0;109>x&&(w=s.read_shift(4,"i"),!(0>w));++x)r[x]=w;var y=d(a,g);k(q,n,y,g,r);var z=l(y,o,r,g);z[o].name="!Directory",h>0&&p!==t&&(z[p].name="!MiniFAT"),z[r[0]].name="!FAT";var A={},B=[],C=[],D=[],E={};m(o,z,y,B,h,A,C),f(C,E,D,B);var F=B.shift();B.root=F;var G=j(D,B,C,A,F);return{raw:{header:u,sectors:y},FileIndex:C,FullPaths:D,FullPathDir:E,find:G}}function b(a){return a.chk(u,"Header Signature: "),a.chk(v,"CLSID: "),a.l+=2,a.read_shift(2,"u")}function c(a,b){var c=9;switch(a.chk("feff","Byte Order: "),c=a.read_shift(2)){case 9:if(3!==b)throw"MajorVersion/SectorShift Mismatch";break;case 12:if(4!==b)throw"MajorVersion/SectorShift Mismatch";break;default:throw"Sector Shift: Expected 9 or 12 saw "+c}a.chk("0600","Mini Sector Shift: "),a.chk("000000000000","Reserved: ")}function d(a,b){for(var c=Math.ceil(a.length/b)-1,d=new Array(c),e=1;c>e;++e)d[e-1]=a.slice(e*b,(e+1)*b);return d[c-1]=a.slice(c*b),d}function f(a,b,c,d){for(var e=0,f=0,g=0,h=0,i=0,j=d.length,k=new Array(j),l=new Array(j);j>e;++e)k[e]=l[e]=e,c[e]=d[e];for(;i<l.length;++i)e=l[i],f=a[e].L,g=a[e].R,h=a[e].C,k[e]===e&&(-1!==f&&k[f]!==f&&(k[e]=k[f]),-1!==g&&k[g]!==g&&(k[e]=k[g])),-1!==h&&(k[h]=e),-1!==f&&(k[f]=k[e],l.push(f)),-1!==g&&(k[g]=k[e],l.push(g));for(e=1;e!==j;++e)k[e]===e&&(-1!==g&&k[g]!==g?k[e]=k[g]:-1!==f&&k[f]!==f&&(k[e]=k[f]));for(e=1;j>e;++e)if(0!==a[e].type){if(i=k[e],0===i)c[e]=c[0]+"/"+c[e];else for(;0!==i;)c[e]=c[i]+"/"+c[e],i=k[i];k[e]=0}for(c[0]+="/",e=1;j>e;++e)2!==a[e].type&&(c[e]+="/"),b[c[e]]=a[e]}function j(a,b,c,d,e){var f,g=new Array(a.length),h=new Array(b.length);for(f=0;f<a.length;++f)g[f]=a[f].toUpperCase();for(f=0;f<b.length;++f)h[f]=b[f].toUpperCase();return function(a){var f;47===a.charCodeAt(0)?(f=!0,a=e+a):f=-1!==a.indexOf("/");var i=a.toUpperCase(),j=f===!0?g.indexOf(i):h.indexOf(i);return-1===j?null:f===!0?c[j]:d[b[j]]}}function k(a,b,c,d,e){var f;if(a===t){if(0!==b)throw"DIFAT chain shorter than expected"}else if(-1!==a){for(var g=c[a],h=(d>>>2)-1,i=0;h>i&&(f=ge(g,4*i))!==t;++i)e.push(f);k(ge(g,d-4),b-1,c,d,e)}}function l(a,b,c,d){var e,f,g,h,i,j,k=a.length,l=new Array(k),m=new Array(k),n=d-1;for(g=0;k>g;++g)if(e=[],i=g+b,i>=k&&(i-=k),m[i]!==!0){for(f=[],h=i;h>=0;){m[h]=!0,e[e.length]=h,f.push(a[h]);var o=c[Math.floor(4*h/d)];if(j=4*h&n,4+j>d)throw"FAT boundary crossed: "+h+" 4 "+d;h=ge(a[o],j)}l[i]={nodes:e,data:Ld([f])}}return l}function m(a,b,c,d,e,f,g){for(var h,j,k,l,m,o=0,p=d.length?2:0,q=b[a].data,r=0,u=0;r<q.length;r+=128)h=q.slice(r,r+128),i(h,64),u=h.read_shift(2),0!==u&&(j=Rd(h,0,u-p).replace(Pd,"").replace(Qd,"!"),d.push(j),k={name:j,type:h.read_shift(1),color:h.read_shift(1),L:h.read_shift(4,"i"),R:h.read_shift(4,"i"),C:h.read_shift(4,"i"),clsid:h.read_shift(16),state:h.read_shift(4,"i")},l=h.read_shift(2)+h.read_shift(2)+h.read_shift(2)+h.read_shift(2),0!==l&&(k.ctime=l,k.ct=n(h,h.l-8)),m=h.read_shift(2)+h.read_shift(2)+h.read_shift(2)+h.read_shift(2),0!==m&&(k.mtime=m,k.mt=n(h,h.l-8)),k.start=h.read_shift(4,"i"),k.size=h.read_shift(4,"i"),5===k.type?(o=k.start,e>0&&o!==t&&(b[o].name="!StreamData")):k.size>=4096?(k.storage="fat",void 0===b[k.start]&&(k.start+=a)>=c.length&&(k.start-=c.length),b[k.start].name=k.name,k.content=b[k.start].data.slice(0,k.size),i(k.content,0)):(k.storage="minifat",o!==t&&k.start!==t&&(k.content=b[o].data.slice(k.start*s,k.start*s+k.size),i(k.content,0))),f[j]=k,g.push(k))}function n(a,b){return new Date(1e3*(fe(a,b+4)/1e7*Math.pow(2,32)+fe(a,b)/1e7-11644473600))}function o(b){return void 0===r&&(r=require("fs")),a(r.readFileSync(b))}function p(b,c){switch(void 0!==c&&void 0!==c.type?c.type:"base64"){case"file":return o(b);case"base64":return a(e(Od.decode(b)));case"binary":return a(e(b))}return a(b)}var q={};q.version="0.10.0";var r,s=64,t=-2,u="d0cf11e0a1b11ae1",v="00000000000000000000000000000000",w={MAXREGSECT:-6,DIFSECT:-4,FATSECT:-3,ENDOFCHAIN:t,FREESECT:-1,HEADER_SIGNATURE:u,HEADER_MINOR_VERSION:"3e00",MAXREGSID:-6,NOSTREAM:-1,HEADER_CLSID:v,EntryTypes:["unknown","storage","stream","lockbytes","property","root"]};return q.read=p,q.parse=a,q.utils={ReadShift:g,CheckField:h,prep_blob:i,bconcat:be,consts:w},q}();"undefined"!=typeof require&&"undefined"!=typeof module&&"undefined"==typeof ye&&(module.exports=ze);var Ae=A,Be=function(a){var b=a.read_shift(4),c=a.l,d=!1;b>24&&(a.l+=b-24,"795881f43b1d7f48af2c825dc4852763"===a.read_shift(16)&&(d=!0),a.l=c);var e=a.read_shift((d?b-24:b)>>1,"utf16le").replace(Pd,"");return d&&(a.l+=24),e},Ce=function(a){var b=(a.read_shift(2),a.read_shift(4)),c=a.read_shift(b,"cstr"),d=(a.read_shift(2),a.read_shift(2),a.read_shift(4));if(0===d)return c.replace(/\\/g,"/");var e=a.read_shift(4),f=(a.read_shift(2),a.read_shift(e>>1,"utf16le").replace(Pd,""));return f},De=function(a,b){var c=a.read_shift(16);switch(b-=16,c){case"e0c9ea79f9bace118c8200aa004ba90b":return Be(a,b);case"0303000000000000c000000000000046":return Ce(a,b);default:throw"unsupported moniker "+c}},Ee=function(a){var b=a.read_shift(4),c=a.read_shift(b,"utf16le").replace(Pd,"");return c},Fe=function(a,b){var c=a.l+b,d=a.read_shift(4);if(2!==d)throw new Error("Unrecognized streamVersion: "+d);var e=a.read_shift(2);a.l+=2;var f,g,h,i,k,l,m;16&e&&(f=Ee(a,c-a.l)),128&e&&(g=Ee(a,c-a.l)),257===(257&e)&&(h=Ee(a,c-a.l)),1===(257&e)&&(i=De(a,c-a.l)),8&e&&(k=Ee(a,c-a.l)),32&e&&(l=a.read_shift(16)),64&e&&(m=j(a,8)),a.l=c;var n=g||h||i;return k&&(n+="#"+k),{Target:n}},Ge=F,He=Y,Ie={21:Z,19:A,18:function(a){a.l+=12},17:function(a){a.l+=8},16:A,15:A,13:$,12:function(a){a.l+=24},11:function(a){a.l+=10},10:function(a){a.l+=16},9:A,8:function(a){a.l+=6},7:_,6:function(a){a.l+=6},4:A,0:function(a){a.l+=4}},Je=F,Ke=B,Le=A,Me=A,Ne=S,Oe=function(a,b){var c=X(a,8);a.l+=16;var d=Fe(a,b-24);return[c,d]},Pe=function(a,b){a.l+b;a.read_shift(2);var c=X(a,8),d=a.read_shift((b-10)/2,"dbcs");return d=d.replace(Pd,""),[c,d]},Qe=E,Re=Q,Se=N,Te=F,Ue=F,Ve=N,We=E,Xe=F,Ye=E,Ze=B,$e=E,_e=F,af=E,bf=E,cf=F,df=B,ef=B,ff=B,gf=B,hf=B,jf=F,kf=Ne,lf=F,mf=E,nf=Ne,of=Ge,pf=B,qf=N,rf=B,sf=E,tf=F,uf=E,vf=E,wf=F,xf=E,yf=F,zf=E,Af=E,Bf=N,Cf=G,Df=E,Ef=G,Ff=L,Gf=E,Hf=N,If=E,Jf=E,Kf=E,Lf=A,Mf=A,Nf=A,Of=A,Pf=A,Qf=A,Rf=A,Sf=A,Tf=A,Uf=A,Vf=A,Wf=A,Xf=A,Yf=A,Zf=A,$f=A,_f=A,ag=A,bg=A,cg=A,dg=A,eg=A,fg=A,gg=A,hg=A,ig=A,jg=A,kg=A,lg=A,mg=A,ng=A,og=A,pg=A,qg=A,rg=A,sg=A,tg=A,ug=A,vg=A,wg=A,xg=A,yg=A,zg=A,Ag=A,Bg=A,Cg=A,Dg=A,Eg=A,Fg=A,Gg=A,Hg=A,Ig=A,Jg=A,Kg=A,Lg=A,Mg=A,Ng=A,Og=A,Pg=A,Qg=A,Rg=A,Sg=A,Tg=A,Ug=A,Vg=A,Wg=A,Xg=A,Yg=A,Zg=A,$g=A,_g=A,ah=A,bh=A,ch=A,dh=A,eh=A,fh=A,gh=A,hh=A,ih=A,jh=A,kh=A,lh=A,mh=A,nh=A,oh=A,ph=A,qh=A,rh=A,sh=A,th=A,uh=A,vh=A,wh=A,xh=A,yh=A,zh=A,Ah=A,Bh=A,Ch=A,Dh=A,Eh=A,Fh=A,Gh=A,Hh=A,Ih=A,Jh=A,Kh=A,Lh=A,Mh=A,Nh=A,Oh=A,Ph=A,Qh=A,Rh=L,Sh=A,Th=A,Uh=A,Vh=A,Wh=A,Xh=A,Yh=A,Zh=A,$h=A,_h=A,ai=A,bi=A,ci=A,di=A,ei=A,fi=A,gi=A,hi=A,ii=A,ji=A,ki=A,li=A,mi=A,ni=A,oi=A,pi=A,qi=A,ri=A,si=A,ti=A,ui=A,vi=A,wi=A,xi=A,yi=A,zi=A,Ai=A,Bi=A,Ci=A,Di=A,Ei=A,Fi=A,Gi=A,Hi=A,Ii=A,Ji=A,Ki=A,Li=A,Mi=A,Ni=A,Oi=A,Pi=A,Qi=A,Ri=A,Si=A,Ti=A,Ui=A,Vi=A,Wi=A,Xi=A,Yi=A,Zi=A,$i=A,_i=A,aj=A,bj=A,cj=A,dj=A,ej=A,fj=A,gj=A,hj=A,ij=A,jj=A,kj=A,lj=A,mj=A,nj=A,oj=A,pj=A,qj=A,rj=A,sj=A,tj=A,uj=A,vj=A,wj=A,xj=A,yj=A,zj=A,Aj=A,Bj=A,Cj=A,Dj=A,Ej=A,Fj=A,Gj=A,Hj=A,Ij=A,Jj=A,Kj=A,Lj=A,Mj=A,Nj=A,Oj=A,Pj=A,Qj=A,Rj=A,Sj=A,Tj=A,Uj=A,Vj=A,Wj=A,Xj=A,Yj=A,Zj=A,$j=A,_j=A,ak=A,bk=A,ck=A,dk=A,ek=A,fk=A,gk=A,hk=A,ik=A,jk=A,kk=A,lk=A,mk=A,nk=A,ok=A,pk=A,qk=A,rk=A,sk=A,tk=A,uk=A,vk=A,wk=A,xk=A,yk=A,zk=A,Ak=A,Bk=A,Ck=A,Dk=A,Ek=A,Fk=A,Gk=A,Hk=function(a){return String.fromCharCode(a)},Ik=/([\w:]+)=((?:")([^"]*)(?:")|(?:')([^']*)(?:'))/g,Jk=/([\w:]+)=((?:")(?:[^"]*)(?:")|(?:')(?:[^']*)(?:'))/,Kk={"&quot;":'"',"&apos;":"'","&gt;":">","&lt;":"<","&amp;":"&"},Lk=(P(Kk),"&<>'\"".split(""),{}),Mk=function(a,b){var c;if("undefined"!=typeof b)c=b;else if("undefined"!=typeof require)try{c=require("crypto")}catch(d){c=null}a.rc4=function(a,b){var c=new Array(256),d=0,e=0,f=0,g=0;for(e=0;256!=e;++e)c[e]=e;for(e=0;256!=e;++e)f=f+c[e]+a[e%a.length].charCodeAt(0)&255,g=c[e],c[e]=c[f],c[f]=g;for(e=f=0,out=Buffer(b.length),d=0;d!=b.length;++d)e=e+1&255,f=(f+c[e])%256,g=c[e],c[e]=c[f],c[f]=g,out[d]=b[d]^c[c[e]+c[f]&255];return out},a.md5=c?function(a){return c.createHash("md5").update(a).digest("hex")}:function(){throw"unimplemented"}};Mk(Lk,"undefined"!=typeof crypto?crypto:void 0);var Nk=function(){var a=[187,255,255,186,255,255,185,128,0,190,15,0,191,15,0],b=[57840,7439,52380,33984,4364,3600,61902,12606,6258,57657,54287,34041,10252,43370,20163],c=[44796,19929,39858,10053,20106,40212,10761,31585,63170,64933,60267,50935,40399,11199,17763,35526,1453,2906,5812,11624,23248,885,1770,3540,7080,14160,28320,56640,55369,41139,20807,41614,21821,43642,17621,28485,56970,44341,19019,38038,14605,29210,60195,50791,40175,10751,21502,43004,24537,18387,36774,3949,7898,15796,31592,63184,47201,24803,49606,37805,14203,28406,56812,17824,35648,1697,3394,6788,13576,27152,43601,17539,35078,557,1114,2228,4456,30388,60776,51953,34243,7079,14158,28316,14128,28256,56512,43425,17251,34502,7597,13105,26210,52420,35241,883,1766,3532,4129,8258,16516,33032,4657,9314,18628],e=function(a){return 255&(a/2|128*a)},f=function(a,b){return e(a^b)},g=function(a){for(var d=b[a.length-1],e=104,f=a.length-1;f>=0;--f)for(var g=a[f],h=0;7!=h;++h)64&g&&(d^=c[e]),g*=2,--e;return d};return function(b){for(var c=Mb(b),e=g(c),h=c.length,i=d(16),j=0;16!=j;++j)i[j]=0;var k,l,m;for(1===(1&h)&&(k=e>>8,i[h]=f(a[0],k),--h,k=255&e,l=c[c.length-1],i[h]=f(l,k));h>0;)--h,k=e>>8,i[h]=f(c[h],k),--h,k=255&e,i[h]=f(c[h],k);for(h=15,m=15-c.length;m>0;)k=e>>8,i[h]=f(a[m],k),--h,--m,k=255&e,i[h]=f(c[h],k),--h,--m;return i}}(),Ok=function(a,b,c,d,e){e||(e=b),d||(d=Nk(a));var f,g;for(f=0;f!=b.length;++f)g=b[f],g^=d[c],g=255&(g>>5|g<<3),e[f]=g,++c;return[e,c,d]},Pk=function(a){var b=0,c=Nk(a);return function(a){var d=Ok(null,a,b,c);return b=d[1],d[0]}},Qk=Wb(4),Rk=Xb,Sk=Xb,Tk=Xb,Uk=Xb,Vk=Xb,Wk=Xb,Xk=Xb,Yk=Xb,Zk=Xb,$k=Xb,_k=Xb,al=Xb,bl=Xb,cl=Xb,dl=Xb,el=Xb,fl=Xb,gl=Xb,hl=Xb,il=Xb,jl=A,kl=A,ll=A,ml=A,nl={1:{n:"PtgExp",f:vc},2:{n:"PtgTbl",f:ml},3:{n:"PtgAdd",f:Sk},4:{n:"PtgSub",f:fl},5:{n:"PtgMul",f:_k},6:{n:"PtgDiv",f:Tk},7:{n:"PtgPower",f:dl},8:{n:"PtgConcat",f:Rk},9:{n:"PtgLt",f:Zk},10:{n:"PtgLe",f:Yk},11:{n:"PtgEq",f:Uk},12:{n:"PtgGe",f:Vk},13:{n:"PtgGt",f:Wk},14:{n:"PtgNe",f:al},15:{n:"PtgIsect",f:Xk},16:{n:"PtgUnion",f:hl},17:{n:"PtgRange",f:el},18:{n:"PtgUplus",f:il},19:{n:"PtgUminus",f:gl},20:{n:"PtgPercent",f:cl},21:{n:"PtgParen",f:bl},22:{n:"PtgMissArg",f:$k},23:{n:"PtgStr",f:Ac},28:{n:"PtgErr",f:wc},29:{n:"PtgBool",f:yc},30:{n:"PtgInt",f:xc},31:{n:"PtgNum",f:zc},32:{n:"PtgArray",f:gc},33:{n:"PtgFunc",f:sc},34:{n:"PtgFuncVar",f:tc},35:{n:"PtgName",f:Ec},36:{n:"PtgRef",f:pc},37:{n:"PtgArea",f:bc},38:{n:"PtgMemArea",f:Gc},39:{n:"PtgMemErr",f:jl},40:{n:"PtgMemNoMem",f:kl},41:{n:"PtgMemFunc",f:Hc},42:{n:"PtgRefErr",f:Ic},43:{n:"PtgAreaErr",f:dc},44:{n:"PtgRefN",f:qc},45:{n:"PtgAreaN",f:fc},57:{n:"PtgNameX",f:Fc},58:{n:"PtgRef3d",f:rc},59:{n:"PtgArea3d",f:cc},60:{n:"PtgRefErr3d",f:ll},61:{n:"PtgAreaErr3d",f:ec},255:{}},ol={64:32,96:32,65:33,97:33,66:34,98:34,67:35,99:35,68:36,100:36,69:37,101:37,70:38,102:38,71:39,103:39,72:40,104:40,73:41,105:41,74:42,106:42,75:43,107:43,76:44,108:44,77:45,109:45,89:57,121:57,90:58,122:58,91:59,123:59,92:60,124:60,93:61,125:61};!function(){for(var a in ol)nl[a]=nl[ol[a]]}();var pl,ql,rl={},sl={1:{n:"PtgAttrSemi",f:lc},2:{n:"PtgAttrIf",f:kc},4:{n:"PtgAttrChoose",f:ic},8:{n:"PtgAttrGoto",f:jc},16:{n:"PtgAttrSum",f:Qk},32:{n:"PtgAttrBaxcel",f:hc},64:{n:"PtgAttrSpace",f:nc},65:{n:"PtgAttrSpaceSemi",f:oc},255:{}},tl=/(^|[^A-Za-z])R(\[?)(-?\d+|)\]?C(\[?)(-?\d+|)\]?/g,ul={0:"#NULL!",7:"#DIV/0!",15:"#VALUE!",23:"#REF!",29:"#NAME?",36:"#NUM!",42:"#N/A",43:"#GETTING_DATA",255:"#WTF?"},vl={0:"BEEP",1:"OPEN",2:"OPEN.LINKS",3:"CLOSE.ALL",4:"SAVE",5:"SAVE.AS",6:"FILE.DELETE",7:"PAGE.SETUP",8:"PRINT",9:"PRINTER.SETUP",10:"QUIT",11:"NEW.WINDOW",12:"ARRANGE.ALL",13:"WINDOW.SIZE",14:"WINDOW.MOVE",15:"FULL",16:"CLOSE",17:"RUN",22:"SET.PRINT.AREA",23:"SET.PRINT.TITLES",24:"SET.PAGE.BREAK",25:"REMOVE.PAGE.BREAK",26:"FONT",27:"DISPLAY",28:"PROTECT.DOCUMENT",29:"PRECISION",30:"A1.R1C1",31:"CALCULATE.NOW",32:"CALCULATION",34:"DATA.FIND",35:"EXTRACT",36:"DATA.DELETE",37:"SET.DATABASE",38:"SET.CRITERIA",39:"SORT",40:"DATA.SERIES",41:"TABLE",42:"FORMAT.NUMBER",43:"ALIGNMENT",44:"STYLE",45:"BORDER",46:"CELL.PROTECTION",47:"COLUMN.WIDTH",48:"UNDO",49:"CUT",50:"COPY",51:"PASTE",52:"CLEAR",53:"PASTE.SPECIAL",54:"EDIT.DELETE",55:"INSERT",56:"FILL.RIGHT",57:"FILL.DOWN",61:"DEFINE.NAME",62:"CREATE.NAMES",63:"FORMULA.GOTO",64:"FORMULA.FIND",65:"SELECT.LAST.CELL",66:"SHOW.ACTIVE.CELL",67:"GALLERY.AREA",68:"GALLERY.BAR",69:"GALLERY.COLUMN",70:"GALLERY.LINE",71:"GALLERY.PIE",72:"GALLERY.SCATTER",73:"COMBINATION",74:"PREFERRED",75:"ADD.OVERLAY",76:"GRIDLINES",77:"SET.PREFERRED",78:"AXES",79:"LEGEND",80:"ATTACH.TEXT",81:"ADD.ARROW",82:"SELECT.CHART",83:"SELECT.PLOT.AREA",84:"PATTERNS",85:"MAIN.CHART",86:"OVERLAY",87:"SCALE",88:"FORMAT.LEGEND",89:"FORMAT.TEXT",90:"EDIT.REPEAT",91:"PARSE",92:"JUSTIFY",93:"HIDE",94:"UNHIDE",95:"WORKSPACE",96:"FORMULA",97:"FORMULA.FILL",98:"FORMULA.ARRAY",99:"DATA.FIND.NEXT",100:"DATA.FIND.PREV",101:"FORMULA.FIND.NEXT",102:"FORMULA.FIND.PREV",103:"ACTIVATE",104:"ACTIVATE.NEXT",105:"ACTIVATE.PREV",106:"UNLOCKED.NEXT",107:"UNLOCKED.PREV",108:"COPY.PICTURE",109:"SELECT",110:"DELETE.NAME",111:"DELETE.FORMAT",112:"VLINE",113:"HLINE",114:"VPAGE",115:"HPAGE",116:"VSCROLL",117:"HSCROLL",118:"ALERT",119:"NEW",120:"CANCEL.COPY",121:"SHOW.CLIPBOARD",122:"MESSAGE",124:"PASTE.LINK",125:"APP.ACTIVATE",126:"DELETE.ARROW",127:"ROW.HEIGHT",128:"FORMAT.MOVE",129:"FORMAT.SIZE",130:"FORMULA.REPLACE",131:"SEND.KEYS",132:"SELECT.SPECIAL",133:"APPLY.NAMES",134:"REPLACE.FONT",135:"FREEZE.PANES",136:"SHOW.INFO",137:"SPLIT",138:"ON.WINDOW",139:"ON.DATA",140:"DISABLE.INPUT",142:"OUTLINE",143:"LIST.NAMES",144:"FILE.CLOSE",145:"SAVE.WORKBOOK",146:"DATA.FORM",147:"COPY.CHART",148:"ON.TIME",149:"WAIT",150:"FORMAT.FONT",151:"FILL.UP",152:"FILL.LEFT",153:"DELETE.OVERLAY",155:"SHORT.MENUS",159:"SET.UPDATE.STATUS",161:"COLOR.PALETTE",162:"DELETE.STYLE",163:"WINDOW.RESTORE",164:"WINDOW.MAXIMIZE",166:"CHANGE.LINK",167:"CALCULATE.DOCUMENT",168:"ON.KEY",169:"APP.RESTORE",170:"APP.MOVE",171:"APP.SIZE",172:"APP.MINIMIZE",173:"APP.MAXIMIZE",174:"BRING.TO.FRONT",175:"SEND.TO.BACK",185:"MAIN.CHART.TYPE",186:"OVERLAY.CHART.TYPE",187:"SELECT.END",188:"OPEN.MAIL",189:"SEND.MAIL",190:"STANDARD.FONT",191:"CONSOLIDATE",192:"SORT.SPECIAL",193:"GALLERY.3D.AREA",194:"GALLERY.3D.COLUMN",195:"GALLERY.3D.LINE",196:"GALLERY.3D.PIE",197:"VIEW.3D",198:"GOAL.SEEK",199:"WORKGROUP",200:"FILL.GROUP",201:"UPDATE.LINK",202:"PROMOTE",203:"DEMOTE",204:"SHOW.DETAIL",206:"UNGROUP",207:"OBJECT.PROPERTIES",208:"SAVE.NEW.OBJECT",209:"SHARE",210:"SHARE.NAME",211:"DUPLICATE",212:"APPLY.STYLE",213:"ASSIGN.TO.OBJECT",214:"OBJECT.PROTECTION",215:"HIDE.OBJECT",216:"SET.EXTRACT",217:"CREATE.PUBLISHER",218:"SUBSCRIBE.TO",219:"ATTRIBUTES",220:"SHOW.TOOLBAR",222:"PRINT.PREVIEW",223:"EDIT.COLOR",224:"SHOW.LEVELS",225:"FORMAT.MAIN",226:"FORMAT.OVERLAY",227:"ON.RECALC",228:"EDIT.SERIES",229:"DEFINE.STYLE",240:"LINE.PRINT",243:"ENTER.DATA",249:"GALLERY.RADAR",250:"MERGE.STYLES",251:"EDITION.OPTIONS",252:"PASTE.PICTURE",253:"PASTE.PICTURE.LINK",254:"SPELLING",256:"ZOOM",259:"INSERT.OBJECT",260:"WINDOW.MINIMIZE",265:"SOUND.NOTE",266:"SOUND.PLAY",267:"FORMAT.SHAPE",268:"EXTEND.POLYGON",269:"FORMAT.AUTO",272:"GALLERY.3D.BAR",273:"GALLERY.3D.SURFACE",274:"FILL.AUTO",276:"CUSTOMIZE.TOOLBAR",277:"ADD.TOOL",278:"EDIT.OBJECT",279:"ON.DOUBLECLICK",280:"ON.ENTRY",281:"WORKBOOK.ADD",282:"WORKBOOK.MOVE",283:"WORKBOOK.COPY",284:"WORKBOOK.OPTIONS",285:"SAVE.WORKSPACE",288:"CHART.WIZARD",289:"DELETE.TOOL",290:"MOVE.TOOL",291:"WORKBOOK.SELECT",292:"WORKBOOK.ACTIVATE",293:"ASSIGN.TO.TOOL",295:"COPY.TOOL",296:"RESET.TOOL",297:"CONSTRAIN.NUMERIC",298:"PASTE.TOOL",302:"WORKBOOK.NEW",305:"SCENARIO.CELLS",306:"SCENARIO.DELETE",307:"SCENARIO.ADD",308:"SCENARIO.EDIT",309:"SCENARIO.SHOW",310:"SCENARIO.SHOW.NEXT",311:"SCENARIO.SUMMARY",312:"PIVOT.TABLE.WIZARD",313:"PIVOT.FIELD.PROPERTIES",314:"PIVOT.FIELD",315:"PIVOT.ITEM",316:"PIVOT.ADD.FIELDS",318:"OPTIONS.CALCULATION",319:"OPTIONS.EDIT",320:"OPTIONS.VIEW",321:"ADDIN.MANAGER",322:"MENU.EDITOR",323:"ATTACH.TOOLBARS",324:"VBAActivate",325:"OPTIONS.CHART",328:"VBA.INSERT.FILE",330:"VBA.PROCEDURE.DEFINITION",336:"ROUTING.SLIP",338:"ROUTE.DOCUMENT",339:"MAIL.LOGON",342:"INSERT.PICTURE",343:"EDIT.TOOL",344:"GALLERY.DOUGHNUT",350:"CHART.TREND",352:"PIVOT.ITEM.PROPERTIES",354:"WORKBOOK.INSERT",355:"OPTIONS.TRANSITION",356:"OPTIONS.GENERAL",370:"FILTER.ADVANCED",373:"MAIL.ADD.MAILER",374:"MAIL.DELETE.MAILER",375:"MAIL.REPLY",376:"MAIL.REPLY.ALL",377:"MAIL.FORWARD",378:"MAIL.NEXT.LETTER",379:"DATA.LABEL",380:"INSERT.TITLE",381:"FONT.PROPERTIES",382:"MACRO.OPTIONS",383:"WORKBOOK.HIDE",384:"WORKBOOK.UNHIDE",385:"WORKBOOK.DELETE",386:"WORKBOOK.NAME",388:"GALLERY.CUSTOM",390:"ADD.CHART.AUTOFORMAT",391:"DELETE.CHART.AUTOFORMAT",392:"CHART.ADD.DATA",393:"AUTO.OUTLINE",394:"TAB.ORDER",395:"SHOW.DIALOG",396:"SELECT.ALL",397:"UNGROUP.SHEETS",398:"SUBTOTAL.CREATE",399:"SUBTOTAL.REMOVE",400:"RENAME.OBJECT",412:"WORKBOOK.SCROLL",413:"WORKBOOK.NEXT",414:"WORKBOOK.PREV",415:"WORKBOOK.TAB.SPLIT",416:"FULL.SCREEN",417:"WORKBOOK.PROTECT",420:"SCROLLBAR.PROPERTIES",421:"PIVOT.SHOW.PAGES",422:"TEXT.TO.COLUMNS",423:"FORMAT.CHARTTYPE",424:"LINK.FORMAT",425:"TRACER.DISPLAY",430:"TRACER.NAVIGATE",431:"TRACER.CLEAR",432:"TRACER.ERROR",433:"PIVOT.FIELD.GROUP",434:"PIVOT.FIELD.UNGROUP",435:"CHECKBOX.PROPERTIES",436:"LABEL.PROPERTIES",437:"LISTBOX.PROPERTIES",438:"EDITBOX.PROPERTIES",439:"PIVOT.REFRESH",440:"LINK.COMBO",441:"OPEN.TEXT",442:"HIDE.DIALOG",443:"SET.DIALOG.FOCUS",444:"ENABLE.OBJECT",445:"PUSHBUTTON.PROPERTIES",446:"SET.DIALOG.DEFAULT",447:"FILTER",448:"FILTER.SHOW.ALL",449:"CLEAR.OUTLINE",450:"FUNCTION.WIZARD",451:"ADD.LIST.ITEM",452:"SET.LIST.ITEM",453:"REMOVE.LIST.ITEM",454:"SELECT.LIST.ITEM",455:"SET.CONTROL.VALUE",456:"SAVE.COPY.AS",458:"OPTIONS.LISTS.ADD",459:"OPTIONS.LISTS.DELETE",460:"SERIES.AXES",461:"SERIES.X",462:"SERIES.Y",463:"ERRORBAR.X",464:"ERRORBAR.Y",465:"FORMAT.CHART",466:"SERIES.ORDER",467:"MAIL.LOGOFF",468:"CLEAR.ROUTING.SLIP",469:"APP.ACTIVATE.MICROSOFT",470:"MAIL.EDIT.MAILER",471:"ON.SHEET",472:"STANDARD.WIDTH",473:"SCENARIO.MERGE",474:"SUMMARY.INFO",475:"FIND.FILE",476:"ACTIVE.CELL.FONT",477:"ENABLE.TIPWIZARD",478:"VBA.MAKE.ADDIN",480:"INSERTDATATABLE",481:"WORKGROUP.OPTIONS",482:"MAIL.SEND.MAILER",485:"AUTOCORRECT",489:"POST.DOCUMENT",491:"PICKLIST",493:"VIEW.SHOW",494:"VIEW.DEFINE",495:"VIEW.DELETE",509:"SHEET.BACKGROUND",510:"INSERT.MAP.OBJECT",511:"OPTIONS.MENONO",517:"MSOCHECKS",518:"NORMAL",519:"LAYOUT",520:"RM.PRINT.AREA",521:"CLEAR.PRINT.AREA",522:"ADD.PRINT.AREA",523:"MOVE.BRK",545:"HIDECURR.NOTE",546:"HIDEALL.NOTES",547:"DELETE.NOTE",548:"TRAVERSE.NOTES",549:"ACTIVATE.NOTES",620:"PROTECT.REVISIONS",621:"UNPROTECT.REVISIONS",647:"OPTIONS.ME",653:"WEB.PUBLISH",667:"NEWWEBQUERY",673:"PIVOT.TABLE.CHART",753:"OPTIONS.SAVE",755:"OPTIONS.SPELL",808:"HIDEALL.INKANNOTS"},wl={0:"COUNT",1:"IF",2:"ISNA",3:"ISERROR",4:"SUM",5:"AVERAGE",6:"MIN",7:"MAX",8:"ROW",9:"COLUMN",10:"NA",11:"NPV",12:"STDEV",13:"DOLLAR",14:"FIXED",15:"SIN",16:"COS",17:"TAN",18:"ATAN",19:"PI",20:"SQRT",21:"EXP",22:"LN",23:"LOG10",24:"ABS",25:"INT",26:"SIGN",27:"ROUND",28:"LOOKUP",29:"INDEX",30:"REPT",31:"MID",32:"LEN",33:"VALUE",34:"TRUE",35:"FALSE",36:"AND",37:"OR",38:"NOT",39:"MOD",40:"DCOUNT",41:"DSUM",42:"DAVERAGE",43:"DMIN",44:"DMAX",45:"DSTDEV",46:"VAR",47:"DVAR",48:"TEXT",49:"LINEST",50:"TREND",51:"LOGEST",52:"GROWTH",53:"GOTO",54:"HALT",55:"RETURN",56:"PV",57:"FV",58:"NPER",59:"PMT",60:"RATE",61:"MIRR",62:"IRR",63:"RAND",64:"MATCH",65:"DATE",66:"TIME",67:"DAY",68:"MONTH",69:"YEAR",70:"WEEKDAY",71:"HOUR",72:"MINUTE",73:"SECOND",74:"NOW",75:"AREAS",76:"ROWS",77:"COLUMNS",78:"OFFSET",79:"ABSREF",80:"RELREF",81:"ARGUMENT",82:"SEARCH",83:"TRANSPOSE",84:"ERROR",85:"STEP",86:"TYPE",87:"ECHO",88:"SET.NAME",89:"CALLER",90:"DEREF",91:"WINDOWS",92:"SERIES",93:"DOCUMENTS",94:"ACTIVE.CELL",95:"SELECTION",96:"RESULT",97:"ATAN2",98:"ASIN",99:"ACOS",100:"CHOOSE",101:"HLOOKUP",102:"VLOOKUP",103:"LINKS",104:"INPUT",105:"ISREF",106:"GET.FORMULA",107:"GET.NAME",108:"SET.VALUE",109:"LOG",110:"EXEC",111:"CHAR",112:"LOWER",113:"UPPER",114:"PROPER",115:"LEFT",116:"RIGHT",117:"EXACT",118:"TRIM",119:"REPLACE",120:"SUBSTITUTE",121:"CODE",122:"NAMES",123:"DIRECTORY",124:"FIND",125:"CELL",126:"ISERR",127:"ISTEXT",128:"ISNUMBER",129:"ISBLANK",130:"T",131:"N",132:"FOPEN",133:"FCLOSE",134:"FSIZE",135:"FREADLN",136:"FREAD",137:"FWRITELN",138:"FWRITE",139:"FPOS",140:"DATEVALUE",141:"TIMEVALUE",142:"SLN",143:"SYD",144:"DDB",145:"GET.DEF",146:"REFTEXT",147:"TEXTREF",148:"INDIRECT",149:"REGISTER",150:"CALL",151:"ADD.BAR",152:"ADD.MENU",153:"ADD.COMMAND",154:"ENABLE.COMMAND",155:"CHECK.COMMAND",156:"RENAME.COMMAND",157:"SHOW.BAR",158:"DELETE.MENU",159:"DELETE.COMMAND",160:"GET.CHART.ITEM",161:"DIALOG.BOX",162:"CLEAN",163:"MDETERM",164:"MINVERSE",165:"MMULT",166:"FILES",167:"IPMT",168:"PPMT",169:"COUNTA",170:"CANCEL.KEY",171:"FOR",172:"WHILE",173:"BREAK",174:"NEXT",175:"INITIATE",176:"REQUEST",177:"POKE",178:"EXECUTE",179:"TERMINATE",180:"RESTART",181:"HELP",182:"GET.BAR",183:"PRODUCT",184:"FACT",185:"GET.CELL",186:"GET.WORKSPACE",187:"GET.WINDOW",188:"GET.DOCUMENT",189:"DPRODUCT",190:"ISNONTEXT",191:"GET.NOTE",192:"NOTE",193:"STDEVP",194:"VARP",195:"DSTDEVP",196:"DVARP",197:"TRUNC",198:"ISLOGICAL",199:"DCOUNTA",200:"DELETE.BAR",201:"UNREGISTER",204:"USDOLLAR",205:"FINDB",206:"SEARCHB",207:"REPLACEB",208:"LEFTB",209:"RIGHTB",210:"MIDB",211:"LENB",212:"ROUNDUP",213:"ROUNDDOWN",214:"ASC",215:"DBCS",216:"RANK",219:"ADDRESS",220:"DAYS360",221:"TODAY",222:"VDB",223:"ELSE",224:"ELSE.IF",225:"END.IF",226:"FOR.CELL",227:"MEDIAN",228:"SUMPRODUCT",229:"SINH",230:"COSH",231:"TANH",232:"ASINH",233:"ACOSH",234:"ATANH",235:"DGET",236:"CREATE.OBJECT",237:"VOLATILE",238:"LAST.ERROR",239:"CUSTOM.UNDO",240:"CUSTOM.REPEAT",241:"FORMULA.CONVERT",242:"GET.LINK.INFO",243:"TEXT.BOX",244:"INFO",245:"GROUP",246:"GET.OBJECT",247:"DB",248:"PAUSE",251:"RESUME",252:"FREQUENCY",253:"ADD.TOOLBAR",254:"DELETE.TOOLBAR",255:"User",256:"RESET.TOOLBAR",257:"EVALUATE",258:"GET.TOOLBAR",259:"GET.TOOL",260:"SPELLING.CHECK",261:"ERROR.TYPE",262:"APP.TITLE",263:"WINDOW.TITLE",264:"SAVE.TOOLBAR",265:"ENABLE.TOOL",266:"PRESS.TOOL",267:"REGISTER.ID",268:"GET.WORKBOOK",269:"AVEDEV",270:"BETADIST",271:"GAMMALN",272:"BETAINV",273:"BINOMDIST",274:"CHIDIST",275:"CHIINV",276:"COMBIN",277:"CONFIDENCE",278:"CRITBINOM",279:"EVEN",280:"EXPONDIST",281:"FDIST",282:"FINV",283:"FISHER",284:"FISHERINV",285:"FLOOR",286:"GAMMADIST",287:"GAMMAINV",288:"CEILING",289:"HYPGEOMDIST",290:"LOGNORMDIST",291:"LOGINV",292:"NEGBINOMDIST",293:"NORMDIST",294:"NORMSDIST",295:"NORMINV",296:"NORMSINV",297:"STANDARDIZE",298:"ODD",299:"PERMUT",300:"POISSON",301:"TDIST",302:"WEIBULL",303:"SUMXMY2",304:"SUMX2MY2",305:"SUMX2PY2",306:"CHITEST",307:"CORREL",308:"COVAR",309:"FORECAST",310:"FTEST",311:"INTERCEPT",312:"PEARSON",313:"RSQ",314:"STEYX",315:"SLOPE",316:"TTEST",317:"PROB",318:"DEVSQ",319:"GEOMEAN",320:"HARMEAN",321:"SUMSQ",322:"KURT",323:"SKEW",324:"ZTEST",325:"LARGE",326:"SMALL",327:"QUARTILE",328:"PERCENTILE",329:"PERCENTRANK",330:"MODE",331:"TRIMMEAN",332:"TINV",334:"MOVIE.COMMAND",335:"GET.MOVIE",336:"CONCATENATE",337:"POWER",338:"PIVOT.ADD.DATA",339:"GET.PIVOT.TABLE",340:"GET.PIVOT.FIELD",341:"GET.PIVOT.ITEM",342:"RADIANS",343:"DEGREES",344:"SUBTOTAL",345:"SUMIF",346:"COUNTIF",347:"COUNTBLANK",348:"SCENARIO.GET",349:"OPTIONS.LISTS.GET",350:"ISPMT",351:"DATEDIF",352:"DATESTRING",353:"NUMBERSTRING",354:"ROMAN",355:"OPEN.DIALOG",356:"SAVE.DIALOG",357:"VIEW.GET",358:"GETPIVOTDATA",359:"HYPERLINK",360:"PHONETIC",361:"AVERAGEA",362:"MAXA",363:"MINA",364:"STDEVPA",365:"VARPA",366:"STDEVA",367:"VARA",368:"BAHTTEXT",369:"THAIDAYOFWEEK",370:"THAIDIGIT",371:"THAIMONTHOFYEAR",372:"THAINUMSOUND",373:"THAINUMSTRING",374:"THAISTRINGLENGTH",375:"ISTHAIDIGIT",376:"ROUNDBAHTDOWN",377:"ROUNDBAHTUP",378:"THAIYEAR",379:"RTD"},xl={2:1,3:1,15:1,16:1,17:1,18:1,20:1,21:1,22:1,23:1,24:1,25:1,26:1,27:2,30:2,31:3,32:1,33:1,38:1,39:2,40:3,41:3,42:3,43:3,44:3,45:3,47:3,48:2,53:1,61:3,65:3,66:3,67:1,68:1,69:1,71:1,72:1,73:1,75:1,76:1,77:1,79:2,80:2,83:1,86:1,90:1,97:2,98:1,99:1,105:1,111:1,112:1,113:1,114:1,117:2,118:1,119:4,121:1,126:1,127:1,128:1,129:1,130:1,131:1,133:1,134:1,135:1,136:2,137:2,138:2,140:1,141:1,142:3,143:4,162:1,163:1,164:1,165:2,172:1,175:2,176:2,177:3,178:2,179:1,184:1,189:3,190:1,195:3,196:3,198:1,199:3,201:1,207:4,210:3,211:1,212:2,213:2,214:1,215:1,229:1,230:1,231:1,232:1,233:1,234:1,235:3,244:1,252:2,257:1,261:1,271:1,273:4,274:2,275:2,276:2,277:3,278:3,279:1,280:3,281:3,282:3,283:1,284:1,285:2,286:4,287:3,288:2,289:4,290:3,291:3,292:3,293:4,294:1,295:3,296:1,297:3,298:1,299:2,300:3,301:3,302:4,303:2,304:2,305:2,306:2,307:2,308:2,309:3,310:2,311:2,312:2,313:2,314:2,315:2,316:4,325:2,326:2,327:2,328:2,331:2,332:2,337:2,342:1,343:1,346:2,347:1,350:4,351:3,352:1,353:2,360:1,368:1,369:1,370:1,371:1,372:1,373:1,374:1,375:1,376:1,377:1,378:1,65535:0},yl={"_xlfn.ACOT":"ACOT","_xlfn.ACOTH":"ACOTH","_xlfn.AGGREGATE":"AGGREGATE","_xlfn.ARABIC":"ARABIC","_xlfn.AVERAGEIF":"AVERAGEIF","_xlfn.AVERAGEIFS":"AVERAGEIFS","_xlfn.BASE":"BASE","_xlfn.BETA.DIST":"BETA.DIST","_xlfn.BETA.INV":"BETA.INV","_xlfn.BINOM.DIST":"BINOM.DIST","_xlfn.BINOM.DIST.RANGE":"BINOM.DIST.RANGE","_xlfn.BINOM.INV":"BINOM.INV","_xlfn.BITAND":"BITAND","_xlfn.BITLSHIFT":"BITLSHIFT","_xlfn.BITOR":"BITOR","_xlfn.BITRSHIFT":"BITRSHIFT","_xlfn.BITXOR":"BITXOR","_xlfn.CEILING.MATH":"CEILING.MATH","_xlfn.CEILING.PRECISE":"CEILING.PRECISE","_xlfn.CHISQ.DIST":"CHISQ.DIST","_xlfn.CHISQ.DIST.RT":"CHISQ.DIST.RT","_xlfn.CHISQ.INV":"CHISQ.INV","_xlfn.CHISQ.INV.RT":"CHISQ.INV.RT","_xlfn.CHISQ.TEST":"CHISQ.TEST","_xlfn.COMBINA":"COMBINA","_xlfn.CONFIDENCE.NORM":"CONFIDENCE.NORM","_xlfn.CONFIDENCE.T":"CONFIDENCE.T","_xlfn.COT":"COT","_xlfn.COTH":"COTH","_xlfn.COUNTIFS":"COUNTIFS","_xlfn.COVARIANCE.P":"COVARIANCE.P","_xlfn.COVARIANCE.S":"COVARIANCE.S","_xlfn.CSC":"CSC","_xlfn.CSCH":"CSCH","_xlfn.DAYS":"DAYS","_xlfn.DECIMAL":"DECIMAL","_xlfn.ECMA.CEILING":"ECMA.CEILING","_xlfn.ERF.PRECISE":"ERF.PRECISE","_xlfn.ERFC.PRECISE":"ERFC.PRECISE","_xlfn.EXPON.DIST":"EXPON.DIST","_xlfn.F.DIST":"F.DIST","_xlfn.F.DIST.RT":"F.DIST.RT","_xlfn.F.INV":"F.INV","_xlfn.F.INV.RT":"F.INV.RT","_xlfn.F.TEST":"F.TEST","_xlfn.FILTERXML":"FILTERXML","_xlfn.FLOOR.MATH":"FLOOR.MATH","_xlfn.FLOOR.PRECISE":"FLOOR.PRECISE","_xlfn.FORMULATEXT":"FORMULATEXT","_xlfn.GAMMA":"GAMMA","_xlfn.GAMMA.DIST":"GAMMA.DIST","_xlfn.GAMMA.INV":"GAMMA.INV","_xlfn.GAMMALN.PRECISE":"GAMMALN.PRECISE","_xlfn.GAUSS":"GAUSS","_xlfn.HYPGEOM.DIST":"HYPGEOM.DIST","_xlfn.IFNA":"IFNA","_xlfn.IFERROR":"IFERROR","_xlfn.IMCOSH":"IMCOSH","_xlfn.IMCOT":"IMCOT","_xlfn.IMCSC":"IMCSC","_xlfn.IMCSCH":"IMCSCH","_xlfn.IMSEC":"IMSEC","_xlfn.IMSECH":"IMSECH","_xlfn.IMSINH":"IMSINH","_xlfn.IMTAN":"IMTAN","_xlfn.ISFORMULA":"ISFORMULA","_xlfn.ISO.CEILING":"ISO.CEILING","_xlfn.ISOWEEKNUM":"ISOWEEKNUM","_xlfn.LOGNORM.DIST":"LOGNORM.DIST","_xlfn.LOGNORM.INV":"LOGNORM.INV","_xlfn.MODE.MULT":"MODE.MULT","_xlfn.MODE.SNGL":"MODE.SNGL","_xlfn.MUNIT":"MUNIT","_xlfn.NEGBINOM.DIST":"NEGBINOM.DIST","_xlfn.NETWORKDAYS.INTL":"NETWORKDAYS.INTL","_xlfn.NIGBINOM":"NIGBINOM","_xlfn.NORM.DIST":"NORM.DIST","_xlfn.NORM.INV":"NORM.INV","_xlfn.NORM.S.DIST":"NORM.S.DIST","_xlfn.NORM.S.INV":"NORM.S.INV","_xlfn.NUMBERVALUE":"NUMBERVALUE","_xlfn.PDURATION":"PDURATION","_xlfn.PERCENTILE.EXC":"PERCENTILE.EXC","_xlfn.PERCENTILE.INC":"PERCENTILE.INC","_xlfn.PERCENTRANK.EXC":"PERCENTRANK.EXC","_xlfn.PERCENTRANK.INC":"PERCENTRANK.INC","_xlfn.PERMUTATIONA":"PERMUTATIONA","_xlfn.PHI":"PHI","_xlfn.POISSON.DIST":"POISSON.DIST","_xlfn.QUARTILE.EXC":"QUARTILE.EXC","_xlfn.QUARTILE.INC":"QUARTILE.INC","_xlfn.QUERYSTRING":"QUERYSTRING","_xlfn.RANK.AVG":"RANK.AVG","_xlfn.RANK.EQ":"RANK.EQ","_xlfn.RRI":"RRI","_xlfn.SEC":"SEC","_xlfn.SECH":"SECH","_xlfn.SHEET":"SHEET","_xlfn.SHEETS":"SHEETS","_xlfn.SKEW.P":"SKEW.P","_xlfn.STDEV.P":"STDEV.P","_xlfn.STDEV.S":"STDEV.S","_xlfn.SUMIFS":"SUMIFS","_xlfn.T.DIST":"T.DIST","_xlfn.T.DIST.2T":"T.DIST.2T","_xlfn.T.DIST.RT":"T.DIST.RT","_xlfn.T.INV":"T.INV","_xlfn.T.INV.2T":"T.INV.2T","_xlfn.T.TEST":"T.TEST","_xlfn.UNICHAR":"UNICHAR","_xlfn.UNICODE":"UNICODE","_xlfn.VAR.P":"VAR.P","_xlfn.VAR.S":"VAR.S","_xlfn.WEBSERVICE":"WEBSERVICE","_xlfn.WEIBULL.DIST":"WEIBULL.DIST","_xlfn.WORKDAY.INTL":"WORKDAY.INTL","_xlfn.XOR":"XOR","_xlfn.Z.TEST":"Z.TEST"},zl={6:{n:"Formula",f:Lc},10:{n:"EOF",f:ff},12:{n:"CalcCount",f:Ue},13:{n:"CalcMode",f:Xe},14:{n:"CalcPrecision",f:Ye},15:{n:"CalcRefMode",f:Ze},16:{n:"CalcDelta",f:Ve},17:{n:"CalcIter",f:We},18:{n:"Protect",f:zf},19:{n:"Password",f:tf},20:{n:"Header",f:nf},21:{n:"Footer",f:kf},23:{n:"ExternSheet",f:Ab},24:{n:"Lbl",f:zb},25:{n:"WinProtect",f:Kf},26:{n:"VerticalPageBreaks",f:Mf},27:{n:"HorizontalPageBreaks",f:Nf},28:{n:"Note",f:Fb},29:{n:"Selection",f:Of},34:{n:"Date1904",f:bf},35:{n:"ExternName",f:yb},38:{n:"LeftMargin",f:qf},39:{n:"RightMargin",f:Bf},40:{n:"TopMargin",f:Hf},41:{n:"BottomMargin",f:Se},42:{n:"PrintRowCol",f:vf},43:{n:"PrintGrid",f:uf},47:{n:"FilePass",f:Vb},49:{n:"Font",f:mb},51:{n:"PrintSize",f:wf},60:{n:"Continue",f:Pf},61:{n:"Window1",f:lb},64:{n:"Backup",f:Qe},65:{n:"Pane",f:Qf},66:{n:"CodePage",f:_e},77:{n:"Pls",f:Rf},80:{n:"DCon",f:Sf},81:{n:"DConRef",f:Tf},82:{n:"DConName",f:Uf},85:{n:"DefColWidth",f:cf},89:{n:"XCT",f:Vf},90:{n:"CRN",f:Wf},91:{n:"FileSharing",f:Xf},92:{n:"WriteAccess",f:db},93:{n:"Obj",f:Hb},94:{n:"Uncalced",f:Yf},95:{n:"CalcSaveRecalc",f:$e},96:{n:"Template",f:Zf},97:{n:"Intl",f:$f},99:{n:"ObjProtect",f:sf},125:{n:"ColInfo",f:_f},128:{n:"Guts",f:ub},129:{n:"WsBool",f:ag},130:{n:"GridSet",f:lf},131:{n:"HCenter",f:mf},132:{n:"VCenter",f:Jf},133:{n:"BoundSheet8",f:eb},134:{n:"WriteProtect",f:Lf},140:{n:"Country",f:Jb},141:{n:"HideObj",f:of},144:{n:"Sort",f:bg},146:{n:"Palette",f:cg},151:{n:"Sync",f:dg},152:{n:"LPr",f:eg},153:{n:"DxGCol",f:fg},154:{n:"FnGroupName",f:gg},155:{n:"FilterMode",f:hg},156:{n:"BuiltInFnGroupCount",f:Te},157:{n:"AutoFilterInfo",f:ig},158:{n:"AutoFilter",f:jg},160:{n:"Scl",f:Ef},161:{n:"Setup",f:kg},174:{n:"ScenMan",f:lg},175:{n:"SCENARIO",f:mg},176:{n:"SxView",f:ng},177:{n:"Sxvd",f:og},178:{n:"SXVI",f:pg},180:{n:"SxIvd",f:qg},181:{n:"SXLI",f:rg},182:{n:"SXPI",f:sg},184:{n:"DocRoute",f:tg},185:{n:"RecipName",f:ug},189:{n:"MulRk",f:sb},190:{n:"MulBlank",f:vg},193:{n:"Mms",f:rf},197:{n:"SXDI",f:wg},198:{n:"SXDB",f:xg},199:{n:"SXFDB",f:yg},200:{n:"SXDBB",f:zg},201:{n:"SXNum",f:Ag},202:{n:"SxBool",f:Gf},203:{n:"SxErr",f:Bg},204:{n:"SXInt",f:Cg},205:{n:"SXString",f:Dg},206:{n:"SXDtr",f:Eg},207:{n:"SxNil",f:Fg},208:{n:"SXTbl",f:Gg},209:{n:"SXTBRGIITM",f:Hg},210:{n:"SxTbpg",f:Ig},211:{n:"ObProj",f:Jg},213:{n:"SXStreamID",f:Kg},215:{n:"DBCell",f:Lg},216:{n:"SXRng",f:Mg},217:{n:"SxIsxoper",f:Ng},218:{n:"BookBool",f:Og},220:{n:"DbOrParamQry",f:Pg},221:{n:"ScenarioProtect",f:Df},222:{n:"OleObjectSize",f:Qg},224:{n:"XF",f:tb},225:{n:"InterfaceHdr",f:cb},226:{n:"InterfaceEnd",f:pf},227:{n:"SXVS",f:Rg},229:{n:"MergeCells",f:Gb},233:{n:"BkHim",f:Sg},235:{n:"MsoDrawingGroup",f:Tg},236:{n:"MsoDrawing",f:Ug},237:{n:"MsoDrawingSelection",f:Vg},239:{n:"PhoneticInfo",f:Wg},240:{n:"SxRule",f:Xg},241:{n:"SXEx",f:Yg},242:{n:"SxFilt",f:Zg},244:{n:"SxDXF",f:$g},245:{n:"SxItm",f:_g},246:{n:"SxName",f:ah},247:{n:"SxSelect",f:bh},248:{n:"SXPair",f:ch},249:{n:"SxFmla",f:dh},251:{n:"SxFormat",f:eh},252:{n:"SST",f:fb},253:{n:"LabelSst",f:nb},255:{n:"ExtSST",f:gb},256:{n:"SXVDEx",f:fh},259:{n:"SXFormula",f:gh},290:{n:"SXDBEx",f:hh},311:{n:"RRDInsDel",f:ih},312:{n:"RRDHead",f:jh},315:{n:"RRDChgCell",f:kh},317:{n:"RRTabId",f:Cf},318:{n:"RRDRenSheet",f:lh},319:{n:"RRSort",f:mh},320:{n:"RRDMove",f:nh},330:{n:"RRFormat",f:oh},331:{n:"RRAutoFmt",f:ph},333:{n:"RRInsertSh",f:qh},334:{n:"RRDMoveBegin",f:rh},335:{n:"RRDMoveEnd",f:sh},336:{n:"RRDInsDelBegin",f:th},337:{n:"RRDInsDelEnd",f:uh},338:{n:"RRDConflict",f:vh},339:{n:"RRDDefName",f:wh},340:{n:"RRDRstEtxp",f:xh},351:{n:"LRng",f:yh},352:{n:"UsesELFs",f:If},353:{n:"DSF",f:df},401:{n:"CUsr",f:zh},402:{n:"CbUsr",f:Ah},403:{n:"UsrInfo",f:Bh},404:{n:"UsrExcl",f:Ch},405:{n:"FileLock",f:Dh},406:{n:"RRDInfo",f:Eh},407:{n:"BCUsrs",f:Fh},408:{n:"UsrChk",f:Gh},425:{n:"UserBView",f:Hh},426:{n:"UserSViewBegin",f:Ih},427:{n:"UserSViewEnd",f:Jh},428:{n:"RRDUserView",f:Kh},429:{n:"Qsi",f:Lh},430:{n:"SupBook",f:xb},431:{n:"Prot4Rev",f:xf},432:{n:"CondFmt",f:Mh},433:{n:"CF",f:Nh},434:{n:"DVal",f:Oh},437:{n:"DConBin",f:Ph},438:{n:"TxO",f:Ib},439:{n:"RefreshAll",f:Af},440:{n:"HLink",f:Oe},441:{n:"Lel",f:Qh},442:{n:"CodeName",f:Rh},443:{n:"SXFDBType",f:Sh},444:{n:"Prot4RevPass",f:yf},445:{n:"ObNoMacros",f:Th},446:{n:"Dv",f:Uh},448:{n:"Excel9File",f:gf},449:{n:"RecalcId",f:jb,r:2},450:{n:"EntExU2",f:ef},512:{n:"Dimensions",f:qb},513:{n:"Blank",f:Re},515:{n:"Number",f:wb},516:{n:"Label",f:ob},517:{n:"BoolErr",f:vb},519:{n:"String",f:Ff},520:{n:"Row",f:hb},523:{n:"Index",f:Vh},545:{n:"Array",f:Cb},549:{n:"DefaultRowHeight",f:kb},566:{n:"Table",f:Wh},574:{n:"Window2",f:Xh},638:{n:"RK",f:rb},659:{n:"Style",f:Yh},1048:{n:"BigName",f:Zh},1054:{n:"Format",f:pb},1084:{n:"ContinueBigName",f:$h},1212:{n:"ShrFmla",f:Bb},2048:{n:"HLinkTooltip",f:Pe},2049:{n:"WebPub",f:_h},2050:{n:"QsiSXTag",f:ai},2051:{n:"DBQueryExt",f:bi},2052:{n:"ExtString",f:ci},2053:{n:"TxtQry",f:di},2054:{n:"Qsir",f:ei},2055:{n:"Qsif",f:fi},2056:{n:"RRDTQSIF",f:gi},2057:{n:"BOF",f:bb},2058:{n:"OleDbConn",f:hi},2059:{n:"WOpt",f:ii},2060:{n:"SXViewEx",f:ji},2061:{n:"SXTH",f:ki},2062:{n:"SXPIEx",f:li},2063:{n:"SXVDTEx",f:mi},2064:{n:"SXViewEx9",f:ni},2066:{n:"ContinueFrt",f:oi},2067:{n:"RealTimeData",f:pi},2128:{n:"ChartFrtInfo",f:qi},2129:{n:"FrtWrapper",f:ri},2130:{n:"StartBlock",f:si},2131:{n:"EndBlock",f:ti},2132:{n:"StartObject",f:ui},2133:{n:"EndObject",f:vi},2134:{n:"CatLab",f:wi},2135:{n:"YMult",f:xi},2136:{n:"SXViewLink",f:yi},2137:{n:"PivotChartBits",f:zi},2138:{n:"FrtFontList",f:Ai},2146:{n:"SheetExt",f:Bi},2147:{n:"BookExt",f:Ci,r:12},2148:{n:"SXAddl",f:Di},2149:{n:"CrErr",f:Ei},2150:{n:"HFPicture",f:Fi},2151:{n:"FeatHdr",f:hf},2152:{n:"Feat",f:Gi},2154:{n:"DataLabExt",f:Hi},2155:{n:"DataLabExtContents",f:Ii},2156:{n:"CellWatch",f:Ji},2161:{n:"FeatHdr11",f:Ki},2162:{n:"Feature11",f:Li},2164:{n:"DropDownObjIds",f:Mi},2165:{n:"ContinueFrt11",f:Ni},2166:{n:"DConn",f:Oi},2167:{n:"List12",f:Pi},2168:{n:"Feature12",f:Qi},2169:{n:"CondFmt12",f:Ri},2170:{n:"CF12",f:Si},2171:{n:"CFEx",f:Ti},2172:{n:"XFCRC",f:Ui},2173:{n:"XFExt",f:Vi},2174:{n:"AutoFilter12",f:Wi},2175:{n:"ContinueFrt12",f:Xi},2180:{n:"MDTInfo",f:Yi},2181:{n:"MDXStr",f:Zi},2182:{n:"MDXTuple",f:$i},2183:{n:"MDXSet",f:_i},2184:{n:"MDXProp",f:aj},2185:{n:"MDXKPI",f:bj},2186:{n:"MDB",f:cj},2187:{n:"PLV",f:dj},2188:{n:"Compat12",f:af,r:12},2189:{n:"DXF",f:ej},2190:{n:"TableStyles",f:fj,r:12},2191:{n:"TableStyle",f:gj},2192:{n:"TableStyleElement",f:hj},2194:{n:"StyleExt",f:ij},2195:{n:"NamePublish",f:jj},2196:{n:"NameCmt",f:kj},2197:{n:"SortData",f:lj},2198:{n:"Theme",f:mj},2199:{n:"GUIDTypeLib",f:nj},2200:{n:"FnGrp12",f:oj},2201:{n:"NameFnGrp12",f:pj},2202:{n:"MTRSettings",f:Db,r:12},2203:{n:"CompressPictures",f:Ke},2204:{n:"HeaderFooter",f:qj},2205:{n:"CrtLayout12",f:rj},2206:{n:"CrtMlFrt",f:sj},2207:{n:"CrtMlFrtContinue",f:tj},2211:{n:"ForceFullCalculation",f:ib},2212:{n:"ShapePropsStream",f:uj},2213:{n:"TextPropsStream",f:vj},2214:{n:"RichTextStream",f:wj},2215:{n:"CrtLayout12A",f:xj},4097:{n:"Units",f:yj},4098:{n:"Chart",f:zj},4099:{n:"Series",f:Aj},4102:{n:"DataFormat",f:Bj},4103:{n:"LineFormat",f:Cj},4105:{n:"MarkerFormat",f:Dj},4106:{n:"AreaFormat",f:Ej},4107:{n:"PieFormat",f:Fj},4108:{n:"AttachedLabel",f:Gj},4109:{n:"SeriesText",f:Hj},4116:{n:"ChartFormat",f:Ij},4117:{n:"Legend",f:Jj},4118:{n:"SeriesList",f:Kj},4119:{n:"Bar",f:Lj},4120:{n:"Line",f:Mj},4121:{n:"Pie",f:Nj},4122:{n:"Area",f:Oj},4123:{n:"Scatter",f:Pj},4124:{n:"CrtLine",f:Qj},4125:{n:"Axis",f:Rj},4126:{n:"Tick",f:Sj},4127:{n:"ValueRange",f:Tj},4128:{n:"CatSerRange",f:Uj},4129:{n:"AxisLine",f:Vj},4130:{n:"CrtLink",f:Wj},4132:{n:"DefaultText",f:Xj},4133:{n:"Text",f:Yj},4134:{n:"FontX",f:jf},4135:{n:"ObjectLink",f:Zj},4146:{n:"Frame",f:$j},4147:{n:"Begin",f:_j},4148:{n:"End",f:ak},4149:{n:"PlotArea",f:bk},4154:{n:"Chart3d",f:ck},4156:{n:"PicF",f:dk},4157:{n:"DropBar",f:ek},4158:{n:"Radar",f:fk},4159:{n:"Surf",f:gk},4160:{n:"RadarArea",f:hk},4161:{n:"AxisParent",f:ik},4163:{n:"LegendException",f:jk},4164:{n:"ShtProps",f:kk},4165:{n:"SerToCrt",f:lk},4166:{n:"AxesUsed",f:mk},4168:{n:"SBaseRef",f:nk},4170:{n:"SerParent",f:ok},4171:{n:"SerAuxTrend",f:pk},4174:{n:"IFmtRecord",f:qk},4175:{n:"Pos",f:rk},4176:{n:"AlRuns",f:sk},4177:{n:"BRAI",f:tk},4187:{n:"SerAuxErrBar",f:uk},4188:{n:"ClrtClient",f:vk},4189:{n:"SerFmt",f:wk},4191:{n:"Chart3DBarShape",f:xk},4192:{n:"Fbi",f:yk},4193:{n:"BopPop",f:zk},4194:{n:"AxcExt",f:Ak},4195:{n:"Dat",f:Bk},4196:{n:"PlotGrowth",f:Ck},4197:{n:"SIIndex",f:Dk},4198:{n:"GelFrame",f:Ek},4199:{n:"BopPopCustom",f:Fk},4200:{n:"Fbi2",f:Gk},22:{n:"ExternCount",f:A},126:{n:"RK",f:A},127:{n:"ImData",f:A},135:{n:"Addin",f:A},136:{n:"Edg",f:A},137:{n:"Pub",f:A},145:{n:"Sub",f:A},148:{n:"LHRecord",f:A},149:{n:"LHNGraph",f:A},150:{n:"Sound",f:A},169:{n:"CoordList",f:A},171:{n:"GCW",f:A},188:{n:"ShrFmla",f:A},194:{n:"AddMenu",f:A},195:{n:"DelMenu",f:A},214:{n:"RString",f:A},223:{n:"UDDesc",f:A},234:{n:"TabIdConf",f:A},354:{n:"XL5Modify",f:A},421:{n:"FileSharing2",f:A},536:{n:"Name",f:A},547:{n:"ExternName",f:yb},561:{n:"Font",f:A},1030:{n:"Formula",f:Lc},2157:{n:"FeatInfo",f:A},2163:{n:"FeatInfo11",f:A},2177:{n:"SXAddl12",f:A},2240:{n:"AutoWebPub",f:A},2241:{n:"ListObj",f:A},2242:{n:"ListField",f:A},2243:{n:"ListDV",f:A},2244:{n:"ListCondFmt",f:A},2245:{n:"ListCF",f:A},2246:{n:"FMQry",f:A},2247:{n:"FMSQry",f:A},2248:{n:"PLV",f:A},2249:{n:"LnExt",f:A},2250:{n:"MkrExt",f:A},2251:{n:"CrtCoopt",f:A},0:{}},Al={1:"US",2:"CA",3:"",7:"RU",20:"EG",30:"GR",31:"NL",32:"BE",33:"FR",34:"ES",36:"HU",39:"IT",41:"CH",43:"AT",44:"GB",45:"DK",46:"SE",47:"NO",48:"PL",49:"DE",52:"MX",55:"BR",61:"AU",64:"NZ",66:"TH",81:"JP",82:"KR",84:"VN",86:"CN",90:"TR",105:"JS",213:"DZ",216:"MA",218:"LY",351:"PT",354:"IS",358:"FI",420:"CZ",886:"TW",961:"LB",962:"JO",963:"SY",964:"IQ",965:"KW",966:"SA",971:"AE",972:"IL",974:"QA",981:"IR",65535:"US"},Bl=Vc([["cellNF",!1],["cellFormula",!0],["sheetRows",0,"n"],["bookSheets",!1],["bookProps",!1],["bookFiles",!1],["password",""],["WTF",!1]]),Cl=/&[a-z]*;/g,Dl=/_x([0-9a-fA-F]+)_/g,El=/&#(\d+);/g,Fl=(P(ul),{"General Number":"General","General Date":he._table[22],"Long Date":"dddd, mmmm dd, yyyy","Medium Date":he._table[15],"Short Date":he._table[14],"Long Time":he._table[19],"Medium Time":he._table[18],"Short Time":he._table[20],Currency:'"$"#,##0.00_);[Red]\\("$"#,##0.00\\)',Fixed:he._table[2],Standard:he._table[4],Percent:he._table[10],Scientific:he._table[11],"Yes/No":'"Yes";"Yes";"No";@',"True/False":'"True";"True";"False";@',"On/Off":'"Yes";"Yes";"No";@'}),Gl=/<(\/?)([a-z0-9]*:|)(\w+)[^>]*>/gm;
"undefined"!=typeof exports&&"undefined"!=typeof module&&module.exports&&(ql=require("fs"));var Hl=function(a,b){var c=ql.readFileSync(a);switch(b||(b={}),md(c,{type:"buffer"})){case 208:return Xc(ze.read(c,{type:"buffer"}),b);case 60:return ld(c,(b.type="buffer",b));default:throw"Unsupported file"}},Il={encode_col:ud,encode_row:rd,encode_cell:yd,encode_range:Ad,decode_col:td,decode_row:qd,split_cell:wd,decode_cell:xd,decode_range:zd,format_cell:Dd,get_formulae:Hd,make_csv:Gd,make_json:Ed,make_formulae:Hd,sheet_to_csv:Gd,sheet_to_json:Ed,sheet_to_formulae:Hd,sheet_to_row_object_array:Fd};a.parse_xlscfb=Xc,a.read=nd,a.readFile=Hl,a.utils=Il,a.CFB=ze,a.SSF=he}("undefined"!=typeof exports?exports:XLS),RegExp.escape=function(a){return a.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")},function(a){"use strict";var b;b="undefined"!=typeof jQuery&&jQuery?jQuery:{},b.csv={defaults:{separator:",",delimiter:'"',headers:!0},hooks:{castToScalar:function(a){var b=/\./;if(isNaN(a))return a;if(b.test(a))return parseFloat(a);var c=parseInt(a);return isNaN(c)?null:c}},parsers:{parse:function(b,c){function d(){if(j=0,k="",c.start&&c.state.rowNum<c.start)return i=[],c.state.rowNum++,void(c.state.colNum=1);if(c.onParseEntry===a)h.push(i);else{var b=c.onParseEntry(i,c.state);b!==!1&&h.push(b)}i=[],c.end&&c.state.rowNum>=c.end&&(l=!0),c.state.rowNum++,c.state.colNum=1}function e(){if(c.onParseValue===a)i.push(k);else{var b=c.onParseValue(k,c.state);b!==!1&&i.push(b)}k="",j=0,c.state.colNum++}var f=c.separator,g=c.delimiter;c.state.rowNum||(c.state.rowNum=1),c.state.colNum||(c.state.colNum=1);var h=[],i=[],j=0,k="",l=!1,m=RegExp.escape(f),n=RegExp.escape(g),o=/(D|S|\r\n|\n|\r|[^DS\r\n]+)/,p=o.source;return p=p.replace(/S/g,m),p=p.replace(/D/g,n),o=RegExp(p,"gm"),b.replace(o,function(a){if(!l)switch(j){case 0:if(a===f){k+="",e();break}if(a===g){j=1;break}if(/^(\r\n|\n|\r)$/.test(a)){e(),d();break}k+=a,j=3;break;case 1:if(a===g){j=2;break}k+=a,j=1;break;case 2:if(a===g){k+=a,j=1;break}if(a===f){e();break}if(/^(\r\n|\n|\r)$/.test(a)){e(),d();break}throw new Error("CSVDataError: Illegal State [Row:"+c.state.rowNum+"][Col:"+c.state.colNum+"]");case 3:if(a===f){e();break}if(/^(\r\n|\n|\r)$/.test(a)){e(),d();break}if(a===g)throw new Error("CSVDataError: Illegal Quote [Row:"+c.state.rowNum+"][Col:"+c.state.colNum+"]");throw new Error("CSVDataError: Illegal Data [Row:"+c.state.rowNum+"][Col:"+c.state.colNum+"]");default:throw new Error("CSVDataError: Unknown State [Row:"+c.state.rowNum+"][Col:"+c.state.colNum+"]")}}),0!==i.length&&(e(),d()),h},splitLines:function(b,c){function d(){if(h=0,c.start&&c.state.rowNum<c.start)return i="",void c.state.rowNum++;if(c.onParseEntry===a)g.push(i);else{var b=c.onParseEntry(i,c.state);b!==!1&&g.push(b)}i="",c.end&&c.state.rowNum>=c.end&&(j=!0),c.state.rowNum++}var e=c.separator,f=c.delimiter;c.state.rowNum||(c.state.rowNum=1);var g=[],h=0,i="",j=!1,k=RegExp.escape(e),l=RegExp.escape(f),m=/(D|S|\n|\r|[^DS\r\n]+)/,n=m.source;return n=n.replace(/S/g,k),n=n.replace(/D/g,l),m=RegExp(n,"gm"),b.replace(m,function(a){if(!j)switch(h){case 0:if(a===e){i+=a,h=0;break}if(a===f){i+=a,h=1;break}if("\n"===a){d();break}if(/^\r$/.test(a))break;i+=a,h=3;break;case 1:if(a===f){i+=a,h=2;break}i+=a,h=1;break;case 2:var b=i.substr(i.length-1);if(a===f&&b===f){i+=a,h=1;break}if(a===e){i+=a,h=0;break}if("\n"===a){d();break}if("\r"===a)break;throw new Error("CSVDataError: Illegal state [Row:"+c.state.rowNum+"]");case 3:if(a===e){i+=a,h=0;break}if("\n"===a){d();break}if("\r"===a)break;if(a===f)throw new Error("CSVDataError: Illegal quote [Row:"+c.state.rowNum+"]");throw new Error("CSVDataError: Illegal state [Row:"+c.state.rowNum+"]");default:throw new Error("CSVDataError: Unknown state [Row:"+c.state.rowNum+"]")}}),""!==i&&d(),g},parseEntry:function(b,c){function d(){if(c.onParseValue===a)g.push(i);else{var b=c.onParseValue(i,c.state);b!==!1&&g.push(b)}i="",h=0,c.state.colNum++}var e=c.separator,f=c.delimiter;c.state.rowNum||(c.state.rowNum=1),c.state.colNum||(c.state.colNum=1);var g=[],h=0,i="";if(!c.match){var j=RegExp.escape(e),k=RegExp.escape(f),l=/(D|S|\n|\r|[^DS\r\n]+)/,m=l.source;m=m.replace(/S/g,j),m=m.replace(/D/g,k),c.match=RegExp(m,"gm")}return b.replace(c.match,function(a){switch(h){case 0:if(a===e){i+="",d();break}if(a===f){h=1;break}if("\n"===a||"\r"===a)break;i+=a,h=3;break;case 1:if(a===f){h=2;break}i+=a,h=1;break;case 2:if(a===f){i+=a,h=1;break}if(a===e){d();break}if("\n"===a||"\r"===a)break;throw new Error("CSVDataError: Illegal State [Row:"+c.state.rowNum+"][Col:"+c.state.colNum+"]");case 3:if(a===e){d();break}if("\n"===a||"\r"===a)break;if(a===f)throw new Error("CSVDataError: Illegal Quote [Row:"+c.state.rowNum+"][Col:"+c.state.colNum+"]");throw new Error("CSVDataError: Illegal Data [Row:"+c.state.rowNum+"][Col:"+c.state.colNum+"]");default:throw new Error("CSVDataError: Unknown State [Row:"+c.state.rowNum+"][Col:"+c.state.colNum+"]")}}),d(),g}},helpers:{collectPropertyNames:function(a){var b,c,d=[];for(b in a)for(c in a[b])a[b].hasOwnProperty(c)&&d.indexOf(c)<0&&"function"!=typeof a[b][c]&&d.push(c);return d}},toArray:function(c,d,e){var d=d!==a?d:{},f={};f.callback=e!==a&&"function"==typeof e?e:!1,f.separator="separator"in d?d.separator:b.csv.defaults.separator,f.delimiter="delimiter"in d?d.delimiter:b.csv.defaults.delimiter;var g=d.state!==a?d.state:{},d={delimiter:f.delimiter,separator:f.separator,onParseEntry:d.onParseEntry,onParseValue:d.onParseValue,state:g},h=b.csv.parsers.parseEntry(c,d);return f.callback?void f.callback("",h):h},toArrays:function(c,d,e){var d=d!==a?d:{},f={};f.callback=e!==a&&"function"==typeof e?e:!1,f.separator="separator"in d?d.separator:b.csv.defaults.separator,f.delimiter="delimiter"in d?d.delimiter:b.csv.defaults.delimiter;var g=[],d={delimiter:f.delimiter,separator:f.separator,onPreParse:d.onPreParse,onParseEntry:d.onParseEntry,onParseValue:d.onParseValue,onPostParse:d.onPostParse,start:d.start,end:d.end,state:{rowNum:1,colNum:1}};return d.onPreParse!==a&&d.onPreParse(c,d.state),g=b.csv.parsers.parse(c,d),d.onPostParse!==a&&d.onPostParse(g,d.state),f.callback?void f.callback("",g):g},toObjects:function(c,d,e){var d=d!==a?d:{},f={};f.callback=e!==a&&"function"==typeof e?e:!1,f.separator="separator"in d?d.separator:b.csv.defaults.separator,f.delimiter="delimiter"in d?d.delimiter:b.csv.defaults.delimiter,f.headers="headers"in d?d.headers:b.csv.defaults.headers,d.start="start"in d?d.start:1,f.headers&&d.start++,d.end&&f.headers&&d.end++;var g=[],h=[],d={delimiter:f.delimiter,separator:f.separator,onPreParse:d.onPreParse,onParseEntry:d.onParseEntry,onParseValue:d.onParseValue,onPostParse:d.onPostParse,start:d.start,end:d.end,state:{rowNum:1,colNum:1},match:!1,transform:d.transform},i={delimiter:f.delimiter,separator:f.separator,start:1,end:1,state:{rowNum:1,colNum:1}};d.onPreParse!==a&&d.onPreParse(c,d.state);var j=b.csv.parsers.splitLines(c,i),k=b.csv.toArray(j[0],d),g=b.csv.parsers.splitLines(c,d);d.state.colNum=1,d.state.rowNum=k?2:1;for(var l=0,m=g.length;m>l;l++){for(var n=b.csv.toArray(g[l],d),o={},p=0;p<k.length;p++)o[k[p]]=n[p];h.push(d.transform!==a?d.transform.call(a,o):o),d.state.rowNum++}return d.onPostParse!==a&&d.onPostParse(h,d.state),f.callback?void f.callback("",h):h},fromArrays:function(c,d,e){var d=d!==a?d:{},f={};f.callback=e!==a&&"function"==typeof e?e:!1,f.separator="separator"in d?d.separator:b.csv.defaults.separator,f.delimiter="delimiter"in d?d.delimiter:b.csv.defaults.delimiter;var g,h,i,j,k="";for(i=0;i<c.length;i++){for(g=c[i],h=[],j=0;j<g.length;j++){var l=g[j]===a||null===g[j]?"":g[j].toString();l.indexOf(f.delimiter)>-1&&(l=l.replace(f.delimiter,f.delimiter+f.delimiter));var m="\n|\r|S|D";m=m.replace("S",f.separator),m=m.replace("D",f.delimiter),l.search(m)>-1&&(l=f.delimiter+l+f.delimiter),h.push(l)}k+=h.join(f.separator)+"\r\n"}return f.callback?void f.callback("",k):k},fromObjects:function(c,d,e){var d=d!==a?d:{},f={};if(f.callback=e!==a&&"function"==typeof e?e:!1,f.separator="separator"in d?d.separator:b.csv.defaults.separator,f.delimiter="delimiter"in d?d.delimiter:b.csv.defaults.delimiter,f.headers="headers"in d?d.headers:b.csv.defaults.headers,f.sortOrder="sortOrder"in d?d.sortOrder:"declare",f.manualOrder="manualOrder"in d?d.manualOrder:[],f.transform=d.transform,"string"==typeof f.manualOrder&&(f.manualOrder=b.csv.toArray(f.manualOrder,f)),f.transform!==a){var g=c;c=[];var h;for(h=0;h<g.length;h++)c.push(f.transform.call(a,g[h]))}var i=b.csv.helpers.collectPropertyNames(c);if("alpha"===f.sortOrder&&i.sort(),f.manualOrder.length>0){var j,k=[].concat(f.manualOrder);for(j=0;j<i.length;j++)k.indexOf(i[j])<0&&k.push(i[j]);i=k}var l,j,m,n,o=[];for(f.headers&&o.push(i),l=0;l<c.length;l++){for(m=[],j=0;j<i.length;j++)n=i[j],m.push(n in c[l]&&"function"!=typeof c[l][n]?c[l][n]:"");o.push(m)}return b.csv.fromArrays(o,d,f.callback)}},b.csvEntry2Array=b.csv.toArray,b.csv2Array=b.csv.toArrays,b.csv2Dictionary=b.csv.toObjects,"undefined"!=typeof module&&module.exports&&(module.exports=b.csv)}.call(this),!function(a){"use strict";function b(a,b){var c=(65535&a)+(65535&b),d=(a>>16)+(b>>16)+(c>>16);return d<<16|65535&c}function c(a,b){return a<<b|a>>>32-b}function d(a,d,e,f,g,h){return b(c(b(b(d,a),b(f,h)),g),e)}function e(a,b,c,e,f,g,h){return d(b&c|~b&e,a,b,f,g,h)}function f(a,b,c,e,f,g,h){return d(b&e|c&~e,a,b,f,g,h)}function g(a,b,c,e,f,g,h){return d(b^c^e,a,b,f,g,h)}function h(a,b,c,e,f,g,h){return d(c^(b|~e),a,b,f,g,h)}function i(a,c){a[c>>5]|=128<<c%32,a[(c+64>>>9<<4)+14]=c;var d,i,j,k,l,m=1732584193,n=-271733879,o=-1732584194,p=271733878;for(d=0;d<a.length;d+=16)i=m,j=n,k=o,l=p,m=e(m,n,o,p,a[d],7,-680876936),p=e(p,m,n,o,a[d+1],12,-389564586),o=e(o,p,m,n,a[d+2],17,606105819),n=e(n,o,p,m,a[d+3],22,-1044525330),m=e(m,n,o,p,a[d+4],7,-176418897),p=e(p,m,n,o,a[d+5],12,1200080426),o=e(o,p,m,n,a[d+6],17,-1473231341),n=e(n,o,p,m,a[d+7],22,-45705983),m=e(m,n,o,p,a[d+8],7,1770035416),p=e(p,m,n,o,a[d+9],12,-1958414417),o=e(o,p,m,n,a[d+10],17,-42063),n=e(n,o,p,m,a[d+11],22,-1990404162),m=e(m,n,o,p,a[d+12],7,1804603682),p=e(p,m,n,o,a[d+13],12,-40341101),o=e(o,p,m,n,a[d+14],17,-1502002290),n=e(n,o,p,m,a[d+15],22,1236535329),m=f(m,n,o,p,a[d+1],5,-165796510),p=f(p,m,n,o,a[d+6],9,-1069501632),o=f(o,p,m,n,a[d+11],14,643717713),n=f(n,o,p,m,a[d],20,-373897302),m=f(m,n,o,p,a[d+5],5,-701558691),p=f(p,m,n,o,a[d+10],9,38016083),o=f(o,p,m,n,a[d+15],14,-660478335),n=f(n,o,p,m,a[d+4],20,-405537848),m=f(m,n,o,p,a[d+9],5,568446438),p=f(p,m,n,o,a[d+14],9,-1019803690),o=f(o,p,m,n,a[d+3],14,-187363961),n=f(n,o,p,m,a[d+8],20,1163531501),m=f(m,n,o,p,a[d+13],5,-1444681467),p=f(p,m,n,o,a[d+2],9,-51403784),o=f(o,p,m,n,a[d+7],14,1735328473),n=f(n,o,p,m,a[d+12],20,-1926607734),m=g(m,n,o,p,a[d+5],4,-378558),p=g(p,m,n,o,a[d+8],11,-2022574463),o=g(o,p,m,n,a[d+11],16,1839030562),n=g(n,o,p,m,a[d+14],23,-35309556),m=g(m,n,o,p,a[d+1],4,-1530992060),p=g(p,m,n,o,a[d+4],11,1272893353),o=g(o,p,m,n,a[d+7],16,-155497632),n=g(n,o,p,m,a[d+10],23,-1094730640),m=g(m,n,o,p,a[d+13],4,681279174),p=g(p,m,n,o,a[d],11,-358537222),o=g(o,p,m,n,a[d+3],16,-722521979),n=g(n,o,p,m,a[d+6],23,76029189),m=g(m,n,o,p,a[d+9],4,-640364487),p=g(p,m,n,o,a[d+12],11,-421815835),o=g(o,p,m,n,a[d+15],16,530742520),n=g(n,o,p,m,a[d+2],23,-995338651),m=h(m,n,o,p,a[d],6,-198630844),p=h(p,m,n,o,a[d+7],10,1126891415),o=h(o,p,m,n,a[d+14],15,-1416354905),n=h(n,o,p,m,a[d+5],21,-57434055),m=h(m,n,o,p,a[d+12],6,1700485571),p=h(p,m,n,o,a[d+3],10,-1894986606),o=h(o,p,m,n,a[d+10],15,-1051523),n=h(n,o,p,m,a[d+1],21,-2054922799),m=h(m,n,o,p,a[d+8],6,1873313359),p=h(p,m,n,o,a[d+15],10,-30611744),o=h(o,p,m,n,a[d+6],15,-1560198380),n=h(n,o,p,m,a[d+13],21,1309151649),m=h(m,n,o,p,a[d+4],6,-145523070),p=h(p,m,n,o,a[d+11],10,-1120210379),o=h(o,p,m,n,a[d+2],15,718787259),n=h(n,o,p,m,a[d+9],21,-343485551),m=b(m,i),n=b(n,j),o=b(o,k),p=b(p,l);return[m,n,o,p]}function j(a){var b,c="";for(b=0;b<32*a.length;b+=8)c+=String.fromCharCode(a[b>>5]>>>b%32&255);return c}function k(a){var b,c=[];for(c[(a.length>>2)-1]=void 0,b=0;b<c.length;b+=1)c[b]=0;for(b=0;b<8*a.length;b+=8)c[b>>5]|=(255&a.charCodeAt(b/8))<<b%32;return c}function l(a){return j(i(k(a),8*a.length))}function m(a,b){var c,d,e=k(a),f=[],g=[];for(f[15]=g[15]=void 0,e.length>16&&(e=i(e,8*a.length)),c=0;16>c;c+=1)f[c]=909522486^e[c],g[c]=1549556828^e[c];return d=i(f.concat(k(b)),512+8*b.length),j(i(g.concat(d),640))}function n(a){var b,c,d="0123456789abcdef",e="";for(c=0;c<a.length;c+=1)b=a.charCodeAt(c),e+=d.charAt(b>>>4&15)+d.charAt(15&b);return e}function o(a){return unescape(encodeURIComponent(a))}function p(a){return l(o(a))}function q(a){return n(p(a))}function r(a,b){return m(o(a),o(b))}function s(a,b){return n(r(a,b))}function t(a,b,c){return b?c?r(b,a):s(b,a):c?p(a):q(a)}"function"==typeof define&&define.amd?define(function(){return t}):a.md5=t}(this);;
/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
// @version: 0.4.2
window.PolymerGestures={},function(a){var b=!1,c=document.createElement("meta");if(c.createShadowRoot){var d=c.createShadowRoot(),e=document.createElement("span");d.appendChild(e),c.addEventListener("testpath",function(a){a.path&&(b=a.path[0]===e),a.stopPropagation()});var f=new CustomEvent("testpath",{bubbles:!0});document.head.appendChild(c),e.dispatchEvent(f),c.parentNode.removeChild(c),d=e=null}c=null;var g={shadow:function(a){return a?a.shadowRoot||a.webkitShadowRoot:void 0},canTarget:function(a){return a&&Boolean(a.elementFromPoint)},targetingShadow:function(a){var b=this.shadow(a);return this.canTarget(b)?b:void 0},olderShadow:function(a){var b=a.olderShadowRoot;if(!b){var c=a.querySelector("shadow");c&&(b=c.olderShadowRoot)}return b},allShadows:function(a){for(var b=[],c=this.shadow(a);c;)b.push(c),c=this.olderShadow(c);return b},searchRoot:function(a,b,c){var d,e;return a?(d=a.elementFromPoint(b,c),d?e=this.targetingShadow(d):a!==document&&(e=this.olderShadow(a)),this.searchRoot(e,b,c)||d):void 0},owner:function(a){if(!a)return document;for(var b=a;b.parentNode;)b=b.parentNode;return b.nodeType!=Node.DOCUMENT_NODE&&b.nodeType!=Node.DOCUMENT_FRAGMENT_NODE&&(b=document),b},findTarget:function(a){if(b&&a.path&&a.path.length)return a.path[0];var c=a.clientX,d=a.clientY,e=this.owner(a.target);return e.elementFromPoint(c,d)||(e=document),this.searchRoot(e,c,d)},findTouchAction:function(a){var c;if(b&&a.path&&a.path.length){for(var d=a.path,e=0;e<d.length;e++)if(c=d[e],c.nodeType===Node.ELEMENT_NODE&&c.hasAttribute("touch-action"))return c.getAttribute("touch-action")}else for(c=a.target;c;){if(c.nodeType===Node.ELEMENT_NODE&&c.hasAttribute("touch-action"))return c.getAttribute("touch-action");c=c.parentNode||c.host}return"auto"},LCA:function(a,b){if(a===b)return a;if(a&&!b)return a;if(b&&!a)return b;if(!b&&!a)return document;if(a.contains&&a.contains(b))return a;if(b.contains&&b.contains(a))return b;var c=this.depth(a),d=this.depth(b),e=c-d;for(e>=0?a=this.walk(a,e):b=this.walk(b,-e);a&&b&&a!==b;)a=a.parentNode||a.host,b=b.parentNode||b.host;return a},walk:function(a,b){for(var c=0;a&&b>c;c++)a=a.parentNode||a.host;return a},depth:function(a){for(var b=0;a;)b++,a=a.parentNode||a.host;return b},deepContains:function(a,b){var c=this.LCA(a,b);return c===a},insideNode:function(a,b,c){var d=a.getBoundingClientRect();return d.left<=b&&b<=d.right&&d.top<=c&&c<=d.bottom},path:function(a){var c;if(b&&a.path&&a.path.length)c=a.path;else{c=[];for(var d=this.findTarget(a);d;)c.push(d),d=d.parentNode||d.host}return c}};a.targetFinding=g,a.findTarget=g.findTarget.bind(g),a.deepContains=g.deepContains.bind(g),a.insideNode=g.insideNode}(window.PolymerGestures),function(){function a(a){return"html /deep/ "+b(a)}function b(a){return'[touch-action="'+a+'"]'}function c(a){return"{ -ms-touch-action: "+a+"; touch-action: "+a+";}"}var d=["none","auto","pan-x","pan-y",{rule:"pan-x pan-y",selectors:["pan-x pan-y","pan-y pan-x"]},"manipulation"],e="",f="string"==typeof document.head.style.touchAction,g=!window.ShadowDOMPolyfill&&document.head.createShadowRoot;if(f){d.forEach(function(d){String(d)===d?(e+=b(d)+c(d)+"\n",g&&(e+=a(d)+c(d)+"\n")):(e+=d.selectors.map(b)+c(d.rule)+"\n",g&&(e+=d.selectors.map(a)+c(d.rule)+"\n"))});var h=document.createElement("style");h.textContent=e,document.head.appendChild(h)}}(),function(a){var b=["bubbles","cancelable","view","detail","screenX","screenY","clientX","clientY","ctrlKey","altKey","shiftKey","metaKey","button","relatedTarget","pageX","pageY"],c=[!1,!1,null,null,0,0,0,0,!1,!1,!1,!1,0,null,0,0],d=function(){return function(){}},e={preventTap:d,makeBaseEvent:function(a,b){var c=document.createEvent("Event");return c.initEvent(a,b.bubbles||!1,b.cancelable||!1),c.preventTap=e.preventTap(c),c},makeGestureEvent:function(a,b){b=b||Object.create(null);for(var c,d=this.makeBaseEvent(a,b),e=0,f=Object.keys(b);e<f.length;e++)c=f[e],d[c]=b[c];return d},makePointerEvent:function(a,d){d=d||Object.create(null);for(var e,f=this.makeBaseEvent(a,d),g=0;g<b.length;g++)e=b[g],f[e]=d[e]||c[g];f.buttons=d.buttons||0;var h=0;return h=d.pressure?d.pressure:f.buttons?.5:0,f.x=f.clientX,f.y=f.clientY,f.pointerId=d.pointerId||0,f.width=d.width||0,f.height=d.height||0,f.pressure=h,f.tiltX=d.tiltX||0,f.tiltY=d.tiltY||0,f.pointerType=d.pointerType||"",f.hwTimestamp=d.hwTimestamp||0,f.isPrimary=d.isPrimary||!1,f._source=d._source||"",f}};a.eventFactory=e}(window.PolymerGestures),function(a){function b(){if(c){var a=new Map;return a.pointers=d,a}this.keys=[],this.values=[]}var c=window.Map&&window.Map.prototype.forEach,d=function(){return this.size};b.prototype={set:function(a,b){var c=this.keys.indexOf(a);c>-1?this.values[c]=b:(this.keys.push(a),this.values.push(b))},has:function(a){return this.keys.indexOf(a)>-1},"delete":function(a){var b=this.keys.indexOf(a);b>-1&&(this.keys.splice(b,1),this.values.splice(b,1))},get:function(a){var b=this.keys.indexOf(a);return this.values[b]},clear:function(){this.keys.length=0,this.values.length=0},forEach:function(a,b){this.values.forEach(function(c,d){a.call(b,c,this.keys[d],this)},this)},pointers:function(){return this.keys.length}},a.PointerMap=b}(window.PolymerGestures),function(a){var b,c=["bubbles","cancelable","view","detail","screenX","screenY","clientX","clientY","ctrlKey","altKey","shiftKey","metaKey","button","relatedTarget","buttons","pointerId","width","height","pressure","tiltX","tiltY","pointerType","hwTimestamp","isPrimary","type","target","currentTarget","which","pageX","pageY","timeStamp","preventTap","tapPrevented","_source"],d=[!1,!1,null,null,0,0,0,0,!1,!1,!1,!1,0,null,0,0,0,0,0,0,0,"",0,!1,"",null,null,0,0,0,0,function(){},!1],e="undefined"!=typeof SVGElementInstance,f=a.eventFactory,g={IS_IOS:!1,pointermap:new a.PointerMap,requiredGestures:new a.PointerMap,eventMap:Object.create(null),eventSources:Object.create(null),eventSourceList:[],gestures:[],dependencyMap:{down:{listeners:0,index:-1},up:{listeners:0,index:-1}},gestureQueue:[],registerSource:function(a,b){var c=b,d=c.events;d&&(d.forEach(function(a){c[a]&&(this.eventMap[a]=c[a].bind(c))},this),this.eventSources[a]=c,this.eventSourceList.push(c))},registerGesture:function(a,b){var c=Object.create(null);c.listeners=0,c.index=this.gestures.length;for(var d,e=0;e<b.exposes.length;e++)d=b.exposes[e].toLowerCase(),this.dependencyMap[d]=c;this.gestures.push(b)},register:function(a,b){for(var c,d=this.eventSourceList.length,e=0;d>e&&(c=this.eventSourceList[e]);e++)c.register.call(c,a,b)},unregister:function(a){for(var b,c=this.eventSourceList.length,d=0;c>d&&(b=this.eventSourceList[d]);d++)b.unregister.call(b,a)},down:function(a){this.requiredGestures.set(a.pointerId,b),this.fireEvent("down",a)},move:function(a){a.type="move",this.fillGestureQueue(a)},up:function(a){this.fireEvent("up",a),this.requiredGestures.delete(a.pointerId)},cancel:function(a){a.tapPrevented=!0,this.fireEvent("up",a),this.requiredGestures.delete(a.pointerId)},addGestureDependency:function(a,b){var c=a._pgEvents;if(c)for(var d,e,f,g=Object.keys(c),h=0;h<g.length;h++)f=g[h],c[f]>0&&(d=this.dependencyMap[f],e=d?d.index:-1,b[e]=!0)},eventHandler:function(c){var d=c.type;if("touchstart"===d||"mousedown"===d||"pointerdown"===d||"MSPointerDown"===d)if(c._handledByPG||(b={}),this.IS_IOS)for(var e,f=a.targetFinding.path(c),g=0;g<f.length;g++)e=f[g],this.addGestureDependency(e,b);else this.addGestureDependency(c.currentTarget,b);if(!c._handledByPG){var h=this.eventMap&&this.eventMap[d];h&&h(c),c._handledByPG=!0}},listen:function(a,b){for(var c,d=0,e=b.length;e>d&&(c=b[d]);d++)this.addEvent(a,c)},unlisten:function(a,b){for(var c,d=0,e=b.length;e>d&&(c=b[d]);d++)this.removeEvent(a,c)},addEvent:function(a,b){a.addEventListener(b,this.boundHandler)},removeEvent:function(a,b){a.removeEventListener(b,this.boundHandler)},makeEvent:function(a,b){var c=f.makePointerEvent(a,b);return c.preventDefault=b.preventDefault,c.tapPrevented=b.tapPrevented,c._target=c._target||b.target,c},fireEvent:function(a,b){var c=this.makeEvent(a,b);return this.dispatchEvent(c)},cloneEvent:function(a){for(var b,f=Object.create(null),g=0;g<c.length;g++)b=c[g],f[b]=a[b]||d[g],("target"===b||"relatedTarget"===b)&&e&&f[b]instanceof SVGElementInstance&&(f[b]=f[b].correspondingUseElement);return f.preventDefault=function(){a.preventDefault()},f},dispatchEvent:function(a){var b=a._target;if(b){b.dispatchEvent(a);var c=this.cloneEvent(a);c.target=b,this.fillGestureQueue(c)}},gestureTrigger:function(){for(var a,b,c=0;c<this.gestureQueue.length;c++){a=this.gestureQueue[c],b=a._requiredGestures;for(var d,e,f=0;f<this.gestures.length;f++)b[f]&&(d=this.gestures[f],e=d[a.type],e&&e.call(d,a))}this.gestureQueue.length=0},fillGestureQueue:function(a){this.gestureQueue.length||requestAnimationFrame(this.boundGestureTrigger),a._requiredGestures=this.requiredGestures.get(a.pointerId),this.gestureQueue.push(a)}};g.boundHandler=g.eventHandler.bind(g),g.boundGestureTrigger=g.gestureTrigger.bind(g),a.dispatcher=g,a.activateGesture=function(a,b){var c=b.toLowerCase(),d=g.dependencyMap[c];if(d){var e=g.gestures[d.index];if(a._pgListeners||(g.register(a),a._pgListeners=0),e){var f,h=e.defaultActions&&e.defaultActions[c];switch(a.nodeType){case Node.ELEMENT_NODE:f=a;break;case Node.DOCUMENT_FRAGMENT_NODE:f=a.host;break;default:f=null}h&&f&&!f.hasAttribute("touch-action")&&f.setAttribute("touch-action",h)}a._pgEvents||(a._pgEvents={}),a._pgEvents[c]=(a._pgEvents[c]||0)+1,a._pgListeners++}return Boolean(d)},a.addEventListener=function(b,c,d,e){d&&(a.activateGesture(b,c),b.addEventListener(c,d,e))},a.deactivateGesture=function(a,b){var c=b.toLowerCase(),d=g.dependencyMap[c];return d&&(a._pgListeners>0&&a._pgListeners--,0===a._pgListeners&&g.unregister(a),a._pgEvents&&(a._pgEvents[c]>0?a._pgEvents[c]--:a._pgEvents[c]=0)),Boolean(d)},a.removeEventListener=function(b,c,d,e){d&&(a.deactivateGesture(b,c),b.removeEventListener(c,d,e))}}(window.PolymerGestures),function(a){var b=a.dispatcher,c=b.pointermap,d=25,e=[0,1,4,2],f=!1;try{f=1===new MouseEvent("test",{buttons:1}).buttons}catch(g){}var h={POINTER_ID:1,POINTER_TYPE:"mouse",events:["mousedown","mousemove","mouseup"],exposes:["down","up","move"],register:function(a){b.listen(a,this.events)},unregister:function(a){a!==document&&b.unlisten(a,this.events)},lastTouches:[],isEventSimulatedFromTouch:function(a){for(var b,c=this.lastTouches,e=a.clientX,f=a.clientY,g=0,h=c.length;h>g&&(b=c[g]);g++){var i=Math.abs(e-b.x),j=Math.abs(f-b.y);if(d>=i&&d>=j)return!0}},prepareEvent:function(a){var c=b.cloneEvent(a);return c.pointerId=this.POINTER_ID,c.isPrimary=!0,c.pointerType=this.POINTER_TYPE,c._source="mouse",f||(c.buttons=e[c.which]||0),c},mousedown:function(d){if(!this.isEventSimulatedFromTouch(d)){var e=c.has(this.POINTER_ID);e&&this.mouseup(d);var f=this.prepareEvent(d);f.target=a.findTarget(d),c.set(this.POINTER_ID,f.target),b.down(f)}},mousemove:function(a){if(!this.isEventSimulatedFromTouch(a)){var d=c.get(this.POINTER_ID);if(d){var e=this.prepareEvent(a);e.target=d,0===e.buttons?(b.cancel(e),this.cleanupMouse()):b.move(e)}}},mouseup:function(d){if(!this.isEventSimulatedFromTouch(d)){var e=this.prepareEvent(d);e.relatedTarget=a.findTarget(d),e.target=c.get(this.POINTER_ID),b.up(e),this.cleanupMouse()}},cleanupMouse:function(){c["delete"](this.POINTER_ID)}};a.mouseEvents=h}(window.PolymerGestures),function(a){var b=a.dispatcher,c=(a.targetFinding.allShadows.bind(a.targetFinding),b.pointermap),d=(Array.prototype.map.call.bind(Array.prototype.map),2500),e=200,f=20,g=!1,h={IS_IOS:!1,events:["touchstart","touchmove","touchend","touchcancel"],exposes:["down","up","move"],register:function(a,c){(this.IS_IOS?c:!c)&&b.listen(a,this.events)},unregister:function(a){this.IS_IOS||b.unlisten(a,this.events)},scrollTypes:{EMITTER:"none",XSCROLLER:"pan-x",YSCROLLER:"pan-y"},touchActionToScrollType:function(a){var b=a,c=this.scrollTypes;return b===c.EMITTER?"none":b===c.XSCROLLER?"X":b===c.YSCROLLER?"Y":"XY"},POINTER_TYPE:"touch",firstTouch:null,isPrimaryTouch:function(a){return this.firstTouch===a.identifier},setPrimaryTouch:function(a){(0===c.pointers()||1===c.pointers()&&c.has(1))&&(this.firstTouch=a.identifier,this.firstXY={X:a.clientX,Y:a.clientY},this.scrolling=null,this.cancelResetClickCount())},removePrimaryPointer:function(a){a.isPrimary&&(this.firstTouch=null,this.firstXY=null,this.resetClickCount())},clickCount:0,resetId:null,resetClickCount:function(){var a=function(){this.clickCount=0,this.resetId=null}.bind(this);this.resetId=setTimeout(a,e)},cancelResetClickCount:function(){this.resetId&&clearTimeout(this.resetId)},typeToButtons:function(a){var b=0;return("touchstart"===a||"touchmove"===a)&&(b=1),b},findTarget:function(b,d){if("touchstart"===this.currentTouchEvent.type){if(this.isPrimaryTouch(b)){var e={clientX:b.clientX,clientY:b.clientY,path:this.currentTouchEvent.path,target:this.currentTouchEvent.target};return a.findTarget(e)}return a.findTarget(b)}return c.get(d)},touchToPointer:function(a){var c=this.currentTouchEvent,d=b.cloneEvent(a),e=d.pointerId=a.identifier+2;d.target=this.findTarget(a,e),d.bubbles=!0,d.cancelable=!0,d.detail=this.clickCount,d.buttons=this.typeToButtons(c.type),d.width=a.webkitRadiusX||a.radiusX||0,d.height=a.webkitRadiusY||a.radiusY||0,d.pressure=a.webkitForce||a.force||.5,d.isPrimary=this.isPrimaryTouch(a),d.pointerType=this.POINTER_TYPE,d._source="touch";var f=this;return d.preventDefault=function(){f.scrolling=!1,f.firstXY=null,c.preventDefault()},d},processTouches:function(a,b){var d=a.changedTouches;this.currentTouchEvent=a;for(var e,f,g=0;g<d.length;g++)e=d[g],f=this.touchToPointer(e),"touchstart"===a.type&&c.set(f.pointerId,f.target),c.has(f.pointerId)&&b.call(this,f),("touchend"===a.type||a._cancel)&&this.cleanUpPointer(f)},shouldScroll:function(b){if(this.firstXY){var c,d=a.targetFinding.findTouchAction(b),e=this.touchActionToScrollType(d);if("none"===e)c=!1;else if("XY"===e)c=!0;else{var f=b.changedTouches[0],g=e,h="Y"===e?"X":"Y",i=Math.abs(f["client"+g]-this.firstXY[g]),j=Math.abs(f["client"+h]-this.firstXY[h]);c=i>=j}return c}},findTouch:function(a,b){for(var c,d=0,e=a.length;e>d&&(c=a[d]);d++)if(c.identifier===b)return!0},vacuumTouches:function(a){var b=a.touches;if(c.pointers()>=b.length){var d=[];c.forEach(function(a,c){if(1!==c&&!this.findTouch(b,c-2)){var e=a;d.push(e)}},this),d.forEach(function(a){this.cancel(a),c.delete(a.pointerId)})}},touchstart:function(a){this.vacuumTouches(a),this.setPrimaryTouch(a.changedTouches[0]),this.dedupSynthMouse(a),this.scrolling||(this.clickCount++,this.processTouches(a,this.down))},down:function(a){b.down(a)},touchmove:function(a){if(g)a.cancelable&&this.processTouches(a,this.move);else if(this.scrolling){if(this.firstXY){var b=a.changedTouches[0],c=b.clientX-this.firstXY.X,d=b.clientY-this.firstXY.Y,e=Math.sqrt(c*c+d*d);e>=f&&(this.touchcancel(a),this.scrolling=!0,this.firstXY=null)}}else null===this.scrolling&&this.shouldScroll(a)?this.scrolling=!0:(this.scrolling=!1,a.preventDefault(),this.processTouches(a,this.move))},move:function(a){b.move(a)},touchend:function(a){this.dedupSynthMouse(a),this.processTouches(a,this.up)},up:function(c){c.relatedTarget=a.findTarget(c),b.up(c)},cancel:function(a){b.cancel(a)},touchcancel:function(a){a._cancel=!0,this.processTouches(a,this.cancel)},cleanUpPointer:function(a){c["delete"](a.pointerId),this.removePrimaryPointer(a)},dedupSynthMouse:function(b){var c=a.mouseEvents.lastTouches,e=b.changedTouches[0];if(this.isPrimaryTouch(e)){var f={x:e.clientX,y:e.clientY};c.push(f);var g=function(a,b){var c=a.indexOf(b);c>-1&&a.splice(c,1)}.bind(null,c,f);setTimeout(g,d)}}};a.touchEvents=h}(window.PolymerGestures),function(a){var b=a.dispatcher,c=b.pointermap,d=window.MSPointerEvent&&"number"==typeof window.MSPointerEvent.MSPOINTER_TYPE_MOUSE,e={events:["MSPointerDown","MSPointerMove","MSPointerUp","MSPointerCancel"],register:function(a){b.listen(a,this.events)},unregister:function(a){a!==document&&b.unlisten(a,this.events)},POINTER_TYPES:["","unavailable","touch","pen","mouse"],prepareEvent:function(a){var c=a;return c=b.cloneEvent(a),d&&(c.pointerType=this.POINTER_TYPES[a.pointerType]),c._source="ms",c},cleanup:function(a){c["delete"](a)},MSPointerDown:function(d){var e=this.prepareEvent(d);e.target=a.findTarget(d),c.set(d.pointerId,e.target),b.down(e)},MSPointerMove:function(a){var d=c.get(a.pointerId);if(d){var e=this.prepareEvent(a);e.target=d,b.move(e)}},MSPointerUp:function(d){var e=this.prepareEvent(d);e.relatedTarget=a.findTarget(d),e.target=c.get(e.pointerId),b.up(e),this.cleanup(d.pointerId)},MSPointerCancel:function(d){var e=this.prepareEvent(d);e.relatedTarget=a.findTarget(d),e.target=c.get(e.pointerId),b.cancel(e),this.cleanup(d.pointerId)}};a.msEvents=e}(window.PolymerGestures),function(a){var b=a.dispatcher,c=b.pointermap,d={events:["pointerdown","pointermove","pointerup","pointercancel"],prepareEvent:function(a){var c=b.cloneEvent(a);return c._source="pointer",c},register:function(a){b.listen(a,this.events)},unregister:function(a){a!==document&&b.unlisten(a,this.events)},cleanup:function(a){c["delete"](a)},pointerdown:function(d){var e=this.prepareEvent(d);e.target=a.findTarget(d),c.set(e.pointerId,e.target),b.down(e)},pointermove:function(a){var d=c.get(a.pointerId);if(d){var e=this.prepareEvent(a);e.target=d,b.move(e)}},pointerup:function(d){var e=this.prepareEvent(d);e.relatedTarget=a.findTarget(d),e.target=c.get(e.pointerId),b.up(e),this.cleanup(d.pointerId)},pointercancel:function(d){var e=this.prepareEvent(d);e.relatedTarget=a.findTarget(d),e.target=c.get(e.pointerId),b.cancel(e),this.cleanup(d.pointerId)}};a.pointerEvents=d}(window.PolymerGestures),function(a){var b=a.dispatcher,c=window.navigator;window.PointerEvent?b.registerSource("pointer",a.pointerEvents):c.msPointerEnabled?b.registerSource("ms",a.msEvents):(b.registerSource("mouse",a.mouseEvents),void 0!==window.ontouchstart&&b.registerSource("touch",a.touchEvents));var d=navigator.userAgent,e=d.match(/iPad|iPhone|iPod/)&&"ontouchstart"in window;b.IS_IOS=e,a.touchEvents.IS_IOS=e,b.register(document,!0)}(window.PolymerGestures),function(a){var b=a.dispatcher,c=a.eventFactory,d=new a.PointerMap,e={events:["down","move","up"],exposes:["trackstart","track","trackx","tracky","trackend"],defaultActions:{track:"none",trackx:"pan-y",tracky:"pan-x"},WIGGLE_THRESHOLD:4,clampDir:function(a){return a>0?1:-1},calcPositionDelta:function(a,b){var c=0,d=0;return a&&b&&(c=b.pageX-a.pageX,d=b.pageY-a.pageY),{x:c,y:d}},fireTrack:function(a,b,d){var e=d,f=this.calcPositionDelta(e.downEvent,b),g=this.calcPositionDelta(e.lastMoveEvent,b);if(g.x)e.xDirection=this.clampDir(g.x);else if("trackx"===a)return;if(g.y)e.yDirection=this.clampDir(g.y);else if("tracky"===a)return;var h={bubbles:!0,cancelable:!0,trackInfo:e.trackInfo,relatedTarget:b.relatedTarget,pointerType:b.pointerType,pointerId:b.pointerId,_source:"track"};"tracky"!==a&&(h.x=b.x,h.dx=f.x,h.ddx=g.x,h.clientX=b.clientX,h.pageX=b.pageX,h.screenX=b.screenX,h.xDirection=e.xDirection),"trackx"!==a&&(h.dy=f.y,h.ddy=g.y,h.y=b.y,h.clientY=b.clientY,h.pageY=b.pageY,h.screenY=b.screenY,h.yDirection=e.yDirection);var i=c.makeGestureEvent(a,h);e.downTarget.dispatchEvent(i)},down:function(a){if(a.isPrimary&&("mouse"===a.pointerType?1===a.buttons:!0)){var b={downEvent:a,downTarget:a.target,trackInfo:{},lastMoveEvent:null,xDirection:0,yDirection:0,tracking:!1};d.set(a.pointerId,b)}},move:function(a){var b=d.get(a.pointerId);if(b){if(!b.tracking){var c=this.calcPositionDelta(b.downEvent,a),e=c.x*c.x+c.y*c.y;e>this.WIGGLE_THRESHOLD&&(b.tracking=!0,b.lastMoveEvent=b.downEvent,this.fireTrack("trackstart",a,b))}b.tracking&&(this.fireTrack("track",a,b),this.fireTrack("trackx",a,b),this.fireTrack("tracky",a,b)),b.lastMoveEvent=a}},up:function(a){var b=d.get(a.pointerId);b&&(b.tracking&&this.fireTrack("trackend",a,b),d.delete(a.pointerId))}};b.registerGesture("track",e)}(window.PolymerGestures),function(a){var b=a.dispatcher,c=a.eventFactory,d={HOLD_DELAY:200,WIGGLE_THRESHOLD:16,events:["down","move","up"],exposes:["hold","holdpulse","release"],heldPointer:null,holdJob:null,pulse:function(){var a=Date.now()-this.heldPointer.timeStamp,b=this.held?"holdpulse":"hold";this.fireHold(b,a),this.held=!0},cancel:function(){clearInterval(this.holdJob),this.held&&this.fireHold("release"),this.held=!1,this.heldPointer=null,this.target=null,this.holdJob=null},down:function(a){a.isPrimary&&!this.heldPointer&&(this.heldPointer=a,this.target=a.target,this.holdJob=setInterval(this.pulse.bind(this),this.HOLD_DELAY))},up:function(a){this.heldPointer&&this.heldPointer.pointerId===a.pointerId&&this.cancel()},move:function(a){if(this.heldPointer&&this.heldPointer.pointerId===a.pointerId){var b=a.clientX-this.heldPointer.clientX,c=a.clientY-this.heldPointer.clientY;b*b+c*c>this.WIGGLE_THRESHOLD&&this.cancel()}},fireHold:function(a,b){var d={bubbles:!0,cancelable:!0,pointerType:this.heldPointer.pointerType,pointerId:this.heldPointer.pointerId,x:this.heldPointer.clientX,y:this.heldPointer.clientY,_source:"hold"};b&&(d.holdTime=b);var e=c.makeGestureEvent(a,d);this.target.dispatchEvent(e)}};b.registerGesture("hold",d)}(window.PolymerGestures),function(a){var b=a.dispatcher,c=a.eventFactory,d=new a.PointerMap,e={events:["down","up"],exposes:["tap"],down:function(a){a.isPrimary&&!a.tapPrevented&&d.set(a.pointerId,{target:a.target,buttons:a.buttons,x:a.clientX,y:a.clientY})},shouldTap:function(a,b){return"mouse"===a.pointerType?1===b.buttons:!a.tapPrevented},up:function(b){var e=d.get(b.pointerId);if(e&&this.shouldTap(b,e)){var f=a.targetFinding.LCA(e.target,b.relatedTarget);if(f){var g=c.makeGestureEvent("tap",{bubbles:!0,cancelable:!0,x:b.clientX,y:b.clientY,detail:b.detail,pointerType:b.pointerType,pointerId:b.pointerId,altKey:b.altKey,ctrlKey:b.ctrlKey,metaKey:b.metaKey,shiftKey:b.shiftKey,_source:"tap"});f.dispatchEvent(g)}}d.delete(b.pointerId)}};c.preventTap=function(a){return function(){a.tapPrevented=!0,d.delete(a.pointerId)}},b.registerGesture("tap",e)}(window.PolymerGestures),function(a){"use strict";function b(a,b){if(!a)throw new Error("ASSERT: "+b)}function c(a){return a>=48&&57>=a}function d(a){return 32===a||9===a||11===a||12===a||160===a||a>=5760&&"\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\ufeff".indexOf(String.fromCharCode(a))>0}function e(a){return 10===a||13===a||8232===a||8233===a}function f(a){return 36===a||95===a||a>=65&&90>=a||a>=97&&122>=a}function g(a){return 36===a||95===a||a>=65&&90>=a||a>=97&&122>=a||a>=48&&57>=a}function h(a){return"this"===a}function i(){for(;Y>X&&d(W.charCodeAt(X));)++X}function j(){var a,b;for(a=X++;Y>X&&(b=W.charCodeAt(X),g(b));)++X;return W.slice(a,X)}function k(){var a,b,c;return a=X,b=j(),c=1===b.length?S.Identifier:h(b)?S.Keyword:"null"===b?S.NullLiteral:"true"===b||"false"===b?S.BooleanLiteral:S.Identifier,{type:c,value:b,range:[a,X]}}function l(){var a,b,c=X,d=W.charCodeAt(X),e=W[X];switch(d){case 46:case 40:case 41:case 59:case 44:case 123:case 125:case 91:case 93:case 58:case 63:return++X,{type:S.Punctuator,value:String.fromCharCode(d),range:[c,X]};default:if(a=W.charCodeAt(X+1),61===a)switch(d){case 37:case 38:case 42:case 43:case 45:case 47:case 60:case 62:case 124:return X+=2,{type:S.Punctuator,value:String.fromCharCode(d)+String.fromCharCode(a),range:[c,X]};case 33:case 61:return X+=2,61===W.charCodeAt(X)&&++X,{type:S.Punctuator,value:W.slice(c,X),range:[c,X]}}}return b=W[X+1],e===b&&"&|".indexOf(e)>=0?(X+=2,{type:S.Punctuator,value:e+b,range:[c,X]}):"<>=!+-*%&|^/".indexOf(e)>=0?(++X,{type:S.Punctuator,value:e,range:[c,X]}):void s({},V.UnexpectedToken,"ILLEGAL")}function m(){var a,d,e;if(e=W[X],b(c(e.charCodeAt(0))||"."===e,"Numeric literal must start with a decimal digit or a decimal point"),d=X,a="","."!==e){for(a=W[X++],e=W[X],"0"===a&&e&&c(e.charCodeAt(0))&&s({},V.UnexpectedToken,"ILLEGAL");c(W.charCodeAt(X));)a+=W[X++];e=W[X]}if("."===e){for(a+=W[X++];c(W.charCodeAt(X));)a+=W[X++];e=W[X]}if("e"===e||"E"===e)if(a+=W[X++],e=W[X],("+"===e||"-"===e)&&(a+=W[X++]),c(W.charCodeAt(X)))for(;c(W.charCodeAt(X));)a+=W[X++];else s({},V.UnexpectedToken,"ILLEGAL");return f(W.charCodeAt(X))&&s({},V.UnexpectedToken,"ILLEGAL"),{type:S.NumericLiteral,value:parseFloat(a),range:[d,X]}}function n(){var a,c,d,f="",g=!1;for(a=W[X],b("'"===a||'"'===a,"String literal must starts with a quote"),c=X,++X;Y>X;){if(d=W[X++],d===a){a="";break}if("\\"===d)if(d=W[X++],d&&e(d.charCodeAt(0)))"\r"===d&&"\n"===W[X]&&++X;else switch(d){case"n":f+="\n";break;case"r":f+="\r";break;case"t":f+="	";break;case"b":f+="\b";break;case"f":f+="\f";break;case"v":f+="";break;default:f+=d}else{if(e(d.charCodeAt(0)))break;f+=d}}return""!==a&&s({},V.UnexpectedToken,"ILLEGAL"),{type:S.StringLiteral,value:f,octal:g,range:[c,X]}}function o(a){return a.type===S.Identifier||a.type===S.Keyword||a.type===S.BooleanLiteral||a.type===S.NullLiteral}function p(){var a;return i(),X>=Y?{type:S.EOF,range:[X,X]}:(a=W.charCodeAt(X),40===a||41===a||58===a?l():39===a||34===a?n():f(a)?k():46===a?c(W.charCodeAt(X+1))?m():l():c(a)?m():l())}function q(){var a;return a=$,X=a.range[1],$=p(),X=a.range[1],a}function r(){var a;a=X,$=p(),X=a}function s(a,c){var d,e=Array.prototype.slice.call(arguments,2),f=c.replace(/%(\d)/g,function(a,c){return b(c<e.length,"Message reference must be in range"),e[c]});throw d=new Error(f),d.index=X,d.description=f,d}function t(a){s(a,V.UnexpectedToken,a.value)}function u(a){var b=q();(b.type!==S.Punctuator||b.value!==a)&&t(b)}function v(a){return $.type===S.Punctuator&&$.value===a}function w(a){return $.type===S.Keyword&&$.value===a}function x(){var a=[];for(u("[");!v("]");)v(",")?(q(),a.push(null)):(a.push(bb()),v("]")||u(","));return u("]"),Z.createArrayExpression(a)}function y(){var a;return i(),a=q(),a.type===S.StringLiteral||a.type===S.NumericLiteral?Z.createLiteral(a):Z.createIdentifier(a.value)}function z(){var a,b;return a=$,i(),(a.type===S.EOF||a.type===S.Punctuator)&&t(a),b=y(),u(":"),Z.createProperty("init",b,bb())}function A(){var a=[];for(u("{");!v("}");)a.push(z()),v("}")||u(",");return u("}"),Z.createObjectExpression(a)}function B(){var a;return u("("),a=bb(),u(")"),a}function C(){var a,b,c;return v("(")?B():(a=$.type,a===S.Identifier?c=Z.createIdentifier(q().value):a===S.StringLiteral||a===S.NumericLiteral?c=Z.createLiteral(q()):a===S.Keyword?w("this")&&(q(),c=Z.createThisExpression()):a===S.BooleanLiteral?(b=q(),b.value="true"===b.value,c=Z.createLiteral(b)):a===S.NullLiteral?(b=q(),b.value=null,c=Z.createLiteral(b)):v("[")?c=x():v("{")&&(c=A()),c?c:void t(q()))}function D(){var a=[];if(u("("),!v(")"))for(;Y>X&&(a.push(bb()),!v(")"));)u(",");return u(")"),a}function E(){var a;return a=q(),o(a)||t(a),Z.createIdentifier(a.value)}function F(){return u("."),E()}function G(){var a;return u("["),a=bb(),u("]"),a}function H(){var a,b,c;for(a=C();;)if(v("["))c=G(),a=Z.createMemberExpression("[",a,c);else if(v("."))c=F(),a=Z.createMemberExpression(".",a,c);else{if(!v("("))break;b=D(),a=Z.createCallExpression(a,b)}return a}function I(){var a,b;return $.type!==S.Punctuator&&$.type!==S.Keyword?b=ab():v("+")||v("-")||v("!")?(a=q(),b=I(),b=Z.createUnaryExpression(a.value,b)):w("delete")||w("void")||w("typeof")?s({},V.UnexpectedToken):b=ab(),b}function J(a){var b=0;if(a.type!==S.Punctuator&&a.type!==S.Keyword)return 0;switch(a.value){case"||":b=1;break;case"&&":b=2;break;case"==":case"!=":case"===":case"!==":b=6;break;case"<":case">":case"<=":case">=":case"instanceof":b=7;break;case"in":b=7;break;case"+":case"-":b=9;break;case"*":case"/":case"%":b=11}return b}function K(){var a,b,c,d,e,f,g,h;if(g=I(),b=$,c=J(b),0===c)return g;for(b.prec=c,q(),e=I(),d=[g,b,e];(c=J($))>0;){for(;d.length>2&&c<=d[d.length-2].prec;)e=d.pop(),f=d.pop().value,g=d.pop(),a=Z.createBinaryExpression(f,g,e),d.push(a);b=q(),b.prec=c,d.push(b),a=I(),d.push(a)}for(h=d.length-1,a=d[h];h>1;)a=Z.createBinaryExpression(d[h-1].value,d[h-2],a),h-=2;return a}function L(){var a,b,c;return a=K(),v("?")&&(q(),b=L(),u(":"),c=L(),a=Z.createConditionalExpression(a,b,c)),a}function M(){var a,b;return a=q(),a.type!==S.Identifier&&t(a),b=v("(")?D():[],Z.createFilter(a.value,b)}function N(){for(;v("|");)q(),M()}function O(){i(),r();var a=bb();a&&(","===$.value||"in"==$.value&&a.type===U.Identifier?Q(a):(N(),"as"===$.value?P(a):Z.createTopLevel(a))),$.type!==S.EOF&&t($)}function P(a){q();var b=q().value;Z.createAsExpression(a,b)}function Q(a){var b;","===$.value&&(q(),$.type!==S.Identifier&&t($),b=q().value),q();var c=bb();N(),Z.createInExpression(a.name,b,c)}function R(a,b){return Z=b,W=a,X=0,Y=W.length,$=null,_={labelSet:{}},O()}var S,T,U,V,W,X,Y,Z,$,_;S={BooleanLiteral:1,EOF:2,Identifier:3,Keyword:4,NullLiteral:5,NumericLiteral:6,Punctuator:7,StringLiteral:8},T={},T[S.BooleanLiteral]="Boolean",T[S.EOF]="<end>",T[S.Identifier]="Identifier",T[S.Keyword]="Keyword",T[S.NullLiteral]="Null",T[S.NumericLiteral]="Numeric",T[S.Punctuator]="Punctuator",T[S.StringLiteral]="String",U={ArrayExpression:"ArrayExpression",BinaryExpression:"BinaryExpression",CallExpression:"CallExpression",ConditionalExpression:"ConditionalExpression",EmptyStatement:"EmptyStatement",ExpressionStatement:"ExpressionStatement",Identifier:"Identifier",Literal:"Literal",LabeledStatement:"LabeledStatement",LogicalExpression:"LogicalExpression",MemberExpression:"MemberExpression",ObjectExpression:"ObjectExpression",Program:"Program",Property:"Property",ThisExpression:"ThisExpression",UnaryExpression:"UnaryExpression"},V={UnexpectedToken:"Unexpected token %0",UnknownLabel:"Undefined label '%0'",Redeclaration:"%0 '%1' has already been declared"};var ab=H,bb=L;a.esprima={parse:R}}(this),function(a){"use strict";function b(a,b,d,e){var f;try{if(f=c(a),f.scopeIdent&&(d.nodeType!==Node.ELEMENT_NODE||"TEMPLATE"!==d.tagName||"bind"!==b&&"repeat"!==b))throw Error("as and in can only be used within <template bind/repeat>")}catch(g){return void console.error("Invalid expression syntax: "+a,g)}return function(a,b,c){var d=f.getBinding(a,e,c);return f.scopeIdent&&d&&(b.polymerExpressionScopeIdent_=f.scopeIdent,f.indexIdent&&(b.polymerExpressionIndexIdent_=f.indexIdent)),d}}function c(a){var b=q[a];if(!b){var c=new j;esprima.parse(a,c),b=new l(c),q[a]=b}return b}function d(a){this.value=a,this.valueFn_=void 0}function e(a){this.name=a,this.path=Path.get(a)}function f(a,b,c){this.computed="["==c,this.dynamicDeps="function"==typeof a||a.dynamicDeps||this.computed&&!(b instanceof d),this.simplePath=!this.dynamicDeps&&(b instanceof e||b instanceof d)&&(a instanceof f||a instanceof e),this.object=this.simplePath?a:i(a),this.property=!this.computed||this.simplePath?b:i(b)}function g(a,b){this.name=a,this.args=[];for(var c=0;c<b.length;c++)this.args[c]=i(b[c])}function h(){throw Error("Not Implemented")}function i(a){return"function"==typeof a?a:a.valueFn()}function j(){this.expression=null,this.filters=[],this.deps={},this.currentPath=void 0,this.scopeIdent=void 0,this.indexIdent=void 0,this.dynamicDeps=!1}function k(a){this.value_=a}function l(a){if(this.scopeIdent=a.scopeIdent,this.indexIdent=a.indexIdent,!a.expression)throw Error("No expression found.");this.expression=a.expression,i(this.expression),this.filters=a.filters,this.dynamicDeps=a.dynamicDeps}function m(a){return String(a).replace(/[A-Z]/g,function(a){return"-"+a.toLowerCase()})}function n(a,b){for(;a[t]&&!Object.prototype.hasOwnProperty.call(a,b);)a=a[t];return a}function o(a){switch(a){case"":return!1;case"false":case"null":case"true":return!0}return isNaN(Number(a))?!1:!0}function p(){}var q=Object.create(null);d.prototype={valueFn:function(){if(!this.valueFn_){var a=this.value;this.valueFn_=function(){return a}}return this.valueFn_}},e.prototype={valueFn:function(){if(!this.valueFn_){var a=(this.name,this.path);this.valueFn_=function(b,c){return c&&c.addPath(b,a),a.getValueFrom(b)}}return this.valueFn_},setValue:function(a,b){return 1==this.path.length,a=n(a,this.path[0]),this.path.setValueFrom(a,b)}},f.prototype={get fullPath(){if(!this.fullPath_){var a=this.object instanceof f?this.object.fullPath.slice():[this.object.name];
a.push(this.property instanceof e?this.property.name:this.property.value),this.fullPath_=Path.get(a)}return this.fullPath_},valueFn:function(){if(!this.valueFn_){var a=this.object;if(this.simplePath){var b=this.fullPath;this.valueFn_=function(a,c){return c&&c.addPath(a,b),b.getValueFrom(a)}}else if(this.computed){var c=this.property;this.valueFn_=function(b,d,e){var f=a(b,d,e),g=c(b,d,e);return d&&d.addPath(f,[g]),f?f[g]:void 0}}else{var b=Path.get(this.property.name);this.valueFn_=function(c,d,e){var f=a(c,d,e);return d&&d.addPath(f,b),b.getValueFrom(f)}}}return this.valueFn_},setValue:function(a,b){if(this.simplePath)return this.fullPath.setValueFrom(a,b),b;var c=this.object(a),d=this.property instanceof e?this.property.name:this.property(a);return c[d]=b}},g.prototype={transform:function(a,b,c,d,e){var f=c[this.name],g=a;if(f)g=void 0;else if(f=g[this.name],!f)return void console.error("Cannot find function or filter: "+this.name);if(d?f=f.toModel:"function"==typeof f.toDOM&&(f=f.toDOM),"function"!=typeof f)return void console.error("Cannot find function or filter: "+this.name);for(var h=e||[],j=0;j<this.args.length;j++)h.push(i(this.args[j])(a,b,c));return f.apply(g,h)}};var r={"+":function(a){return+a},"-":function(a){return-a},"!":function(a){return!a}},s={"+":function(a,b){return a+b},"-":function(a,b){return a-b},"*":function(a,b){return a*b},"/":function(a,b){return a/b},"%":function(a,b){return a%b},"<":function(a,b){return b>a},">":function(a,b){return a>b},"<=":function(a,b){return b>=a},">=":function(a,b){return a>=b},"==":function(a,b){return a==b},"!=":function(a,b){return a!=b},"===":function(a,b){return a===b},"!==":function(a,b){return a!==b},"&&":function(a,b){return a&&b},"||":function(a,b){return a||b}};j.prototype={createUnaryExpression:function(a,b){if(!r[a])throw Error("Disallowed operator: "+a);return b=i(b),function(c,d,e){return r[a](b(c,d,e))}},createBinaryExpression:function(a,b,c){if(!s[a])throw Error("Disallowed operator: "+a);switch(b=i(b),c=i(c),a){case"||":return this.dynamicDeps=!0,function(a,d,e){return b(a,d,e)||c(a,d,e)};case"&&":return this.dynamicDeps=!0,function(a,d,e){return b(a,d,e)&&c(a,d,e)}}return function(d,e,f){return s[a](b(d,e,f),c(d,e,f))}},createConditionalExpression:function(a,b,c){return a=i(a),b=i(b),c=i(c),this.dynamicDeps=!0,function(d,e,f){return a(d,e,f)?b(d,e,f):c(d,e,f)}},createIdentifier:function(a){var b=new e(a);return b.type="Identifier",b},createMemberExpression:function(a,b,c){var d=new f(b,c,a);return d.dynamicDeps&&(this.dynamicDeps=!0),d},createCallExpression:function(a,b){if(!(a instanceof e))throw Error("Only identifier function invocations are allowed");var c=new g(a.name,b);return function(a,b,d){return c.transform(a,b,d,!1)}},createLiteral:function(a){return new d(a.value)},createArrayExpression:function(a){for(var b=0;b<a.length;b++)a[b]=i(a[b]);return function(b,c,d){for(var e=[],f=0;f<a.length;f++)e.push(a[f](b,c,d));return e}},createProperty:function(a,b,c){return{key:b instanceof e?b.name:b.value,value:c}},createObjectExpression:function(a){for(var b=0;b<a.length;b++)a[b].value=i(a[b].value);return function(b,c,d){for(var e={},f=0;f<a.length;f++)e[a[f].key]=a[f].value(b,c,d);return e}},createFilter:function(a,b){this.filters.push(new g(a,b))},createAsExpression:function(a,b){this.expression=a,this.scopeIdent=b},createInExpression:function(a,b,c){this.expression=c,this.scopeIdent=a,this.indexIdent=b},createTopLevel:function(a){this.expression=a},createThisExpression:h},k.prototype={open:function(){return this.value_},discardChanges:function(){return this.value_},deliver:function(){},close:function(){}},l.prototype={getBinding:function(a,b,c){function d(){if(h)return h=!1,g;i.dynamicDeps&&f.startReset();var c=i.getValue(a,i.dynamicDeps?f:void 0,b);return i.dynamicDeps&&f.finishReset(),c}function e(c){return i.setValue(a,c,b),c}if(c)return this.getValue(a,void 0,b);var f=new CompoundObserver,g=this.getValue(a,f,b),h=!0,i=this;return new ObserverTransform(f,d,e,!0)},getValue:function(a,b,c){for(var d=i(this.expression)(a,b,c),e=0;e<this.filters.length;e++)d=this.filters[e].transform(a,b,c,!1,[d]);return d},setValue:function(a,b,c){for(var d=this.filters?this.filters.length:0;d-->0;)b=this.filters[d].transform(a,void 0,c,!0,[b]);return this.expression.setValue?this.expression.setValue(a,b):void 0}};var t="@"+Math.random().toString(36).slice(2);p.prototype={styleObject:function(a){var b=[];for(var c in a)b.push(m(c)+": "+a[c]);return b.join("; ")},tokenList:function(a){var b=[];for(var c in a)a[c]&&b.push(c);return b.join(" ")},prepareInstancePositionChanged:function(a){var b=a.polymerExpressionIndexIdent_;if(b)return function(a,c){a.model[b]=c}},prepareBinding:function(a,c,d){var e=Path.get(a);{if(o(a)||!e.valid)return b(a,c,d,this);if(1==e.length)return function(a,b,c){if(c)return e.getValueFrom(a);var d=n(a,e[0]);return new PathObserver(d,e)}}},prepareInstanceModel:function(a){var b=a.polymerExpressionScopeIdent_;if(b){var c=a.templateInstance?a.templateInstance.model:a.model,d=a.polymerExpressionIndexIdent_;return function(a){return u(c,a,b,d)}}}};var u="__proto__"in{}?function(a,b,c,d){var e={};return e[c]=b,e[d]=void 0,e[t]=a,e.__proto__=a,e}:function(a,b,c,d){var e=Object.create(a);return Object.defineProperty(e,c,{value:b,configurable:!0,writable:!0}),Object.defineProperty(e,d,{value:void 0,configurable:!0,writable:!0}),Object.defineProperty(e,t,{value:a,configurable:!0,writable:!0}),e};a.PolymerExpressions=p,p.getExpression=c}(this),Polymer={version:"0.4.2"},"function"==typeof window.Polymer&&(Polymer={}),window.Platform||(logFlags=window.logFlags||{},Platform={flush:function(){}},CustomElements={useNative:!0,ready:!0,takeRecords:function(){},"instanceof":function(a,b){return a instanceof b}},HTMLImports={useNative:!0},addEventListener("HTMLImportsLoaded",function(){document.dispatchEvent(new CustomEvent("WebComponentsReady",{bubbles:!0}))}),ShadowDOMPolyfill=null,wrap=unwrap=function(a){return a}),function(a){function b(a,b){b=b||q,d(function(){f(a,b)},b)}function c(a){return"complete"===a.readyState||a.readyState===s}function d(a,b){if(c(b))a&&a();else{var e=function(){("complete"===b.readyState||b.readyState===s)&&(b.removeEventListener(t,e),d(a,b))};b.addEventListener(t,e)}}function e(a){a.target.__loaded=!0}function f(a,b){function c(){h==i&&a&&a()}function d(a){e(a),h++,c()}var f=b.querySelectorAll("link[rel=import]"),h=0,i=f.length;if(i)for(var j,k=0;i>k&&(j=f[k]);k++)g(j)?d.call(j,{target:j}):(j.addEventListener("load",d),j.addEventListener("error",d));else c()}function g(a){return m?a.__loaded||a.import&&"loading"!==a.import.readyState:a.__importParsed}function h(a){for(var b,c=0,d=a.length;d>c&&(b=a[c]);c++)i(b)&&j(b)}function i(a){return"link"===a.localName&&"import"===a.rel}function j(a){var b=a.import;b?e({target:a}):(a.addEventListener("load",e),a.addEventListener("error",e))}var k="import",l=k in document.createElement("link"),m=l,n=/Trident/.test(navigator.userAgent),o=Boolean(window.ShadowDOMPolyfill),p=function(a){return o?ShadowDOMPolyfill.wrapIfNeeded(a):a},q=p(document),r={get:function(){var a=HTMLImports.currentScript||document.currentScript||("complete"!==document.readyState?document.scripts[document.scripts.length-1]:null);return p(a)},configurable:!0};Object.defineProperty(document,"_currentScript",r),Object.defineProperty(q,"_currentScript",r);var s=n?"complete":"interactive",t="readystatechange";m&&(new MutationObserver(function(a){for(var b,c=0,d=a.length;d>c&&(b=a[c]);c++)b.addedNodes&&h(b.addedNodes)}).observe(document.head,{childList:!0}),function(){if("loading"===document.readyState)for(var a,b=document.querySelectorAll("link[rel=import]"),c=0,d=b.length;d>c&&(a=b[c]);c++)j(a)}()),b(function(){HTMLImports.ready=!0,HTMLImports.readyTime=(new Date).getTime(),q.dispatchEvent(new CustomEvent("HTMLImportsLoaded",{bubbles:!0}))}),a.useNative=m,a.isImportLoaded=g,a.whenReady=b,a.rootDocument=q,a.IMPORT_LINK_TYPE=k,a.isIE=n}(window.HTMLImports),function(a){function b(a,b){return b=b||[],b.map||(b=[b]),a.apply(this,b.map(d))}function c(a,c,d){var e;switch(arguments.length){case 0:return;case 1:e=null;break;case 2:e=c.apply(this);break;default:e=b(d,c)}f[a]=e}function d(a){return f[a]}function e(a,c){HTMLImports.whenImportsReady(function(){b(c,a)})}var f={};a.marshal=d,a.modularize=c,a.using=e}(window),function(){var a=document.createElement("style");a.textContent="body {transition: opacity ease-in 0.2s; } \nbody[unresolved] {opacity: 0; display: block; overflow: hidden; } \n";var b=document.querySelector("head");b.insertBefore(a,b.firstChild)}(Platform),function(a){"use strict";function b(){function a(a){b=a}if("function"!=typeof Object.observe||"function"!=typeof Array.observe)return!1;var b=[],c={},d=[];return Object.observe(c,a),Array.observe(d,a),c.id=1,c.id=2,delete c.id,d.push(1,2),d.length=0,Object.deliverChangeRecords(a),5!==b.length?!1:"add"!=b[0].type||"update"!=b[1].type||"delete"!=b[2].type||"splice"!=b[3].type||"splice"!=b[4].type?!1:(Object.unobserve(c,a),Array.unobserve(d,a),!0)}function c(){if("undefined"!=typeof chrome&&chrome.app&&chrome.app.runtime)return!1;if("undefined"!=typeof navigator&&navigator.getDeviceStorage)return!1;try{var a=new Function("","return true;");return a()}catch(b){return!1}}function d(a){return+a===a>>>0&&""!==a}function e(a){return+a}function f(a){return a===Object(a)}function g(a,b){return a===b?0!==a||1/a===1/b:R(a)&&R(b)?!0:a!==a&&b!==b}function h(a){if(void 0===a)return"eof";var b=a.charCodeAt(0);switch(b){case 91:case 93:case 46:case 34:case 39:case 48:return a;case 95:case 36:return"ident";case 32:case 9:case 10:case 13:case 160:case 65279:case 8232:case 8233:return"ws"}return b>=97&&122>=b||b>=65&&90>=b?"ident":b>=49&&57>=b?"number":"else"}function i(){}function j(a){function b(){if(!(m>=a.length)){var b=a[m+1];return"inSingleQuote"==n&&"'"==b||"inDoubleQuote"==n&&'"'==b?(m++,d=b,o.append(),!0):void 0}}for(var c,d,e,f,g,j,k,l=[],m=-1,n="beforePath",o={push:function(){void 0!==e&&(l.push(e),e=void 0)},append:function(){void 0===e?e=d:e+=d}};n;)if(m++,c=a[m],"\\"!=c||!b(n)){if(f=h(c),k=W[n],g=k[f]||k["else"]||"error","error"==g)return;if(n=g[0],j=o[g[1]]||i,d=void 0===g[2]?c:g[2],j(),"afterPath"===n)return l}}function k(a){return V.test(a)}function l(a,b){if(b!==X)throw Error("Use Path.get to retrieve path objects");for(var c=0;c<a.length;c++)this.push(String(a[c]));Q&&this.length&&(this.getValueFrom=this.compiledGetValueFromFn())}function m(a){if(a instanceof l)return a;if((null==a||0==a.length)&&(a=""),"string"!=typeof a){if(d(a.length))return new l(a,X);a=String(a)}var b=Y[a];if(b)return b;var c=j(a);if(!c)return Z;var b=new l(c,X);return Y[a]=b,b}function n(a){return d(a)?"["+a+"]":'["'+a.replace(/"/g,'\\"')+'"]'}function o(b){for(var c=0;_>c&&b.check_();)c++;return O&&(a.dirtyCheckCycleCount=c),c>0}function p(a){for(var b in a)return!1;return!0}function q(a){return p(a.added)&&p(a.removed)&&p(a.changed)}function r(a,b){var c={},d={},e={};for(var f in b){var g=a[f];(void 0===g||g!==b[f])&&(f in a?g!==b[f]&&(e[f]=g):d[f]=void 0)}for(var f in a)f in b||(c[f]=a[f]);return Array.isArray(a)&&a.length!==b.length&&(e.length=a.length),{added:c,removed:d,changed:e}}function s(){if(!ab.length)return!1;for(var a=0;a<ab.length;a++)ab[a]();return ab.length=0,!0}function t(){function a(a){b&&b.state_===fb&&!d&&b.check_(a)}var b,c,d=!1,e=!0;return{open:function(c){if(b)throw Error("ObservedObject in use");e||Object.deliverChangeRecords(a),b=c,e=!1},observe:function(b,d){c=b,d?Array.observe(c,a):Object.observe(c,a)},deliver:function(b){d=b,Object.deliverChangeRecords(a),d=!1},close:function(){b=void 0,Object.unobserve(c,a),cb.push(this)}}}function u(a,b,c){var d=cb.pop()||t();return d.open(a),d.observe(b,c),d}function v(){function a(b,f){b&&(b===d&&(e[f]=!0),h.indexOf(b)<0&&(h.push(b),Object.observe(b,c)),a(Object.getPrototypeOf(b),f))}function b(a){for(var b=0;b<a.length;b++){var c=a[b];if(c.object!==d||e[c.name]||"setPrototype"===c.type)return!1}return!0}function c(c){if(!b(c)){for(var d,e=0;e<g.length;e++)d=g[e],d.state_==fb&&d.iterateObjects_(a);for(var e=0;e<g.length;e++)d=g[e],d.state_==fb&&d.check_()}}var d,e,f=0,g=[],h=[],i={object:void 0,objects:h,open:function(b,c){d||(d=c,e={}),g.push(b),f++,b.iterateObjects_(a)},close:function(){if(f--,!(f>0)){for(var a=0;a<h.length;a++)Object.unobserve(h[a],c),x.unobservedCount++;g.length=0,h.length=0,d=void 0,e=void 0,db.push(this)}}};return i}function w(a,b){return $&&$.object===b||($=db.pop()||v(),$.object=b),$.open(a,b),$}function x(){this.state_=eb,this.callback_=void 0,this.target_=void 0,this.directObserver_=void 0,this.value_=void 0,this.id_=ib++}function y(a){x._allObserversCount++,kb&&jb.push(a)}function z(){x._allObserversCount--}function A(a){x.call(this),this.value_=a,this.oldObject_=void 0}function B(a){if(!Array.isArray(a))throw Error("Provided object is not an Array");A.call(this,a)}function C(a,b){x.call(this),this.object_=a,this.path_=m(b),this.directObserver_=void 0}function D(a){x.call(this),this.reportChangesOnOpen_=a,this.value_=[],this.directObserver_=void 0,this.observed_=[]}function E(a){return a}function F(a,b,c,d){this.callback_=void 0,this.target_=void 0,this.value_=void 0,this.observable_=a,this.getValueFn_=b||E,this.setValueFn_=c||E,this.dontPassThroughSet_=d}function G(a,b,c){for(var d={},e={},f=0;f<b.length;f++){var g=b[f];nb[g.type]?(g.name in c||(c[g.name]=g.oldValue),"update"!=g.type&&("add"!=g.type?g.name in d?(delete d[g.name],delete c[g.name]):e[g.name]=!0:g.name in e?delete e[g.name]:d[g.name]=!0)):(console.error("Unknown changeRecord type: "+g.type),console.error(g))}for(var h in d)d[h]=a[h];for(var h in e)e[h]=void 0;var i={};for(var h in c)if(!(h in d||h in e)){var j=a[h];c[h]!==j&&(i[h]=j)}return{added:d,removed:e,changed:i}}function H(a,b,c){return{index:a,removed:b,addedCount:c}}function I(){}function J(a,b,c,d,e,f){return sb.calcSplices(a,b,c,d,e,f)}function K(a,b,c,d){return c>b||a>d?-1:b==c||d==a?0:c>a?d>b?b-c:d-c:b>d?d-a:b-a}function L(a,b,c,d){for(var e=H(b,c,d),f=!1,g=0,h=0;h<a.length;h++){var i=a[h];if(i.index+=g,!f){var j=K(e.index,e.index+e.removed.length,i.index,i.index+i.addedCount);if(j>=0){a.splice(h,1),h--,g-=i.addedCount-i.removed.length,e.addedCount+=i.addedCount-j;var k=e.removed.length+i.removed.length-j;if(e.addedCount||k){var c=i.removed;if(e.index<i.index){var l=e.removed.slice(0,i.index-e.index);Array.prototype.push.apply(l,c),c=l}if(e.index+e.removed.length>i.index+i.addedCount){var m=e.removed.slice(i.index+i.addedCount-e.index);Array.prototype.push.apply(c,m)}e.removed=c,i.index<e.index&&(e.index=i.index)}else f=!0}else if(e.index<i.index){f=!0,a.splice(h,0,e),h++;var n=e.addedCount-e.removed.length;i.index+=n,g+=n}}}f||a.push(e)}function M(a,b){for(var c=[],f=0;f<b.length;f++){var g=b[f];switch(g.type){case"splice":L(c,g.index,g.removed.slice(),g.addedCount);break;case"add":case"update":case"delete":if(!d(g.name))continue;var h=e(g.name);if(0>h)continue;L(c,h,[g.oldValue],1);break;default:console.error("Unexpected record type: "+JSON.stringify(g))}}return c}function N(a,b){var c=[];return M(a,b).forEach(function(b){return 1==b.addedCount&&1==b.removed.length?void(b.removed[0]!==a[b.index]&&c.push(b)):void(c=c.concat(J(a,b.index,b.index+b.addedCount,b.removed,0,b.removed.length)))}),c}var O=a.testingExposeCycleCount,P=b(),Q=c(),R=a.Number.isNaN||function(b){return"number"==typeof b&&a.isNaN(b)},S="__proto__"in{}?function(a){return a}:function(a){var b=a.__proto__;if(!b)return a;var c=Object.create(b);return Object.getOwnPropertyNames(a).forEach(function(b){Object.defineProperty(c,b,Object.getOwnPropertyDescriptor(a,b))}),c},T="[$_a-zA-Z]",U="[$_a-zA-Z0-9]",V=new RegExp("^"+T+"+"+U+"*$"),W={beforePath:{ws:["beforePath"],ident:["inIdent","append"],"[":["beforeElement"],eof:["afterPath"]},inPath:{ws:["inPath"],".":["beforeIdent"],"[":["beforeElement"],eof:["afterPath"]},beforeIdent:{ws:["beforeIdent"],ident:["inIdent","append"]},inIdent:{ident:["inIdent","append"],0:["inIdent","append"],number:["inIdent","append"],ws:["inPath","push"],".":["beforeIdent","push"],"[":["beforeElement","push"],eof:["afterPath","push"]},beforeElement:{ws:["beforeElement"],0:["afterZero","append"],number:["inIndex","append"],"'":["inSingleQuote","append",""],'"':["inDoubleQuote","append",""]},afterZero:{ws:["afterElement","push"],"]":["inPath","push"]},inIndex:{0:["inIndex","append"],number:["inIndex","append"],ws:["afterElement"],"]":["inPath","push"]},inSingleQuote:{"'":["afterElement"],eof:["error"],"else":["inSingleQuote","append"]},inDoubleQuote:{'"':["afterElement"],eof:["error"],"else":["inDoubleQuote","append"]},afterElement:{ws:["afterElement"],"]":["inPath","push"]}},X={},Y={};l.get=m,l.prototype=S({__proto__:[],valid:!0,toString:function(){for(var a="",b=0;b<this.length;b++){var c=this[b];a+=k(c)?b?"."+c:c:n(c)}return a},getValueFrom:function(a){for(var b=0;b<this.length;b++){if(null==a)return;a=a[this[b]]}return a},iterateObjects:function(a,b){for(var c=0;c<this.length;c++){if(c&&(a=a[this[c-1]]),!f(a))return;b(a,this[0])}},compiledGetValueFromFn:function(){var a="",b="obj";a+="if (obj != null";for(var c,d=0;d<this.length-1;d++)c=this[d],b+=k(c)?"."+c:n(c),a+=" &&\n     "+b+" != null";a+=")\n";var c=this[d];return b+=k(c)?"."+c:n(c),a+="  return "+b+";\nelse\n  return undefined;",new Function("obj",a)},setValueFrom:function(a,b){if(!this.length)return!1;for(var c=0;c<this.length-1;c++){if(!f(a))return!1;a=a[this[c]]}return f(a)?(a[this[c]]=b,!0):!1}});var Z=new l("",X);Z.valid=!1,Z.getValueFrom=Z.setValueFrom=function(){};var $,_=1e3,ab=[],bb=P?function(){var a={pingPong:!0},b=!1;return Object.observe(a,function(){s(),b=!1}),function(c){ab.push(c),b||(b=!0,a.pingPong=!a.pingPong)}}():function(){return function(a){ab.push(a)}}(),cb=[],db=[],eb=0,fb=1,gb=2,hb=3,ib=1;x.prototype={open:function(a,b){if(this.state_!=eb)throw Error("Observer has already been opened.");return y(this),this.callback_=a,this.target_=b,this.connect_(),this.state_=fb,this.value_},close:function(){this.state_==fb&&(z(this),this.disconnect_(),this.value_=void 0,this.callback_=void 0,this.target_=void 0,this.state_=gb)},deliver:function(){this.state_==fb&&o(this)},report_:function(a){try{this.callback_.apply(this.target_,a)}catch(b){x._errorThrownDuringCallback=!0,console.error("Exception caught during observer callback: "+(b.stack||b))}},discardChanges:function(){return this.check_(void 0,!0),this.value_}};var jb,kb=!P;x._allObserversCount=0,kb&&(jb=[]);var lb=!1;a.Platform=a.Platform||{},a.Platform.performMicrotaskCheckpoint=function(){if(!lb&&kb){lb=!0;var b,c,d=0;do{d++,c=jb,jb=[],b=!1;for(var e=0;e<c.length;e++){var f=c[e];f.state_==fb&&(f.check_()&&(b=!0),jb.push(f))}s()&&(b=!0)}while(_>d&&b);O&&(a.dirtyCheckCycleCount=d),lb=!1}},kb&&(a.Platform.clearObservers=function(){jb=[]}),A.prototype=S({__proto__:x.prototype,arrayObserve:!1,connect_:function(){P?this.directObserver_=u(this,this.value_,this.arrayObserve):this.oldObject_=this.copyObject(this.value_)},copyObject:function(a){var b=Array.isArray(a)?[]:{};for(var c in a)b[c]=a[c];return Array.isArray(a)&&(b.length=a.length),b},check_:function(a){var b,c;if(P){if(!a)return!1;c={},b=G(this.value_,a,c)}else c=this.oldObject_,b=r(this.value_,this.oldObject_);return q(b)?!1:(P||(this.oldObject_=this.copyObject(this.value_)),this.report_([b.added||{},b.removed||{},b.changed||{},function(a){return c[a]}]),!0)},disconnect_:function(){P?(this.directObserver_.close(),this.directObserver_=void 0):this.oldObject_=void 0},deliver:function(){this.state_==fb&&(P?this.directObserver_.deliver(!1):o(this))},discardChanges:function(){return this.directObserver_?this.directObserver_.deliver(!0):this.oldObject_=this.copyObject(this.value_),this.value_}}),B.prototype=S({__proto__:A.prototype,arrayObserve:!0,copyObject:function(a){return a.slice()},check_:function(a){var b;if(P){if(!a)return!1;b=N(this.value_,a)}else b=J(this.value_,0,this.value_.length,this.oldObject_,0,this.oldObject_.length);return b&&b.length?(P||(this.oldObject_=this.copyObject(this.value_)),this.report_([b]),!0):!1}}),B.applySplices=function(a,b,c){c.forEach(function(c){for(var d=[c.index,c.removed.length],e=c.index;e<c.index+c.addedCount;)d.push(b[e]),e++;Array.prototype.splice.apply(a,d)})},C.prototype=S({__proto__:x.prototype,get path(){return this.path_},connect_:function(){P&&(this.directObserver_=w(this,this.object_)),this.check_(void 0,!0)},disconnect_:function(){this.value_=void 0,this.directObserver_&&(this.directObserver_.close(this),this.directObserver_=void 0)},iterateObjects_:function(a){this.path_.iterateObjects(this.object_,a)},check_:function(a,b){var c=this.value_;return this.value_=this.path_.getValueFrom(this.object_),b||g(this.value_,c)?!1:(this.report_([this.value_,c,this]),!0)},setValue:function(a){this.path_&&this.path_.setValueFrom(this.object_,a)}});var mb={};D.prototype=S({__proto__:x.prototype,connect_:function(){if(P){for(var a,b=!1,c=0;c<this.observed_.length;c+=2)if(a=this.observed_[c],a!==mb){b=!0;break}b&&(this.directObserver_=w(this,a))}this.check_(void 0,!this.reportChangesOnOpen_)},disconnect_:function(){for(var a=0;a<this.observed_.length;a+=2)this.observed_[a]===mb&&this.observed_[a+1].close();this.observed_.length=0,this.value_.length=0,this.directObserver_&&(this.directObserver_.close(this),this.directObserver_=void 0)},addPath:function(a,b){if(this.state_!=eb&&this.state_!=hb)throw Error("Cannot add paths once started.");var b=m(b);if(this.observed_.push(a,b),this.reportChangesOnOpen_){var c=this.observed_.length/2-1;this.value_[c]=b.getValueFrom(a)}},addObserver:function(a){if(this.state_!=eb&&this.state_!=hb)throw Error("Cannot add observers once started.");if(this.observed_.push(mb,a),this.reportChangesOnOpen_){var b=this.observed_.length/2-1;this.value_[b]=a.open(this.deliver,this)}},startReset:function(){if(this.state_!=fb)throw Error("Can only reset while open");this.state_=hb,this.disconnect_()},finishReset:function(){if(this.state_!=hb)throw Error("Can only finishReset after startReset");return this.state_=fb,this.connect_(),this.value_},iterateObjects_:function(a){for(var b,c=0;c<this.observed_.length;c+=2)b=this.observed_[c],b!==mb&&this.observed_[c+1].iterateObjects(b,a)},check_:function(a,b){for(var c,d=0;d<this.observed_.length;d+=2){var e,f=this.observed_[d],h=this.observed_[d+1];if(f===mb){var i=h;e=this.state_===eb?i.open(this.deliver,this):i.discardChanges()}else e=h.getValueFrom(f);b?this.value_[d/2]=e:g(e,this.value_[d/2])||(c=c||[],c[d/2]=this.value_[d/2],this.value_[d/2]=e)}return c?(this.report_([this.value_,c,this.observed_]),!0):!1}}),F.prototype={open:function(a,b){return this.callback_=a,this.target_=b,this.value_=this.getValueFn_(this.observable_.open(this.observedCallback_,this)),this.value_},observedCallback_:function(a){if(a=this.getValueFn_(a),!g(a,this.value_)){var b=this.value_;this.value_=a,this.callback_.call(this.target_,this.value_,b)}},discardChanges:function(){return this.value_=this.getValueFn_(this.observable_.discardChanges()),this.value_},deliver:function(){return this.observable_.deliver()},setValue:function(a){return a=this.setValueFn_(a),!this.dontPassThroughSet_&&this.observable_.setValue?this.observable_.setValue(a):void 0},close:function(){this.observable_&&this.observable_.close(),this.callback_=void 0,this.target_=void 0,this.observable_=void 0,this.value_=void 0,this.getValueFn_=void 0,this.setValueFn_=void 0}};var nb={add:!0,update:!0,"delete":!0},ob=0,pb=1,qb=2,rb=3;I.prototype={calcEditDistances:function(a,b,c,d,e,f){for(var g=f-e+1,h=c-b+1,i=new Array(g),j=0;g>j;j++)i[j]=new Array(h),i[j][0]=j;for(var k=0;h>k;k++)i[0][k]=k;for(var j=1;g>j;j++)for(var k=1;h>k;k++)if(this.equals(a[b+k-1],d[e+j-1]))i[j][k]=i[j-1][k-1];else{var l=i[j-1][k]+1,m=i[j][k-1]+1;i[j][k]=m>l?l:m}return i},spliceOperationsFromEditDistances:function(a){for(var b=a.length-1,c=a[0].length-1,d=a[b][c],e=[];b>0||c>0;)if(0!=b)if(0!=c){var f,g=a[b-1][c-1],h=a[b-1][c],i=a[b][c-1];f=i>h?g>h?h:g:g>i?i:g,f==g?(g==d?e.push(ob):(e.push(pb),d=g),b--,c--):f==h?(e.push(rb),b--,d=h):(e.push(qb),c--,d=i)}else e.push(rb),b--;else e.push(qb),c--;return e.reverse(),e},calcSplices:function(a,b,c,d,e,f){var g=0,h=0,i=Math.min(c-b,f-e);if(0==b&&0==e&&(g=this.sharedPrefix(a,d,i)),c==a.length&&f==d.length&&(h=this.sharedSuffix(a,d,i-g)),b+=g,e+=g,c-=h,f-=h,c-b==0&&f-e==0)return[];if(b==c){for(var j=H(b,[],0);f>e;)j.removed.push(d[e++]);return[j]}if(e==f)return[H(b,[],c-b)];for(var k=this.spliceOperationsFromEditDistances(this.calcEditDistances(a,b,c,d,e,f)),j=void 0,l=[],m=b,n=e,o=0;o<k.length;o++)switch(k[o]){case ob:j&&(l.push(j),j=void 0),m++,n++;break;case pb:j||(j=H(m,[],0)),j.addedCount++,m++,j.removed.push(d[n]),n++;break;case qb:j||(j=H(m,[],0)),j.addedCount++,m++;break;case rb:j||(j=H(m,[],0)),j.removed.push(d[n]),n++}return j&&l.push(j),l},sharedPrefix:function(a,b,c){for(var d=0;c>d;d++)if(!this.equals(a[d],b[d]))return d;return c},sharedSuffix:function(a,b,c){for(var d=a.length,e=b.length,f=0;c>f&&this.equals(a[--d],b[--e]);)f++;return f},calculateSplices:function(a,b){return this.calcSplices(a,0,a.length,b,0,b.length)},equals:function(a,b){return a===b}};var sb=new I;a.Observer=x,a.Observer.runEOM_=bb,a.Observer.observerSentinel_=mb,a.Observer.hasObjectObserve=P,a.ArrayObserver=B,a.ArrayObserver.calculateSplices=function(a,b){return sb.calculateSplices(a,b)},a.ArraySplice=I,a.ObjectObserver=A,a.PathObserver=C,a.CompoundObserver=D,a.Path=l,a.ObserverTransform=F}("undefined"!=typeof global&&global&&"undefined"!=typeof module&&module?global:this||window),function(){"use strict";function a(a){for(;a.parentNode;)a=a.parentNode;return"function"==typeof a.getElementById?a:null}function b(a,b,c){var d=a.bindings_;return d||(d=a.bindings_={}),d[b]&&c[b].close(),d[b]=c}function c(a,b,c){return c}function d(a){return null==a?"":a}function e(a,b){a.data=d(b)}function f(a){return function(b){return e(a,b)}}function g(a,b,c,e){return c?void(e?a.setAttribute(b,""):a.removeAttribute(b)):void a.setAttribute(b,d(e))}function h(a,b,c){return function(d){g(a,b,c,d)}}function i(a){switch(a.type){case"checkbox":return u;case"radio":case"select-multiple":case"select-one":return"change";case"range":if(/Trident|MSIE/.test(navigator.userAgent))return"change";default:return"input"}}function j(a,b,c,e){a[b]=(e||d)(c)}function k(a,b,c){return function(d){return j(a,b,d,c)}}function l(){}function m(a,b,c,d){function e(){c.setValue(a[b]),c.discardChanges(),(d||l)(a),Platform.performMicrotaskCheckpoint()}var f=i(a);return a.addEventListener(f,e),{close:function(){a.removeEventListener(f,e),c.close()},observable_:c}}function n(a){return Boolean(a)}function o(b){if(b.form)return s(b.form.elements,function(a){return a!=b&&"INPUT"==a.tagName&&"radio"==a.type&&a.name==b.name});var c=a(b);if(!c)return[];var d=c.querySelectorAll('input[type="radio"][name="'+b.name+'"]');return s(d,function(a){return a!=b&&!a.form})}function p(a){"INPUT"===a.tagName&&"radio"===a.type&&o(a).forEach(function(a){var b=a.bindings_.checked;b&&b.observable_.setValue(!1)})}function q(a,b){var c,e,f,g=a.parentNode;g instanceof HTMLSelectElement&&g.bindings_&&g.bindings_.value&&(c=g,e=c.bindings_.value,f=c.value),a.value=d(b),c&&c.value!=f&&(e.observable_.setValue(c.value),e.observable_.discardChanges(),Platform.performMicrotaskCheckpoint())}function r(a){return function(b){q(a,b)}}var s=Array.prototype.filter.call.bind(Array.prototype.filter);Node.prototype.bind=function(a,b){console.error("Unhandled binding to Node: ",this,a,b)},Node.prototype.bindFinished=function(){};var t=c;Object.defineProperty(Platform,"enableBindingsReflection",{get:function(){return t===b},set:function(a){return t=a?b:c,a},configurable:!0}),Text.prototype.bind=function(a,b,c){if("textContent"!==a)return Node.prototype.bind.call(this,a,b,c);if(c)return e(this,b);var d=b;return e(this,d.open(f(this))),t(this,a,d)},Element.prototype.bind=function(a,b,c){var d="?"==a[a.length-1];if(d&&(this.removeAttribute(a),a=a.slice(0,-1)),c)return g(this,a,d,b);var e=b;return g(this,a,d,e.open(h(this,a,d))),t(this,a,e)};var u;!function(){var a=document.createElement("div"),b=a.appendChild(document.createElement("input"));b.setAttribute("type","checkbox");var c,d=0;b.addEventListener("click",function(){d++,c=c||"click"}),b.addEventListener("change",function(){d++,c=c||"change"});var e=document.createEvent("MouseEvent");e.initMouseEvent("click",!0,!0,window,0,0,0,0,0,!1,!1,!1,!1,0,null),b.dispatchEvent(e),u=1==d?"change":c}(),HTMLInputElement.prototype.bind=function(a,c,e){if("value"!==a&&"checked"!==a)return HTMLElement.prototype.bind.call(this,a,c,e);this.removeAttribute(a);var f="checked"==a?n:d,g="checked"==a?p:l;if(e)return j(this,a,c,f);var h=c,i=m(this,a,h,g);return j(this,a,h.open(k(this,a,f)),f),b(this,a,i)},HTMLTextAreaElement.prototype.bind=function(a,b,c){if("value"!==a)return HTMLElement.prototype.bind.call(this,a,b,c);if(this.removeAttribute("value"),c)return j(this,"value",b);var e=b,f=m(this,"value",e);return j(this,"value",e.open(k(this,"value",d))),t(this,a,f)},HTMLOptionElement.prototype.bind=function(a,b,c){if("value"!==a)return HTMLElement.prototype.bind.call(this,a,b,c);if(this.removeAttribute("value"),c)return q(this,b);var d=b,e=m(this,"value",d);return q(this,d.open(r(this))),t(this,a,e)},HTMLSelectElement.prototype.bind=function(a,c,d){if("selectedindex"===a&&(a="selectedIndex"),"selectedIndex"!==a&&"value"!==a)return HTMLElement.prototype.bind.call(this,a,c,d);if(this.removeAttribute(a),d)return j(this,a,c);var e=c,f=m(this,a,e);return j(this,a,e.open(k(this,a))),b(this,a,f)}}(this),function(a){"use strict";function b(a){if(!a)throw new Error("Assertion failed")}function c(a){for(var b;b=a.parentNode;)a=b;return a}function d(a,b){if(b){for(var d,e="#"+b;!d&&(a=c(a),a.protoContent_?d=a.protoContent_.querySelector(e):a.getElementById&&(d=a.getElementById(b)),!d&&a.templateCreator_);)a=a.templateCreator_;return d}}function e(a){return"template"==a.tagName&&"http://www.w3.org/2000/svg"==a.namespaceURI}function f(a){return"TEMPLATE"==a.tagName&&"http://www.w3.org/1999/xhtml"==a.namespaceURI}function g(a){return Boolean(L[a.tagName]&&a.hasAttribute("template"))}function h(a){return void 0===a.isTemplate_&&(a.isTemplate_="TEMPLATE"==a.tagName||g(a)),a.isTemplate_}function i(a,b){var c=a.querySelectorAll(N);h(a)&&b(a),G(c,b)}function j(a){function b(a){HTMLTemplateElement.decorate(a)||j(a.content)}i(a,b)}function k(a,b){Object.getOwnPropertyNames(b).forEach(function(c){Object.defineProperty(a,c,Object.getOwnPropertyDescriptor(b,c))})}function l(a){var b=a.ownerDocument;if(!b.defaultView)return b;var c=b.templateContentsOwner_;if(!c){for(c=b.implementation.createHTMLDocument("");c.lastChild;)c.removeChild(c.lastChild);b.templateContentsOwner_=c}return c}function m(a){if(!a.stagingDocument_){var b=a.ownerDocument;if(!b.stagingDocument_){b.stagingDocument_=b.implementation.createHTMLDocument(""),b.stagingDocument_.isStagingDocument=!0;var c=b.stagingDocument_.createElement("base");c.href=document.baseURI,b.stagingDocument_.head.appendChild(c),b.stagingDocument_.stagingDocument_=b.stagingDocument_}a.stagingDocument_=b.stagingDocument_}return a.stagingDocument_}function n(a){var b=a.ownerDocument.createElement("template");a.parentNode.insertBefore(b,a);for(var c=a.attributes,d=c.length;d-->0;){var e=c[d];K[e.name]&&("template"!==e.name&&b.setAttribute(e.name,e.value),a.removeAttribute(e.name))}return b}function o(a){var b=a.ownerDocument.createElement("template");a.parentNode.insertBefore(b,a);for(var c=a.attributes,d=c.length;d-->0;){var e=c[d];b.setAttribute(e.name,e.value),a.removeAttribute(e.name)}return a.parentNode.removeChild(a),b}function p(a,b,c){var d=a.content;if(c)return void d.appendChild(b);for(var e;e=b.firstChild;)d.appendChild(e)}function q(a){P?a.__proto__=HTMLTemplateElement.prototype:k(a,HTMLTemplateElement.prototype)}function r(a){a.setModelFn_||(a.setModelFn_=function(){a.setModelFnScheduled_=!1;
var b=z(a,a.delegate_&&a.delegate_.prepareBinding);w(a,b,a.model_)}),a.setModelFnScheduled_||(a.setModelFnScheduled_=!0,Observer.runEOM_(a.setModelFn_))}function s(a,b,c,d){if(a&&a.length){for(var e,f=a.length,g=0,h=0,i=0,j=!0;f>h;){var g=a.indexOf("{{",h),k=a.indexOf("[[",h),l=!1,m="}}";if(k>=0&&(0>g||g>k)&&(g=k,l=!0,m="]]"),i=0>g?-1:a.indexOf(m,g+2),0>i){if(!e)return;e.push(a.slice(h));break}e=e||[],e.push(a.slice(h,g));var n=a.slice(g+2,i).trim();e.push(l),j=j&&l;var o=d&&d(n,b,c);e.push(null==o?Path.get(n):null),e.push(o),h=i+2}return h===f&&e.push(""),e.hasOnePath=5===e.length,e.isSimplePath=e.hasOnePath&&""==e[0]&&""==e[4],e.onlyOneTime=j,e.combinator=function(a){for(var b=e[0],c=1;c<e.length;c+=4){var d=e.hasOnePath?a:a[(c-1)/4];void 0!==d&&(b+=d),b+=e[c+3]}return b},e}}function t(a,b,c,d){if(b.hasOnePath){var e=b[3],f=e?e(d,c,!0):b[2].getValueFrom(d);return b.isSimplePath?f:b.combinator(f)}for(var g=[],h=1;h<b.length;h+=4){var e=b[h+2];g[(h-1)/4]=e?e(d,c):b[h+1].getValueFrom(d)}return b.combinator(g)}function u(a,b,c,d){var e=b[3],f=e?e(d,c,!1):new PathObserver(d,b[2]);return b.isSimplePath?f:new ObserverTransform(f,b.combinator)}function v(a,b,c,d){if(b.onlyOneTime)return t(a,b,c,d);if(b.hasOnePath)return u(a,b,c,d);for(var e=new CompoundObserver,f=1;f<b.length;f+=4){var g=b[f],h=b[f+2];if(h){var i=h(d,c,g);g?e.addPath(i):e.addObserver(i)}else{var j=b[f+1];g?e.addPath(j.getValueFrom(d)):e.addPath(d,j)}}return new ObserverTransform(e,b.combinator)}function w(a,b,c,d){for(var e=0;e<b.length;e+=2){var f=b[e],g=b[e+1],h=v(f,g,a,c),i=a.bind(f,h,g.onlyOneTime);i&&d&&d.push(i)}if(a.bindFinished(),b.isTemplate){a.model_=c;var j=a.processBindingDirectives_(b);d&&j&&d.push(j)}}function x(a,b,c){var d=a.getAttribute(b);return s(""==d?"{{}}":d,b,a,c)}function y(a,c){b(a);for(var d=[],e=0;e<a.attributes.length;e++){for(var f=a.attributes[e],g=f.name,i=f.value;"_"===g[0];)g=g.substring(1);if(!h(a)||g!==J&&g!==H&&g!==I){var j=s(i,g,a,c);j&&d.push(g,j)}}return h(a)&&(d.isTemplate=!0,d.if=x(a,J,c),d.bind=x(a,H,c),d.repeat=x(a,I,c),!d.if||d.bind||d.repeat||(d.bind=s("{{}}",H,a,c))),d}function z(a,b){if(a.nodeType===Node.ELEMENT_NODE)return y(a,b);if(a.nodeType===Node.TEXT_NODE){var c=s(a.data,"textContent",a,b);if(c)return["textContent",c]}return[]}function A(a,b,c,d,e,f,g){for(var h=b.appendChild(c.importNode(a,!1)),i=0,j=a.firstChild;j;j=j.nextSibling)A(j,h,c,d.children[i++],e,f,g);return d.isTemplate&&(HTMLTemplateElement.decorate(h,a),f&&h.setDelegate_(f)),w(h,d,e,g),h}function B(a,b){var c=z(a,b);c.children={};for(var d=0,e=a.firstChild;e;e=e.nextSibling)c.children[d++]=B(e,b);return c}function C(a){var b=a.id_;return b||(b=a.id_=S++),b}function D(a,b){var c=C(a);if(b){var d=b.bindingMaps[c];return d||(d=b.bindingMaps[c]=B(a,b.prepareBinding)||[]),d}var d=a.bindingMap_;return d||(d=a.bindingMap_=B(a,void 0)||[]),d}function E(a){this.closed=!1,this.templateElement_=a,this.instances=[],this.deps=void 0,this.iteratedValue=[],this.presentValue=void 0,this.arrayObserver=void 0}var F,G=Array.prototype.forEach.call.bind(Array.prototype.forEach);a.Map&&"function"==typeof a.Map.prototype.forEach?F=a.Map:(F=function(){this.keys=[],this.values=[]},F.prototype={set:function(a,b){var c=this.keys.indexOf(a);0>c?(this.keys.push(a),this.values.push(b)):this.values[c]=b},get:function(a){var b=this.keys.indexOf(a);if(!(0>b))return this.values[b]},"delete":function(a){var b=this.keys.indexOf(a);return 0>b?!1:(this.keys.splice(b,1),this.values.splice(b,1),!0)},forEach:function(a,b){for(var c=0;c<this.keys.length;c++)a.call(b||this,this.values[c],this.keys[c],this)}});"function"!=typeof document.contains&&(Document.prototype.contains=function(a){return a===this||a.parentNode===this?!0:this.documentElement.contains(a)});var H="bind",I="repeat",J="if",K={template:!0,repeat:!0,bind:!0,ref:!0},L={THEAD:!0,TBODY:!0,TFOOT:!0,TH:!0,TR:!0,TD:!0,COLGROUP:!0,COL:!0,CAPTION:!0,OPTION:!0,OPTGROUP:!0},M="undefined"!=typeof HTMLTemplateElement;M&&!function(){var a=document.createElement("template"),b=a.content.ownerDocument,c=b.appendChild(b.createElement("html")),d=c.appendChild(b.createElement("head")),e=b.createElement("base");e.href=document.baseURI,d.appendChild(e)}();var N="template, "+Object.keys(L).map(function(a){return a.toLowerCase()+"[template]"}).join(", ");document.addEventListener("DOMContentLoaded",function(){j(document),Platform.performMicrotaskCheckpoint()},!1),M||(a.HTMLTemplateElement=function(){throw TypeError("Illegal constructor")});var O,P="__proto__"in{};"function"==typeof MutationObserver&&(O=new MutationObserver(function(a){for(var b=0;b<a.length;b++)a[b].target.refChanged_()})),HTMLTemplateElement.decorate=function(a,c){if(a.templateIsDecorated_)return!1;var d=a;d.templateIsDecorated_=!0;var h=f(d)&&M,i=h,k=!h,m=!1;if(h||(g(d)?(b(!c),d=n(a),d.templateIsDecorated_=!0,h=M,m=!0):e(d)&&(d=o(a),d.templateIsDecorated_=!0,h=M)),!h){q(d);var r=l(d);d.content_=r.createDocumentFragment()}return c?d.instanceRef_=c:k?p(d,a,m):i&&j(d.content),!0},HTMLTemplateElement.bootstrap=j;var Q=a.HTMLUnknownElement||HTMLElement,R={get:function(){return this.content_},enumerable:!0,configurable:!0};M||(HTMLTemplateElement.prototype=Object.create(Q.prototype),Object.defineProperty(HTMLTemplateElement.prototype,"content",R)),k(HTMLTemplateElement.prototype,{bind:function(a,b,c){if("ref"!=a)return Element.prototype.bind.call(this,a,b,c);var d=this,e=c?b:b.open(function(a){d.setAttribute("ref",a),d.refChanged_()});return this.setAttribute("ref",e),this.refChanged_(),c?void 0:(this.bindings_?this.bindings_.ref=b:this.bindings_={ref:b},b)},processBindingDirectives_:function(a){return this.iterator_&&this.iterator_.closeDeps(),a.if||a.bind||a.repeat?(this.iterator_||(this.iterator_=new E(this)),this.iterator_.updateDependencies(a,this.model_),O&&O.observe(this,{attributes:!0,attributeFilter:["ref"]}),this.iterator_):void(this.iterator_&&(this.iterator_.close(),this.iterator_=void 0))},createInstance:function(a,b,c){b?c=this.newDelegate_(b):c||(c=this.delegate_),this.refContent_||(this.refContent_=this.ref_.content);var d=this.refContent_;if(null===d.firstChild)return T;var e=D(d,c),f=m(this),g=f.createDocumentFragment();g.templateCreator_=this,g.protoContent_=d,g.bindings_=[],g.terminator_=null;for(var h=g.templateInstance_={firstNode:null,lastNode:null,model:a},i=0,j=!1,k=d.firstChild;k;k=k.nextSibling){null===k.nextSibling&&(j=!0);var l=A(k,g,f,e.children[i++],a,c,g.bindings_);l.templateInstance_=h,j&&(g.terminator_=l)}return h.firstNode=g.firstChild,h.lastNode=g.lastChild,g.templateCreator_=void 0,g.protoContent_=void 0,g},get model(){return this.model_},set model(a){this.model_=a,r(this)},get bindingDelegate(){return this.delegate_&&this.delegate_.raw},refChanged_:function(){this.iterator_&&this.refContent_!==this.ref_.content&&(this.refContent_=void 0,this.iterator_.valueChanged(),this.iterator_.updateIteratedValue(this.iterator_.getUpdatedValue()))},clear:function(){this.model_=void 0,this.delegate_=void 0,this.bindings_&&this.bindings_.ref&&this.bindings_.ref.close(),this.refContent_=void 0,this.iterator_&&(this.iterator_.valueChanged(),this.iterator_.close(),this.iterator_=void 0)},setDelegate_:function(a){this.delegate_=a,this.bindingMap_=void 0,this.iterator_&&(this.iterator_.instancePositionChangedFn_=void 0,this.iterator_.instanceModelFn_=void 0)},newDelegate_:function(a){function b(b){var c=a&&a[b];if("function"==typeof c)return function(){return c.apply(a,arguments)}}if(a)return{bindingMaps:{},raw:a,prepareBinding:b("prepareBinding"),prepareInstanceModel:b("prepareInstanceModel"),prepareInstancePositionChanged:b("prepareInstancePositionChanged")}},set bindingDelegate(a){if(this.delegate_)throw Error("Template must be cleared before a new bindingDelegate can be assigned");this.setDelegate_(this.newDelegate_(a))},get ref_(){var a=d(this,this.getAttribute("ref"));if(a||(a=this.instanceRef_),!a)return this;var b=a.ref_;return b?b:a}});var S=1;Object.defineProperty(Node.prototype,"templateInstance",{get:function(){var a=this.templateInstance_;return a?a:this.parentNode?this.parentNode.templateInstance:void 0}});var T=document.createDocumentFragment();T.bindings_=[],T.terminator_=null,E.prototype={closeDeps:function(){var a=this.deps;a&&(a.ifOneTime===!1&&a.ifValue.close(),a.oneTime===!1&&a.value.close())},updateDependencies:function(a,b){this.closeDeps();var c=this.deps={},d=this.templateElement_,e=!0;if(a.if){if(c.hasIf=!0,c.ifOneTime=a.if.onlyOneTime,c.ifValue=v(J,a.if,d,b),e=c.ifValue,c.ifOneTime&&!e)return void this.valueChanged();c.ifOneTime||(e=e.open(this.updateIfValue,this))}a.repeat?(c.repeat=!0,c.oneTime=a.repeat.onlyOneTime,c.value=v(I,a.repeat,d,b)):(c.repeat=!1,c.oneTime=a.bind.onlyOneTime,c.value=v(H,a.bind,d,b));var f=c.value;return c.oneTime||(f=f.open(this.updateIteratedValue,this)),e?void this.updateValue(f):void this.valueChanged()},getUpdatedValue:function(){var a=this.deps.value;return this.deps.oneTime||(a=a.discardChanges()),a},updateIfValue:function(a){return a?void this.updateValue(this.getUpdatedValue()):void this.valueChanged()},updateIteratedValue:function(a){if(this.deps.hasIf){var b=this.deps.ifValue;if(this.deps.ifOneTime||(b=b.discardChanges()),!b)return void this.valueChanged()}this.updateValue(a)},updateValue:function(a){this.deps.repeat||(a=[a]);var b=this.deps.repeat&&!this.deps.oneTime&&Array.isArray(a);this.valueChanged(a,b)},valueChanged:function(a,b){Array.isArray(a)||(a=[]),a!==this.iteratedValue&&(this.unobserve(),this.presentValue=a,b&&(this.arrayObserver=new ArrayObserver(this.presentValue),this.arrayObserver.open(this.handleSplices,this)),this.handleSplices(ArrayObserver.calculateSplices(this.presentValue,this.iteratedValue)))},getLastInstanceNode:function(a){if(-1==a)return this.templateElement_;var b=this.instances[a],c=b.terminator_;if(!c)return this.getLastInstanceNode(a-1);if(c.nodeType!==Node.ELEMENT_NODE||this.templateElement_===c)return c;var d=c.iterator_;return d?d.getLastTemplateNode():c},getLastTemplateNode:function(){return this.getLastInstanceNode(this.instances.length-1)},insertInstanceAt:function(a,b){var c=this.getLastInstanceNode(a-1),d=this.templateElement_.parentNode;this.instances.splice(a,0,b),d.insertBefore(b,c.nextSibling)},extractInstanceAt:function(a){for(var b=this.getLastInstanceNode(a-1),c=this.getLastInstanceNode(a),d=this.templateElement_.parentNode,e=this.instances.splice(a,1)[0];c!==b;){var f=b.nextSibling;f==c&&(c=b),e.appendChild(d.removeChild(f))}return e},getDelegateFn:function(a){return a=a&&a(this.templateElement_),"function"==typeof a?a:null},handleSplices:function(a){if(!this.closed&&a.length){var b=this.templateElement_;if(!b.parentNode)return void this.close();ArrayObserver.applySplices(this.iteratedValue,this.presentValue,a);var c=b.delegate_;void 0===this.instanceModelFn_&&(this.instanceModelFn_=this.getDelegateFn(c&&c.prepareInstanceModel)),void 0===this.instancePositionChangedFn_&&(this.instancePositionChangedFn_=this.getDelegateFn(c&&c.prepareInstancePositionChanged));for(var d=new F,e=0,f=0;f<a.length;f++){for(var g=a[f],h=g.removed,i=0;i<h.length;i++){var j=h[i],k=this.extractInstanceAt(g.index+e);k!==T&&d.set(j,k)}e-=g.addedCount}for(var f=0;f<a.length;f++)for(var g=a[f],l=g.index;l<g.index+g.addedCount;l++){var j=this.iteratedValue[l],k=d.get(j);k?d.delete(j):(this.instanceModelFn_&&(j=this.instanceModelFn_(j)),k=void 0===j?T:b.createInstance(j,void 0,c)),this.insertInstanceAt(l,k)}d.forEach(function(a){this.closeInstanceBindings(a)},this),this.instancePositionChangedFn_&&this.reportInstancesMoved(a)}},reportInstanceMoved:function(a){var b=this.instances[a];b!==T&&this.instancePositionChangedFn_(b.templateInstance_,a)},reportInstancesMoved:function(a){for(var b=0,c=0,d=0;d<a.length;d++){var e=a[d];if(0!=c)for(;b<e.index;)this.reportInstanceMoved(b),b++;else b=e.index;for(;b<e.index+e.addedCount;)this.reportInstanceMoved(b),b++;c+=e.addedCount-e.removed.length}if(0!=c)for(var f=this.instances.length;f>b;)this.reportInstanceMoved(b),b++},closeInstanceBindings:function(a){for(var b=a.bindings_,c=0;c<b.length;c++)b[c].close()},unobserve:function(){this.arrayObserver&&(this.arrayObserver.close(),this.arrayObserver=void 0)},close:function(){if(!this.closed){this.unobserve();for(var a=0;a<this.instances.length;a++)this.closeInstanceBindings(this.instances[a]);this.instances.length=0,this.closeDeps(),this.templateElement_.iterator_=void 0,this.closed=!0}}},HTMLTemplateElement.forAllTemplatesFrom_=i}(this),function(a){function b(a){f.textContent=d++,e.push(a)}function c(){for(;e.length;)e.shift()()}var d=0,e=[],f=document.createTextNode("");new(window.MutationObserver||JsMutationObserver)(c).observe(f,{characterData:!0}),a.endOfMicrotask=b}(Platform),function(a){function b(){e||(e=!0,a.endOfMicrotask(function(){e=!1,logFlags.data&&console.group("Platform.flush()"),a.performMicrotaskCheckpoint(),logFlags.data&&console.groupEnd()}))}var c=document.createElement("style");c.textContent="template {display: none !important;} /* injected by platform.js */";var d=document.querySelector("head");d.insertBefore(c,d.firstChild);var e;if(Observer.hasObjectObserve)b=function(){};else{var f=125;window.addEventListener("WebComponentsReady",function(){b(),a.flushPoll=setInterval(b,f)})}if(window.CustomElements&&!CustomElements.useNative){var g=Document.prototype.importNode;Document.prototype.importNode=function(a,b){var c=g.call(this,a,b);return CustomElements.upgradeAll(c),c}}a.flush=b}(window.Platform),function(a){function b(a,b,d,e){return a.replace(e,function(a,e,f,g){var h=f.replace(/["']/g,"");return h=c(b,h,d),e+"'"+h+"'"+g})}function c(a,b,c){if(b&&"/"===b[0])return b;var e=new URL(b,a);return c?e.href:d(e.href)}function d(a){var b=new URL(document.baseURI),c=new URL(a,b);return c.host===b.host&&c.port===b.port&&c.protocol===b.protocol?e(b,c):a}function e(a,b){for(var c=a.pathname,d=b.pathname,e=c.split("/"),f=d.split("/");e.length&&e[0]===f[0];)e.shift(),f.shift();for(var g=0,h=e.length-1;h>g;g++)f.unshift("..");return f.join("/")+b.search+b.hash}var f={resolveDom:function(a,b){b=b||a.ownerDocument.baseURI,this.resolveAttributes(a,b),this.resolveStyles(a,b);var c=a.querySelectorAll("template");if(c)for(var d,e=0,f=c.length;f>e&&(d=c[e]);e++)d.content&&this.resolveDom(d.content,b)},resolveTemplate:function(a){this.resolveDom(a.content,a.ownerDocument.baseURI)},resolveStyles:function(a,b){var c=a.querySelectorAll("style");if(c)for(var d,e=0,f=c.length;f>e&&(d=c[e]);e++)this.resolveStyle(d,b)},resolveStyle:function(a,b){b=b||a.ownerDocument.baseURI,a.textContent=this.resolveCssText(a.textContent,b)},resolveCssText:function(a,c,d){return a=b(a,c,d,g),b(a,c,d,h)},resolveAttributes:function(a,b){a.hasAttributes&&a.hasAttributes()&&this.resolveElementAttributes(a,b);var c=a&&a.querySelectorAll(j);if(c)for(var d,e=0,f=c.length;f>e&&(d=c[e]);e++)this.resolveElementAttributes(d,b)},resolveElementAttributes:function(a,d){d=d||a.ownerDocument.baseURI,i.forEach(function(e){var f,h=a.attributes[e],i=h&&h.value;i&&i.search(k)<0&&(f="style"===e?b(i,d,!1,g):c(d,i),h.value=f)})}},g=/(url\()([^)]*)(\))/g,h=/(@import[\s]+(?!url\())([^;]*)(;)/g,i=["href","src","action","style","url"],j="["+i.join("],[")+"]",k="{{.*}}";a.urlResolver=f}(Polymer),function(a){function b(a){this.cache=Object.create(null),this.map=Object.create(null),this.requests=0,this.regex=a}var c=Platform.endOfMicrotask;b.prototype={extractUrls:function(a,b){for(var c,d,e=[];c=this.regex.exec(a);)d=new URL(c[1],b),e.push({matched:c[0],url:d.href});return e},process:function(a,b,c){var d=this.extractUrls(a,b),e=c.bind(null,this.map);this.fetch(d,e)},fetch:function(a,b){var c=a.length;if(!c)return b();for(var d,e,f,g=function(){0===--c&&b()},h=0;c>h;h++)d=a[h],f=d.url,e=this.cache[f],e||(e=this.xhr(f),e.match=d,this.cache[f]=e),e.wait(g)},handleXhr:function(a){var b=a.match,c=b.url,d=a.response||a.responseText||"";this.map[c]=d,this.fetch(this.extractUrls(d,c),a.resolve)},xhr:function(a){this.requests++;var b=new XMLHttpRequest;return b.open("GET",a,!0),b.send(),b.onerror=b.onload=this.handleXhr.bind(this,b),b.pending=[],b.resolve=function(){for(var a=b.pending,c=0;c<a.length;c++)a[c]();b.pending=null},b.wait=function(a){b.pending?b.pending.push(a):c(a)},b}},a.Loader=b}(Polymer),function(a){function b(){this.loader=new d(this.regex)}var c=a.urlResolver,d=a.Loader;b.prototype={regex:/@import\s+(?:url)?["'\(]*([^'"\)]*)['"\)]*;/g,resolve:function(a,b,c){var d=function(d){c(this.flatten(a,b,d))}.bind(this);this.loader.process(a,b,d)},resolveNode:function(a,b,c){var d=a.textContent,e=function(b){a.textContent=b,c(a)};this.resolve(d,b,e)},flatten:function(a,b,d){for(var e,f,g,h=this.loader.extractUrls(a,b),i=0;i<h.length;i++)e=h[i],f=e.url,g=c.resolveCssText(d[f],f,!0),g=this.flatten(g,b,d),a=a.replace(e.matched,g);return a},loadStyles:function(a,b,c){function d(){f++,f===g&&c&&c()}for(var e,f=0,g=a.length,h=0;g>h&&(e=a[h]);h++)this.resolveNode(e,b,d)}};var e=new b;a.styleResolver=e}(Polymer),function(a){function b(a,b){return a&&b&&Object.getOwnPropertyNames(b).forEach(function(c){var d=Object.getOwnPropertyDescriptor(b,c);d&&(Object.defineProperty(a,c,d),"function"==typeof d.value&&(d.value.nom=c))}),a}function c(a){for(var b=a||{},c=1;c<arguments.length;c++){var e=arguments[c];try{for(var f in e)d(f,e,b)}catch(g){}}return b}function d(a,b,c){var d=e(b,a);Object.defineProperty(c,a,d)}function e(a,b){if(a){var c=Object.getOwnPropertyDescriptor(a,b);return c||e(Object.getPrototypeOf(a),b)}}a.extend=b,a.mixin=c,Platform.mixin=c}(Polymer),function(a){function b(a,b,d){return a?a.stop():a=new c(this),a.go(b,d),a}var c=function(a){this.context=a,this.boundComplete=this.complete.bind(this)};c.prototype={go:function(a,b){this.callback=a;var c;b?(c=setTimeout(this.boundComplete,b),this.handle=function(){clearTimeout(c)}):(c=requestAnimationFrame(this.boundComplete),this.handle=function(){cancelAnimationFrame(c)})},stop:function(){this.handle&&(this.handle(),this.handle=null)},complete:function(){this.handle&&(this.stop(),this.callback.call(this.context))}},a.job=b}(Polymer),function(a){function b(a,b,c){var d="string"==typeof a?document.createElement(a):a.cloneNode(!0);if(d.innerHTML=b,c)for(var e in c)d.setAttribute(e,c[e]);return d}var c={};HTMLElement.register=function(a,b){c[a]=b},HTMLElement.getPrototypeForTag=function(a){var b=a?c[a]:HTMLElement.prototype;return b||Object.getPrototypeOf(document.createElement(a))};var d=Event.prototype.stopPropagation;Event.prototype.stopPropagation=function(){this.cancelBubble=!0,d.apply(this,arguments)};var e=DOMTokenList.prototype.add,f=DOMTokenList.prototype.remove;DOMTokenList.prototype.add=function(){for(var a=0;a<arguments.length;a++)e.call(this,arguments[a])},DOMTokenList.prototype.remove=function(){for(var a=0;a<arguments.length;a++)f.call(this,arguments[a])},DOMTokenList.prototype.toggle=function(a,b){1==arguments.length&&(b=!this.contains(a)),b?this.add(a):this.remove(a)},DOMTokenList.prototype.switch=function(a,b){a&&this.remove(a),b&&this.add(b)};var g=function(){return Array.prototype.slice.call(this)},h=window.NamedNodeMap||window.MozNamedAttrMap||{};NodeList.prototype.array=g,h.prototype.array=g,HTMLCollection.prototype.array=g,a.createDOM=b}(Polymer),function(a){function b(a){var e=b.caller,g=e.nom,h=e._super;h||(g||(g=e.nom=c.call(this,e)),g||console.warn("called super() on a method not installed declaratively (has no .nom property)"),h=d(e,g,f(this)));var i=h[g];return i?(i._super||d(i,g,h),i.apply(this,a||[])):void 0}function c(a){for(var b=this.__proto__;b&&b!==HTMLElement.prototype;){for(var c,d=Object.getOwnPropertyNames(b),e=0,f=d.length;f>e&&(c=d[e]);e++){var g=Object.getOwnPropertyDescriptor(b,c);if("function"==typeof g.value&&g.value===a)return c}b=b.__proto__}}function d(a,b,c){var d=e(c,b,a);return d[b]&&(d[b].nom=b),a._super=d}function e(a,b,c){for(;a;){if(a[b]!==c&&a[b])return a;a=f(a)}return Object}function f(a){return a.__proto__}a.super=b}(Polymer),function(a){function b(a){return a}function c(a,b){var c=typeof b;return b instanceof Date&&(c="date"),d[c](a,b)}var d={string:b,undefined:b,date:function(a){return new Date(Date.parse(a)||Date.now())},"boolean":function(a){return""===a?!0:"false"===a?!1:!!a},number:function(a){var b=parseFloat(a);return 0===b&&(b=parseInt(a)),isNaN(b)?a:b},object:function(a,b){if(null===b)return a;try{return JSON.parse(a.replace(/'/g,'"'))}catch(c){return a}},"function":function(a,b){return b}};a.deserializeValue=c}(Polymer),function(a){var b=a.extend,c={};c.declaration={},c.instance={},c.publish=function(a,c){for(var d in a)b(c,a[d])},a.api=c}(Polymer),function(a){var b={async:function(a,b,c){Platform.flush(),b=b&&b.length?b:[b];var d=function(){(this[a]||a).apply(this,b)}.bind(this),e=c?setTimeout(d,c):requestAnimationFrame(d);return c?e:~e},cancelAsync:function(a){0>a?cancelAnimationFrame(~a):clearTimeout(a)},fire:function(a,b,c,d,e){var f=c||this,b=null===b||void 0===b?{}:b,g=new CustomEvent(a,{bubbles:void 0!==d?d:!0,cancelable:void 0!==e?e:!0,detail:b});return f.dispatchEvent(g),g},asyncFire:function(){this.async("fire",arguments)},classFollows:function(a,b,c){b&&b.classList.remove(c),a&&a.classList.add(c)},injectBoundHTML:function(a,b){var c=document.createElement("template");c.innerHTML=a;var d=this.instanceTemplate(c);return b&&(b.textContent="",b.appendChild(d)),d}},c=function(){},d={};b.asyncMethod=b.async,a.api.instance.utils=b,a.nop=c,a.nob=d}(Polymer),function(a){var b=window.logFlags||{},c="on-",d={EVENT_PREFIX:c,addHostListeners:function(){var a=this.eventDelegates;b.events&&Object.keys(a).length>0&&console.log("[%s] addHostListeners:",this.localName,a);for(var c in a){var d=a[c];PolymerGestures.addEventListener(this,c,this.element.getEventHandler(this,this,d))}},dispatchMethod:function(a,c,d){if(a){b.events&&console.group("[%s] dispatch [%s]",a.localName,c);var e="function"==typeof c?c:a[c];e&&e[d?"apply":"call"](a,d),b.events&&console.groupEnd(),Platform.flush()}}};a.api.instance.events=d,a.addEventListener=function(a,b,c,d){PolymerGestures.addEventListener(wrap(a),b,c,d)},a.removeEventListener=function(a,b,c,d){PolymerGestures.removeEventListener(wrap(a),b,c,d)}}(Polymer),function(a){var b={copyInstanceAttributes:function(){var a=this._instanceAttributes;for(var b in a)this.hasAttribute(b)||this.setAttribute(b,a[b])},takeAttributes:function(){if(this._publishLC)for(var a,b=0,c=this.attributes,d=c.length;(a=c[b])&&d>b;b++)this.attributeToProperty(a.name,a.value)},attributeToProperty:function(b,c){var b=this.propertyForAttribute(b);if(b){if(c&&c.search(a.bindPattern)>=0)return;var d=this[b],c=this.deserializeValue(c,d);c!==d&&(this[b]=c)}},propertyForAttribute:function(a){var b=this._publishLC&&this._publishLC[a];return b},deserializeValue:function(b,c){return a.deserializeValue(b,c)},serializeValue:function(a,b){return"boolean"===b?a?"":void 0:"object"!==b&&"function"!==b&&void 0!==a?a:void 0},reflectPropertyToAttribute:function(a){var b=typeof this[a],c=this.serializeValue(this[a],b);void 0!==c?this.setAttribute(a,c):"boolean"===b&&this.removeAttribute(a)}};a.api.instance.attributes=b}(Polymer),function(a){function b(a,b){return a===b?0!==a||1/a===1/b:f(a)&&f(b)?!0:a!==a&&b!==b}function c(a,b){return void 0===b&&null===a?b:null===b||void 0===b?a:b}var d=window.logFlags||{},e={object:void 0,type:"update",name:void 0,oldValue:void 0},f=Number.isNaN||function(a){return"number"==typeof a&&isNaN(a)},g={createPropertyObserver:function(){var a=this._observeNames;if(a&&a.length){var b=this._propertyObserver=new CompoundObserver(!0);this.registerObserver(b);for(var c,d=0,e=a.length;e>d&&(c=a[d]);d++)b.addPath(this,c),this.observeArrayValue(c,this[c],null)}},openPropertyObserver:function(){this._propertyObserver&&this._propertyObserver.open(this.notifyPropertyChanges,this)},notifyPropertyChanges:function(a,b,c){var d,e,f={};for(var g in b)if(d=c[2*g+1],e=this.observe[d]){var h=b[g],i=a[g];this.observeArrayValue(d,i,h),f[e]||(void 0!==h&&null!==h||void 0!==i&&null!==i)&&(f[e]=!0,this.invokeMethod(e,[h,i,arguments]))}},deliverChanges:function(){this._propertyObserver&&this._propertyObserver.deliver()},propertyChanged_:function(a){this.reflect[a]&&this.reflectPropertyToAttribute(a)},observeArrayValue:function(a,b,c){var e=this.observe[a];if(e&&(Array.isArray(c)&&(d.observe&&console.log("[%s] observeArrayValue: unregister observer [%s]",this.localName,a),this.closeNamedObserver(a+"__array")),Array.isArray(b))){d.observe&&console.log("[%s] observeArrayValue: register observer [%s]",this.localName,a,b);var f=new ArrayObserver(b);f.open(function(a){this.invokeMethod(e,[a])},this),this.registerNamedObserver(a+"__array",f)}},emitPropertyChangeRecord:function(a,c,d){if(!b(c,d)&&(this.propertyChanged_(a,c,d),Observer.hasObjectObserve)){var f=this.notifier_;f||(f=this.notifier_=Object.getNotifier(this)),e.object=this,e.name=a,e.oldValue=d,f.notify(e)}},bindToAccessor:function(a,c,d){function e(b,c){j[f]=b;var d=j[h];d&&"function"==typeof d.setValue&&d.setValue(b),j.emitPropertyChangeRecord(a,b,c)}var f=a+"_",g=a+"Observable_",h=a+"ComputedBoundObservable_";this[g]=c;var i=this[f],j=this,k=c.open(e);if(d&&!b(i,k)){var l=d(i,k);b(k,l)||(k=l,c.setValue&&c.setValue(k))}e(k,i);var m={close:function(){c.close(),j[g]=void 0,j[h]=void 0}};return this.registerObserver(m),m},createComputedProperties:function(){if(this._computedNames)for(var a=0;a<this._computedNames.length;a++){var b=this._computedNames[a],c=this.computed[b];try{var d=PolymerExpressions.getExpression(c),e=d.getBinding(this,this.element.syntax);this.bindToAccessor(b,e)}catch(f){console.error("Failed to create computed property",f)}}},bindProperty:function(a,b,d){if(d)return void(this[a]=b);var e=this.element.prototype.computed;if(e&&e[a]){var f=a+"ComputedBoundObservable_";return void(this[f]=b)}return this.bindToAccessor(a,b,c)},invokeMethod:function(a,b){var c=this[a]||a;"function"==typeof c&&c.apply(this,b)},registerObserver:function(a){return this._observers?void this._observers.push(a):void(this._observers=[a])},closeObservers:function(){if(this._observers){for(var a=this._observers,b=0;b<a.length;b++){var c=a[b];c&&"function"==typeof c.close&&c.close()}this._observers=[]}},registerNamedObserver:function(a,b){var c=this._namedObservers||(this._namedObservers={});c[a]=b},closeNamedObserver:function(a){var b=this._namedObservers;return b&&b[a]?(b[a].close(),b[a]=null,!0):void 0},closeNamedObservers:function(){if(this._namedObservers){for(var a in this._namedObservers)this.closeNamedObserver(a);this._namedObservers={}}}};a.api.instance.properties=g}(Polymer),function(a){var b=window.logFlags||0,c={instanceTemplate:function(a){HTMLTemplateElement.decorate(a);for(var b=this.syntax||!a.bindingDelegate&&this.element.syntax,c=a.createInstance(this,b),d=c.bindings_,e=0;e<d.length;e++)this.registerObserver(d[e]);return c},bind:function(a,b,c){var d=this.propertyForAttribute(a);if(d){var e=this.bindProperty(d,b,c);return Platform.enableBindingsReflection&&e&&(e.path=b.path_,this._recordBinding(d,e)),this.reflect[d]&&this.reflectPropertyToAttribute(d),e}return this.mixinSuper(arguments)},bindFinished:function(){this.makeElementReady()},_recordBinding:function(a,b){this.bindings_=this.bindings_||{},this.bindings_[a]=b},asyncUnbindAll:function(){this._unbound||(b.unbind&&console.log("[%s] asyncUnbindAll",this.localName),this._unbindAllJob=this.job(this._unbindAllJob,this.unbindAll,0))},unbindAll:function(){this._unbound||(this.closeObservers(),this.closeNamedObservers(),this._unbound=!0)},cancelUnbindAll:function(){return this._unbound?void(b.unbind&&console.warn("[%s] already unbound, cannot cancel unbindAll",this.localName)):(b.unbind&&console.log("[%s] cancelUnbindAll",this.localName),void(this._unbindAllJob&&(this._unbindAllJob=this._unbindAllJob.stop())))}},d=/\{\{([^{}]*)}}/;a.bindPattern=d,a.api.instance.mdv=c}(Polymer),function(a){function b(a){return a.hasOwnProperty("PolymerBase")}function c(){}var d={PolymerBase:!0,job:function(a,b,c){if("string"!=typeof a)return Polymer.job.call(this,a,b,c);var d="___"+a;this[d]=Polymer.job.call(this,this[d],b,c)},"super":Polymer.super,created:function(){},ready:function(){},createdCallback:function(){this.templateInstance&&this.templateInstance.model&&console.warn("Attributes on "+this.localName+" were data bound prior to Polymer upgrading the element. This may result in incorrect binding types."),this.created(),this.prepareElement(),this.ownerDocument.isStagingDocument||this.makeElementReady()},prepareElement:function(){return this._elementPrepared?void console.warn("Element already prepared",this.localName):(this._elementPrepared=!0,this.shadowRoots={},this.createPropertyObserver(),this.openPropertyObserver(),this.copyInstanceAttributes(),this.takeAttributes(),void this.addHostListeners())},makeElementReady:function(){this._readied||(this._readied=!0,this.createComputedProperties(),this.parseDeclarations(this.__proto__),this.removeAttribute("unresolved"),this.ready())},attachedCallback:function(){this.cancelUnbindAll(),this.attached&&this.attached(),this.enteredView&&this.enteredView(),this.hasBeenAttached||(this.hasBeenAttached=!0,this.domReady&&this.async("domReady"))},detachedCallback:function(){this.preventDispose||this.asyncUnbindAll(),this.detached&&this.detached(),this.leftView&&this.leftView()},enteredViewCallback:function(){this.attachedCallback()},leftViewCallback:function(){this.detachedCallback()},enteredDocumentCallback:function(){this.attachedCallback()},leftDocumentCallback:function(){this.detachedCallback()},parseDeclarations:function(a){a&&a.element&&(this.parseDeclarations(a.__proto__),a.parseDeclaration.call(this,a.element))},parseDeclaration:function(a){var b=this.fetchTemplate(a);if(b){var c=this.shadowFromTemplate(b);this.shadowRoots[a.name]=c}},fetchTemplate:function(a){return a.querySelector("template")},shadowFromTemplate:function(a){if(a){var b=this.createShadowRoot(),c=this.instanceTemplate(a);return b.appendChild(c),this.shadowRootReady(b,a),b}},lightFromTemplate:function(a,b){if(a){this.eventController=this;var c=this.instanceTemplate(a);return b?this.insertBefore(c,b):this.appendChild(c),this.shadowRootReady(this),c}},shadowRootReady:function(a){this.marshalNodeReferences(a)},marshalNodeReferences:function(a){var b=this.$=this.$||{};if(a)for(var c,d=a.querySelectorAll("[id]"),e=0,f=d.length;f>e&&(c=d[e]);e++)b[c.id]=c},attributeChangedCallback:function(a){"class"!==a&&"style"!==a&&this.attributeToProperty(a,this.getAttribute(a)),this.attributeChanged&&this.attributeChanged.apply(this,arguments)},onMutation:function(a,b){var c=new MutationObserver(function(a){b.call(this,c,a),c.disconnect()}.bind(this));c.observe(a,{childList:!0,subtree:!0})}};c.prototype=d,d.constructor=c,a.Base=c,a.isBase=b,a.api.instance.base=d}(Polymer),function(a){function b(a){return a.__proto__}function c(a,b){var c="",d=!1;b&&(c=b.localName,d=b.hasAttribute("is"));var e=Platform.ShadowCSS.makeScopeSelector(c,d);return Platform.ShadowCSS.shimCssText(a,e)}var d=(window.logFlags||{},window.ShadowDOMPolyfill),e="element",f="controller",g={STYLE_SCOPE_ATTRIBUTE:e,installControllerStyles:function(){var a=this.findStyleScope();if(a&&!this.scopeHasNamedStyle(a,this.localName)){for(var c=b(this),d="";c&&c.element;)d+=c.element.cssTextForScope(f),c=b(c);d&&this.installScopeCssText(d,a)}},installScopeStyle:function(a,b,c){var c=c||this.findStyleScope(),b=b||"";if(c&&!this.scopeHasNamedStyle(c,this.localName+b)){var d="";if(a instanceof Array)for(var e,f=0,g=a.length;g>f&&(e=a[f]);f++)d+=e.textContent+"\n\n";else d=a.textContent;this.installScopeCssText(d,c,b)}},installScopeCssText:function(a,b,e){if(b=b||this.findStyleScope(),e=e||"",b){d&&(a=c(a,b.host));var g=this.element.cssTextToScopeStyle(a,f);Polymer.applyStyleToScope(g,b),this.styleCacheForScope(b)[this.localName+e]=!0}},findStyleScope:function(a){for(var b=a||this;b.parentNode;)b=b.parentNode;return b},scopeHasNamedStyle:function(a,b){var c=this.styleCacheForScope(a);
return c[b]},styleCacheForScope:function(a){if(d){var b=a.host?a.host.localName:a.localName;return h[b]||(h[b]={})}return a._scopeStyles=a._scopeStyles||{}}},h={};a.api.instance.styles=g}(Polymer),function(a){function b(a,b){if("string"!=typeof a){var c=b||document._currentScript;if(b=a,a=c&&c.parentNode&&c.parentNode.getAttribute?c.parentNode.getAttribute("name"):"",!a)throw"Element name could not be inferred."}if(f(a))throw"Already registered (Polymer) prototype for element "+a;e(a,b),d(a)}function c(a,b){i[a]=b}function d(a){i[a]&&(i[a].registerWhenReady(),delete i[a])}function e(a,b){return j[a]=b||{}}function f(a){return j[a]}function g(a,b){if("string"!=typeof b)return!1;var c=HTMLElement.getPrototypeForTag(b),d=c&&c.constructor;return d?CustomElements.instanceof?CustomElements.instanceof(a,d):a instanceof d:!1}var h=a.extend,i=(a.api,{}),j={};a.getRegisteredPrototype=f,a.waitingForPrototype=c,a.instanceOfType=g,window.Polymer=b,h(Polymer,a),Platform.consumeDeclarations&&Platform.consumeDeclarations(function(a){if(a)for(var c,d=0,e=a.length;e>d&&(c=a[d]);d++)b.apply(null,c)})}(Polymer),function(a){var b={resolveElementPaths:function(a){Polymer.urlResolver.resolveDom(a)},addResolvePathApi:function(){var a=this.getAttribute("assetpath")||"",b=new URL(a,this.ownerDocument.baseURI);this.prototype.resolvePath=function(a,c){var d=new URL(a,c||b);return d.href}}};a.api.declaration.path=b}(Polymer),function(a){function b(a,b){var c=new URL(a.getAttribute("href"),b).href;return"@import '"+c+"';"}function c(a,b){if(a){b===document&&(b=document.head),i&&(b=document.head);var c=d(a.textContent),e=a.getAttribute(h);e&&c.setAttribute(h,e);var f=b.firstElementChild;if(b===document.head){var g="style["+h+"]",j=document.head.querySelectorAll(g);j.length&&(f=j[j.length-1].nextElementSibling)}b.insertBefore(c,f)}}function d(a,b){b=b||document,b=b.createElement?b:b.ownerDocument;var c=b.createElement("style");return c.textContent=a,c}function e(a){return a&&a.__resource||""}function f(a,b){return q?q.call(a,b):void 0}var g=(window.logFlags||{},a.api.instance.styles),h=g.STYLE_SCOPE_ATTRIBUTE,i=window.ShadowDOMPolyfill,j="style",k="@import",l="link[rel=stylesheet]",m="global",n="polymer-scope",o={loadStyles:function(a){var b=this.fetchTemplate(),c=b&&this.templateContent();if(c){this.convertSheetsToStyles(c);var d=this.findLoadableStyles(c);if(d.length){var e=b.ownerDocument.baseURI;return Polymer.styleResolver.loadStyles(d,e,a)}}a&&a()},convertSheetsToStyles:function(a){for(var c,e,f=a.querySelectorAll(l),g=0,h=f.length;h>g&&(c=f[g]);g++)e=d(b(c,this.ownerDocument.baseURI),this.ownerDocument),this.copySheetAttributes(e,c),c.parentNode.replaceChild(e,c)},copySheetAttributes:function(a,b){for(var c,d=0,e=b.attributes,f=e.length;(c=e[d])&&f>d;d++)"rel"!==c.name&&"href"!==c.name&&a.setAttribute(c.name,c.value)},findLoadableStyles:function(a){var b=[];if(a)for(var c,d=a.querySelectorAll(j),e=0,f=d.length;f>e&&(c=d[e]);e++)c.textContent.match(k)&&b.push(c);return b},installSheets:function(){this.cacheSheets(),this.cacheStyles(),this.installLocalSheets(),this.installGlobalStyles()},cacheSheets:function(){this.sheets=this.findNodes(l),this.sheets.forEach(function(a){a.parentNode&&a.parentNode.removeChild(a)})},cacheStyles:function(){this.styles=this.findNodes(j+"["+n+"]"),this.styles.forEach(function(a){a.parentNode&&a.parentNode.removeChild(a)})},installLocalSheets:function(){var a=this.sheets.filter(function(a){return!a.hasAttribute(n)}),b=this.templateContent();if(b){var c="";if(a.forEach(function(a){c+=e(a)+"\n"}),c){var f=d(c,this.ownerDocument);b.insertBefore(f,b.firstChild)}}},findNodes:function(a,b){var c=this.querySelectorAll(a).array(),d=this.templateContent();if(d){var e=d.querySelectorAll(a).array();c=c.concat(e)}return b?c.filter(b):c},installGlobalStyles:function(){var a=this.styleForScope(m);c(a,document.head)},cssTextForScope:function(a){var b="",c="["+n+"="+a+"]",d=function(a){return f(a,c)},g=this.sheets.filter(d);g.forEach(function(a){b+=e(a)+"\n\n"});var h=this.styles.filter(d);return h.forEach(function(a){b+=a.textContent+"\n\n"}),b},styleForScope:function(a){var b=this.cssTextForScope(a);return this.cssTextToScopeStyle(b,a)},cssTextToScopeStyle:function(a,b){if(a){var c=d(a);return c.setAttribute(h,this.getAttribute("name")+"-"+b),c}}},p=HTMLElement.prototype,q=p.matches||p.matchesSelector||p.webkitMatchesSelector||p.mozMatchesSelector;a.api.declaration.styles=o,a.applyStyleToScope=c}(Polymer),function(a){var b=(window.logFlags||{},a.api.instance.events),c=b.EVENT_PREFIX,d={};["webkitAnimationStart","webkitAnimationEnd","webkitTransitionEnd","DOMFocusOut","DOMFocusIn","DOMMouseScroll"].forEach(function(a){d[a.toLowerCase()]=a});var e={parseHostEvents:function(){var a=this.prototype.eventDelegates;this.addAttributeDelegates(a)},addAttributeDelegates:function(a){for(var b,c=0;b=this.attributes[c];c++)this.hasEventPrefix(b.name)&&(a[this.removeEventPrefix(b.name)]=b.value.replace("{{","").replace("}}","").trim())},hasEventPrefix:function(a){return a&&"o"===a[0]&&"n"===a[1]&&"-"===a[2]},removeEventPrefix:function(a){return a.slice(f)},findController:function(a){for(;a.parentNode;){if(a.eventController)return a.eventController;a=a.parentNode}return a.host},getEventHandler:function(a,b,c){var d=this;return function(e){a&&a.PolymerBase||(a=d.findController(b));var f=[e,e.detail,e.currentTarget];a.dispatchMethod(a,c,f)}},prepareEventBinding:function(a,b){if(this.hasEventPrefix(b)){var c=this.removeEventPrefix(b);c=d[c]||c;var e=this;return function(b,d,f){function g(){return"{{ "+a+" }}"}var h=e.getEventHandler(void 0,d,a);return PolymerGestures.addEventListener(d,c,h),f?void 0:{open:g,discardChanges:g,close:function(){PolymerGestures.removeEventListener(d,c,h)}}}}}},f=c.length;a.api.declaration.events=e}(Polymer),function(a){var b={inferObservers:function(a){var b,c=a.observe;for(var d in a)"Changed"===d.slice(-7)&&(c||(c=a.observe={}),b=d.slice(0,-7),c[b]=c[b]||d)},explodeObservers:function(a){var b=a.observe;if(b){var c={};for(var d in b)for(var e,f=d.split(" "),g=0;e=f[g];g++)c[e]=b[d];a.observe=c}},optimizePropertyMaps:function(a){if(a.observe){var b=a._observeNames=[];for(var c in a.observe)for(var d,e=c.split(" "),f=0;d=e[f];f++)b.push(d)}if(a.publish){var b=a._publishNames=[];for(var c in a.publish)b.push(c)}if(a.computed){var b=a._computedNames=[];for(var c in a.computed)b.push(c)}},publishProperties:function(a,b){var c=a.publish;c&&(this.requireProperties(c,a,b),a._publishLC=this.lowerCaseMap(c))},requireProperties:function(a,b){b.reflect=b.reflect||{};for(var c in a){var d=a[c];d&&void 0!==d.reflect&&(b.reflect[c]=Boolean(d.reflect),d=d.value),void 0!==d&&(b[c]=d)}},lowerCaseMap:function(a){var b={};for(var c in a)b[c.toLowerCase()]=c;return b},createPropertyAccessor:function(a,b){var c=this.prototype,d=a+"_",e=a+"Observable_";c[d]=c[a],Object.defineProperty(c,a,{get:function(){var a=this[e];return a&&a.deliver(),this[d]},set:function(c){if(b)return this[d];var f=this[e];if(f)return void f.setValue(c);var g=this[d];return this[d]=c,this.emitPropertyChangeRecord(a,c,g),c},configurable:!0})},createPropertyAccessors:function(a){var b=a._computedNames;if(b&&b.length)for(var c,d=0,e=b.length;e>d&&(c=b[d]);d++)this.createPropertyAccessor(c,!0);var b=a._publishNames;if(b&&b.length)for(var c,d=0,e=b.length;e>d&&(c=b[d]);d++)a.computed&&a.computed[c]||this.createPropertyAccessor(c)}};a.api.declaration.properties=b}(Polymer),function(a){var b="attributes",c=/\s|,/,d={inheritAttributesObjects:function(a){this.inheritObject(a,"publishLC"),this.inheritObject(a,"_instanceAttributes")},publishAttributes:function(a){var d=this.getAttribute(b);if(d)for(var e,f=a.publish||(a.publish={}),g=d.split(c),h=0,i=g.length;i>h;h++)e=g[h].trim(),e&&void 0===f[e]&&(f[e]=void 0)},accumulateInstanceAttributes:function(){for(var a,b=this.prototype._instanceAttributes,c=this.attributes,d=0,e=c.length;e>d&&(a=c[d]);d++)this.isInstanceAttribute(a.name)&&(b[a.name]=a.value)},isInstanceAttribute:function(a){return!this.blackList[a]&&"on-"!==a.slice(0,3)},blackList:{name:1,"extends":1,constructor:1,noscript:1,assetpath:1,"cache-csstext":1}};d.blackList[b]=1,a.api.declaration.attributes=d}(Polymer),function(a){var b=a.api.declaration.events,c=new PolymerExpressions,d=c.prepareBinding;c.prepareBinding=function(a,e,f){return b.prepareEventBinding(a,e,f)||d.call(c,a,e,f)};var e={syntax:c,fetchTemplate:function(){return this.querySelector("template")},templateContent:function(){var a=this.fetchTemplate();return a&&a.content},installBindingDelegate:function(a){a&&(a.bindingDelegate=this.syntax)}};a.api.declaration.mdv=e}(Polymer),function(a){function b(a){if(!Object.__proto__){var b=Object.getPrototypeOf(a);a.__proto__=b,d(b)&&(b.__proto__=Object.getPrototypeOf(b))}}var c=a.api,d=a.isBase,e=a.extend,f=window.ShadowDOMPolyfill,g={register:function(a,b){this.buildPrototype(a,b),this.registerPrototype(a,b),this.publishConstructor()},buildPrototype:function(b,c){var d=a.getRegisteredPrototype(b),e=this.generateBasePrototype(c);this.desugarBeforeChaining(d,e),this.prototype=this.chainPrototypes(d,e),this.desugarAfterChaining(b,c)},desugarBeforeChaining:function(a,b){a.element=this,this.publishAttributes(a,b),this.publishProperties(a,b),this.inferObservers(a),this.explodeObservers(a)},chainPrototypes:function(a,c){this.inheritMetaData(a,c);var d=this.chainObject(a,c);return b(d),d},inheritMetaData:function(a,b){this.inheritObject("observe",a,b),this.inheritObject("publish",a,b),this.inheritObject("reflect",a,b),this.inheritObject("_publishLC",a,b),this.inheritObject("_instanceAttributes",a,b),this.inheritObject("eventDelegates",a,b)},desugarAfterChaining:function(a,b){this.optimizePropertyMaps(this.prototype),this.createPropertyAccessors(this.prototype),this.installBindingDelegate(this.fetchTemplate()),this.installSheets(),this.resolveElementPaths(this),this.accumulateInstanceAttributes(),this.parseHostEvents(),this.addResolvePathApi(),f&&Platform.ShadowCSS.shimStyling(this.templateContent(),a,b),this.prototype.registerCallback&&this.prototype.registerCallback(this)},publishConstructor:function(){var a=this.getAttribute("constructor");a&&(window[a]=this.ctor)},generateBasePrototype:function(a){var b=this.findBasePrototype(a);if(!b){var b=HTMLElement.getPrototypeForTag(a);b=this.ensureBaseApi(b),h[a]=b}return b},findBasePrototype:function(a){return h[a]},ensureBaseApi:function(a){if(a.PolymerBase)return a;var b=Object.create(a);return c.publish(c.instance,b),this.mixinMethod(b,a,c.instance.mdv,"bind"),b},mixinMethod:function(a,b,c,d){var e=function(a){return b[d].apply(this,a)};a[d]=function(){return this.mixinSuper=e,c[d].apply(this,arguments)}},inheritObject:function(a,b,c){var d=b[a]||{};b[a]=this.chainObject(d,c[a])},registerPrototype:function(a,b){var c={prototype:this.prototype},d=this.findTypeExtension(b);d&&(c.extends=d),HTMLElement.register(a,this.prototype),this.ctor=document.registerElement(a,c)},findTypeExtension:function(a){if(a&&a.indexOf("-")<0)return a;var b=this.findBasePrototype(a);return b.element?this.findTypeExtension(b.element.extends):void 0}},h={};g.chainObject=Object.__proto__?function(a,b){return a&&b&&a!==b&&(a.__proto__=b),a}:function(a,b){if(a&&b&&a!==b){var c=Object.create(b);a=e(c,a)}return a},c.declaration.prototype=g}(Polymer),function(a){function b(a){return document.contains(a)?j:i}function c(){return i.length?i[0]:j[0]}function d(a){f.waitToReady=!0,Platform.endOfMicrotask(function(){HTMLImports.whenReady(function(){f.addReadyCallback(a),f.waitToReady=!1,f.check()})})}function e(a){if(void 0===a)return void f.ready();var b=setTimeout(function(){f.ready()},a);Polymer.whenReady(function(){clearTimeout(b)})}var f={wait:function(a){a.__queue||(a.__queue={},g.push(a))},enqueue:function(a,c,d){var e=a.__queue&&!a.__queue.check;return e&&(b(a).push(a),a.__queue.check=c,a.__queue.go=d),0!==this.indexOf(a)},indexOf:function(a){var c=b(a).indexOf(a);return c>=0&&document.contains(a)&&(c+=HTMLImports.useNative||HTMLImports.ready?i.length:1e9),c},go:function(a){var b=this.remove(a);b&&(a.__queue.flushable=!0,this.addToFlushQueue(b),this.check())},remove:function(a){var c=this.indexOf(a);if(0===c)return b(a).shift()},check:function(){var a=this.nextElement();return a&&a.__queue.check.call(a),this.canReady()?(this.ready(),!0):void 0},nextElement:function(){return c()},canReady:function(){return!this.waitToReady&&this.isEmpty()},isEmpty:function(){for(var a,b=0,c=g.length;c>b&&(a=g[b]);b++)if(a.__queue&&!a.__queue.flushable)return;return!0},addToFlushQueue:function(a){h.push(a)},flush:function(){if(!this.flushing){this.flushing=!0;for(var a;h.length;)a=h.shift(),a.__queue.go.call(a),a.__queue=null;this.flushing=!1}},ready:function(){var a=CustomElements.ready;CustomElements.ready=!1,this.flush(),CustomElements.useNative||CustomElements.upgradeDocumentTree(document),CustomElements.ready=a,Platform.flush(),requestAnimationFrame(this.flushReadyCallbacks)},addReadyCallback:function(a){a&&k.push(a)},flushReadyCallbacks:function(){if(k)for(var a;k.length;)(a=k.shift())()},waitingFor:function(){for(var a,b=[],c=0,d=g.length;d>c&&(a=g[c]);c++)a.__queue&&!a.__queue.flushable&&b.push(a);return b},waitToReady:!0},g=[],h=[],i=[],j=[],k=[];a.elements=g,a.waitingFor=f.waitingFor.bind(f),a.forceReady=e,a.queue=f,a.whenReady=a.whenPolymerReady=d}(Polymer),function(a){function b(a){return Boolean(HTMLElement.getPrototypeForTag(a))}function c(a){return a&&a.indexOf("-")>=0}var d=a.extend,e=a.api,f=a.queue,g=a.whenReady,h=a.getRegisteredPrototype,i=a.waitingForPrototype,j=d(Object.create(HTMLElement.prototype),{createdCallback:function(){this.getAttribute("name")&&this.init()},init:function(){this.name=this.getAttribute("name"),this.extends=this.getAttribute("extends"),f.wait(this),this.loadResources(),this.registerWhenReady()},registerWhenReady:function(){this.registered||this.waitingForPrototype(this.name)||this.waitingForQueue()||this.waitingForResources()||f.go(this)},_register:function(){c(this.extends)&&!b(this.extends)&&console.warn("%s is attempting to extend %s, an unregistered element or one that was not registered with Polymer.",this.name,this.extends),this.register(this.name,this.extends),this.registered=!0},waitingForPrototype:function(a){return h(a)?void 0:(i(a,this),this.handleNoScript(a),!0)},handleNoScript:function(a){this.hasAttribute("noscript")&&!this.noscript&&(this.noscript=!0,Polymer(a))},waitingForResources:function(){return this._needsResources},waitingForQueue:function(){return f.enqueue(this,this.registerWhenReady,this._register)},loadResources:function(){this._needsResources=!0,this.loadStyles(function(){this._needsResources=!1,this.registerWhenReady()}.bind(this))}});e.publish(e.declaration,j),g(function(){document.body.removeAttribute("unresolved"),document.dispatchEvent(new CustomEvent("polymer-ready",{bubbles:!0}))}),document.registerElement("polymer-element",{prototype:j})}(Polymer),function(a){function b(a,b){a?(document.head.appendChild(a),d(b)):b&&b()}function c(a,c){if(a&&a.length){for(var d,e,f=document.createDocumentFragment(),g=0,h=a.length;h>g&&(d=a[g]);g++)e=document.createElement("link"),e.rel="import",e.href=d,f.appendChild(e);b(f,c)}else c&&c()}var d=a.whenPolymerReady;a.import=c,a.importElements=b}(Polymer),function(){var a=document.createElement("polymer-element");a.setAttribute("name","auto-binding"),a.setAttribute("extends","template"),a.init(),Polymer("auto-binding",{createdCallback:function(){this.syntax=this.bindingDelegate=this.makeSyntax(),Polymer.whenPolymerReady(function(){this.model=this,this.setAttribute("bind",""),this.async(function(){this.marshalNodeReferences(this.parentNode),this.fire("template-bound")})}.bind(this))},makeSyntax:function(){var a=Object.create(Polymer.api.declaration.events),b=this;a.findController=function(){return b.model};var c=new PolymerExpressions,d=c.prepareBinding;return c.prepareBinding=function(b,e,f){return a.prepareEventBinding(b,e,f)||d.call(c,b,e,f)},c}})}();
//# sourceMappingURL=polymer.js.map;


  (function() {
    
    var SKIP_ID = 'meta';
    var metaData = {}, metaArray = {};

    Polymer('core-meta', {
      
      /**
       * The type of meta-data.  All meta-data with the same type with be
       * stored together.
       * 
       * @attribute type
       * @type string
       * @default 'default'
       */
      type: 'default',
      
      alwaysPrepare: true,
      
      ready: function() {
        this.register(this.id);
      },
      
      get metaArray() {
        var t = this.type;
        if (!metaArray[t]) {
          metaArray[t] = [];
        }
        return metaArray[t];
      },
      
      get metaData() {
        var t = this.type;
        if (!metaData[t]) {
          metaData[t] = {};
        }
        return metaData[t];
      },
      
      register: function(id, old) {
        if (id && id !== SKIP_ID) {
          this.unregister(this, old);
          this.metaData[id] = this;
          this.metaArray.push(this);
        }
      },
      
      unregister: function(meta, id) {
        delete this.metaData[id || meta.id];
        var i = this.metaArray.indexOf(meta);
        if (i >= 0) {
          this.metaArray.splice(i, 1);
        }
      },
      
      /**
       * Returns a list of all meta-data elements with the same type.
       * 
       * @property list
       * @type array
       * @default []
       */
      get list() {
        return this.metaArray;
      },
      
      /**
       * Retrieves meta-data by ID.
       *
       * @method byId
       * @param {String} id The ID of the meta-data to be returned.
       * @returns Returns meta-data.
       */
      byId: function(id) {
        return this.metaData[id];
      }
      
    });
    
  })();
  
;

  
    Polymer('core-iconset', {
  
      /**
       * The URL of the iconset image.
       *
       * @attribute src
       * @type string
       * @default ''
       */
      src: '',

      /**
       * The width of the iconset image. This must only be specified if the
       * icons are arranged into separate rows inside the image.
       *
       * @attribute width
       * @type number
       * @default 0
       */
      width: 0,

      /**
       * A space separated list of names corresponding to icons in the iconset
       * image file. This list must be ordered the same as the icon images
       * in the image file.
       *
       * @attribute icons
       * @type string
       * @default ''
       */
      icons: '',

      /**
       * The size of an individual icon. Note that icons must be square.
       *
       * @attribute iconSize
       * @type number
       * @default 24
       */
      iconSize: 24,

      /**
       * The horizontal offset of the icon images in the inconset src image.
       * This is typically used if the image resource contains additional images
       * beside those intended for the iconset.
       *
       * @attribute offsetX
       * @type number
       * @default 0
       */
      offsetX: 0,
      /**
       * The vertical offset of the icon images in the inconset src image.
       * This is typically used if the image resource contains additional images
       * beside those intended for the iconset.
       *
       * @attribute offsetY
       * @type number
       * @default 0
       */
      offsetY: 0,
      type: 'iconset',

      created: function() {
        this.iconMap = {};
        this.iconNames = [];
        this.themes = {};
      },
  
      ready: function() {
        // TODO(sorvell): ensure iconset's src is always relative to the main
        // document
        if (this.src && (this.ownerDocument !== document)) {
          this.src = this.resolvePath(this.src, this.ownerDocument.baseURI);
        }
        this.super();
        this.updateThemes();
      },

      iconsChanged: function() {
        var ox = this.offsetX;
        var oy = this.offsetY;
        this.icons && this.icons.split(/\s+/g).forEach(function(name, i) {
          this.iconNames.push(name);
          this.iconMap[name] = {
            offsetX: ox,
            offsetY: oy
          }
          if (ox + this.iconSize < this.width) {
            ox += this.iconSize;
          } else {
            ox = this.offsetX;
            oy += this.iconSize;
          }
        }, this);
      },

      updateThemes: function() {
        var ts = this.querySelectorAll('property[theme]');
        ts && ts.array().forEach(function(t) {
          this.themes[t.getAttribute('theme')] = {
            offsetX: parseInt(t.getAttribute('offsetX')) || 0,
            offsetY: parseInt(t.getAttribute('offsetY')) || 0
          };
        }, this);
      },

      // TODO(ffu): support retrived by index e.g. getOffset(10);
      /**
       * Returns an object containing `offsetX` and `offsetY` properties which
       * specify the pixel locaion in the iconset's src file for the given
       * `icon` and `theme`. It's uncommon to call this method. It is useful,
       * for example, to manually position a css backgroundImage to the proper
       * offset. It's more common to use the `applyIcon` method.
       *
       * @method getOffset
       * @param {String|Number} icon The name of the icon or the index of the
       * icon within in the icon image.
       * @param {String} theme The name of the theme.
       * @returns {Object} An object specifying the offset of the given icon 
       * within the icon resource file; `offsetX` is the horizontal offset and
       * `offsetY` is the vertical offset. Both values are in pixel units.
       */
      getOffset: function(icon, theme) {
        var i = this.iconMap[icon];
        if (!i) {
          var n = this.iconNames[Number(icon)];
          i = this.iconMap[n];
        }
        var t = this.themes[theme];
        if (i && t) {
          return {
            offsetX: i.offsetX + t.offsetX,
            offsetY: i.offsetY + t.offsetY
          }
        }
        return i;
      },

      /**
       * Applies an icon to the given element as a css background image. This
       * method does not size the element, and it's often necessary to set 
       * the element's height and width so that the background image is visible.
       *
       * @method applyIcon
       * @param {Element} element The element to which the background is
       * applied.
       * @param {String|Number} icon The name or index of the icon to apply.
       * @param {Number} scale (optional, defaults to 1) A scaling factor 
       * with which the icon can be magnified.
       * @return {Element} The icon element.
       */
      applyIcon: function(element, icon, scale) {
        var offset = this.getOffset(icon);
        scale = scale || 1;
        if (element && offset) {
          var icon = element._icon || document.createElement('div');
          var style = icon.style;
          style.backgroundImage = 'url(' + this.src + ')';
          style.backgroundPosition = (-offset.offsetX * scale + 'px') + 
             ' ' + (-offset.offsetY * scale + 'px');
          style.backgroundSize = scale === 1 ? 'auto' :
             this.width * scale + 'px';
          if (icon.parentNode !== element) {
            element.appendChild(icon);
          }
          return icon;
        }
      }

    });

  ;

(function() {
  
  // mono-state
  var meta;
  
  Polymer('core-icon', {

    /**
     * The URL of an image for the icon. If the src property is specified,
     * the icon property should not be.
     *
     * @attribute src
     * @type string
     * @default ''
     */
    src: '',

    /**
     * Specifies the icon name or index in the set of icons available in
     * the icon's icon set. If the icon property is specified,
     * the src property should not be.
     *
     * @attribute icon
     * @type string
     * @default ''
     */
    icon: '',

    /**
     * Alternative text content for accessibility support.
     * If alt is present and not empty, it will set the element's role to img and add an aria-label whose content matches alt.
     * If alt is present and is an empty string, '', it will hide the element from the accessibility layer
     * If alt is not present, it will set the element's role to img and the element will fallback to using the icon attribute for its aria-label.
     * 
     * @attribute alt
     * @type string
     * @default ''
     */
    alt: null,

    observe: {
      'icon': 'updateIcon',
      'alt': 'updateAlt'
    },

    defaultIconset: 'icons',

    ready: function() {
      if (!meta) {
        meta = document.createElement('core-iconset');
      }

      // Allow user-provided `aria-label` in preference to any other text alternative.
      if (this.hasAttribute('aria-label')) {
        // Set `role` if it has not been overridden.
        if (!this.hasAttribute('role')) {
          this.setAttribute('role', 'img');
        }
        return;
      }
      this.updateAlt();
    },

    srcChanged: function() {
      var icon = this._icon || document.createElement('div');
      icon.textContent = '';
      icon.setAttribute('fit', '');
      icon.style.backgroundImage = 'url(' + this.src + ')';
      icon.style.backgroundPosition = 'center';
      icon.style.backgroundSize = '100%';
      if (!icon.parentNode) {
        this.appendChild(icon);
      }
      this._icon = icon;
    },

    getIconset: function(name) {
      return meta.byId(name || this.defaultIconset);
    },

    updateIcon: function(oldVal, newVal) {
      if (!this.icon) {
        this.updateAlt();
        return;
      }
      var parts = String(this.icon).split(':');
      var icon = parts.pop();
      if (icon) {
        var set = this.getIconset(parts.pop());
        if (set) {
          this._icon = set.applyIcon(this, icon);
          if (this._icon) {
            this._icon.setAttribute('fit', '');
          }
        }
      }
      // Check to see if we're using the old icon's name for our a11y fallback
      if (oldVal) {
        if (oldVal.split(':').pop() == this.getAttribute('aria-label')) {
          this.updateAlt();
        }
      }
    },

    updateAlt: function() {
      // Respect the user's decision to remove this element from
      // the a11y tree
      if (this.getAttribute('aria-hidden')) {
        return;
      }

      // Remove element from a11y tree if `alt` is empty, otherwise
      // use `alt` as `aria-label`.
      if (this.alt === '') {
        this.setAttribute('aria-hidden', 'true');
        if (this.hasAttribute('role')) {
          this.removeAttribute('role');
        }
        if (this.hasAttribute('aria-label')) {
          this.removeAttribute('aria-label');
        }
      } else {
        this.setAttribute('aria-label', this.alt ||
                                        this.icon.split(':').pop());
        if (!this.hasAttribute('role')) {
          this.setAttribute('role', 'img');
        }
        if (this.hasAttribute('aria-hidden')) {
          this.removeAttribute('aria-hidden');
        }
      }
    }

  });
  
})();
;


    Polymer('core-iconset-svg', {


      /**
       * The size of an individual icon. Note that icons must be square.
       *
       * @attribute iconSize
       * @type number
       * @default 24
       */
      iconSize: 24,
      type: 'iconset',

      created: function() {
        this._icons = {};
      },

      ready: function() {
        this.super();
        this.updateIcons();
      },

      iconById: function(id) {
        return this._icons[id] || (this._icons[id] = this.querySelector('#' + id));
      },

      cloneIcon: function(id) {
        var icon = this.iconById(id);
        if (icon) {
          var content = icon.cloneNode(true);
          content.removeAttribute('id');
          var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('viewBox', '0 0 ' + this.iconSize + ' ' +
              this.iconSize);
          // NOTE(dfreedm): work around https://crbug.com/370136
          svg.style.pointerEvents = 'none';
          svg.appendChild(content);
          return svg;
        }
      },

      get iconNames() {
        if (!this._iconNames) {
          this._iconNames = this.findIconNames();
        }
        return this._iconNames;
      },

      findIconNames: function() {
        var icons = this.querySelectorAll('[id]').array();
        if (icons.length) {
          return icons.map(function(n){ return n.id });
        }
      },

      /**
       * Applies an icon to the given element. The svg icon is added to the
       * element's shadowRoot if one exists or directly to itself.
       *
       * @method applyIcon
       * @param {Element} element The element to which the icon is
       * applied.
       * @param {String|Number} icon The name the icon to apply.
       * @return {Element} The icon element
       */
      applyIcon: function(element, icon) {
        var root = element;
        // remove old
        var old = root.querySelector('svg');
        if (old) {
          old.remove();
        }
        // install new
        var svg = this.cloneIcon(icon);
        if (!svg) {
          return;
        }
        svg.setAttribute('height', '100%');
        svg.setAttribute('width', '100%');
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svg.style.display = 'block';
        root.insertBefore(svg, root.firstElementChild);
        return svg;
      },
      
      /**
       * Tell users of the iconset, that the set has loaded.
       * This finds all elements matching the selector argument and calls 
       * the method argument on them.
       * @method updateIcons
       * @param selector {string} css selector to identify iconset users, 
       * defaults to '[icon]'
       * @param method {string} method to call on found elements, 
       * defaults to 'updateIcon'
       */
      updateIcons: function(selector, method) {
        selector = selector || '[icon]';
        method = method || 'updateIcon';
        var deep = window.ShadowDOMPolyfill ? '' : 'html /deep/ ';
        var i$ = document.querySelectorAll(deep + selector);
        for (var i=0, e; e=i$[i]; i++) {
          if (e[method]) {
            e[method].call(e);
          }
        }
      }
      

    });

  ;


  Polymer('core-item', {
    
    /**
     * The URL of an image for the icon.
     *
     * @attribute src
     * @type string
     * @default ''
     */

    /**
     * Specifies the icon from the Polymer icon set.
     *
     * @attribute icon
     * @type string
     * @default ''
     */

    /**
     * Specifies the label for the menu item.
     *
     * @attribute label
     * @type string
     * @default ''
     */

  });

;

    Polymer('core-selection', {
      /**
       * If true, multiple selections are allowed.
       *
       * @attribute multi
       * @type boolean
       * @default false
       */
      multi: false,
      ready: function() {
        this.clear();
      },
      clear: function() {
        this.selection = [];
      },
      /**
       * Retrieves the selected item(s).
       * @method getSelection
       * @returns Returns the selected item(s). If the multi property is true,
       * getSelection will return an array, otherwise it will return 
       * the selected item or undefined if there is no selection.
      */
      getSelection: function() {
        return this.multi ? this.selection : this.selection[0];
      },
      /**
       * Indicates if a given item is selected.
       * @method isSelected
       * @param {any} item The item whose selection state should be checked.
       * @returns Returns true if `item` is selected.
      */
      isSelected: function(item) {
        return this.selection.indexOf(item) >= 0;
      },
      setItemSelected: function(item, isSelected) {
        if (item !== undefined && item !== null) {
          if (isSelected) {
            this.selection.push(item);
          } else {
            var i = this.selection.indexOf(item);
            if (i >= 0) {
              this.selection.splice(i, 1);
            }
          }
          this.fire("core-select", {isSelected: isSelected, item: item});
        }
      },
      /**
       * Set the selection state for a given `item`. If the multi property
       * is true, then the selected state of `item` will be toggled; otherwise
       * the `item` will be selected.
       * @method select
       * @param {any} item: The item to select.
      */
      select: function(item) {
        if (this.multi) {
          this.toggle(item);
        } else if (this.getSelection() !== item) {
          this.setItemSelected(this.getSelection(), false);
          this.setItemSelected(item, true);
        }
      },
      /**
       * Toggles the selection state for `item`.
       * @method toggle
       * @param {any} item: The item to toggle.
      */
      toggle: function(item) {
        this.setItemSelected(item, !this.isSelected(item));
      }
    });
  ;


    Polymer('core-selector', {

      /**
       * Gets or sets the selected element.  Default to use the index
       * of the item element.
       *
       * If you want a specific attribute value of the element to be
       * used instead of index, set "valueattr" to that attribute name.
       *
       * Example:
       *
       *     <core-selector valueattr="label" selected="foo">
       *       <div label="foo"></div>
       *       <div label="bar"></div>
       *       <div label="zot"></div>
       *     </core-selector>
       *
       * In multi-selection this should be an array of values.
       *
       * Example:
       *
       *     <core-selector id="selector" valueattr="label" multi>
       *       <div label="foo"></div>
       *       <div label="bar"></div>
       *       <div label="zot"></div>
       *     </core-selector>
       *
       *     this.$.selector.selected = ['foo', 'zot'];
       *
       * @attribute selected
       * @type Object
       * @default null
       */
      selected: null,

      /**
       * If true, multiple selections are allowed.
       *
       * @attribute multi
       * @type boolean
       * @default false
       */
      multi: false,

      /**
       * Specifies the attribute to be used for "selected" attribute.
       *
       * @attribute valueattr
       * @type string
       * @default 'name'
       */
      valueattr: 'name',

      /**
       * Specifies the CSS class to be used to add to the selected element.
       * 
       * @attribute selectedClass
       * @type string
       * @default 'core-selected'
       */
      selectedClass: 'core-selected',

      /**
       * Specifies the property to be used to set on the selected element
       * to indicate its active state.
       *
       * @attribute selectedProperty
       * @type string
       * @default ''
       */
      selectedProperty: '',

      /**
       * Specifies the attribute to set on the selected element to indicate
       * its active state.
       *
       * @attribute selectedAttribute
       * @type string
       * @default 'active'
       */
      selectedAttribute: 'active',

      /**
       * Returns the currently selected element. In multi-selection this returns
       * an array of selected elements.
       * Note that you should not use this to set the selection. Instead use
       * `selected`.
       * 
       * @attribute selectedItem
       * @type Object
       * @default null
       */
      selectedItem: null,

      /**
       * In single selection, this returns the model associated with the
       * selected element.
       * Note that you should not use this to set the selection. Instead use 
       * `selected`.
       * 
       * @attribute selectedModel
       * @type Object
       * @default null
       */
      selectedModel: null,

      /**
       * In single selection, this returns the selected index.
       * Note that you should not use this to set the selection. Instead use
       * `selected`.
       *
       * @attribute selectedIndex
       * @type number
       * @default -1
       */
      selectedIndex: -1,

      /**
       * Nodes with local name that are in the list will not be included 
       * in the selection items.  In the following example, `items` returns four
       * `core-item`'s and doesn't include `h3` and `hr`.
       *
       *     <core-selector excludedLocalNames="h3 hr">
       *       <h3>Header</h3>
       *       <core-item>Item1</core-item>
       *       <core-item>Item2</core-item>
       *       <hr>
       *       <core-item>Item3</core-item>
       *       <core-item>Item4</core-item>
       *     </core-selector>
       *
       * @attribute excludedLocalNames
       * @type string
       * @default ''
       */
      excludedLocalNames: '',

      /**
       * The target element that contains items.  If this is not set 
       * core-selector is the container.
       * 
       * @attribute target
       * @type Object
       * @default null
       */
      target: null,

      /**
       * This can be used to query nodes from the target node to be used for 
       * selection items.  Note this only works if `target` is set
       * and is not `core-selector` itself.
       *
       * Example:
       *
       *     <core-selector target="{{$.myForm}}" itemsSelector="input[type=radio]"></core-selector>
       *     <form id="myForm">
       *       <label><input type="radio" name="color" value="red"> Red</label> <br>
       *       <label><input type="radio" name="color" value="green"> Green</label> <br>
       *       <label><input type="radio" name="color" value="blue"> Blue</label> <br>
       *       <p>color = {{color}}</p>
       *     </form>
       * 
       * @attribute itemsSelector
       * @type string
       * @default ''
       */
      itemsSelector: '',

      /**
       * The event that would be fired from the item element to indicate
       * it is being selected.
       *
       * @attribute activateEvent
       * @type string
       * @default 'tap'
       */
      activateEvent: 'tap',

      /**
       * Set this to true to disallow changing the selection via the
       * `activateEvent`.
       *
       * @attribute notap
       * @type boolean
       * @default false
       */
      notap: false,

      defaultExcludedLocalNames: 'template',

      ready: function() {
        this.activateListener = this.activateHandler.bind(this);
        this.itemFilter = this.filterItem.bind(this);
        this.excludedLocalNamesChanged();
        this.observer = new MutationObserver(this.updateSelected.bind(this));
        if (!this.target) {
          this.target = this;
        }
      },

      /**
       * Returns an array of all items.
       *
       * @property items
       */
      get items() {
        if (!this.target) {
          return [];
        }
        var nodes = this.target !== this ? (this.itemsSelector ? 
            this.target.querySelectorAll(this.itemsSelector) : 
                this.target.children) : this.$.items.getDistributedNodes();
        return Array.prototype.filter.call(nodes, this.itemFilter);
      },

      filterItem: function(node) {
        return !this._excludedNames[node.localName];
      },

      excludedLocalNamesChanged: function() {
        this._excludedNames = {};
        var s = this.defaultExcludedLocalNames;
        if (this.excludedLocalNames) {
          s += ' ' + this.excludedLocalNames;
        }
        s.split(/\s+/g).forEach(function(n) {
          this._excludedNames[n] = 1;
        }, this);
      },

      targetChanged: function(old) {
        if (old) {
          this.removeListener(old);
          this.observer.disconnect();
          this.clearSelection();
        }
        if (this.target) {
          this.addListener(this.target);
          this.observer.observe(this.target, {childList: true});
          this.updateSelected();
        }
      },

      addListener: function(node) {
        Polymer.addEventListener(node, this.activateEvent, this.activateListener);
      },

      removeListener: function(node) {
        Polymer.removeEventListener(node, this.activateEvent, this.activateListener);
      },

      /**
       * Returns the selected item(s). If the `multi` property is true,
       * this will return an array, otherwise it will return 
       * the selected item or undefined if there is no selection.
       */
      get selection() {
        return this.$.selection.getSelection();
      },

      selectedChanged: function() {
        this.updateSelected();
      },

      updateSelected: function() {
        this.validateSelected();
        if (this.multi) {
          this.clearSelection();
          this.selected && this.selected.forEach(function(s) {
            this.valueToSelection(s);
          }, this);
        } else {
          this.valueToSelection(this.selected);
        }
      },

      validateSelected: function() {
        // convert to an array for multi-selection
        if (this.multi && !Array.isArray(this.selected) && 
            this.selected !== null && this.selected !== undefined) {
          this.selected = [this.selected];
        }
      },

      clearSelection: function() {
        if (this.multi) {
          this.selection.slice().forEach(function(s) {
            this.$.selection.setItemSelected(s, false);
          }, this);
        } else {
          this.$.selection.setItemSelected(this.selection, false);
        }
        this.selectedItem = null;
        this.$.selection.clear();
      },

      valueToSelection: function(value) {
        var item = (value === null || value === undefined) ? 
            null : this.items[this.valueToIndex(value)];
        this.$.selection.select(item);
      },

      updateSelectedItem: function() {
        this.selectedItem = this.selection;
      },

      selectedItemChanged: function() {
        if (this.selectedItem) {
          var t = this.selectedItem.templateInstance;
          this.selectedModel = t ? t.model : undefined;
        } else {
          this.selectedModel = null;
        }
        this.selectedIndex = this.selectedItem ? 
            parseInt(this.valueToIndex(this.selected)) : -1;
      },

      valueToIndex: function(value) {
        // find an item with value == value and return it's index
        for (var i=0, items=this.items, c; (c=items[i]); i++) {
          if (this.valueForNode(c) == value) {
            return i;
          }
        }
        // if no item found, the value itself is probably the index
        return value;
      },

      valueForNode: function(node) {
        return node[this.valueattr] || node.getAttribute(this.valueattr);
      },

      // events fired from <core-selection> object
      selectionSelect: function(e, detail) {
        this.updateSelectedItem();
        if (detail.item) {
          this.applySelection(detail.item, detail.isSelected);
        }
      },

      applySelection: function(item, isSelected) {
        if (this.selectedClass) {
          item.classList.toggle(this.selectedClass, isSelected);
        }
        if (this.selectedProperty) {
          item[this.selectedProperty] = isSelected;
        }
        if (this.selectedAttribute && item.setAttribute) {
          if (isSelected) {
            item.setAttribute(this.selectedAttribute, '');
          } else {
            item.removeAttribute(this.selectedAttribute);
          }
        }
      },

      // event fired from host
      activateHandler: function(e) {
        if (!this.notap) {
          var i = this.findDistributedTarget(e.target, this.items);
          if (i >= 0) {
            var item = this.items[i];
            var s = this.valueForNode(item) || i;
            if (this.multi) {
              if (this.selected) {
                this.addRemoveSelected(s);
              } else {
                this.selected = [s];
              }
            } else {
              this.selected = s;
            }
            this.asyncFire('core-activate', {item: item});
          }
        }
      },

      addRemoveSelected: function(value) {
        var i = this.selected.indexOf(value);
        if (i >= 0) {
          this.selected.splice(i, 1);
        } else {
          this.selected.push(value);
        }
        this.valueToSelection(value);
      },

      findDistributedTarget: function(target, nodes) {
        // find first ancestor of target (including itself) that
        // is in nodes, if any
        while (target && target != this) {
          var i = Array.prototype.indexOf.call(nodes, target);
          if (i >= 0) {
            return i;
          }
          target = target.parentNode;
        }
      },
      
      selectIndex: function(index) {
        var item = this.items[index];
        if (item) {
          this.selected = this.valueForNode(item) || index;
          return item;
        }
      },
      
      /**
       * Selects the previous item.  This should be used in single selection only.
       *
       * @method selectPrevious
       * @param {boolean} wrap if true and it is already at the first item, wrap to the end
       * @returns the previous item or undefined if there is none
       */
      selectPrevious: function(wrap) {
        var i = wrap && !this.selectedIndex ? this.items.length - 1 : this.selectedIndex - 1;
        return this.selectIndex(i);
      },
      
      /**
       * Selects the next item.  This should be used in single selection only.
       *
       * @method selectNext
       * @param {boolean} wrap if true and it is already at the last item, wrap to the front
       * @returns the next item or undefined if there is none
       */
      selectNext: function(wrap) {
        var i = wrap && this.selectedIndex >= this.items.length - 1 ? 0 : this.selectedIndex + 1;
        return this.selectIndex(i);
      }
      
    });
  ;
Polymer('core-menu');;


  Polymer('core-collapse', {

    /**
     * Fired when the `core-collapse`'s `opened` property changes.
     * 
     * @event core-collapse-open
     */

    /**
     * Fired when the target element has been resized as a result of the opened
     * state changing.
     * 
     * @event core-resize
     */

    /**
     * The target element.
     *
     * @attribute target
     * @type object
     * @default null
     */
    target: null,

    /**
     * If true, the orientation is horizontal; otherwise is vertical.
     *
     * @attribute horizontal
     * @type boolean
     * @default false
     */
    horizontal: false,

    /**
     * Set opened to true to show the collapse element and to false to hide it.
     *
     * @attribute opened
     * @type boolean
     * @default false
     */
    opened: false,

    /**
     * Collapsing/expanding animation duration in second.
     *
     * @attribute duration
     * @type number
     * @default 0.33
     */
    duration: 0.33,

    /**
     * If true, the size of the target element is fixed and is set
     * on the element.  Otherwise it will try to 
     * use auto to determine the natural size to use
     * for collapsing/expanding.
     *
     * @attribute fixedSize
     * @type boolean
     * @default false
     */
    fixedSize: false,

    created: function() {
      this.transitionEndListener = this.transitionEnd.bind(this);
    },
    
    ready: function() {
      this.target = this.target || this;
    },

    domReady: function() {
      this.async(function() {
        this.afterInitialUpdate = true;
      });
    },

    detached: function() {
      if (this.target) {
        this.removeListeners(this.target);
      }
    },

    targetChanged: function(old) {
      if (old) {
        this.removeListeners(old);
      }
      if (!this.target) {
        return;
      }
      this.isTargetReady = !!this.target;
      this.classList.toggle('core-collapse-closed', this.target !== this);
      this.target.style.overflow = 'hidden';
      this.horizontalChanged();
      this.addListeners(this.target);
      // set core-collapse-closed class initially to hide the target
      this.toggleClosedClass(true);
      this.update();
    },

    addListeners: function(node) {
      node.addEventListener('transitionend', this.transitionEndListener);
    },

    removeListeners: function(node) {
      node.removeEventListener('transitionend', this.transitionEndListener);
    },

    horizontalChanged: function() {
      this.dimension = this.horizontal ? 'width' : 'height';
    },

    openedChanged: function() {
      this.update();
      this.fire('core-collapse-open', this.opened);
    },

    /**
     * Toggle the opened state.
     *
     * @method toggle
     */
    toggle: function() {
      this.opened = !this.opened;
    },

    setTransitionDuration: function(duration) {
      var s = this.target.style;
      s.transition = duration ? (this.dimension + ' ' + duration + 's') : null;
      if (duration === 0) {
        this.async('transitionEnd');
      }
    },

    transitionEnd: function() {
      if (this.opened && !this.fixedSize) {
        this.updateSize('auto', null);
      }
      this.setTransitionDuration(null);
      this.toggleClosedClass(!this.opened);
      this.asyncFire('core-resize', null, this.target);
    },

    toggleClosedClass: function(closed) {
      this.hasClosedClass = closed;
      this.target.classList.toggle('core-collapse-closed', closed);
    },

    updateSize: function(size, duration, forceEnd) {
      this.setTransitionDuration(duration);
      this.calcSize();
      var s = this.target.style;
      var nochange = s[this.dimension] === size;
      s[this.dimension] = size;
      // transitonEnd will not be called if the size has not changed
      if (forceEnd && nochange) {
        this.transitionEnd();
      }
    },

    update: function() {
      if (!this.target) {
        return;
      }
      if (!this.isTargetReady) {
        this.targetChanged(); 
      }
      this.horizontalChanged();
      this[this.opened ? 'show' : 'hide']();
    },

    calcSize: function() {
      return this.target.getBoundingClientRect()[this.dimension] + 'px';
    },

    getComputedSize: function() {
      return getComputedStyle(this.target)[this.dimension];
    },

    show: function() {
      this.toggleClosedClass(false);
      // for initial update, skip the expanding animation to optimize
      // performance e.g. skip calcSize
      if (!this.afterInitialUpdate) {
        this.transitionEnd();
        return;
      }
      if (!this.fixedSize) {
        this.updateSize('auto', null);
        var s = this.calcSize();
        if (s == '0px') {
          this.transitionEnd();
          return;
        }
        this.updateSize(0, null);
      }
      this.async(function() {
        this.updateSize(this.size || s, this.duration, true);
      });
    },

    hide: function() {
      // don't need to do anything if it's already hidden
      if (this.hasClosedClass && !this.fixedSize) {
        return;
      }
      if (this.fixedSize) {
        // save the size before hiding it
        this.size = this.getComputedSize();
      } else {
        this.updateSize(this.calcSize(), null);
      }
      this.async(function() {
        this.updateSize(0, this.duration);
      });
    }

  });

;


  Polymer('core-submenu', {

    publish: {
      active: {value: false, reflect: true}
    },

    opened: false,

    get items() {
      return this.$.submenu.items;
    },

    hasItems: function() {
      return !!this.items.length;
    },

    unselectAllItems: function() {
      this.$.submenu.selected = null;
      this.$.submenu.clearSelection();
    },

    activeChanged: function() {
      if (this.hasItems()) {
        this.opened = this.active;
      }
      if (!this.active) {
        this.unselectAllItems();
      }
    },
    
    toggle: function() {
      this.opened = !this.opened;
    },

    activate: function() {
      if (this.hasItems() && this.active) {
        this.toggle();
        this.unselectAllItems();
      }
    }
    
  });

;

    Polymer('paper-focusable', {

      publish: {

        /**
         * If true, the button is currently active either because the
         * user is holding down the button, or the button is a toggle
         * and is currently in the active state.
         *
         * @attribute active
         * @type boolean
         * @default false
         */
        active: {value: false, reflect: true},

        /**
         * If true, the element currently has focus due to keyboard
         * navigation.
         *
         * @attribute focused
         * @type boolean
         * @default false
         */
        focused: {value: false, reflect: true},

        /**
         * If true, the user is currently holding down the button.
         *
         * @attribute pressed
         * @type boolean
         * @default false
         */
        pressed: {value: false, reflect: true},

        /**
         * If true, the user cannot interact with this element.
         *
         * @attribute disabled
         * @type boolean
         * @default false
         */
        disabled: {value: false, reflect: true},

        /**
         * If true, the button toggles the active state with each tap.
         * Otherwise, the button becomes active when the user is holding
         * it down.
         *
         * @attribute isToggle
         * @type boolean
         * @default false
         */
        isToggle: {value: false, reflect: false}

      },

      disabledChanged: function() {
        if (this.disabled) {
          this.removeAttribute('tabindex');
        } else {
          this.setAttribute('tabindex', 0);
        }
      },

      downAction: function() {
        this.pressed = true;
        this.focused = false;

        if (this.isToggle) {
          this.active = !this.active;
        } else {
          this.active = true;
        }
      },

      // Pulling up the context menu for an item should focus it; but we need to
      // be careful about how we deal with down/up events surrounding context
      // menus. The up event typically does not fire until the context menu
      // closes: so we focus immediately.
      //
      // This fires _after_ downAction.
      contextMenuAction: function(e) {
        // Note that upAction may fire _again_ on the actual up event.
        this.upAction(e);
        this.focusAction();
      },

      upAction: function() {
        this.pressed = false;

        if (!this.isToggle) {
          this.active = false;
        }
      },

      focusAction: function() {
        if (!this.pressed) {
          // Only render the "focused" state if the element gains focus due to
          // keyboard navigation.
          this.focused = true;
        }
      },

      blurAction: function() {
        this.focused = false;
      }

    });

  ;


  (function() {

    var waveMaxRadius = 150;
    //
    // INK EQUATIONS
    //
    function waveRadiusFn(touchDownMs, touchUpMs, anim) {
      // Convert from ms to s.
      var touchDown = touchDownMs / 1000;
      var touchUp = touchUpMs / 1000;
      var totalElapsed = touchDown + touchUp;
      var ww = anim.width, hh = anim.height;
      // use diagonal size of container to avoid floating point math sadness
      var waveRadius = Math.min(Math.sqrt(ww * ww + hh * hh), waveMaxRadius) * 1.1 + 5;
      var duration = 1.1 - .2 * (waveRadius / waveMaxRadius);
      var tt = (totalElapsed / duration);

      var size = waveRadius * (1 - Math.pow(80, -tt));
      return Math.abs(size);
    }

    function waveOpacityFn(td, tu, anim) {
      // Convert from ms to s.
      var touchDown = td / 1000;
      var touchUp = tu / 1000;
      var totalElapsed = touchDown + touchUp;

      if (tu <= 0) {  // before touch up
        return anim.initialOpacity;
      }
      return Math.max(0, anim.initialOpacity - touchUp * anim.opacityDecayVelocity);
    }

    function waveOuterOpacityFn(td, tu, anim) {
      // Convert from ms to s.
      var touchDown = td / 1000;
      var touchUp = tu / 1000;

      // Linear increase in background opacity, capped at the opacity
      // of the wavefront (waveOpacity).
      var outerOpacity = touchDown * 0.3;
      var waveOpacity = waveOpacityFn(td, tu, anim);
      return Math.max(0, Math.min(outerOpacity, waveOpacity));
    }

    // Determines whether the wave should be completely removed.
    function waveDidFinish(wave, radius, anim) {
      var waveOpacity = waveOpacityFn(wave.tDown, wave.tUp, anim);
      // If the wave opacity is 0 and the radius exceeds the bounds
      // of the element, then this is finished.
      if (waveOpacity < 0.01 && radius >= Math.min(wave.maxRadius, waveMaxRadius)) {
        return true;
      }
      return false;
    };

    function waveAtMaximum(wave, radius, anim) {
      var waveOpacity = waveOpacityFn(wave.tDown, wave.tUp, anim);
      if (waveOpacity >= anim.initialOpacity && radius >= Math.min(wave.maxRadius, waveMaxRadius)) {
        return true;
      }
      return false;
    }

    //
    // DRAWING
    //
    function drawRipple(ctx, x, y, radius, innerColor, outerColor) {
      if (outerColor) {
        ctx.fillStyle = outerColor;
        ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height);
      }
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = innerColor;
      ctx.fill();
    }

    //
    // SETUP
    //
    function createWave(elem) {
      var elementStyle = window.getComputedStyle(elem);
      var fgColor = elementStyle.color;

      var wave = {
        waveColor: fgColor,
        maxRadius: 0,
        isMouseDown: false,
        mouseDownStart: 0.0,
        mouseUpStart: 0.0,
        tDown: 0,
        tUp: 0
      };
      return wave;
    }

    function removeWaveFromScope(scope, wave) {
      if (scope.waves) {
        var pos = scope.waves.indexOf(wave);
        scope.waves.splice(pos, 1);
      }
    };

    // Shortcuts.
    var pow = Math.pow;
    var now = Date.now;
    if (window.performance && performance.now) {
      now = performance.now.bind(performance);
    }

    function cssColorWithAlpha(cssColor, alpha) {
        var parts = cssColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (typeof alpha == 'undefined') {
            alpha = 1;
        }
        if (!parts) {
          return 'rgba(255, 255, 255, ' + alpha + ')';
        }
        return 'rgba(' + parts[1] + ', ' + parts[2] + ', ' + parts[3] + ', ' + alpha + ')';
    }

    function dist(p1, p2) {
      return Math.sqrt(pow(p1.x - p2.x, 2) + pow(p1.y - p2.y, 2));
    }

    function distanceFromPointToFurthestCorner(point, size) {
      var tl_d = dist(point, {x: 0, y: 0});
      var tr_d = dist(point, {x: size.w, y: 0});
      var bl_d = dist(point, {x: 0, y: size.h});
      var br_d = dist(point, {x: size.w, y: size.h});
      return Math.max(tl_d, tr_d, bl_d, br_d);
    }

    Polymer('paper-ripple', {

      /**
       * The initial opacity set on the wave.
       *
       * @attribute initialOpacity
       * @type number
       * @default 0.25
       */
      initialOpacity: 0.25,

      /**
       * How fast (opacity per second) the wave fades out.
       *
       * @attribute opacityDecayVelocity
       * @type number
       * @default 0.8
       */
      opacityDecayVelocity: 0.8,

      backgroundFill: true,
      pixelDensity: 2,

      eventDelegates: {
        down: 'downAction',
        up: 'upAction'
      },

      attached: function() {
        // create the canvas element manually becase ios
        // does not render the canvas element if it is not created in the
        // main document (component templates are created in a
        // different document). See:
        // https://bugs.webkit.org/show_bug.cgi?id=109073.
        if (!this.$.canvas) {
          var canvas = document.createElement('canvas');
          canvas.id = 'canvas';
          this.shadowRoot.appendChild(canvas);
          this.$.canvas = canvas;
        }
      },

      ready: function() {
        this.waves = [];
      },

      setupCanvas: function() {
        this.$.canvas.setAttribute('width', this.$.canvas.clientWidth * this.pixelDensity + "px");
        this.$.canvas.setAttribute('height', this.$.canvas.clientHeight * this.pixelDensity + "px");
        var ctx = this.$.canvas.getContext('2d');
        ctx.scale(this.pixelDensity, this.pixelDensity);
        if (!this._loop) {
          this._loop = this.animate.bind(this, ctx);
        }
      },

      downAction: function(e) {
        this.setupCanvas();
        var wave = createWave(this.$.canvas);

        this.cancelled = false;
        wave.isMouseDown = true;
        wave.tDown = 0.0;
        wave.tUp = 0.0;
        wave.mouseUpStart = 0.0;
        wave.mouseDownStart = now();

        var width = this.$.canvas.width / 2; // Retina canvas
        var height = this.$.canvas.height / 2;
        var rect = this.getBoundingClientRect();
        var touchX = e.x - rect.left;
        var touchY = e.y - rect.top;

        wave.startPosition = {x:touchX, y:touchY};

        if (this.classList.contains("recenteringTouch")) {
          wave.endPosition = {x: width / 2,  y: height / 2};
          wave.slideDistance = dist(wave.startPosition, wave.endPosition);
        }
        wave.containerSize = Math.max(width, height);
        wave.maxRadius = distanceFromPointToFurthestCorner(wave.startPosition, {w: width, h: height});
        this.waves.push(wave);
        requestAnimationFrame(this._loop);
      },

      upAction: function() {
        for (var i = 0; i < this.waves.length; i++) {
          // Declare the next wave that has mouse down to be mouse'ed up.
          var wave = this.waves[i];
          if (wave.isMouseDown) {
            wave.isMouseDown = false
            wave.mouseUpStart = now();
            wave.mouseDownStart = 0;
            wave.tUp = 0.0;
            break;
          }
        }
        this._loop && requestAnimationFrame(this._loop);
      },

      cancel: function() {
        this.cancelled = true;
      },

      animate: function(ctx) {
        var shouldRenderNextFrame = false;

        // Clear the canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        var deleteTheseWaves = [];
        // The oldest wave's touch down duration
        var longestTouchDownDuration = 0;
        var longestTouchUpDuration = 0;
        // Save the last known wave color
        var lastWaveColor = null;
        // wave animation values
        var anim = {
          initialOpacity: this.initialOpacity,
          opacityDecayVelocity: this.opacityDecayVelocity,
          height: ctx.canvas.height,
          width: ctx.canvas.width
        }

        for (var i = 0; i < this.waves.length; i++) {
          var wave = this.waves[i];

          if (wave.mouseDownStart > 0) {
            wave.tDown = now() - wave.mouseDownStart;
          }
          if (wave.mouseUpStart > 0) {
            wave.tUp = now() - wave.mouseUpStart;
          }

          // Determine how long the touch has been up or down.
          var tUp = wave.tUp;
          var tDown = wave.tDown;
          longestTouchDownDuration = Math.max(longestTouchDownDuration, tDown);
          longestTouchUpDuration = Math.max(longestTouchUpDuration, tUp);

          // Obtain the instantenous size and alpha of the ripple.
          var radius = waveRadiusFn(tDown, tUp, anim);
          var waveAlpha =  waveOpacityFn(tDown, tUp, anim);
          var waveColor = cssColorWithAlpha(wave.waveColor, waveAlpha);
          lastWaveColor = wave.waveColor;

          // Position of the ripple.
          var x = wave.startPosition.x;
          var y = wave.startPosition.y;

          // Ripple gravitational pull to the center of the canvas.
          if (wave.endPosition) {

            // This translates from the origin to the center of the view  based on the max dimension of  
            var translateFraction = Math.min(1, radius / wave.containerSize * 2 / Math.sqrt(2) );

            x += translateFraction * (wave.endPosition.x - wave.startPosition.x);
            y += translateFraction * (wave.endPosition.y - wave.startPosition.y);
          }

          // If we do a background fill fade too, work out the correct color.
          var bgFillColor = null;
          if (this.backgroundFill) {
            var bgFillAlpha = waveOuterOpacityFn(tDown, tUp, anim);
            bgFillColor = cssColorWithAlpha(wave.waveColor, bgFillAlpha);
          }

          // Draw the ripple.
          drawRipple(ctx, x, y, radius, waveColor, bgFillColor);

          // Determine whether there is any more rendering to be done.
          var maximumWave = waveAtMaximum(wave, radius, anim);
          var waveDissipated = waveDidFinish(wave, radius, anim);
          var shouldKeepWave = !waveDissipated || maximumWave;
          var shouldRenderWaveAgain = !waveDissipated && !maximumWave;
          shouldRenderNextFrame = shouldRenderNextFrame || shouldRenderWaveAgain;
          if (!shouldKeepWave || this.cancelled) {
            deleteTheseWaves.push(wave);
          }
       }

        if (shouldRenderNextFrame) {
          requestAnimationFrame(this._loop);
        }

        for (var i = 0; i < deleteTheseWaves.length; ++i) {
          var wave = deleteTheseWaves[i];
          removeWaveFromScope(this, wave);
        }

        if (!this.waves.length) {
          // If there is nothing to draw, clear any drawn waves now because
          // we're not going to get another requestAnimationFrame any more.
          ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
          this._loop = null;
        }
      }

    });

  })();

;

    Polymer('paper-shadow', {

      publish: {
        /**
         * If set, the shadow is applied to this node.
         *
         * @attribute target
         * @type Element
         * @default null
         */
        target: {value: null, reflect: true},

        /**
         * The z-depth of this shadow, from 0-5.
         *
         * @attribute z
         * @type number
         * @default 1
         */
        z: {value: 1, reflect: true},

        /**
         * If true, the shadow animates between z-depth changes.
         *
         * @attribute animated
         * @type boolean
         * @default false
         */
        animated: {value: false, reflect: true},

        /**
         * Workaround: getComputedStyle is wrong sometimes so `paper-shadow`
         * may overwrite the `position` CSS property. Set this property to
         * true to prevent this.
         *
         * @attribute hasPosition
         * @type boolean
         * @default false
         */
        hasPosition: {value: false}
      },

      // NOTE: include template so that styles are loaded, but remove
      // so that we can decide dynamically what part to include
      registerCallback: function(polymerElement) {
        var template = polymerElement.querySelector('template');
        this._style = template.content.querySelector('style');
        this._style.removeAttribute('no-shim');
      },

      fetchTemplate: function() {
        return null;
      },

      attached: function() {
        this.installScopeStyle(this._style);

        // If no target is bound at attach, default the target to the parent
        // element or shadow host.
        if (!this.target) {
          if (!this.parentElement && this.parentNode.host) {
            this.target = this.parentNode.host;
          } else if (this.parentElement && (window.ShadowDOMPolyfill ? this.parentElement !== wrap(document.body) : this.parentElement !== document.body)) {
            this.target = this.parentElement;
          }
        }
      },

      targetChanged: function(old) {
        if (old) {
          this.removeShadow(old);
        }
        if (this.target) {
          this.addShadow(this.target);
        }
      },

      zChanged: function(old) {
        if (this.target && this.target._paperShadow) {
          var shadow = this.target._paperShadow;
          ['top', 'bottom'].forEach(function(s) {
            shadow[s].classList.remove('paper-shadow-' + s + '-z-' + old);
            shadow[s].classList.add('paper-shadow-' + s + '-z-' + this.z);
          }.bind(this));
        }
      },

      animatedChanged: function() {
        if (this.target && this.target._paperShadow) {
          var shadow = this.target._paperShadow;
          ['top', 'bottom'].forEach(function(s) {
            if (this.animated) {
              shadow[s].classList.add('paper-shadow-animated');
            } else {
              shadow[s].classList.remove('paper-shadow-animated');
            }
          }.bind(this));
        }
      },

      addShadow: function(node) {
        if (node._paperShadow) {
          return;
        }

        var computed = getComputedStyle(node);
        if (!this.hasPosition && computed.position === 'static') {
          node.style.position = 'relative';
        }
        node.style.overflow = 'visible';

        // Both the top and bottom shadows are children of the target, so
        // it does not affect the classes and CSS properties of the target.
        ['top', 'bottom'].forEach(function(s) {
          var inner = (node._paperShadow && node._paperShadow[s]) || document.createElement('div');
          inner.classList.add('paper-shadow');
          inner.classList.add('paper-shadow-' + s + '-z-' + this.z);
          if (this.animated) {
            inner.classList.add('paper-shadow-animated');
          }

          if (node.shadowRoot) {
            node.shadowRoot.insertBefore(inner, node.shadowRoot.firstChild);
          } else {
            node.insertBefore(inner, node.firstChild);
          }

          node._paperShadow = node._paperShadow || {};
          node._paperShadow[s] = inner;
        }.bind(this));

      },

      removeShadow: function(node) {
        if (!node._paperShadow) {
          return;
        }

        ['top', 'bottom'].forEach(function(s) {
          node._paperShadow[s].remove();
        });
        node._paperShadow = null;

        node.style.position = null;
      }

    });
  ;

    Polymer('paper-button', {

      publish: {

        /**
         * The label of the button.
         *
         * @attribute label
         * @type string
         * @default ''
         */
        label: '',

        /**
         * If true, the button will be styled as a "raised" button.
         *
         * @attribute raisedButton
         * @type boolean
         * @default false
         */
        raisedButton: {value: false, reflect: true},

        /**
         * (optional) The URL of an image for an icon to use in the button.
         * Should not use `icon` property if you are using this property.
         *
         * @attribute iconSrc
         * @type string
         * @default ''
         */
         iconSrc: '',

         /**
          * (optional) Specifies the icon name or index in the set of icons
          * available in the icon set. If using this property, load the icon
          * set separately where the icon is used. Should not use `src`
          * if you are using this property.
          *
          * @attribute icon
          * @type string
          * @default ''
          */
         icon: ''

      },

      z: 1,

      attached: function() {
        if (this.textContent && !this.textContent.match(/\s+/)) {
          console.warn('Using textContent to label the button is deprecated. Use the "label" property instead');
          this.label = this.textContent;
        }
      },

      activeChanged: function() {
        this.super();

        if (this.active) {
          // FIXME: remove when paper-ripple can have a default 'down' state.
          if (!this.lastEvent) {
            var rect = this.getBoundingClientRect();
            this.lastEvent = {
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2
            }
          }
          this.$.ripple.downAction(this.lastEvent);
        } else {
          this.$.ripple.upAction();
        }
        this.adjustZ();
      },

      focusedChanged: function() {
        this.super();
        this.adjustZ();
      },

      disabledChanged: function() {
        this.super();
        this.adjustZ();
      },

      // waitForSpillCompleted: function(callback) {
      //   this.async(callback, null, (this.$.ink.spillCompleted ? 0 : this.duration));
      // },

      // resetInk: function() {
      //   this.active = false;
      //   this.$.ink.reset();
      // },

      insideButton: function(x, y) {
        var rect = this.getBoundingClientRect();
        return (rect.left <= x) && (x <= rect.right) && (rect.top <= y) && (y <= rect.bottom);
      },

      adjustZ: function() {
        if (this.focused) {
          this.classList.add('paper-shadow-animate-z-1-z-2');
        } else {
          this.classList.remove('paper-shadow-animate-z-1-z-2');

          if (this.active) {
            this.z = 2;
          } else if (this.disabled) {
            this.z = 0;
          } else {
            this.z = 1;
          }

        }
      },

      downAction: function(e) {
        this.super(e);
        this.lastEvent = e;
      },

      labelChanged: function() {
        this.setAttribute('aria-label', this.label);
      }

    });
  ;

  
    Polymer('paper-icon-button', {

      publish: {

        /**
         * If true, the ripple expands to a square to fill the containing box.
         *
         * @attribute fill
         * @type boolean
         * @default false
         */
        fill: {value: false, reflect: true}

      },

      ready: function() {
        this.$.ripple.classList.add('recenteringTouch');
        this.fillChanged();
      },

      fillChanged: function() {
        this.$.ripple.classList.toggle('circle', !this.fill);
      },

      iconChanged: function(oldIcon) {
        if (!this.label) {
          this.setAttribute('aria-label', this.icon);
        }
      }

    });
    
  ;
Polymer('esis-attribute-name');;
Polymer('core-toolbar');;

    Polymer('core-media-query', {

      /**
       * The Boolean return value of the media query
       *
       * @attribute queryMatches
       * @type Boolean
       * @default false
       */
      queryMatches: false,

      /**
       * The CSS media query to evaulate
       *
       * @attribute query
       * @type string
       * @default ''
       */
      query: '',
      ready: function() {
        this._mqHandler = this.queryHandler.bind(this);
        this._mq = null;
      },
      queryChanged: function() {
        if (this._mq) {
          this._mq.removeListener(this._mqHandler);
        }
        var query = this.query;
        if (query[0] !== '(') {
          query = '(' + this.query + ')';
        }
        this._mq = window.matchMedia(query);
        this._mq.addListener(this._mqHandler);
        this.queryHandler(this._mq);
      },
      queryHandler: function(mq) {
        this.queryMatches = mq.matches;
        this.asyncFire('core-media-change', mq);
      }
    });
  ;


  Polymer('core-drawer-panel', {
    /**
     * Fired when the narrow layout changes.
     * 
     * @event core-responsive-change
     * @param {Object} detail
     * @param {boolean} detail.narrow true if the panel is in narrow layout.
     */

    publish: {
      
      /**
       * Width of the drawer panel.
       *
       * @attribute drawerWidth
       * @type string
       * @default '256px'
       */
      drawerWidth: '256px',
      
      /**
       * Max-width when the panel changes to narrow layout.
       *
       * @attribute responsiveWidth
       * @type string
       * @default '640px'
       */
      responsiveWidth: '640px',
      
      /**
       * The panel that is being selected. `drawer` for the drawer panel and
       * `main` for the main panel.
       *
       * @attribute selected
       * @type string
       * @default null
       */
      selected: {value: null, reflect: true},
      
      /**
       * The panel to be selected when `core-drawer-panel` changes to narrow 
       * layout.
       *
       * @attribute defaultSelected
       * @type string
       * @default 'main'
       */
      defaultSelected: 'main',
    
      /**
       * Returns true if the panel is in narrow layout.  This is useful if you
       * need to show/hide elements based on the layout.
       *
       * @attribute narrow
       * @type boolean
       * @default false
       */
      narrow: {value: false, reflect: true},
      
      /**
       * If true, position the drawer to the right.
       *
       * @attribute rightDrawer
       * @type boolean
       * @default false
       */
      rightDrawer: false,
      
      /**
       * If true, swipe to open/close the drawer is disabled.
       *
       * @attribute disableSwipe
       * @type boolean
       * @default false
       */
      disableSwipe: false
    },
    
    eventDelegates: {
      trackstart: 'trackStart',
      trackx: 'trackx',
      trackend: 'trackEnd'
    },
    
    transition: false,

    edgeSwipeSensitivity : 15,
    
    dragging : false,
    
    domReady: function() {
      // to avoid transition at the beginning e.g. page loads
      // NOTE: domReady is already raf delayed and delaying another frame
      // ensures a layout has occurred.
      this.async(function() {
        this.transition = true;
      });
    },

    /**
     * Toggles the panel open and closed.
     * 
     * @method togglePanel
     */
    togglePanel: function() {
      this.selected = this.selected === 'main' ? 'drawer' : 'main';
    },
    
    /**
     * Opens the drawer.
     * 
     * @method openDrawer
     */
    openDrawer: function() {
      this.selected = 'drawer';
    },
    
    /**
     * Closes the drawer.
     * 
     * @method closeDrawer
     */
    closeDrawer: function() {
      this.selected = 'main';
    },

    queryMatchesChanged: function() {
      if (this.queryMatches) {
        this.selected = this.defaultSelected;
      }
      this.narrow = this.queryMatches;
      this.setAttribute('touch-action', 
          this.narrow && !this.disableSwipe ? 'pan-y' : '');
      this.fire('core-responsive-change', {narrow: this.narrow});
    },
    
    // swipe support for the drawer, inspired by
    // https://github.com/Polymer/core-drawer-panel/pull/6
    trackStart : function(e) {
      if (this.narrow && !this.disableSwipe) {
        this.dragging = true;

        if (this.selected === 'main') {
          this.dragging = this.rightDrawer ?
              e.pageX >= this.offsetWidth - this.edgeSwipeSensitivity :
              e.pageX <= this.edgeSwipeSensitivity;
        }

        if (this.dragging) {
          this.width = this.$.drawer.offsetWidth;
          this.transition = false;
          e.preventTap();
        }
      }
    },

    trackx : function(e) {
      if (this.dragging) {
        var x;
        if (this.rightDrawer) {
          x = Math.max(0, (this.selected === 'main') ? this.width + e.dx : e.dx);
        } else {
          x = Math.min(0, (this.selected === 'main') ? e.dx - this.width : e.dx);
        }
        this.moveDrawer(x);
      }
    },

    trackEnd : function(e) {
      if (this.dragging) {
        this.dragging = false;
        this.transition = true;
        this.moveDrawer(null);

        if (this.rightDrawer) {
          this.selected = e.xDirection > 0 ? 'main' : 'drawer';
        } else {
          this.selected = e.xDirection > 0 ? 'drawer' : 'main';
        }
      }
    },
    
    moveDrawer: function(translateX) {
      var s = this.$.drawer.style;
      s.webkitTransform = s.transform = 
          translateX === null ? '' : 'translate3d(' + translateX + 'px, 0, 0)';
    }

  });

;


  Polymer('core-header-panel', {
    
    /**
     * Fired when the content has been scrolled.  `details.target` returns
     * the scrollable element which you can use to access scroll info such as
     * `scrollTop`.
     *
     * @event scroll
     */

    publish: {
      /**
       * Controls header and scrolling behavior. Options are
       * `standard`, `seamed`, `waterfall`, `waterfall-tall`, 
       * `waterfall-medium-tall`, `scroll` and `cover`.
       * Default is `standard`.
       *
       * `standard`: The header is a step above the panel. The header will consume the 
       * panel at the point of entry, preventing it from passing through to the 
       * opposite side.
       *
       * `seamed`: The header is presented as seamed with the panel.
       *
       * `waterfall`: Similar to standard mode, but header is initially presented as 
       * seamed with panel, but then separates to form the step.
       *
       * `waterfall-tall`: The header is initially taller (`tall` class is added to 
       * the header).  As the user scrolls, the header separates (forming an edge)
       * while condensing (`tall` class is removed from the header).
       *
       * `scroll`: The header keeps its seam with the panel, and is pushed off screen.
       *
       * `cover`: The panel covers the whole `core-header-panel` including the
       * header. This allows user to style the panel in such a way that the panel is
       * partially covering the header.
       *
       *     <style>
       *       core-header-panel[mode=cover]::shadow #mainContainer {
       *         left: 80px;
       *       }
       *       .content {
       *         margin: 60px 60px 60px 0;
       *       }
       *     </style>
       * 
       *     <core-header-panel mode="cover">
       *       <core-appbar class="tall">
       *         <core-icon-button icon="menu"></core-icon-button>
       *       </core-appbar>
       *       <div class="content"></div>
       *     </core-header-panel>
       *
       * @attribute mode
       * @type string
       * @default ''
       */
      mode: {value: '', reflect: true},
      
      /**
       * The class used in waterfall-tall mode.  Change this if the header
       * accepts a different class for toggling height, e.g. "medium-tall"
       *
       * @attribute tallClass
       * @type string
       * @default 'tall'
       */
      tallClass: 'tall',
      
      /**
       * If true, the drop-shadow is always shown no matter what mode is set to.
       *
       * @attribute shadow
       * @type boolean
       * @default false
       */
      shadow: false
    },
    
    domReady: function() {
      this.async('scroll');
    },

    modeChanged: function() {
      this.scroll();
    },

    get header() {
      return this.$.headerContent.getDistributedNodes()[0];
    },
    
    /**
     * Returns the scrollable element.
     *
     * @property scroller
     * @type Object
     */
    get scroller() {
      return this.mode === 'scroll' ? 
          this.$.outerContainer : this.$.mainContainer;
    },
    
    scroll: function() {
      var shadowMode = {'waterfall': 1, 'waterfall-tall': 1};
      var noShadow = {'seamed': 1, 'cover': 1, 'scroll': 1};
      var tallMode = {'waterfall-tall': 1};
      
      var main = this.$.mainContainer;
      var header = this.header;
      
      var sTop = main.scrollTop;
      var atTop = sTop === 0;
      
      if (header) {
        this.$.dropShadow.classList.toggle('hidden', !this.shadow &&
            (atTop && shadowMode[this.mode] || noShadow[this.mode]));
        
        if (tallMode[this.mode]) {
          header.classList.toggle(this.tallClass, atTop || 
              main.scrollHeight < this.$.outerContainer.offsetHeight);
        }
        
        header.classList.toggle('animate', tallMode[this.mode]);
      }
      
      this.fire('scroll', {target: this.scroller}, this, false);
    }

  });

;


    Polymer('core-icon-button', {

      /**
       * The URL of an image for the icon.  Should not use `icon` property
       * if you are using this property.
       *
       * @attribute src
       * @type string
       * @default ''
       */
      src: '',

      /**
       * If true, border is placed around the button to indicate it's
       * active state.
       *
       * @attribute active
       * @type boolean
       * @default false
       */
      active: false,

      /**
       * Specifies the icon name or index in the set of icons available in
       * the icon set.  Should not use `src` property if you are using this
       * property.
       *
       * @attribute icon
       * @type string
       * @default ''
       */
      icon: '',

      activeChanged: function() {
        this.classList.toggle('selected', this.active);
      }

    });

  ;


  Polymer('esis-scaffold', {
    
    responsiveWidth: '860px',

    cEle : null,
    
    ready: function() {
      //this.boundResizeFrame = this.resizeFrame.bind(this);
      window.addEventListener('hashchange', this.parseLocationHash.bind(this));
    },
    
    domReady: function() {
      this.async(function() {
        this.parseLocationHash();
      }, null, 300);
    },
    
    parseLocationHash: function() {
      var route = window.location.hash.slice(1);
      for (var i = 0, item; item = this.$.menu.items[i]; i++) {
        if (item.getAttribute('tag') === route) {
          this.$.menu.selected = i;
          return;
        }
      }
      this.$.menu.selected = this.$.menu.selected || 0;
    },
    
    menuSelect: function(e, detail) {
      // check for back button
      if (detail.isSelected) {
        var tag = detail.item.getAttribute('tag');

        if( tag == 'back' ) {
          if( confirm('Are you sure you want to exit the dataset editor?') ) {
            var url = '/dataset';
            if( document.querySelector('esis-dataset-loader').pkgid ) {
              url += '/'+document.querySelector('esis-dataset-loader').pkgid;
            }
            window.location = url;
          } else {
            return;
          }
        }
      }

      if (detail.isSelected) {
        this.item = detail.item;

        if (this.item.children.length) {
          this.item.selected = 0;
        }
        this.item.tag = this.item.getAttribute('tag');
        
        if( this.cEle ) this.cEle.style.display = 'none';
        this.cEle = this.item.esisComponent;
        this.cEle.style.display = 'block';
        if( !this.cEle.isAttached ) {
          this.cEle.isAttached = true;
          this.$.elementRoot.appendChild(this.item.esisComponent);
        }
        if( this.cEle.onShow ) this.cEle.onShow();
        
        window.location.hash = this.item.tag;
       
        
        if (this.narrow) {
          this.$.drawerPanel.closeDrawer();
        } else {
          this.animateCard();
        }
      }
    },
    
    animateCard: function() {
      this.$.card.classList.remove('move-up');
      this.$.card.style.display = 'none';
      this.async(function() {
        this.$.card.style.display = 'block';
        this.moveCard(this.$.mainHeaderPanel.offsetHeight);
        this.async(function() {
          this.$.card.classList.add('move-up');
          this.moveCard(null);
        }, null, 300);
      });
    },
    
    moveCard: function(y) {
      var s = this.$.card.style;
      s.webkitTransform = s.transform = 
          y ? 'translate3d(0, ' + y + 'px,0)' : '';
    },
    
    cardTransitionDone: function() {
      if (this.$.card.classList.contains('move-up')) {
        this.$.card.classList.remove('move-up');
        //this.updateFrameHeight();
      }
    },
    
    togglePanel: function() {
      this.$.drawerPanel.togglePanel();
    }
    
  });

;


    Polymer('core-input', {
      publish: {
        /**
         * Placeholder text that hints to the user what can be entered in
         * the input.
         *
         * @attribute placeholder
         * @type string
         * @default ''
         */
        placeholder: '',
  
        /**
         * If true, this input cannot be focused and the user cannot change
         * its value.
         *
         * @attribute disabled
         * @type boolean
         * @default false
         */
        disabled: false,
  
        /**
         * If true, the user cannot modify the value of the input.
         *
         * @attribute readonly
         * @type boolean
         * @default false
         */
        readonly: false,

        /**
         * If true, this input will automatically gain focus on page load.
         *
         * @attribute autofocus
         * @type boolean
         * @default false
         */
        autofocus: false,

        /**
         * If true, this input accepts multi-line input like a `<textarea>`
         *
         * @attribute multiline
         * @type boolean
         * @default false
         */
        multiline: false,
  
        /**
         * (multiline only) The height of this text input in rows. The input
         * will scroll internally if more input is entered beyond the size
         * of the component. This property is meaningless if multiline is
         * false. You can also set this property to "fit" and size the
         * component with CSS to make the input fit the CSS size.
         *
         * @attribute rows
         * @type number|'fit'
         * @default 'fit'
         */
        rows: 'fit',
  
        /**
         * The current value of this input. Changing inputValue programmatically
         * will cause value to be out of sync. Instead, change value directly
         * or call commit() after changing inputValue.
         *
         * @attribute inputValue
         * @type string
         * @default ''
         */
        inputValue: '',
  
        /**
         * The value of the input committed by the user, either by changing the
         * inputValue and blurring the input, or by hitting the `enter` key.
         *
         * @attribute value
         * @type string
         * @default ''
         */
        value: '',

        /**
         * Set the input type. Not supported for `multiline`.
         *
         * @attribute type
         * @type string
         * @default text
         */
        type: 'text',

        /**
         * If true, the input is invalid if its value is null.
         *
         * @attribute required
         * @type boolean
         * @default false
         */
        required: false,

        /**
         * A regular expression to validate the input value against. See
         * https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation#Validation-related_attributes
         * for more info. Not supported if `multiline` is true.
         *
         * @attribute pattern
         * @type string
         * @default '.*'
         */
        // FIXME(yvonne): The default is set to .* because we can't bind to pattern such
        // that the attribute is unset if pattern is null.
        pattern: '.*',

        /**
         * If set, the input is invalid if the value is less than this property. See
         * https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation#Validation-related_attributes
         * for more info. Not supported if `multiline` is true.
         *
         * @attribute min
         */
        min: null,

        /**
         * If set, the input is invalid if the value is greater than this property. See
         * https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation#Validation-related_attributes
         * for more info. Not supported if `multiline` is true.
         *
         * @attribute max
         */
        max: null,

        /**
         * If set, the input is invalid if the value is not `min` plus an integral multiple
         * of this property. See
         * https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation#Validation-related_attributes
         * for more info. Not supported if `multiline` is true.
         *
         * @attribute step
         */
        step: null,

        /**
         * The maximum length of the input value.
         *
         * @attribute maxlength
         * @type number
         */
        maxlength: null,
  
        /**
         * If this property is true, the text input's inputValue failed validation.
         *
         * @attribute invalid
         * @type boolean
         * @default false
         */
        invalid: false
      },

      ready: function() {
        this.handleTabindex(this.getAttribute('tabindex'));
      },

      invalidChanged: function() {
        this.classList.toggle('invalid', this.invalid);
        this.fire('input-'+ (this.invalid ? 'invalid' : 'valid'), {value: this.inputValue});
      },

      inputValueChanged: function() {
        this.updateValidity_();
      },

      valueChanged: function() {
        this.inputValue = this.value;
      },

      requiredChanged: function() {
        this.updateValidity_();
      },

      attributeChanged: function(attr, oldVal, curVal) {
        if (attr === 'tabindex') {
          this.handleTabindex(curVal);
        }
      },

      handleTabindex: function(tabindex) {
        if (tabindex > 0) {
          this.$.input.setAttribute('tabindex', -1);
        } else {
          this.$.input.removeAttribute('tabindex');
        }
      },

      /**
       * Commits the inputValue to value.
       *
       * @method commit
       */
      commit: function() {
         this.value = this.inputValue;
      },

      updateValidity_: function() {
        if (this.$.input.willValidate) {
          this.invalid = !this.$.input.validity.valid;
        }
      },

      keydownAction: function() {
        // for type = number, the value is the empty string unless the input is a valid number.
        // FIXME(yvonne): check other types
        if (this.type === 'number') {
          this.async(function() {
            this.updateValidity_();
          });
        }
      },

      inputChangeAction: function() {
        this.commit();
        if (!window.ShadowDOMPolyfill) {
          // re-fire event that does not bubble across shadow roots
          this.fire('change', null, this);
        }
      },

      focusAction: function(e) {
        if (this.getAttribute('tabindex') > 0) {
          // Forward focus to the inner input if tabindex is set on the element
          // This will not cause an infinite loop because focus will not fire on the <input>
          // again if it's already focused.
          this.$.input.focus();
        }
      },

      inputFocusAction: function(e) {
        if (window.ShadowDOMPolyfill) {
          // re-fire non-bubbling event if polyfill
          this.fire('focus', null, this, false);
        }
      },

      inputBlurAction: function() {
        if (window.ShadowDOMPolyfill) {
          // re-fire non-bubbling event
          this.fire('blur', null, this, false);
        }
      },

      blur: function() {
        // forward blur method to the internal input / textarea element
        this.$.input.blur();
      },

      click: function() {
        // forward click method to the internal input / textarea element
        this.$.input.click();
      },

      focus: function() {
        // forward focus method to the internal input / textarea element
        this.$.input.focus();
      },

      select: function() {
        // forward select method to the internal input / textarea element
        this.$.input.focus();
      },

      setSelectionRange: function(selectionStart, selectionEnd, selectionDirection) {
        // forward setSelectionRange method to the internal input / textarea element
        this.$.input.setSelectionRange(selectionStart, selectionEnd, selectionDirection);
      },

      setRangeText: function(replacement, start, end, selectMode) {
        // forward setRangeText method to the internal input element
        if (!this.multiline) {
          this.$.input.setRangeText(replacement, start, end, selectMode);
        }
      },

      stepDown: function(n) {
        // forward stepDown method to the internal input element
        if (!this.multiline) {
          this.$.input.stepDown(n);
        }
      },

      stepUp: function(n) {
        // forward stepUp method to the internal input element
        if (!this.multiline) {
          this.$.input.stepUp(n);
        }
      },

      get willValidate() {
        return this.$.input.willValidate;
      },

      get validity() {
        return this.$.input.validity;
      },

      get validationMessage() {
        return this.$.input.validationMessage;
      },

      checkValidity: function() {
        var r = this.$.input.checkValidity();
        this.updateValidity_();
        return r;
      },

      setCustomValidity: function(message) {
        this.$.input.setCustomValidity(message);
        this.updateValidity_();
      }

    });
  ;

(function() {

window.CoreStyle = window.CoreStyle || {
  g: {},
  list: {},
  refMap: {}
};

Polymer('core-style', {
  /**
   * The `id` property should be set if the `core-style` is a producer
   * of styles. In this case, the `core-style` should have text content
   * that is cssText.
   *
   * @attribute id
   * @type string
   * @default ''
   */


  publish: {
    /**
     * The `ref` property should be set if the `core-style` element is a 
     * consumer of styles. Set it to the `id` of the desired `core-style`
     * element.
     *
     * @attribute ref
     * @type string
     * @default ''
     */
    ref: ''
  },

  // static
  g: CoreStyle.g,
  refMap: CoreStyle.refMap,

  /**
   * The `list` is a map of all `core-style` producers stored by `id`. It 
   * should be considered readonly. It's useful for nesting one `core-style`
   * inside another.
   *
   * @attribute list
   * @type object (readonly)
   * @default {map of all `core-style` producers}
   */
  list: CoreStyle.list,

  // if we have an id, we provide style
  // if we have a ref, we consume/require style
  ready: function() {
    if (this.id) {
      this.provide();
    } else {
      this.registerRef(this.ref);
      if (!window.ShadowDOMPolyfill) {
        this.require();
      }  
    }
  },

  // can't shim until attached if using SD polyfill because need to find host
  attached: function() {
    if (!this.id && window.ShadowDOMPolyfill) {
      this.require();
    }
  },

  /****** producer stuff *******/

  provide: function() {
    this.register();
    // we want to do this asap, especially so we can do so before definitions
    // that use this core-style are registered.
    if (this.textContent) {
      this._completeProvide();
    } else {
      this.async(this._completeProvide);
    }
  },

  register: function() {
    var i = this.list[this.id];
    if (i) {
      if (!Array.isArray(i)) {
        this.list[this.id] = [i];
      }
      this.list[this.id].push(this);
    } else {
      this.list[this.id] = this;  
    }
  },

  // stamp into a shadowRoot so we can monitor dom of the bound output
  _completeProvide: function() {
    this.createShadowRoot();
    this.domObserver = new MutationObserver(this.domModified.bind(this))
        .observe(this.shadowRoot, {subtree: true, 
        characterData: true, childList: true});
    this.provideContent();
  },

  provideContent: function() {
    this.ensureTemplate();
    this.shadowRoot.textContent = '';
    this.shadowRoot.appendChild(this.instanceTemplate(this.template));
    this.cssText = this.shadowRoot.textContent;
  },

  ensureTemplate: function() {
    if (!this.template) {
      this.template = this.querySelector('template:not([repeat]):not([bind])');
      // move content into the template
      if (!this.template) {
        this.template = document.createElement('template');
        var n = this.firstChild;
        while (n) {
          this.template.content.appendChild(n.cloneNode(true));
          n = n.nextSibling;
        }
      }
    }
  },

  domModified: function() {
    this.cssText = this.shadowRoot.textContent;
    this.notify();
  },

  // notify instances that reference this element
  notify: function() {
    var s$ = this.refMap[this.id];
    if (s$) {
      for (var i=0, s; (s=s$[i]); i++) {
        s.require();
      }
    }
  },

  /****** consumer stuff *******/

  registerRef: function(ref) {
    //console.log('register', ref);
    this.refMap[this.ref] = this.refMap[this.ref] || [];
    this.refMap[this.ref].push(this);
  },

  applyRef: function(ref) {
    this.ref = ref;
    this.registerRef(this.ref);
    this.require();
  },

  require: function() {
    var cssText = this.cssTextForRef(this.ref);
    //console.log('require', this.ref, cssText);
    if (cssText) {
      this.ensureStyleElement();
      // do nothing if cssText has not changed
      if (this.styleElement._cssText === cssText) {
        return;
      }
      this.styleElement._cssText = cssText;
      if (window.ShadowDOMPolyfill) {
        this.styleElement.textContent = cssText;
        cssText = Platform.ShadowCSS.shimStyle(this.styleElement,
            this.getScopeSelector());
      }
      this.styleElement.textContent = cssText;
    }
  },

  cssTextForRef: function(ref) {
    var s$ = this.byId(ref);
    var cssText = '';
    if (s$) {
      if (Array.isArray(s$)) {
        var p = [];
        for (var i=0, l=s$.length, s; (i<l) && (s=s$[i]); i++) {
          p.push(s.cssText);
        }
        cssText = p.join('\n\n');
      } else {
        cssText = s$.cssText;
      }
    }
    if (s$ && !cssText) {
      console.warn('No styles provided for ref:', ref);
    }
    return cssText;
  },

  byId: function(id) {
    return this.list[id];
  },

  ensureStyleElement: function() {
    if (!this.styleElement) {
      this.styleElement = window.ShadowDOMPolyfill ? 
          this.makeShimStyle() :
          this.makeRootStyle();
    }
    if (!this.styleElement) {
      console.warn(this.localName, 'could not setup style.');
    }
  },

  makeRootStyle: function() {
    var style = document.createElement('style');
    this.appendChild(style);
    return style;
  },

  makeShimStyle: function() {
    var host = this.findHost(this);
    if (host) {
      var name = host.localName;
      var style = document.querySelector('style[' + name + '=' + this.ref +']');
      if (!style) {
        style = document.createElement('style');
        style.setAttribute(name, this.ref);
        document.head.appendChild(style);
      }
      return style;
    }
  },

  getScopeSelector: function() {
    if (!this._scopeSelector) {
      var selector = '', host = this.findHost(this);
      if (host) {
        var typeExtension = host.hasAttribute('is');
        var name = typeExtension ? host.getAttribute('is') : host.localName;
        selector = Platform.ShadowCSS.makeScopeSelector(name, 
            typeExtension);
      }
      this._scopeSelector = selector;
    }
    return this._scopeSelector;
  },

  findHost: function(node) {
    while (node.parentNode) {
      node = node.parentNode;
    }
    return node.host || wrap(document.documentElement);
  },

  /* filters! */
  // TODO(dfreedm): add more filters!

  cycle: function(rgb, amount) {
    if (rgb.match('#')) {
      var o = this.hexToRgb(rgb);
      if (!o) {
        return rgb;
      }
      rgb = 'rgb(' + o.r + ',' + o.b + ',' + o.g + ')';
    }

    function cycleChannel(v) {
      return Math.abs((Number(v) - amount) % 255);
    }

    return rgb.replace(/rgb\(([^,]*),([^,]*),([^,]*)\)/, function(m, a, b, c) {
      return 'rgb(' + cycleChannel(a) + ',' + cycleChannel(b) + ', ' 
          + cycleChannel(c) + ')';
    });
  },

  hexToRgb: function(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
  }

});


})();
;


  (function() {

    var paperInput = CoreStyle.g.paperInput = CoreStyle.g.paperInput || {};
    paperInput.focusedColor = '#4059a9';
    paperInput.invalidColor = '#d34336';

    Polymer('paper-input', {

      /**
       * The label for this input. It normally appears as grey text inside
       * the text input and disappears once the user enters text.
       *
       * @attribute label
       * @type string
       * @default ''
       */
      label: '',

      /**
       * If true, the label will "float" above the text input once the
       * user enters text instead of disappearing.
       *
       * @attribute floatingLabel
       * @type boolean
       * @default false
       */
      floatingLabel: false,

      /**
       * (multiline only) If set to a non-zero value, the height of this
       * text input will grow with the value changes until it is maxRows
       * rows tall. If the maximum size does not fit the value, the text
       * input will scroll internally.
       *
       * @attribute maxRows
       * @type number
       * @default 0
       */
      maxRows: 0,

      /**
       * The message to display if the input value fails validation. If this
       * is unset or the empty string, a default message is displayed depending
       * on the type of validation error.
       *
       * @attribute error
       * @type string
       */
      error: '',

      focused: false,
      pressed: false,

      attached: function() {
        if (this.multiline) {
          this.resizeInput();
          window.requestAnimationFrame(function() {
            this.$.underlineContainer.classList.add('animating');
          }.bind(this));
        }
      },

      resizeInput: function() {
        var height = this.$.inputClone.getBoundingClientRect().height;
        var bounded = this.maxRows > 0 || this.rows > 0;
        if (bounded) {
          var minHeight = this.$.minInputHeight.getBoundingClientRect().height;
          var maxHeight = this.$.maxInputHeight.getBoundingClientRect().height;
          height = Math.max(minHeight, Math.min(height, maxHeight));
        }
        this.$.inputContainer.style.height = height + 'px';
        this.$.underlineContainer.style.top = height + 'px';
      },

      prepareLabelTransform: function() {
        var toRect = this.$.floatedLabelSpan.getBoundingClientRect();
        var fromRect = this.$.labelSpan.getBoundingClientRect();
        if (toRect.width !== 0) {
          this.$.label.cachedTransform = 'scale(' + (toRect.width / fromRect.width) + ') ' +
            'translateY(' + (toRect.bottom - fromRect.bottom) + 'px)';
        }
      },

      toggleLabel: function(force) {
        var v = force !== undefined ? force : this.inputValue;

        if (!this.floatingLabel) {
          this.$.label.classList.toggle('hidden', v);
        }

        if (this.floatingLabel && !this.focused) {
          this.$.label.classList.toggle('hidden', v);
          this.$.floatedLabel.classList.toggle('hidden', !v);
        }
      },

      rowsChanged: function() {
        if (this.multiline && !isNaN(parseInt(this.rows))) {
          this.$.minInputHeight.innerHTML = '';
          for (var i = 0; i < this.rows; i++) {
            this.$.minInputHeight.appendChild(document.createElement('br'));
          }
          this.resizeInput();
        }
      },

      maxRowsChanged: function() {
        if (this.multiline && !isNaN(parseInt(this.maxRows))) {
          this.$.maxInputHeight.innerHTML = '';
          for (var i = 0; i < this.maxRows; i++) {
            this.$.maxInputHeight.appendChild(document.createElement('br'));
          }
          this.resizeInput();
        }
      },

      inputValueChanged: function() {
        this.super();

        if (this.multiline) {
          var escaped = this.inputValue.replace(/\n/gm, '<br>');
          if (!escaped || escaped.lastIndexOf('<br>') === escaped.length - 4) {
            escaped += '&nbsp';
          }
          this.$.inputCloneSpan.innerHTML = escaped;
          this.resizeInput();
        }

        this.toggleLabel();
      },

      labelChanged: function() {
        if (this.floatingLabel && this.$.floatedLabel && this.$.label) {
          // If the element is created programmatically, labelChanged is called before
          // binding. Run the measuring code in async so the DOM is ready.
          this.async(function() {
            this.prepareLabelTransform();
          });
        }
      },

      placeholderChanged: function() {
        this.label = this.placeholder;
      },

      inputFocusAction: function() {
        if (!this.pressed) {
          if (this.floatingLabel) {
            this.$.floatedLabel.classList.remove('hidden');
            this.$.floatedLabel.classList.add('focused');
            this.$.floatedLabel.classList.add('focusedColor');
          }
          this.$.label.classList.add('hidden');
          this.$.underlineHighlight.classList.add('focused');
          this.$.caret.classList.add('focused');

          this.super(arguments);
        }
        this.focused = true;
      },

      shouldFloatLabel: function() {
        // if type = number, the input value is the empty string until a valid number
        // is entered so we must do some hacks here
        return this.inputValue || (this.type === 'number' && !this.validity.valid);
      },

      inputBlurAction: function() {
        this.super(arguments);

        this.$.underlineHighlight.classList.remove('focused');
        this.$.caret.classList.remove('focused');

        if (this.floatingLabel) {
          this.$.floatedLabel.classList.remove('focused');
          this.$.floatedLabel.classList.remove('focusedColor');
          if (!this.shouldFloatLabel()) {
            this.$.floatedLabel.classList.add('hidden');
          }
        }

        // type = number hack. see core-input for more info
        if (!this.shouldFloatLabel()) {
          this.$.label.classList.remove('hidden');
          this.$.label.classList.add('animating');
          this.async(function() {
            this.$.label.style.webkitTransform = 'none';
            this.$.label.style.transform = 'none';
          });
        }

        this.focused = false;
      },

      downAction: function(e) {
        if (this.disabled) {
          return;
        }

        if (this.focused) {
          return;
        }

        this.pressed = true;
        var rect = this.$.underline.getBoundingClientRect();
        var right = e.x - rect.left;
        this.$.underlineHighlight.style.webkitTransformOriginX = right + 'px';
        this.$.underlineHighlight.style.transformOriginX = right + 'px';
        this.$.underlineHighlight.classList.remove('focused');
        this.underlineAsync = this.async(function() {
          this.$.underlineHighlight.classList.add('pressed');
        }, null, 200);

        // No caret animation if there is text in the input.
        if (!this.inputValue) {
          this.$.caret.classList.remove('focused');
        }
      },

      upAction: function(e) {
        if (this.disabled) {
          return;
        }

        if (!this.pressed) {
          return;
        }

        // if a touchevent caused the up, the synthentic mouseevents will blur
        // the input, make sure to prevent those from being generated.
        if (e._source === 'touch') {
          e.preventDefault();
        }

        if (this.underlineAsync) {
          clearTimeout(this.underlineAsync);
          this.underlineAsync = null;
        }

        // Focus the input here to bring up the virtual keyboard.
        this.$.input.focus();
        this.pressed = false;
        this.animating = true;

        this.$.underlineHighlight.classList.remove('pressed');
        this.$.underlineHighlight.classList.add('animating');
        this.async(function() {
          this.$.underlineHighlight.classList.add('focused');
        });

        // No caret animation if there is text in the input.
        if (!this.inputValue) {
          this.$.caret.classList.add('animating');
          this.async(function() {
            this.$.caret.classList.add('focused');
          }, null, 100);
        }

        if (this.floatingLabel) {
          this.$.label.classList.add('focusedColor');
          this.$.label.classList.add('animating');
          if (!this.$.label.cachedTransform) {
            this.prepareLabelTransform();
          }
          this.$.label.style.webkitTransform = this.$.label.cachedTransform;
          this.$.label.style.transform = this.$.label.cachedTransform;
        }
      },

      keydownAction: function() {
        this.super();

        // more type = number hacks. see core-input for more info
        if (this.type === 'number') {
          this.async(function() {
            if (!this.inputValue) {
              this.toggleLabel(!this.validity.valid);
            }
          });
        }
      },

      keypressAction: function() {
        if (this.animating) {
          this.transitionEndAction();
        }
      },

      transitionEndAction: function(e) {
        this.animating = false;
        if (this.pressed) {
          return;
        }

        if (this.focused) {

          if (this.floatingLabel || this.inputValue) {
            this.$.label.classList.add('hidden');
          }

          if (this.floatingLabel) {
            this.$.label.classList.remove('focusedColor');
            this.$.label.classList.remove('animating');
            this.$.floatedLabel.classList.remove('hidden');
            this.$.floatedLabel.classList.add('focused');
            this.$.floatedLabel.classList.add('focusedColor');
          }

          this.async(function() {
            this.$.underlineHighlight.classList.remove('animating');
            this.$.caret.classList.remove('animating');
          }, null, 100);

        } else {

          this.$.label.classList.remove('animating');

        }
      }

    });

  }());

  ;

    Polymer('esis-paper-button', {

      publish: {

        /**
         * The label of the button.
         *
         * @attribute label
         * @type string
         * @default ''
         */
        label: '',

        /**
         * If true, the button will be styled as a "raised" button.
         *
         * @attribute raisedButton
         * @type boolean
         * @default false
         */
        raisedButton: {value: false, reflect: true},

        /**
         * (optional) The URL of an image for an icon to use in the button.
         * Should not use `icon` property if you are using this property.
         *
         * @attribute iconSrc
         * @type string
         * @default ''
         */
         iconSrc: {value: ''},

         /**
          * (optional) Specifies the icon name or index in the set of icons
          * available in the icon set. If using this property, load the icon
          * set separately where the icon is used. Should not use `src`
          * if you are using this property.
          *
          * @attribute icon
          * @type string
          * @default ''
          */
         icon: {value: ''}

      },

      z: 1,

      attached: function() {
        if (this.textContent && !this.textContent.match(/\s+/)) {
          console.warn('Using textContent to label the button is deprecated. Use the "label" property instead');
          this.label = this.textContent;
        }
      },

      activeChanged: function() {
        this.super();

        if (this.active) {
          // FIXME: remove when paper-ripple can have a default 'down' state.
          if (!this.lastEvent) {
            var rect = this.getBoundingClientRect();
            this.lastEvent = {
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2
            }
          }
          this.$.ripple.downAction(this.lastEvent);
        } else {
          this.$.ripple.upAction();
        }
        this.adjustZ();
      },

      focusedChanged: function() {
        this.super();
        this.adjustZ();
      },

      disabledChanged: function() {
        this.super();
        this.adjustZ();
      },

      // waitForSpillCompleted: function(callback) {
      //   this.async(callback, null, (this.$.ink.spillCompleted ? 0 : this.duration));
      // },

      // resetInk: function() {
      //   this.active = false;
      //   this.$.ink.reset();
      // },

      insideButton: function(x, y) {
        var rect = this.getBoundingClientRect();
        return (rect.left <= x) && (x <= rect.right) && (rect.top <= y) && (y <= rect.bottom);
      },

      adjustZ: function() {
        if (this.focused) {
          this.classList.add('paper-shadow-animate-z-1-z-2');
        } else {
          this.classList.remove('paper-shadow-animate-z-1-z-2');

          if (this.active) {
            this.z = 2;
          } else if (this.disabled) {
            this.z = 0;
          } else {
            this.z = 1;
          }

        }
      },

      downAction: function(e) {
        this.super(e);
        this.lastEvent = e;
      },

      labelChanged: function() {
        this.setAttribute('aria-label', this.label);
      }

    });
  ;

        Polymer("esis-ui-token-input",{
            highlight : false,
            currentSpeech : '',

            searching : false,
            results   : [],
            tokens    : [],

            inputValue : '',

            observe : {
                inputValue : '_onInputUpdate',
                tokens     : '_onTokensUpdate'
            },
            
            created : function() {
                this.tokens = [];
                this.focus = false;
            },
            
            ready : function() {                

            },
            
            _onTokenClick : function(e) {
                var token = $(e.currentTarget).attr("token");
                if( !token ) return;
                this._fireRemove(token);
                this.removeToken(token);

                // don't set focus to input
                e.stopPropagation();
            },
            
            removeToken : function(id) {
                for( var i = 0; i < this.tokens.length; i++ ) {
                    if( id == this.tokens[i]._id ) {
                        this.tokens.splice(i,1);
                        return;
                    }
                }
            },
            


            addToken : function(token) {
                if( !token.value || token.value == '' ) return;

                token._id = Math.random()*new Date().getTime()+"";
                for( var i = 0; i < this.tokens.length; i++ ) {
                    if( this.tokens[i].value == token.value ) return;
                }
                token.label = token.value;
                this.tokens.push(token);
            },
            
            getTokens : function() {
                return this.tokens;
            },
            
            setTokens : function(tokens) {
                this.tokens.splice(0,this.tokens.length);
                for( var i = 0; i < tokens.length; i++ ) {
                    this.addToken(tokens[i]);
                }
            },
            
            // helper method for moveLeft and moveRight
            _getTokenElements : function() {
                var tokenEles = $(this.$.container).find("span");
                var selected = -1;
                
                for( var i = 0; i < tokenEles.length; i++ ) {
                    if( $(tokenEles[i]).hasClass("btn-primary") ) {
                        selected = i;
                        break;
                    }
                }
                return {eles:tokenEles,selected:selected};
            },
            
            // remove the selected token
            _deleteSelected : function() {
                var info = this._getTokenElements();
                if( info.selected == -1 ) return;
                this._fireRemove(info.selected);
                this.tokens.splice(info.selected,1);
                
            },

            _addResult : function(e) {
                var l = e.currentTarget.label;
                this.addToken({label:l, value:l});
                this.results = '';
                this.inputValue = '';
            },
            
            _onInputUpdate : function() {
                if( this.inputValue.length == 0 ) {
                    this.results = [];
                } else {
                    this._search();
                }
            },

            // fires when text is typed input field
            _onInputKey : function(e) {
                if( e.which == 13 ) this._createToken();
            },

            searchTimer : -1,
            _search : function(){
                if( this.searchTimer != -1 ) clearTimeout(this.searchTimer);
                this.searching = true;

                this.searchTimer = setTimeout(function(){
                    
                    $.get(esis.host+'/api/3/action/tag_search?limit=10&query='+this.inputValue, function(resp){
                        this.results = resp.result.results;
                        this.searching = false;
                    }.bind(this));
                }.bind(this), 500);
            },

            test : function() {
                console.log(this.$.input.inputValue);
            },

            _createToken : function() {
                if(this.$.input.inputValue.length == 0) return; 

                var t = {
                    label : this.$.input.inputValue,
                    value : this.$.input.inputValue
                }
                this.addToken(t);
                this._fireAdd(t);
                this.$.input.inputValue = "";
            },
            
            _setFocus : function() {
                if( this.focus ) return;
                this.$.input.focus();
            },
            
            _fireRemove : function(id) {
                var t = null;
                if( typeof id == "string" ){
                    for( var i = 0; i < this.tokens.length; i++ ) {
                        if( id == this.tokens[i]._id ) {
                            t = this.tokens[i];
                            break;
                        }
                    }
                } else {
                    t = this.tokens[id];
                }
                this.fire('remove',t);
            },
            
            _fireAdd : function(token) {
                this.fire('add', token);
            },

            _onTokensUpdate : function() {
                var keywords = [];
                for( var i = 0; i < this.tokens.length; i++ ) {
                    keywords.push({name:this.tokens[i].label});
                }
                this.fire('update', keywords);
            }
        });
    ;

		Polymer('esis-basic-fields', {
			ds : {},
			ckan : {},

			validName : true,
			verifingName : false,

			menuItem : null,
			baseUrl : '',

			visible : true,

			licenses : [],
			organizations : [],

			verifyNameTimer : -1,

			observe : {
				'ds.data.title' : '_cleanTitle',
				'ds.data.owner_org' : '_onOrgChange',
				'ds.data.name' : '_verifyName',
				'ds.data.license_id' : '_updateLicenseName',
				'ds.data.hidden' : '_setVisibility',
				'ds.data.tags' : '_updateTokens'
			},

			ready : function() {
				this.baseUrl = esis.host+'/dataset/';

				this.ds = document.querySelector('esis-datastore');
				this.ckan = document.querySelector('esis-ckan');

				$.get(esis.host+'/api/3/action/license_list', function(resp){
					this.licenses = resp.result;
				}.bind(this));

				$.get(esis.host+'/api/3/action/organization_list?all_fields=true', function(resp){
					this.organizations = resp.result;
					this.organizations.splice(0,0, {
						id : '',
						display_name : 'No Organization'
					});
				}.bind(this));
			},

			_verifyName : function() {
				if( this.ds.data.name == '' || this.ds.editMode ) return;

				if( this.verifyNameTimer != -1 ) clearTimeout(this.verifyNameTimer);
				this.verifingName = true;

				this.verifyNameTimer = setTimeout(function(){
					this.ckan.getPackage(this.ds.data.name, function(err, resp){
						this.verifingName = false;
						if( err && err.error && err.error.message == "Not found" ) {
							this.validName = true;
						} else {
							this.validName = false;
						}
					}.bind(this));
				}.bind(this), 500);
			},

			_cleanTitle : function() {
				this.ds.data.name = this.ds.data.title.toLowerCase().replace(/[^a-z0-9]/g,'-');
				if( this.ds.data.title == '' ) return;
				this.menuItem.setSecondaryHtml('<b>Dataset:</b> '+this.ds.data.title);
			},

			_onOrgChange : function() {
				if( this.ds.data.owner_org == '' ) {
					this.ds.owner_org_name = '';
					this.ds.data.private = false;
					this.$.visible.setAttribute('disabled','disabled');
				} else {
					this.$.visible.removeAttribute('disabled');

					var opt = this.$.organizations.querySelector('option:checked');
					if( opt ) this.ds.owner_org_name = opt.innerHTML;	
				}
			},

			_addResources : function() {
				window.location.hash = "#new-resources";
			},

			_setKeywords : function(e) {
				this.ds.data.tags = e.detail;
			},

			_updateTokens : function() {
				//this.$.keywords.tokens = [];
				for( var i = 0; i < this.ds.data.tags.length; i++ ) {
					this.$.keywords.addToken({value:this.ds.data.tags[i].display_name});
				}
			},

			_updateLicenseName : function() {
				var opt = this.$.license.querySelector('option:checked');
				if( opt ) this.ds.data.license_title = opt.innerHTML;
			},

			_updateVisibility : function() {
				if( this.$.visible.value == 'false' ) this.ds.data.hidden = true;
				else this.ds.data.hidden = false;
			},

			_setVisibility : function() {
				this.$.visible.value = (this.ds.hidden)+'';
			}

		});
	;


  Polymer('paper-radio-button', {
    
    /**
     * Fired when the checked state changes.
     *
     * @event change
     */
    
    publish: {
      /**
       * Gets or sets the state, `true` is checked and `false` is unchecked.
       *
       * @attribute checked
       * @type boolean
       * @default false
       */
      checked: {value: false, reflect: true},
      
      /**
       * The label for the radio button.
       *
       * @attribute label
       * @type string
       * @default ''
       */
      label: '',
      
      /**
       * Normally the user cannot uncheck the radio button by tapping once
       * checked.  Setting this property to `true` makes the radio button
       * toggleable from checked to unchecked.
       *
       * @attribute toggles
       * @type boolean
       * @default false
       */
      toggles: false,
      
      /**
       * If true, the user cannot interact with this element.
       *
       * @attribute disabled
       * @type boolean
       * @default false
       */
      disabled: {value: false, reflect: true}
    },
    
    eventDelegates: {
      tap: 'tap'
    },
    
    tap: function() {
      this.toggle();
      this.fire('paper-radio-button-activate');
    },
    
    toggle: function() {
      this.checked = !this.toggles || !this.checked;
    },
    
    checkedChanged: function() {
      this.$.onRadio.classList.toggle('fill', this.checked);
      this.setAttribute('aria-checked', this.checked ? 'true': 'false');
      this.fire('change');
    },
    
    labelChanged: function() {
      this.setAttribute('aria-label', this.label);
    }
    
  });
  
;


  Polymer('paper-checkbox', {
    
    /**
     * Fired when the checked state changes.
     *
     * @event change
     */
    
    toggles: true,

    checkedChanged: function() {
      var cl = this.$.checkbox.classList;
      cl.toggle('checked', this.checked);
      cl.toggle('unchecked', !this.checked);
      cl.toggle('checkmark', !this.checked);
      cl.toggle('box', this.checked);
      this.setAttribute('aria-checked', this.checked ? 'true': 'false');
      this.fire('change');
    },

    checkboxAnimationEnd: function() {
      var cl = this.$.checkbox.classList;
      cl.toggle('checkmark', this.checked && !cl.contains('checkmark'));
      cl.toggle('box', !this.checked && !cl.contains('box'));
    }

  });
  
;

  
    Polymer('paper-radio-group', {
      
      selectedAttribute: 'checked',
      activateEvent: 'paper-radio-button-activate'
      
    });
  
  ;

    Polymer('esis-ui-card', {
      publish: {
        z: {value: 1, reflect: true}
      }
    });
  ;

		Polymer('esis-ui-delete-button', {
			_confirm : function() {
				this.$.start.classList.add('rotateOut');

				setTimeout(function(){
					this.$.start.style.display = 'none';
					this.$.start.classList.remove('rotateOut');

					this.$.remove.style.display = 'inline-block';
					this.$.cancel.style.display = 'inline-block';
				}.bind(this), 500);
			},

			_cancel : function() {
				this.$.start.style.display = 'block';
				this.$.remove.style.display = 'none';
				this.$.cancel.style.display = 'none';
			},

			_delete : function() {
				this.fire('delete');
			}
		});
	;

        Polymer('esis-ui-resource', {
            showName : false,
            showAttributes : false,

            /*knownMetadata : [],
            knownData : [],

            observe : {
                resource : '_update'
            },

            _update : function() {
                this.knownMetadata = [];
                this.knownData = [];

                for( var key in this.resource.knownAttributes ) {
                    if( this.resource.knownAttributes[key] == 'metadata' ) {
                        this.knownMetadata.push(key);
                    } else {
                        this.knownData.push(key);
                    }
                }
            },

            toggleAttributes : function() {
                this.showAttributes = !this.showAttributes;
            }*/

        });
    ;

		Polymer('esis-ui-file', {

			_delete : function() {
				this.$.card.classList.add('flipOutX');
				setTimeout(function(){
					document.querySelector('esis-datastore').removeFile(this.file);
				}.bind(this), 500);
			}
		});
	;
Polymer('esis-dataformat-help');;

		Polymer('esis-add-resource', {
			menuItem : null,
			ds : null,
			processing : false,
			parseZip : false,

			selectedTab : 0,
			selectedSheet : null,
			selectedSheetIndex : -1,

			newDatasheets : [],

			showHelp : false,

			options : {
				type : 'spectra'
			},

			observe : {
				'ds.files' : '_updatePreview',
				'ds.data.title' : '_updateVisibility',
				'ds.datasheets' : '_updateNewSheets',
				selectedSheetIndex : '_updateDatasheet'
			},

			ready : function() {
				this.ds = document.querySelector('esis-datastore');
				this.$.dropZone.addEventListener('dragover', this._handleDragOver.bind(this), false);
				this.$.dropZone.addEventListener('drop', this._handleFileSelect.bind(this), false);
			},

			// redraw current datasheet if there is one selected
			onShow : function() {
				this.$.dataSheetUI.update();
			},

			_updateVisibility : function() {
				if( this.ds.data.title.length > 0 ) {
					this.menuItem.style.display = 'block';
				} else {
					this.menuItem.style.display = 'none';
				}
			},

			_updateNewSheets : function() {
				this.newDatasheets = [];
				for( var i = 0; i < this.ds.datasheets.length; i++ ) {
					if( this.ds.datasheets[i].isExisting ) continue;
					this.newDatasheets.push(this.ds.datasheets[i]);
				}
			},

			_handleDragOver : function (evt) {
		  		evt.stopPropagation();
		  		evt.preventDefault();
		  		evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
		  	},

		  	_handleFileSelect : function(evt) {
			    evt.stopPropagation();
			    evt.preventDefault();

			    this.processing = true;

			    var files = evt.dataTransfer ? evt.dataTransfer.files : evt.target.files; // FileList object.

			    setTimeout(function(){
				    var file;
				    for (var i = 0, f; f = files[i]; i++) {
				    	file = this.ds.addFile(f, this.parseZip, this.options.type);

				    	if( i == 0 ) {
				    		file.addEventListener('ingest-complete', function() {
				    			this.processing = false;
				    			this.selectedTab = 2;
				    		}.bind(this));
				    	}
				    }

				    setTimeout(function(){
			    		this.$.file.value = '';
				    }.bind(this), 500);

				    
			    }.bind(this), 150);

			    
			    // once they add spectra, we only want them to update the spectra.json file
			    // via the add resources button and not the special 'update group by' button.
			    //esis.app.groupBy.hideUpdateButton();
		  	},

		  	_gotoInspect : function() {
		  		window.location.hash = 'parsed-spectra';
		  	},

		  	_gotoDatasheets : function() {
		  		this.selectedTab = 2;
		  	},

		  	_gotoAttrSetting : function() {
		  		window.location.hash = 'attribute-settings';
		  	},

		  	_updatePreview : function() {
		  		if( this.ds.files.length == 0 ) this.selectedTab = 0;
		  		this.menuItem.setSecondaryHtml(this.ds.files.length+' File(s) Stagged');
		  	},

		  	toggleHelp : function() {
		  		this.showHelp = !this.showHelp;
		  	},

		  	_updateDatasheet : function() {
		  		if( typeof this.selectedSheetIndex == 'string' ) this.selectedSheetIndex = parseInt(this.selectedSheetIndex);
		  		this.selectedSheet = this.newDatasheets[this.selectedSheetIndex];
		  	},

		  	_previousDatasheet : function() {
		  		if( typeof this.selectedSheetIndex == 'string' ) this.selectedSheetIndex = parseInt(this.selectedSheetIndex);
		  		this.selectedSheetIndex--;
		  	},

		  	_nextDatasheet : function() {
		  		if( typeof this.selectedSheetIndex == 'string' ) this.selectedSheetIndex = parseInt(this.selectedSheetIndex);
		  		this.selectedSheetIndex++;
		  	}

		});
	;

        Polymer('esis-attribute-editor', {

            attributeTypes : null,
            
            ds : null,

            // attributes who's types can be edited by used
            editableArray : [],
            // attributes who's types are implied by format
            fixedArray : [],
            // attributes that are wavelengths
            wavelengthArray : [],

            // modifications
            modifications : null,

            // toggles
            showWavelengths : false,
            showFixed : false,
            showEditable : true,

            ready : function() {
                this.ds = document.querySelector('esis-datastore');
            },

            update : function() {
                this.editableArray = [];
                this.fixedArray = [];
                this.wavelengthArray = [];

                if( this.modifications == null ) {
                    this.modifications = this.ds.attributeModifications;
                }

                var key, info;
                for( key in this.attributeTypes ) {
                    info = this.attributeTypes[key];

                    switch(info.flag) {
                        case this.ds.ATTR_FLAGS.FROM_METADATA:
                            this._copyToArray(this.fixedArray, key, info, '');
                            break;

                        case this.ds.ATTR_FLAGS.FROM_MIXED_FILE:
                            var css = (info.type == 'data') ? 'data' : 'spectra';

                            if( this.modifications[key] ) {
                                if( this.modifications[key] == 'data' ) css = 'data';
                                else css = 'spectra';
                            }
                           
                            this._copyToArray(this.editableArray, key, info, css);
                            break;

                        case this.ds.ATTR_FLAGS.IS_WAVELENGTH:
                            this._copyToArray(this.wavelengthArray, key, info, 'data');
                            break;

                        case this.ds.ATTR_FLAGS.IS_FILE_METADATA:
                            this._copyToArray(this.fixedArray, key, info, 'file');
                            break;

                        case this.ds.ATTR_FLAGS.IS_MEASUREMENT_METADATA:
                            this._copyToArray(this.fixedArray, key, info, 'spectra');
                            break;

                        case this.ds.ATTR_FLAGS.IS_FILE_DATA:
                            this._copyToArray(this.fixedArray, key, info, 'data');
                            break;

                        default:
                            break;
                    }
                }
            },

            _onTypeChanged : function(e) {
                var index = parseInt(e.currentTarget.getAttribute('index'));
                var val = e.currentTarget.value;
                var attr = this.editableArray[index];

                if( this.modifications == null ) {
                    this.modifications = this.ds.attributeModifications;
                }

                if( val == 'data' ) attr.class = 'data';
                else attr.class = 'spectra';

                if( attr.type == val ) {
                    if( this.modifications[attr.name] ) {
                        delete this.modifications[attr.name];
                    }
                } else {
                    this.modifications[attr.name] = val;
                }

                // now actually update known measurements
                var i, j, f, m, index;
                for( i = 0; i < this.ds.datasheets.length; i++ ) {
                    f = this.ds.datasheets[i];
                    for( j = 0; j < f.measurements.length; j++ ) {
                        f.measurements[j].switchAttributeType(attr.name, val);
                    }
                }
            },

            _copyToArray : function(arr, key, info, cssClass) {
                arr.push({
                    name : key,
                    type : this.ds.attributeModifications[key] ? this.ds.attributeModifications[key] : info.type,
                    flag : info.flag,
                    guess : info.guess,
                    class : cssClass
                });
            },

            _toggleWavelengths : function() {
                this.showWavelengths = !this.showWavelengths;
            },

            _toggleEditable : function() {
                this.showEditable = !this.showEditable;
            },

            _toggleFixed : function() {
                this.showFixed = !this.showFixed;
            }

        });
    ;

        Polymer('esis-attribute-ordering', {

            attributeTypes : null,
            
            // attributes that could be sorted by or grouped by
            attributeArray : [],

            modifications : null,

            sorts : [],

            ds : null,

            ready : function() {
                this.ds = document.querySelector('esis-datastore');
            },

            update : function() {
                this.attributeArray = [];

                if( this.modifications == null ) {
                    this.modifications = this.ds.attributeModifications;
                }

                var key, info;
                for( key in this.attributeTypes ) {
                    info = this.attributeTypes[key];

                    switch(info.flag) {
                        case this.ds.ATTR_FLAGS.FROM_METADATA:
                            this._copyToArray(this.attributeArray, key, info);
                            break;

                        case this.ds.ATTR_FLAGS.FROM_MIXED_FILE:                           
                            this._copyToArray(this.attributeArray, key, info);
                            break;

                        case this.ds.ATTR_FLAGS.IS_WAVELENGTH:
                            break;

                        case this.ds.ATTR_FLAGS.IS_FILE_METADATA:
                            this._copyToArray(this.attributeArray, key, info);
                            break;

                        case this.ds.ATTR_FLAGS.IS_MEASUREMENT_METADATA:
                            this._copyToArray(this.attributeArray, key, info);
                            break;

                        case this.ds.ATTR_FLAGS.IS_FILE_DATA:
                            this._copyToArray(this.attributeArray, key, info);
                            break;

                        default:
                            break;
                    }
                }
            },

            _copyToArray : function(arr, key, info) {
                arr.push({
                    name : key,
                    type : this.ds.attributeModifications[key] ? this.ds.attributeModifications[key] : info.type,
                    flag : info.flag,
                    guess : info.guess
                });
            }

        });
    ;

		Polymer('esis-attribute-settings', {
			datasheets : [],

			map : {},
			inverseMap : {},
			attrMapList : [],
			menuItem : null,

			attributeTypes : null,
			ds : null,

			currentTab : 0,

			observe : {
				'ds.datasheets' : '_updateVisibility',
				'ds.existing.data' : '_updateVisibility'
			},

			ready : function() {

				this.ds = document.querySelector('esis-datastore');

				this.ds.addEventListener('attribute-map-update', function(){
					this.map = this.ds.attributeMap;
				 	this._updateAttrMapList();
				}.bind(this));

				window.addEventListener('polymer-ready', function(e) {
				 	this.async(function(){
				 		this.files = this.ds.files;
				 		this.map = this.ds.attributeMap;
				 		this._updateAttrMapList();
				 	});
				 	this._updateVisibility();
				}.bind(this));
			},

			// fired when element is attached.  For this element we should render the attribute type control
			onShow : function() {
				this.attributeTypes = this.ds.getAllAttributeTypes();
				this.$.editor.update();
				this.$.ordering.update();
			},

			_updateVisibility : function() {
				if( this.ds.datasheets.length > 0 || this.ds.existing.data.length > 0 ) {
					this.menuItem.style.display = 'block';
				} else {
					this.menuItem.style.display = 'none';
				}
			},

			_processMap : function(e) {
				e.stopPropagation();
				e.preventDefault();

				var files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
				if( files.length == 0 ) return;

				var reader = new FileReader();
				var contents, parts;

				reader.onload = function(e) {
					var newMap = {};
					contents = e.target.result.split('\n');

					for( var i = 0; i < contents.length; i++ ) {
						if( contents[i].indexOf('=') > -1 ) {
							parts = contents[i].split('=');
							newMap[parts[0]] = parts[1];
							//if( parts[1].length > 0 ) inverseMap[parts[1]] = parts[0];
						}
					}

					this.$.map.value = '';
					this._updateAttrMapList(newMap);
				}.bind(this);

				reader.readAsText(files[0]);
			},

			_updateAttrMapList : function(newMap) {
				this.attrMapList = [];

				var c = 0, item = {};
				var map = newMap || this.map;

				for( var key in map ) {
					if( map[key] && map[key].length > 0 ) {
						if( c % 2 != 0 ) {
							item['c2'] = [key, map[key]];
							this.attrMapList.push(item);
						} else {
							item = { c1 : [key, map[key]]};
						}
						c++;
					}
				}

				if( newMap ) {
					this.ds.attributeMap = newMap;
					this.ds.inverseAttributeMap = {};

					for( var key in newMap ) {
						if( newMap[key] != '' ) this.ds.inverseAttributeMap[newMap[key]] = key;
					}
				}
				this.menuItem.setSecondaryHtml(c+' Attributes Mapped');
			}

		});
	;


  Polymer('paper-tab', {
    
    /**
     * If true, ink ripple effect is disabled.
     *
     * @attribute noink
     * @type boolean
     * @default false
     */
    noink: false
    
  });
  
;


  Polymer('paper-tabs', {
    
    /**
     * If true, ink effect is disabled.
     *
     * @attribute noink
     * @type boolean
     * @default false
     */
    noink: false,
    
    /**
     * If true, the bottom bar to indicate the selected tab will not be shown.
     *
     * @attribute nobar
     * @type boolean
     * @default false
     */
    nobar: false,
    
    activateEvent: 'down',
    
    nostretch: false,
    
    selectedIndexChanged: function(old) {
      var s = this.$.selectionBar.style;
      
      if (!this.selectedItem) {
        s.width = 0;
        s.left = 0;
        return;
      } 
      
      var w = 100 / this.items.length;
      
      if (this.nostretch || old === null || old === -1) {
        s.width = w + '%';
        s.left = this.selectedIndex * w + '%';
        return;
      }
      
      var m = 5;
      this.$.selectionBar.classList.add('expand');
      if (old < this.selectedIndex) {
        s.width = w + w * (this.selectedIndex - old) - m + '%';
      } else {
        s.width = w + w * (old - this.selectedIndex) - m + '%';
        s.left = this.selectedIndex * w + m + '%';
      }
    },
    
    barTransitionEnd: function() {
      var cl = this.$.selectionBar.classList;
      if (cl.contains('expand')) {
        cl.remove('expand');
        cl.add('contract');
        var s = this.$.selectionBar.style;
        var w = 100 / this.items.length;
        s.width = w + '%';
        s.left = this.selectedIndex * w + '%';
      } else if (cl.contains('contract')) {
        cl.remove('contract');
      }
    }
    
  });
  
;

		Polymer('esis-ui-measurement', {
			measurement : {},

			metadata : {
				file : [],
				joined : [],
				measurement : []
			},
			data : [],
		
			wavelengthCount : 0,

			ds : null,

			showMetadata : true,
			showData : true,

			dt : null,
			chart : null,

			observe : {
				measurement : '_update',
			},

			ready : function() {
				this.chart = new google.visualization.LineChart(this.$.chart);
				this.ds = document.querySelector('esis-datastore');

				$(window).on('resize', function(){
					this._drawChart();
				}.bind(this));
			},

			_update : function() {
				this.metadata = {
					file : [],
					joined : [],
					measurement : []
				}

				this.data = [];
				this.wavelengthCount = 0;

				if( !this.measurement ) return;
				if( !this.measurement.metadata ) return;

				var attrMap = document.querySelector('esis-datastore').attributeMap;
				var flipMap = {};

				// flip the map;
				//for( var key in attrMap ) {
				//	if( attrMap[key] != '' ) flipMap[attrMap[key]] = key;
				//}

				var key;
				for( key in this.measurement.metadata.file ) {
					this.metadata.file.push({
						key : key, 
						value : this.measurement.metadata.file[key]
					});
				}
				for( key in this.measurement.metadata.joined ) {
					this.metadata.joined.push({
						key : key, 
						value : this.measurement.metadata.joined[key]
					});
				}
				for( key in this.measurement.metadata.measurement ) {
					this.metadata.measurement.push({
						key : key, 
						value : this.measurement.metadata.measurement[key]
					});
				}

				this.dt = new google.visualization.DataTable();
				var rows = [], point;

				this.dt.addColumn('number', 'Wavelength');
				this.dt.addColumn('number', '');

				var re1 = /^-?\d+\.?\d*$/;
                var re2 = /^-?\d*\.\d+$/;

				for( var i = 0; i < this.measurement.datapoints.length; i++ ) {
					point = this.measurement.datapoints[i];

					if( re1.exec(point.key) || re1.exec(point.key) ) {
						rows.push([
				  			parseFloat(point.key),
				  			parseFloat(point.value)
				  		]);
					} else {
						this.data.push(point); 
					}
				}

				rows.sort(function(a, b){
		       		if( a[0] > b[0] ) return 1;
		       		if( a[0] < b[0] ) return -1;
		       		return 0;
		    	});

				this.wavelengthCount = rows.length;
		      	this.dt.addRows(rows);

		      	setTimeout(function(){
		      		this._drawChart();
		      	}.bind(this), 200);
			},

			_getLabel : function(key, attrMap) {
				if( attrMap[key] ) {
					 return (esis.metadata[attrMap[key]] ? attrMap[key] : '*'+attrMap[key]) + ' (' +
					 		(esis.metadata[key] ? key : '*'+key) + ')';
				}
				return esis.metadata[key] ? key : '*'+key;
			},

			show : function() {
				this._update();
			},

			_drawChart : function() {
				if( !this.dt || !this.chart ) return;

		    	// Set chart options
		    	var options = {
		            width : $(this.$.chart).width(),
		            height : 400,
		            legend : {
		            	position : 'none'
		            },
		            animation:{
				        duration: 1000,
				        easing: 'out'
				    }
		    	};

		    	// Instantiate and draw our chart, passing in some options.
		    	this.chart.draw(this.dt, options);
			},

			_toggleMetadata : function() {
				this.showMetadata = !this.showMetadata;
			},

			_toggleData : function() {
				this.showData = !this.showData;
			}
		});
	;

		Polymer('esis-ui-metadata', {
			metadata : {},
			joinAttrs : [],
			label : '',

			observe : {
				'metadata.joinId' : '_updateDatastore',
			},

			update : function() {
				if( this.metadata == null ) return;

				this.joinAttrs = [];

				for( var key in this.attributeTypes ) {
					this.joinAttrs.push(key);
				}

				if( this.metadata.file && this.metadata.file.info ) {
					this.label = this.metadata.file.info.name.replace(/.*\//,'');
				} else {
					this.label = this.metadata.filename;
				}

				this.async(function(){
					this.$.joinId.value = this.metadata.joinId;
				});
			},

			_updateDatastore : function() {
				if( this.metadata.joinId == '' ) return;
				document.querySelector('esis-datastore').join(this.metadata);
			},

			_onWorksheetMatch : function() {
				this.async(function(){
					this.metadata.filenameMatch = false;
					this.$.filenameMatch.removeAttribute('checked');
					this.metadata.worksheetMatch = this.$.worksheetMatch.checked;
					this._updateDatastore();
				});
			},

			_onFilenameMatch : function() {
				this.async(function(){
					this.metadata.worksheetMatch = false;
					this.$.worksheetMatch.removeAttribute('checked');
					this.metadata.filenameMatch = this.$.filenameMatch.checked;
					this._updateDatastore();
				});	
			},

			_onLooseMatch : function() {
				this.async(function(){
					this.metadata.looseMatch = !this.$.looseMatch.checked;
					this._updateDatastore();
				});	
			}

		});
	;

		Polymer('esis-ui-datasheet', {
			datasheet : null,

			open : false,

            showHelp : false,

            parsedAttributes : [],
            wavelengths : [],

            showWavelengths : false,
            showAttrs : true,

            ds : null,

			// chart vars
			dt : null,
			chart : null,
			maxLineCount : 30,

			observe : {
				datasheet : 'update'
			},

            ready : function() {
                this.ds = document.querySelector('esis-datastore');
            },

			update : function() {
                if( !this.datasheet ) return;

                this._setAttributes();
                this.showWavelengths = false;
                this.datasheet.addEventListener('datasheet-updated', this._setAttributes.bind(this));
			},

            _setAttributes : function() {

                this.parsedAttributes = [];
                this.wavelengths = [];

                var info;
                for( var key in this.datasheet.attributeTypes ) {
                    info = this.datasheet.attributeTypes[key];

                    switch(info.flag) {
                        case this.ds.ATTR_FLAGS.FROM_METADATA:
                            this.parsedAttributes.push({
                                name : key,
                                type : 'Joinable Metadata',
                                class : '',
                            });
                            break;

                        case this.ds.ATTR_FLAGS.FROM_MIXED_FILE:
                            var type = info.type;
                            if( this.ds.attributeModifications[key] ) type = this.ds.attributeModifications[key];

                            if( type == 'metadata' ) {
                                this.parsedAttributes.push({
                                    name : key,
                                    type : 'Spectra Metadata',
                                    class : 'spectra'
                                });
                            } else {
                                this.parsedAttributes.push({
                                    name : key,
                                    type : 'Data',
                                    class : 'data'
                                });
                            }
                            break;

                        case this.ds.ATTR_FLAGS.IS_WAVELENGTH:
                            this.wavelengths.push(key);
                            break;

                        case this.ds.ATTR_FLAGS.IS_FILE_METADATA:
                            this.parsedAttributes.push({
                                name : key,
                                type : 'File Metadata',
                                class : 'file'
                            });
                            break;

                        case this.ds.ATTR_FLAGS.IS_MEASUREMENT_METADATA:
                            this.parsedAttributes.push({
                                name : key,
                                type : 'Spectra Metadata',
                                class : 'spectra'
                            });
                            break;

                        case this.ds.ATTR_FLAGS.IS_FILE_DATA:
                            this.parsedAttributes.push({
                                name : key,
                                type : 'Derived Data',
                                class : 'data'
                            });
                            break;

                        default:
                            break;
                    }
                }

                if( this.datasheet.isMetadata ){
                    this.async(function(){
                        this.shadowRoot.querySelector('esis-ui-metadata').update();
                    });
                }

            },

			_toggle : function() {
				this.open = !this.open;

				if( this.open && this.datasheet.measurements.length > 0 ) {
					this.$.chart.style.height = '400px';
					setTimeout(function(){
						this._createChart();
					}.bind(this), 500);
				} else if( !this.open ) {
					this.chart = null;
					this.$.chart.innerHTML = '';
				}

				this.$.collapse.toggle();
			},

            _toggleWavelengths : function() {
                this.showWavelengths = !this.showWavelengths;
            },

            _toggleAttrs : function() {
                this.showAttrs = !this.showAttrs;
            },

			_createChart : function() {
				if( !this.dt ) {
					this.dt = new google.visualization.DataTable();
			  		var rows = [];

					this.dt.addColumn('number', 'Wavelength');
					for( var i = 0; i < this.datasheet.measurements.length; i++ ) {
					  	if( i == this.maxLineCount ) break;
					    this.dt.addColumn('number', ''+i);
					}

					for( var i = 0; i < this.datasheet.measurements[0].data.length; i++ ) {

					  	// add the wavelength
					  	var row = [parseFloat(this.datasheet.measurements[0].data[i][0])];
					  	var addRow = true;

					  	for( var j = 0; j < this.datasheet.measurements.length; j++ ) {
					  		if( j == this.maxLineCount ) break;

					  		var f = parseFloat(this.datasheet.measurements[j].data[i][1]);
					  		if( isNaN(f) ) f = 0;
					  		if(  j == 0 && f == 0 ) {
					  			addRow = false;
					  			break;
					  		}

					  		row.push(f);
					  	}
					  	if( addRow ) rows.push(row);
					}

					rows.sort(function(a, b){
				    	if( a[0] > b[0] ) return 1;
				    	if( a[0] < b[0] ) return -1;
				    	return 0;
				    });

				    this.dt.addRows(rows);
				}
				this._draw();
			},

			_draw : function() {
				// Set chart options
			    var options = {
			        width : $(this.$.chart).width(),
			        height : 400,
			        legend : {
			          	position : 'none'
			        }
			    };

			      // Instantiate and draw our chart, passing in some options.
			    if( !this.chart ) this.chart = new google.visualization.LineChart(this.$.chart);
			    this.chart.draw(this.dt, options);
			},

            _toggleHelp : function() {
                this.showHelp = !this.showHelp;
            },

            goToAttrSettings : function() {
                window.location.hash = 'attribute-settings';
            },

            _goToJoin : function() {
                window.location.hash = 'join';
            }
		});
	;

		Polymer('esis-inspect', {
			
			menuItem : null,

			spectraDatasheets : [],
			datasheets : [],
			measurements    : [],
			attachedHandlers : [],

			selectedSpectra : {},

			observe : {
				datasheets : '_update'
			},

			ready : function() {
				 window.addEventListener('polymer-ready', function(e) {
				 	this.async(function(){
				 		this.datasheets = document.querySelector('esis-datastore').datasheets;
				 	});
				}.bind(this));
			},

			_update : function() {
				this.async(function(){
					this.measurements = [];
					this.measurementDatasheets = [];

					for( var i = 0; i < this.datasheets.length; i++ ) {
						var f = this.datasheets[i];

						// listen for updates, make sure we only attach once
						if( this.attachedHandlers.indexOf(f) == -1 ) {
							this.attachedHandlers.push(f);
							f.addEventListener('datasheet-updated', function(){
								this._update();
							}.bind(this));
						}

						if( !f.isMetadata ) {
							this.measurementDatasheets.push(f);
						}

						for( var j = 0; j < f.measurements.length; j++ ) {
							this.measurements.push(f.measurements[j]);
						}
					}

					if( this.measurements.length > 0 ) {
						this.selectedSpectra = this.measurements[0];
					}

					this._updateVisibility();
					this.menuItem.setSecondaryHtml(this.measurements.length+' Spectra Found');
				});
			},

			_updateVisibility : function() {
				var display = 'none';
				for( var i = 0; i < this.datasheets.length; i++ ) {
					if( this.datasheets[i].measurements.length > 0 ) {
						display = 'block';
						break;
					}
				}
				this.menuItem.style.display = display;
			},

			onShow : function() {
				this._update();
				this.$.measurementUI.show();
			},

			_selectSpectra : function() {
				this.selectedSpectra = this.measurements[parseInt(this.$.spectraSelector.value)];
			},

			_gotoAttrMap : function() {
				window.location.hash = '#attribute-map';
			},

			_gotoJoin : function() {
				window.location.hash = '#join';
			},

			_gotoGroup : function() {
				window.location.hash = '#group-by';
			},

			_goToAttrSettings : function() {
				window.location.hash = 'attribute-settings'
			}

		});
	;

		Polymer('esis-current-resources',{
			menuItem : null,
			ds : {},
			loader : {},

			resources : [],

			loading : false,

			observe : {
				'ds.deleted' : '_update',
				'ds.existing.dataset' : '_update',
				'ds.existing.resources' : '_update',
				'ds.editMode' : '_updateVisibility'
			},

			ready : function() {
				this.ds = document.querySelector('esis-datastore');
				this.loader = document.querySelector('esis-dataset-loader');


				if( !this.loader.spectraPackageLoaded ) {
					this.loader.addEventListener('get-spectral-resource-progress', function(e){
						this.loading = true;
						this._updatePreview(e.detail);
					}.bind(this));

					this.loader.addEventListener('get-spectral-resource-complete', function(e){
						this.loading = false;
					}.bind(this));
				}
				
			},

			_update : function() {
				this._updateVisibility();

				this.async(function(){
					this._updateUI();
				});
			},

			_updateUI : function() {
				this.resources = [];

				for( var i = 0; i < this.ds.existing.resources.length; i++ ) {
					this.resources.push(this._groupData(this.ds.existing.resources[i]));
				}
			},

			_groupData : function(res) {

				var ui = {
					name : res.name,
					id   : res.id,
					type : 'Generic',
					count : 'NA'
				};

				var spCount = this._isData(res.id) 

				if( spCount > -1 ) {
					ui.count = spCount;
					ui.type = 'Spectra';
				} else if( this._isMetdata(res.id) ) {
					ui.type = 'Metadata';
				}

				return ui;
			},

			_isMetdata : function(id) {
				for( var i = 0; i < this.ds.existing.metadata.length; i++ ) {
					if( this.ds.existing.metadata[i].resource_id == id ) return true;
				}
				return false;
			},

			_isData : function(id) {
				for( var i = 0; i < this.ds.existing.data.length; i++ ) {
					if( this.ds.existing.data[i].resource_id == id ) return this.ds.existing.data[i].spectra_count;
				}
				return -1;
			},

			_updateVisibility : function() {
				this._updatePreview();
				if( !this.ds.editMode ) {
					this.menuItem.style.display = 'none';
					return;
				}

				if( this.ds.existing.resources.length > 0) {
					this.menuItem.style.display = 'block';
				} else {
					this.menuItem.style.display = 'none';
				}
			},

			_updatePreview : function(progress) {
				var html = this.ds.existing.resources.length+' Resource(s)';
				if( progress != null ) {
					html += '<br />Loading spectra package... '+progress+'%';
				}

		  		this.menuItem.setSecondaryHtml(html);
		  	},

		  	_deleteResource : function(e) {
		  		var id = e.currentTarget.getAttribute('rid');
		  		this.ds.removeResource(id);
		  	}
		});
	;

		Polymer('esis-item', {
			esisComponent : {},

			ready : function() {
				if( !this.ele ) return;
				this.esisComponent = document.createElement(this.ele);
				this.esisComponent.menuItem = this;
				this.classList.add('animated');
				this.classList.add('bounceInLeft');
			},

			setSecondaryHtml : function(html) {
				this.$.secondaryContent.innerHTML = html;
			}
		});
	;

		Polymer('esis-file', {
			// raw file input object
			raw : {},

			// general file info
			info : {},

			sheetName : '',

			// raw file contents
			contents : null,

			// if we are a zip file, should we extract?
			parseZip : false,

			error : null,
			warning : null,

			// HTML5 File Reader Object
			reader : null,

			observe : {
				raw : '_parse'
			},

			defaultDataType : '',

			// references to child datasheets and resources
			datasheets : [],
			resources : [],

			ready : function() {
				this.datasheets = [];
				this.resources = [];
				this.info = {};
				this.raw = {};
			},

			// parse file contents
			_parse : function() {
				this.info = this._getInfo(this.raw.name);

				this.reader = new FileReader();
				this.reader.onload = function(e) {
					this.contents = e.target.result;
					if(  this.info.isZip ) {
						this._unzip();
					} else {
						document.querySelector('esis-parser').parse(this, function(arr){
							this._onIngestComplete(arr);
		        		}.bind(this));
					}
				}.bind(this);

				this._readAs();
			},

			_readAs : function() {
				if( this.info.hasData || this.info.isZip ) {
					if( this.info.format == 'binary' ) {
						//reader.readAsArrayBuffer(file);
						this.reader.readAsBinaryString(this.raw);
					} else if( this.info.format == 'string' ) {
						this.reader.readAsText(this.raw);
					}
					return;
				}
					
				this._onIngestComplete([{
					name : this.info.name,
					info : this.info,
					file : this.raw
				}]);
			},

			/*_unzip : function(callback) {
				var worker = new Worker('workers/jszipWorker.js');
				var ref = this;
				worker.onmessage = function(e) {
					if( e.data.zip ) {
						console.log(e.data.zip);
						ref._parseUnzipped(e.data.zip);
					}
				};
				worker.postMessage({contents: this.contents});
			},*/

			_unzip : function() {
				var zip = new JSZip(this.contents);
				var arr = [];

				var c = 0;
				var total = Object.keys(zip.files).length;

				for( var file in zip.files ) {
					var zipEntry = zip.files[file];

					var linfo = this._getInfo(zipEntry.name);

					// ignore directories
					if( zipEntry.options.dir || zipEntry.name.match(/.*\/$/) ) {
						linfo.hasData = false;
						linfo.isDir = true;
					}

					// ignore . files
					var ignore = false;
					if( zipEntry.name.replace(/.*\//,'').match(/^\..*/) ) {
						ignore = true;
					}

		        	var contents = '';

		        	if( ignore ) {
		        		c++;
			        	if( c == total ) this._onIngestComplete(arr);
		        	} else if( linfo.hasData ) {

		        		if( linfo.format == 'binary' ) contents = zipEntry.asBinary();
		        		else contents = zipEntry.asText();

		        		// if we are extracting the zip, add the resource file as well
		        		if( this.parseZip ) {
		        			arr.push({
			        			name : linfo.name,
								info : linfo,
								zipEntry : zipEntry
							});
		        		}

		        		document.querySelector('esis-parser').parse({info: linfo, contents: contents}, function(resp){
			        		for( var i = 0; i < resp.length; i++ ) {
			        			var d = resp[i];
			        			// do we need to add reference to the zip file to later relate the resource id?
			        			if( !this.parseZip ) d.info.zipFilename = linfo.name;
			        			arr.push(d);
			        		}

			        		c++;
			        		if( c == total ) this._onIngestComplete(arr);
			        	}.bind(this));
		        	} else if( this.parseZip && !linfo.isDir ) {
		        		arr.push({
		        			name : linfo.name,
							info : linfo,
							zipEntry : zipEntry
						});

		        		c++;
			        	if( c == total ) this._onIngestComplete(arr);
		        	} else {
		        		c++;
			        	if( c == total ) this._onIngestComplete(arr);
		        	}

		        };
			},

			_getInfo : function(name) {
				var i = {};
				var ext = this._getExtension(name);
				var tmp = esis.extensions[ext];

				if( !tmp && this.raw.name == '.' ) {
					tmp = {
						type : 'directory',
						isDir : true
					}
				} else if( !tmp ) {
					tmp = {
						type : 'both',
						parser : 'csv-4spaces'
					}
				}

				for( var key in tmp ) i[key] = tmp[key];

				i.ext = ext;
				i.name = name;
				i.hasData = i.type == 'both' || i.type == 'data';
				return i;	
			},

			_onIngestComplete : function(files) {
				// do we need to add the zip file?
				//if( (!this.parseZip && this.info.isZip) || !this.info.isZip ) {
				if( (!this.parseZip && this.info.isZip) || (!this.info.isZip && this.info.type != 'resource') ) {
					files.push({
						name : this.info.name,
						info : this.info,
						file : this.raw,
						contents : this.contents
					});
				}

				var map = {};
				var ds = document.querySelector('esis-datastore');
				for( var i = 0; i < files.length; i++ ) {
					var f = files[i];

					if( f.info.type == 'data' ) {
						var datasheet = ds.addDatasheet(f);
						var resourceName = f.info.zipFilename ? f.info.zipFilename : f.info.name;

						if( resourceName ) {
							if( !map[resourceName] ) map[resourceName] = [datasheet];
							else map[resourceName].push(datasheet);
						}

						datasheet.dataType = this.defaultDataType;
						datasheet.init = true;

						this.datasheets.push(datasheet);

						// set reference for next loop
						f.datasheet = datasheet;
					} 
				}

				for( var i = 0; i < files.length; i++ ) {
					var f = files[i];
					if( f.info.type == 'resource' || f.info.type == 'both' ) {
						var resource = ds.addResource(f, map[f.info.name]);
						if( f.datasheet ) {
							resource.datasheets.push(f.datasheet);
						}
						this.resources.push(resource);
					}
				}

				this.fire('ingest-complete');

			},

			_getExtension : function(filename) {
				var parts = filename.split('.');
				return parts[parts.length-1];
			}
		})
	;

		Polymer('esis-metadata', {
			filename : '',
			metadata : [],
			joinId   : '',
			joinCol  : 0,

			filenameMatch : false,
			looseMatch : false,
			worksheetMatch : false,
			
			matchCount : null,
			resourceId : '',

			// was this generated from existing datasheet (one that has already been added)
			isExisting : false,

			getJoinType : function() {
				if( this.filenameMatch ) {
					return {
						type : 'filename',
						loose : this.looseMatch
					};
				} else if ( this.worksheetMatch ) {
					return { type : 'worksheet' }
				} else {
					return { type : 'attribute' }
				}
			},

			_updateJoinRow : function() {
				if( this.metadata.length == 0 ) return;
		
				for( var i = 0; i < this.metadata[0].length; i++ ) {
					if( this.metadata[0][i] == this.joinId ) {
						this.joinCol = i;
						return;
					}
				}
			},

			join : function(measurement) {
				//debugger;
				//this._updateJoinRow();

				// set for existing data
				if( !measurement.metadata.joined ) measurement.metadata.joined = [];

				var row = this._getRow(measurement);

				if( row == -1 ) {
					// remove any known attribute from the join
					for( var j = 0; j < this.metadata[0].length; j++ ) {
						if( measurement.metadata.joined[this.metadata[0][j]] != null ) {
							delete measurement.metadata.joined[this.metadata[0][j]];
						}
					}
					return false;
				}

				for( var key in this.metadata[0] ) {
					if( key == this.joinId && !(this.filenameMatch || this.worksheetMatch) ) continue;
					measurement.metadata.joined[key] = this.metadata[row][key];
				}
				return true;
			},

			joinAttributes : function() {
				if( this.metadata.length == 0 ) return [];

				var list = [];
				for( var i = 0; i < this.metadata[0].length; i++ ) {
					list.push(this.metadata[0][i]);
				}
				return list;
			},

			_getRow : function(measurement) {
				if( this.filenameMatch || this.worksheetMatch ) {
					var regex, val, name;
					for( var i = 0; i < this.metadata.length; i++ ) {
						name = this.filenameMatch ? measurement.filename : measurement.sheetname;
						val = this.metadata[i][this.joinId];

						// if the value doesn't have a period, assume we want to strip any extension on a filename match
						if( val.indexOf('.') == -1 && this.filenameMatch ) {
							name = name.replace(/\..*/,'');
						}

						// this can match too much
						if( this.looseMatch && name.indexOf(val) > -1 ) {
							return i;
						} else if( val == name ) {
							return i;
						}
					}
				} else {
					var spMetadata = measurement.metadata.measurement; // case for new metadata
					if( !spMetadata ) spMetadata = measurement.metadata; // case for existing spectra

					for( var i = 0; i < this.metadata.length; i++ ) {
						if( this.metadata[i][this.joinId] == spMetadata[this.joinId] ) {
							return i;
						}
					}
				}
				return -1;
			}
		});
	;

		Polymer('esis-measurement', {
			datapoints : [],
			metadata : {},

			filename : '',
			sheetname : '',

			error : null,
			resourceId : '',
			joinOrder : ['joined', 'file', 'measurement'],
			
			spectra_id : '',

			ready : function() {
				this.data = [];
				this.metadata = {
					measurement : {},
					file : {},
					joined : {}
				}
			},

			// newType should be 'data' or 'metadata'
			switchAttributeType : function(attr, newType) {
				// move from metadata to datapoints array
				if( newType == 'data' && this.metadata.measurement && this.metadata.measurement[attr] ) {
					this.datapoints.push({
						key : attr,
						value : this.metadata.measurement[attr]
					});
					delete this.metadata.measurement[attr];

				// move from datapoints array to metadata
				} else {
					var index = this.getDataPointIndex(attr);
					if( index == -1 ) return;

					if( !this.metadata.measurement ) this.measurement.measurement = {};
					this.measurement.measurement[this.datapoints[index].key] = this.datapoints[index].value;
					this.datapoints.splice(index, 1);
				}
			},

			getDataPointIndex : function(attr) {
                for( var i = 0; i < this.datapoints.length; i++ ) {
                    if( this.datapoints[i].key == attr ) return i;
                }
                return -1;
            },

			getAttributes : function() {
				var attrs = [], type, i, key;

				for( i = 0; i < this.joinOrder.length; i++ ) {
					type = this.metadata[this.joinOrder[i]];
					for( key in type ) {
						if( attrs.indexOf(key) == -1 ) attrs.push(key);
					}
				}

				return attrs;
			},

			// shortend so we don't colid on ns
			getMetadataAttr : function(attr) {
				for( var i = 0; i < this.joinOrder.length; i++ ) {
					if( this.metadata[this.joinOrder[i]][attr] ) {
						return this.metadata[this.joinOrder[i]][attr];
					}
				}
				return null;
			},

			mergeMetadata : function() {
				var md = {};
				for( var i = 0; i < this.joinOrder.length; i++ ) {
					for( var key in this.metadata[this.joinOrder[i]] ) {
						md[key] = this.metadata[this.joinOrder[i]][key];
					}
				}
				return md;
			},

			updateUid : function()  {
				var uid = document.querySelector('esis-datastore').measurementDisambiguator;

				var field = '';
				if( uid && uid.length > 0 ) {
					for( var i = 0; i < this.joinOrder.length; i++ ) {
						if( this.metadata[this.joinOrder[i]][field] ) {
							field = this.metadata[this.joinOrder[i]][field];
							break;
						}
					}
				}

				if( uid.length > 0 ) {
					this.measurement_id = md5(JSON.stringify(this.datapoints)+field);
				} else {
					this.measurement_id = md5(JSON.stringify(this.datapoints));
				}
			}

		});
	;

		Polymer('esis-datasheet',{
			// parent esis-file element
			//file : {},

			// parsed datasheet contents
			contents : {},

			measurements : [],
			metadata : {},

			ckanId : '',

			// spectra or timeseries... really this is what format the data is presented in
			dataType : '',

			// we will try and detect this flag.  but let users select if we get it wrong
			isMetadata : false,

			// was this generated from existing datasheet (one that has already been added)
			isExisting : false,

			// map of known attribute names to the attribute type and flag
			attributeTypes : null,

			editMode : false,

			// bindable flag for UI
			updating : true,

			label : '',

			observe : {
				contents : '_update',
				dataType : '_extract',
				isMetadata : '_extract'
			},

			// what information needs to be stored here?
			// we need to be able to know what data attributes are file and what 
			// are part of tabular context...
			attributeTypes : null,

			ready : function() {
				this.measurements = [];
				this.metadata = {};
				this.contents = {};
				this.attributeTypes = {};
			},

			// run the extractor again
			// most likely called when the dataType changes
			_extract : function(oldVal, newVal) {
				if( oldVal === '' || this.isExisting ) return;
				this.updating = true;

				setTimeout(function(){
					var extractor = document.querySelector('esis-extractor');
					var resp = extractor.run((this.isMetadata ? 'metadata' : this.dataType), this.contents.array);
					
					// TODO: how do we want to handle resp.error?

					this.contents.metadata = resp.metadata;
					this.contents.measurements = resp.measurements;
					this.attributeTypes = resp.attributeTypes;
					this.contents.joindata = resp.joindata;

					this._update();
				}.bind(this), 250);
			},


			_update : function() {
				this.updating = true;
				this._setTitle();

				this.measurements = [];

				if( this.contents.measurements && this.contents.measurements.length > 0 ) {
					for( var i = 0; i < this.contents.measurements.length; i++ ) {

						var sp = document.createElement('esis-measurement');

						sp.datapoints = this.contents.measurements[i].datapoints;
						sp.metadata.measurement = this.contents.measurements[i].metadata;
						sp.filename = this.contents.info.name.replace(/.*\//,'');
						sp.sheetname = this.contents.sheetName;

						if( this.contents.metadata ) {
							for( var key in this.contents.metadata ) {
								sp.metadata.file[key] = this.contents.metadata[key];
							}
						}

						this.measurements.push(sp);
					}

					//
				} else if( this.contents.joindata && this.contents.joindata.length > 0 ) {
					
					this.metadata = document.createElement('esis-metadata');
					this.metadata.contents = this.contents;
					this.metadata.metadata = this.contents.joindata;
					this.isMetadata = true;
				}

				this.updating = false;
				this.fire('datasheet-updated');
			},

			setResourceId : function(resourceId) {
				this.resourceId = resourceId;
				for( var i = 0; i < this.measurements.length; i++ ) {
					this.measurements[i].resourceId = resourceId;
				}
				this.metadata.resourceId = resourceId;
			},

			joinAttributes : function() {
				if( !this.isMetadata ) return [];
				return this.metadata.joinAttributes();
			},

			_setTitle : function() {
				if( !this.contents ) return;
				if( Object.keys(this.contents).length == 0 ) return;

				var name = this.contents.name || this.contents.info.name;
				this.label = name.replace(/.*\//,'');
				if( this.contents.sheetName && this.contents.sheetName != '' ) this.label += ' - '+this.contents.sheetName;
				if( this.label.length == 0 || this.label == ' ' ) this.label = name;
			}
		});
	;

		Polymer('esis-resource', {
			contents   : null,
			filename   : '',
			mimetype   : '',
			ext        : '',
			datasheets : [],
			title      : '',
			resourceId  : '',

			dataType : '',

			knownAttributes : {},

			observe : {
				filename : '_setTitle',
				datasheets : '_updateAttributes'
			},

			_setTitle : function() {
				this.title = this.filename.replace(/.*\//,'');
				if( this.title.length == 0 || this.title == ' ' ) this.title = this.filename;
			},

			setId : function(resourceId) {
				this.resourceId = resourceId;

                if( !this.datasheets ) return;
                
				for( var i = 0; i < this.datasheets.length; i++ ) {
					this.datasheets[i].setResourceId(resourceId);
				}
			},

			// update what attributes exist inside this resources datasheets and what we think they are
			_updateAttributes : function() {
                if( !this.datasheets ) return;

				for( var i = 0; i < this.datasheets.length; i++ ) {
				 	if( this.datasheets[i].measurements.length == 0 ) continue;

                    var m = this.datasheets[i].measurements[0];

                    for( var j = 0; j < m.data.length; j++ ) {
                    	this._addKnownAttribute(m.data[j].key, 'data');
                    }

                    for( var key in m.metadata ) {
                    	for( var mkey in m.metadata[key] ){
                    		this._addKnownAttribute(mkey, 'metadata');
                    	}	
                    }
                }
			},

			_addKnownAttribute : function(key, type) {
				if( !this.knownAttributes[key] ) {
                    this.knownAttributes[key] = type;
                }
			}

		});
	;

		Polymer('esis-datastore', {
			// is this an existing dataset
			editMode : false,

			// information about exsiting resources
			existing : {
				resources : [],
				metadata  : [],
				data      : []
			},

			data : {
				title : '',
				name : '',
				notes : '',
				author : '',
				author_email : '',
				license_id : '',
				license_title : '',
				maintainer : '',
				maintainer_email : '',
				version : '',
				owner_org : '',
				tags : [],
				private : false
			},
			owner_org_name : '',

			datasetAttributes : {
				group_by : '',
				// TODO: make sort into array
				sort_on : '',
				sort_type : '',
				sort_description : '',
				location : '',
			},

			// field that should be used to create uids for measurements
			measurementDisambiguator : '',

			// list of all new files
			files : [],
			// list of all datasheets
			datasheets : [],
			// list of all new resources
			resources  : [],

			// hash of current attribute name mappings
			//  - key: ecosis name
			//  - value: dataset name
			attributeMap : {},
			// inverse list of above map w/ key / value switched
			inverseAttributeMap : {},

			metadataDefinitions : {},

			// list of currently known attributes for this dataset for existing data
			//   - this is a list of objects.  each object has the structure
			//       |- name : attribute name
			//       |- type : (data | metadata)
			//       \- flag : (1, 2, etc) 
			existingAttributeTypes : [],

			ATTR_FLAGS : {
				// the attribute is from a joined metadata file, always metadata
				FROM_METADATA : 1,
				// the attribute type could be data or metadata
				FROM_MIXED_FILE : 2,
				// the attribute name is numberic and is there for a wavelength
				IS_WAVELENGTH : 3,
				// the attribute is from global metadata
				IS_FILE_METADATA : 4,
				// the attribute is measurement level metadata
				IS_MEASUREMENT_METADATA : 5,
				// the attribute is measurement level data, from the data section of the file
				IS_FILE_DATA : 6
			},

			// attributes who's infered type has been overridden by the user
			attributeModifications : {},

			// the key is the attribute name, the value is an object describing what we know about the attribute
			// this combined with the attributeModifications object describes the current state of the attribute
			// use getAllAttributeTypes() to access
			//attributeTypes : {},

			// list of resources that are scheduled to be deleted
			deleted : [],

			observe : {
			//	attributeMap : '_onAttributeMapUpdate'
			},

			ready : function() {
				if( this.data.title == '' ) window.location.hash = '#basic-fields';
				this.metadataDefinitions = esis.metadata;
			},

			addFile : function(raw, parseZip, defaultDataType) {
				var ele = document.createElement('esis-file');
				ele.raw = raw;
				ele.parseZip = parseZip;
				ele.defaultDataType = defaultDataType;
				this.files.push(ele);
				return ele;
			},

			removeFile : function(file) {
				var index = this.files.indexOf(file);
				if( index > -1 ) {
					this.files.splice(index, 1);

					// remove anything from the datasheet or resource list
					for( var i = 0; i < file.datasheets.length; i++ ) {
						index = this.datasheets.indexOf(file.datasheets[i]);
						if( index > -1 ) this.datasheets.splice(index, 1);
					}

					for( var i = 0; i < file.resources.length; i++ ) {
						index = this.resources.indexOf(file.resources[i]);
						if( index > -1 ) this.resources.splice(index, 1);
					}
				}
			},

			addDatasheet : function(contents) {
				var ele = document.createElement('esis-datasheet');

				// attach listener for when attributes have been aggregated
				// add to known list when done
				ele.addEventListener('datasheet-updated', function(e){
					//this._addKnownAttributes(e.detail);
					this.datasheetJoin(ele);
				}.bind(this));

				ele.contents = contents;

				// move attributeTypes to first class citizen 
				if( ele.contents.attributeTypes ) {
					ele.attributeTypes = ele.contents.attributeTypes;
					delete ele.contents.attributeTypes;
				}

				this.datasheets.push(ele);
				
				return ele;
			},

			addResource : function(resource, datasheets) {
				var ele = document.createElement('esis-resource');
				ele.filename = resource.name || resource.info.name;
				ele.mimetype = resource.file ? resource.file.type : resource.info.mime;
				ele.ext = resource.info.ext;
				ele.datasheets = datasheets;
				this.resources.push(ele);
				return ele;
			},

			removeResource : function(id) {
				// remove resource
				for( var i = 0; i < this.existing.resources.length; i++ ) {
					if( this.existing.resources[i].id == id ) {
						this.existing.resources.splice(i,1);
						break;
					}
				}

				// remove any measurements associated with this resource
				for( var i = this.existing.data.length-1; i >= 0; i-- ) {
					if( this.existing.data[i].resource_id == id ) {
						this.existing.data.splice(i,1);
					}
				}

				// remove any metadata associated with this resource
				for( var i = this.existing.metadata.length-1; i >= 0; i-- ) {
					if( this.existing.metadata[i].resource_id == id ) {
						this.existing.metadata.splice(i, 1);
					}
				}

				this.deleted.push(id);
			},

			// when a datasheet is first added, make sure all metadata is properly joined in
			datasheetJoin : function(datasheet) {
				if( datasheet.isMetadata ) return;


				// make sure currently joined (new) metadata is joined
				for( var i = 0; i < this.datasheets.length; i++ ) {
					if( !this.datasheets[i].isMetadata ) continue;

					var count = 0;
					for( var j = 0; j < datasheet.measurements.length; j++ ) {
						if( this.datasheets[i].metadata.join(datasheet.measurements[j]) ) count++;
					}
					this.datasheets[i].metadata.matchCount += count;
				}
			},

			getAllAttributeTypes : function() {
				var attrTypes = {}, item;
				for( var i = 0; i < this.datasheets.length; i++ ) {
					for( var key in this.datasheets[i].attributeTypes ) {
						attrTypes[key] = this.datasheets[i].attributeTypes[key];
					}
				}

				// override the current datasheets with what's already known
				for( var i = 0; i < this.existingAttributeTypes.length; i++ ) {
					item = this.existingAttributeTypes[i];
					attrTypes[item.name] = {
						type : item.type,
						flag : item.flag
					}
				}

				return attrTypes;
			},

			join : function(metadata) {
				var count = 0;
				
				// join on new measurements
				for( var i = 0; i < this.datasheets.length; i++ ) {
					if( this.datasheets[i].isMetadata ) continue;

					for( var j = 0; j < this.datasheets[i].measurements.length; j++ ) {
						if( metadata.join(this.datasheets[i].measurements[j]) ) count++;
					}
				}

				metadata.matchCount = count;
			}

		});
	;

        Polymer('esis-extractor', {

            ds : null,

            ready : function() {
                this.ds = document.querySelector('esis-datastore');
            },

            // type - 'spectral', 'timeseries', 'metadata'
            run : function(type, contents) {
                var resp = {
                    metadata : {},
                    measurements : [],
                    attributeTypes : {}
                }

                if( contents === null ) {
                    return resp;
                } else if ( contents.length == 0 ) {
                    return resp;
                }

                if( type == 'metadata' ) {
                    var data = this._parseAsMetadata(contents);
                    resp.joindata = data.joindata;
                    resp.attributeTypes = data.attributeTypes;
                    return resp;
                }

                // where are the horizontal ranges of data
                var hRanges = this._getHRanges(contents);

                // get vertical ranges. Only for datapoints in timeseries
                var vRanges = this._getVRanges(contents, type, hRanges); 

                resp.metadata = this._getFileMetadata(contents, hRanges);
                var data = this._getMeasurements(contents, type, hRanges, vRanges);

                // add the file level metadata to the attribute type list
                for( var key in resp.metadata ) {
                    data.attributeTypes[key] = { 
                        guess : false,
                        type : 'metadata',
                        flag : this.ds.ATTR_FLAGS.IS_FILE_METADATA
                    }
                }

                if( data.error ) {
                    resp.error = true;
                } else {
                    resp.measurements = data.measurements;
                    resp.attributeTypes = data.attributeTypes;
                }

                return resp;
            },

            _parseAsMetadata : function(contents) {
                var joindata = [];
                var attributeTypes = {};

                for( var i = 1; i < contents.length; i++ ) {
                    var md = {};
                    for( var j = 0; j < contents[0].length; j++ ) {
                        md[contents[0][j]] = contents[i][j];

                        if( i == 1 ) {
                            attributeTypes[contents[0][j]] = { 
                                guess : false,
                                type : 'metadata',
                                flag : this.ds.ATTR_FLAGS.FROM_METADATA
                            };
                        }
                    }
                    joindata.push(md);
                }

                return {
                    joindata : joindata,
                    attributeTypes : attributeTypes
                };
            },

            // returns the starting point after the break (in case there are multiple line breaks)
            _getHRanges : function(contents) {
                var ranges = [];

                var cStart = 0;
                var cStop = 0;
                var processing = true;
                var empty = false;

                for( var i = 0; i < contents.length; i++ ) {
                    empty = false;
                    if( contents[i].length == 0 ) empty = true;
                    else if( contents[i][0].length == 0 ) empty = true;

                    if( empty && processing ) {
                        processing = false;
                        ranges.push({
                            start : cStart,
                            stop  : cStop
                        });
                        continue;
                    } else if ( empty ) {
                        continue;
                    }

                    if( processing ) {
                        cStop = i;
                    } else {
                        processing = true;
                        cStart = i;
                    }
                }

                ranges.push({
                    start : cStart,
                    stop  : cStop
                });

                return ranges;
            },

            _getVRanges : function(contents, type, hRanges) {
                var ranges = [];

                if( type != 'timeseries' ) return ranges;
                if( hRanges.length == 0 ) return ranges;

                var startRow = 0;
                if( hRanges.length == 2 ) {
                    startRow = hRanges[1].start;
                }

                var row = contents[startRow];
                var cStart = 0;
                var cStop = 0;
                var processing = true;
                var empty = false;

                for( var i = 0; i < row.length; i++ ) {
                    empty = false;
                    if( row[i].length == 0 ) empty = true;

                    if( empty && processing ) {
                        processing = false;
                        ranges.push({
                            start : cStart,
                            stop  : cStop
                        });
                        continue;
                    } else if ( empty ) {
                        continue;
                    }

                    if( processing ) {
                        cStop = i;
                    } else {
                        processing = true;
                        cStart = i;
                    }
                }

                ranges.push({
                    start : cStart,
                    stop  : cStop
                });

                return ranges;
            },

            _getFileMetadata : function(contents, hRanges) {
                // if there is only one range of data, there is not file metadata
                if( hRanges.length == 1 ) return {};

                // if the first row doesn't have exactly two columns, there is a problem
                for( var i = 0; i <= hRanges[0].stop; i++ ) {
                    if( contents[i].length == 1 ) {
                        return {};
                    } else if( contents[i].length >= 3 && contents[i][2] != '' ) {
                        return {};
                    }
                }

                var fileMetadata = {};
                for( var i = 0; i <= hRanges[0].stop; i++ ) {
                    fileMetadata[contents[i][0]] = contents[i][1];
                }
                return fileMetadata;
            },

            _getMeasurements : function(contents, type, hRanges, vRanges) {

                // actual measurements being parsed
                var measurements = []; 
                // what we are guessing the attributes are (data v metadata)
                var attributeTypes = {}; 

                // we are parsing as though attribute names are vertical in column A
                if( type == 'spectra' ) {

                    var dataRange = null, metadataRange = null, guess = true;

                    // there is only one range of data, it's all data and we
                    // should guess on type
                    if( hRanges.length == 1 ) {
                        dataRange = hRanges[0];

                    // there are two ranges of data
                    } else if ( hRanges.length == 2 ) {
                        // the first range is global file metadata, the second is
                        // data and we should guess on type
                        if( contents[0].length == 2 ) {
                            dataRange = hRanges[1];

                        // the first range is metadata and the second range is data
                        // no need to guess on type
                        } else {
                            guess = false;
                            metadataRange = hRanges[0];
                            dataRange = hRanges[1];
                        }
                    
                    // there are three ranges.  user gave use everything via format
                    } else if( hRanges.length > 2 ) {
                        guess = false;
                        metadataRange = hRanges[1];
                        dataRange = hRanges[2];
                    }

                    if( !dataRange ) return {error : true};

                    // find what rows are thought to be data (match numberic value) or metadata (doesn't)
                    var dataRows = this._findDataRows(contents, dataRange.start);

                    var len = contents[dataRange.start].length, i, j;
                    for( i = 1; i < len; i++ ) {
                        var measurement = {
                            metadata : {},
                            datapoints : []
                        };

                        // add metadata range for this column
                        if( metadataRange ) {
                            for( j = metadataRange.start; j <= metadataRange.stop; j++ ) {
                                // add known metadata from metadata range
                                measurement.metadata[contents[j][0]] = contents[j][i];

                                // mark the attribute type on first pass
                                if( i == 1 ) {
                                    attributeTypes[contents[j][0]] = { 
                                        guess : false,
                                        type : 'metadata',
                                        flag : this.ds.ATTR_FLAGS.IS_MEASUREMENT_METADATA
                                    };
                                }
                            }
                        }

                        // add datarange for this column
                        for( j = dataRange.start; j <= dataRange.stop; j++ ) {
                            var key = contents[j][0];

                            // this is data
                            if( dataRows[key] || !guess ) {
                                measurement.datapoints.push({
                                    key : key,
                                    value : contents[j][i]
                                });

                                // this is a numberic or we are not guessing
                                // either way type is implied
                                if( i == 1 ) {
                                    attributeTypes[key] = { 
                                        guess : false,
                                        type : 'data',
                                        flag : dataRows[key] ? this.ds.ATTR_FLAGS.IS_WAVELENGTH :
                                                                this.ds.ATTR_FLAGS.IS_FILE_DATA
                                    };
                                }

                            // this is metadata
                            } else {
                            
                                // we are guess, by default we will say 'metadata', but check
                                // any specified values first
                                var type = 'metadata';
                                if( this.ds.attributeModifications[key] ) {
                                    type = this.ds.attributeModifications[key];
                                }

                                // set to correct type
                                if( type == 'metadata' ) {
                                    measurement.metadata[key] = contents[j][i];
                                } else {
                                    measurement.datapoints.push({
                                        key: key,
                                        value : contents[j][i]
                                    });
                                }


                                if( i == 1 ) {
                                    attributeTypes[key] = { 
                                        guess : guess,
                                        type : type,
                                        flag : this.ds.ATTR_FLAGS.FROM_MIXED_FILE
                                    };
                                }
                            }
                        }

                        measurements.push(measurement);
                    }

                // we are parsing as though attribute names are in a row with values
                // in column below
                } else if ( type == 'timeseries' ) {
                    var startRow = 0;
                    var stopRow = 0;
                    var dataRange = null, metadataRange = null, guess = true;

                    // there is only one range of data, no global file metadata provided
                    if( hRanges.length == 1 ) {
                        startRow = hRanges[0].start;
                        stopRow = hRanges[0].stop;
                        
                    // user provided file metadata
                    } else if ( hRanges >= 2 ) {
                        startRow = hRanges[1].start;
                        stopRow = hRanges[1].stop;
                    }

                    // only one data group, guess on type 
                    if( vRanges.length == 1 ) {
                        dataRange = vRanges[0];

                    // user has specified metadata and data, no need to guess on type
                    } else if ( vRanges.length > 1 ) {
                        metadataRange = vRanges[0];
                        dataRange = vRanges[1];
                        guess = false;
                    }

                    if( !dataRange ) return {error : true};

                    var dataCols = {};
                    if( guess ) {
                        dataCols = this._findDataCols(contents, startRow);
                    }

                    var i, j, row, measurement, key;

                    // the actual 'startRow' should be the row of attribute names
                    for( i = startRow+1; i <= stopRow; i++ ) {
                        measurement = {
                            metadata : {},
                            datapoints : []
                        };
                        row = contents[i];

                        // if we have a metadata block, add the metadata
                        if( metadataRange ) {
                            for( j = metadataRange.start; j <= metadataRange.stop; j++ ) {
                                 measurement.metadata[contents[startRow][j]] = row[j];

                                // on first pass, keep track of attribute information
                                if( i == startRow+1 ) {
                                    attributeTypes[contents[j][0]] = { 
                                        guess : false,
                                        type : 'metadata',
                                        flag : this.ds.ATTR_FLAGS.IS_MEASUREMENT_METADATA
                                    };
                                }
                            }
                        }

                        // add datarange for this column
                        for( j = dataRange.start; j <= dataRange.stop; j++ ) {
                            key = contents[startRow][j];

                            // this is data
                            if( dataCols[key] || !guess ) {
                                measurement.datapoints.push({
                                    key : key,
                                    value : row[j]
                                });

                                // mark the attribute type on first pass
                                if( i == startRow+1 ) {
                                    attributeTypes[key] = { 
                                        guess : false,
                                        type : 'data',
                                        flag : dataCols[key] ? this.ds.ATTR_FLAGS.IS_WAVELENGTH :
                                                                this.ds.ATTR_FLAGS.IS_FILE_DATA
                                    };
                                }


                            // this is metadata
                            } else {
                               
                                // we are guess, by default we will say 'metadata', but check
                                // any specified values first
                                var type = 'metadata';
                                if( this.ds.attributeModifications[key] ) {
                                    type = this.ds.attributeModifications[key];
                                }

                                // set to correct type
                                if( type == 'metadata' ) {
                                    measurement.metadata[key] = row[j];
                                } else {
                                    measurement.datapoints.push({
                                        key: key,
                                        value : row[j]
                                    });
                                }

                                // mark the attribute type on first pass
                                if( i == startRow+1 ) {
                                    attributeTypes[key] = { 
                                        guess : guess,
                                        type : type,
                                        flag : this.ds.ATTR_FLAGS.FROM_MIXED_FILE
                                    };
                                }
                            }
                        }

                        measurements.push(measurement);
                    }
                }

                return {
                    measurements : measurements,
                    attributeTypes : attributeTypes
                }
            },


            // attempt to sniff out data columns.
            _findDataCols : function(content, startRow) {
                var data = {};

                for( var i = 0; i < content[startRow].length; i++ ) {
                    var key = content[startRow][i];
            
                    if( key.match(/^-?\d+\.?\d*$/) || key.match(/^-?\d*\.\d+$/) ) {
                        data[key] = true;
                    } else {
                        data[key] = false;
                    }
                    
                }

                return data;
            },

            // any attribute name that matches a numberic value will be assumed wavelength and
            // marked as data, otherwise it will be assumed as metadata.  This is for when
            // the user doesn't add the second break to their file
            _findDataRows : function(content, startRow) {
                var data = {};
                var re1 = /^-?\d+\.?\d*$/;
                var re2 = /^-?\d*\.\d+$/;

                for( var i = startRow; i < content.length; i++ ) {
                    var key = content[i][0];

                    if( re1.exec(key) || re2.exec(key) ) {
                        data[key] = true;
                    } else {
                        data[key] = false;
                    }
                    
                }

                return data;
            }


        });
    ;

		Polymer('esis-parser',{
			extractor : null,

			ready : function() {
				this.extractor = document.querySelector('esis-extractor');
			},

			parse : function(file, callback) {
				var arr = [];
				var info = file.info;
				var contents = file.contents;

				if( info.ext == 'xlsx' ) {
					try {

						var ref = this;
						function onXlsxComplete(wb){
							var count = 0;

							var list = wb.SheetNames;
							for( i = 0; i < list.length; i++ ) {
								var sheetName = list[i];
								var worksheet = wb.Sheets[sheetName];
								
								var data = ref.sheet_to_array(wb.Sheets[sheetName]);
								if( !data ) data = [[]];

								var resp = ref.extractor.run(file.defaultDataType, data);
								count++;
								resp.sheetName = sheetName;
								resp.array = data;
								ref.onComplete(null, resp, info, count, wb.SheetNames.length, arr, callback);
							};
						}

						var worker = new Worker('components/js-xlsx/xlsxworker.js');
						worker.onmessage = function(e) {
							switch(e.data.t) {
								case 'ready': break;
								case 'e': console.error(e.data.d); break;
								case 'xlsx': onXlsxComplete(JSON.parse(e.data.d)); break;
							}
						};
						worker.postMessage({d:contents,b:true});

					} catch(e) {
						debugger;
						this.onComplete(e, null, info, 1, 1, arr, callback);
					}
				} else if( info.ext == 'xls' ) {
					try {

						var ref = this;
						function onXlsComplete(wb){
							wb = XLS.read(contents, {type: 'binary'});

							var count = wb.SheetNames.length;
							var list = wb.SheetNames;
							for( i = 0; i < list.length; i++ ) {
								var sheetName = list[i];
								var worksheet = wb.Sheets[sheetName];
								
								var data = ref.sheet_to_array(wb.Sheets[sheetName]);
								if( !data ) data = [[]];

								var resp = ref.extractor.run(file.defaultDataType, data);
								count++;
								resp.sheetName = sheetName;
								resp.array = data;
								ref.onComplete(null, resp, info, count, wb.SheetNames.length, arr, callback);
							};
						}

						var worker = new Worker('components/js-xls/xlsworker.js');
						worker.onmessage = function(e) {
							switch(e.data.t) {
								case 'ready': break;
								case 'e': console.error(e.data.d); break;
								case 'xlsx': onXlsComplete(JSON.parse(e.data.d)); break;
							}
						};
						worker.postMessage({d:contents,b:true});

					} catch(e) {
						debugger;
						this.onComplete(e, null, info, 1, 1, arr, callback);
					}
				} else if ( info.hasData ) {
					//try {
						var options = {};
						if( info.parser == 'csv-tab' ) options.separator = '\t';
						if( info.parser == 'csv-4spaces' ) options.separator = '    ';
						if( info.parser == 'csv-2spaces' ) options.separator = '  ';

						$.csv.toArrays(contents, options, function(err, data){
							if( err ) return onComplete(err, null, info, 1, 1, arr, callback);

							var resp = this.extractor.run(file.defaultDataType, data);
							resp.array = data;
							this.onComplete(null, resp, info, 1, 1, arr, callback);

						}.bind(this));
					//} catch(e) {
					//	debugger;
					//	this.onComplete(e, null, info, 1, 1, arr, callback);
					//}
				} else {
					this.onComplete(null, null, info, 1, 1, arr, callback);
				}
			},

			/**
			 * err - was there an error parsing the data
			 * data - response from esis-extractor
			 * info - general information about the file the datasheet came from
			 * index - current datasheet index we just parsed
			 * total - total number of datasheets in this file
			 * arr - the response array of resources we will send back when everything is done
			 * callback - function to call when all datasheets have been parsed for this file
			 **/
			onComplete : function(err, data, info, index, total, arr, callback) {
				if( err ) {
					data = {
						error : err
					}
				} else if( !data ) {
					data = {
						error : 'Unknown parse error'
					}
				} else if( data.measurements.length == 0 && 
					Object.keys(data.metadata).length == 0 &&
					!data.joindata ) {
					data.warning = 'No metadata or measurements found';
				}

				data.name = info.name;
				if( total > 1 ) {
					if( !data.sheetName ) data.sheetName = index;
				}

				data.info = {};
				for( key in info ) data.info[key] = info[key];

				// don't want to add datasheets as resources
				data.info.type = 'data';

				arr.push(data);

				if( index == total ) callback(arr);
			},

			sheet_to_array : function(sheet) {
				var out = [], txt = "";
				if(sheet == null || sheet["!ref"] == null) return "";
				var r = this.safe_decode_range(sheet["!ref"]);
				var row = [], rr = "", cols = [];
				var i = 0, cc = 0, val;
				var R = 0, C = 0;
				for(C = r.s.c; C <= r.e.c; ++C) cols[C] = XLSX.utils.encode_col(C);
				for(R = r.s.r; R <= r.e.r; ++R) {
					row = [];
					rr = XLSX.utils.encode_row(R);
					for(C = r.s.c; C <= r.e.c; ++C) {
						val = sheet[cols[C] + rr];
						txt = val !== undefined ? ''+XLSX.utils.format_cell(val) : "";
						row.push(txt);
					}
					out.push(row);
				}
				return out;
			},

			// from XLSX utils...
			safe_decode_range : function(range) {
				var o = {s:{c:0,r:0},e:{c:0,r:0}};
				var idx = 0, i = 0, cc = 0;
				var len = range.length;
				for(idx = 0; i < len; ++i) {
					if((cc=range.charCodeAt(i)-64) < 1 || cc > 26) break;
					idx = 26*idx + cc;
				}
				o.s.c = --idx;

				for(idx = 0; i < len; ++i) {
					if((cc=range.charCodeAt(i)-48) < 0 || cc > 9) break;
					idx = 10*idx + cc;
				}
				o.s.r = --idx;

				if(i === len || range.charCodeAt(++i) === 58) { o.e.c=o.s.c; o.e.r=o.s.r; return o; }

				for(idx = 0; i != len; ++i) {
					if((cc=range.charCodeAt(i)-64) < 1 || cc > 26) break;
					idx = 26*idx + cc;
				}
				o.e.c = --idx;

				for(idx = 0; i != len; ++i) {
					if((cc=range.charCodeAt(i)-48) < 0 || cc > 9) break;
					idx = 10*idx + cc;
				}
				o.e.r = --idx;
				return o;
			}
		});
	;

    Polymer('core-transition', {
      
      type: 'transition',

      /**
       * Run the animation.
       *
       * @method go
       * @param {Node} node The node to apply the animation on
       * @param {Object} state State info
       */
      go: function(node, state) {
        this.complete(node);
      },

      /**
       * Set up the animation. This may include injecting a stylesheet,
       * applying styles, creating a web animations object, etc.. This
       *
       * @method setup
       * @param {Node} node The animated node
       */
      setup: function(node) {
      },

      /**
       * Tear down the animation.
       *
       * @method teardown
       * @param {Node} node The animated node
       */
      teardown: function(node) {
      },

      /**
       * Called when the animation completes. This function also fires the
       * `core-transitionend` event.
       *
       * @method complete
       * @param {Node} node The animated node
       */
      complete: function(node) {
        this.fire('core-transitionend', null, node);
      },

      /**
       * Utility function to listen to an event on a node once.
       *
       * @method listenOnce
       * @param {Node} node The animated node
       * @param {string} event Name of an event
       * @param {Function} fn Event handler
       * @param {Array} args Additional arguments to pass to `fn`
       */
      listenOnce: function(node, event, fn, args) {
        var self = this;
        var listener = function() {
          fn.apply(self, args);
          node.removeEventListener(event, listener, false);
        }
        node.addEventListener(event, listener, false);
      }

    });
  ;

    Polymer('core-key-helper', {
      ENTER_KEY: 13,
      ESCAPE_KEY: 27
    });
  ;

(function() {

  Polymer('core-overlay-layer', {
    publish: {
      opened: false
    },
    openedChanged: function() {
      this.classList.toggle('core-opened', this.opened);
    },
    /**
     * Adds an element to the overlay layer
     */
    addElement: function(element) {
      if (!this.parentNode) {
        document.querySelector('body').appendChild(this);
      }
      if (element.parentNode !== this) {
        element.__contents = [];
        var ip$ = element.querySelectorAll('content');
        for (var i=0, l=ip$.length, n; (i<l) && (n = ip$[i]); i++) {
          this.moveInsertedElements(n);
          this.cacheDomLocation(n);
          n.parentNode.removeChild(n);
          element.__contents.push(n);
        }
        this.cacheDomLocation(element);
        this.updateEventController(element);
        var h = this.makeHost();
        h.shadowRoot.appendChild(element);
        element.__host = h;
      }
    },
    makeHost: function() {
      var h = document.createElement('overlay-host');
      h.createShadowRoot();
      this.appendChild(h);
      return h;
    },
    moveInsertedElements: function(insertionPoint) {
      var n$ = insertionPoint.getDistributedNodes();
      var parent = insertionPoint.parentNode;
      insertionPoint.__contents = [];
      for (var i=0, l=n$.length, n; (i<l) && (n=n$[i]); i++) {
        this.cacheDomLocation(n);
        this.updateEventController(n);
        insertionPoint.__contents.push(n);
        parent.appendChild(n);  
      }
    },
    updateEventController: function(element) {
      element.eventController = this.element.findController(element);
    },
    /**
     * Removes an element from the overlay layer
     */
    removeElement: function(element) {
      element.eventController = null;
      this.replaceElement(element);
      var h = element.__host;
      if (h) {
        h.parentNode.removeChild(h);
      }
    },
    replaceElement: function(element) {
      if (element.__contents) {
        for (var i=0, c$=element.__contents, c; (c=c$[i]); i++) {
          this.replaceElement(c);
        }
        element.__contents = null;
      }
      if (element.__parentNode) {
        var n = element.__nextElementSibling && element.__nextElementSibling 
            === element.__parentNode ? element.__nextElementSibling : null;
        element.__parentNode.insertBefore(element, n);
      }
    },
    cacheDomLocation: function(element) {
      element.__nextElementSibling = element.nextElementSibling;
      element.__parentNode = element.parentNode;
    }
  });
  
})();
;

(function() {

  Polymer('core-overlay', {

    publish: {
      /**
       * The target element that will be shown when the overlay is 
       * opened. If unspecified, the core-overlay itself is the target.
       *
       * @attribute target
       * @type Object
       * @default the overlay element
       */
      target: null,


      /**
       * A `core-overlay`'s size is guaranteed to be 
       * constrained to the window size. To achieve this, the sizingElement
       * is sized with a max-height/width. By default this element is the 
       * target element, but it can be specifically set to a specific element
       * inside the target if that is more appropriate. This is useful, for 
       * example, when a region inside the overlay should scroll if needed.
       *
       * @attribute sizingTarget
       * @type Object
       * @default the target element
       */
      sizingTarget: null,
    
      /**
       * Set opened to true to show an overlay and to false to hide it.
       * A `core-overlay` may be made initially opened by setting its
       * `opened` attribute.
       * @attribute opened
       * @type boolean
       * @default false
       */
      opened: false,

      /**
       * If true, the overlay has a backdrop darkening the rest of the screen.
       * The backdrop element is attached to the document body and may be styled
       * with the class `core-overlay-backdrop`. When opened the `core-opened`
       * class is applied.
       *
       * @attribute backdrop
       * @type boolean
       * @default false
       */    
      backdrop: false,

      /**
       * If true, the overlay is guaranteed to display above page content.
       *
       * @attribute layered
       * @type boolean
       * @default false
      */
      layered: false,
    
      /**
       * By default an overlay will close automatically if the user
       * taps outside it or presses the escape key. Disable this
       * behavior by setting the `autoCloseDisabled` property to true.
       * @attribute autoCloseDisabled
       * @type boolean
       * @default false
       */
      autoCloseDisabled: false,

      /**
       * By default an overlay will focus its target or an element inside
       * it with the `autoFocus` attribute. Disable this
       * behavior by setting the `autoFocusDisabled` property to true.
       * @attribute autoFocusDisabled
       * @type boolean
       * @default false
       */
      autoFocusDisabled: false,

      /**
       * This property specifies an attribute on elements that should
       * close the overlay on tap. Should not set `closeSelector` if this
       * is set.
       *
       * @attribute closeAttribute
       * @type string
       * @default "core-overlay-toggle"
       */
      closeAttribute: 'core-overlay-toggle',

      /**
       * This property specifies a selector matching elements that should
       * close the overlay on tap. Should not set `closeAttribute` if this
       * is set.
       *
       * @attribute closeSelector
       * @type string
       * @default ""
       */
      closeSelector: '',

      /**
       * The transition property specifies a string which identifies a 
       * <a href="../core-transition/">`core-transition`</a> element that 
       * will be used to help the overlay open and close. The default
       * `core-transition-fade` will cause the overlay to fade in and out.
       *
       * @attribute transition
       * @type string
       * @default 'core-transition-fade'
       */
      transition: 'core-transition-fade'

    },

    captureEventName: 'tap',
    targetListeners: {
      'tap': 'tapHandler',
      'keydown': 'keydownHandler',
      'core-transitionend': 'transitionend'
    },
    
    registerCallback: function(element) {
      this.layer = document.createElement('core-overlay-layer');
      this.keyHelper = document.createElement('core-key-helper');
      this.meta = document.createElement('core-transition');
      this.scrim = document.createElement('div');
      this.scrim.className = 'core-overlay-backdrop';
    },

    ready: function() {
      this.target = this.target || this;
      // flush to ensure styles are installed before paint
      Platform.flush();
    },

    /** 
     * Toggle the opened state of the overlay.
     * @method toggle
     */
    toggle: function() {
      this.opened = !this.opened;
    },

    /** 
     * Open the overlay. This is equivalent to setting the `opened`
     * property to true.
     * @method open
     */
    open: function() {
      this.opened = true;
    },

    /** 
     * Close the overlay. This is equivalent to setting the `opened` 
     * property to false.
     * @method close
     */
    close: function() {
      this.opened = false;
    },

    domReady: function() {
      this.ensureTargetSetup();
    },

    targetChanged: function(old) {
      if (this.target) {
        // really make sure tabIndex is set
        if (this.target.tabIndex < 0) {
          this.target.tabIndex = -1;
        }
        this.addElementListenerList(this.target, this.targetListeners);
        this.target.style.display = 'none';
        this.target.__overlaySetup = false;
      }
      if (old) {
        this.removeElementListenerList(old, this.targetListeners);
        var transition = this.getTransition();
        if (transition) {
          transition.teardown(old);
        } else {
          old.style.position = '';
          old.style.outline = '';
        }
        old.style.display = '';
      }
    },

    transitionChanged: function(old) {
      if (!this.target) {
        return;
      }
      if (old) {
        this.getTransition(old).teardown(this.target);
      }
      this.target.__overlaySetup = false;
    },

    // NOTE: wait to call this until we're as sure as possible that target
    // is styled.
    ensureTargetSetup: function() {
      if (!this.target || this.target.__overlaySetup) {
        return;
      }
      if (!this.sizingTarget) {
        this.sizingTarget = this.target;
      }
      this.target.__overlaySetup = true;
      this.target.style.display = '';
      var transition = this.getTransition();
      if (transition) {
        transition.setup(this.target);
      }
      var style = this.target.style;
      var computed = getComputedStyle(this.target);
      if (computed.position === 'static') {
        style.position = 'fixed';
      }
      style.outline = 'none';
      style.display = 'none';
    },

    openedChanged: function() {
      this.transitioning = true;
      this.ensureTargetSetup();
      this.prepareRenderOpened();
      // async here to allow overlay layer to become visible.
      this.async(function() {
        this.target.style.display = '';
        // force layout to ensure transitions will go
        this.target.offsetWidth;
        this.renderOpened();
      });
      this.fire('core-overlay-open', this.opened);
    },

    // tasks which must occur before opening; e.g. making the element visible
    prepareRenderOpened: function() {
      if (this.opened) {
        addOverlay(this);
      }
      this.prepareBackdrop();
      // async so we don't auto-close immediately via a click.
      this.async(function() {
        if (!this.autoCloseDisabled) {
          this.enableElementListener(this.opened, document,
              this.captureEventName, 'captureHandler', true);
        }
      });
      this.enableElementListener(this.opened, window, 'resize',
          'resizeHandler');

      if (this.opened) {
        // force layout so SD Polyfill renders
        this.target.offsetHeight;
        this.discoverDimensions();
        // if we are showing, then take care when positioning
        this.preparePositioning();
        this.positionTarget();
        this.updateTargetDimensions();
        this.finishPositioning();
        if (this.layered) {
          this.layer.addElement(this.target);
          this.layer.opened = this.opened;
        }
      }
    },

    // tasks which cause the overlay to actually open; typically play an
    // animation
    renderOpened: function() {
      var transition = this.getTransition();
      if (transition) {
        transition.go(this.target, {opened: this.opened});
      } else {
        this.transitionend();
      }
      this.renderBackdropOpened();
    },

    // finishing tasks; typically called via a transition
    transitionend: function(e) {
      // make sure this is our transition event.
      if (e && e.target !== this.target) {
        return;
      }
      this.transitioning = false;
      if (!this.opened) {
        this.resetTargetDimensions();
        this.target.style.display = 'none';
        this.completeBackdrop();
        removeOverlay(this);
        if (this.layered) {
          if (!currentOverlay()) {
            this.layer.opened = this.opened;
          }
          this.layer.removeElement(this.target);
        }
      }
      this.fire('core-overlay-' + (this.opened ? 'open' : 'close') + 
          '-completed');
      this.applyFocus();
    },

    prepareBackdrop: function() {
      if (this.backdrop && this.opened) {
        if (!this.scrim.parentNode) {
          document.body.appendChild(this.scrim);
          this.scrim.style.zIndex = currentOverlayZ() - 1;
        }
        trackBackdrop(this);
      }
    },

    renderBackdropOpened: function() {
      if (this.backdrop && getBackdrops().length < 2) {
        this.scrim.classList.toggle('core-opened', this.opened);
      }
    },

    completeBackdrop: function() {
      if (this.backdrop) {
        trackBackdrop(this);
        if (getBackdrops().length === 0) {
          this.scrim.parentNode.removeChild(this.scrim);
        }
      }
    },

    preparePositioning: function() {
      this.target.style.transition = this.target.style.webkitTransition = 'none';
      this.target.style.transform = this.target.style.webkitTransform = 'none';
      this.target.style.display = '';
    },

    discoverDimensions: function() {
      if (this.dimensions) {
        return;
      }
      var target = getComputedStyle(this.target);
      var sizer = getComputedStyle(this.sizingTarget);
      this.dimensions = {
        position: {
          v: target.top !== 'auto' ? 'top' : (target.bottom !== 'auto' ?
            'bottom' : null),
          h: target.left !== 'auto' ? 'left' : (target.right !== 'auto' ?
            'right' : null),
          css: target.position
        },
        size: {
          v: sizer.maxHeight !== 'none',
          h: sizer.maxWidth !== 'none'
        },
        margin: {
          top: parseInt(target.marginTop) || 0,
          right: parseInt(target.marginRight) || 0,
          bottom: parseInt(target.marginBottom) || 0,
          left: parseInt(target.marginLeft) || 0
        }
      };
    },

    finishPositioning: function(target) {
      this.target.style.display = 'none';
      this.target.style.transform = this.target.style.webkitTransform = '';
      // force layout to avoid application of transform
      this.target.offsetWidth;
      this.target.style.transition = this.target.style.webkitTransition = '';
    },

    getTransition: function(name) {
      return this.meta.byId(name || this.transition);
    },

    getFocusNode: function() {
      return this.target.querySelector('[autofocus]') || this.target;
    },

    applyFocus: function() {
      var focusNode = this.getFocusNode();
      if (this.opened) {
        if (!this.autoFocusDisabled) {
          focusNode.focus();
        }
      } else {
        focusNode.blur();
        if (currentOverlay() == this) {
          console.warn('Current core-overlay is attempting to focus itself as next! (bug)');
        } else {
          focusOverlay();
        }
      }
    },

    positionTarget: function() {
      // fire positioning event
      this.fire('core-overlay-position', {target: this.target,
          sizingTarget: this.sizingTarget, opened: this.opened});
      if (!this.dimensions.position.v) {
        this.target.style.top = '0px';
      }
      if (!this.dimensions.position.h) {
        this.target.style.left = '0px';
      }
    },

    updateTargetDimensions: function() {
      this.sizeTarget();
      this.repositionTarget();
    },

    sizeTarget: function() {
      this.sizingTarget.style.boxSizing = 'border-box';
      var dims = this.dimensions;
      var rect = this.target.getBoundingClientRect();
      if (!dims.size.v) {
        this.sizeDimension(rect, dims.position.v, 'top', 'bottom', 'Height');
      }
      if (!dims.size.h) {
        this.sizeDimension(rect, dims.position.h, 'left', 'right', 'Width');
      }
    },

    sizeDimension: function(rect, positionedBy, start, end, extent) {
      var dims = this.dimensions;
      var flip = (positionedBy === end);
      var m = flip ? start : end;
      var ws = window['inner' + extent];
      var o = dims.margin[m] + (flip ? ws - rect[end] : 
          rect[start]);
      var offset = 'offset' + extent;
      var o2 = this.target[offset] - this.sizingTarget[offset];
      this.sizingTarget.style['max' + extent] = (ws - o - o2) + 'px';
    },

    // vertically and horizontally center if not positioned
    repositionTarget: function() {
      // only center if position fixed.      
      if (this.dimensions.position.css !== 'fixed') {
        return; 
      }
      if (!this.dimensions.position.v) {
        var t = (window.innerHeight - this.target.offsetHeight) / 2;
        t -= this.dimensions.margin.top;
        this.target.style.top = t + 'px';
      }

      if (!this.dimensions.position.h) {
        var l = (window.innerWidth - this.target.offsetWidth) / 2;
        l -= this.dimensions.margin.left;
        this.target.style.left = l + 'px';
      }
    },

    resetTargetDimensions: function() {
      if (!this.dimensions.size.v) {
        this.sizingTarget.style.maxHeight = '';  
      }
      if (!this.dimensions.size.h) {
        this.sizingTarget.style.maxWidth = '';  
      }
      this.dimensions = null;
    },

    tapHandler: function(e) {
      // closeSelector takes precedence since closeAttribute has a default non-null value.
      if (e.target &&
          (this.closeSelector && e.target.matches(this.closeSelector)) ||
          (this.closeAttribute && e.target.hasAttribute(this.closeAttribute))) {
        this.toggle();
      } else {
        if (this.autoCloseJob) {
          this.autoCloseJob.stop();
          this.autoCloseJob = null;
        }
      }
    },
    
    // We use the traditional approach of capturing events on document
    // to to determine if the overlay needs to close. However, due to 
    // ShadowDOM event retargeting, the event target is not useful. Instead
    // of using it, we attempt to close asynchronously and prevent the close
    // if a tap event is immediately heard on the target.
    // TODO(sorvell): This approach will not work with modal. For
    // this we need a scrim.
    captureHandler: function(e) {
      if (!this.autoCloseDisabled && (currentOverlay() == this)) {
        this.autoCloseJob = this.job(this.autoCloseJob, function() {
          this.close();
        });
      }
    },

    keydownHandler: function(e) {
      if (!this.autoCloseDisabled && (e.keyCode == this.keyHelper.ESCAPE_KEY)) {
        this.close();
        e.stopPropagation();
      }
    },

    /**
     * Extensions of core-overlay should implement the `resizeHandler`
     * method to adjust the size and position of the overlay when the 
     * browser window resizes.
     * @method resizeHandler
     */
    resizeHandler: function() {
      this.updateTargetDimensions();
    },

    // TODO(sorvell): these utility methods should not be here.
    addElementListenerList: function(node, events) {
      for (var i in events) {
        this.addElementListener(node, i, events[i]);
      }
    },

    removeElementListenerList: function(node, events) {
      for (var i in events) {
        this.removeElementListener(node, i, events[i]);
      }
    },

    enableElementListener: function(enable, node, event, methodName, capture) {
      if (enable) {
        this.addElementListener(node, event, methodName, capture);
      } else {
        this.removeElementListener(node, event, methodName, capture);
      }
    },

    addElementListener: function(node, event, methodName, capture) {
      var fn = this._makeBoundListener(methodName);
      if (node && fn) {
        Polymer.addEventListener(node, event, fn, capture);
      }
    },

    removeElementListener: function(node, event, methodName, capture) {
      var fn = this._makeBoundListener(methodName);
      if (node && fn) {
        Polymer.removeEventListener(node, event, fn, capture);
      }
    },

    _makeBoundListener: function(methodName) {
      var self = this, method = this[methodName];
      if (!method) {
        return;
      }
      var bound = '_bound' + methodName;
      if (!this[bound]) {
        this[bound] = function(e) {
          method.call(self, e);
        };
      }
      return this[bound];
    },
  });

  // TODO(sorvell): This should be an element with private state so it can
  // be independent of overlay.
  // track overlays for z-index and focus managemant
  var overlays = [];
  function addOverlay(overlay) {
    var z0 = currentOverlayZ();
    overlays.push(overlay);
    var z1 = currentOverlayZ();
    if (z1 <= z0) {
      applyOverlayZ(overlay, z0);
    }
  }

  function removeOverlay(overlay) {
    var i = overlays.indexOf(overlay);
    if (i >= 0) {
      overlays.splice(i, 1);
      setZ(overlay, '');
    }
  }
  
  function applyOverlayZ(overlay, aboveZ) {
    setZ(overlay.target, aboveZ + 2);
  }
  
  function setZ(element, z) {
    element.style.zIndex = z;
  }

  function currentOverlay() {
    return overlays[overlays.length-1];
  }
  
  var DEFAULT_Z = 10;
  
  function currentOverlayZ() {
    var z;
    var current = currentOverlay();
    if (current) {
      var z1 = window.getComputedStyle(current.target).zIndex;
      if (!isNaN(z1)) {
        z = Number(z1);
      }
    }
    return z || DEFAULT_Z;
  }
  
  function focusOverlay() {
    var current = currentOverlay();
    // We have to be careful to focus the next overlay _after_ any current
    // transitions are complete (due to the state being toggled prior to the
    // transition). Otherwise, we risk infinite recursion when a transitioning
    // (closed) overlay becomes the current overlay.
    //
    // NOTE: We make the assumption that any overlay that completes a transition
    // will call into focusOverlay to kick the process back off. Currently:
    // transitionend -> applyFocus -> focusOverlay.
    if (current && !current.transitioning) {
      current.applyFocus();
    }
  }

  var backdrops = [];
  function trackBackdrop(element) {
    if (element.opened) {
      backdrops.push(element);
    } else {
      var i = backdrops.indexOf(element);
      if (i >= 0) {
        backdrops.splice(i, 1);
      }
    }
  }

  function getBackdrops() {
    return backdrops;
  }
})();
;


    Polymer('paper-dialog', {

      /**
       * Set opened to true to show the dialog and to false to hide it.
       * A dialog may be made intially opened by setting its opened attribute.

       * @attribute opened
       * @type boolean
       * @default false
       */
      opened: false,

      /**
       * If true, the dialog has a backdrop darkening the rest of the screen.
       * The backdrop element is attached to the document body and may be styled
       * with the class `core-overlay-backdrop`. When opened the `core-opened`
       * class is applied.
       *
       * @attribute backdrop
       * @type boolean
       * @default false
       */
      backdrop: false,

      /**
       * If true, the dialog is guaranteed to display above page content.
       *
       * @attribute layered
       * @type boolean
       * @default false
      */
      layered: false,

      /**
       * By default a dialog will close automatically if the user
       * taps outside it or presses the escape key. Disable this
       * behavior by setting the `autoCloseDisabled` property to true.
       * @attribute autoCloseDisabled
       * @type boolean
       * @default false
       */
      autoCloseDisabled: false,

      /**
       * This property specifies a selector matching elements that should
       * close the dialog on tap.
       *
       * @attribute closeSelector
       * @type string
       * @default ""
       */
      closeSelector: '[dismissive],[affirmative]',

      /**
       * @attribute heading
       * @type string
       * @default ''
       */
      heading: '',

      /**
       * Set this property to the id of a <core-transition> element to specify
       * the transition to use when opening/closing this dialog.
       *
       * @attribute transition
       * @type string
       * @default ''
       */
      transition: '',

      /**
       * Toggle the dialog's opened state.
       * @method toggle
       */
      toggle: function() {
        this.$.overlay.toggle();
      },

      headingChanged: function() {
        this.setAttribute('aria-label', this.heading);
      }

    });

  ;

		Polymer('esis-dataset-loader', {
			data : {},
			ds : {},
			ckan : {},
			pkgid : '',

			dataPackageLoaded : false,

			ready : function() {
				this.pkgid = this._getVar('id');
				if( this.pkgid == null ) return;

				this.ds = document.querySelector('esis-datastore');
				this.ckan = document.querySelector('esis-ckan');

				
				window.addEventListener('polymer-ready', function(e) {
					this.$.dialog.toggle();

					var ckan = document.querySelector('esis-ckan');
					ckan.getSpectraPackage(this.pkgid, function(err, pkg){
						this.$.dialog.toggle();
						if( err || pkg.error ) return alert('Error loading dataset.');

						this.data = pkg;
						this._setData();
						
					}.bind(this));
				}.bind(this));
			},

			_setData : function() {
				this.ds.editMode = true;

				// set the default attirbutes for this dataset
				for( var key in this.ds.data ) {
					if( this.data[key] ) this.ds.data[key] = this.data[key];
				}

				var ecosis = this.data.ecosis;

				// set the existing user modifications
				this.ds.attributeModifications = ecosis.attributes.modifications;

				// set the known attribute name mappings
				this.ds.inverseAttributeMap = ecosis.attributes.map;
				for( var key in ecosis.attributes.map ) {
					this.ds.attributeMap[ecosis.attributes.map[key]] = key;
				}
				this.async(function(){
					this.ds.fire('attribute-map-update');
				});
				

				// set the known attribute types
				// add the wavelengths back into the types array
				for( var i = 0; i < ecosis.attributes.wavelengths.length; i++ ) {
					ecosis.attributes.types.push({
						type : 'data',
						flag : this.ds.ATTR_FLAGS.IS_WAVELENGTH,
						name : ecosis.attributes.wavelengths[i]
					});
				}
				this.ds.existingAttributeTypes = ecosis.attributes.types;

				// set the dataset attributes
				for( var key in this.ds.datasetAttributes ) {
					if( ecosis.attributes.dataset[key] ) {
						this.ds.datasetAttributes[key] = ecosis.attributes.dataset[key];
					}
				}

				if( !this.data.resources ) return;

				for( var i = 0; i < this.data.resources.length; i++ ) {
            		this.ds.existing.resources.push(this.data.resources[i]);
            	}

           		this.ds.existing.metadata = ecosis.metadata;
           		this.ds.existing.data = ecosis.data;

            	this._getExistingMetadata(0);
			},

			_getExistingMetadata : function(index) {
				var len = this.data.ecosis.metadata.length;

				if( len > 0 ) {
					this.fire('get-data-resource-progress', index / len );
				}

				if( index == len ) {
					this.fire('get-data-resource-complete');
					this.dataPackageLoaded = true;
				} else {
					this.ckan.getMetadataResource(
						this.data.ecosis.metadata[index].resource_id, 
						function(err, resp) {
							var mdObj = resp.ecosis;

							var datasheet = document.createElement('esis-datasheet');
							datasheet.isMetadata = true;
							datasheet.isExisting = true;

							var metadata = document.createElement('esis-metadata');
							metadata.metadata = mdObj.metadata;
							metadata.joinId = mdObj.join_id;
							metadata.resourceId = mdObj.resource_id;
							metadata.isExisting = true;
							metadata.filename = resp.name;

							// set join information
							if( mdObj.join_on.type == 'filename' ) {
								metadata.filenameMatch = true;
								if( mdObj.join_on.loose ) metadata.looseMatch = true;
							} else if ( mdObj.join_on.type == 'worksheet' ) {
								metadata.worksheetMatch = true;
							}

							datasheet.metadata = metadata;
							this.ds.datasheets.push(datasheet);

							index++;
							this._getExistingMetadata(index);
					}.bind(this));
				}
			},


			/*_getDataPackage: function(id) {
				this.fire('get-data-resource-progress', 0);

				this.ckan.getSpectraResource(
					id, 
					function(err, dataset){
						if( err ) return alert('Failed to load Ecosis data resource package');
						this.ds.existing.dataset = dataset;

						// set existing metadata
						this._setExistingMetadata();

						this.fire('get-data-resource-complete');
						this.dataPackageLoaded = true;
					}.bind(this),
					function(progress){
						this.fire('get-data-resource-progress', progress);
					}.bind(this)
				);
			},

			// create metadata elements for the resources that already exist
			_setExistingMetadata : function() {
				if( !this.ds.existing.dataset ) return;
				if( !this.ds.existing.dataset.join ) return;

				for( var i = 0; i < this.ds.existing.dataset.join.length; i++ ) {
					var mdObj = this.ds.existing.dataset.join[i];

					var datasheet = document.createElement('esis-datasheet');
					datasheet.isMetadata = true;
					datasheet.isExisting = true;

					var metadata = document.createElement('esis-metadata');
					metadata.metadata = mdObj.metadata;
					metadata.joinId = mdObj.join_id;
					metadata.resourceId = mdObj.resource_id;
					metadata.isExisting = true;

					// set filename
					if( this.data.resources ) {
						for( var i = 0; i < this.data.resources.length; i++ ) {
							if( this.data.resources[i].id = metadata.resourceId ) {
								metadata.filename = this.data.resources[i].name;
								break;
							}
						}
					}

					// set join information
					if( mdObj.join_on.type == 'filename' ) {
						metadata.filenameMatch = true;
						if( mdObj.join_on.loose ) metadata.looseMatch = true;
					} else if ( mdObj.join_on.type == 'worksheet' ) {
						metadata.worksheetMatch = true;
					}

					datasheet.metadata = metadata;
					this.ds.datasheets.push(datasheet);
				}
			},*/

			_getVar : function(variable) {
       			var query = window.location.search.substring(1);
       			var vars = query.split("&");
       			for (var i = 0; i < vars.length; i++) {
               		var pair = vars[i].split("=");
               		if( pair[0] == variable ) return pair[1];
       			}
       			return null;
			}
		});
	;

    Polymer('paper-fab', {

      publish: {

        /**
         * See [`<paper-button>`](../paper-button).
         *
         * @attribute raisedButton
         * @type boolean
         * @default true
         */
        raisedButton: {value: true, reflect: true}

      }

    });
  ;

		Polymer('esis-verify-dataset', {
			ds : {},


			ready : function() {
				this.ds = document.querySelector('esis-dataset');
			},
			finalize : function(){
				this.fire('finalize');
			},
			cancel : function(){
				this.fire('cancel');
			}
		});
	;

        Polymer('esis-dataset-creator', {
            hide : true,
            ds : {},
            ckan : {},

            counts : {
                totalResources : 0,
                measurementResources : 0,
                metadataResources : 0,
                measurements : 0
            },

            joinOrder : ['joined','file','measurement'],
            // metadata names can't overwrite these attributes
            protectedKeys : ['_id', 'ecosis', 'datapoints'],

            observe : {
                'ds.data.name' : '_updateVisibility',
                'ds.deleted' : '_updateVisibility',
                'ds.files' : '_updateVisibility'
            },

            // local memory cache for usda common names
            commonCache : {},

            uploading : false,
            statusText : '',

            // make number of spectra to upload at one time
            MAX_DATA_UPLOAD_COUNT : 200,

            ready : function() {
                this.ds = document.querySelector('esis-datastore');
                this.ckan = document.querySelector('esis-ckan');
            },

            show : function() {
                this._update();
                this.$.dialog.toggle();
            },

            _update : function() {
                this.counts = {
                    totalResources : 0,
                    measurementResources : 0,
                    metadataResources : 0,
                    measurements : 0
                };

                for( var i = 0; i < this.ds.datasheets.length; i++ ) {
                    if( this.ds.datasheets[i].isMetadata ) {
                        this.counts.metadataResources++;
                    } else if ( this.ds.datasheets[i].measurements.length > 0 ) {
                        this.counts.measurementResources++;
                        this.counts.measurements += this.ds.datasheets[i].measurements.length;
                    }
                }

                for( var i = 0; i < this.ds.existing.data.length; i++ ) {
                    this.counts.measurements += this.ds.existing.data[i].spectra_count;
                }

                this.counts.measurementResources += this.ds.existing.data.length;

                this.counts.totalResources = this.ds.files.length + this.ds.existing.data.length + this.ds.existing.metadata.length;
            },

            _updateVisibility : function() {
                if( (this.ds.data.name != '' && this.ds.files.length > 0) || this.ds.editMode ) {
                    this.hide = false;
                } else {
                    this.hide = true;
                }
            },

            _cancel : function() {
                this.$.dialog.toggle();
            },

            // create a new ckan package
            create : function() {
                var pkg = $.extend(true, {}, this.ds.data);
                
                this.uploading = true,
                this.statusText = (this.ds.editMode ? 'Updating' : 'Creating initial') + ' dataset package...';

                var pkg = document.querySelector('esis-dataset-loader').data;
                for( var key in this.ds.data ) {
                    if( this.ds.editMode && (key == 'name' || key == 'title') ) continue;
                    pkg[key] = this.ds.data[key];
                }

                // TESTING...
                /*this._uploadMeasurementResource('1233-12332-1232', function(){
                    console.log(this._createDatasetJson('1233-12332-1232'));
                    console.log('done');
                }.bind(this));
                return;*/
                // TESTING...

                var action = this.ds.editMode ? this.ckan.updatePackage : this.ckan.createPackage;
                action(pkg, function(err, resp){
                    if( err ) {
                        alert('Error '+(this.ds.editMode ? 'updating' : 'creating')+' dataset');
                        this.uploading = false;
                        return;
                    }

                    this._addResources(resp);
                }.bind(this));
            },

            _addResources : function(pkg) {
                this.statusText = 'Preparing Resources...';             

                // verify verify everything is ok
                // if not, quit
                // you can't use this for upload though! it will not have the resource id assign
                // since the resources have to be uploaded first!
                /*if( !this._isDataUnique() ) {
                    alert('Your measurement signatures are not inherently unique.  Please provide a metadata '+
                        'field that can serve as a unique identifier.');
                    //_createUidSelector(data);
                    //btn.removeClass('disabled').html('Add Resources');
                    this.uploading = false;
                    return;
                }*/

                this.statusText = 'Adding...';

                this._addResourceToCkan(0, pkg);
            },

            _addResourceToCkan: function(index, pkg) {
                // once we are done adding dataset resources,
                //  - remove deleted resource
                //  - create and upload spectra package info
                //  - create and upload spectral data
                if( this.ds.resources.length == index ) {
                    this._removeDeletedResources(0, function(){

                        this.statusText = 'Creating spectra package information...';
                        var datasetInfo = this._createDatasetJson(pkg);

                        // if measurement data length is 0, we are not adding any new data
                        // so poke the mapReduce build on 'addUpdateSpectra'
                        this._createMeasurementJson(pkg, function(measurementData){

                            var rebuildIndex = measurementData.length == 0 ? true : false;
                            this.statusText = 'Uploading spectra package information...';
                            this.ckan.addUpdateSpectraPackage(datasetInfo, rebuildIndex, function(){
                            
                                this.statusText = 'Uploading spectra data...';
                                this._uploadMeasurementResource(measurementData, function(){
                            
                                    this.statusText = 'Complete';
                                    setTimeout(function(){
                                        window.location = esis.host+'/dataset/'+pkg.name;
                                    }, 500);
                                }.bind(this));
                            }.bind(this));

                        }.bind(this));
                        
                    }.bind(this));
                } else {
                    this.statusText = 'Uploading '+this.ds.resources[index].filename+'...';
                    this.ckan.addResource(
                        pkg.id, 
                        this.ds.resources[index],
                        function(err, resp){
                            if( err ) {
                                this.uploading = false;
                                return alert('Error creating ckan resource');
                            }

                            index++;
                            this._addResourceToCkan(index, pkg);
                        }.bind(this), 
                        function(progress){
                            this.statusText = 'Uploading '+this.ds.resources[index].filename+' ('+progress+'%)...';
                        }.bind(this)
                    );
                }
            },

            _removeDeletedResources : function(index, callback) {
                if( !this.ds.editMode || this.ds.deleted.length == index ) return callback();

                this.statusText = 'Removing deleted resources '+(index+1)+'/'+this.ds.deleted.length;
                this.ckan.removeResource(this.ds.deleted[index], function(err, resp){
                    // TODO: add error checking

                    index++;
                    this._removeDeletedResources(index, callback);
                }.bind(this));
            },

            _isDataUnique: function() {
                var measurements = [];
                var ids = [];

                for( var i = 0; i < this.ds.datasheets.length; i++ ) {
                    var f = this.ds.datasheets[i];
                    for( var j = 0; j < f.measurements.length; j++ ) {
                        // make sure the latest uid for the spectra is generated
                        f.measurements[j].updateUid();

                        if( ids.indexOf( f.measurements[j].measurement_id ) != -1 ) return false;
                        else ids.push( f.measurements[j].measurement_id );
                    }
                }

                return true;
            },

            _createDatasetJson : function(pkg) {
                var dataset;
                if( this.ds.editMode ) {
                    // is there any reason for this now?
                } else {
                    
                }

                // turn into array and remove guess flag
                var types = [], key, item;
                var wavelengths = [];
                var attrs = this.ds.getAllAttributeTypes();
                for( key in attrs ) {
                    item = attrs[key];

                    if( item.flag == 3 ) {
                        wavelengths.push(key);
                    } else {
                        types.push({
                            name : key,
                            type : item.type,
                            flag : item.flag
                        })
                    }
                    
                }

                dataset = {
                    attributes : {
                        dataset : this.ds.datasetAttributes,
                        types : types,
                        wavelengths : wavelengths,
                        modifications : this.ds.attributeModifications,
                        map : this.ds.inverseAttributeMap
                    },
                    join : this._getJoinableData(),
                    package_id : pkg.id,
                    package_name : pkg.name
                }

                return dataset;
            },

            _createMeasurementJson : function(pkg, callback) {
                var measurements = [], i, f, j, ele, m;               

                var sortOn = null, sortType = null;
                if( this.ds.datasetAttributes.sort_on && this.ds.datasetAttributes.sort_on != '' ) {
                    sortOn = this.ds.datasetAttributes.sort_on;
                    sortType = this.ds.datasetAttributes.sort_type;
                }

                for( i = 0; i < this.ds.datasheets.length; i++ ) {
                    f = this.ds.datasheets[i];
                    for( j = 0; j < f.measurements.length; j++ ) {
                        ele = f.measurements[j];
                        m = {
                            metadata : ele.metadata,
                            datapoints : ele.datapoints,
                            ecosis : {
                                filename : ele.filename,
                                sheetname : ele.sheetname,
                                spectra_id : ele.spectra_id,
                                resource_id : ele.resourceId,
                                package_id : pkg.id
                            }
                        };
                        
                        this._mapMetadata(m);

                        // Note: the sort information will be set on the server

                        measurements.push(m);
                    }
                }

                this._lookupUSDACodes(0, measurements, callback);
            },


            _lookupUSDACodes : function(index, arr, callback) {
                if( index == arr.length ) {
                    return callback(arr);
                } else {
                    var item = arr[index];

                    if( !item['USDA Code'] ) {
                        index++;
                        this._lookupUSDACodes(index, arr, callback);
                        return;
                    }

                    if( this.commonCache[item['USDA Code'].toLowerCase()] != null ) {
                        this._setUSDAName(item, this.commonCache[item['USDA Code'].toLowerCase()]);
                        index++;
                        this._lookupUSDACodes(index, arr, callback);
                        return;
                    }

                    this.statusText = 'Looking up USDA code: '+item['USDA Code'].toLowerCase()+'...';
                    this.ckan.getUsdaCommonName(item['USDA Code'].toLowerCase(), function(resp){
                        if ( !resp.error ) {
                            this.commonCache[item['USDA Code'].toLowerCase()] = resp.body;
                            this._setUSDAName(item, resp.body);
                        } else {
                            this.commonCache[item['USDA Code'].toLowerCase()] = '';
                        }
                        index++;
                        this._lookupUSDACodes(index, arr, callback);
                        return;
                    }.bind(this));
                }
            },

            _setUSDAName : function(item, str) {
                if( str.length == 0 ) return;
                
                var parts = str.split('\r\n');
                if( parts.length < 2 ) return;

                var attrs = parts[0].replace(/"/g, '').split(',');
                var values = parts[1].replace(/"/g, '').split(',');

                for( var i = 0; i < attrs.length; i++ ) {
                    item[attrs[i]] = values[i];
                }
            },


            /**
             * Make metadata attributes either first class cizitens (if ecosis metadata) or
             * place in the 'custom' namespace
             **/
            _mapMetadata : function(sp) {
                for( var i = 0; i < this.joinOrder.length; i++ ) {
                    for( var key in sp.metadata[this.joinOrder[i]] ) {
                        if( this.protectedKeys.indexOf(key) > -1 ) continue;

                        sp[key] = sp.metadata[this.joinOrder[i]][key];
                        if( this.ds.inverseAttributeMap[key] != null ) {                            
                            sp[this.ds.inverseAttributeMap[key]] = sp.metadata[this.joinOrder[i]][key];
                        }
                    }
                }
                delete sp.metadata;
            },


            _createMeasurementJsonResource : function(pkgid) {
                var measurements = [];

                for( var i = 0; i < this.ds.datasheets.length; i++ ) {
                    var f = this.ds.datasheets[i];
                    for( var j = 0; j < f.measurements.length; j++ ) {
                        measurements.push(f.measurements[j]);
                    }
                }

                var uid = $('#unique-id-input').val();
                var uidType = '';
                if( !uid ) {
                    uid = '';
                } else {
                    var parts = uid.split('.');
                    uidType = parts[0];
                    uid = parts[1];
                }

                var data = [];
                for( var i = 0; i < measurements.length; i++ ) {
                    var d = {
                        metadata : measurements[i].metadata,
                        datapoints : measurements[i].data,
                        filename : measurements[i].filename,
                        sheetname : measurements[i].sheetname,
                        resource_id : measurements[i].resourceId,
                        measurement_id : measurements[i].measurement_id,
                        package_id : pkgid
                    };

                    data.push(d);
                }

                var dataset;
                if( this.ds.editMode ) {
                    dataset = this.ds.existing.dataset;

                    if( !dataset.data ) dataset.data = [];
                    if( !dataset.join ) dataset.join = [];
                    if( !dataset.group_by ) dataset.group_by = this.ds.group;
                    if( !dataset.map ) dataset.map = this.ds.inverseAttributeMap;

                    // move all newly joined data
                    /*for( var i = 0; i < dataset.data.length; i++ ){
                        var d = dataset.data[i];
                        if( !d.metadata.joined ) continue;

                        for( var key in d.metadata.joined ) {
                            if( this._isEcosisMetadata(key) ) {
                                d.ecosis[key] = d.metadata.joined[key];
                            } else if( this.ds.inverseAttributeMap[key] ) {
                                var ecosisKey = this.ds.inverseAttributeMap[key];
                                d.ecosis[ecosisKey] = d.metadata.joined[key];
                                // still keep old reference
                                d.metadata[key] = d.metadata.joined[key];
                            } else {
                                d.metadata[key] = d.metadata.joined[key];
                            }
                        }
                        delete d.metadata.joined;
                    }*/

                    for( var i = 0; i < data.length; i++ ) dataset.data.push(data[i]);

                    //var joindata = this._getJoinableData();
                    //for( var i = 0; i < joindata.length; i++ ) dataset.join.push(joindata[i]);
                    dataset.join = this._getJoinableData();

                } else {
                    dataset = {
                        data : data,
                        map  : this.ds.inverseAttributeMap,
                        join : this._getJoinableData(),
                        group_by : this.ds.group,
                        package_id : pkgid
                    }
                };

                // we need to clean all of the attribute here ...
                for( var i = 0; i < dataset.data.length; i++ ) {
                    var metadata = dataset.data[i].metadata;
                    for( var key in metadata ) {
                        var tmp = key.replace(/[^A-Za-z0-9\s_-]/g, '');
                        if( tmp != key ) {
                            if( metadata[tmp] ) {
                                alert('Metadata Error: the attribute "'+key+'" has illegal characters.  Attempted to clean up key to "'+
                                    tmp+'" but this key already exists.');
                                return;
                            }

                            metadata[tmp] = metadata[key];
                            delete metadata[key];
                        }
                    }
                }

                return dataset;
            },

            _getJoinableData: function() {
                var arr = [];

                for( var i = 0; i < this.ds.datasheets.length; i++ ) {
                    var jd = this.ds.datasheets[i];

                    if( !jd.isMetadata || jd.isExisting ) continue;
                    jd = jd.metadata;

                    arr.push({
                        metadata : jd.metadata,
                        join_id : jd.joinId,
                        join_on : jd.getJoinType(),
                        resource_id : jd.resourceId
                    });
                }
                
                return arr;
            },

            _uploadMeasurementResource : function(data, callback) {
                this.statusText = 'Uploading measurement data resource...';

                var chunks = [];
                var chunk = [];
                for( var i = 0; i < data.length; i++ ) {
                    chunk.push(data[i]);
                    if( chunk.length == this.MAX_DATA_UPLOAD_COUNT ) {
                        chunks.push(chunk);
                        chunk = [];
                    }
                }
                if( chunk.length > 0 ) chunks.push(chunk);

                this._addMeasurementData(0, data.length, chunks, function(){
                    callback();
                });
            },

            _addMeasurementData : function(index, total, chunks, callback) {
                if( index == chunks.length ) return callback();

                var count = (index > 0) ? (index * this.MAX_DATA_UPLOAD_COUNT) + chunks[index].length : chunks[index].length;

                this.statusText = 'Uploading measurements ('+count+'/'+total+')...';

                var update = (index == chunks.length-1) ? true : false;
                this.ckan.addSpectra(chunks[index], update, function(){
                    index++;
                    this._addMeasurementData(index, total, chunks, callback);
                }.bind(this));
            },

            _isEcosisMetadata : function(key) {
                if( esis.metadata[key] != null ) return true;
                return false;
            }


            
        });
    ;

		Polymer('esis-ckan', {

			/**
			 * Create a ckan package
			 *
			 * pkg: object respresenting the package to be uploaded
			 * callback: callback handler
			 **/
			createPackage : function(pkg, callback) {
				$.ajax({
					url : esis.host+'/api/3/action/package_create',
					type : 'POST',
					data : JSON.stringify(pkg),
					xhrFields: {
				      withCredentials: true
				    },
					success : function(resp) {
						if( !resp.success ) return callback(resp);						
						callback(null, resp.result);
					},
					error : function() {
						callback({error:true, message:'Request Error'});
					}
				});
			},

			updatePackage : function(pkg, callback) {
				$.ajax({
					url : esis.host+'/api/3/action/package_update',
					type : 'POST',
					data : JSON.stringify(pkg),
					xhrFields: {
				      withCredentials: true
				    },
					success : function(resp) {
						if( !resp.success ) return callback(resp);						
						callback(null, resp.result);
					},
					error : function() {
						callback({error:true, message:'Request Error'});
					}
				});
			},

			/**
			 * Get a ckan package by id
			 *
			 * pkgid: package id
			 * callback: callback handler
			 **/
			getPackage : function(pkgid, callback) {
				$.ajax({
		            url: esis.host + '/api/action/package_show?id='+pkgid,
		            xhrFields: {
				      withCredentials: true
				    },
		            success: function(response) {
		            	console.log(response);
		            	
		                if( !response.success ) return callback(response);
		                callback(null, response.result);
		            },
		            error: function(response) {
		            	if( response && response.responseJSON ) return callback(response.responseJSON);
		            	callback({error:true, message:'Request Error'});
		            }
		        });
			},

			getUsdaCommonName : function(code, callback) {
				$.ajax({
		            url: esis.host + '/spectra/getUsdaCommonName?code='+code,
		            xhrFields: {
				      withCredentials: true
				    },
		            success: function(response) {
		                if( !response.success ) return callback(response);
		                callback(null, response.result);
		            },
		            error: function(response) {
		            	if( response && response.responseJSON ) return callback(response.responseJSON);
		            	callback({error:true, message:'Request Error'});
		            }
		        });
			},

			/**
			 * Add a resource to a package using the browsers FormData object
			 *
			 * pkgid: id of the package to add to 
			 * resource: esis-resource element representing the to resource to upload
			 * callback: callback handler
			 * progress: callback for progress update
			 **/
			addResource : function(pkgid, resource, callback, progress) {
		        // TODO: if this fails, we have an issue on our hands
		    	var formData = new FormData();

		        var filename = resource.filename.replace(/.*\//,'');
		        if( filename.length == 0 ) {
		            return callback({error:true,message:'Invalid filename: '+resource.filename});
		        }

		    	formData.append('package_id', pkgid);
		    	formData.append('mimetype',resource.mimetype);
		    	formData.append('name', filename);
		    	formData.append('upload', new Blob([resource.contents], {type: resource.mimetype}), filename);

		        var xhr = $.ajaxSettings.xhr();
		        // attach progress handler to the XMLHttpRequest Object
		        try {
		            if( progress ) {
		                xhr.upload.addEventListener("progress", function(evt){
		                    if (evt.lengthComputable) {  
		                        progress(((evt.loaded / evt.total)*100).toFixed(0));
		                    }
		                }, false); 
		            }
		        } catch(e) {}

		    	$.ajax({
				    url: esis.host + '/api/action/resource_create',
				    type: "POST",
				    data: formData,
				    processData: false,
				    contentType: false,
				    xhrFields: {
				      withCredentials: true
				    },
		            xhr : function() {
		                return xhr;
		            },
				    success: function(response, status) {
		                if( response.success || !response.error ) {
		                    resource.setId(response.result.id);
				            callback(null, response);
		                } else {
		                    callback(response);
		                }
				    },
				    error : function() {
				        callback({error:true,message:'Request Error'});
				    }
				});
			},

			addSpectraInfo : function(info, callback) {
				$.ajax({
				    url: esis.host + '/spectra/addInfo',
				    type: "POST",
				    data: {
				    	info : JSON.stringify(info)
				    },
				    xhrFields: {
				      withCredentials: true
				    },
				    success: function(response, status) {
		                if( response.success || !response.error ) {
				            callback(null, response);
		                } else {
		                    callback(response);
		                }
				    },
				    error : function(err) {
				    	debugger;
				        callback({error:true,message:'Request Error'});
				    }
				});
			},

			addUpdateSpectraPackage : function(pkgInfo, rebuildIndex, callback) {
				$.ajax({
				    url: esis.host + '/spectra/addUpdatePackage',
				    type: "POST",
				    data: {
				    	'package' : JSON.stringify(pkgInfo),
				    	'updateIndex' : rebuildIndex+''
				    },
				    xhrFields: {
				      withCredentials: true
				    },
				    success: function(response, status) {
		                if( response.success || !response.error ) {
				            callback(null, response);
		                } else {
		                    callback(response);
		                }
				    },
				    error : function(err) {
				    	debugger;
				        callback({error:true,message:'Request Error'});
				    }
				});
			},

			getSpectraPackage : function(pkgname, callback) {
				$.ajax({
				    url: esis.host + '/spectra/getPackage?id='+pkgname,
				    type: "GET",
				    xhrFields: {
				      withCredentials: true
				    },
				    success: function(response, status) {
		                if( response.success || !response.error ) {
				            callback(null, response);
		                } else {
		                    callback(response);
		                }
				    },
				    error : function(err) {
				    	debugger;
				        callback({error:true,message:'Request Error'});
				    }
				});
			},

			getMetadataResource : function(resourceId, callback) {
				$.ajax({
				    url: esis.host + '/spectra/getMetadata?id='+resourceId,
				    type: "GET",
				    xhrFields: {
				      withCredentials: true
				    },
				    success: function(response, status) {
		                if( response.success || !response.error ) {
				            callback(null, response);
		                } else {
		                    callback(response);
		                }
				    },
				    error : function(err) {
				    	debugger;
				        callback({error:true,message:'Request Error'});
				    }
				});
			},

			addSpectra : function(spectra, updateIndex, callback) {
				$.ajax({
				    url: esis.host + '/spectra/addSpectra',
				    type: "POST",
				    data: {
				    	spectra : JSON.stringify(spectra),
				    	updateIndex : updateIndex === true ? 'true' : 'false' 
				    },
				    xhrFields: {
				      withCredentials: true
				    },
				    success: function(response, status) {
		                if( response.success || !response.error ) {
				            callback(null, response);
		                } else {
		                    callback(response);
		                }
				    },
				    error : function() {
				        callback({error:true,message:'Request Error'});
				    }
				});
			},

			/**
			 * Get the ecosis resource
			 **/
			getSpectraResource : function(id, callback, progress) { 
				var xhr = $.ajaxSettings.xhr();

		        // attach progress handler to the XMLHttpRequest Object
		        if( progress ) {
			        try {
			            xhr.addEventListener("progress", function(evt){
			                if (evt.lengthComputable) {  
			                	if( progress ) progress(((evt.loaded / evt.total)*100).toFixed(0));
			                }
			            }.bind(this), false); 
			        } catch(e) {}
		    	}

				$.ajax({
		            url: esis.host + '/spectra/get?metadataOnly=true&id='+id,
		            xhr : function() {
		                return xhr;
		            },
		            xhrFields: {
				      withCredentials: true
				    },
				    // don't let jquery muck with response
		            mimeType:'text/plain; charset=x-user-defined',
		            success: function(response) {
		            	callback(null, JSON.parse(response));
		            },
		            error: function() {
		            	callback({error:true,message:'failed to load resource'});
		            }
		        });
		    },

			removeResource: function(resourceId, callback) {
		        $.ajax({
	                type: 'POST',
	                url: esis.host + '/api/action/resource_delete',
	                data : JSON.stringify({id : resourceId }),
	                xhrFields: {
				      withCredentials: true
				    },
	                success: function(response) {
	                    if( !response.success ) return callback(response);
	                    callback(null, response);
	                },
	                error : function(){
	                	callback({error:true,message:'Request Error'});
	                }
		        });
		    }
		});
	;

      // Load the Visualization API and the piechart package.
      google.load('visualization', '1.0', {'packages':['corechart']});
    ;

    if( !window.esis ) window.esis = {};
    esis.host = window.location.host.match(/.*localhost.*/) ? 'http://192.168.1.6:5000' : '';

    $.ajax({
        type : 'GET',
        url : '/metadata.js',
        dataType : 'json',
        success :function(resp) {
            esis.metadata = resp;
        },
        error : function(err, err2) {
            console.log(err);
        }
    });

      esis.extensions = {
  pdf : {
    type : 'resource',
    icon : 'fa-file-text-o',
    mime : 'application/pdf'
  },
  spectra : {
    type : 'both',
    parser : 'csv-tab',
    format : 'string',
    icon : 'fa-table',
    mime : 'text/plain'
  },
  zip : {
    type   : 'compressed',
    format : 'binary',
    type : 'resource',
    isZip  : true,
    mime : 'application/zip'
  },
  csv : {
    type : 'both',
    parser : 'csv-comma',
    format : 'string',
    icon : 'fa-table',
    mime : 'text/plain'
  },
  xlsx : {
    type : 'both',
    parser : 'excel',
    format : 'binary',
    icon : 'fa-table',
    mime : 'application/excel'
  },
  xls : {
    type : 'both',
    parser : 'excel',
    format : 'binary',
    icon : 'fa-table',
    mime : 'application/excel'
  },
  kml : {
    type : 'resource',
    icon : 'fa-globe',
    mime : 'application/vnd.google-earth.kml+xml'
  },
  kmz : {
    type : 'resource',
    icon : 'fa-globe',
    kmz  : 'application/vnd.google-earth.kmz'
  },
  xml : {
    type : 'resource',
    icon : 'fa-code',
    mime : 'text/xml'
  },
  html : {
    type : 'resource',
    icon : 'fa-code',
    mime : 'text/html'
  },
  rtf : {
    type : 'resource',
    icon : 'fa-file-text-o',
    mime : 'application/rtf'
  },
  jpg : {
    type : 'resource',
    icon : 'fa-picture-o',
    mime : 'image/jpeg'
  },
  jpeg : {
    type : 'resource',
    icon : 'fa-picture-o',
    mime : 'image/jpeg'
  },
  png : {
    type : 'resource',
    icon : 'fa-picture-o',
    mime : 'image/png'
  },
  gif : {
    type : 'resource',
    icon : 'fa-picture-o',
    mime : 'image/gif'
  },
  tiff : {
    type : 'resource',
    icon : 'fa-picture-o',
    mime : 'image/tiff'
  },
  tif : {
    type : 'resource',
    icon : 'fa-picture-o',
    mime : 'image/tiff'
  },
  txt : {
    format : 'string',
    type   : 'both',
    parser : 'csv-tab',
    mime   : 'text/plain'
  },
  doc : {
    icon : 'fa-file-text-o',
    mime : 'application/msword'
  },
  docx : {
    icon : 'fa-file-text-o',
    mime : 'application/msword'
  }
};
    ;

      window.addEventListener('polymer-ready', function(){
        CoreStyle.g.paperInput.focusedColor = '#2f9b45';
      });
    