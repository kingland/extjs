import Ext from '../Base';
import Field from './Field';
import VTypes from './VTypes';
import TextMetrics from '../util/TextMetrics';
import DelayedTask from '../util/DelayedTask';

var TextField = Ext.extend(Field,  {
    
    grow : false,
    
    growMin : 30,
    
    growMax : 800,
    
    vtype : null,
    
    maskRe : null,
    
    disableKeyFilter : false,
    
    allowBlank : true,
    
    minLength : 0,
    
    maxLength : Number.MAX_VALUE,
    
    minLengthText : 'The minimum length for this field is {0}',
    
    maxLengthText : 'The maximum length for this field is {0}',
    
    selectOnFocus : false,
    
    blankText : 'This field is required',
    
    validator : null,
    
    regex : null,
    
    regexText : '',
    
    emptyText : null,
    
    emptyClass : 'x-form-empty-field',

    

    initComponent : function(){
        TextField.superclass.initComponent.call(this);
        this.addEvents(
            
            'autosize',

            
            'keydown',
            
            'keyup',
            
            'keypress'
        );
    },

    
    initEvents : function(){
        TextField.superclass.initEvents.call(this);
        if(this.validationEvent == 'keyup'){
            this.validationTask = new DelayedTask(this.validate, this);
            this.mon(this.el, 'keyup', this.filterValidation, this);
        }
        else if(this.validationEvent !== false && this.validationEvent != 'blur'){
        	this.mon(this.el, this.validationEvent, this.validate, this, {buffer: this.validationDelay});
        }
        if(this.selectOnFocus || this.emptyText){            
            this.mon(this.el, 'mousedown', this.onMouseDown, this);
            
            if(this.emptyText){
                this.applyEmptyText();
            }
        }
        if(this.maskRe || (this.vtype && this.disableKeyFilter !== true && (this.maskRe = VTypes[this.vtype+'Mask']))){
        	this.mon(this.el, 'keypress', this.filterKeys, this);
        }
        if(this.grow){
        	this.mon(this.el, 'keyup', this.onKeyUpBuffered, this, {buffer: 50});
			this.mon(this.el, 'click', this.autoSize, this);
        }
        if(this.enableKeyEvents){
            this.mon(this.el, {
                scope: this,
                keyup: this.onKeyUp,
                keydown: this.onKeyDown,
                keypress: this.onKeyPress
            });
        }
    },
    
    onMouseDown: function(e){
        if(!this.hasFocus){
            this.mon(this.el, 'mouseup', Ext.emptyFn, this, { single: true, preventDefault: true });
        }
    },

    processValue : function(value){
        if(this.stripCharsRe){
            var newValue = value.replace(this.stripCharsRe, '');
            if(newValue !== value){
                this.setRawValue(newValue);
                return newValue;
            }
        }
        return value;
    },

    filterValidation : function(e){
        if(!e.isNavKeyPress()){
            this.validationTask.delay(this.validationDelay);
        }
    },
    
    
    onDisable: function(){
        TextField.superclass.onDisable.call(this);
        if(Ext.isIE){
            this.el.dom.unselectable = 'on';
        }
    },
    
    
    onEnable: function(){
        TextField.superclass.onEnable.call(this);
        if(Ext.isIE){
            this.el.dom.unselectable = '';
        }
    },

    
    onKeyUpBuffered : function(e){
        if(this.doAutoSize(e)){
            this.autoSize();
        }
    },
    
    
    doAutoSize : function(e){
        return !e.isNavKeyPress();
    },

    
    onKeyUp : function(e){
        this.fireEvent('keyup', this, e);
    },

    
    onKeyDown : function(e){
        this.fireEvent('keydown', this, e);
    },

    
    onKeyPress : function(e){
        this.fireEvent('keypress', this, e);
    },

    
    reset : function(){
        TextField.superclass.reset.call(this);
        this.applyEmptyText();
    },

    applyEmptyText : function(){
        if(this.rendered && this.emptyText && this.getRawValue().length < 1 && !this.hasFocus){
            this.setRawValue(this.emptyText);
            this.el.addClass(this.emptyClass);
        }
    },

    
    preFocus : function(){
        var el = this.el;
        if(this.emptyText){
            if(el.dom.value == this.emptyText){
                this.setRawValue('');
            }
            el.removeClass(this.emptyClass);
        }
        if(this.selectOnFocus){
            el.dom.select();
        }
    },

    
    postBlur : function(){
        this.applyEmptyText();
    },

    
    filterKeys : function(e){
        if(e.ctrlKey){
            return;
        }
        var k = e.getKey();
        if(Ext.isGecko && (e.isNavKeyPress() || k == e.BACKSPACE || (k == e.DELETE && e.button == -1))){
            return;
        }
        var cc = String.fromCharCode(e.getCharCode());
        if(!Ext.isGecko && e.isSpecialKey() && !cc){
            return;
        }
        if(!this.maskRe.test(cc)){
            e.stopEvent();
        }
    },

    setValue : function(v){
        if(this.emptyText && this.el && !Ext.isEmpty(v)){
            this.el.removeClass(this.emptyClass);
        }
        TextField.superclass.setValue.apply(this, arguments);
        this.applyEmptyText();
        this.autoSize();
        return this;
    },

    
    getErrors: function(value) {
        var errors = TextField.superclass.getErrors.apply(this, arguments);
        
        value = value || this.processValue(this.getRawValue());        
        
        if (Ext.isFunction(this.validator)) {
            var msg = this.validator(value);
            if (msg !== true) {
                errors.push(msg);
            }
        }
        
        if (value.length < 1 || value === this.emptyText) {
            if (this.allowBlank) {
                
                return errors;
            } else {
                errors.push(this.blankText);
            }
        }
        
        if (!this.allowBlank && (value.length < 1 || value === this.emptyText)) { 
            errors.push(this.blankText);
        }
        
        if (value.length < this.minLength) {
            errors.push(String.format(this.minLengthText, this.minLength));
        }
        
        if (value.length > this.maxLength) {
            errors.push(String.format(this.maxLengthText, this.maxLength));
        }
        
        if (this.vtype) {
            var vt = VTypes;
            if(!vt[this.vtype](value, this)){
                errors.push(this.vtypeText || vt[this.vtype +'Text']);
            }
        }
        
        if (this.regex && !this.regex.test(value)) {
            errors.push(this.regexText);
        }
        
        return errors;
    },

    
    selectText : function(start, end){
        var v = this.getRawValue();
        var doFocus = false;
        if(v.length > 0){
            start = start === undefined ? 0 : start;
            end = end === undefined ? v.length : end;
            var d = this.el.dom;
            if(d.setSelectionRange){
                d.setSelectionRange(start, end);
            }else if(d.createTextRange){
                var range = d.createTextRange();
                range.moveStart('character', start);
                range.moveEnd('character', end-v.length);
                range.select();
            }
            doFocus = Ext.isGecko || Ext.isOpera;
        }else{
            doFocus = true;
        }
        if(doFocus){
            this.focus();
        }
    },

    
    autoSize : function(){
        if(!this.grow || !this.rendered){
            return;
        }
        if(!this.metrics){
            this.metrics = TextMetrics.createInstance(this.el);
        }
        var el = this.el;
        var v = el.dom.value;
        var d = document.createElement('div');
        d.appendChild(document.createTextNode(v));
        v = d.innerHTML;
        Ext.removeNode(d);
        d = null;
        v += '&#160;';
        var w = Math.min(this.growMax, Math.max(this.metrics.getWidth(v) +  10, this.growMin));
        this.el.setWidth(w);
        this.fireEvent('autosize', this, w);
    },
	
	onDestroy: function(){
		if(this.validationTask){
			this.validationTask.cancel();
			this.validationTask = null;
		}
		TextField.superclass.onDestroy.call(this);
	}
});
Ext.reg('textfield', TextField);

export default TextField;