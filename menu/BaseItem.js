import Ext from '../Base';
import Component from '../Component';
import Menu from './Menu';

var BaseItem = Ext.extend(Component, {
    
    canActivate : false,
    
    activeClass : "x-menu-item-active",
    
    hideOnClick : true,
    
    clickHideDelay : 1,

    
    ctype : "BaseItem",

    
    actionMode : "container",

    initComponent : function(){
        BaseItem.superclass.initComponent.call(this);
        this.addEvents(
            
            'click',
            
            'activate',
            
            'deactivate'
        );
        if(this.handler){
            this.on("click", this.handler, this.scope);
        }
    },

    
    onRender : function(container, position){
        BaseItem.superclass.onRender.apply(this, arguments);
        if(this.ownerCt && this.ownerCt instanceof Menu){
            this.parentMenu = this.ownerCt;
        }else{
            this.container.addClass('x-menu-list-item');
            this.mon(this.el, {
                scope: this,
                click: this.onClick,
                mouseenter: this.activate,
                mouseleave: this.deactivate
            });
        }
    },

    
    setHandler : function(handler, scope){
        if(this.handler){
            this.un("click", this.handler, this.scope);
        }
        this.on("click", this.handler = handler, this.scope = scope);
    },

    
    onClick : function(e){
        if(!this.disabled && this.fireEvent("click", this, e) !== false
                && (this.parentMenu && this.parentMenu.fireEvent("itemclick", this, e) !== false)){
            this.handleClick(e);
        }else{
            e.stopEvent();
        }
    },

    
    activate : function(){
        if(this.disabled){
            return false;
        }
        var li = this.container;
        li.addClass(this.activeClass);
        this.region = li.getRegion().adjust(2, 2, -2, -2);
        this.fireEvent("activate", this);
        return true;
    },

    
    deactivate : function(){
        this.container.removeClass(this.activeClass);
        this.fireEvent("deactivate", this);
    },

    
    shouldDeactivate : function(e){
        return !this.region || !this.region.contains(e.getPoint());
    },

    
    handleClick : function(e){
        var pm = this.parentMenu;
        if(this.hideOnClick){
            if(pm.floating){
                pm.hide.defer(this.clickHideDelay, pm, [true]);
            }else{
                pm.deactivateActive();
            }
        }
    },

    
    expandMenu : Ext.emptyFn,

    
    hideMenu : Ext.emptyFn
});
Ext.reg('menubaseitem', BaseItem);

export default BaseItem;