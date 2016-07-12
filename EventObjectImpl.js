import Ext from './Base';
import EventManager from './EventManager';

var E = Ext.lib.Event,        
        safariKeys = {
            3 : 13, 
            63234 : 37, 
            63235 : 39, 
            63232 : 38, 
            63233 : 40, 
            63276 : 33, 
            63277 : 34, 
            63272 : 46, 
            63273 : 36, 
            63275 : 35  
        },
        
        btnMap = Ext.isIE ? {1:0,4:1,2:2} :  (Ext.isWebKit ? {1:0,2:1,3:2} : {0:0,1:1,2:2});

var EventObjectImpl = function(e){
	if(e){
		this.setEvent(e.browserEvent || e);
	}
};

EventObjectImpl.prototype = {
	   
	setEvent : function(e){
		var me = this;
		if(e == me || (e && e.browserEvent)){ 
			return e;
		}
		me.browserEvent = e;
		if(e){
			
			me.button = e.button ? btnMap[e.button] : (e.which ? e.which - 1 : -1);
			if(e.type == 'click' && me.button == -1){
				me.button = 0;
			}
			me.type = e.type;
			me.shiftKey = e.shiftKey;
			
			me.ctrlKey = e.ctrlKey || e.metaKey || false;
			me.altKey = e.altKey;
			
			me.keyCode = e.keyCode;
			me.charCode = e.charCode;
			
			me.target = E.getTarget(e);
			
			me.xy = E.getXY(e);
		}else{
			me.button = -1;
			me.shiftKey = false;
			me.ctrlKey = false;
			me.altKey = false;
			me.keyCode = 0;
			me.charCode = 0;
			me.target = null;
			me.xy = [0, 0];
		}
		return me;
	},

	
	stopEvent : function(){
		var me = this;
		if(me.browserEvent){
			if(me.browserEvent.type == 'mousedown'){
				EventManager.stoppedMouseDownEvent.fire(me);
			}
			E.stopEvent(me.browserEvent);
		}
	},

	
	preventDefault : function(){
		if(this.browserEvent){
			E.preventDefault(this.browserEvent);
		}
	},

	
	stopPropagation : function(){
		var me = this;
		if(me.browserEvent){
			if(me.browserEvent.type == 'mousedown'){
				EventManager.stoppedMouseDownEvent.fire(me);
			}
			E.stopPropagation(me.browserEvent);
		}
	},

	
	getCharCode : function(){
		return this.charCode || this.keyCode;
	},

	
	getKey : function(){
		return this.normalizeKey(this.keyCode || this.charCode)
	},

	
	normalizeKey: function(k){
		return Ext.isSafari ? (safariKeys[k] || k) : k;
	},

	
	getPageX : function(){
		return this.xy[0];
	},

	
	getPageY : function(){
		return this.xy[1];
	},

	
	getXY : function(){
		return this.xy;
	},

	
	getTarget : function(selector, maxDepth, returnEl){
		return selector ? Ext.fly(this.target).findParent(selector, maxDepth, returnEl) : (returnEl ? Ext.get(this.target) : this.target);
	},

	
	getRelatedTarget : function(){
		return this.browserEvent ? E.getRelatedTarget(this.browserEvent) : null;
	},

	
	getWheelDelta : function(){
		var e = this.browserEvent;
		var delta = 0;
		if(e.wheelDelta){ 
			delta = e.wheelDelta/120;
		}else if(e.detail){ 
			delta = -e.detail/3;
		}
		return delta;
	},

	
	within : function(el, related, allowEl){
		if(el){
			var t = this[related ? "getRelatedTarget" : "getTarget"]();
			return t && ((allowEl ? (t == Ext.getDom(el)) : false) || Ext.fly(el).contains(t));
		}
		return false;
	}
 };
 
 Ext.apply(EventObjectImpl.prototype, {
   
   BACKSPACE: 8,
   
   TAB: 9,
   
   NUM_CENTER: 12,
   
   ENTER: 13,
   
   RETURN: 13,
   
   SHIFT: 16,
   
   CTRL: 17,
   CONTROL : 17, 
   
   ALT: 18,
   
   PAUSE: 19,
   
   CAPS_LOCK: 20,
   
   ESC: 27,
   
   SPACE: 32,
   
   PAGE_UP: 33,
   PAGEUP : 33, 
   
   PAGE_DOWN: 34,
   PAGEDOWN : 34, 
   
   END: 35,
   
   HOME: 36,
   
   LEFT: 37,
   
   UP: 38,
   
   RIGHT: 39,
   
   DOWN: 40,
   
   PRINT_SCREEN: 44,
   
   INSERT: 45,
   
   DELETE: 46,
   
   ZERO: 48,
   
   ONE: 49,
   
   TWO: 50,
   
   THREE: 51,
   
   FOUR: 52,
   
   FIVE: 53,
   
   SIX: 54,
   
   SEVEN: 55,
   
   EIGHT: 56,
   
   NINE: 57,
   
   A: 65,
   
   B: 66,
   
   C: 67,
   
   D: 68,
   
   E: 69,
   
   F: 70,
   
   G: 71,
   
   H: 72,
   
   I: 73,
   
   J: 74,
   
   K: 75,
   
   L: 76,
   
   M: 77,
   
   N: 78,
   
   O: 79,
   
   P: 80,
   
   Q: 81,
   
   R: 82,
   
   S: 83,
   
   T: 84,
   
   U: 85,
   
   V: 86,
   
   W: 87,
   
   X: 88,
   
   Y: 89,
   
   Z: 90,
   
   CONTEXT_MENU: 93,
   
   NUM_ZERO: 96,
   
   NUM_ONE: 97,
   
   NUM_TWO: 98,
   
   NUM_THREE: 99,
   
   NUM_FOUR: 100,
   
   NUM_FIVE: 101,
   
   NUM_SIX: 102,
   
   NUM_SEVEN: 103,
   
   NUM_EIGHT: 104,
   
   NUM_NINE: 105,
   
   NUM_MULTIPLY: 106,
   
   NUM_PLUS: 107,
   
   NUM_MINUS: 109,
   
   NUM_PERIOD: 110,
   
   NUM_DIVISION: 111,
   
   F1: 112,
   
   F2: 113,
   
   F3: 114,
   
   F4: 115,
   
   F5: 116,
   
   F6: 117,
   
   F7: 118,
   
   F8: 119,
   
   F9: 120,
   
   F10: 121,
   
   F11: 122,
   
   F12: 123,

   
   isNavKeyPress : function(){
       var me = this,
           k = this.normalizeKey(me.keyCode);
       return (k >= 33 && k <= 40) ||  
       k == me.RETURN ||
       k == me.TAB ||
       k == me.ESC;
   },

   isSpecialKey : function(){
       var k = this.normalizeKey(this.keyCode);
       return (this.type == 'keypress' && this.ctrlKey) ||
       this.isNavKeyPress() ||
       (k == this.BACKSPACE) || 
       (k >= 16 && k <= 20) || 
       (k >= 44 && k <= 46);   
   },

   getPoint : function(){
       return new Ext.lib.Point(this.xy[0], this.xy[1]);
   },

   
   hasModifier : function(){
       return ((this.ctrlKey || this.altKey) || this.shiftKey);
   }
});
 
 export default EventObjectImpl;