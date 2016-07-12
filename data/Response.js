import Ext from '../Base';

var Response = function(params, response) {
    Ext.apply(this, params, {
        raw: response
    });
};

Response.prototype = {
    message : null,
    success : false,
    status : null,
    root : null,
    raw : null,

    getMessage : function() {
        return this.message;
    },
    getSuccess : function() {
        return this.success;
    },
    getStatus : function() {
        return this.status;
    },
    getRoot : function() {
        return this.root;
    },
    getRawResponse : function() {
        return this.raw;
    }
};


//Dup
Response = function(params) {
    Ext.apply(this, params);
};
Response.prototype = {
    
    action: undefined,
    
    success : undefined,
    
    message : undefined,
    
    data: undefined,
    
    raw: undefined,
    
    records: undefined
};

export default Response;