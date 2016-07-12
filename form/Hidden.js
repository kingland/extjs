import Ext from '../Base';
import Field from './Field';

var Hidden = Ext.extend(Field, {
    
    inputType : 'hidden',

    
    onRender : function(){
        Hidden.superclass.onRender.apply(this, arguments);
    },

    
    initEvents : function(){
        this.originalValue = this.getValue();
    },

    
    setSize : Ext.emptyFn,
    setWidth : Ext.emptyFn,
    setHeight : Ext.emptyFn,
    setPosition : Ext.emptyFn,
    setPagePosition : Ext.emptyFn,
    markInvalid : Ext.emptyFn,
    clearInvalid : Ext.emptyFn
});
Ext.reg('hidden', Hidden);

export default Hidden;