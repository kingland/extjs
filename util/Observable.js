import Ext from '../Base';
import DelayedTask from './DelayedTask';
import Event from './Event';
	
var EACH = Ext.each,
    TRUE = true,
    FALSE = false;

var Observable = function(){
    
    var me = this, e = me.events;
    if(me.listeners){
        me.on(me.listeners);
        delete me.listeners;
    }
    me.events = e || {};
};

Observable.prototype = {
    
    filterOptRe : /^(?:scope|delay|buffer|single)$/,

    
    fireEvent : function(){
        var a = Array.prototype.slice.call(arguments, 0),
            ename = a[0].toLowerCase(),
            me = this,
            ret = TRUE,
            ce = me.events[ename],
            cc,
            q,
            c;
        if (me.eventsSuspended === TRUE) {
            if (q = me.eventQueue) {
                q.push(a);
            }
        }
        else if(typeof ce == 'object') {
            if (ce.bubble){
                if(ce.fire.apply(ce, a.slice(1)) === FALSE) {
                    return FALSE;
                }
                c = me.getBubbleTarget && me.getBubbleTarget();
                if(c && c.enableBubble) {
                    cc = c.events[ename];
                    if(!cc || typeof cc != 'object' || !cc.bubble) {
                        c.enableBubble(ename);
                    }
                    return c.fireEvent.apply(c, a);
                }
            }
            else {
                a.shift();
                ret = ce.fire.apply(ce, a);
            }
        }
        return ret;
    },

    
    addListener : function(eventName, fn, scope, o){
        var me = this,
            e,
            oe,
            isF,
        ce;
        if (typeof eventName == 'object') {
            o = eventName;
            for (e in o){
                oe = o[e];
                if (!me.filterOptRe.test(e)) {
                    me.addListener(e, oe.fn || oe, oe.scope || o.scope, oe.fn ? oe : o);
                }
            }
        } else {
            eventName = eventName.toLowerCase();
            ce = me.events[eventName] || TRUE;
            if (typeof ce == 'boolean') {
                me.events[eventName] = ce = new Event(me, eventName);
            }
            ce.addListener(fn, scope, typeof o == 'object' ? o : {});
        }
    },

    
    removeListener : function(eventName, fn, scope){
        var ce = this.events[eventName.toLowerCase()];
        if (typeof ce == 'object') {
            ce.removeListener(fn, scope);
        }
    },

    
    purgeListeners : function(){
        var events = this.events,
            evt,
            key;
        for(key in events){
            evt = events[key];
            if(typeof evt == 'object'){
                evt.clearListeners();
            }
        }
    },

    
    addEvents : function(o){
        var me = this;
        me.events = me.events || {};
        if (typeof o == 'string') {
            var a = arguments,
                i = a.length;
            while(i--) {
                me.events[a[i]] = me.events[a[i]] || TRUE;
            }
        } else {
            Ext.applyIf(me.events, o);
        }
    },

    
    hasListener : function(eventName){
        var e = this.events[eventName.toLowerCase()];
        return typeof e == 'object' && e.listeners.length > 0;
    },

    
    suspendEvents : function(queueSuspended){
        this.eventsSuspended = TRUE;
        if(queueSuspended && !this.eventQueue){
            this.eventQueue = [];
        }
    },

    
    resumeEvents : function(){
        var me = this,
            queued = me.eventQueue || [];
        me.eventsSuspended = FALSE;
        delete me.eventQueue;
        EACH(queued, function(e) {
            me.fireEvent.apply(me, e);
        });
    }
};

var OBSERVABLE = Observable.prototype;

OBSERVABLE.on = OBSERVABLE.addListener;

OBSERVABLE.un = OBSERVABLE.removeListener;


Observable.releaseCapture = function(o){
    o.fireEvent = OBSERVABLE.fireEvent;
};


Ext.apply(Observable.prototype, function(){
    
    
    
    function getMethodEvent(method){
        var e = (this.methodEvents = this.methodEvents ||
        {})[method], returnValue, v, cancel, obj = this;

        if (!e) {
            this.methodEvents[method] = e = {};
            e.originalFn = this[method];
            e.methodName = method;
            e.before = [];
            e.after = [];

            var makeCall = function(fn, scope, args){
                if((v = fn.apply(scope || obj, args)) !== undefined){
                    if (typeof v == 'object') {
                        if(v.returnValue !== undefined){
                            returnValue = v.returnValue;
                        }else{
                            returnValue = v;
                        }
                        cancel = !!v.cancel;
                    }
                    else
                        if (v === false) {
                            cancel = true;
                        }
                        else {
                            returnValue = v;
                        }
                }
            };

            this[method] = function(){
                var args = Array.prototype.slice.call(arguments, 0),
                    b;
                returnValue = v = undefined;
                cancel = false;

                for(var i = 0, len = e.before.length; i < len; i++){
                    b = e.before[i];
                    makeCall(b.fn, b.scope, args);
                    if (cancel) {
                        return returnValue;
                    }
                }

                if((v = e.originalFn.apply(obj, args)) !== undefined){
                    returnValue = v;
                }

                for(var i = 0, len = e.after.length; i < len; i++){
                    b = e.after[i];
                    makeCall(b.fn, b.scope, args);
                    if (cancel) {
                        return returnValue;
                    }
                }
                return returnValue;
            };
        }
        return e;
    }

    return {
        
        
        
        beforeMethod : function(method, fn, scope){
            getMethodEvent.call(this, method).before.push({
                fn: fn,
                scope: scope
            });
        },

        
        afterMethod : function(method, fn, scope){
            getMethodEvent.call(this, method).after.push({
                fn: fn,
                scope: scope
            });
        },

        removeMethodListener: function(method, fn, scope){
            var e = this.getMethodEvent(method);
            for(var i = 0, len = e.before.length; i < len; i++){
                if(e.before[i].fn == fn && e.before[i].scope == scope){
                    e.before.splice(i, 1);
                    return;
                }
            }
            for(var i = 0, len = e.after.length; i < len; i++){
                if(e.after[i].fn == fn && e.after[i].scope == scope){
                    e.after.splice(i, 1);
                    return;
                }
            }
        },

        
        relayEvents : function(o, events){
            var me = this;
            function createHandler(ename){
                return function(){
                    return me.fireEvent.apply(me, [ename].concat(Array.prototype.slice.call(arguments, 0)));
                };
            }
            for(var i = 0, len = events.length; i < len; i++){
                var ename = events[i];
                me.events[ename] = me.events[ename] || true;
                o.on(ename, createHandler(ename), me);
            }
        },

        
        enableBubble : function(events){
            var me = this;
            if(!Ext.isEmpty(events)){
                events = Ext.isArray(events) ? events : Array.prototype.slice.call(arguments, 0);
                for(var i = 0, len = events.length; i < len; i++){
                    var ename = events[i];
                    ename = ename.toLowerCase();
                    var ce = me.events[ename] || true;
                    if (typeof ce == 'boolean') {
                        ce = new Event(me, ename);
                        me.events[ename] = ce;
                    }
                    ce.bubble = true;
                }
            }
        }
    };
}());

Observable.capture = function(o, fn, scope){
    o.fireEvent = o.fireEvent.createInterceptor(fn, scope);
};

Observable.observeClass = function(c, listeners){
    if(c){
      if(!c.fireEvent){
          Ext.apply(c, new Observable());
          Observable.capture(c.prototype, c.fireEvent, c);
      }
      if(typeof listeners == 'object'){
          c.on(listeners);
      }
      return c;
   }
};

export default Observable;