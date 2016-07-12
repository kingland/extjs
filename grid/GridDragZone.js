import Ext from '../Base';
import DragZone from '../dd/DragZone';

var GridDragZone = function(grid, config){
    this.view = grid.getView();
    GridDragZone.superclass.constructor.call(this, this.view.mainBody.dom, config);
    this.scroll = false;
    this.grid = grid;
    this.ddel = document.createElement('div');
    this.ddel.className = 'x-grid-dd-wrap';
};


Ext.extend(GridDragZone, DragZone, {
    ddGroup : "GridDD",

    
    getDragData : function(e){
        var t = Ext.lib.Event.getTarget(e);
        var rowIndex = this.view.findRowIndex(t);
        if(rowIndex !== false){
            var sm = this.grid.selModel;
            if(!sm.isSelected(rowIndex) || e.hasModifier()){
                sm.handleMouseDown(this.grid, rowIndex, e);
            }
            return {grid: this.grid, ddel: this.ddel, rowIndex: rowIndex, selections:sm.getSelections()};
        }
        return false;
    },

    
    onInitDrag : function(e){
        var data = this.dragData;
        this.ddel.innerHTML = this.grid.getDragDropText();
        this.proxy.update(this.ddel);
        
    },

    
    afterRepair : function(){
        this.dragging = false;
    },

    
    getRepairXY : function(e, data){
        return false;
    },

    onEndDrag : function(data, e){
        
    },

    onValidDrop : function(dd, e, id){
        
        this.hideProxy();
    },

    beforeInvalidDrop : function(e, id){

    }
});

export default GridDragZone;