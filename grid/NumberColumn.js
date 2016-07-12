import Ext from '../Base';
import Format from '../util/Format';
import Column from './Column';

var NumberColumn = Ext.extend(Column, {
    
    format : '0,000.00',
    constructor: function(cfg){
        NumberColumn.superclass.constructor.call(this, cfg);
        this.renderer = Format.numberRenderer(this.format);
    }
});

export default NumberColumn;
