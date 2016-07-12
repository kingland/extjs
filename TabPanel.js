import Ext from './Base';
import Panel from './Panel';
import CardLayout from './layout/CardLayout';
import Element from './Element';
import Template from './Template';
import ClickRepeater from './util/ClickRepeater';

var TabPanel = Ext.extend(Panel,  {
    deferredRender : true,
    
    tabWidth : 120,
    
    minTabWidth : 30,
    
    resizeTabs : false,
    
    enableTabScroll : false,
    
    scrollIncrement : 0,
    
    scrollRepeatInterval : 400,
    
    scrollDuration : 0.35,
    
    animScroll : true,
    
    tabPosition : 'top',
    
    baseCls : 'x-tab-panel',
    
    autoTabs : false,
    
    autoTabSelector : 'div.x-tab',
    
    activeTab : undefined,
    
    tabMargin : 2,
    
    plain : false,
    
    wheelIncrement : 20,

    
    idDelimiter : '__',

    
    itemCls : 'x-tab-item',

    
    elements : 'body',
    headerAsText : false,
    frame : false,
    hideBorders :true,

    
    initComponent : function(){
        this.frame = false;
        TabPanel.superclass.initComponent.call(this);
        this.addEvents(
            
            'beforetabchange',
            
            'tabchange',
            
            'contextmenu'
        );
        
        this.setLayout(new CardLayout(Ext.apply({
            layoutOnCardChange: this.layoutOnTabChange,
            deferredRender: this.deferredRender
        }, this.layoutConfig)));

        if(this.tabPosition == 'top'){
            this.elements += ',header';
            this.stripTarget = 'header';
        }else {
            this.elements += ',footer';
            this.stripTarget = 'footer';
        }
        if(!this.stack){
            this.stack = TabPanel.AccessStack();
        }
        this.initItems();
    },

    
    onRender : function(ct, position){
        TabPanel.superclass.onRender.call(this, ct, position);

        if(this.plain){
            var pos = this.tabPosition == 'top' ? 'header' : 'footer';
            this[pos].addClass('x-tab-panel-'+pos+'-plain');
        }

        var st = this[this.stripTarget];

        this.stripWrap = st.createChild({cls:'x-tab-strip-wrap', cn:{
            tag:'ul', cls:'x-tab-strip x-tab-strip-'+this.tabPosition}});

        var beforeEl = (this.tabPosition=='bottom' ? this.stripWrap : null);
        st.createChild({cls:'x-tab-strip-spacer'}, beforeEl);
        this.strip = new Element(this.stripWrap.dom.firstChild);

        
        this.edge = this.strip.createChild({tag:'li', cls:'x-tab-edge', cn: [{tag: 'span', cls: 'x-tab-strip-text', cn: '&#160;'}]});
        this.strip.createChild({cls:'x-clear'});

        this.body.addClass('x-tab-panel-body-'+this.tabPosition);

        
        if(!this.itemTpl){
            var tt = new Template(
                 '<li class="{cls}" id="{id}"><a class="x-tab-strip-close"></a>',
                 '<a class="x-tab-right" href="#"><em class="x-tab-left">',
                 '<span class="x-tab-strip-inner"><span class="x-tab-strip-text {iconCls}">{text}</span></span>',
                 '</em></a></li>'
            );
            tt.disableFormats = true;
            tt.compile();
            TabPanel.prototype.itemTpl = tt;
        }

        this.items.each(this.initTab, this);
    },

    
    afterRender : function(){
        TabPanel.superclass.afterRender.call(this);
        if(this.autoTabs){
            this.readTabs(false);
        }
        if(this.activeTab !== undefined){
            var item = Ext.isObject(this.activeTab) ? this.activeTab : this.items.get(this.activeTab);
            delete this.activeTab;
            this.setActiveTab(item);
        }
    },

    
    initEvents : function(){
        TabPanel.superclass.initEvents.call(this);
        this.mon(this.strip, {
            scope: this,
            mousedown: this.onStripMouseDown,
            contextmenu: this.onStripContextMenu
        });
        if(this.enableTabScroll){
            this.mon(this.strip, 'mousewheel', this.onWheel, this);
        }
    },

    
    findTargets : function(e){
        var item = null,
            itemEl = e.getTarget('li:not(.x-tab-edge)', this.strip);

        if(itemEl){
            item = this.getComponent(itemEl.id.split(this.idDelimiter)[1]);
            if(item.disabled){
                return {
                    close : null,
                    item : null,
                    el : null
                };
            }
        }
        return {
            close : e.getTarget('.x-tab-strip-close', this.strip),
            item : item,
            el : itemEl
        };
    },

    
    onStripMouseDown : function(e){
        if(e.button !== 0){
            return;
        }
        e.preventDefault();
        var t = this.findTargets(e);
        if(t.close){
            if (t.item.fireEvent('beforeclose', t.item) !== false) {
                t.item.fireEvent('close', t.item);
                this.remove(t.item);
            }
            return;
        }
        if(t.item && t.item != this.activeTab){
            this.setActiveTab(t.item);
        }
    },

    
    onStripContextMenu : function(e){
        e.preventDefault();
        var t = this.findTargets(e);
        if(t.item){
            this.fireEvent('contextmenu', this, t.item, e);
        }
    },

    
    readTabs : function(removeExisting){
        if(removeExisting === true){
            this.items.each(function(item){
                this.remove(item);
            }, this);
        }
        var tabs = this.el.query(this.autoTabSelector);
        for(var i = 0, len = tabs.length; i < len; i++){
            var tab = tabs[i],
                title = tab.getAttribute('title');
            tab.removeAttribute('title');
            this.add({
                title: title,
                contentEl: tab
            });
        }
    },

    
    initTab : function(item, index){
        var before = this.strip.dom.childNodes[index],
            p = this.getTemplateArgs(item),
            el = before ?
                 this.itemTpl.insertBefore(before, p) :
                 this.itemTpl.append(this.strip, p),
            cls = 'x-tab-strip-over',
            tabEl = Ext.get(el);

        tabEl.hover(function(){
            if(!item.disabled){
                tabEl.addClass(cls);
            }
        }, function(){
            tabEl.removeClass(cls);
        });

        if(item.tabTip){
            tabEl.child('span.x-tab-strip-text', true).qtip = item.tabTip;
        }
        item.tabEl = el;

        
        tabEl.select('a').on('click', function(e){
            if(!e.getPageX()){
                this.onStripMouseDown(e);
            }
        }, this, {preventDefault: true});

        item.on({
            scope: this,
            disable: this.onItemDisabled,
            enable: this.onItemEnabled,
            titlechange: this.onItemTitleChanged,
            iconchange: this.onItemIconChanged,
            beforeshow: this.onBeforeShowItem
        });
    },



    
    getTemplateArgs : function(item) {
        var cls = item.closable ? 'x-tab-strip-closable' : '';
        if(item.disabled){
            cls += ' x-item-disabled';
        }
        if(item.iconCls){
            cls += ' x-tab-with-icon';
        }
        if(item.tabCls){
            cls += ' ' + item.tabCls;
        }

        return {
            id: this.id + this.idDelimiter + item.getItemId(),
            text: item.title,
            cls: cls,
            iconCls: item.iconCls || ''
        };
    },

    
    onAdd : function(c){
        TabPanel.superclass.onAdd.call(this, c);
        if(this.rendered){
            var items = this.items;
            this.initTab(c, items.indexOf(c));
            this.delegateUpdates();
        }
    },

    
    onBeforeAdd : function(item){
        var existing = item.events ? (this.items.containsKey(item.getItemId()) ? item : null) : this.items.get(item);
        if(existing){
            this.setActiveTab(item);
            return false;
        }
        TabPanel.superclass.onBeforeAdd.apply(this, arguments);
        var es = item.elements;
        item.elements = es ? es.replace(',header', '') : es;
        item.border = (item.border === true);
    },

    
    onRemove : function(c){
        var te = Ext.get(c.tabEl);
        
        if(te){
            te.select('a').removeAllListeners();
            Ext.destroy(te);
        }
        TabPanel.superclass.onRemove.call(this, c);
        this.stack.remove(c);
        delete c.tabEl;
        c.un('disable', this.onItemDisabled, this);
        c.un('enable', this.onItemEnabled, this);
        c.un('titlechange', this.onItemTitleChanged, this);
        c.un('iconchange', this.onItemIconChanged, this);
        c.un('beforeshow', this.onBeforeShowItem, this);
        if(c == this.activeTab){
            var next = this.stack.next();
            if(next){
                this.setActiveTab(next);
            }else if(this.items.getCount() > 0){
                this.setActiveTab(0);
            }else{
                this.setActiveTab(null);
            }
        }
        if(!this.destroying){
            this.delegateUpdates();
        }
    },

    
    onBeforeShowItem : function(item){
        if(item != this.activeTab){
            this.setActiveTab(item);
            return false;
        }
    },

    
    onItemDisabled : function(item){
        var el = this.getTabEl(item);
        if(el){
            Ext.fly(el).addClass('x-item-disabled');
        }
        this.stack.remove(item);
    },

    
    onItemEnabled : function(item){
        var el = this.getTabEl(item);
        if(el){
            Ext.fly(el).removeClass('x-item-disabled');
        }
    },

    
    onItemTitleChanged : function(item){
        var el = this.getTabEl(item);
        if(el){
            Ext.fly(el).child('span.x-tab-strip-text', true).innerHTML = item.title;
        }
    },

    
    onItemIconChanged : function(item, iconCls, oldCls){
        var el = this.getTabEl(item);
        if(el){
            el = Ext.get(el);
            el.child('span.x-tab-strip-text').replaceClass(oldCls, iconCls);
            el[Ext.isEmpty(iconCls) ? 'removeClass' : 'addClass']('x-tab-with-icon');
        }
    },

    
    getTabEl : function(item){
        var c = this.getComponent(item);
        return c ? c.tabEl : null;
    },

    
    onResize : function(){
        TabPanel.superclass.onResize.apply(this, arguments);
        this.delegateUpdates();
    },

    
    beginUpdate : function(){
        this.suspendUpdates = true;
    },

    
    endUpdate : function(){
        this.suspendUpdates = false;
        this.delegateUpdates();
    },

    
    hideTabStripItem : function(item){
        item = this.getComponent(item);
        var el = this.getTabEl(item);
        if(el){
            el.style.display = 'none';
            this.delegateUpdates();
        }
        this.stack.remove(item);
    },

    
    unhideTabStripItem : function(item){
        item = this.getComponent(item);
        var el = this.getTabEl(item);
        if(el){
            el.style.display = '';
            this.delegateUpdates();
        }
    },

    
    delegateUpdates : function(){
        if(this.suspendUpdates){
            return;
        }
        if(this.resizeTabs && this.rendered){
            this.autoSizeTabs();
        }
        if(this.enableTabScroll && this.rendered){
            this.autoScrollTabs();
        }
    },

    
    autoSizeTabs : function(){
        var count = this.items.length,
            ce = this.tabPosition != 'bottom' ? 'header' : 'footer',
            ow = this[ce].dom.offsetWidth,
            aw = this[ce].dom.clientWidth;

        if(!this.resizeTabs || count < 1 || !aw){ 
            return;
        }

        var each = Math.max(Math.min(Math.floor((aw-4) / count) - this.tabMargin, this.tabWidth), this.minTabWidth); 
        this.lastTabWidth = each;
        var lis = this.strip.query('li:not(.x-tab-edge)');
        for(var i = 0, len = lis.length; i < len; i++) {
            var li = lis[i],
                inner = Ext.fly(li).child('.x-tab-strip-inner', true),
                tw = li.offsetWidth,
                iw = inner.offsetWidth;
            inner.style.width = (each - (tw-iw)) + 'px';
        }
    },

    
    adjustBodyWidth : function(w){
        if(this.header){
            this.header.setWidth(w);
        }
        if(this.footer){
            this.footer.setWidth(w);
        }
        return w;
    },

    
    setActiveTab : function(item){
        item = this.getComponent(item);
        if(this.fireEvent('beforetabchange', this, item, this.activeTab) === false){
            return;
        }
        if(!this.rendered){
            this.activeTab = item;
            return;
        }
        if(this.activeTab != item){
            if(this.activeTab){
                var oldEl = this.getTabEl(this.activeTab);
                if(oldEl){
                    Ext.fly(oldEl).removeClass('x-tab-strip-active');
                }
            }
            this.activeTab = item;
            if(item){
                var el = this.getTabEl(item);
                Ext.fly(el).addClass('x-tab-strip-active');
                this.stack.add(item);

                this.layout.setActiveItem(item);
                if(this.scrolling){
                    this.scrollToTab(item, this.animScroll);
                }
            }
            this.fireEvent('tabchange', this, item);
        }
    },

    
    getActiveTab : function(){
        return this.activeTab || null;
    },

    
    getItem : function(item){
        return this.getComponent(item);
    },

    
    autoScrollTabs : function(){
        this.pos = this.tabPosition=='bottom' ? this.footer : this.header;
        var count = this.items.length,
            ow = this.pos.dom.offsetWidth,
            tw = this.pos.dom.clientWidth,
            wrap = this.stripWrap,
            wd = wrap.dom,
            cw = wd.offsetWidth,
            pos = this.getScrollPos(),
            l = this.edge.getOffsetsTo(this.stripWrap)[0] + pos;

        if(!this.enableTabScroll || count < 1 || cw < 20){ 
            return;
        }
        if(l <= tw){
            wd.scrollLeft = 0;
            wrap.setWidth(tw);
            if(this.scrolling){
                this.scrolling = false;
                this.pos.removeClass('x-tab-scrolling');
                this.scrollLeft.hide();
                this.scrollRight.hide();
                
                if(Ext.isAir || Ext.isWebKit){
                    wd.style.marginLeft = '';
                    wd.style.marginRight = '';
                }
            }
        }else{
            if(!this.scrolling){
                this.pos.addClass('x-tab-scrolling');
                
                if(Ext.isAir || Ext.isWebKit){
                    wd.style.marginLeft = '18px';
                    wd.style.marginRight = '18px';
                }
            }
            tw -= wrap.getMargins('lr');
            wrap.setWidth(tw > 20 ? tw : 20);
            if(!this.scrolling){
                if(!this.scrollLeft){
                    this.createScrollers();
                }else{
                    this.scrollLeft.show();
                    this.scrollRight.show();
                }
            }
            this.scrolling = true;
            if(pos > (l-tw)){ 
                wd.scrollLeft = l-tw;
            }else{ 
                this.scrollToTab(this.activeTab, false);
            }
            this.updateScrollButtons();
        }
    },

    
    createScrollers : function(){
        this.pos.addClass('x-tab-scrolling-' + this.tabPosition);
        var h = this.stripWrap.dom.offsetHeight;
        var sl = this.pos.insertFirst({
            cls:'x-tab-scroller-left'
        });
        sl.setHeight(h);
        sl.addClassOnOver('x-tab-scroller-left-over');
        this.leftRepeater = new ClickRepeater(sl, {
            interval : this.scrollRepeatInterval,
            handler: this.onScrollLeft,
            scope: this
        });
        this.scrollLeft = sl;

        
        var sr = this.pos.insertFirst({
            cls:'x-tab-scroller-right'
        });
        sr.setHeight(h);
        sr.addClassOnOver('x-tab-scroller-right-over');
        this.rightRepeater = new ClickRepeater(sr, {
            interval : this.scrollRepeatInterval,
            handler: this.onScrollRight,
            scope: this
        });
        this.scrollRight = sr;
    },

    
    getScrollWidth : function(){
        return this.edge.getOffsetsTo(this.stripWrap)[0] + this.getScrollPos();
    },

    
    getScrollPos : function(){
        return parseInt(this.stripWrap.dom.scrollLeft, 10) || 0;
    },

    
    getScrollArea : function(){
        return parseInt(this.stripWrap.dom.clientWidth, 10) || 0;
    },

    
    getScrollAnim : function(){
        return {duration:this.scrollDuration, callback: this.updateScrollButtons, scope: this};
    },

    
    getScrollIncrement : function(){
        return this.scrollIncrement || (this.resizeTabs ? this.lastTabWidth+2 : 100);
    },

    

    scrollToTab : function(item, animate){
        if(!item){
            return;
        }
        var el = this.getTabEl(item),
            pos = this.getScrollPos(),
            area = this.getScrollArea(),
            left = Ext.fly(el).getOffsetsTo(this.stripWrap)[0] + pos,
            right = left + el.offsetWidth;
        if(left < pos){
            this.scrollTo(left, animate);
        }else if(right > (pos + area)){
            this.scrollTo(right - area, animate);
        }
    },

    
    scrollTo : function(pos, animate){
        this.stripWrap.scrollTo('left', pos, animate ? this.getScrollAnim() : false);
        if(!animate){
            this.updateScrollButtons();
        }
    },

    onWheel : function(e){
        var d = e.getWheelDelta()*this.wheelIncrement*-1;
        e.stopEvent();

        var pos = this.getScrollPos(),
            newpos = pos + d,
            sw = this.getScrollWidth()-this.getScrollArea();

        var s = Math.max(0, Math.min(sw, newpos));
        if(s != pos){
            this.scrollTo(s, false);
        }
    },

    
    onScrollRight : function(){
        var sw = this.getScrollWidth()-this.getScrollArea(),
            pos = this.getScrollPos(),
            s = Math.min(sw, pos + this.getScrollIncrement());
        if(s != pos){
            this.scrollTo(s, this.animScroll);
        }
    },

    
    onScrollLeft : function(){
        var pos = this.getScrollPos(),
            s = Math.max(0, pos - this.getScrollIncrement());
        if(s != pos){
            this.scrollTo(s, this.animScroll);
        }
    },

    
    updateScrollButtons : function(){
        var pos = this.getScrollPos();
        this.scrollLeft[pos === 0 ? 'addClass' : 'removeClass']('x-tab-scroller-left-disabled');
        this.scrollRight[pos >= (this.getScrollWidth()-this.getScrollArea()) ? 'addClass' : 'removeClass']('x-tab-scroller-right-disabled');
    },

    
    beforeDestroy : function() {
        Ext.destroy(this.leftRepeater, this.rightRepeater);
        this.deleteMembers('strip', 'edge', 'scrollLeft', 'scrollRight', 'stripWrap');
        this.activeTab = null;
        TabPanel.superclass.beforeDestroy.apply(this);
    }
});
Ext.reg('tabpanel', TabPanel);
TabPanel.prototype.activate = TabPanel.prototype.setActiveTab;

TabPanel.AccessStack = function(){
    var items = [];
    return {
        add : function(item){
            items.push(item);
            if(items.length > 10){
                items.shift();
            }
        },

        remove : function(item){
            var s = [];
            for(var i = 0, len = items.length; i < len; i++) {
                if(items[i] != item){
                    s.push(items[i]);
                }
            }
            items = s;
        },

        next : function(){
            return items.pop();
        }
    };
};

export default TabPanel;