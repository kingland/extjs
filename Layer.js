import Ext from './Base';
import DomHelper from './DomHelper';
import Element from './Element';
import Shadow from './Shadow';

//(function(){
var Layer = function(config, existingEl){
    config = config || {};
    var dh = DomHelper;
    var cp = config.parentEl, pel = cp ? Ext.getDom(cp) : document.body;
    if(existingEl){
        this.dom = Ext.getDom(existingEl);
    }
    if(!this.dom){
        var o = config.dh || {tag: 'div', cls: 'x-layer'};
        this.dom = dh.append(pel, o);
    }
    if(config.cls){
        this.addClass(config.cls);
    }
    this.constrain = config.constrain !== false;
    this.setVisibilityMode(Element.VISIBILITY);
    if(config.id){
        this.id = this.dom.id = config.id;
    }else{
        this.id = Ext.id(this.dom);
    }
    this.zindex = config.zindex || this.getZIndex();
    this.position('absolute', this.zindex);
    if(config.shadow){
        this.shadowOffset = config.shadowOffset || 4;
        this.shadow = new Shadow({
            offset : this.shadowOffset,
            mode : config.shadow
        });
    }else{
        this.shadowOffset = 0;
    }
    this.useShim = config.shim !== false && Ext.useShims;
    this.useDisplay = config.useDisplay;
    this.hide();
};

var supr = Element.prototype;


var shims = [];

