import Ext from '../Base';
import ScrollManager from './ScrollManager';
import DDTarget from './DDTarget';


var DropTarget = function(el, config){
    this.el = Ext.get(el);
    
    Ext.apply(this, config);
    
    if(this.containerScroll){
        ScrollManager.register(this.el);
    }
    
    DropTarget.superclass.constructor.call(this, this.el.dom, this.ddGroup || this.group, 
          {isTarget: true});

};

Ext.extend(DropTarget, DDTarget, {
    
    
    
    dropAllowed : "x-dd-drop-ok",
    
    dropNotAllowed : "x-dd-drop-nodrop",

    
    isTarget : true,

    
    isNotifyTarget : true,

    
    notifyEnter : function(dd, e, data){
        if(this.overClass){
            this.el.addClass(this.overClass);
        }
        return this.dropAllowed;
    },

    
    notifyOver : function(dd, e, data){
        return this.dropAllowed;
    },

    
    notifyOut : function(dd, e, data){
        if(this.overClass){
            this.el.removeClass(this.overClass);
        }
    },

    
    notifyDrop : function(dd, e, data){
        return false;
    }
});

export default DropTarget;