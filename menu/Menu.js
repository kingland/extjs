import Ext from '../Base';
import Container from '../Container';
import MenuMgr from './MenuMgr';
import MenuNav from './MenuNav';
import BaseItem from './BaseItem';
import Separator from './Separator';
import TextItem from './TextItem';
import CheckItem from './CheckItem';

import EventManager from '../EventManager';
import Layer from '../Layer';
import BoxComponent from '../BoxComponent';

import ClickRepeater from '../util/ClickRepeater';

var Menu = Ext.extend(Container, {
    
    minWidth : 120,
    
    shadow : 'sides',
    
    subMenuAlign : 'tl-tr?',
    
    defaultAlign : 'tl-bl?',
    
    allowOtherMenus : false,
    
    ignoreParentClicks : false,
    
    enableScrolling : true,
    
    maxHeight : null,
    
    scrollIncrement : 24,
    
    showSeparator : true,
    
    defaultOffsets : [0, 0],

    
    plain : false,

    
    floating : true,


    
    zIndex: 15000,

    
    hidden : true,

    
    layout : 'menu',
    hideMode : 'offsets',    
    scrollerHeight : 8,
    autoLayout : true,       
    defaultType : 'menuitem',
    bufferResize : false,

    initComponent : function(){
        if(Ext.isArray(this.initialConfig)){
            Ext.apply(this, {items:this.initialConfig});
        }
        this.addEvents(
            
            'click',
            
            'mouseover',
            
            'mouseout',
            
            'itemclick'
        );
        MenuMgr.register(this);
        if(this.floating){
            EventManager.onWindowResize(this.hide, this);
        }else{
            if(this.initialConfig.hidden !== false){
                this.hidden = false;
            }
            this.internalDefaults = {hideOnClick: false};
        }
        Menu.superclass.initComponent.call(this);
        if(this.autoLayout){
            var fn = this.doLayout.createDelegate(this, []);
            this.on({
                add: fn,
                remove: fn
            });
        }
    },

    
    getLayoutTarget : function() {
        return this.ul;
    },

    
    onRender : function(ct, position){
        if(!ct){
            ct = Ext.getBody();
        }

        var dh = {
            id: this.getId(),
            cls: 'x-menu ' + ((this.floating) ? 'x-menu-floating x-layer ' : '') + (this.cls || '') + (this.plain ? ' x-menu-plain' : '') + (this.showSeparator ? '' : ' x-menu-nosep'),
            style: this.style,
            cn: [
                {tag: 'a', cls: 'x-menu-focus', href: '#', onclick: 'return false;', tabIndex: '-1'},
                {tag: 'ul', cls: 'x-menu-list'}
            ]
        };
        if(this.floating){
            this.el = new Layer({
                shadow: this.shadow,
                dh: dh,
                constrain: false,
                parentEl: ct,
                zindex: this.zIndex
            });
        }else{
            this.el = ct.createChild(dh);
        }
        Menu.superclass.onRender.call(this, ct, position);

        if(!this.keyNav){
            this.keyNav = new MenuNav(this);
        }
        
        this.focusEl = this.el.child('a.x-menu-focus');
        this.ul = this.el.child('ul.x-menu-list');
        this.mon(this.ul, {
            scope: this,
            click: this.onClick,
            mouseover: this.onMouseOver,
            mouseout: this.onMouseOut
        });
        if(this.enableScrolling){
            this.mon(this.el, {
                scope: this,
                delegate: '.x-menu-scroller',
                click: this.onScroll,
                mouseover: this.deactivateActive
            });
        }
    },

    
    findTargetItem : function(e){
        var t = e.getTarget('.x-menu-list-item', this.ul, true);
        if(t && t.menuItemId){
            return this.items.get(t.menuItemId);
        }
    },

    
    onClick : function(e){
        var t = this.findTargetItem(e);
        if(t){
            if(t.isFormField){
                this.setActiveItem(t);
            }else if(t instanceof BaseItem){
                if(t.menu && this.ignoreParentClicks){
                    t.expandMenu();
                    e.preventDefault();
                }else if(t.onClick){
                    t.onClick(e);
                    this.fireEvent('click', this, t, e);
                }
            }
        }
    },

    
    setActiveItem : function(item, autoExpand){
        if(item != this.activeItem){
            this.deactivateActive();
            if((this.activeItem = item).isFormField){
                item.focus();
            }else{
                item.activate(autoExpand);
            }
        }else if(autoExpand){
            item.expandMenu();
        }
    },

    deactivateActive : function(){
        var a = this.activeItem;
        if(a){
            if(a.isFormField){
                
                if(a.collapse){
                    a.collapse();
                }
            }else{
                a.deactivate();
            }
            delete this.activeItem;
        }
    },

    
    tryActivate : function(start, step){
        var items = this.items;
        for(var i = start, len = items.length; i >= 0 && i < len; i+= step){
            var item = items.get(i);
            if(!item.disabled && (item.canActivate || item.isFormField)){
                this.setActiveItem(item, false);
                return item;
            }
        }
        return false;
    },

    
    onMouseOver : function(e){
        var t = this.findTargetItem(e);
        if(t){
            if(t.canActivate && !t.disabled){
                this.setActiveItem(t, true);
            }
        }
        this.over = true;
        this.fireEvent('mouseover', this, e, t);
    },

    
    onMouseOut : function(e){
        var t = this.findTargetItem(e);
        if(t){
            if(t == this.activeItem && t.shouldDeactivate && t.shouldDeactivate(e)){
                this.activeItem.deactivate();
                delete this.activeItem;
            }
        }
        this.over = false;
        this.fireEvent('mouseout', this, e, t);
    },

    
    onScroll : function(e, t){
        if(e){
            e.stopEvent();
        }
        var ul = this.ul.dom, top = Ext.fly(t).is('.x-menu-scroller-top');
        ul.scrollTop += this.scrollIncrement * (top ? -1 : 1);
        if(top ? ul.scrollTop <= 0 : ul.scrollTop + this.activeMax >= ul.scrollHeight){
           this.onScrollerOut(null, t);
        }
    },

    
    onScrollerIn : function(e, t){
        var ul = this.ul.dom, top = Ext.fly(t).is('.x-menu-scroller-top');
        if(top ? ul.scrollTop > 0 : ul.scrollTop + this.activeMax < ul.scrollHeight){
            Ext.fly(t).addClass(['x-menu-item-active', 'x-menu-scroller-active']);
        }
    },

    
    onScrollerOut : function(e, t){
        Ext.fly(t).removeClass(['x-menu-item-active', 'x-menu-scroller-active']);
    },

    
    show : function(el, pos, parentMenu){
        if(this.floating){
            this.parentMenu = parentMenu;
            if(!this.el){
                this.render();
                this.doLayout(false, true);
            }
            this.showAt(this.el.getAlignToXY(el, pos || this.defaultAlign, this.defaultOffsets), parentMenu);
        }else{
            Menu.superclass.show.call(this);
        }
    },

    
    showAt : function(xy, parentMenu){
        if(this.fireEvent('beforeshow', this) !== false){
            this.parentMenu = parentMenu;
            if(!this.el){
                this.render();
            }
            if(this.enableScrolling){
                
                this.el.setXY(xy);
                
                xy[1] = this.constrainScroll(xy[1]);
                xy = [this.el.adjustForConstraints(xy)[0], xy[1]];
            }else{
                
                xy = this.el.adjustForConstraints(xy);
            }
            this.el.setXY(xy);
            this.el.show();
            Menu.superclass.onShow.call(this);
            if(Ext.isIE){
                
                this.fireEvent('autosize', this);
                if(!Ext.isIE8){
                    this.el.repaint();
                }
            }
            this.hidden = false;
            this.focus();
            this.fireEvent('show', this);
        }
    },

    constrainScroll : function(y){
        var max, full = this.ul.setHeight('auto').getHeight(),
            returnY = y, normalY, parentEl, scrollTop, viewHeight;
        if(this.floating){
            parentEl = Ext.fly(this.el.dom.parentNode);
            scrollTop = parentEl.getScroll().top;
            viewHeight = parentEl.getViewSize().height;
            
            
            normalY = y - scrollTop;
            max = this.maxHeight ? this.maxHeight : viewHeight - normalY;
            if(full > viewHeight) {
                max = viewHeight;
                
                returnY = y - normalY;
            } else if(max < full) {
                returnY = y - (full - max);
                max = full;
            }
        }else{
            max = this.getHeight();
        }
        
        if (this.maxHeight){
            max = Math.min(this.maxHeight, max);
        }
        if(full > max && max > 0){
            this.activeMax = max - this.scrollerHeight * 2 - this.el.getFrameWidth('tb') - Ext.num(this.el.shadowOffset, 0);
            this.ul.setHeight(this.activeMax);
            this.createScrollers();
            this.el.select('.x-menu-scroller').setDisplayed('');
        }else{
            this.ul.setHeight(full);
            this.el.select('.x-menu-scroller').setDisplayed('none');
        }
        this.ul.dom.scrollTop = 0;
        return returnY;
    },

    createScrollers : function(){
        if(!this.scroller){
            this.scroller = {
                pos: 0,
                top: this.el.insertFirst({
                    tag: 'div',
                    cls: 'x-menu-scroller x-menu-scroller-top',
                    html: '&#160;'
                }),
                bottom: this.el.createChild({
                    tag: 'div',
                    cls: 'x-menu-scroller x-menu-scroller-bottom',
                    html: '&#160;'
                })
            };
            this.scroller.top.hover(this.onScrollerIn, this.onScrollerOut, this);
            this.scroller.topRepeater = new ClickRepeater(this.scroller.top, {
                listeners: {
                    click: this.onScroll.createDelegate(this, [null, this.scroller.top], false)
                }
            });
            this.scroller.bottom.hover(this.onScrollerIn, this.onScrollerOut, this);
            this.scroller.bottomRepeater = new ClickRepeater(this.scroller.bottom, {
                listeners: {
                    click: this.onScroll.createDelegate(this, [null, this.scroller.bottom], false)
                }
            });
        }
    },

    onLayout : function(){
        if(this.isVisible()){
            if(this.enableScrolling){
                this.constrainScroll(this.el.getTop());
            }
            if(this.floating){
                this.el.sync();
            }
        }
    },

    focus : function(){
        if(!this.hidden){
            this.doFocus.defer(50, this);
        }
    },

    doFocus : function(){
        if(!this.hidden){
            this.focusEl.focus();
        }
    },

    
    hide : function(deep){
        if (!this.isDestroyed) {
            this.deepHide = deep;
            Menu.superclass.hide.call(this);
            delete this.deepHide;
        }
    },

    
    onHide : function(){
        Menu.superclass.onHide.call(this);
        this.deactivateActive();
        if(this.el && this.floating){
            this.el.hide();
        }
        var pm = this.parentMenu;
        if(this.deepHide === true && pm){
            if(pm.floating){
                pm.hide(true);
            }else{
                pm.deactivateActive();
            }
        }
    },

    
    lookupComponent : function(c){
         if(Ext.isString(c)){
            c = (c == 'separator' || c == '-') ? new Separator() : new TextItem(c);
             this.applyDefaults(c);
         }else{
            if(Ext.isObject(c)){
                c = this.getMenuItem(c);
            }else if(c.tagName || c.el){ 
                c = new BoxComponent({
                    el: c
                });
            }
         }
         return c;
    },

    applyDefaults : function(c){
        if(!Ext.isString(c)){
            c = Menu.superclass.applyDefaults.call(this, c);
            var d = this.internalDefaults;
            if(d){
                if(c.events){
                    Ext.applyIf(c.initialConfig, d);
                    Ext.apply(c, d);
                }else{
                    Ext.applyIf(c, d);
                }
            }
        }
        return c;
    },

    
    getMenuItem : function(config){
       if(!config.isXType){
            if(!config.xtype && Ext.isBoolean(config.checked)){
                return new CheckItem(config)
            }
            return Ext.create(config, this.defaultType);
        }
        return config;
    },

    
    addSeparator : function(){
        return this.add(new Separator());
    },

    
    addElement : function(el){
        return this.add(new BaseItem({
            el: el
        }));
    },

    
    addItem : function(item){
        return this.add(item);
    },

    
    addMenuItem : function(config){
        return this.add(this.getMenuItem(config));
    },

    
    addText : function(text){
        return this.add(new TextItem(text));
    },

    
    onDestroy : function(){
        EventManager.removeResizeListener(this.hide, this);
        var pm = this.parentMenu;
        if(pm && pm.activeChild == this){
            delete pm.activeChild;
        }
        delete this.parentMenu;
        Menu.superclass.onDestroy.call(this);
        MenuMgr.unregister(this);
        if(this.keyNav) {
            this.keyNav.disable();
        }
        var s = this.scroller;
        if(s){
            Ext.destroy(s.topRepeater, s.bottomRepeater, s.top, s.bottom);
        }
        Ext.destroy(
            this.el,
            this.focusEl,
            this.ul
        );
    }
});

Ext.reg('menu', Menu);

export default Menu;