Ext.extend(Layer, Element, {

    getZIndex : function(){
        return this.zindex || parseInt((this.getShim() || this).getStyle('z-index'), 10) || 11000;
    },

    getShim : function(){
        if(!this.useShim){
            return null;
        }
        if(this.shim){
            return this.shim;
        }
        var shim = shims.shift();
        if(!shim){
            shim = this.createShim();
            shim.enableDisplayMode('block');
            shim.dom.style.display = 'none';
            shim.dom.style.visibility = 'visible';
        }
        var pn = this.dom.parentNode;
        if(shim.dom.parentNode != pn){
            pn.insertBefore(shim.dom, this.dom);
        }
        shim.setStyle('z-index', this.getZIndex()-2);
        this.shim = shim;
        return shim;
    },

    hideShim : function(){
        if(this.shim){
            this.shim.setDisplayed(false);
            shims.push(this.shim);
            delete this.shim;
        }
    },

    disableShadow : function(){
        if(this.shadow){
            this.shadowDisabled = true;
            this.shadow.hide();
            this.lastShadowOffset = this.shadowOffset;
            this.shadowOffset = 0;
        }
    },

    enableShadow : function(show){
        if(this.shadow){
            this.shadowDisabled = false;
            this.shadowOffset = this.lastShadowOffset;
            delete this.lastShadowOffset;
            if(show){
                this.sync(true);
            }
        }
    },

    
    
    
    sync : function(doShow){
        var shadow = this.shadow;
        if(!this.updating && this.isVisible() && (shadow || this.useShim)){
            var shim = this.getShim(),
                w = this.getWidth(),
                h = this.getHeight(),
                l = this.getLeft(true),
                t = this.getTop(true);

            if(shadow && !this.shadowDisabled){
                if(doShow && !shadow.isVisible()){
                    shadow.show(this);
                }else{
                    shadow.realign(l, t, w, h);
                }
                if(shim){
                    if(doShow){
                       shim.show();
                    }
                    
                    var shadowAdj = shadow.el.getXY(), shimStyle = shim.dom.style,
                        shadowSize = shadow.el.getSize();
                    shimStyle.left = (shadowAdj[0])+'px';
                    shimStyle.top = (shadowAdj[1])+'px';
                    shimStyle.width = (shadowSize.width)+'px';
                    shimStyle.height = (shadowSize.height)+'px';
                }
            }else if(shim){
                if(doShow){
                   shim.show();
                }
                shim.setSize(w, h);
                shim.setLeftTop(l, t);
            }
        }
    },

    
    destroy : function(){
        this.hideShim();
        if(this.shadow){
            this.shadow.hide();
        }
        this.removeAllListeners();
        Ext.removeNode(this.dom);
        delete this.dom;
    },

    remove : function(){
        this.destroy();
    },

    
    beginUpdate : function(){
        this.updating = true;
    },

    
    endUpdate : function(){
        this.updating = false;
        this.sync(true);
    },

    
    hideUnders : function(negOffset){
        if(this.shadow){
            this.shadow.hide();
        }
        this.hideShim();
    },

    
    constrainXY : function(){
        if(this.constrain){
            var vw = Ext.lib.Dom.getViewWidth(),
                vh = Ext.lib.Dom.getViewHeight();
            var s = Ext.getDoc().getScroll();

            var xy = this.getXY();
            var x = xy[0], y = xy[1];
            var so = this.shadowOffset;
            var w = this.dom.offsetWidth+so, h = this.dom.offsetHeight+so;
            
            var moved = false;
            
            if((x + w) > vw+s.left){
                x = vw - w - so;
                moved = true;
            }
            if((y + h) > vh+s.top){
                y = vh - h - so;
                moved = true;
            }
            
            if(x < s.left){
                x = s.left;
                moved = true;
            }
            if(y < s.top){
                y = s.top;
                moved = true;
            }
            if(moved){
                if(this.avoidY){
                    var ay = this.avoidY;
                    if(y <= ay && (y+h) >= ay){
                        y = ay-h-5;
                    }
                }
                xy = [x, y];
                this.storeXY(xy);
                supr.setXY.call(this, xy);
                this.sync();
            }
        }
        return this;
    },

    isVisible : function(){
        return this.visible;
    },

    
    showAction : function(){
        this.visible = true; 
        if(this.useDisplay === true){
            this.setDisplayed('');
        }else if(this.lastXY){
            supr.setXY.call(this, this.lastXY);
        }else if(this.lastLT){
            supr.setLeftTop.call(this, this.lastLT[0], this.lastLT[1]);
        }
    },

    
    hideAction : function(){
        this.visible = false;
        if(this.useDisplay === true){
            this.setDisplayed(false);
        }else{
            this.setLeftTop(-10000,-10000);
        }
    },

    
    setVisible : function(v, a, d, c, e){
        if(v){
            this.showAction();
        }
        if(a && v){
            var cb = function(){
                this.sync(true);
                if(c){
                    c();
                }
            }.createDelegate(this);
            supr.setVisible.call(this, true, true, d, cb, e);
        }else{
            if(!v){
                this.hideUnders(true);
            }
            var cb = c;
            if(a){
                cb = function(){
                    this.hideAction();
                    if(c){
                        c();
                    }
                }.createDelegate(this);
            }
            supr.setVisible.call(this, v, a, d, cb, e);
            if(v){
                this.sync(true);
            }else if(!a){
                this.hideAction();
            }
        }
        return this;
    },

    storeXY : function(xy){
        delete this.lastLT;
        this.lastXY = xy;
    },

    storeLeftTop : function(left, top){
        delete this.lastXY;
        this.lastLT = [left, top];
    },

    
    beforeFx : function(){
        this.beforeAction();
        return Layer.superclass.beforeFx.apply(this, arguments);
    },

    
    afterFx : function(){
        Layer.superclass.afterFx.apply(this, arguments);
        this.sync(this.isVisible());
    },

    
    beforeAction : function(){
        if(!this.updating && this.shadow){
            this.shadow.hide();
        }
    },

    
    setLeft : function(left){
        this.storeLeftTop(left, this.getTop(true));
        supr.setLeft.apply(this, arguments);
        this.sync();
        return this;
    },

    setTop : function(top){
        this.storeLeftTop(this.getLeft(true), top);
        supr.setTop.apply(this, arguments);
        this.sync();
        return this;
    },

    setLeftTop : function(left, top){
        this.storeLeftTop(left, top);
        supr.setLeftTop.apply(this, arguments);
        this.sync();
        return this;
    },

    setXY : function(xy, a, d, c, e){
        this.fixDisplay();
        this.beforeAction();
        this.storeXY(xy);
        var cb = this.createCB(c);
        supr.setXY.call(this, xy, a, d, cb, e);
        if(!a){
            cb();
        }
        return this;
    },

    
    createCB : function(c){
        var el = this;
        return function(){
            el.constrainXY();
            el.sync(true);
            if(c){
                c();
            }
        };
    },

    
    setX : function(x, a, d, c, e){
        this.setXY([x, this.getY()], a, d, c, e);
        return this;
    },

    
    setY : function(y, a, d, c, e){
        this.setXY([this.getX(), y], a, d, c, e);
        return this;
    },

    
    setSize : function(w, h, a, d, c, e){
        this.beforeAction();
        var cb = this.createCB(c);
        supr.setSize.call(this, w, h, a, d, cb, e);
        if(!a){
            cb();
        }
        return this;
    },

    
    setWidth : function(w, a, d, c, e){
        this.beforeAction();
        var cb = this.createCB(c);
        supr.setWidth.call(this, w, a, d, cb, e);
        if(!a){
            cb();
        }
        return this;
    },

    
    setHeight : function(h, a, d, c, e){
        this.beforeAction();
        var cb = this.createCB(c);
        supr.setHeight.call(this, h, a, d, cb, e);
        if(!a){
            cb();
        }
        return this;
    },

    
    setBounds : function(x, y, w, h, a, d, c, e){
        this.beforeAction();
        var cb = this.createCB(c);
        if(!a){
            this.storeXY([x, y]);
            supr.setXY.call(this, [x, y]);
            supr.setSize.call(this, w, h, a, d, cb, e);
            cb();
        }else{
            supr.setBounds.call(this, x, y, w, h, a, d, cb, e);
        }
        return this;
    },

    
    setZIndex : function(zindex){
        this.zindex = zindex;
        this.setStyle('z-index', zindex + 2);
        if(this.shadow){
            this.shadow.setZIndex(zindex + 1);
        }
        if(this.shim){
            this.shim.setStyle('z-index', zindex);
        }
        return this;
    }
});
//})();

export default Layer;