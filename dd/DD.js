import Ext from '../Base';
import DragDrop from './DragDrop';

var DD = function(id, sGroup, config) {
    if (id) {
        this.init(id, sGroup, config);
    }
};

Ext.extend(DD, DragDrop, {

    
    scroll: true,

    
    autoOffset: function(iPageX, iPageY) {
        var x = iPageX - this.startPageX;
        var y = iPageY - this.startPageY;
        this.setDelta(x, y);
    },

    
    setDelta: function(iDeltaX, iDeltaY) {
        this.deltaX = iDeltaX;
        this.deltaY = iDeltaY;
    },

    
    setDragElPos: function(iPageX, iPageY) {
        
        

        var el = this.getDragEl();
        this.alignElWithMouse(el, iPageX, iPageY);
    },

    
    alignElWithMouse: function(el, iPageX, iPageY) {
        var oCoord = this.getTargetCoord(iPageX, iPageY);
        var fly = el.dom ? el : Ext.fly(el, '_dd');
        if (!this.deltaSetXY) {
            var aCoord = [oCoord.x, oCoord.y];
            fly.setXY(aCoord);
            var newLeft = fly.getLeft(true);
            var newTop  = fly.getTop(true);
            this.deltaSetXY = [ newLeft - oCoord.x, newTop - oCoord.y ];
        } else {
            fly.setLeftTop(oCoord.x + this.deltaSetXY[0], oCoord.y + this.deltaSetXY[1]);
        }

        this.cachePosition(oCoord.x, oCoord.y);
        this.autoScroll(oCoord.x, oCoord.y, el.offsetHeight, el.offsetWidth);
        return oCoord;
    },

    
    cachePosition: function(iPageX, iPageY) {
        if (iPageX) {
            this.lastPageX = iPageX;
            this.lastPageY = iPageY;
        } else {
            var aCoord = Ext.lib.Dom.getXY(this.getEl());
            this.lastPageX = aCoord[0];
            this.lastPageY = aCoord[1];
        }
    },

    
    autoScroll: function(x, y, h, w) {

        if (this.scroll) {
            
            var clientH = Ext.lib.Dom.getViewHeight();

            
            var clientW = Ext.lib.Dom.getViewWidth();

            
            var st = this.DDM.getScrollTop();

            
            var sl = this.DDM.getScrollLeft();

            
            var bot = h + y;

            
            var right = w + x;

            
            
            
            var toBot = (clientH + st - y - this.deltaY);

            
            var toRight = (clientW + sl - x - this.deltaX);


            
            
            var thresh = 40;

            
            
            
            var scrAmt = (document.all) ? 80 : 30;

            
            
            if ( bot > clientH && toBot < thresh ) {
                window.scrollTo(sl, st + scrAmt);
            }

            
            
            if ( y < st && st > 0 && y - st < thresh ) {
                window.scrollTo(sl, st - scrAmt);
            }

            
            
            if ( right > clientW && toRight < thresh ) {
                window.scrollTo(sl + scrAmt, st);
            }

            
            
            if ( x < sl && sl > 0 && x - sl < thresh ) {
                window.scrollTo(sl - scrAmt, st);
            }
        }
    },

    
    getTargetCoord: function(iPageX, iPageY) {
        var x = iPageX - this.deltaX;
        var y = iPageY - this.deltaY;

        if (this.constrainX) {
            if (x < this.minX) { x = this.minX; }
            if (x > this.maxX) { x = this.maxX; }
        }

        if (this.constrainY) {
            if (y < this.minY) { y = this.minY; }
            if (y > this.maxY) { y = this.maxY; }
        }

        x = this.getTick(x, this.xTicks);
        y = this.getTick(y, this.yTicks);


        return {x:x, y:y};
    },

    
    applyConfig: function() {
        DD.superclass.applyConfig.call(this);
        this.scroll = (this.config.scroll !== false);
    },

    
    b4MouseDown: function(e) {
        
        this.autoOffset(e.getPageX(),
                            e.getPageY());
    },

    
    b4Drag: function(e) {
        this.setDragElPos(e.getPageX(),
                            e.getPageY());
    },

    toString: function() {
        return ("DD " + this.id);
    }

});

export default DD;