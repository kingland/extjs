import Ext from '../Base';


var PanelProxy = function(panel, config){
    this.panel = panel;
    this.id = this.panel.id +'-ddproxy';
    Ext.apply(this, config);
};

PanelProxy.prototype = {
    
    insertProxy : true,

    
    setStatus : Ext.emptyFn,
    reset : Ext.emptyFn,
    update : Ext.emptyFn,
    stop : Ext.emptyFn,
    sync: Ext.emptyFn,

    
    getEl : function(){
        return this.ghost;
    },

    
    getGhost : function(){
        return this.ghost;
    },

    
    getProxy : function(){
        return this.proxy;
    },

    
    hide : function(){
        if(this.ghost){
            if(this.proxy){
                this.proxy.remove();
                delete this.proxy;
            }
            this.panel.el.dom.style.display = '';
            this.ghost.remove();
            delete this.ghost;
        }
    },

    
    show : function(){
        if(!this.ghost){
            this.ghost = this.panel.createGhost(undefined, undefined, Ext.getBody());
            this.ghost.setXY(this.panel.el.getXY());
            if(this.insertProxy){
                this.proxy = this.panel.el.insertSibling({cls:'x-panel-dd-spacer'});
                this.proxy.setSize(this.panel.getSize());
            }
            this.panel.el.dom.style.display = 'none';
        }
    },

    
    repair : function(xy, callback, scope){
        this.hide();
        if(typeof callback == "function"){
            callback.call(scope || this);
        }
    },

    
    moveProxy : function(parentNode, before){
        if(this.proxy){
            parentNode.insertBefore(this.proxy.dom, before);
        }
    }
};

export default PanelProxy;