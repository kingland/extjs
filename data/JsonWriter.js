import Ext from '../Base';
import DataWriter from  './DataWriter';

var JsonWriter = Ext.extend(DataWriter, {
    
    encode : true,
    
    encodeDelete: false,
    
    constructor : function(config){
        JsonWriter.superclass.constructor.call(this, config);    
    },

    
    render : function(params, baseParams, data) {
        if (this.encode === true) {
            
            Ext.apply(params, baseParams);
            params[this.meta.root] = Ext.encode(data);
        } else {
            
            var jdata = Ext.apply({}, baseParams);
            jdata[this.meta.root] = data;
            params.jsonData = jdata;
        }
    },
    
    createRecord : function(rec) {
       return this.toHash(rec);
    },
    
    updateRecord : function(rec) {
        return this.toHash(rec);

    },
    
    destroyRecord : function(rec){
        if(this.encodeDelete){
            var data = {};
            data[this.meta.idProperty] = rec.id;
            return data;
        }else{
            return rec.id;
        }
    }
});

export default JsonWriter;