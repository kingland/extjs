import Ext from './Base';
import BoxComponent from './BoxComponent';
import MenuMgr from './menu/MenuMgr';
import Template from './Template';
import ButtonToggleMgr from './ButtonToggleMgr';
import ClickRepeater from './util/ClickRepeater';
import QuickTips from './QuickTips';
import TextMetrics from './util/TextMetrics';

var Button = Ext.extend(BoxComponent, {
    
    hidden : false,
    
    disabled : false,
    
    pressed : false,

    enableToggle : false,
    
    menuAlign : 'tl-bl?',
    
    type : 'button',

    
    menuClassTarget : 'tr:nth(2)',

    
    clickEvent : 'click',

    
    handleMouseEvents : true,

    
    tooltipType : 'qtip',

    
    buttonSelector : 'button:first-child',

    
    scale : 'small',
    
    iconAlign : 'left',

    
    arrowAlign : 'right',
    

    initComponent : function(){
        Button.superclass.initComponent.call(this);

        this.addEvents(
            
            'click',
            
            'toggle',
            
            'mouseover',
            
            'mouseout',
            
            'menushow',
            
            'menuhide',
            
            'menutriggerover',
            
            'menutriggerout'
        );
        if(this.menu){
            this.menu =  MenuMgr.get(this.menu);
        }
        if(Ext.isString(this.toggleGroup)){
            this.enableToggle = true;
        }
    },


    getTemplateArgs : function(){
        return [this.type, 'x-btn-' + this.scale + ' x-btn-icon-' + this.scale + '-' + this.iconAlign, this.getMenuClass(), this.cls, this.id];
    },

    
    setButtonClass : function(){
        if(this.useSetClass){
            if(!Ext.isEmpty(this.oldCls)){
                this.el.removeClass([this.oldCls, 'x-btn-pressed']);
            }
            this.oldCls = (this.iconCls || this.icon) ? (this.text ? 'x-btn-text-icon' : 'x-btn-icon') : 'x-btn-noicon';
            this.el.addClass([this.oldCls, this.pressed ? 'x-btn-pressed' : null]);
        }
    },

    
    getMenuClass : function(){
        return this.menu ? (this.arrowAlign != 'bottom' ? 'x-btn-arrow' : 'x-btn-arrow-bottom') : '';
    },

    
    onRender : function(ct, position){
        if(!this.template){
            if(! Button.buttonTemplate){
                
                Button.buttonTemplate = new  Template(
                    '<table id="{4}" cellspacing="0" class="x-btn {3}"><tbody class="{1}">',
                    '<tr><td class="x-btn-tl"><i>&#160;</i></td><td class="x-btn-tc"></td><td class="x-btn-tr"><i>&#160;</i></td></tr>',
                    '<tr><td class="x-btn-ml"><i>&#160;</i></td><td class="x-btn-mc"><em class="{2}" unselectable="on"><button type="{0}"></button></em></td><td class="x-btn-mr"><i>&#160;</i></td></tr>',
                    '<tr><td class="x-btn-bl"><i>&#160;</i></td><td class="x-btn-bc"></td><td class="x-btn-br"><i>&#160;</i></td></tr>',
                    '</tbody></table>');
                Button.buttonTemplate.compile();
            }
            this.template = Button.buttonTemplate;
        }

        var btn, targs = this.getTemplateArgs();

        if(position){
            btn = this.template.insertBefore(position, targs, true);
        }else{
            btn = this.template.append(ct, targs, true);
        }
        
        this.btnEl = btn.child(this.buttonSelector);
        this.mon(this.btnEl, {
            scope: this,
            focus: this.onFocus,
            blur: this.onBlur
        });

        this.initButtonEl(btn, this.btnEl);

        ButtonToggleMgr.register(this);
    },

    
    initButtonEl : function(btn, btnEl){
        this.el = btn;
        this.setIcon(this.icon);
        this.setText(this.text);
        this.setIconClass(this.iconCls);
        if(Ext.isDefined(this.tabIndex)){
            btnEl.dom.tabIndex = this.tabIndex;
        }
        if(this.tooltip){
            this.setTooltip(this.tooltip, true);
        }

        if(this.handleMouseEvents){
            this.mon(btn, {
                scope: this,
                mouseover: this.onMouseOver,
                mousedown: this.onMouseDown
            });

            
            
        }

        if(this.menu){
            this.mon(this.menu, {
                scope: this,
                show: this.onMenuShow,
                hide: this.onMenuHide
            });
        }

        if(this.repeat){
            var repeater = new ClickRepeater(btn, Ext.isObject(this.repeat) ? this.repeat : {});
            this.mon(repeater, 'click', this.onClick, this);
        }
        this.mon(btn, this.clickEvent, this.onClick, this);
    },

    
    afterRender : function(){
        Button.superclass.afterRender.call(this);
        this.useSetClass = true;
        this.setButtonClass();
        this.doc = Ext.getDoc();
        this.doAutoWidth();
    },

    
    setIconClass : function(cls){
        this.iconCls = cls;
        if(this.el){
            this.btnEl.dom.className = '';
            this.btnEl.addClass(['x-btn-text', cls || '']);
            this.setButtonClass();
        }
        return this;
    },

    
    setTooltip : function(tooltip,  initial){
        if(this.rendered){
            if(!initial){
                this.clearTip();
            }
            if(Ext.isObject(tooltip)){
                QuickTips.register(Ext.apply({
                      target: this.btnEl.id
                }, tooltip));
                this.tooltip = tooltip;
            }else{
                this.btnEl.dom[this.tooltipType] = tooltip;
            }
        }else{
            this.tooltip = tooltip;
        }
        return this;
    },

    
    clearTip : function(){
        if(Ext.isObject(this.tooltip)){
            QuickTips.unregister(this.btnEl);
        }
    },

    
    beforeDestroy : function(){
        if(this.rendered){
            this.clearTip();
        }
        if(this.menu && this.destroyMenu !== false) {
            Ext.destroy(this.menu);
        }
        Ext.destroy(this.repeater);
    },

    
    onDestroy : function(){
        if(this.rendered){
            this.doc.un('mouseover', this.monitorMouseOver, this);
            this.doc.un('mouseup', this.onMouseUp, this);
            delete this.doc;
            delete this.btnEl;
            ButtonToggleMgr.unregister(this);
        }
        Button.superclass.onDestroy.call(this);
    },

    
    doAutoWidth : function(){
        if(this.autoWidth !== false && this.el && this.text && this.width === undefined){
            this.el.setWidth('auto');
            if(Ext.isIE7 && Ext.isStrict){
                var ib = this.btnEl;
                if(ib && ib.getWidth() > 20){
                    ib.clip();
                    ib.setWidth(TextMetrics.measure(ib, this.text).width+ib.getFrameWidth('lr'));
                }
            }
            if(this.minWidth){
                if(this.el.getWidth() < this.minWidth){
                    this.el.setWidth(this.minWidth);
                }
            }
        }
    },

    
    setHandler : function(handler, scope){
        this.handler = handler;
        this.scope = scope;
        return this;
    },

    
    setText : function(text){
        this.text = text;
        if(this.el){
            this.btnEl.update(text || '&#160;');
            this.setButtonClass();
        }
        this.doAutoWidth();
        return this;
    },

    
    setIcon : function(icon){
        this.icon = icon;
        if(this.el){
            this.btnEl.setStyle('background-image', icon ? 'url(' + icon + ')' : '');
            this.setButtonClass();
        }
        return this;
    },

    
    getText : function(){
        return this.text;
    },

    
    toggle : function(state, suppressEvent){
        state = state === undefined ? !this.pressed : !!state;
        if(state != this.pressed){
            if(this.rendered){
                this.el[state ? 'addClass' : 'removeClass']('x-btn-pressed');
            }
            this.pressed = state;
            if(!suppressEvent){
                this.fireEvent('toggle', this, state);
                if(this.toggleHandler){
                    this.toggleHandler.call(this.scope || this, this, state);
                }
            }
        }
        return this;
    },

    
    onDisable : function(){
        this.onDisableChange(true);
    },

    
    onEnable : function(){
        this.onDisableChange(false);
    },

    onDisableChange : function(disabled){
        if(this.el){
            if(!Ext.isIE6 || !this.text){
                this.el[disabled ? 'addClass' : 'removeClass'](this.disabledClass);
            }
            this.el.dom.disabled = disabled;
        }
        this.disabled = disabled;
    },

    
    showMenu : function(){
        if(this.rendered && this.menu){
            if(this.tooltip){
                QuickTips.getQuickTip().cancelShow(this.btnEl);
            }
            if(this.menu.isVisible()){
                this.menu.hide();
            }
            this.menu.ownerCt = this;
            this.menu.show(this.el, this.menuAlign);
        }
        return this;
    },

    
    hideMenu : function(){
        if(this.hasVisibleMenu()){
            this.menu.hide();
        }
        return this;
    },

    
    hasVisibleMenu : function(){
        return this.menu && this.menu.ownerCt == this && this.menu.isVisible();
    },

    
    onClick : function(e){
        if(e){
            e.preventDefault();
        }
        if(e.button !== 0){
            return;
        }
        if(!this.disabled){
            if(this.enableToggle && (this.allowDepress !== false || !this.pressed)){
                this.toggle();
            }
            if(this.menu && !this.hasVisibleMenu() && !this.ignoreNextClick){
                this.showMenu();
            }
            this.fireEvent('click', this, e);
            if(this.handler){
                
                this.handler.call(this.scope || this, this, e);
            }
        }
    },

    
    isMenuTriggerOver : function(e, internal){
        return this.menu && !internal;
    },

    
    isMenuTriggerOut : function(e, internal){
        return this.menu && !internal;
    },

    
    onMouseOver : function(e){
        if(!this.disabled){
            var internal = e.within(this.el,  true);
            if(!internal){
                this.el.addClass('x-btn-over');
                if(!this.monitoringMouseOver){
                    this.doc.on('mouseover', this.monitorMouseOver, this);
                    this.monitoringMouseOver = true;
                }
                this.fireEvent('mouseover', this, e);
            }
            if(this.isMenuTriggerOver(e, internal)){
                this.fireEvent('menutriggerover', this, this.menu, e);
            }
        }
    },

    
    monitorMouseOver : function(e){
        if(e.target != this.el.dom && !e.within(this.el)){
            if(this.monitoringMouseOver){
                this.doc.un('mouseover', this.monitorMouseOver, this);
                this.monitoringMouseOver = false;
            }
            this.onMouseOut(e);
        }
    },

    
    onMouseOut : function(e){
        var internal = e.within(this.el) && e.target != this.el.dom;
        this.el.removeClass('x-btn-over');
        this.fireEvent('mouseout', this, e);
        if(this.isMenuTriggerOut(e, internal)){
            this.fireEvent('menutriggerout', this, this.menu, e);
        }
    },

    focus : function() {
        this.btnEl.focus();
    },

    blur : function() {
        this.btnEl.blur();
    },

    
    onFocus : function(e){
        if(!this.disabled){
            this.el.addClass('x-btn-focus');
        }
    },
    
    onBlur : function(e){
        this.el.removeClass('x-btn-focus');
    },

    
    getClickEl : function(e, isUp){
       return this.el;
    },

    
    onMouseDown : function(e){
        if(!this.disabled && e.button === 0){
            this.getClickEl(e).addClass('x-btn-click');
            this.doc.on('mouseup', this.onMouseUp, this);
        }
    },
    
    onMouseUp : function(e){
        if(e.button === 0){
            this.getClickEl(e, true).removeClass('x-btn-click');
            this.doc.un('mouseup', this.onMouseUp, this);
        }
    },
    
    onMenuShow : function(e){
        if(this.menu.ownerCt == this){
            this.menu.ownerCt = this;
            this.ignoreNextClick = 0;
            this.el.addClass('x-btn-menu-active');
            this.fireEvent('menushow', this, this.menu);
        }
    },
    
    onMenuHide : function(e){
        if(this.menu.ownerCt == this){
            this.el.removeClass('x-btn-menu-active');
            this.ignoreNextClick = this.restoreClick.defer(250, this);
            this.fireEvent('menuhide', this, this.menu);
            delete this.menu.ownerCt;
        }
    },

    
    restoreClick : function(){
        this.ignoreNextClick = 0;
    }
});
Ext.reg('button', Button);

export default Button;