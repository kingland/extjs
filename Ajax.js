import Ext from './Base';
import Connection from './data/Connection';

var Ajax = new Connection({
    autoAbort : false,

    serializeForm : function(form){
        return Ext.lib.Ajax.serializeForm(form);
    }
});

export default Ajax;