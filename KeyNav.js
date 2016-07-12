import Ext from './Base';
import EventManager from './EventManager';

var KeyNav = function(el, config){
    this.el = Ext.get(el);
    Ext.apply(this, config);
    if(!this.disabled){
        this.disabled = true;
        this.enable();
    }
};

KeyNav.prototype = {
    
    disabled : false,
    
    defaultEventAction: "stopEvent",
    
    forceKeyDown : false,

    
    relay : function(e){
        var k = e.getKey();
        var h = this.keyToHandler[k];
        if(h && this[h]){
            if(this.doRelay(e, this[h], h) !== true){
                e[this.defaultEventAction]();
            }
        }
    },

    
    doRelay : function(e, h, hname){
        return h.call(this.scope || this, e);
    },

    
    enter : false,
    left : false,
    right : false,
    up : false,
    down : false,
    tab : false,
    esc : false,
    pageUp : false,
    pageDown : false,
    del : false,
    home : false,
    end : false,

    
    keyToHandler : {
        37 : "left",
        39 : "right",
        38 : "up",
        40 : "down",
        33 : "pageUp",
        34 : "pageDown",
        46 : "del",
        36 : "home",
        35 : "end",
        13 : "enter",
        27 : "esc",
        9  : "tab"
    },
    
    stopKeyUp: function(e) {
        var k = e.getKey();

        if (k >= 37 && k <= 40) {
            
            
            e.stopEvent();
        }
    },
    
    
    destroy: function(){
        this.disable();    
    },

	
	enable: function() {
        if (this.disabled) {
            if (Ext.isSafari2) {
                
                this.el.on('keyup', this.stopKeyUp, this);
            }

            this.el.on(this.isKeydown()? 'keydown' : 'keypress', this.relay, this);
            this.disabled = false;
        }
    },

	
	disable: function() {
        if (!this.disabled) {
            if (Ext.isSafari2) {
                
                this.el.un('keyup', this.stopKeyUp, this);
            }

            this.el.un(this.isKeydown()? 'keydown' : 'keypress', this.relay, this);
            this.disabled = true;
        }
    },
    
    
    setDisabled : function(disabled){
        this[disabled ? "disable" : "enable"]();
    },
    
    
    isKeydown: function(){
        return this.forceKeyDown || EventManager.useKeydown;
    }
};

export default KeyNav;