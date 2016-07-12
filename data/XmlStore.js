import Ext from '../Base';
import Store from './Store';
import XmlReader from './XmlReader';

var XmlStore = Ext.extend(Store, {
    
    constructor: function(config){
        XmlStore.superclass.constructor.call(this, Ext.apply(config, {
            reader: new XmlReader(config)
        }));
    }
});
Ext.reg('xmlstore', XmlStore);

export default XmlStore;