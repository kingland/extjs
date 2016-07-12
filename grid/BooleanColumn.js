import Ext from '../Base';
import Column from './Column';

var BooleanColumn = Ext.extend(Column, {
    
    trueText: 'true',
    
    falseText: 'false',
    
    undefinedText: '&#160;',

    constructor: function(cfg){
        BooleanColumn.superclass.constructor.call(this, cfg);
        var t = this.trueText, f = this.falseText, u = this.undefinedText;
        this.renderer = function(v){
            if(v === undefined){
                return u;
            }
            if(!v || v === 'false'){
                return f;
            }
            return t;
        };
    }
});

export default BooleanColumn;