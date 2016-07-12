import Ext from './Base';
import Tip from './Tip';

var ToolTip = Ext.extend(Tip, {
    
    showDelay : 500,
    
    hideDelay : 200,
    
    dismissDelay : 5000,    
    
    trackMouse : false,
    
    anchorToTarget : true,
    
    anchorOffset : 0,
    
    targetCounter : 0,

    constrainPosition : false,

    
    initComponent : function(){
        ToolTip.superclass.initComponent.call(this);
        this.lastActive = new Date();
        this.initTarget(this.target);
        this.origAnchor = this.anchor;
    },

    
    onRender : function(ct, position){
        ToolTip.superclass.onRender.call(this, ct, position);
        this.anchorCls = 'x-tip-anchor-' + this.getAnchorPosition();
        this.anchorEl = this.el.createChild({
            cls: 'x-tip-anchor ' + this.anchorCls
        });
    },

    
    afterRender : function(){
        ToolTip.superclass.afterRender.call(this);
        this.anchorEl.setStyle('z-index', this.el.getZIndex() + 1);
    },

    
    initTarget : function(target){
        var t;
        if((t = Ext.get(target))){
            if(this.target){
                var tg = Ext.get(this.target);
                this.mun(tg, 'mouseover', this.onTargetOver, this);
                this.mun(tg, 'mouseout', this.onTargetOut, this);
                this.mun(tg, 'mousemove', this.onMouseMove, this);
            }
            this.mon(t, {
                mouseover: this.onTargetOver,
                mouseout: this.onTargetOut,
                mousemove: this.onMouseMove,
                scope: this
            });
            this.target = t;
        }
        if(this.anchor){
            this.anchorTarget = this.target;
        }
    },

    
    onMouseMove : function(e){
        var t = this.delegate ? e.getTarget(this.delegate) : this.triggerElement = true;
        if (t) {
            this.targetXY = e.getXY();
            if (t === this.triggerElement) {
                if(!this.hidden && this.trackMouse){
                    this.setPagePosition(this.getTargetXY());
                }
            } else {
                this.hide();
                this.lastActive = new Date(0);
                this.onTargetOver(e);
            }
        } else if (!this.closable && this.isVisible()) {
            this.hide();
        }
    },

    
    getTargetXY : function(){
        if(this.delegate){
            this.anchorTarget = this.triggerElement;
        }
        if(this.anchor){
            this.targetCounter++;
            var offsets = this.getOffsets(),
                xy = (this.anchorToTarget && !this.trackMouse) ? this.el.getAlignToXY(this.anchorTarget, this.getAnchorAlign()) : this.targetXY,
                dw = Ext.lib.Dom.getViewWidth() - 5,
                dh = Ext.lib.Dom.getViewHeight() - 5,
                de = document.documentElement,
                bd = document.body,
                scrollX = (de.scrollLeft || bd.scrollLeft || 0) + 5,
                scrollY = (de.scrollTop || bd.scrollTop || 0) + 5,
                axy = [xy[0] + offsets[0], xy[1] + offsets[1]],
                sz = this.getSize();
                
            this.anchorEl.removeClass(this.anchorCls);

            if(this.targetCounter < 2){
                if(axy[0] < scrollX){
                    if(this.anchorToTarget){
                        this.defaultAlign = 'l-r';
                        if(this.mouseOffset){this.mouseOffset[0] *= -1;}
                    }
                    this.anchor = 'left';
                    return this.getTargetXY();
                }
                if(axy[0]+sz.width > dw){
                    if(this.anchorToTarget){
                        this.defaultAlign = 'r-l';
                        if(this.mouseOffset){this.mouseOffset[0] *= -1;}
                    }
                    this.anchor = 'right';
                    return this.getTargetXY();
                }
                if(axy[1] < scrollY){
                    if(this.anchorToTarget){
                        this.defaultAlign = 't-b';
                        if(this.mouseOffset){this.mouseOffset[1] *= -1;}
                    }
                    this.anchor = 'top';
                    return this.getTargetXY();
                }
                if(axy[1]+sz.height > dh){
                    if(this.anchorToTarget){
                        this.defaultAlign = 'b-t';
                        if(this.mouseOffset){this.mouseOffset[1] *= -1;}
                    }
                    this.anchor = 'bottom';
                    return this.getTargetXY();
                }
            }

            this.anchorCls = 'x-tip-anchor-'+this.getAnchorPosition();
            this.anchorEl.addClass(this.anchorCls);
            this.targetCounter = 0;
            return axy;
        }else{
            var mouseOffset = this.getMouseOffset();
            return [this.targetXY[0]+mouseOffset[0], this.targetXY[1]+mouseOffset[1]];
        }
    },

    getMouseOffset : function(){
        var offset = this.anchor ? [0,0] : [15,18];
        if(this.mouseOffset){
            offset[0] += this.mouseOffset[0];
            offset[1] += this.mouseOffset[1];
        }
        return offset;
    },

    
    getAnchorPosition : function(){
        if(this.anchor){
            this.tipAnchor = this.anchor.charAt(0);
        }else{
            var m = this.defaultAlign.match(/^([a-z]+)-([a-z]+)(\?)?$/);
            if(!m){
               throw 'AnchorTip.defaultAlign is invalid';
            }
            this.tipAnchor = m[1].charAt(0);
        }

        switch(this.tipAnchor){
            case 't': return 'top';
            case 'b': return 'bottom';
            case 'r': return 'right';
        }
        return 'left';
    },

    
    getAnchorAlign : function(){
        switch(this.anchor){
            case 'top'  : return 'tl-bl';
            case 'left' : return 'tl-tr';
            case 'right': return 'tr-tl';
            default     : return 'bl-tl';
        }
    },

    
    getOffsets : function(){
        var offsets, 
            ap = this.getAnchorPosition().charAt(0);
        if(this.anchorToTarget && !this.trackMouse){
            switch(ap){
                case 't':
                    offsets = [0, 9];
                    break;
                case 'b':
                    offsets = [0, -13];
                    break;
                case 'r':
                    offsets = [-13, 0];
                    break;
                default:
                    offsets = [9, 0];
                    break;
            }
        }else{
            switch(ap){
                case 't':
                    offsets = [-15-this.anchorOffset, 30];
                    break;
                case 'b':
                    offsets = [-19-this.anchorOffset, -13-this.el.dom.offsetHeight];
                    break;
                case 'r':
                    offsets = [-15-this.el.dom.offsetWidth, -13-this.anchorOffset];
                    break;
                default:
                    offsets = [25, -13-this.anchorOffset];
                    break;
            }
        }
        var mouseOffset = this.getMouseOffset();
        offsets[0] += mouseOffset[0];
        offsets[1] += mouseOffset[1];

        return offsets;
    },

    
    onTargetOver : function(e){
        if(this.disabled || e.within(this.target.dom, true)){
            return;
        }
        var t = e.getTarget(this.delegate);
        if (t) {
            this.triggerElement = t;
            this.clearTimer('hide');
            this.targetXY = e.getXY();
            this.delayShow();
        }
    },

    
    delayShow : function(){
        if(this.hidden && !this.showTimer){
            if(this.lastActive.getElapsed() < this.quickShowInterval){
                this.show();
            }else{
                this.showTimer = this.show.defer(this.showDelay, this);
            }
        }else if(!this.hidden && this.autoHide !== false){
            this.show();
        }
    },

    
    onTargetOut : function(e){
        if(this.disabled || e.within(this.target.dom, true)){
            return;
        }
        this.clearTimer('show');
        if(this.autoHide !== false){
            this.delayHide();
        }
    },

    
    delayHide : function(){
        if(!this.hidden && !this.hideTimer){
            this.hideTimer = this.hide.defer(this.hideDelay, this);
        }
    },

    
    hide: function(){
        this.clearTimer('dismiss');
        this.lastActive = new Date();
        if(this.anchorEl){
            this.anchorEl.hide();
        }
        ToolTip.superclass.hide.call(this);
        delete this.triggerElement;
    },

    
    show : function(){
        if(this.anchor){
            
            
            this.showAt([-1000,-1000]);
            this.origConstrainPosition = this.constrainPosition;
            this.constrainPosition = false;
            this.anchor = this.origAnchor;
        }
        this.showAt(this.getTargetXY());

        if(this.anchor){
            this.syncAnchor();
            this.anchorEl.show();
            this.constrainPosition = this.origConstrainPosition;
        }else{
            this.anchorEl.hide();
        }
    },

    
    showAt : function(xy){
        this.lastActive = new Date();
        this.clearTimers();
        ToolTip.superclass.showAt.call(this, xy);
        if(this.dismissDelay && this.autoHide !== false){
            this.dismissTimer = this.hide.defer(this.dismissDelay, this);
        }
        if(this.anchor && !this.anchorEl.isVisible()){
            this.syncAnchor();
            this.anchorEl.show();
        }
    },

    
    syncAnchor : function(){
        var anchorPos, targetPos, offset;
        switch(this.tipAnchor.charAt(0)){
            case 't':
                anchorPos = 'b';
                targetPos = 'tl';
                offset = [20+this.anchorOffset, 2];
                break;
            case 'r':
                anchorPos = 'l';
                targetPos = 'tr';
                offset = [-2, 11+this.anchorOffset];
                break;
            case 'b':
                anchorPos = 't';
                targetPos = 'bl';
                offset = [20+this.anchorOffset, -2];
                break;
            default:
                anchorPos = 'r';
                targetPos = 'tl';
                offset = [2, 11+this.anchorOffset];
                break;
        }
        this.anchorEl.alignTo(this.el, anchorPos+'-'+targetPos, offset);
    },

    
    setPagePosition : function(x, y){
        ToolTip.superclass.setPagePosition.call(this, x, y);
        if(this.anchor){
            this.syncAnchor();
        }
    },

    
    clearTimer : function(name){
        name = name + 'Timer';
        clearTimeout(this[name]);
        delete this[name];
    },

    
    clearTimers : function(){
        this.clearTimer('show');
        this.clearTimer('dismiss');
        this.clearTimer('hide');
    },

    
    onShow : function(){
        ToolTip.superclass.onShow.call(this);
        Ext.getDoc().on('mousedown', this.onDocMouseDown, this);
    },

    
    onHide : function(){
        ToolTip.superclass.onHide.call(this);
        Ext.getDoc().un('mousedown', this.onDocMouseDown, this);
    },

    
    onDocMouseDown : function(e){
        if(this.autoHide !== true && !this.closable && !e.within(this.el.dom)){
            this.disable();
            this.doEnable.defer(100, this);
        }
    },
    
    
    doEnable : function(){
        if(!this.isDestroyed){
            this.enable();
        }
    },

    
    onDisable : function(){
        this.clearTimers();
        this.hide();
    },

    
    adjustPosition : function(x, y){
        if(this.contstrainPosition){
            var ay = this.targetXY[1], h = this.getSize().height;
            if(y <= ay && (y+h) >= ay){
                y = ay-h-5;
            }
        }
        return {x : x, y: y};
    },
    
    beforeDestroy : function(){
        this.clearTimers();
        Ext.destroy(this.anchorEl);
        delete this.anchorEl;
        delete this.target;
        delete this.anchorTarget;
        delete this.triggerElement;
        ToolTip.superclass.beforeDestroy.call(this);    
    },

    
    onDestroy : function(){
        Ext.getDoc().un('mousedown', this.onDocMouseDown, this);
        ToolTip.superclass.onDestroy.call(this);
    }
});

Ext.reg('tooltip', ToolTip);

export default ToolTip;