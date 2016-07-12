import Ext from '../Base';
import SortTypes from './SortTypes';

var Types = new function(){
    var st = SortTypes;
    Ext.apply(this, {
        
        stripRe: /[\$,%]/g,
        
        
        AUTO: {
            convert: function(v){ return v; },
            sortType: st.none,
            type: 'auto'
        },

        
        STRING: {
            convert: function(v){ return (v === undefined || v === null) ? '' : String(v); },
            sortType: st.asUCString,
            type: 'string'
        },

        
        INT: {
            convert: function(v){
                return v !== undefined && v !== null && v !== '' ?
                    parseInt(String(v).replace(Types.stripRe, ''), 10) : 0;
            },
            sortType: st.none,
            type: 'int'
        },
        
        
        FLOAT: {
            convert: function(v){
                return v !== undefined && v !== null && v !== '' ?
                    parseFloat(String(v).replace(Types.stripRe, ''), 10) : 0;
            },
            sortType: st.none,
            type: 'float'
        },
        
        
        BOOL: {
            convert: function(v){ return v === true || v === 'true' || v == 1; },
            sortType: st.none,
            type: 'bool'
        },
        
        
        DATE: {
            convert: function(v){
                var df = this.dateFormat;
                if(!v){
                    return null;
                }
                if(Ext.isDate(v)){
                    return v;
                }
                if(df){
                    if(df == 'timestamp'){
                        return new Date(v*1000);
                    }
                    if(df == 'time'){
                        return new Date(parseInt(v, 10));
                    }
                    return Date.parseDate(v, df);
                }
                var parsed = Date.parse(v);
                return parsed ? new Date(parsed) : null;
            },
            sortType: st.asDate,
            type: 'date'
        }
    });
    
    Ext.apply(this, {
        
        BOOLEAN: this.BOOL,
        
        INTEGER: this.INT,
        
        NUMBER: this.FLOAT    
    });
};

export default Types;