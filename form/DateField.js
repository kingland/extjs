import Ext from '../BaseFn';
import TriggerField from './TriggerField';
import KeyNav from '../KeyNav';
import DateMenu from '../menu/DateMenu';

var DateField = Ext.extend(TriggerField,  {
    
    format : "m/d/Y",
    
    altFormats : "m/d/Y|n/j/Y|n/j/y|m/j/y|n/d/y|m/j/Y|n/d/Y|m-d-y|m-d-Y|m/d|m-d|md|mdy|mdY|d|Y-m-d",
    
    disabledDaysText : "Disabled",
    
    disabledDatesText : "Disabled",
    
    minText : "The date in this field must be equal to or after {0}",
    
    maxText : "The date in this field must be equal to or before {0}",
    
    invalidText : "{0} is not a valid date - it must be in the format {1}",
    
    triggerClass : 'x-form-date-trigger',
    
    showToday : true,
    
    defaultAutoCreate : {tag: "input", type: "text", size: "10", autocomplete: "off"},

    initTime: '12', 

    initTimeFormat: 'H',

    
    safeParse : function(value, format) {
        if (/[gGhH]/.test(format.replace(/(\\.)/g, ''))) {
            
            return Date.parseDate(value, format);
        } else {
            
            var parsedDate = Date.parseDate(value + ' ' + this.initTime, format + ' ' + this.initTimeFormat);
            
            if (parsedDate) return parsedDate.clearTime();
        }
    },

    initComponent : function(){
        DateField.superclass.initComponent.call(this);

        this.addEvents(
            
            'select'
        );

        if(Ext.isString(this.minValue)){
            this.minValue = this.parseDate(this.minValue);
        }
        if(Ext.isString(this.maxValue)){
            this.maxValue = this.parseDate(this.maxValue);
        }
        this.disabledDatesRE = null;
        this.initDisabledDays();
    },

    initEvents: function() {
        DateField.superclass.initEvents.call(this);
        this.keyNav = new KeyNav(this.el, {
            "down": function(e) {
                this.onTriggerClick();
            },
            scope: this,
            forceKeyDown: true
        });
    },


    
    initDisabledDays : function(){
        if(this.disabledDates){
            var dd = this.disabledDates,
                len = dd.length - 1,
                re = "(?:";

            Ext.each(dd, function(d, i){
                re += Ext.isDate(d) ? '^' + Ext.escapeRe(d.dateFormat(this.format)) + '$' : dd[i];
                if(i != len){
                    re += '|';
                }
            }, this);
            this.disabledDatesRE = new RegExp(re + ')');
        }
    },

    
    setDisabledDates : function(dd){
        this.disabledDates = dd;
        this.initDisabledDays();
        if(this.menu){
            this.menu.picker.setDisabledDates(this.disabledDatesRE);
        }
    },

    
    setDisabledDays : function(dd){
        this.disabledDays = dd;
        if(this.menu){
            this.menu.picker.setDisabledDays(dd);
        }
    },

    
    setMinValue : function(dt){
        this.minValue = (Ext.isString(dt) ? this.parseDate(dt) : dt);
        if(this.menu){
            this.menu.picker.setMinDate(this.minValue);
        }
    },

    
    setMaxValue : function(dt){
        this.maxValue = (Ext.isString(dt) ? this.parseDate(dt) : dt);
        if(this.menu){
            this.menu.picker.setMaxDate(this.maxValue);
        }
    },
    
    
    getErrors: function(value) {
        var errors = DateField.superclass.getErrors.apply(this, arguments);
        
        value = this.formatDate(value || this.processValue(this.getRawValue()));
        
        if (value.length < 1) { 
             return errors;
        }
        
        var svalue = value;
        value = this.parseDate(value);
        if (!value) {
            errors.push(String.format(this.invalidText, svalue, this.format));
            return errors;
        }
        
        var time = value.getTime();
        if (this.minValue && time < this.minValue.getTime()) {
            errors.push(String.format(this.minText, this.formatDate(this.minValue)));
        }
        
        if (this.maxValue && time > this.maxValue.getTime()) {
            errors.push(String.format(this.maxText, this.formatDate(this.maxValue)));
        }
        
        if (this.disabledDays) {
            var day = value.getDay();
            
            for(var i = 0; i < this.disabledDays.length; i++) {
                if (day === this.disabledDays[i]) {
                    errors.push(this.disabledDaysText);
                    break;
                }
            }
        }
        
        var fvalue = this.formatDate(value);
        if (this.disabledDatesRE && this.disabledDatesRE.test(fvalue)) {
            errors.push(String.format(this.disabledDatesText, fvalue));
        }
        
        return errors;
    },

    
    
    validateBlur : function(){
        return !this.menu || !this.menu.isVisible();
    },

    
    getValue : function(){
        return this.parseDate(DateField.superclass.getValue.call(this)) || "";
    },

    
    setValue : function(date){
        return DateField.superclass.setValue.call(this, this.formatDate(this.parseDate(date)));
    },

    
    parseDate : function(value) {
        if(!value || Ext.isDate(value)){
            return value;
        }

        var v = this.safeParse(value, this.format),
            af = this.altFormats,
            afa = this.altFormatsArray;

        if (!v && af) {
            afa = afa || af.split("|");

            for (var i = 0, len = afa.length; i < len && !v; i++) {
                v = this.safeParse(value, afa[i]);
            }
        }
        return v;
    },

    
    onDestroy : function(){
        Ext.destroy(this.menu, this.keyNav);
        DateField.superclass.onDestroy.call(this);
    },

    
    formatDate : function(date){
        return Ext.isDate(date) ? date.dateFormat(this.format) : date;
    },

    
    
    
    onTriggerClick : function(){
        if(this.disabled){
            return;
        }
        if(this.menu == null){
            this.menu = new DateMenu({
                hideOnClick: false,
                focusOnSelect: false
            });
        }
        this.onFocus();
        Ext.apply(this.menu.picker,  {
            minDate : this.minValue,
            maxDate : this.maxValue,
            disabledDatesRE : this.disabledDatesRE,
            disabledDatesText : this.disabledDatesText,
            disabledDays : this.disabledDays,
            disabledDaysText : this.disabledDaysText,
            format : this.format,
            showToday : this.showToday,
            minText : String.format(this.minText, this.formatDate(this.minValue)),
            maxText : String.format(this.maxText, this.formatDate(this.maxValue))
        });
        this.menu.picker.setValue(this.getValue() || new Date());
        this.menu.show(this.el, "tl-bl?");
        this.menuEvents('on');
    },

    
    menuEvents: function(method){
        this.menu[method]('select', this.onSelect, this);
        this.menu[method]('hide', this.onMenuHide, this);
        this.menu[method]('show', this.onFocus, this);
    },

    onSelect: function(m, d){
        this.setValue(d);
        this.fireEvent('select', this, d);
        this.menu.hide();
    },

    onMenuHide: function(){
        this.focus(false, 60);
        this.menuEvents('un');
    },

    
    beforeBlur : function(){
        var v = this.parseDate(this.getRawValue());
        if(v){
            this.setValue(v);
        }
    }

    
    
    
    
});
Ext.reg('datefield', DateField);

export default DateField;