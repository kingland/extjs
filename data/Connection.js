import Ext from '../Base';
import EventManager from '../EventManager';
import Observable from '../util/Observable';

//(function(){
var BEFOREREQUEST = "beforerequest",
	REQUESTCOMPLETE = "requestcomplete",
	REQUESTEXCEPTION = "requestexception",
	UNDEFINED = undefined,
	LOAD = 'load',
	POST = 'POST',
	GET = 'GET',
	WINDOW = window;


var Connection = function(config){
	Ext.apply(this, config);
	this.addEvents(
		
		BEFOREREQUEST,
		
		REQUESTCOMPLETE,
		
		REQUESTEXCEPTION
	);
	Connection.superclass.constructor.call(this);
};

Ext.extend(Connection, Observable, {
	
	timeout : 30000,
	
	autoAbort:false,

	
	disableCaching: true,

	
	disableCachingParam: '_dc',

	
	request : function(o){
		var me = this;
		if(me.fireEvent(BEFOREREQUEST, me, o)){
			if (o.el) {
				if(!Ext.isEmpty(o.indicatorText)){
					me.indicatorText = '<div class="loading-indicator">'+o.indicatorText+"</div>";
				}
				if(me.indicatorText) {
					Ext.getDom(o.el).innerHTML = me.indicatorText;
				}
				o.success = (Ext.isFunction(o.success) ? o.success : function(){}).createInterceptor(function(response) {
					Ext.getDom(o.el).innerHTML = response.responseText;
				});
			}

			var p = o.params,
				url = o.url || me.url,
				method,
				cb = {success: me.handleResponse,
					  failure: me.handleFailure,
					  scope: me,
					  argument: {options: o},
					  timeout : o.timeout || me.timeout
				},
				form,
				serForm;


			if (Ext.isFunction(p)) {
				p = p.call(o.scope||WINDOW, o);
			}

			p = Ext.urlEncode(me.extraParams, Ext.isObject(p) ? Ext.urlEncode(p) : p);

			if (Ext.isFunction(url)) {
				url = url.call(o.scope || WINDOW, o);
			}

			if((form = Ext.getDom(o.form))){
				url = url || form.action;
				 if(o.isUpload || /multipart\/form-data/i.test(form.getAttribute("enctype"))) {
					 return me.doFormUpload.call(me, o, p, url);
				 }
				serForm = Ext.lib.Ajax.serializeForm(form);
				p = p ? (p + '&' + serForm) : serForm;
			}

			method = o.method || me.method || ((p || o.xmlData || o.jsonData) ? POST : GET);

			if(method === GET && (me.disableCaching && o.disableCaching !== false) || o.disableCaching === true){
				var dcp = o.disableCachingParam || me.disableCachingParam;
				url = Ext.urlAppend(url, dcp + '=' + (new Date().getTime()));
			}

			o.headers = Ext.apply(o.headers || {}, me.defaultHeaders || {});

			if(o.autoAbort === true || me.autoAbort) {
				me.abort();
			}

			if((method == GET || o.xmlData || o.jsonData) && p){
				url = Ext.urlAppend(url, p);
				p = '';
			}
			return (me.transId = Ext.lib.Ajax.request(method, url, cb, p, o));
		}else{
			return o.callback ? o.callback.apply(o.scope, [o,UNDEFINED,UNDEFINED]) : null;
		}
	},

	
	isLoading : function(transId){
		return transId ? Ext.lib.Ajax.isCallInProgress(transId) : !! this.transId;
	},

	
	abort : function(transId){
		if(transId || this.isLoading()){
			Ext.lib.Ajax.abort(transId || this.transId);
		}
	},

	
	handleResponse : function(response){
		this.transId = false;
		var options = response.argument.options;
		response.argument = options ? options.argument : null;
		this.fireEvent(REQUESTCOMPLETE, this, response, options);
		if(options.success){
			options.success.call(options.scope, response, options);
		}
		if(options.callback){
			options.callback.call(options.scope, options, true, response);
		}
	},

	
	handleFailure : function(response, e){
		this.transId = false;
		var options = response.argument.options;
		response.argument = options ? options.argument : null;
		this.fireEvent(REQUESTEXCEPTION, this, response, options, e);
		if(options.failure){
			options.failure.call(options.scope, response, options);
		}
		if(options.callback){
			options.callback.call(options.scope, options, false, response);
		}
	},

	
	doFormUpload : function(o, ps, url){
		var id = Ext.id(),
			doc = document,
			frame = doc.createElement('iframe'),
			form = Ext.getDom(o.form),
			hiddens = [],
			hd,
			encoding = 'multipart/form-data',
			buf = {
				target: form.target,
				method: form.method,
				encoding: form.encoding,
				enctype: form.enctype,
				action: form.action
			};

		
		Ext.fly(frame).set({
			id: id,
			name: id,
			cls: 'x-hidden',
			src: Ext.SSL_SECURE_URL
		}); 

		doc.body.appendChild(frame);

		
		if(Ext.isIE){
		   document.frames[id].name = id;
		}


		Ext.fly(form).set({
			target: id,
			method: POST,
			enctype: encoding,
			encoding: encoding,
			action: url || buf.action
		});

		
		Ext.iterate(Ext.urlDecode(ps, false), function(k, v){
			hd = doc.createElement('input');
			Ext.fly(hd).set({
				type: 'hidden',
				value: v,
				name: k
			});
			form.appendChild(hd);
			hiddens.push(hd);
		});

		function cb(){
			var me = this,
				
				r = {responseText : '',
					 responseXML : null,
					 argument : o.argument},
				doc,
				firstChild;

			try{
				doc = frame.contentWindow.document || frame.contentDocument || WINDOW.frames[id].document;
				if(doc){
					if(doc.body){
						if(/textarea/i.test((firstChild = doc.body.firstChild || {}).tagName)){ 
							r.responseText = firstChild.value;
						}else{
							r.responseText = doc.body.innerHTML;
						}
					}
					
					r.responseXML = doc.XMLDocument || doc;
				}
			}
			catch(e) {}

			EventManager.removeListener(frame, LOAD, cb, me);

			me.fireEvent(REQUESTCOMPLETE, me, r, o);

			function runCallback(fn, scope, args){
				if(Ext.isFunction(fn)){
					fn.apply(scope, args);
				}
			}

			runCallback(o.success, o.scope, [r, o]);
			runCallback(o.callback, o.scope, [o, true, r]);

			if(!me.debugUploads){
				setTimeout(function(){Ext.removeNode(frame);}, 100);
			}
		}

		EventManager.on(frame, LOAD, cb, this);
		form.submit();

		Ext.fly(form).set(buf);
		Ext.each(hiddens, function(h) {
			Ext.removeNode(h);
		});
	}
});

export default Connection;
//})();