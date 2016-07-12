import Ext from '../Base';
import Column from './Column';
import XTemplate from '../XTemplate';

var NumberColumn = Ext.extend(Column, {
        
    format: '0,000.00',
    
    constructor : function(c) {
        c.tpl = c.tpl || new XTemplate('{' + c.dataIndex + ':number("' + (c.format || this.format) + '")}');       
        NumberColumn.superclass.constructor.call(this, c);
    }
});

Ext.reg('lvnumbercolumn', NumberColumn);

export default NumberColumn;