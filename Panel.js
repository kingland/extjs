import Ext from './Base';
import Container from './Container';
import Element from './Element';
import DomHelper from './DomHelper';
import Layer from './Layer';
import Template from './Template';
import QuickTips from './QuickTips';
import KeyMap from './KeyMap';

import PanelProxy from './dd/PanelProxy';
import DragSource from './dd/DragSource';

var Panel = Ext.extend(Container, {
    
    baseCls : 'x-panel',
    
    collapsedCls : 'x-panel-collapsed',
    
    maskDisabled : true,
    
    animCollapse : Ext.enableFx,
    
    headerAsText : true,
    
    buttonAlign : 'right',
    
    collapsed : false,
    
    collapseFirst : true,
    
    minButtonWidth : 75,
    
    
    elements : 'body',
    
    preventBodyReset : false,

    
    padding: undefined,

    
    resizeEvent: 'bodyresize',
    
    toolTarget : 'header',
    collapseEl : 'bwrap',
    slideAnchor : 't',
    disabledClass : '',

    
    deferHeight : true,
    
    expandDefaults: {
        duration : 0.25
    },
    
    collapseDefaults : {
        duration : 0.25
    },

    
    initComponent : function(){
        Panel.superclass.initComponent.call(this);

        this.addEvents(
            
            'bodyresize',
            
            'titlechange',
            
            'iconchange',
            
            'collapse',
            
            'expand',
            
            'beforecollapse',
            
            'beforeexpand',
            
            'beforeclose',
            
            'close',
            
            'activate',
            
            'deactivate'
        );

        if(this.unstyled){
            this.baseCls = 'x-plain';
        }


        this.toolbars = [];
        
        if(this.tbar){
            this.elements += ',tbar';
            this.topToolbar = this.createToolbar(this.tbar);
            this.tbar = null;

        }
        if(this.bbar){
            this.elements += ',bbar';
            this.bottomToolbar = this.createToolbar(this.bbar);
            this.bbar = null;
        }

        if(this.header === true){
            this.elements += ',header';
            this.header = null;
        }else if(this.headerCfg || (this.title && this.header !== false)){
            this.elements += ',header';
        }

        if(this.footerCfg || this.footer === true){
            this.elements += ',footer';
            this.footer = null;
        }

        if(this.buttons){
            this.fbar = this.buttons;
            this.buttons = null;
        }
        if(this.fbar){
            this.createFbar(this.fbar);
        }
        if(this.autoLoad){
            this.on('render', this.doAutoLoad, this, {delay:10});
        }
    },

    
    createFbar : function(fbar){
        var min = this.minButtonWidth;
        this.elements += ',footer';
        this.fbar = this.createToolbar(fbar, {
            buttonAlign: this.buttonAlign,
            toolbarCls: 'x-panel-fbar',
            enableOverflow: false,
            defaults: function(c){
                return {
                    minWidth: c.minWidth || min
                };
            }
        });
        
        
        
        this.fbar.items.each(function(c){
            c.minWidth = c.minWidth || this.minButtonWidth;
        }, this);
        this.buttons = this.fbar.items.items;
    },

    
    createToolbar: function(tb, options){
        var result;
        
        if(Ext.isArray(tb)){
            tb = {
                items: tb
            };
        }
        result = tb.events ? Ext.apply(tb, options) : this.createComponent(Ext.apply({}, tb, options), 'toolbar');
        this.toolbars.push(result);
        return result;
    },

    
    createElement : function(name, pnode){
        if(this[name]){
            pnode.appendChild(this[name].dom);
            return;
        }

        if(name === 'bwrap' || this.elements.indexOf(name) != -1){
            if(this[name+'Cfg']){
                this[name] = Ext.fly(pnode).createChild(this[name+'Cfg']);
            }else{
                var el = document.createElement('div');
                el.className = this[name+'Cls'];
                this[name] = Ext.get(pnode.appendChild(el));
            }
            if(this[name+'CssClass']){
                this[name].addClass(this[name+'CssClass']);
            }
            if(this[name+'Style']){
                this[name].applyStyles(this[name+'Style']);
            }
        }
    },

    
    onRender : function(ct, position){
        Panel.superclass.onRender.call(this, ct, position);
        this.createClasses();

        var el = this.el,
            d = el.dom,
            bw,
            ts;


        if(this.collapsible && !this.hideCollapseTool){
            this.tools = this.tools ? this.tools.slice(0) : [];
            this.tools[this.collapseFirst?'unshift':'push']({
                id: 'toggle',
                handler : this.toggleCollapse,
                scope: this
            });
        }

        if(this.tools){
            ts = this.tools;
            this.elements += (this.header !== false) ? ',header' : '';
        }
        this.tools = {};

        el.addClass(this.baseCls);
        if(d.firstChild){ 
            this.header = el.down('.'+this.headerCls);
            this.bwrap = el.down('.'+this.bwrapCls);
            var cp = this.bwrap ? this.bwrap : el;
            this.tbar = cp.down('.'+this.tbarCls);
            this.body = cp.down('.'+this.bodyCls);
            this.bbar = cp.down('.'+this.bbarCls);
            this.footer = cp.down('.'+this.footerCls);
            this.fromMarkup = true;
        }
        if (this.preventBodyReset === true) {
            el.addClass('x-panel-reset');
        }
        if(this.cls){
            el.addClass(this.cls);
        }

        if(this.buttons){
            this.elements += ',footer';
        }

        

        
        if(this.frame){
            el.insertHtml('afterBegin', String.format(Element.boxMarkup, this.baseCls));

            this.createElement('header', d.firstChild.firstChild.firstChild);
            this.createElement('bwrap', d);

            
            bw = this.bwrap.dom;
            var ml = d.childNodes[1], bl = d.childNodes[2];
            bw.appendChild(ml);
            bw.appendChild(bl);

            var mc = bw.firstChild.firstChild.firstChild;
            this.createElement('tbar', mc);
            this.createElement('body', mc);
            this.createElement('bbar', mc);
            this.createElement('footer', bw.lastChild.firstChild.firstChild);

            if(!this.footer){
                this.bwrap.dom.lastChild.className += ' x-panel-nofooter';
            }
            
            this.ft = Ext.get(this.bwrap.dom.lastChild);
            this.mc = Ext.get(mc);
        }else{
            this.createElement('header', d);
            this.createElement('bwrap', d);

            
            bw = this.bwrap.dom;
            this.createElement('tbar', bw);
            this.createElement('body', bw);
            this.createElement('bbar', bw);
            this.createElement('footer', bw);

            if(!this.header){
                this.body.addClass(this.bodyCls + '-noheader');
                if(this.tbar){
                    this.tbar.addClass(this.tbarCls + '-noheader');
                }
            }
        }

        if(Ext.isDefined(this.padding)){
            this.body.setStyle('padding', this.body.addUnits(this.padding));
        }

        if(this.border === false){
            this.el.addClass(this.baseCls + '-noborder');
            this.body.addClass(this.bodyCls + '-noborder');
            if(this.header){
                this.header.addClass(this.headerCls + '-noborder');
            }
            if(this.footer){
                this.footer.addClass(this.footerCls + '-noborder');
            }
            if(this.tbar){
                this.tbar.addClass(this.tbarCls + '-noborder');
            }
            if(this.bbar){
                this.bbar.addClass(this.bbarCls + '-noborder');
            }
        }

        if(this.bodyBorder === false){
           this.body.addClass(this.bodyCls + '-noborder');
        }

        this.bwrap.enableDisplayMode('block');

        if(this.header){
            this.header.unselectable();

            
            if(this.headerAsText){
                this.header.dom.innerHTML =
                    '<span class="' + this.headerTextCls + '">'+this.header.dom.innerHTML+'</span>';

                if(this.iconCls){
                    this.setIconClass(this.iconCls);
                }
            }
        }

        if(this.floating){
            this.makeFloating(this.floating);
        }

        if(this.collapsible && this.titleCollapse && this.header){
            this.mon(this.header, 'click', this.toggleCollapse, this);
            this.header.setStyle('cursor', 'pointer');
        }
        if(ts){
            this.addTool.apply(this, ts);
        }

        
        if(this.fbar){
            this.footer.addClass('x-panel-btns');
            this.fbar.ownerCt = this;
            this.fbar.render(this.footer);
            this.footer.createChild({cls:'x-clear'});
        }
        if(this.tbar && this.topToolbar){
            this.topToolbar.ownerCt = this;
            this.topToolbar.render(this.tbar);
        }
        if(this.bbar && this.bottomToolbar){
            this.bottomToolbar.ownerCt = this;
            this.bottomToolbar.render(this.bbar);
        }
    },

    
    setIconClass : function(cls){
        var old = this.iconCls;
        this.iconCls = cls;
        if(this.rendered && this.header){
            if(this.frame){
                this.header.addClass('x-panel-icon');
                this.header.replaceClass(old, this.iconCls);
            }else{
                var hd = this.header,
                    img = hd.child('img.x-panel-inline-icon');
                if(img){
                    Ext.fly(img).replaceClass(old, this.iconCls);
                }else{
                    var hdspan = hd.child('span.' + this.headerTextCls);
                    if (hdspan) {
                        DomHelper.insertBefore(hdspan.dom, {
                            tag:'img', src: Ext.BLANK_IMAGE_URL, cls:'x-panel-inline-icon '+this.iconCls
                        });
                    }
                 }
            }
        }
        this.fireEvent('iconchange', this, cls, old);
    },

    
    makeFloating : function(cfg){
        this.floating = true;
        this.el = new Layer(Ext.apply({}, cfg, {
            shadow: Ext.isDefined(this.shadow) ? this.shadow : 'sides',
            shadowOffset: this.shadowOffset,
            constrain:false,
            shim: this.shim === false ? false : undefined
        }), this.el);
    },

    
    getTopToolbar : function(){
        return this.topToolbar;
    },

    
    getBottomToolbar : function(){
        return this.bottomToolbar;
    },

    
    getFooterToolbar : function() {
        return this.fbar;
    },

    
    addButton : function(config, handler, scope){
        if(!this.fbar){
            this.createFbar([]);
        }
        if(handler){
            if(Ext.isString(config)){
                config = {text: config};
            }
            config = Ext.apply({
                handler: handler,
                scope: scope
            }, config);
        }
        return this.fbar.add(config);
    },

    
    addTool : function(){
        if(!this.rendered){
            if(!this.tools){
                this.tools = [];
            }
            Ext.each(arguments, function(arg){
                this.tools.push(arg);
            }, this);
            return;
        }
         
        if(!this[this.toolTarget]){
            return;
        }
        if(!this.toolTemplate){
            
            var tt = new Template(
                 '<div class="x-tool x-tool-{id}">&#160;</div>'
            );
            tt.disableFormats = true;
            tt.compile();
            Panel.prototype.toolTemplate = tt;
        }
        for(var i = 0, a = arguments, len = a.length; i < len; i++) {
            var tc = a[i];
            if(!this.tools[tc.id]){
                var overCls = 'x-tool-'+tc.id+'-over';
                var t = this.toolTemplate.insertFirst(this[this.toolTarget], tc, true);
                this.tools[tc.id] = t;
                t.enableDisplayMode('block');
                this.mon(t, 'click',  this.createToolHandler(t, tc, overCls, this));
                if(tc.on){
                    this.mon(t, tc.on);
                }
                if(tc.hidden){
                    t.hide();
                }
                if(tc.qtip){
                    if(Ext.isObject(tc.qtip)){
                        QuickTips.register(Ext.apply({
                              target: t.id
                        }, tc.qtip));
                    } else {
                        t.dom.qtip = tc.qtip;
                    }
                }
                t.addClassOnOver(overCls);
            }
        }
    },

    onLayout : function(shallow, force){
        Panel.superclass.onLayout.apply(this, arguments);
        if(this.hasLayout && this.toolbars.length > 0){
            Ext.each(this.toolbars, function(tb){
                tb.doLayout(undefined, force);
            });
            this.syncHeight();
        }
    },

    syncHeight : function(){
        var h = this.toolbarHeight,
                bd = this.body,
                lsh = this.lastSize.height,
                sz;

        if(this.autoHeight || !Ext.isDefined(lsh) || lsh == 'auto'){
            return;
        }


        if(h != this.getToolbarHeight()){
            h = Math.max(0, lsh - this.getFrameHeight());
            bd.setHeight(h);
            sz = bd.getSize();
            this.toolbarHeight = this.getToolbarHeight();
            this.onBodyResize(sz.width, sz.height);
        }
    },

    
    onShow : function(){
        if(this.floating){
            return this.el.show();
        }
        Panel.superclass.onShow.call(this);
    },

    
    onHide : function(){
        if(this.floating){
            return this.el.hide();
        }
        Panel.superclass.onHide.call(this);
    },

    
    createToolHandler : function(t, tc, overCls, panel){
        return function(e){
            t.removeClass(overCls);
            if(tc.stopEvent !== false){
                e.stopEvent();
            }
            if(tc.handler){
                tc.handler.call(tc.scope || t, e, t, panel, tc);
            }
        };
    },

    
    afterRender : function(){
        if(this.floating && !this.hidden){
            this.el.show();
        }
        if(this.title){
            this.setTitle(this.title);
        }
        Panel.superclass.afterRender.call(this); 
        if (this.collapsed) {
            this.collapsed = false;
            this.collapse(false);
        }
        this.initEvents();
    },

    
    getKeyMap : function(){
        if(!this.keyMap){
            this.keyMap = new KeyMap(this.el, this.keys);
        }
        return this.keyMap;
    },

    
    initEvents : function(){
        if(this.keys){
            this.getKeyMap();
        }
        if(this.draggable){
            this.initDraggable();
        }
        if(this.toolbars.length > 0){
            Ext.each(this.toolbars, function(tb){
                tb.doLayout();
                tb.on({
                    scope: this,
                    afterlayout: this.syncHeight,
                    remove: this.syncHeight
                });
            }, this);
            this.syncHeight();
        }

    },

    
    initDraggable : function(){
        
        this.dd = new Panel.DD(this, Ext.isBoolean(this.draggable) ? null : this.draggable);
    },

    
    beforeEffect : function(anim){
        if(this.floating){
            this.el.beforeAction();
        }
        if(anim !== false){
            this.el.addClass('x-panel-animated');
        }
    },

    
    afterEffect : function(anim){
        this.syncShadow();
        this.el.removeClass('x-panel-animated');
    },

    
    createEffect : function(a, cb, scope){
        var o = {
            scope:scope,
            block:true
        };
        if(a === true){
            o.callback = cb;
            return o;
        }else if(!a.callback){
            o.callback = cb;
        }else { 
            o.callback = function(){
                cb.call(scope);
                Ext.callback(a.callback, a.scope);
            };
        }
        return Ext.applyIf(o, a);
    },

    
    collapse : function(animate){
        if(this.collapsed || this.el.hasFxBlock() || this.fireEvent('beforecollapse', this, animate) === false){
            return;
        }
        var doAnim = animate === true || (animate !== false && this.animCollapse);
        this.beforeEffect(doAnim);
        this.onCollapse(doAnim, animate);
        return this;
    },

    
    onCollapse : function(doAnim, animArg){
        if(doAnim){
            this[this.collapseEl].slideOut(this.slideAnchor,
                    Ext.apply(this.createEffect(animArg||true, this.afterCollapse, this),
                        this.collapseDefaults));
        }else{
            this[this.collapseEl].hide(this.hideMode);
            this.afterCollapse(false);
        }
    },

    
    afterCollapse : function(anim){
        this.collapsed = true;
        this.el.addClass(this.collapsedCls);
        if(anim !== false){
            this[this.collapseEl].hide(this.hideMode);
        }
        this.afterEffect(anim);

        
        this.cascade(function(c) {
            if (c.lastSize) {
                c.lastSize = { width: undefined, height: undefined };
            }
        });
        this.fireEvent('collapse', this);
    },

    
    expand : function(animate){
        if(!this.collapsed || this.el.hasFxBlock() || this.fireEvent('beforeexpand', this, animate) === false){
            return;
        }
        var doAnim = animate === true || (animate !== false && this.animCollapse);
        this.el.removeClass(this.collapsedCls);
        this.beforeEffect(doAnim);
        this.onExpand(doAnim, animate);
        return this;
    },

    
    onExpand : function(doAnim, animArg){
        if(doAnim){
            this[this.collapseEl].slideIn(this.slideAnchor,
                    Ext.apply(this.createEffect(animArg||true, this.afterExpand, this),
                        this.expandDefaults));
        }else{
            this[this.collapseEl].show(this.hideMode);
            this.afterExpand(false);
        }
    },

    
    afterExpand : function(anim){
        this.collapsed = false;
        if(anim !== false){
            this[this.collapseEl].show(this.hideMode);
        }
        this.afterEffect(anim);
        if (this.deferLayout) {
            delete this.deferLayout;
            this.doLayout(true);
        }
        this.fireEvent('expand', this);
    },

    
    toggleCollapse : function(animate){
        this[this.collapsed ? 'expand' : 'collapse'](animate);
        return this;
    },

    
    onDisable : function(){
        if(this.rendered && this.maskDisabled){
            this.el.mask();
        }
        Panel.superclass.onDisable.call(this);
    },

    
    onEnable : function(){
        if(this.rendered && this.maskDisabled){
            this.el.unmask();
        }
        Panel.superclass.onEnable.call(this);
    },

    
    onResize : function(adjWidth, adjHeight, rawWidth, rawHeight){
        var w = adjWidth,
            h = adjHeight;

        if(Ext.isDefined(w) || Ext.isDefined(h)){
            if(!this.collapsed){
				if(this.body){
					if(Ext.isNumber(w)){
						this.body.setWidth(w = this.adjustBodyWidth(w - this.getFrameWidth()));
					} else if (w == 'auto') {
						w = this.body.setWidth('auto').dom.offsetWidth;
					} else {
						w = this.body.dom.offsetWidth;
					}
				}

                if(this.tbar){
                    this.tbar.setWidth(w);
                    if(this.topToolbar){
                        this.topToolbar.setSize(w);
                    }
                }
                if(this.bbar){
                    this.bbar.setWidth(w);
                    if(this.bottomToolbar){
                        this.bottomToolbar.setSize(w);
                        
                        if (Ext.isIE) {
                            this.bbar.setStyle('position', 'static');
                            this.bbar.setStyle('position', '');
                        }
                    }
                }
                if(this.footer){
                    this.footer.setWidth(w);
                    if(this.fbar){
                        this.fbar.setSize(Ext.isIE ? (w - this.footer.getFrameWidth('lr')) : 'auto');
                    }
                }

                if(this.body){
					if(Ext.isNumber(h)){
						h = Math.max(0, h - this.getFrameHeight());
						
						this.body.setHeight(h);
					}else if(h == 'auto'){
						this.body.setHeight(h);
					}
				}

                if(this.disabled && this.el._mask){
                    this.el._mask.setSize(this.el.dom.clientWidth, this.el.getHeight());
                }
            }else{
                
                this.queuedBodySize = {width: w, height: h};
                if(!this.queuedExpand && this.allowQueuedExpand !== false){
                    this.queuedExpand = true;
                    this.on('expand', function(){
                        delete this.queuedExpand;
                        this.onResize(this.queuedBodySize.width, this.queuedBodySize.height);
                    }, this, {single:true});
                }
            }
            this.onBodyResize(w, h);
        }
        this.syncShadow();
        Panel.superclass.onResize.call(this, adjWidth, adjHeight, rawWidth, rawHeight);

    },

    
    onBodyResize: function(w, h){
        this.fireEvent('bodyresize', this, w, h);
    },

    
    getToolbarHeight: function(){
        var h = 0;
        if(this.rendered){
            Ext.each(this.toolbars, function(tb){
                h += tb.getHeight();
            }, this);
        }
        return h;
    },

    
    adjustBodyHeight : function(h){
        return h;
    },

    
    adjustBodyWidth : function(w){
        return w;
    },

    
    onPosition : function(){
        this.syncShadow();
    },

    
    getFrameWidth : function(){
        var w = this.el.getFrameWidth('lr') + this.bwrap.getFrameWidth('lr');

        if(this.frame){
            var l = this.bwrap.dom.firstChild;
            w += (Ext.fly(l).getFrameWidth('l') + Ext.fly(l.firstChild).getFrameWidth('r'));
            w += this.mc.getFrameWidth('lr');
        }
        return w;
    },

    
    getFrameHeight : function() {
        var h = Math.max(0, this.getHeight() - this.body.getHeight());

        if (isNaN(h)) {
            h = 0;
        }
        return h;

        
    },

    
    getInnerWidth : function(){
        return this.getSize().width - this.getFrameWidth();
    },

    
    getInnerHeight : function(){
        return this.body.getHeight();
        
    },

    
    syncShadow : function(){
        if(this.floating){
            this.el.sync(true);
        }
    },

    
    getLayoutTarget : function(){
        return this.body;
    },

    
    getContentTarget : function(){
        return this.body;
    },

    
    setTitle : function(title, iconCls){
        this.title = title;
        if(this.header && this.headerAsText){
            this.header.child('span').update(title);
        }
        if(iconCls){
            this.setIconClass(iconCls);
        }
        this.fireEvent('titlechange', this, title);
        return this;
    },

    
    getUpdater : function(){
        return this.body.getUpdater();
    },

     
    load : function(){
        var um = this.body.getUpdater();
        um.update.apply(um, arguments);
        return this;
    },

    
    beforeDestroy : function(){
        Panel.superclass.beforeDestroy.call(this);
        if(this.header){
            this.header.removeAllListeners();
        }
        if(this.tools){
            for(var k in this.tools){
                Ext.destroy(this.tools[k]);
            }
        }
        if(this.toolbars.length > 0){
            Ext.each(this.toolbars, function(tb){
                tb.un('afterlayout', this.syncHeight, this);
                tb.un('remove', this.syncHeight, this);
            }, this);
        }
        if(Ext.isArray(this.buttons)){
            while(this.buttons.length) {
                Ext.destroy(this.buttons[0]);
            }
        }
        if(this.rendered){
            Ext.destroy(
                this.ft,
                this.header,
                this.footer,
                this.tbar,
                this.bbar,
                this.body,
                this.mc,
                this.bwrap,
                this.dd
            );
            if (this.fbar) {
                Ext.destroy(
                    this.fbar,
                    this.fbar.el
                );
            }
        }
        Ext.destroy(this.toolbars);
    },

    
    createClasses : function(){
        this.headerCls = this.baseCls + '-header';
        this.headerTextCls = this.baseCls + '-header-text';
        this.bwrapCls = this.baseCls + '-bwrap';
        this.tbarCls = this.baseCls + '-tbar';
        this.bodyCls = this.baseCls + '-body';
        this.bbarCls = this.baseCls + '-bbar';
        this.footerCls = this.baseCls + '-footer';
    },

    
    createGhost : function(cls, useShim, appendTo){
        var el = document.createElement('div');
        el.className = 'x-panel-ghost ' + (cls ? cls : '');
        if(this.header){
            el.appendChild(this.el.dom.firstChild.cloneNode(true));
        }
        Ext.fly(el.appendChild(document.createElement('ul'))).setHeight(this.bwrap.getHeight());
        el.style.width = this.el.dom.offsetWidth + 'px';;
        if(!appendTo){
            this.container.dom.appendChild(el);
        }else{
            Ext.getDom(appendTo).appendChild(el);
        }
        if(useShim !== false && this.el.useShim !== false){
            var layer = new Layer({shadow:false, useDisplay:true, constrain:false}, el);
            layer.show();
            return layer;
        }else{
            return new Element(el);
        }
    },

    
    doAutoLoad : function(){
        var u = this.body.getUpdater();
        if(this.renderer){
            u.setRenderer(this.renderer);
        }
        u.update(Ext.isObject(this.autoLoad) ? this.autoLoad : {url: this.autoLoad});
    },

    
    getTool : function(id) {
        return this.tools[id];
    }


});
Ext.reg('panel', Panel);


Panel.DD = function(panel, cfg){
    this.panel = panel;
    this.dragData = {panel: panel};
    this.proxy = new PanelProxy(panel, cfg);
    Panel.DD.superclass.constructor.call(this, panel.el, cfg);
    var h = panel.header;
    if(h){
        this.setHandleElId(h.id);
    }
    (h ? h : this.panel.body).setStyle('cursor', 'move');
    this.scroll = false;
};

Ext.extend(Panel.DD,  DragSource, {
    showFrame: Ext.emptyFn,
    startDrag: Ext.emptyFn,
    b4StartDrag: function(x, y) {
        this.proxy.show();
    },
    b4MouseDown: function(e) {
        var x = e.getPageX();
        var y = e.getPageY();
        this.autoOffset(x, y);
    },
    onInitDrag : function(x, y){
        this.onStartDrag(x, y);
        return true;
    },
    createFrame : Ext.emptyFn,
    getDragEl : function(e){
        return this.proxy.ghost.dom;
    },
    endDrag : function(e){
        this.proxy.hide();
        this.panel.saveState();
    },

    autoOffset : function(x, y) {
        x -= this.startPageX;
        y -= this.startPageY;
        this.setDelta(x, y);
    }
});

export default Panel;