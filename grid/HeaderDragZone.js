import Ext from '../Base';
import DragZone from '../dd/DragZone';

var HeaderDragZone = Ext.extend(DragZone, {
    maxDragWidth: 120,
    
    constructor : function(grid, hd, hd2){
        this.grid = grid;
        this.view = grid.getView();
        this.ddGroup = "gridHeader" + this.grid.getGridEl().id;
        HeaderDragZone.superclass.constructor.call(this, hd);
        if(hd2){
            this.setHandleElId(Ext.id(hd));
            this.setOuterHandleElId(Ext.id(hd2));
        }
        this.scroll = false;
    },
    
    getDragData : function(e){
        var t = Ext.lib.Event.getTarget(e),
            h = this.view.findHeaderCell(t);
        if(h){
            return {ddel: h.firstChild, header:h};
        }
        return false;
    },

    onInitDrag : function(e){
        
        this.dragHeadersDisabled = this.view.headersDisabled;
        this.view.headersDisabled = true;
        var clone = this.dragData.ddel.cloneNode(true);
        clone.id = Ext.id();
        clone.style.width = Math.min(this.dragData.header.offsetWidth,this.maxDragWidth) + "px";
        this.proxy.update(clone);
        return true;
    },

    afterValidDrop : function(){
        this.completeDrop();
    },

    afterInvalidDrop : function(){
        this.completeDrop();
    },
    
    completeDrop: function(){
        var v = this.view,
            disabled = this.dragHeadersDisabled;
        setTimeout(function(){
            v.headersDisabled = disabled;
        }, 50);
    }
});

export default HeaderDragZone;