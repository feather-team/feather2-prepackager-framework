;(function(window, document){
	var head = document.getElementsByTagName('head')[0];

	function evalJsAndCss(node){
		if(node.nodeType !== 1) return;

		var tag = node.tagName.toLowerCase();

		if(tag == 'script'){
			if(node.src){
				var element = createElement('script');
				element.src = node.src;
				append(head, element);
			}else if(!node.type || /text\/javascript/i.test(node.type)){
				(new Function(node.innerHTML))();
			}
		}else if(tag == 'style'){
			var element = createElement('style');
			element.type = 'text/css';

			if(element.styleSheet){
				element.styleSheet.cssText = node.innerHTML;
			}else{
				append(element, createElement(node.innerHTML, true));
			}

			append(head, element);
		}else{
			for(var i = 0; i < node.childNodes.length; i++){
				evalJsAndCss(node.childNodes[i]);
			}
		}
	}

	function append(target, string){
		if(typeof string == 'object'){
			target.appendChild(string);
		}else{
			var parent = createElement('div');
			var isScript = /script/i, isStyle = /style/i, isJsLike = /text\/javascript/i;

			parent.innerHTML = '<br />' + string;
			
			for(var i = 1, node; i < parent.childNodes.length; i++){
				node = parent.childNodes[i--];
				append(target, node);
				evalJsAndCss(node);
			}
		}
	}

	function createElement(tagName, isText){
		return isText ? document.createTextNode(tagName) : document.createElement(tagName);
	}

	function getXhr(){
		if(window.XMLHttpRequest){
			return new window.XMLHttpRequest;
		}else{
			return new window.ActiveXObject('Microsoft.XMLHTTP');
		}
	}

	function queryString(params){
		if(typeof params == 'object'){
			var arr = [];

			for(var i in params){
				params.hasOwnProperty(i) && arr.push(i + '=' + encodeURIComponent(params[i]));
			}

			return arr.join('&');
		}

		return params;
	}

	function load(url, params, callback){
		if(typeof params == 'function'){
			callback = params;
		}else{
			params = queryString(params);

			if(/\?/.test(url)){
				url += '&' + params;
			}else if(params){
				url += '?' + params;
			}
		}

		var xhr = getXhr();
		xhr.open('GET', url, true);
		xhr.onreadystatechange = function(){
			if(xhr.readyState == 4){
				xhr.onreadystatechange = null;

				var text;

				if((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304){
					text = xhr.responseText;
				}else{
					text = xhr.statusText || (xhr.status ? 'error' : 'abort');
				}

				callback && callback(text, xhr.status, xhr);
			}
		};
		xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
		xhr.send();
		return xhr;
	}

	function init(dom, pid){
		var type = dom.tagName, html = (dom.value || dom.innerHTML);
		var parent;

		if(pid){
			parent = document.getElementById(pid);
		}else{
			parent = dom.parentNode;
		}

		append(parent, html);
		dom.parentNode.removeChild(dom);
	}

	define('static/pagelet.js', function(){
		return {
			load: load,
			init: init,
			append: append
		};
	});
})(window, document);