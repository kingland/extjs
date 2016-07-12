import Ext from '../Base';
import Observable from '../util/Observable';

var Provider = Ext.extend( Observable, {    
    priority: 1,
    constructor : function(config){
        Ext.apply(this, config);
        this.addEvents(
                        
            'connect',
                        
            'disconnect',
                        
            'data',
                                    
            'exception'
        );
        Provider.superclass.constructor.call(this, config);
    },
    
    isConnected: function(){
        return false;
    },
    connect: Ext.emptyFn,
    disconnect: Ext.emptyFn
});

export default Provider;