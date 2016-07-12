import Ext from './Base';
import Ajax from './Ajax';
import Observable from './util/Observable';

var Updater = Ext.extend(Observable, function() {
    var BEFOREUPDATE = "beforeupdate",
        UPDATE = "update",
        FAILURE = "failure";

    
    function processSuccess(response){
        var me = this;
        me.transaction = null;
        if (response.argument.form && response.argument.reset) {
            try { 
                response.argument.form.reset();
            } catch(e){}
        }
        if (me.loadScripts) {
            me.renderer.render(me.el, response, me,
               updateComplete.createDelegate(me, [response]));
        } else {
            me.renderer.render(me.el, response, me);
            updateComplete.call(me, response);
        }
    }

    
    function updateComplete(response, type, success){
        this.fireEvent(type || UPDATE, this.el, response);
        if(Ext.isFunction(response.argument.callback)){
            response.argument.callback.call(response.argument.scope, this.el, Ext.isEmpty(success) ? true : false, response, response.argument.options);
        }
    }

    
    function processFailure(response){
        updateComplete.call(this, response, FAILURE, !!(this.transaction = null));
    }

    return {
        constructor: function(el, forceNew){
            var me = this;
            el = Ext.get(el);
            if(!forceNew && el.updateManager){
                return el.updateManager;
            }
            
            me.el = el;
            
            me.defaultUrl = null;

            me.addEvents(
                
                BEFOREUPDATE,
                
                UPDATE,
                
                FAILURE
            );

            Ext.apply(me, Updater.defaults);
            
            
            
            
            
            

            
            me.transaction = null;
            
            me.refreshDelegate = me.refresh.createDelegate(me);
            
            me.updateDelegate = me.update.createDelegate(me);
            
            me.formUpdateDelegate = (me.formUpdate || function(){}).createDelegate(me);

            
            me.renderer = me.renderer || me.getDefaultRenderer();

            Updater.superclass.constructor.call(me);
        },

        
        setRenderer : function(renderer){
            this.renderer = renderer;
        },

        
        getRenderer : function(){
           return this.renderer;
        },

        
        getDefaultRenderer: function() {
            return new Updater.BasicRenderer();
        },

        
        setDefaultUrl : function(defaultUrl){
            this.defaultUrl = defaultUrl;
        },

        
        getEl : function(){
            return this.el;
        },

        
        update : function(url, params, callback, discardUrl){
            var me = this,
                cfg,
                callerScope;

            if(me.fireEvent(BEFOREUPDATE, me.el, url, params) !== false){
                if(Ext.isObject(url)){ 
                    cfg = url;
                    url = cfg.url;
                    params = params || cfg.params;
                    callback = callback || cfg.callback;
                    discardUrl = discardUrl || cfg.discardUrl;
                    callerScope = cfg.scope;
                    if(!Ext.isEmpty(cfg.nocache)){me.disableCaching = cfg.nocache;};
                    if(!Ext.isEmpty(cfg.text)){me.indicatorText = '<div class="loading-indicator">'+cfg.text+"</div>";};
                    if(!Ext.isEmpty(cfg.scripts)){me.loadScripts = cfg.scripts;};
                    if(!Ext.isEmpty(cfg.timeout)){me.timeout = cfg.timeout;};
                }
                me.showLoading();

                if(!discardUrl){
                    me.defaultUrl = url;
                }
                if(Ext.isFunction(url)){
                    url = url.call(me);
                }

                var o = Ext.apply({}, {
                    url : url,
                    params: (Ext.isFunction(params) && callerScope) ? params.createDelegate(callerScope) : params,
                    success: processSuccess,
                    failure: processFailure,
                    scope: me,
                    callback: undefined,
                    timeout: (me.timeout*1000),
                    disableCaching: me.disableCaching,
                    argument: {
                        "options": cfg,
                        "url": url,
                        "form": null,
                        "callback": callback,
                        "scope": callerScope || window,
                        "params": params
                    }
                }, cfg);

                me.transaction = Ext.Ajax.request(o);
            }
        },

        
        formUpdate : function(form, url, reset, callback){
            var me = this;
            if(me.fireEvent(BEFOREUPDATE, me.el, form, url) !== false){
                if(Ext.isFunction(url)){
                    url = url.call(me);
                }
                form = Ext.getDom(form);
                me.transaction = Ajax.request({
                    form: form,
                    url:url,
                    success: processSuccess,
                    failure: processFailure,
                    scope: me,
                    timeout: (me.timeout*1000),
                    argument: {
                        "url": url,
                        "form": form,
                        "callback": callback,
                        "reset": reset
                    }
                });
                me.showLoading.defer(1, me);
            }
        },

        
        startAutoRefresh : function(interval, url, params, callback, refreshNow){
            var me = this;
            if(refreshNow){
                me.update(url || me.defaultUrl, params, callback, true);
            }
            if(me.autoRefreshProcId){
                clearInterval(me.autoRefreshProcId);
            }
            me.autoRefreshProcId = setInterval(me.update.createDelegate(me, [url || me.defaultUrl, params, callback, true]), interval * 1000);
        },

        
        stopAutoRefresh : function(){
            if(this.autoRefreshProcId){
                clearInterval(this.autoRefreshProcId);
                delete this.autoRefreshProcId;
            }
        },

        
        isAutoRefreshing : function(){
           return !!this.autoRefreshProcId;
        },

        
        showLoading : function(){
            if(this.showLoadIndicator){
                this.el.dom.innerHTML = this.indicatorText;
            }
        },

        
        abort : function(){
            if(this.transaction){
                Ajax.abort(this.transaction);
            }
        },

        
        isUpdating : function(){
            return this.transaction ? Ajax.isLoading(this.transaction) : false;
        },

        
        refresh : function(callback){
            if(this.defaultUrl){
                this.update(this.defaultUrl, null, callback, true);
            }
        }
    }
}());

Updater.defaults = {
   
    timeout : 30,
    
    disableCaching : false,
    
    showLoadIndicator : true,
    
    indicatorText : '<div class="loading-indicator">Loading...</div>',
     
    loadScripts : false,
    
    sslBlankUrl : Ext.SSL_SECURE_URL
};

Updater.updateElement = function(el, url, params, options){
    var um = Ext.get(el).getUpdater();
    Ext.apply(um, options);
    um.update(url, params, options ? options.callback : null);
};

Updater.BasicRenderer = function(){};

Updater.BasicRenderer.prototype = {
    
     render : function(el, response, updateManager, callback){
        el.update(response.responseText, updateManager.loadScripts, callback);
    }
};

export default Updater;