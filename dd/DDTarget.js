import Ext from '../Base';
import DragDrop from './DragDrop';

var DDTarget = function(id, sGroup, config) {
    if (id) {
        this.initTarget(id, sGroup, config);
    }
};

Ext.extend(DDTarget, DragDrop, {
    
    getDragEl: Ext.emptyFn,
    
    isValidHandleChild: Ext.emptyFn,
    
    startDrag: Ext.emptyFn,
    
    endDrag: Ext.emptyFn,
    
    onDrag: Ext.emptyFn,
    
    onDragDrop: Ext.emptyFn,
    
    onDragEnter: Ext.emptyFn,
    
    onDragOut: Ext.emptyFn,
    
    onDragOver: Ext.emptyFn,
    
    onInvalidDrop: Ext.emptyFn,
    
    onMouseDown: Ext.emptyFn,
    
    onMouseUp: Ext.emptyFn,
    
    setXConstraint: Ext.emptyFn,
    
    setYConstraint: Ext.emptyFn,
    
    resetConstraints: Ext.emptyFn,
    
    clearConstraints: Ext.emptyFn,
    
    clearTicks: Ext.emptyFn,
    
    setInitPosition: Ext.emptyFn,
    
    setDragElId: Ext.emptyFn,
    
    setHandleElId: Ext.emptyFn,
    
    setOuterHandleElId: Ext.emptyFn,
    
    addInvalidHandleClass: Ext.emptyFn,
    
    addInvalidHandleId: Ext.emptyFn,
    
    addInvalidHandleType: Ext.emptyFn,
    
    removeInvalidHandleClass: Ext.emptyFn,
    
    removeInvalidHandleId: Ext.emptyFn,
    
    removeInvalidHandleType: Ext.emptyFn,

    toString: function() {
        return ("DDTarget " + this.id);
    }
});

export default DDTarget;