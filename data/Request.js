import Ext from '../Base';

var Request = function(params) {
    Ext.apply(this, params);
};

Request.prototype = {
    
    action : undefined,
    
    rs : undefined,
    
    params: undefined,
    
    callback : Ext.emptyFn,
    
    scope : undefined,
    
    reader : undefined
};


export default Request;