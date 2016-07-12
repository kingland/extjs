import Ext from '../Base';
import Api from './Api'; 
import DataProxy from './DataProxy';

var MemoryProxy = function(data){
    
    var api = {};
    api[Api.actions.read] = true;
    MemoryProxy.superclass.constructor.call(this, {
        api: api
    });
    this.data = data;
};

Ext.extend(MemoryProxy, DataProxy, {
    doRequest : function(action, rs, params, reader, callback, scope, arg) {
        
        params = params || {};
        var result;
        try {
            result = reader.readRecords(this.data);
        }catch(e){
            
            this.fireEvent("loadexception", this, null, arg, e);

            this.fireEvent('exception', this, 'response', action, arg, null, e);
            callback.call(scope, null, arg, false);
            return;
        }
        callback.call(scope, result, arg, true);
    }
});

export default MemoryProxy;