import Ext from '../Base';
import BoxComponent from '../BoxComponent';
import EventManager from '../EventManager';
import MessageTargets from './MessageTargets';

var Field = Ext.extend(BoxComponent,  {
    invalidClass : 'x-form-invalid',
    
    invalidText : 'The value in this field is invalid',
    
    focusClass : 'x-form-focus',
    
    
    validationEvent : 'keyup',
    
    validateOnBlur : true,
    
    validationDelay : 250,
    
    defaultAutoCreate : {tag: 'input', type: 'text', size: '20', autocomplete: 'off'},
    
    fieldClass : 'x-form-field',
    
    msgTarget : 'qtip',
    
    msgFx : 'normal',
    
    readOnly : false,
    
    disabled : false,
    
    submitValue: true,

    
    isFormField : true,

    
    msgDisplay: '',

    
    hasFocus : false,

    
    initComponent : function(){
        Field.superclass.initComponent.call(this);
        this.addEvents(
            
            'focus',
            
            'blur',
            
            'specialkey',
            
            'change',
            
            'invalid',
            
            'valid'
        );
    },

    
    getName : function(){
        return this.rendered && this.el.dom.name ? this.el.dom.name : this.name || this.id || '';
    },

    
    onRender : function(ct, position){
        if(!this.el){
            var cfg = this.getAutoCreate();

            if(!cfg.name){
                cfg.name = this.name || this.id;
            }
            if(this.inputType){
                cfg.type = this.inputType;
            }
            this.autoEl = cfg;
        }
        Field.superclass.onRender.call(this, ct, position);
        if(this.submitValue === false){
            this.el.dom.removeAttribute('name');
        }
        var type = this.el.dom.type;
        if(type){
            if(type == 'password'){
                type = 'text';
            }
            this.el.addClass('x-form-'+type);
        }
        if(this.readOnly){
            this.setReadOnly(true);
        }
        if(this.tabIndex !== undefined){
            this.el.dom.setAttribute('tabIndex', this.tabIndex);
        }

        this.el.addClass([this.fieldClass, this.cls]);
    },

    
    getItemCt : function(){
        return this.itemCt;
    },

    
    initValue : function(){
        if(this.value !== undefined){
            this.setValue(this.value);
        }else if(!Ext.isEmpty(this.el.dom.value) && this.el.dom.value != this.emptyText){
            this.setValue(this.el.dom.value);
        }
        
        this.originalValue = this.getValue();
    },

    
    isDirty : function() {
        if(this.disabled || !this.rendered) {
            return false;
        }
        return String(this.getValue()) !== String(this.originalValue);
    },

    
    setReadOnly : function(readOnly){
        if(this.rendered){
            this.el.dom.readOnly = readOnly;
        }
        this.readOnly = readOnly;
    },

    
    afterRender : function(){
        Field.superclass.afterRender.call(this);
        this.initEvents();
        this.initValue();
    },

    
    fireKey : function(e){
        if(e.isSpecialKey()){
            this.fireEvent('specialkey', this, e);
        }
    },

    
    reset : function(){
        this.setValue(this.originalValue);
        this.clearInvalid();
    },

    
    initEvents : function(){
        this.mon(this.el, EventManager.useKeydown ? 'keydown' : 'keypress', this.fireKey,  this);
        this.mon(this.el, 'focus', this.onFocus, this);

        
        
        this.mon(this.el, 'blur', this.onBlur, this, this.inEditor ? {buffer:10} : null);
    },

    
    preFocus: Ext.emptyFn,

    
    onFocus : function(){
        this.preFocus();
        if(this.focusClass){
            this.el.addClass(this.focusClass);
        }
        if(!this.hasFocus){
            this.hasFocus = true;
            
            this.startValue = this.getValue();
            this.fireEvent('focus', this);
        }
    },

    
    beforeBlur : Ext.emptyFn,

    
    onBlur : function(){
        this.beforeBlur();
        if(this.focusClass){
            this.el.removeClass(this.focusClass);
        }
        this.hasFocus = false;
        if(this.validationEvent !== false && (this.validateOnBlur || this.validationEvent == 'blur')){
            this.validate();
        }
        var v = this.getValue();
        if(String(v) !== String(this.startValue)){
            this.fireEvent('change', this, v, this.startValue);
        }
        this.fireEvent('blur', this);
        this.postBlur();
    },

    
    postBlur : Ext.emptyFn,

    
    isValid : function(preventMark){
        if(this.disabled){
            return true;
        }
        var restore = this.preventMark;
        this.preventMark = preventMark === true;
        var v = this.validateValue(this.processValue(this.getRawValue()));
        this.preventMark = restore;
        return v;
    },

    
    validate : function(){
        if(this.disabled || this.validateValue(this.processValue(this.getRawValue()))){
            this.clearInvalid();
            return true;
        }
        return false;
    },

    
    processValue : function(value){
        return value;
    },

    
     validateValue : function(value) {
         
         var error = this.getErrors(value)[0];

         if (error == undefined) {
             return true;
         } else {
             this.markInvalid(error);
             return false;
         }
     },
    
    
    getErrors: function() {
        return [];
    },

    
    getActiveError : function(){
        return this.activeError || '';
    },

    
    markInvalid : function(msg){
        
        if (this.rendered && !this.preventMark) {
            msg = msg || this.invalidText;

            var mt = this.getMessageHandler();
            if(mt){
                mt.mark(this, msg);
            }else if(this.msgTarget){
                this.el.addClass(this.invalidClass);
                var t = Ext.getDom(this.msgTarget);
                if(t){
                    t.innerHTML = msg;
                    t.style.display = this.msgDisplay;
                }
            }
        }
        
        this.setActiveError(msg);
    },
    
    
    clearInvalid : function(){
        
        if (this.rendered && !this.preventMark) {
            this.el.removeClass(this.invalidClass);
            var mt = this.getMessageHandler();
            if(mt){
                mt.clear(this);
            }else if(this.msgTarget){
                this.el.removeClass(this.invalidClass);
                var t = Ext.getDom(this.msgTarget);
                if(t){
                    t.innerHTML = '';
                    t.style.display = 'none';
                }
            }
        }
        
        this.unsetActiveError();
    },

    
    setActiveError: function(msg, suppressEvent) {
        this.activeError = msg;
        if (suppressEvent !== true) this.fireEvent('invalid', this, msg);
    },
    
    
    unsetActiveError: function(suppressEvent) {
        delete this.activeError;
        if (suppressEvent !== true) this.fireEvent('valid', this);
    },

    
    getMessageHandler : function(){
        return MessageTargets[this.msgTarget];
    },

    
    getErrorCt : function(){
        return this.el.findParent('.x-form-element', 5, true) || 
            this.el.findParent('.x-form-field-wrap', 5, true);   
    },

    
    alignErrorEl : function(){
        this.errorEl.setWidth(this.getErrorCt().getWidth(true) - 20);
    },

    
    alignErrorIcon : function(){
        this.errorIcon.alignTo(this.el, 'tl-tr', [2, 0]);
    },

    
    getRawValue : function(){
        var v = this.rendered ? this.el.getValue() : Ext.value(this.value, '');
        if(v === this.emptyText){
            v = '';
        }
        return v;
    },

    
    getValue : function(){
        if(!this.rendered) {
            return this.value;
        }
        var v = this.el.getValue();
        if(v === this.emptyText || v === undefined){
            v = '';
        }
        return v;
    },

    
    setRawValue : function(v){
        return this.rendered ? (this.el.dom.value = (Ext.isEmpty(v) ? '' : v)) : '';
    },

    
    setValue : function(v){
        this.value = v;
        if(this.rendered){
            this.el.dom.value = (Ext.isEmpty(v) ? '' : v);
            this.validate();
        }
        return this;
    },

    
    append : function(v){
         this.setValue([this.getValue(), v].join(''));
    }

    
    

    
});


