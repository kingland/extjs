import Ext from '../Base';
import XTemplate from '../XTemplate';
import Column from './Column';

var TemplateColumn = Ext.extend(Column, {
    
    constructor: function(cfg){
        TemplateColumn.superclass.constructor.call(this, cfg);
        var tpl = (!Ext.isPrimitive(this.tpl) && this.tpl.compile) ? this.tpl : new  XTemplate(this.tpl);
        this.renderer = function(value, p, r){
            return tpl.apply(r.data);
        };
        this.tpl = tpl;
    }
});

export default TemplateColumn;