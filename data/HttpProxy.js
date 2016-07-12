import Ext from '../Base';
import Api from './Api';
import DataProxy from './DataProxy';
import Ajax from '../Ajax';

var HttpProxy = function(conn){
    HttpProxy.superclass.constructor.call(this, conn);

    this.conn = conn;
    
    this.conn.url = null;

    this.useAjax = !conn || !conn.events;

    
    var actions = Api.actions;
    this.activeRequest = {};
    for (var verb in actions) {
        this.activeRequest[actions[verb]] = undefined;
    }
};

Ext.extend(HttpProxy, DataProxy, {
    
    getConnection : function() {
        return this.useAjax ? Ajax : this.conn;
    },

    
    setUrl : function(url, makePermanent) {
        this.conn.url = url;
        if (makePermanent === true) {
            this.url = url;
            this.api = null;
            Api.prepare(this);
        }
    },

    
    doRequest : function(action, rs, params, reader, cb, scope, arg) {
        var  o = {
            method: (this.api[action]) ? this.api[action]['method'] : undefined,
            request: {
                callback : cb,
                scope : scope,
                arg : arg
            },
            reader: reader,
            callback : this.createCallback(action, rs),
            scope: this
        };

        
        
        if (params.jsonData) {
            o.jsonData = params.jsonData;
        } else if (params.xmlData) {
            o.xmlData = params.xmlData;
        } else {
            o.params = params || {};
        }
        
        
        
        this.conn.url = this.buildUrl(action, rs);

        if(this.useAjax){

            Ext.applyIf(o, this.conn);

            
            if (this.activeRequest[action]) {
                
                
                
                
                
            }
            this.activeRequest[action] = Ajax.request(o);
        }else{
            this.conn.request(o);
        }
        
        this.conn.url = null;
    },

    
    createCallback : function(action, rs) {
        return function(o, success, response) {
            this.activeRequest[action] = undefined;
            if (!success) {
                if (action === Api.actions.read) {
                    
                    
                    this.fireEvent('loadexception', this, o, response);
                }
                this.fireEvent('exception', this, 'response', action, o, response);
                o.request.callback.call(o.request.scope, null, o.request.arg, false);
                return;
            }
            if (action === Api.actions.read) {
                this.onRead(action, o, response);
            } else {
                this.onWrite(action, o, response, rs);
            }
        };
    },

    
    onRead : function(action, o, response) {
        var result;
        try {
            result = o.reader.read(response);
        }catch(e){
            
            
            this.fireEvent('loadexception', this, o, response, e);

            this.fireEvent('exception', this, 'response', action, o, response, e);
            o.request.callback.call(o.request.scope, null, o.request.arg, false);
            return;
        }
        if (result.success === false) {
            
            
            this.fireEvent('loadexception', this, o, response);

            
            var res = o.reader.readResponse(action, response);
            this.fireEvent('exception', this, 'remote', action, o, res, null);
        }
        else {
            this.fireEvent('load', this, o, o.request.arg);
        }
        
        
        
        o.request.callback.call(o.request.scope, result, o.request.arg, result.success);
    },
    
    onWrite : function(action, o, response, rs) {
        var reader = o.reader;
        var res;
        try {
            res = reader.readResponse(action, response);
        } catch (e) {
            this.fireEvent('exception', this, 'response', action, o, response, e);
            o.request.callback.call(o.request.scope, null, o.request.arg, false);
            return;
        }
        if (res.success === true) {
            this.fireEvent('write', this, action, res.data, res, rs, o.request.arg);
        } else {
            this.fireEvent('exception', this, 'remote', action, o, res, rs);
        }
        
        
        
        o.request.callback.call(o.request.scope, res.data, res, res.success);
    },

    
    destroy: function(){
        if(!this.useAjax){
            this.conn.abort();
        }else if(this.activeRequest){
            var actions = Api.actions;
            for (var verb in actions) {
                if(this.activeRequest[actions[verb]]){
                    Ajax.abort(this.activeRequest[actions[verb]]);
                }
            }
        }
        HttpProxy.superclass.destroy.call(this);
    }
});

export default HttpProxy;