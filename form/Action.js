import Ext from '../Base';
import Ajax from '../Ajax';

var Action = function(form, options){
    this.form = form;
    this.options = options || {};
};

Action.CLIENT_INVALID = 'client';

Action.SERVER_INVALID = 'server';

Action.CONNECT_FAILURE = 'connect';

Action.LOAD_FAILURE = 'load';


Action.prototype = {

    type : 'default',
    
    run : function(options){

    },

    
    success : function(response){

    },

    
    handleResponse : function(response){

    },

    
    failure : function(response){
        this.response = response;
        this.failureType = Action.CONNECT_FAILURE;
        this.form.afterAction(this, false);
    },

    
    
    
    processResponse : function(response){
        this.response = response;
        if(!response.responseText && !response.responseXML){
            return true;
        }
        this.result = this.handleResponse(response);
        return this.result;
    },

    
    getUrl : function(appendParams){
        var url = this.options.url || this.form.url || this.form.el.dom.action;
        if(appendParams){
            var p = this.getParams();
            if(p){
                url = Ext.urlAppend(url, p);
            }
        }
        return url;
    },

    
    getMethod : function(){
        return (this.options.method || this.form.method || this.form.el.dom.method || 'POST').toUpperCase();
    },

    
    getParams : function(){
        var bp = this.form.baseParams;
        var p = this.options.params;
        if(p){
            if(typeof p == "object"){
                p = Ext.urlEncode(Ext.applyIf(p, bp));
            }else if(typeof p == 'string' && bp){
                p += '&' + Ext.urlEncode(bp);
            }
        }else if(bp){
            p = Ext.urlEncode(bp);
        }
        return p;
    },

    
    createCallback : function(opts){
        var opts = opts || {};
        return {
            success: this.success,
            failure: this.failure,
            scope: this,
            timeout: (opts.timeout*1000) || (this.form.timeout*1000),
            upload: this.form.fileUpload ? this.success : undefined
        };
    }
};

Action.Submit = function(form, options){
    Action.Submit.superclass.constructor.call(this, form, options);
};


Ext.extend(Action.Submit, Action, {
    
    
    type : 'submit',

    
    run : function(){
        var o = this.options,
            method = this.getMethod(),
            isGet = method == 'GET';
        if(o.clientValidation === false || this.form.isValid()){
            if (o.submitEmptyText === false) {
                var fields = this.form.items,
                    emptyFields = [];
                fields.each(function(f) {
                    if (f.el.getValue() == f.emptyText) {
                        emptyFields.push(f);
                        f.el.dom.value = "";
                    }
                });
            }
            Ajax.request(Ext.apply(this.createCallback(o), {
                form:this.form.el.dom,
                url:this.getUrl(isGet),
                method: method,
                headers: o.headers,
                params:!isGet ? this.getParams() : null,
                isUpload: this.form.fileUpload
            }));
            if (o.submitEmptyText === false) {
                Ext.each(emptyFields, function(f) {
                    if (f.applyEmptyText) {
                        f.applyEmptyText();
                    }
                });
            }
        }else if (o.clientValidation !== false){ 
            this.failureType = Action.CLIENT_INVALID;
            this.form.afterAction(this, false);
        }
    },

    
    success : function(response){
        var result = this.processResponse(response);
        if(result === true || result.success){
            this.form.afterAction(this, true);
            return;
        }
        if(result.errors){
            this.form.markInvalid(result.errors);
        }
        this.failureType = Action.SERVER_INVALID;
        this.form.afterAction(this, false);
    },

    
    handleResponse : function(response){
        if(this.form.errorReader){
            var rs = this.form.errorReader.read(response);
            var errors = [];
            if(rs.records){
                for(var i = 0, len = rs.records.length; i < len; i++) {
                    var r = rs.records[i];
                    errors[i] = r.data;
                }
            }
            if(errors.length < 1){
                errors = null;
            }
            return {
                success : rs.success,
                errors : errors
            };
        }
        return Ext.decode(response.responseText);
    }
});


Action.Load = function(form, options){
    Action.Load.superclass.constructor.call(this, form, options);
    this.reader = this.form.reader;
};


Ext.extend(Action.Load, Action, {
    
    type : 'load',

    
    run : function(){
        Ajax.request(Ext.apply(
                this.createCallback(this.options), {
                    method:this.getMethod(),
                    url:this.getUrl(false),
                    headers: this.options.headers,
                    params:this.getParams()
        }));
    },

    
    success : function(response){
        var result = this.processResponse(response);
        if(result === true || !result.success || !result.data){
            this.failureType = Action.LOAD_FAILURE;
            this.form.afterAction(this, false);
            return;
        }
        this.form.clearInvalid();
        this.form.setValues(result.data);
        this.form.afterAction(this, true);
    },

    
    handleResponse : function(response){
        if(this.form.reader){
            var rs = this.form.reader.read(response);
            var data = rs.records && rs.records[0] ? rs.records[0].data : null;
            return {
                success : rs.success,
                data : data
            };
        }
        return Ext.decode(response.responseText);
    }
});


Action.DirectLoad = Ext.extend(Action.Load, {
    constructor: function(form, opts) {
        Action.DirectLoad.superclass.constructor.call(this, form, opts);
    },
    type : 'directload',

    run : function(){
        var args = this.getParams();
        args.push(this.success, this);
        this.form.api.load.apply(window, args);
    },

    getParams : function() {
        var buf = [], o = {};
        var bp = this.form.baseParams;
        var p = this.options.params;
        Ext.apply(o, p, bp);
        var paramOrder = this.form.paramOrder;
        if(paramOrder){
            for(var i = 0, len = paramOrder.length; i < len; i++){
                buf.push(o[paramOrder[i]]);
            }
        }else if(this.form.paramsAsHash){
            buf.push(o);
        }
        return buf;
    },
    
    
    
    processResponse : function(result) {
        this.result = result;
        return result;
    },

    success : function(response, trans){
        if(trans.type == Ext.Direct.exceptions.SERVER){
            response = {};
        }
        Action.DirectLoad.superclass.success.call(this, response);
    }
});


Action.DirectSubmit = Ext.extend(Action.Submit, {
    constructor : function(form, opts) {
        Action.DirectSubmit.superclass.constructor.call(this, form, opts);
    },
    type : 'directsubmit',
    
    run : function(){
        var o = this.options;
        if(o.clientValidation === false || this.form.isValid()){
            
            
            this.success.params = this.getParams();
            this.form.api.submit(this.form.el.dom, this.success, this);
        }else if (o.clientValidation !== false){ 
            this.failureType = Action.CLIENT_INVALID;
            this.form.afterAction(this, false);
        }
    },

    getParams : function() {
        var o = {};
        var bp = this.form.baseParams;
        var p = this.options.params;
        Ext.apply(o, p, bp);
        return o;
    },
    
    
    
    processResponse : function(result) {
        this.result = result;
        return result;
    },

    success : function(response, trans){
        if(trans.type == Ext.Direct.exceptions.SERVER){
            response = {};
        }
        Action.DirectSubmit.superclass.success.call(this, response);
    }
});

Action.ACTION_TYPES = {
    'load' : Action.Load,
    'submit' : Action.Submit,
    'directload' : Action.DirectLoad,
    'directsubmit' : Action.DirectSubmit
};

export default Action;