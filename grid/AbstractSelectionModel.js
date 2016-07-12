import Ext from '../Base';
import Observable from '../util/Observable';

var AbstractSelectionModel = Ext.extend(Observable,  {

    constructor : function(){
        this.locked = false;
        AbstractSelectionModel.superclass.constructor.call(this);
    },

    
    init : function(grid){
        this.grid = grid;
        if(this.lockOnInit){
            delete this.lockOnInit;
            this.locked = false;
            this.lock();
        }
        this.initEvents();
    },

    
    lock : function(){
        if(!this.locked){
            this.locked = true;
            
            var g = this.grid;
            if(g){
                g.getView().on({
                    scope: this,
                    beforerefresh: this.sortUnLock,
                    refresh: this.sortLock
                });
            }else{
                this.lockOnInit = true;
            }
        }
    },

    
    sortLock : function() {
        this.locked = true;
    },

    
    sortUnLock : function() {
        this.locked = false;
    },

    
    unlock : function(){
        if(this.locked){
            this.locked = false;
            var g = this.grid,
                gv;
                
            
            if(g){
                gv = g.getView();
                gv.un('beforerefresh', this.sortUnLock, this);
                gv.un('refresh', this.sortLock, this);    
            }else{
                delete this.lockOnInit;
            }
        }
    },

    
    isLocked : function(){
        return this.locked;
    },

    destroy: function(){
        this.unlock();
        this.purgeListeners();
    }
});

export default AbstractSelectionModel;