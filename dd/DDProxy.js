import Ext from '../Base';
import DD  from './DD';
import DDM from './DragDropMgr';


var DDProxy = function(id, sGroup, config) {
    if (id) {
        this.init(id, sGroup, config);
        this.initFrame();
    }
};

DDProxy.dragElId = "ygddfdiv";

Ext.extend(DDProxy, DD, {

    
    resizeFrame: true,

    
    centerFrame: false,

    
    createFrame: function() {
        var self = this;
        var body = document.body;

        if (!body || !body.firstChild) {
            setTimeout( function() { self.createFrame(); }, 50 );
            return;
        }

        var div = this.getDragEl();

        if (!div) {
            div    = document.createElement("div");
            div.id = this.dragElId;
            var s  = div.style;

            s.position   = "absolute";
            s.visibility = "hidden";
            s.cursor     = "move";
            s.border     = "2px solid #aaa";
            s.zIndex     = 999;

            
            
            
            body.insertBefore(div, body.firstChild);
        }
    },

    
    initFrame: function() {
        this.createFrame();
    },

    applyConfig: function() {
        DDProxy.superclass.applyConfig.call(this);

        this.resizeFrame = (this.config.resizeFrame !== false);
        this.centerFrame = (this.config.centerFrame);
        this.setDragElId(this.config.dragElId || DDProxy.dragElId);
    },

    
    showFrame: function(iPageX, iPageY) {
        var el = this.getEl();
        var dragEl = this.getDragEl();
        var s = dragEl.style;

        this._resizeProxy();

        if (this.centerFrame) {
            this.setDelta( Math.round(parseInt(s.width,  10)/2),
                           Math.round(parseInt(s.height, 10)/2) );
        }

        this.setDragElPos(iPageX, iPageY);

        Ext.fly(dragEl).show();
    },

    
    _resizeProxy: function() {
        if (this.resizeFrame) {
            var el = this.getEl();
            Ext.fly(this.getDragEl()).setSize(el.offsetWidth, el.offsetHeight);
        }
    },

    
    b4MouseDown: function(e) {
        var x = e.getPageX();
        var y = e.getPageY();
        this.autoOffset(x, y);
        this.setDragElPos(x, y);
    },

    
    b4StartDrag: function(x, y) {
        
        this.showFrame(x, y);
    },

    
    b4EndDrag: function(e) {
        Ext.fly(this.getDragEl()).hide();
    },

    
    
    
    endDrag: function(e) {

        var lel = this.getEl();
        var del = this.getDragEl();

        
        del.style.visibility = "";

        this.beforeMove();
        
        
        lel.style.visibility = "hidden";
        DDM.moveToEl(lel, del);
        del.style.visibility = "hidden";
        lel.style.visibility = "";

        this.afterDrag();
    },

    beforeMove : function(){

    },

    afterDrag : function(){

    },

    toString: function() {
        return ("DDProxy " + this.id);
    }

});

export default DDProxy;