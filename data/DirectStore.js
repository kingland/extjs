import Ext from '../Base';
import Store from './Store';
import DirectProxy from './DirectProxy';
import JsonReader from './JsonReader';

var DirectStore = Ext.extend(Store, {
    constructor : function(config){
        
        var c = Ext.apply({}, {
            batchTransactions: false
        }, config);
        DirectStore.superclass.constructor.call(this, Ext.apply(c, {
            proxy: Ext.isDefined(c.proxy) ? c.proxy : new DirectProxy(Ext.copyTo({}, c, 'paramOrder,paramsAsHash,directFn,api')),
            reader: (!Ext.isDefined(c.reader) && c.fields) ? new JsonReader(Ext.copyTo({}, c, 'totalProperty,root,idProperty'), c.fields) : c.reader
        }));
    }
});
Ext.reg('directstore', DirectStore);

export default DirectStore;