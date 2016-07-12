import Ext from '../Base';
import BaseItem from './BaseItem';

var Separator = Ext.extend(BaseItem, {
    
    itemCls : "x-menu-sep",
    
    hideOnClick : false,
    
    
    activeClass: '',

    
    onRender : function(li){
        var s = document.createElement("span");
        s.className = this.itemCls;
        s.innerHTML = "&#160;";
        this.el = s;
        li.addClass("x-menu-sep-li");
        Separator.superclass.onRender.apply(this, arguments);
    }
});
Ext.reg('menuseparator', Separator);

export default Separator;