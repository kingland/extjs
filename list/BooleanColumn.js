import Ext from '../Base';
import Column from './Column';
import XTemplate from '../XTemplate';

var BooleanColumn = Ext.extend(Column, {
    
    trueText: 'true',
    
    falseText: 'false',
    
    undefinedText: '&#160;',
    
    constructor : function(c) {
        c.tpl = c.tpl || new XTemplate('{' + c.dataIndex + ':this.format}');
        
        var t = this.trueText, f = this.falseText, u = this.undefinedText;
        c.tpl.format = function(v){
            if(v === undefined){
                return u;
            }
            if(!v || v === 'false'){
                return f;
            }
            return t;
        };
        
        DateColumn.superclass.constructor.call(this, c);
    }
});

Ext.reg('lvbooleancolumn', BooleanColumn);

export default BooleanColumn;