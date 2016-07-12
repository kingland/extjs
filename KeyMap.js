import Ext from './Base';

var KeyMap = function(el, config, eventName){
    this.el  = Ext.get(el);
    this.eventName = eventName || "keydown";
    this.bindings = [];
    if(config){
        this.addBinding(config);
    }
    this.enable();
};


KeyMap.prototype = {
    
    stopEvent : false,

    
	addBinding : function(config){
        if(Ext.isArray(config)){
            Ext.each(config, function(c){
                this.addBinding(c);
            }, this);
            return;
        }
        var keyCode = config.key,
            fn = config.fn || config.handler,
            scope = config.scope;

	if (config.stopEvent) {
	    this.stopEvent = config.stopEvent;    
	}	

        if(typeof keyCode == "string"){
            var ks = [];
            var keyString = keyCode.toUpperCase();
            for(var j = 0, len = keyString.length; j < len; j++){
                ks.push(keyString.charCodeAt(j));
            }
            keyCode = ks;
        }
        var keyArray = Ext.isArray(keyCode);
        
        var handler = function(e){
            if(this.checkModifiers(config, e)){
                var k = e.getKey();
                if(keyArray){
                    for(var i = 0, len = keyCode.length; i < len; i++){
                        if(keyCode[i] == k){
                          if(this.stopEvent){
                              e.stopEvent();
                          }
                          fn.call(scope || window, k, e);
                          return;
                        }
                    }
                }else{
                    if(k == keyCode){
                        if(this.stopEvent){
                           e.stopEvent();
                        }
                        fn.call(scope || window, k, e);
                    }
                }
            }
        };
        this.bindings.push(handler);
	},
    
    
    checkModifiers: function(config, e){
        var val, key, keys = ['shift', 'ctrl', 'alt'];
        for (var i = 0, len = keys.length; i < len; ++i){
            key = keys[i];
            val = config[key];
            if(!(val === undefined || (val === e[key + 'Key']))){
                return false;
            }
        }
        return true;
    },

    
    on : function(key, fn, scope){
        var keyCode, shift, ctrl, alt;
        if(typeof key == "object" && !Ext.isArray(key)){
            keyCode = key.key;
            shift = key.shift;
            ctrl = key.ctrl;
            alt = key.alt;
        }else{
            keyCode = key;
        }
        this.addBinding({
            key: keyCode,
            shift: shift,
            ctrl: ctrl,
            alt: alt,
            fn: fn,
            scope: scope
        });
    },

    
    handleKeyDown : function(e){
	    if(this.enabled){ 
    	    var b = this.bindings;
    	    for(var i = 0, len = b.length; i < len; i++){
    	        b[i].call(this, e);
    	    }
	    }
	},

	
	isEnabled : function(){
	    return this.enabled;
	},

	
	enable: function(){
		if(!this.enabled){
		    this.el.on(this.eventName, this.handleKeyDown, this);
		    this.enabled = true;
		}
	},

	
	disable: function(){
		if(this.enabled){
		    this.el.removeListener(this.eventName, this.handleKeyDown, this);
		    this.enabled = false;
		}
	},
    
    
    setDisabled : function(disabled){
        this[disabled ? "disable" : "enable"]();
    }
};

export default KeyMap;