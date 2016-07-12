import Ext from '../Base';
import ScrollManager from './ScrollManager';
import DragSource from './DragSource';
import Registry from './Registry';

var DragZone = function(el, config){
    DragZone.superclass.constructor.call(this, el, config);
    if(this.containerScroll){
        ScrollManager.register(this.el);
    }
};

Ext.extend(DragZone, DragSource, {
    
    getDragData : function(e){
        return Registry.getHandleFromEvent(e);
    },
    
    
    onInitDrag : function(x, y){
        this.proxy.update(this.dragData.ddel.cloneNode(true));
        this.onStartDrag(x, y);
        return true;
    },
    
    
    afterRepair : function(){
        if(Ext.enableFx){
            Ext.Element.fly(this.dragData.ddel).highlight(this.hlColor || "c3daf9");
        }
        this.dragging = false;
    },

    
    getRepairXY : function(e){
        return Ext.Element.fly(this.dragData.ddel).getXY();  
    }
});

export default DragZone;