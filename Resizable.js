import Ext from './Base';
import Observable from './util/Observable';
import DomHelper from './DomHelper';

var Resizable = Ext.extend(Observable, {

    constructor: function(el, config){
        this.el = Ext.get(el);
        if(config && config.wrap){
            config.resizeChild = this.el;
            this.el = this.el.wrap(typeof config.wrap == 'object' ? config.wrap : {cls:'xresizable-wrap'});
            this.el.id = this.el.dom.id = config.resizeChild.id + '-rzwrap';
            this.el.setStyle('overflow', 'hidden');
            this.el.setPositioning(config.resizeChild.getPositioning());
            config.resizeChild.clearPositioning();
            if(!config.width || !config.height){
                var csize = config.resizeChild.getSize();
                this.el.setSize(csize.width, csize.height);
            }
            if(config.pinned && !config.adjustments){
                config.adjustments = 'auto';
            }
        }

        
        this.proxy = this.el.createProxy({tag: 'div', cls: 'x-resizable-proxy', id: this.el.id + '-rzproxy'}, Ext.getBody());
        this.proxy.unselectable();
        this.proxy.enableDisplayMode('block');

        Ext.apply(this, config);

        if(this.pinned){
            this.disableTrackOver = true;
            this.el.addClass('x-resizable-pinned');
        }
        
        var position = this.el.getStyle('position');
        if(position != 'absolute' && position != 'fixed'){
            this.el.setStyle('position', 'relative');
        }
        if(!this.handles){ 
            this.handles = 's,e,se';
            if(this.multiDirectional){
                this.handles += ',n,w';
            }
        }
        if(this.handles == 'all'){
            this.handles = 'n s e w ne nw se sw';
        }
        var hs = this.handles.split(/\s*?[,;]\s*?| /);
        var ps = Resizable.positions;
        for(var i = 0, len = hs.length; i < len; i++){
            if(hs[i] && ps[hs[i]]){
                var pos = ps[hs[i]];
                this[pos] = new Resizable.Handle(this, pos, this.disableTrackOver, this.transparent, this.handleCls);
            }
        }
        
        this.corner = this.southeast;

        if(this.handles.indexOf('n') != -1 || this.handles.indexOf('w') != -1){
            this.updateBox = true;
        }

        this.activeHandle = null;

        if(this.resizeChild){
            if(typeof this.resizeChild == 'boolean'){
                this.resizeChild = Ext.get(this.el.dom.firstChild, true);
            }else{
                this.resizeChild = Ext.get(this.resizeChild, true);
            }
        }

        if(this.adjustments == 'auto'){
            var rc = this.resizeChild;
            var hw = this.west, he = this.east, hn = this.north, hs = this.south;
            if(rc && (hw || hn)){
                rc.position('relative');
                rc.setLeft(hw ? hw.el.getWidth() : 0);
                rc.setTop(hn ? hn.el.getHeight() : 0);
            }
            this.adjustments = [
                (he ? -he.el.getWidth() : 0) + (hw ? -hw.el.getWidth() : 0),
                (hn ? -hn.el.getHeight() : 0) + (hs ? -hs.el.getHeight() : 0) -1
            ];
        }

        if(this.draggable){
            this.dd = this.dynamic ?
                this.el.initDD(null) : this.el.initDDProxy(null, {dragElId: this.proxy.id});
            this.dd.setHandleElId(this.resizeChild ? this.resizeChild.id : this.el.id);
            if(this.constrainTo){
                this.dd.constrainTo(this.constrainTo);
            }
        }

        this.addEvents(
            
            'beforeresize',
            
            'resize'
        );

        if(this.width !== null && this.height !== null){
            this.resizeTo(this.width, this.height);
        }else{
            this.updateChildSize();
        }
        if(Ext.isIE){
            this.el.dom.style.zoom = 1;
        }
        Resizable.superclass.constructor.call(this);
    },

    
    adjustments : [0, 0],
    
    animate : false,
    
    
    disableTrackOver : false,
    
    draggable: false,
    
    duration : 0.35,
    
    dynamic : false,
    
    easing : 'easeOutStrong',
    
    enabled : true,
    
    
    handles : false,
    
    multiDirectional : false,
    
    height : null,
    
    width : null,
    
    heightIncrement : 0,
    
    widthIncrement : 0,
    
    minHeight : 5,
    
    minWidth : 5,
    
    maxHeight : 10000,
    
    maxWidth : 10000,
    
    minX: 0,
    
    minY: 0,
    
    pinned : false,
    
    preserveRatio : false,
    
    resizeChild : false,
    
    transparent: false,
    
    
    


    
    resizeTo : function(width, height){
        this.el.setSize(width, height);
        this.updateChildSize();
        this.fireEvent('resize', this, width, height, null);
    },

    
    startSizing : function(e, handle){
        this.fireEvent('beforeresize', this, e);
        if(this.enabled){ 

            if(!this.overlay){
                this.overlay = this.el.createProxy({tag: 'div', cls: 'x-resizable-overlay', html: '&#160;'}, Ext.getBody());
                this.overlay.unselectable();
                this.overlay.enableDisplayMode('block');
                this.overlay.on({
                    scope: this,
                    mousemove: this.onMouseMove,
                    mouseup: this.onMouseUp
                });
            }
            this.overlay.setStyle('cursor', handle.el.getStyle('cursor'));

            this.resizing = true;
            this.startBox = this.el.getBox();
            this.startPoint = e.getXY();
            this.offsets = [(this.startBox.x + this.startBox.width) - this.startPoint[0],
                            (this.startBox.y + this.startBox.height) - this.startPoint[1]];

            this.overlay.setSize(Ext.lib.Dom.getViewWidth(true), Ext.lib.Dom.getViewHeight(true));
            this.overlay.show();

            if(this.constrainTo) {
                var ct = Ext.get(this.constrainTo);
                this.resizeRegion = ct.getRegion().adjust(
                    ct.getFrameWidth('t'),
                    ct.getFrameWidth('l'),
                    -ct.getFrameWidth('b'),
                    -ct.getFrameWidth('r')
                );
            }

            this.proxy.setStyle('visibility', 'hidden'); 
            this.proxy.show();
            this.proxy.setBox(this.startBox);
            if(!this.dynamic){
                this.proxy.setStyle('visibility', 'visible');
            }
        }
    },

    
    onMouseDown : function(handle, e){
        if(this.enabled){
            e.stopEvent();
            this.activeHandle = handle;
            this.startSizing(e, handle);
        }
    },

    
    onMouseUp : function(e){
        this.activeHandle = null;
        var size = this.resizeElement();
        this.resizing = false;
        this.handleOut();
        this.overlay.hide();
        this.proxy.hide();
        this.fireEvent('resize', this, size.width, size.height, e);
    },

    
    updateChildSize : function(){
        if(this.resizeChild){
            var el = this.el;
            var child = this.resizeChild;
            var adj = this.adjustments;
            if(el.dom.offsetWidth){
                var b = el.getSize(true);
                child.setSize(b.width+adj[0], b.height+adj[1]);
            }
            
            
            
            
            if(Ext.isIE){
                setTimeout(function(){
                    if(el.dom.offsetWidth){
                        var b = el.getSize(true);
                        child.setSize(b.width+adj[0], b.height+adj[1]);
                    }
                }, 10);
            }
        }
    },

    
    snap : function(value, inc, min){
        if(!inc || !value){
            return value;
        }
        var newValue = value;
        var m = value % inc;
        if(m > 0){
            if(m > (inc/2)){
                newValue = value + (inc-m);
            }else{
                newValue = value - m;
            }
        }
        return Math.max(min, newValue);
    },

    
    resizeElement : function(){
        var box = this.proxy.getBox();
        if(this.updateBox){
            this.el.setBox(box, false, this.animate, this.duration, null, this.easing);
        }else{
            this.el.setSize(box.width, box.height, this.animate, this.duration, null, this.easing);
        }
        this.updateChildSize();
        if(!this.dynamic){
            this.proxy.hide();
        }
        if(this.draggable && this.constrainTo){
            this.dd.resetConstraints();
            this.dd.constrainTo(this.constrainTo);
        }
        return box;
    },

    
    constrain : function(v, diff, m, mx){
        if(v - diff < m){
            diff = v - m;
        }else if(v - diff > mx){
            diff = v - mx;
        }
        return diff;
    },

    
    onMouseMove : function(e){
        if(this.enabled && this.activeHandle){
            try{

            if(this.resizeRegion && !this.resizeRegion.contains(e.getPoint())) {
                return;
            }

            
            var curSize = this.curSize || this.startBox,
                x = this.startBox.x, y = this.startBox.y,
                ox = x,
                oy = y,
                w = curSize.width,
                h = curSize.height,
                ow = w,
                oh = h,
                mw = this.minWidth,
                mh = this.minHeight,
                mxw = this.maxWidth,
                mxh = this.maxHeight,
                wi = this.widthIncrement,
                hi = this.heightIncrement,
                eventXY = e.getXY(),
                diffX = -(this.startPoint[0] - Math.max(this.minX, eventXY[0])),
                diffY = -(this.startPoint[1] - Math.max(this.minY, eventXY[1])),
                pos = this.activeHandle.position,
                tw,
                th;

            switch(pos){
                case 'east':
                    w += diffX;
                    w = Math.min(Math.max(mw, w), mxw);
                    break;
                case 'south':
                    h += diffY;
                    h = Math.min(Math.max(mh, h), mxh);
                    break;
                case 'southeast':
                    w += diffX;
                    h += diffY;
                    w = Math.min(Math.max(mw, w), mxw);
                    h = Math.min(Math.max(mh, h), mxh);
                    break;
                case 'north':
                    diffY = this.constrain(h, diffY, mh, mxh);
                    y += diffY;
                    h -= diffY;
                    break;
                case 'west':
                    diffX = this.constrain(w, diffX, mw, mxw);
                    x += diffX;
                    w -= diffX;
                    break;
                case 'northeast':
                    w += diffX;
                    w = Math.min(Math.max(mw, w), mxw);
                    diffY = this.constrain(h, diffY, mh, mxh);
                    y += diffY;
                    h -= diffY;
                    break;
                case 'northwest':
                    diffX = this.constrain(w, diffX, mw, mxw);
                    diffY = this.constrain(h, diffY, mh, mxh);
                    y += diffY;
                    h -= diffY;
                    x += diffX;
                    w -= diffX;
                    break;
               case 'southwest':
                    diffX = this.constrain(w, diffX, mw, mxw);
                    h += diffY;
                    h = Math.min(Math.max(mh, h), mxh);
                    x += diffX;
                    w -= diffX;
                    break;
            }

            var sw = this.snap(w, wi, mw);
            var sh = this.snap(h, hi, mh);
            if(sw != w || sh != h){
                switch(pos){
                    case 'northeast':
                        y -= sh - h;
                    break;
                    case 'north':
                        y -= sh - h;
                        break;
                    case 'southwest':
                        x -= sw - w;
                    break;
                    case 'west':
                        x -= sw - w;
                        break;
                    case 'northwest':
                        x -= sw - w;
                        y -= sh - h;
                    break;
                }
                w = sw;
                h = sh;
            }

            if(this.preserveRatio){
                switch(pos){
                    case 'southeast':
                    case 'east':
                        h = oh * (w/ow);
                        h = Math.min(Math.max(mh, h), mxh);
                        w = ow * (h/oh);
                       break;
                    case 'south':
                        w = ow * (h/oh);
                        w = Math.min(Math.max(mw, w), mxw);
                        h = oh * (w/ow);
                        break;
                    case 'northeast':
                        w = ow * (h/oh);
                        w = Math.min(Math.max(mw, w), mxw);
                        h = oh * (w/ow);
                    break;
                    case 'north':
                        tw = w;
                        w = ow * (h/oh);
                        w = Math.min(Math.max(mw, w), mxw);
                        h = oh * (w/ow);
                        x += (tw - w) / 2;
                        break;
                    case 'southwest':
                        h = oh * (w/ow);
                        h = Math.min(Math.max(mh, h), mxh);
                        tw = w;
                        w = ow * (h/oh);
                        x += tw - w;
                        break;
                    case 'west':
                        th = h;
                        h = oh * (w/ow);
                        h = Math.min(Math.max(mh, h), mxh);
                        y += (th - h) / 2;
                        tw = w;
                        w = ow * (h/oh);
                        x += tw - w;
                       break;
                    case 'northwest':
                        tw = w;
                        th = h;
                        h = oh * (w/ow);
                        h = Math.min(Math.max(mh, h), mxh);
                        w = ow * (h/oh);
                        y += th - h;
                        x += tw - w;
                        break;

                }
            }
            this.proxy.setBounds(x, y, w, h);
            if(this.dynamic){
                this.resizeElement();
            }
            }catch(ex){}
        }
    },

    
    handleOver : function(){
        if(this.enabled){
            this.el.addClass('x-resizable-over');
        }
    },

    
    handleOut : function(){
        if(!this.resizing){
            this.el.removeClass('x-resizable-over');
        }
    },

    
    getEl : function(){
        return this.el;
    },

    
    getResizeChild : function(){
        return this.resizeChild;
    },

    
    destroy : function(removeEl){
        Ext.destroy(this.dd, this.overlay, this.proxy);
        this.overlay = null;
        this.proxy = null;

        var ps = Resizable.positions;
        for(var k in ps){
            if(typeof ps[k] != 'function' && this[ps[k]]){
                this[ps[k]].destroy();
            }
        }
        if(removeEl){
            this.el.update('');
            Ext.destroy(this.el);
            this.el = null;
        }
        this.purgeListeners();
    },

    syncHandleHeight : function(){
        var h = this.el.getHeight(true);
        if(this.west){
            this.west.el.setHeight(h);
        }
        if(this.east){
            this.east.el.setHeight(h);
        }
    }
});

