import Ext from '../Base';
import Error from '../Error';
import Api from './Api';
import Record from './Record';
import Observable from '../util/Observable';

var DataProxy = function(conn){
    conn = conn || {};
    this.api     = conn.api;
    this.url     = conn.url;
    this.restful = conn.restful;
    this.listeners = conn.listeners;
    this.prettyUrls = conn.prettyUrls;
    this.addEvents(
        
        'exception',
        
        'beforeload',
        
        'load',
        
        'loadexception',
        
        'beforewrite',
        
        'write'
    );
    DataProxy.superclass.constructor.call(this);

    
    try {
        Api.prepare(this);
    } catch (e) {
        if (e instanceof Api.Error) {
            e.toConsole();
        }
    }
    
    DataProxy.relayEvents(this, ['beforewrite', 'write', 'exception']);
};

Ext.extend(DataProxy, Observable, {
    
    restful: false,

    
    setApi : function() {
        if (arguments.length == 1) {
            var valid = Api.isValid(arguments[0]);
            if (valid === true) {
                this.api = arguments[0];
            }
            else {
                throw new Api.Error('invalid', valid);
            }
        }
        else if (arguments.length == 2) {
            if (!Api.isAction(arguments[0])) {
                throw new Api.Error('invalid', arguments[0]);
            }
            this.api[arguments[0]] = arguments[1];
        }
        Api.prepare(this);
    },

    
    isApiAction : function(action) {
        return (this.api[action]) ? true : false;
    },

    
    request : function(action, rs, params, reader, callback, scope, options) {
        if (!this.api[action] && !this.load) {
            throw new DataProxy.Error('action-undefined', action);
        }
        params = params || {};
        if ((action === Api.actions.read) ? this.fireEvent("beforeload", this, params) : this.fireEvent("beforewrite", this, action, rs, params) !== false) {
            this.doRequest.apply(this, arguments);
        }
        else {
            callback.call(scope || this, null, options, false);
        }
    },


    
    load : null,

    
    doRequest : function(action, rs, params, reader, callback, scope, options) {
        
        
        
        this.load(params, reader, callback, scope, options);
    },

    
    onRead : Ext.emptyFn,
    
    onWrite : Ext.emptyFn,
    
    buildUrl : function(action, record) {
        record = record || null;

        var url = (this.conn && this.conn.url) ? this.conn.url : (this.api[action]) ? this.api[action].url : this.url;
        if (!url) {
            throw new Api.Error('invalid-url', action);
        }
        
        var provides = null;
        var m = url.match(/(.*)(\.json|\.xml|\.html)$/);
        if (m) {
            provides = m[2];    
            url      = m[1];    
        }
        
        if ((this.restful === true || this.prettyUrls === true) && record instanceof Record && !record.phantom) {
            url += '/' + record.id;
        }
        return (provides === null) ? url : url + provides;
    },

    
    destroy: function(){
        this.purgeListeners();
    }
});

Ext.apply(DataProxy, Observable.prototype);

Observable.call(DataProxy);

DataProxy.Error = Ext.extend(Error, {
    constructor : function(message, arg) {
        this.arg = arg;
        Error.call(this, message);
    },
    name: 'DataProxy'
});

Ext.apply(DataProxy.Error.prototype, {
    lang: {
        'action-undefined': "DataProxy attempted to execute an API-action but found an undefined url / function.  Please review your Proxy url/api-configuration.",
        'api-invalid': 'Recieved an invalid API-configuration.  Please ensure your proxy API-configuration contains only the actions from Ext.data.Api.actions.'
    }
});

export default DataProxy;