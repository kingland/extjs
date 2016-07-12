import Ext from '../Base';
import ArrayReader from './ArrayReader';
import Store from './Store';

var ArrayStore = Ext.extend(Store, {    
    constructor: function(config){
        ArrayStore.superclass.constructor.call(this, Ext.apply(config, {
            reader: new ArrayReader(config)
        }));
    },

    loadData : function(data, append){
        if(this.expandData === true){
            var r = [];
            for(var i = 0, len = data.length; i < len; i++){
                r[r.length] = [data[i]];
            }
            data = r;
        }
        ArrayStore.superclass.loadData.call(this, data, append);
    }
});
Ext.reg('arraystore', ArrayStore);

export default ArrayStore;