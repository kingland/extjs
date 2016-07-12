import Ext from '../Base';
import Observable from '../util/Observable';
import Store from '../data/Store';
import Record from '../data/Record';
import PropertyRecord from './PropertyRecord';

var PropertyStore = Ext.extend(Observable, {
    
    constructor : function(grid, source){
        this.grid = grid;
        this.store = new Store({
            recordType : PropertyRecord
        });
        this.store.on('update', this.onUpdate,  this);
        if(source){
            this.setSource(source);
        }
        PropertyStore.superclass.constructor.call(this);    
    },
    
    
    setSource : function(o){
        this.source = o;
        this.store.removeAll();
        var data = [];
        for(var k in o){
            if(this.isEditableValue(o[k])){
                data.push(new PropertyRecord({name: k, value: o[k]}, k));
            }
        }
        this.store.loadRecords({records: data}, {}, true);
    },

    
    onUpdate : function(ds, record, type){
        if(type == Record.EDIT){
            var v = record.data.value;
            var oldValue = record.modified.value;
            if(this.grid.fireEvent('beforepropertychange', this.source, record.id, v, oldValue) !== false){
                this.source[record.id] = v;
                record.commit();
                this.grid.fireEvent('propertychange', this.source, record.id, v, oldValue);
            }else{
                record.reject();
            }
        }
    },

    
    getProperty : function(row){
       return this.store.getAt(row);
    },

    
    isEditableValue: function(val){
        return Ext.isPrimitive(val) || Ext.isDate(val);
    },

    
    setValue : function(prop, value, create){
        var r = this.getRec(prop);
        if(r){
            r.set('value', value);
            this.source[prop] = value;
        }else if(create){
            
            this.source[prop] = value;
            r = new PropertyRecord({name: prop, value: value}, prop);
            this.store.add(r);

        }
    },
    
    
    remove : function(prop){
        var r = this.getRec(prop);
        if(r){
            this.store.remove(r);
            delete this.source[prop];
        }
    },
    
    
    getRec : function(prop){
        return this.store.getById(prop);
    },

    
    getSource : function(){
        return this.source;
    }
});

export default PropertyStore;