Resizable.positions = {
    n: 'north', s: 'south', e: 'east', w: 'west', se: 'southeast', sw: 'southwest', nw: 'northwest', ne: 'northeast'
};


Resizable.Handle = Ext.extend(Object, {
    constructor : function(rz, pos, disableTrackOver, transparent, cls){
       if(!this.tpl){
            
            var tpl = DomHelper.createTemplate(
                {tag: 'div', cls: 'x-resizable-handle x-resizable-handle-{0}'}
            );
            tpl.compile();
            Resizable.Handle.prototype.tpl = tpl;
        }
        this.position = pos;
        this.rz = rz;
        this.el = this.tpl.append(rz.el.dom, [this.position], true);
        this.el.unselectable();
        if(transparent){
            this.el.setOpacity(0);
        }
        if(!Ext.isEmpty(cls)){
            this.el.addClass(cls);
        }
        this.el.on('mousedown', this.onMouseDown, this);
        if(!disableTrackOver){
            this.el.on({
                scope: this,
                mouseover: this.onMouseOver,
                mouseout: this.onMouseOut
            });
        }
    },

    
    afterResize : function(rz){
        
    },
    
    onMouseDown : function(e){
        this.rz.onMouseDown(this, e);
    },
    
    onMouseOver : function(e){
        this.rz.handleOver(this, e);
    },
    
    onMouseOut : function(e){
        this.rz.handleOut(this, e);
    },
    
    destroy : function(){
        Ext.destroy(this.el);
        this.el = null;
    }
});

export default Resizable;