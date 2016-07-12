import Ext from './Base';
import Observable from './util/Observable';

var Direct = Ext.extend( Observable, {
    exceptions: {
        TRANSPORT: 'xhr',
        PARSE: 'parse',
        LOGIN: 'login',
        SERVER: 'exception'
    },

    
    constructor: function(){
        this.addEvents(
            
            'event',
            
            'exception'
        );
        this.transactions = {};
        this.providers = {};
    },

    
    addProvider : function(provider){
        var a = arguments;
        if(a.length > 1){
            for(var i = 0, len = a.length; i < len; i++){
                this.addProvider(a[i]);
            }
            return;
        }

        
        if(!provider.events){
            provider = new Direct.PROVIDERS[provider.type](provider);
        }
        provider.id = provider.id || Ext.id();
        this.providers[provider.id] = provider;

        provider.on('data', this.onProviderData, this);
        provider.on('exception', this.onProviderException, this);


        if(!provider.isConnected()){
            provider.connect();
        }

        return provider;
    },

    
    getProvider : function(id){
        return this.providers[id];
    },

    removeProvider : function(id){
        var provider = id.id ? id : this.providers[id];
        provider.un('data', this.onProviderData, this);
        provider.un('exception', this.onProviderException, this);
        delete this.providers[provider.id];
        return provider;
    },

    addTransaction: function(t){
        this.transactions[t.tid] = t;
        return t;
    },

    removeTransaction: function(t){
        delete this.transactions[t.tid || t];
        return t;
    },

    getTransaction: function(tid){
        return this.transactions[tid.tid || tid];
    },

    onProviderData : function(provider, e){
        if(Ext.isArray(e)){
            for(var i = 0, len = e.length; i < len; i++){
                this.onProviderData(provider, e[i]);
            }
            return;
        }
        if(e.name && e.name != 'event' && e.name != 'exception'){
            this.fireEvent(e.name, e);
        }else if(e.type == 'exception'){
            this.fireEvent('exception', e);
        }
        this.fireEvent('event', e, provider);
    },

    createEvent : function(response, extraProps){
        return new Direct.eventTypes[response.type](Ext.apply(response, extraProps));
    }
});

Direct = new Direct();

Direct.TID = 1;
Direct.PROVIDERS = {};
Direct.Transaction = function(config){
    Ext.apply(this, config);
    this.tid = ++Direct.TID;
    this.retryCount = 0;
};
Direct.Transaction.prototype = {
    send: function(){
        this.provider.queueTransaction(this);
    },

    retry: function(){
        this.retryCount++;
        this.send();
    },

    getProvider: function(){
        return this.provider;
    }
};

Direct.Event = function(config){
    Ext.apply(this, config);
};

Direct.Event.prototype = {
    status: true,
    getData: function(){
        return this.data;
    }
};

Direct.RemotingEvent = Ext.extend(Direct.Event, {
    type: 'rpc',
    getTransaction: function(){
        return this.transaction || Direct.getTransaction(this.tid);
    }
});

Direct.ExceptionEvent = Ext.extend(Direct.RemotingEvent, {
    status: false,
    type: 'exception'
});

Direct.eventTypes = {
    'rpc':  Direct.RemotingEvent,
    'event':  Direct.Event,
    'exception':  Direct.ExceptionEvent
};

export default Direct;