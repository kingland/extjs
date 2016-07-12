import Ext from '../Base';
import DropTarget from './DropTarget';
import DDM from './DragDropMgr';
import Registry from './Registry';

var DropZone = function(el, config){
    DropZone.superclass.constructor.call(this, el, config);
};

Ext.extend(DropZone, DropTarget, {
    
    getTargetFromEvent : function(e){
        return Registry.getTargetFromEvent(e);
    },

    
    onNodeEnter : function(n, dd, e, data){
        
    },

    
    onNodeOver : function(n, dd, e, data){
        return this.dropAllowed;
    },

    
    onNodeOut : function(n, dd, e, data){
        
    },

    
    onNodeDrop : function(n, dd, e, data){
        return false;
    },

    
    onContainerOver : function(dd, e, data){
        return this.dropNotAllowed;
    },

    
    onContainerDrop : function(dd, e, data){
        return false;
    },

    
    notifyEnter : function(dd, e, data){
        return this.dropNotAllowed;
    },

    
    notifyOver : function(dd, e, data){
        var n = this.getTargetFromEvent(e);
        if(!n){ 
            if(this.lastOverNode){
                this.onNodeOut(this.lastOverNode, dd, e, data);
                this.lastOverNode = null;
            }
            return this.onContainerOver(dd, e, data);
        }
        if(this.lastOverNode != n){
            if(this.lastOverNode){
                this.onNodeOut(this.lastOverNode, dd, e, data);
            }
            this.onNodeEnter(n, dd, e, data);
            this.lastOverNode = n;
        }
        return this.onNodeOver(n, dd, e, data);
    },

    
    notifyOut : function(dd, e, data){
        if(this.lastOverNode){
            this.onNodeOut(this.lastOverNode, dd, e, data);
            this.lastOverNode = null;
        }
    },

    
    notifyDrop : function(dd, e, data){
        if(this.lastOverNode){
            this.onNodeOut(this.lastOverNode, dd, e, data);
            this.lastOverNode = null;
        }
        var n = this.getTargetFromEvent(e);
        return n ?
            this.onNodeDrop(n, dd, e, data) :
            this.onContainerDrop(dd, e, data);
    },

    
    triggerCacheRefresh : function(){
        DDM.refreshCache(this.groups);
    }  
});

export default DropZone;