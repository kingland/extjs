import Ext from '../Base';
import DataProxy from './DataProxy';
import Api from './Api';

var DirectProxy = function(config){
    Ext.apply(this, config);
    if(typeof this.paramOrder == 'string'){
        this.paramOrder = this.paramOrder.split(/[\s,|]/);
    }
    DirectProxy.superclass.constructor.call(this, config);
};

Ext.extend(DirectProxy, DataProxy, {
    
    paramOrder: undefined,

    
    paramsAsHash: true,

    
    directFn : undefined,

    
    doRequest : function(action, rs, params, reader, callback, scope, options) {
        var args = [],
            directFn = this.api[action] || this.directFn;

        switch (action) {
            case Api.actions.create:
                args.push(params.jsonData);		
                break;
            case Api.actions.read:
                
                if(directFn.directCfg.method.len > 0){
                    if(this.paramOrder){
                        for(var i = 0, len = this.paramOrder.length; i < len; i++){
                            args.push(params[this.paramOrder[i]]);
                        }
                    }else if(this.paramsAsHash){
                        args.push(params);
                    }
                }
                break;
            case Api.actions.update:
                args.push(params.jsonData);        
                break;
            case Api.actions.destroy:
                args.push(params.jsonData);        
                break;
        }

        var trans = {
            params : params || {},
            request: {
                callback : callback,
                scope : scope,
                arg : options
            },
            reader: reader
        };

        args.push(this.createCallback(action, rs, trans), this);
        directFn.apply(window, args);
    },

    
    createCallback : function(action, rs, trans) {
        var me = this;
        return function(result, res) {
            if (!res.status) {
                
                if (action === Api.actions.read) {
                    me.fireEvent("loadexception", me, trans, res, null);
                }
                me.fireEvent('exception', me, 'remote', action, trans, res, null);
                trans.request.callback.call(trans.request.scope, null, trans.request.arg, false);
                return;
            }
            if (action === Api.actions.read) {
                me.onRead(action, trans, result, res);
            } else {
                me.onWrite(action, trans, result, res, rs);
            }
        };
    },

    
    onRead : function(action, trans, result, res) {
        var records;
        try {
            records = trans.reader.readRecords(result);
        }
        catch (ex) {
            
            this.fireEvent("loadexception", this, trans, res, ex);

            this.fireEvent('exception', this, 'response', action, trans, res, ex);
            trans.request.callback.call(trans.request.scope, null, trans.request.arg, false);
            return;
        }
        this.fireEvent("load", this, res, trans.request.arg);
        trans.request.callback.call(trans.request.scope, records, trans.request.arg, true);
    },
    
    onWrite : function(action, trans, result, res, rs) {
        var data = trans.reader.extractData(trans.reader.getRoot(result), false);
        var success = trans.reader.getSuccess(result);
        success = (success !== false);
        if (success){
            this.fireEvent("write", this, action, data, res, rs, trans.request.arg);
        }else{
            this.fireEvent('exception', this, 'remote', action, trans, result, rs);
        }
        trans.request.callback.call(trans.request.scope, data, res, success);
    }
});

export default DirectProxy;