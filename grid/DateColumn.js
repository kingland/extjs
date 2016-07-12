import Ext from '../Base';
import Format from '../util/Format';
import Column from './Column';

var DateColumn = Ext.extend(Column, {
    
    format : 'm/d/Y',
    constructor: function(cfg){
        DateColumn.superclass.constructor.call(this, cfg);
        this.renderer = Format.dateRenderer(this.format);
    }
});


export default DateColumn;