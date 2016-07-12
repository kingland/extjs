import Ext from '../Base';
import BaseItem from './BaseItem';

var TextItem = Ext.extend(BaseItem, {
    
    
    hideOnClick : false,
    
    itemCls : "x-menu-text",
    
    constructor : function(config){
        if(typeof config == 'string'){
            config = {text: config}
        }
        TextItem.superclass.constructor.call(this, config);
    },

    
    onRender : function(){
        var s = document.createElement("span");
        s.className = this.itemCls;
        s.innerHTML = this.text;
        this.el = s;
        TextItem.superclass.onRender.apply(this, arguments);
    }
});
Ext.reg('menutextitem', TextItem);

export default TextItem;