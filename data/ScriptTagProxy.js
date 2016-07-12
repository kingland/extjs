import Ext from '../Base';
import DataProxy from './DataProxy';

var ScriptTagProxy = function(config){
    Ext.apply(this, config);

    ScriptTagProxy.superclass.constructor.call(this, config);

    this.head = document.getElementsByTagName("head")[0];

    
};

ScriptTagProxy.TRANS_ID = 1000;
Ext.extend(ScriptTagProxy, DataProxy, {
    
    
    timeout : 30000,
    
    callbackParam : "callback",
    
    nocache : true,

    
    doRequest : function(action, rs, params, reader, callback, scope, arg) {
        var p = Ext.urlEncode(Ext.apply(params, this.extraParams));

        var url = this.buildUrl(action, rs);
        if (!url) {
            throw new Api.Error('invalid-url', url);
        }
        url = Ext.urlAppend(url, p);

        if(this.nocache){
            url = Ext.urlAppend(url, '_dc=' + (new Date().getTime()));
        }
        var transId = ++ScriptTagProxy.TRANS_ID;
        var trans = {
            id : transId,
            action: action,
            cb : "stcCallback"+transId,
            scriptId : "stcScript"+transId,
            params : params,
            arg : arg,
            url : url,
            callback : callback,
            scope : scope,
            reader : reader
        };
        window[trans.cb] = this.createCallback(action, rs, trans);
        url += String.format("&{0}={1}", this.callbackParam, trans.cb);
        if(this.autoAbort !== false){
            this.abort();
        }

        trans.timeoutId = this.handleFailure.defer(this.timeout, this, [trans]);

        var script = document.createElement("script");
        script.setAttribute("src", url);
        script.setAttribute("type", "text/javascript");
        script.setAttribute("id", trans.scriptId);
        this.head.appendChild(script);

        this.trans = trans;
    },

    
    createCallback : function(action, rs, trans) {
        var self = this;
        return function(res) {
            self.trans = false;
            self.destroyTrans(trans, true);
            if (action === Api.actions.read) {
                self.onRead.call(self, action, trans, res);
            } else {
                self.onWrite.call(self, action, trans, res, rs);
            }
        };
    },
    
    onRead : function(action, trans, res) {
        var result;
        try {
            result = trans.reader.readRecords(res);
        }catch(e){
            
            this.fireEvent("loadexception", this, trans, res, e);

            this.fireEvent('exception', this, 'response', action, trans, res, e);
            trans.callback.call(trans.scope||window, null, trans.arg, false);
            return;
        }
        if (result.success === false) {
            
            this.fireEvent('loadexception', this, trans, res);

            this.fireEvent('exception', this, 'remote', action, trans, res, null);
        } else {
            this.fireEvent("load", this, res, trans.arg);
        }
        trans.callback.call(trans.scope||window, result, trans.arg, result.success);
    },
    
    onWrite : function(action, trans, response, rs) {
        var reader = trans.reader;
        try {
            
            var res = reader.readResponse(action, response);
        } catch (e) {
            this.fireEvent('exception', this, 'response', action, trans, res, e);
            trans.callback.call(trans.scope||window, null, res, false);
            return;
        }
        if(!res.success === true){
            this.fireEvent('exception', this, 'remote', action, trans, res, rs);
            trans.callback.call(trans.scope||window, null, res, false);
            return;
        }
        this.fireEvent("write", this, action, res.data, res, rs, trans.arg );
        trans.callback.call(trans.scope||window, res.data, res, true);
    },

    
    isLoading : function(){
        return this.trans ? true : false;
    },

    
    abort : function(){
        if(this.isLoading()){
            this.destroyTrans(this.trans);
        }
    },

    
    destroyTrans : function(trans, isLoaded){
        this.head.removeChild(document.getElementById(trans.scriptId));
        clearTimeout(trans.timeoutId);
        if(isLoaded){
            window[trans.cb] = undefined;
            try{
                delete window[trans.cb];
            }catch(e){}
        }else{
            
            window[trans.cb] = function(){
                window[trans.cb] = undefined;
                try{
                    delete window[trans.cb];
                }catch(e){}
            };
        }
    },

    
    handleFailure : function(trans){
        this.trans = false;
        this.destroyTrans(trans, false);
        if (trans.action === Api.actions.read) {
            
            this.fireEvent("loadexception", this, null, trans.arg);
        }

        this.fireEvent('exception', this, 'response', trans.action, {
            response: null,
            options: trans.arg
        });
        trans.callback.call(trans.scope||window, null, trans.arg, false);
    },

    
    destroy: function(){
        this.abort();
        ScriptTagProxy.superclass.destroy.call(this);
    }
});

export default ScriptTagProxy;