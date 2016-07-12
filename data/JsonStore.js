import Ext from '../Base';
import JsonReader from './JsonReader';
import Store from './Store';

var JsonStore = Ext.extend(Store, {    
    constructor: function(config){
        JsonStore.superclass.constructor.call(this, Ext.apply(config, {
            reader: new JsonReader(config)
        }));
    }
});
Ext.reg('jsonstore', JsonStore);

export default JsonStore;