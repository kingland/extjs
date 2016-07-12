import Ext from '../Base';
import BaseItem from './BaseItem';
import MenuMgr from './MenuMgr';
import XTemplate from '../XTemplate';

var Item = Ext.extend(BaseItem, {

    itemCls : 'x-menu-item',
    
    canActivate : true,
    
    showDelay: 200,
    
    hideDelay: 200,

    
    ctype: 'Item',

    initComponent : function(){
        Item.superclass.initComponent.call(this);
        if(this.menu){
            this.menu = MenuMgr.get(this.menu);
            this.menu.ownerCt = this;
        }
    },

    
    onRender : function(container, position){
        if (!this.itemTpl) {
            this.itemTpl = Item.prototype.itemTpl = new XTemplate(
                '<a id="{id}" class="{cls}" hidefocus="true" unselectable="on" href="{href}"',
                    '<tpl if="hrefTarget">',
                        ' target="{hrefTarget}"',
                    '</tpl>',
                 '>',
                     '<img src="{icon}" class="x-menu-item-icon {iconCls}"/>',
                     '<span class="x-menu-item-text">{text}</span>',
                 '</a>'
             );
        }
        var a = this.getTemplateArgs();
        this.el = position ? this.itemTpl.insertBefore(position, a, true) : this.itemTpl.append(container, a, true);
        this.iconEl = this.el.child('img.x-menu-item-icon');
        this.textEl = this.el.child('.x-menu-item-text');
        if(!this.href) { 
            this.mon(this.el, 'click', Ext.emptyFn, null, { preventDefault: true });
        }
        Item.superclass.onRender.call(this, container, position);
    },

    getTemplateArgs: function() {
        return {
            id: this.id,
            cls: this.itemCls + (this.menu ?  ' x-menu-item-arrow' : '') + (this.cls ?  ' ' + this.cls : ''),
            href: this.href || '#',
            hrefTarget: this.hrefTarget,
            icon: this.icon || Ext.BLANK_IMAGE_URL,
            iconCls: this.iconCls || '',
            text: this.itemText||this.text||'&#160;'
        };
    },

    
    setText : function(text){
        this.text = text||'&#160;';
        if(this.rendered){
            this.textEl.update(this.text);
            this.parentMenu.layout.doAutoSize();
        }
    },

    
    setIconClass : function(cls){
        var oldCls = this.iconCls;
        this.iconCls = cls;
        if(this.rendered){
            this.iconEl.replaceClass(oldCls, this.iconCls);
        }
    },

    
    beforeDestroy: function(){
        if (this.menu){
            delete this.menu.ownerCt;
            this.menu.destroy();
        }
        Item.superclass.beforeDestroy.call(this);
    },

    
    handleClick : function(e){
        if(!this.href){ 
            e.stopEvent();
        }
        Item.superclass.handleClick.apply(this, arguments);
    },

    
    activate : function(autoExpand){
        if(Item.superclass.activate.apply(this, arguments)){
            this.focus();
            if(autoExpand){
                this.expandMenu();
            }
        }
        return true;
    },

    
    shouldDeactivate : function(e){
        if(Item.superclass.shouldDeactivate.call(this, e)){
            if(this.menu && this.menu.isVisible()){
                return !this.menu.getEl().getRegion().contains(e.getPoint());
            }
            return true;
        }
        return false;
    },

    
    deactivate : function(){
        Item.superclass.deactivate.apply(this, arguments);
        this.hideMenu();
    },

    
    expandMenu : function(autoActivate){
        if(!this.disabled && this.menu){
            clearTimeout(this.hideTimer);
            delete this.hideTimer;
            if(!this.menu.isVisible() && !this.showTimer){
                this.showTimer = this.deferExpand.defer(this.showDelay, this, [autoActivate]);
            }else if (this.menu.isVisible() && autoActivate){
                this.menu.tryActivate(0, 1);
            }
        }
    },

    
    deferExpand : function(autoActivate){
        delete this.showTimer;
        this.menu.show(this.container, this.parentMenu.subMenuAlign || 'tl-tr?', this.parentMenu);
        if(autoActivate){
            this.menu.tryActivate(0, 1);
        }
    },

    
    hideMenu : function(){
        clearTimeout(this.showTimer);
        delete this.showTimer;
        if(!this.hideTimer && this.menu && this.menu.isVisible()){
            this.hideTimer = this.deferHide.defer(this.hideDelay, this);
        }
    },

    
    deferHide : function(){
        delete this.hideTimer;
        if(this.menu.over){
            this.parentMenu.setActiveItem(this, false);
        }else{
            this.menu.hide();
        }
    }
});
Ext.reg('menuitem', Item);

export default Item;