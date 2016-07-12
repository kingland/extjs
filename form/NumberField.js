import Ext from '../Base';
import TextField from './TextField';

var NumberField = Ext.extend(TextField,  {
    fieldClass: "x-form-field x-form-num-field",
    
    allowDecimals : true,
    
    decimalSeparator : ".",
    
    decimalPrecision : 2,
    
    allowNegative : true,
    
    minValue : Number.NEGATIVE_INFINITY,
    
    maxValue : Number.MAX_VALUE,
    
    minText : "The minimum value for this field is {0}",
    
    maxText : "The maximum value for this field is {0}",
    
    nanText : "{0} is not a valid number",
    
    baseChars : "0123456789",

    
    initEvents : function(){
        var allowed = this.baseChars + '';
        if (this.allowDecimals) {
            allowed += this.decimalSeparator;
        }
        if (this.allowNegative) {
            allowed += '-';
        }
        this.maskRe = new RegExp('[' + Ext.escapeRe(allowed) + ']');
        NumberField.superclass.initEvents.call(this);
    },
    
    
    getErrors: function(value) {
        var errors = NumberField.superclass.getErrors.apply(this, arguments);
        
        value = value || this.processValue(this.getRawValue());
        
        if (value.length < 1) { 
             return errors;
        }
        
        value = String(value).replace(this.decimalSeparator, ".");
        
        if(isNaN(value)){
            errors.push(String.format(this.nanText, value));
        }
        
        var num = this.parseValue(value);
        
        if(num < this.minValue){
            errors.push(String.format(this.minText, this.minValue));
        }
        
        if(num > this.maxValue){
            errors.push(String.format(this.maxText, this.maxValue));
        }
        
        return errors;
    },

    getValue : function(){
        return this.fixPrecision(this.parseValue(NumberField.superclass.getValue.call(this)));
    },

    setValue : function(v){
    	v = Ext.isNumber(v) ? v : parseFloat(String(v).replace(this.decimalSeparator, "."));
        v = isNaN(v) ? '' : String(v).replace(".", this.decimalSeparator);
        return NumberField.superclass.setValue.call(this, v);
    },
    
    
    setMinValue : function(value){
        this.minValue = Ext.num(value, Number.NEGATIVE_INFINITY);
    },
    
    
    setMaxValue : function(value){
        this.maxValue = Ext.num(value, Number.MAX_VALUE);    
    },

    
    parseValue : function(value){
        value = parseFloat(String(value).replace(this.decimalSeparator, "."));
        return isNaN(value) ? '' : value;
    },

    
    fixPrecision : function(value){
        var nan = isNaN(value);
        if(!this.allowDecimals || this.decimalPrecision == -1 || nan || !value){
           return nan ? '' : value;
        }
        return parseFloat(parseFloat(value).toFixed(this.decimalPrecision));
    },

    beforeBlur : function(){
        var v = this.parseValue(this.getRawValue());
        if(!Ext.isEmpty(v)){
            this.setValue(this.fixPrecision(v));
        }
    }
});
Ext.reg('numberfield', NumberField);

export default NumberField;