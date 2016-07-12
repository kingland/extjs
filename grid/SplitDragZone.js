import Ext from '../Base';
import Element from '../Element';
import EventObject from '../EventObject';
import DDProxy from '../dd/DDProxy';

var SplitDragZone = Ext.extend(DDProxy, {
    fly: Element.fly,
    
    constructor : function(grid, hd, hd2){
        this.grid = grid;
        this.view = grid.getView();
        this.proxy = this.view.resizeProxy;
        SplitDragZone.superclass.constructor.call(this, hd,
            "gridSplitters" + this.grid.getGridEl().id, {
            dragElId : Ext.id(this.proxy.dom), resizeFrame:false
        });
        this.setHandleElId(Ext.id(hd));
        this.setOuterHandleElId(Ext.id(hd2));
        this.scroll = false;
    },

    b4StartDrag : function(x, y){
        this.view.headersDisabled = true;
        this.proxy.setHeight(this.view.mainWrap.getHeight());
        var w = this.cm.getColumnWidth(this.cellIndex);
        var minw = Math.max(w-this.grid.minColumnWidth, 0);
        this.resetConstraints();
        this.setXConstraint(minw, 1000);
        this.setYConstraint(0, 0);
        this.minX = x - minw;
        this.maxX = x + 1000;
        this.startPos = x;
        DDProxy.prototype.b4StartDrag.call(this, x, y);
    },


    handleMouseDown : function(e){
        var ev = EventObject.setEvent(e);
        var t = this.fly(ev.getTarget());
        if(t.hasClass("x-grid-split")){
            this.cellIndex = this.view.getCellIndex(t.dom);
            this.split = t.dom;
            this.cm = this.grid.colModel;
            if(this.cm.isResizable(this.cellIndex) && !this.cm.isFixed(this.cellIndex)){
                SplitDragZone.superclass.handleMouseDown.apply(this, arguments);
            }
        }
    },

    endDrag : function(e){
        this.view.headersDisabled = false;
        var endX = Math.max(this.minX, Ext.lib.Event.getPageX(e));
        var diff = endX - this.startPos;
        this.view.onColumnSplitterMoved(this.cellIndex, this.cm.getColumnWidth(this.cellIndex)+diff);
    },

    autoOffset : function(){
        this.setDelta(0,0);
    }
});

export default SplitDragZone;