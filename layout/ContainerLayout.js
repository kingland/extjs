import Ext from '../Base';
import Template from '../Template';
import DelayedTask from '../util/DelayedTask';

var ContainerLayout = Ext.extend(Object, {
    
    monitorResize:false,
    
    activeItem : null,

    constructor : function(config){
        this.id = Ext.id(null, 'ext-layout-');
        Ext.apply(this, config);
    },

    type: 'container',

    
    IEMeasureHack : function(target, viewFlag) {
        var tChildren = target.dom.childNodes, tLen = tChildren.length, c, d = [], e, i, ret;
        for (i = 0 ; i < tLen ; i++) {
            c = tChildren[i];
            e = Ext.get(c);
            if (e) {
                d[i] = e.getStyle('display');
                e.setStyle({display: 'none'});
            }
        }
        ret = target ? target.getViewSize(viewFlag) : {};
        for (i = 0 ; i < tLen ; i++) {
            c = tChildren[i];
            e = Ext.get(c);
            if (e) {
                e.setStyle({display: d[i]});
            }
        }
        return ret;
    },

    
    getLayoutTargetSize : Ext.EmptyFn,

    
    layout : function(){
        var ct = this.container, target = ct.getLayoutTarget();
        if(!(this.hasLayout || Ext.isEmpty(this.targetCls))){
            target.addClass(this.targetCls);
        }
        this.onLayout(ct, target);
        ct.fireEvent('afterlayout', ct, this);
    },

    
    onLayout : function(ct, target){
        this.renderAll(ct, target);
    },

    
    isValidParent : function(c, target){
        return target && c.getPositionEl().dom.parentNode == (target.dom || target);
    },

    
    renderAll : function(ct, target){
        var items = ct.items.items, i, c, len = items.length;
        for(i = 0; i < len; i++) {
            c = items[i];
            if(c && (!c.rendered || !this.isValidParent(c, target))){
                this.renderItem(c, i, target);
            }
        }
    },

    
    renderItem : function(c, position, target){
        if (c) {
            if (!c.rendered) {
                c.render(target, position);
                this.configureItem(c, position);
            } else if (!this.isValidParent(c, target)) {
                if (Ext.isNumber(position)) {
                    position = target.dom.childNodes[position];
                }
                
                target.dom.insertBefore(c.getPositionEl().dom, position || null);
                c.container = target;
                this.configureItem(c, position);
            }
        }
    },

    
    
    getRenderedItems: function(ct){
        var t = ct.getLayoutTarget(), cti = ct.items.items, len = cti.length, i, c, items = [];
        for (i = 0; i < len; i++) {
            if((c = cti[i]).rendered && this.isValidParent(c, t)){
                items.push(c);
            }
        };
        return items;
    },

    
    configureItem: function(c, position){
        if (this.extraCls) {
            var t = c.getPositionEl ? c.getPositionEl() : c;
            t.addClass(this.extraCls);
        }
        
        
        if (c.doLayout && this.forceLayout) {
            c.doLayout();
        }
        if (this.renderHidden && c != this.activeItem) {
            c.hide();
        }
    },

    onRemove: function(c){
        if(this.activeItem == c){
            delete this.activeItem;
        }
        if(c.rendered && this.extraCls){
            var t = c.getPositionEl ? c.getPositionEl() : c;
            t.removeClass(this.extraCls);
        }
    },

    afterRemove: function(c){
        if(c.removeRestore){
            c.removeMode = 'container';
            delete c.removeRestore;
        }
    },

    
    onResize: function(){
        var ct = this.container,
            b;
        if(ct.collapsed){
            return;
        }
        if(b = ct.bufferResize && ct.shouldBufferLayout()){
            if(!this.resizeTask){
                this.resizeTask = new DelayedTask(this.runLayout, this);
                this.resizeBuffer = Ext.isNumber(b) ? b : 50;
            }
            ct.layoutPending = true;
            this.resizeTask.delay(this.resizeBuffer);
        }else{
            this.runLayout();
        }
    },

    runLayout: function(){
        var ct = this.container;
        this.layout();
        ct.onLayout();
        delete ct.layoutPending;
    },

    
    setContainer : function(ct){
        
        if(this.monitorResize && ct != this.container){
            var old = this.container;
            if(old){
                old.un(old.resizeEvent, this.onResize, this);
            }
            if(ct){
                ct.on(ct.resizeEvent, this.onResize, this);
            }
        }
        this.container = ct;
    },

    
    parseMargins : function(v){
        if (Ext.isNumber(v)) {
            v = v.toString();
        }
        var ms  = v.split(' '),
            len = ms.length;
            
        if (len == 1) {
            ms[1] = ms[2] = ms[3] = ms[0];
        } else if(len == 2) {
            ms[2] = ms[0];
            ms[3] = ms[1];
        } else if(len == 3) {
            ms[3] = ms[1];
        }
        
        return {
            top   :parseInt(ms[0], 10) || 0,
            right :parseInt(ms[1], 10) || 0,
            bottom:parseInt(ms[2], 10) || 0,
            left  :parseInt(ms[3], 10) || 0
        };
    },

    
    fieldTpl: (function() {
        var t = new Template(
            '<div class="x-form-item {itemCls}" tabIndex="-1">',
                '<label for="{id}" style="{labelStyle}" class="x-form-item-label">{label}{labelSeparator}</label>',
                '<div class="x-form-element" id="x-form-el-{id}" style="{elementStyle}">',
                '</div><div class="{clearCls}"></div>',
            '</div>'
        );
        t.disableFormats = true;
        return t.compile();
    })(),

    
    destroy : function(){
        
        if(this.resizeTask && this.resizeTask.cancel){
            this.resizeTask.cancel();
        }
        if(!Ext.isEmpty(this.targetCls)){
            var target = this.container.getLayoutTarget();
            if(target){
                target.removeClass(this.targetCls);
            }
        }
    }
});

export default ContainerLayout;