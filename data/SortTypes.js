import Ext from '../Base';

var SortTypes = {
    
    none : function(s){
        return s;
    },
    
    
    stripTagsRE : /<\/?[^>]+>/gi,
    
    
    asText : function(s){
        return String(s).replace(this.stripTagsRE, "");
    },
    
    
    asUCText : function(s){
        return String(s).toUpperCase().replace(this.stripTagsRE, "");
    },
    
    
    asUCString : function(s) {
    	return String(s).toUpperCase();
    },
    
    
    asDate : function(s) {
        if(!s){
            return 0;
        }
        if(Ext.isDate(s)){
            return s.getTime();
        }
    	return Date.parse(String(s));
    },
    
    
    asFloat : function(s) {
    	var val = parseFloat(String(s).replace(/,/g, ""));
    	return isNaN(val) ? 0 : val;
    },
    
    
    asInt : function(s) {
        var val = parseInt(String(s).replace(/,/g, ""), 10);
        return isNaN(val) ? 0 : val;
    }
};

export default SortTypes;