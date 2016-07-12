import Ext from '../Base';
import ComboBox from './ComboBox';
import DateField from './DateField';

var TimeField = Ext.extend(ComboBox, {
    
    minValue : undefined,
    
    maxValue : undefined,
    
    minText : "The time in this field must be equal to or after {0}",
    
    maxText : "The time in this field must be equal to or before {0}",
    
    invalidText : "{0} is not a valid time",
    
    format : "g:i A",
    
    altFormats : "g:ia|g:iA|g:i a|g:i A|h:i|g:i|H:i|ga|ha|gA|h a|g a|g A|gi|hi|gia|hia|g|H|gi a|hi a|giA|hiA|gi A|hi A",
    
    increment: 15,

    
    mode: 'local',
    
    triggerAction: 'all',
    
    typeAhead: false,

    
    
    
    initDate: '1/1/2008',

    initDateFormat: 'j/n/Y',

    
    initComponent : function(){
        if(Ext.isDefined(this.minValue)){
            this.setMinValue(this.minValue, true);
        }
        if(Ext.isDefined(this.maxValue)){
            this.setMaxValue(this.maxValue, true);
        }
        if(!this.store){
            this.generateStore(true);
        }
        TimeField.superclass.initComponent.call(this);
    },

    
    setMinValue: function(value,  initial){
        this.setLimit(value, true, initial);
        return this;
    },

    
    setMaxValue: function(value,  initial){
        this.setLimit(value, false, initial);
        return this;
    },

    
    generateStore: function(initial){
        var min = this.minValue || new Date(this.initDate).clearTime(),
            max = this.maxValue || new Date(this.initDate).clearTime().add('mi', (24 * 60) - 1),
            times = [];

        while(min <= max){
            times.push(min.dateFormat(this.format));
            min = min.add('mi', this.increment);
        }
        this.bindStore(times, initial);
    },

    
    setLimit: function(value, isMin, initial){
        var d;
        if(Ext.isString(value)){
            d = this.parseDate(value);
        }else if(Ext.isDate(value)){
            d = value;
        }
        if(d){
            var val = new Date(this.initDate).clearTime();
            val.setHours(d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
            this[isMin ? 'minValue' : 'maxValue'] = val;
            if(!initial){
                this.generateStore();
            }
        }
    },

    
    getValue : function(){
        var v = TimeField.superclass.getValue.call(this);
        return this.formatDate(this.parseDate(v)) || '';
    },

    
    setValue : function(value){
        return TimeField.superclass.setValue.call(this, this.formatDate(this.parseDate(value)));
    },

    
    validateValue : DateField.prototype.validateValue,

    formatDate : DateField.prototype.formatDate,

    parseDate: function(value) {
        if (!value || Ext.isDate(value)) {
            return value;
        }

        var id = this.initDate + ' ',
            idf = this.initDateFormat + ' ',
            v = Date.parseDate(id + value, idf + this.format), 
            af = this.altFormats;

        if (!v && af) {
            if (!this.altFormatsArray) {
                this.altFormatsArray = af.split("|");
            }
            for (var i = 0, afa = this.altFormatsArray, len = afa.length; i < len && !v; i++) {
                v = Date.parseDate(id + value, idf + afa[i]);
            }
        }

        return v;
    }
});
Ext.reg('timefield', TimeField);

export default TimeField;