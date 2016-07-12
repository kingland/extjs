import Ext from '../Base';
import Action from './Action';
import Observable from '../util/Observable';
import MixedCollection from '../util/MixedCollection';
import MessageBox from '../MessageBox';

var BasicForm = Ext.extend(Observable, {
    constructor: function(el, config){
        Ext.apply(this, config);
        if(Ext.isString(this.paramOrder)){
            this.paramOrder = this.paramOrder.split(/[\s,|]/);
        }
        
        this.items = new MixedCollection(false, function(o){
            return o.getItemId();
        });
        this.addEvents(
            
            'beforeaction',
            
            'actionfailed',
            
            'actioncomplete'
        );

        if(el){
            this.initEl(el);
        }
        BasicForm.superclass.constructor.call(this);
    },
    
    timeout: 30,
    
    paramOrder: undefined,

    
    paramsAsHash: false,

    
    waitTitle: 'Please Wait...',

    
    activeAction : null,

    
    trackResetOnLoad : false,

    initEl : function(el){
        this.el = Ext.get(el);
        this.id = this.el.id || Ext.id();
        if(!this.standardSubmit){
            this.el.on('submit', this.onSubmit, this);
        }
        this.el.addClass('x-form');
    },

    
    getEl: function(){
        return this.el;
    },

    
    onSubmit : function(e){
        e.stopEvent();
    },

    
    destroy: function(bound){
        if(bound !== true){
            this.items.each(function(f){
                Ext.destroy(f);
            });
            Ext.destroy(this.el);
        }
        this.items.clear();
        this.purgeListeners();
    },

    
    isValid : function(){
        var valid = true;
        this.items.each(function(f){
           if(!f.validate()){
               valid = false;
           }
        });
        return valid;
    },

    
    isDirty : function(){
        var dirty = false;
        this.items.each(function(f){
           if(f.isDirty()){
               dirty = true;
               return false;
           }
        });
        return dirty;
    },

    
    doAction : function(action, options){
        if(Ext.isString(action)){
            action = new Action.ACTION_TYPES[action](this, options);
        }
        if(this.fireEvent('beforeaction', this, action) !== false){
            this.beforeAction(action);
            action.run.defer(100, action);
        }
        return this;
    },

    
    submit : function(options){
        options = options || {};
        if(this.standardSubmit){
            var v = options.clientValidation === false || this.isValid();
            if(v){
                var el = this.el.dom;
                if(this.url && Ext.isEmpty(el.action)){
                    el.action = this.url;
                }
                el.submit();
            }
            return v;
        }
        var submitAction = String.format('{0}submit', this.api ? 'direct' : '');
        this.doAction(submitAction, options);
        return this;
    },

    
    load : function(options){
        var loadAction = String.format('{0}load', this.api ? 'direct' : '');
        this.doAction(loadAction, options);
        return this;
    },

    
    updateRecord : function(record){
        record.beginEdit();
        var fs = record.fields;
        fs.each(function(f){
            var field = this.findField(f.name);
            if(field){
                record.set(f.name, field.getValue());
            }
        }, this);
        record.endEdit();
        return this;
    },

    
    loadRecord : function(record){
        this.setValues(record.data);
        return this;
    },

    
    beforeAction : function(action){
        
        this.items.each(function(f){
            if(f.isFormField && f.syncValue){
                f.syncValue();
            }
        });
        var o = action.options;
        if(o.waitMsg){
            if(this.waitMsgTarget === true){
                this.el.mask(o.waitMsg, 'x-mask-loading');
            }else if(this.waitMsgTarget){
                this.waitMsgTarget = Ext.get(this.waitMsgTarget);
                this.waitMsgTarget.mask(o.waitMsg, 'x-mask-loading');
            }else{
                MessageBox.wait(o.waitMsg, o.waitTitle || this.waitTitle);
            }
        }
    },

    
    afterAction : function(action, success){
        this.activeAction = null;
        var o = action.options;
        if(o.waitMsg){
            if(this.waitMsgTarget === true){
                this.el.unmask();
            }else if(this.waitMsgTarget){
                this.waitMsgTarget.unmask();
            }else{
                MessageBox.updateProgress(1);
                MessageBox.hide();
            }
        }
        if(success){
            if(o.reset){
                this.reset();
            }
            Ext.callback(o.success, o.scope, [this, action]);
            this.fireEvent('actioncomplete', this, action);
        }else{
            Ext.callback(o.failure, o.scope, [this, action]);
            this.fireEvent('actionfailed', this, action);
        }
    },

    
    findField : function(id) {
        var field = this.items.get(id);

        if (!Ext.isObject(field)) {
            
            var findMatchingField = function(f) {
                if (f.isFormField) {
                    if (f.dataIndex == id || f.id == id || f.getName() == id) {
                        field = f;
                        return false;
                    } else if (f.isComposite && f.rendered) {
                        return f.items.each(findMatchingField);
                    }
                }
            };

            this.items.each(findMatchingField);
        }
        return field || null;
    },


    
    markInvalid : function(errors){
        if (Ext.isArray(errors)) {
            for(var i = 0, len = errors.length; i < len; i++){
                var fieldError = errors[i];
                var f = this.findField(fieldError.id);
                if(f){
                    f.markInvalid(fieldError.msg);
                }
            }
        } else {
            var field, id;
            for(id in errors){
                if(!Ext.isFunction(errors[id]) && (field = this.findField(id))){
                    field.markInvalid(errors[id]);
                }
            }
        }

        return this;
    },

    
    setValues : function(values){
        if(Ext.isArray(values)){ 
            for(var i = 0, len = values.length; i < len; i++){
                var v = values[i];
                var f = this.findField(v.id);
                if(f){
                    f.setValue(v.value);
                    if(this.trackResetOnLoad){
                        f.originalValue = f.getValue();
                    }
                }
            }
        }else{ 
            var field, id;
            for(id in values){
                if(!Ext.isFunction(values[id]) && (field = this.findField(id))){
                    field.setValue(values[id]);
                    if(this.trackResetOnLoad){
                        field.originalValue = field.getValue();
                    }
                }
            }
        }
        return this;
    },

    
    getValues : function(asString){
        var fs = Ext.lib.Ajax.serializeForm(this.el.dom);
        if(asString === true){
            return fs;
        }
        return Ext.urlDecode(fs);
    },

    
    getFieldValues : function(dirtyOnly){
        var o = {},
            n,
            key,
            val;
        this.items.each(function(f) {
            if (dirtyOnly !== true || f.isDirty()) {
                n = f.getName();
                key = o[n];
                val = f.getValue();

                if(Ext.isDefined(key)){
                    if(Ext.isArray(key)){
                        o[n].push(val);
                    }else{
                        o[n] = [key, val];
                    }
                }else{
                    o[n] = val;
                }
            }
        });
        return o;
    },

    
    clearInvalid : function(){
        this.items.each(function(f){
           f.clearInvalid();
        });
        return this;
    },

    
    reset : function(){
        this.items.each(function(f){
            f.reset();
        });
        return this;
    },

    
    add : function(){
        this.items.addAll(Array.prototype.slice.call(arguments, 0));
        return this;
    },

    
    remove : function(field){
        this.items.remove(field);
        return this;
    },

    
    cleanDestroyed : function() {
        this.items.filterBy(function(o) { return !!o.isDestroyed; }).each(this.remove, this);
    },

    
    render : function(){
        this.items.each(function(f){
            if(f.isFormField && !f.rendered && document.getElementById(f.id)){ 
                f.applyToMarkup(f.id);
            }
        });
        return this;
    },

    
    applyToFields : function(o){
        this.items.each(function(f){
           Ext.apply(f, o);
        });
        return this;
    },

    
    applyIfToFields : function(o){
        this.items.each(function(f){
           Ext.applyIf(f, o);
        });
        return this;
    },

    callFieldMethod : function(fnName, args){
        args = args || [];
        this.items.each(function(f){
            if(Ext.isFunction(f[fnName])){
                f[fnName].apply(f, args);
            }
        });
        return this;
    }
});

export default BasicForm;