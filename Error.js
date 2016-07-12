import Ext from './Base';

var Err = function(message) {
    
    this.message = (this.lang[message]) ? this.lang[message] : message;
};

Err.prototype = new Error();

Ext.apply(Err.prototype, {
    
    lang: {},

    name: 'Ext.Error',
    
    getName : function() {
        return this.name;
    },
    
    getMessage : function() {
        return this.message;
    },
    
    toJson : function() {
        return Ext.encode(this);
    }
});

export default Err;