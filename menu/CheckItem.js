import Ext from '../Base';
import Item from './Item';
import MenuMgr from './MenuMgr';

var CheckItem = Ext.extend(Item, {
    
    itemCls : "x-menu-item x-menu-check-item",
    
    groupClass : "x-menu-group-item",
    
    checked: false,
    
    ctype: "CheckItem",
    
    initComponent : function(){
        CheckItem.superclass.initComponent.call(this);
	    this.addEvents(
	        
	        "beforecheckchange" ,
	        
	        "checkchange"
	    );
	    
	    if(this.checkHandler){
	        this.on('checkchange', this.checkHandler, this.scope);
	    }
	    MenuMgr.registerCheckable(this);
    },

    
    onRender : function(c){
        CheckItem.superclass.onRender.apply(this, arguments);
        if(this.group){
            this.el.addClass(this.groupClass);
        }
        if(this.checked){
            this.checked = false;
            this.setChecked(true, true);
        }
    },

    
    destroy : function(){
        MenuMgr.unregisterCheckable(this);
        CheckItem.superclass.destroy.apply(this, arguments);
    },

    
    setChecked : function(state, suppressEvent){
        var suppress = suppressEvent === true;
        if(this.checked != state && (suppress || this.fireEvent("beforecheckchange", this, state) !== false)){
            if(this.container){
                this.container[state ? "addClass" : "removeClass"]("x-menu-item-checked");
            }
            this.checked = state;
            if(!suppress){
                this.fireEvent("checkchange", this, state);
            }
        }
    },

    
    handleClick : function(e){
       if(!this.disabled && !(this.checked && this.group)){
           this.setChecked(!this.checked);
       }
       CheckItem.superclass.handleClick.apply(this, arguments);
    }
});
Ext.reg('menucheckitem', CheckItem);

export default CheckItem;