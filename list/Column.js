import Ext from '../Base';
import XTemplate from '../XTemplate';

var Column = Ext.extend(Object, {
    isColumn: true,
    align: 'left',
    header: '',
    width: null,
    cls: '',
    constructor : function(c){
        if(!c.tpl){
            c.tpl = new XTemplate('{' + c.dataIndex + '}');
        }
        else if(Ext.isString(c.tpl)){
            c.tpl = new XTemplate(c.tpl);
        }
        
        Ext.apply(this, c);
    }
});

Ext.reg('lvcolumn', Column);

export default Column;