Field.msgFx = {
    normal : {
        show: function(msgEl, f){
            msgEl.setDisplayed('block');
        },

        hide : function(msgEl, f){
            msgEl.setDisplayed(false).update('');
        }
    },

    slide : {
        show: function(msgEl, f){
            msgEl.slideIn('t', {stopFx:true});
        },

        hide : function(msgEl, f){
            msgEl.slideOut('t', {stopFx:true,useDisplay:true});
        }
    },

    slideRight : {
        show: function(msgEl, f){
            msgEl.fixDisplay();
            msgEl.alignTo(f.el, 'tl-tr');
            msgEl.slideIn('l', {stopFx:true});
        },

        hide : function(msgEl, f){
            msgEl.slideOut('l', {stopFx:true,useDisplay:true});
        }
    }
};


/* 
 * Hide / Show Field SetFieldLabel (TextField,NumberField,...)
 * 14-10-2010
 * Pongpipat.K
 * Ex: TextField.setContainerVisible(Boolean)
 */
Ext.override(Field, {
    showContainer: function() {
        this.enable();
        this.show();
        if (!Ext.isEmpty(this.getEl())) {
            this.getEl().up('.x-form-item').setDisplayed(true); // show entire container and children (including label if applicable)
        }
    },
    
    hideContainer: function() {
        this.disable(); // for validation
        this.hide();
        if (!Ext.isEmpty(this.getEl())) {
            this.getEl().up('.x-form-item').setDisplayed(false); // show entire container and children (including label if applicable)
        }
    },
    
    /**
     * Hide / Show the container including the label
     * @param visible (Boolean boolean)
     */
    setContainerVisible: function(visible) {
        if (visible) {
            this.showContainer();
        } else {
            this.hideContainer();
        }
        return this;
    },
    
    /**
     * Set Field Label
     * @param String text
     */
    setFieldLabel : function(text) {
    	if (this.rendered) {
    		this.el.up('.x-form-item', 10, true).child('.x-form-item-label').update(text);
        } else {
            this.fieldLabel = text;
        }
    }
                    
                    
});
Ext.reg('field', Field);

export default Field;