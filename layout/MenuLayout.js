import Ext from '../Base';
import XTemplate from '../XTemplate';
import ContainerLayout from './ContainerLayout';
//import Container from '../Container';
import Item from '../menu/Item';

var MenuLayout = Ext.extend(ContainerLayout, {
    monitorResize : true,

    type: 'menu',

    setContainer : function(ct){
        this.monitorResize = !ct.floating;
        
        
        ct.on('autosize', this.doAutoSize, this);
        MenuLayout.superclass.setContainer.call(this, ct);
    },

    renderItem : function(c, position, target){
        if (!this.itemTpl) {
            this.itemTpl = MenuLayout.prototype.itemTpl = new XTemplate(
                '<li id="{itemId}" class="{itemCls}">',
                    '<tpl if="needsIcon">',
                        '<img src="{icon}" class="{iconCls}"/>',
                    '</tpl>',
                '</li>'
            );
        }

        if(c && !c.rendered){
            if(Ext.isNumber(position)){
                position = target.dom.childNodes[position];
            }
            var a = this.getItemArgs(c);


            c.render(c.positionEl = position ?
                this.itemTpl.insertBefore(position, a, true) :
                this.itemTpl.append(target, a, true));


            c.positionEl.menuItemId = c.getItemId();



            if (!a.isMenuItem && a.needsIcon) {
                c.positionEl.addClass('x-menu-list-item-indent');
            }
            this.configureItem(c, position);
        }else if(c && !this.isValidParent(c, target)){
            if(Ext.isNumber(position)){
                position = target.dom.childNodes[position];
            }
            target.dom.insertBefore(c.getActionEl().dom, position || null);
        }
    },

    getItemArgs : function(c) {
        var isMenuItem = c instanceof Item;
        return {
            isMenuItem: isMenuItem,
            needsIcon: !isMenuItem && (c.icon || c.iconCls),
            icon: c.icon || Ext.BLANK_IMAGE_URL,
            iconCls: 'x-menu-item-icon ' + (c.iconCls || ''),
            itemId: 'x-menu-el-' + c.id,
            itemCls: 'x-menu-list-item '
        };
    },

    
    isValidParent : function(c, target) {
        return c.el.up('li.x-menu-list-item', 5).dom.parentNode === (target.dom || target);
    },

    onLayout : function(ct, target){
        MenuLayout.superclass.onLayout.call(this, ct, target);
        this.doAutoSize();
    },

    doAutoSize : function(){
        var ct = this.container, w = ct.width;
        if(ct.floating){
            if(w){
                ct.setWidth(w);
            }else if(Ext.isIE){
                ct.setWidth(Ext.isStrict && (Ext.isIE7 || Ext.isIE8) ? 'auto' : ct.minWidth);
                var el = ct.getEl(), t = el.dom.offsetWidth; 
                ct.setWidth(ct.getLayoutTarget().getWidth() + el.getFrameWidth('lr'));
            }
        }
    }
});

//Move To ContainnerLayout
//Container.LAYOUTS['menu'] = MenuLayout;

export default MenuLayout;