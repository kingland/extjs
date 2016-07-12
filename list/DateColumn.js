import Ext from '../Base';
import Column from './Column';
import XTemplate from '../XTemplate';

var DateColumn = Ext.extend(Column, {
    format: 'm/d/Y',
    constructor : function(c) {
        c.tpl = c.tpl || new XTemplate('{' + c.dataIndex + ':date("' + (c.format || this.format) + '")}');      
        DateColumn.superclass.constructor.call(this, c);
    }
});
Ext.reg('lvdatecolumn', DateColumn);

export default DateColumn;