import Ext from '../Base';
import Record from './Record';


var DataWriter = function(config){
    Ext.apply(this, config);
};

DataWriter.prototype = {
    writeAllFields : false,
    
    listful : false,    

    
    apply : function(params, baseParams, action, rs) {
        var data    = [],
        renderer    = action + 'Record';
        
        if (Ext.isArray(rs)) {
            Ext.each(rs, function(rec){
                data.push(this[renderer](rec));
            }, this);
        }
        else if (rs instanceof Record) {
            data = this[renderer](rs);
        }
        this.render(params, baseParams, data);
    },

    
    render : Ext.emptyFn,

    
    updateRecord : Ext.emptyFn,

    
    createRecord : Ext.emptyFn,

    
    destroyRecord : Ext.emptyFn,

    
    toHash : function(rec, config) {
        var map = rec.fields.map,
            data = {},
            raw = (this.writeAllFields === false && rec.phantom === false) ? rec.getChanges() : rec.data,
            m;
        Ext.iterate(raw, function(prop, value){
            if((m = map[prop])){
                data[m.mapping ? m.mapping : m.name] = value;
            }
        });
        
        
        
        if (rec.phantom) {
            if (rec.fields.containsKey(this.meta.idProperty) && Ext.isEmpty(rec.data[this.meta.idProperty])) {
                delete data[this.meta.idProperty];
            }
        } else {
            data[this.meta.idProperty] = rec.id
        }
        return data;
    },

    
    toArray : function(data) {
        var fields = [];
        Ext.iterate(data, function(k, v) {fields.push({name: k, value: v});},this);
        return fields;
    }
};

export default DataWriter;