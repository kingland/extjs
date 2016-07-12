import Ext from '../Base';
import ContainerLayout from './ContainerLayout';
//import Container from '../Container';
import Toolbar from '../Toolbar';
import Menu from '../menu/Menu';
import Button from '../Button';

var ToolbarLayout = Ext.extend(ContainerLayout, {
    monitorResize : true,

    type: 'toolbar',

    
    triggerWidth: 18,

    
    noItemsMenuText : '<div class="x-toolbar-no-items">(None)</div>',

    
    lastOverflow: false,

    
    tableHTML: [
        '<table cellspacing="0" class="x-toolbar-ct">',
            '<tbody>',
                '<tr>',
                    '<td class="x-toolbar-left" align="{0}">',
                        '<table cellspacing="0">',
                            '<tbody>',
                                '<tr class="x-toolbar-left-row"></tr>',
                            '</tbody>',
                        '</table>',
                    '</td>',
                    '<td class="x-toolbar-right" align="right">',
                        '<table cellspacing="0" class="x-toolbar-right-ct">',
                            '<tbody>',
                                '<tr>',
                                    '<td>',
                                        '<table cellspacing="0">',
                                            '<tbody>',
                                                '<tr class="x-toolbar-right-row"></tr>',
                                            '</tbody>',
                                        '</table>',
                                    '</td>',
                                    '<td>',
                                        '<table cellspacing="0">',
                                            '<tbody>',
                                                '<tr class="x-toolbar-extras-row"></tr>',
                                            '</tbody>',
                                        '</table>',
                                    '</td>',
                                '</tr>',
                            '</tbody>',
                        '</table>',
                    '</td>',
                '</tr>',
            '</tbody>',
        '</table>'
    ].join(""),

    
    onLayout : function(ct, target) {
        
        if (!this.leftTr) {
            var align = ct.buttonAlign == 'center' ? 'center' : 'left';

            target.addClass('x-toolbar-layout-ct');
            target.insertHtml('beforeEnd', String.format(this.tableHTML, align));

            this.leftTr   = target.child('tr.x-toolbar-left-row', true);
            this.rightTr  = target.child('tr.x-toolbar-right-row', true);
            this.extrasTr = target.child('tr.x-toolbar-extras-row', true);

            if (this.hiddenItem == undefined) {
                
                this.hiddenItems = [];
            }
        }

        var side     = ct.buttonAlign == 'right' ? this.rightTr : this.leftTr,
            items    = ct.items.items,
            position = 0;

        
        for (var i = 0, len = items.length, c; i < len; i++, position++) {
            c = items[i];

            if (c.isFill) {
                side   = this.rightTr;
                position = -1;
            } else if (!c.rendered) {
                c.render(this.insertCell(c, side, position));
            } else {
                if (!c.xtbHidden && !this.isValidParent(c, side.childNodes[position])) {
                    var td = this.insertCell(c, side, position);
                    td.appendChild(c.getPositionEl().dom);
                    c.container = Ext.get(td);
                }
            }
        }

        
        this.cleanup(this.leftTr);
        this.cleanup(this.rightTr);
        this.cleanup(this.extrasTr);
        this.fitToSize(target);
    },

    
    cleanup : function(el) {
        var cn = el.childNodes, i, c;

        for (i = cn.length-1; i >= 0 && (c = cn[i]); i--) {
            if (!c.firstChild) {
                el.removeChild(c);
            }
        }
    },

    
    insertCell : function(c, target, position) {
        var td = document.createElement('td');
        td.className = 'x-toolbar-cell';

        target.insertBefore(td, target.childNodes[position] || null);

        return td;
    },

    
    hideItem : function(item) {
        this.hiddenItems.push(item);

        item.xtbHidden = true;
        item.xtbWidth = item.getPositionEl().dom.parentNode.offsetWidth;
        item.hide();
    },

    
    unhideItem : function(item) {
        item.show();
        item.xtbHidden = false;
        this.hiddenItems.remove(item);
    },

    
    getItemWidth : function(c) {
        return c.hidden ? (c.xtbWidth || 0) : c.getPositionEl().dom.parentNode.offsetWidth;
    },

    
    fitToSize : function(target) {
        if (this.container.enableOverflow === false) {
            return;
        }

        var width       = target.dom.clientWidth,
            tableWidth  = target.dom.firstChild.offsetWidth,
            clipWidth   = width - this.triggerWidth,
            lastWidth   = this.lastWidth || 0,

            hiddenItems = this.hiddenItems,
            hasHiddens  = hiddenItems.length != 0,
            isLarger    = width >= lastWidth;

        this.lastWidth  = width;

        if (tableWidth > width || (hasHiddens && isLarger)) {
            var items     = this.container.items.items,
                len       = items.length,
                loopWidth = 0,
                item;

            for (var i = 0; i < len; i++) {
                item = items[i];

                if (!item.isFill) {
                    loopWidth += this.getItemWidth(item);
                    if (loopWidth > clipWidth) {
                        if (!(item.hidden || item.xtbHidden)) {
                            this.hideItem(item);
                        }
                    } else if (item.xtbHidden) {
                        this.unhideItem(item);
                    }
                }
            }
        }

        
        hasHiddens = hiddenItems.length != 0;

        if (hasHiddens) {
            this.initMore();

            if (!this.lastOverflow) {
                this.container.fireEvent('overflowchange', this.container, true);
                this.lastOverflow = true;
            }
        } else if (this.more) {
            this.clearMenu();
            this.more.destroy();
            delete this.more;

            if (this.lastOverflow) {
                this.container.fireEvent('overflowchange', this.container, false);
                this.lastOverflow = false;
            }
        }
    },

    
    createMenuConfig : function(component, hideOnClick){
        var config = Ext.apply({}, component.initialConfig),
            group  = component.toggleGroup;

        Ext.copyTo(config, component, [
            'iconCls', 'icon', 'itemId', 'disabled', 'handler', 'scope', 'menu'
        ]);

        Ext.apply(config, {
            text       : component.overflowText || component.text,
            hideOnClick: hideOnClick
        });

        if (group || component.enableToggle) {
            Ext.apply(config, {
                group  : group,
                checked: component.pressed,
                listeners: {
                    checkchange: function(item, checked){
                        component.toggle(checked);
                    }
                }
            });
        }

        delete config.ownerCt;
        delete config.xtype;
        delete config.id;

        return config;
    },

    
    addComponentToMenu : function(menu, component) {
        if (component instanceof Toolbar.Separator) {
            menu.add('-');

        } else if (Ext.isFunction(component.isXType)) {
            if (component.isXType('splitbutton')) {
                menu.add(this.createMenuConfig(component, true));

            } else if (component.isXType('button')) {
                menu.add(this.createMenuConfig(component, !component.menu));

            } else if (component.isXType('buttongroup')) {
                component.items.each(function(item){
                     this.addComponentToMenu(menu, item);
                }, this);
            }
        }
    },

    
    clearMenu : function(){
        var menu = this.moreMenu;
        if (menu && menu.items) {
            menu.items.each(function(item){
                delete item.menu;
            });
        }
    },

    
    beforeMoreShow : function(menu) {
        var items = this.container.items.items,
            len   = items.length,
            item,
            prev;

        var needsSep = function(group, item){
            return group.isXType('buttongroup') && !(item instanceof Toolbar.Separator);
        };

        this.clearMenu();
        menu.removeAll();
        for (var i = 0; i < len; i++) {
            item = items[i];
            if (item.xtbHidden) {
                if (prev && (needsSep(item, prev) || needsSep(prev, item))) {
                    menu.add('-');
                }
                this.addComponentToMenu(menu, item);
                prev = item;
            }
        }

        
        if (menu.items.length < 1) {
            menu.add(this.noItemsMenuText);
        }
    },

    
    initMore : function(){
        if (!this.more) {
            
            this.moreMenu = new Menu({
                ownerCt : this.container,
                listeners: {
                    beforeshow: this.beforeMoreShow,
                    scope: this
                }
            });

            
            this.more = new Button({
                iconCls: 'x-toolbar-more-icon',
                cls    : 'x-toolbar-more',
                menu   : this.moreMenu,
                ownerCt: this.container
            });

            var td = this.insertCell(this.more, this.extrasTr, 100);
            this.more.render(td);
        }
    },

    destroy : function(){
        Ext.destroy(this.more, this.moreMenu);
        delete this.leftTr;
        delete this.rightTr;
        delete this.extrasTr;
        ToolbarLayout.superclass.destroy.call(this);
    }
});

//Move To ContainnerLayout
//Container.LAYOUTS.toolbar = ToolbarLayout;

export default ToolbarLayout;