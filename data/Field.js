import Ext from '../Base';
import Types from './Types';
import SortTypes from './SortTypes';

var Field = Ext.extend(Object, {
    
    constructor : function(config){
        if(Ext.isString(config)){
            config = {name: config};
        }
        Ext.apply(this, config);
        
        var types = Types,
            st = this.sortType,
            t;

        if(this.type){
            if(Ext.isString(this.type)){
                this.type = Types[this.type.toUpperCase()] || types.AUTO;
            }
        }else{
            this.type = types.AUTO;
        }

        
        if(Ext.isString(st)){
            this.sortType = SortTypes[st];
        }else if(Ext.isEmpty(st)){
            this.sortType = this.type.sortType;
        }

        if(!this.convert){
            this.convert = this.type.convert;
        }
    },
    
    
    
    
    
    dateFormat: null,
    
    defaultValue: "",
    
    mapping: null,
    
    sortType : null,
    
    sortDir : "ASC",
    
    allowBlank : true
});

export default Field;