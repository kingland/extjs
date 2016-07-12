import Ext from './Base';
import Element from './ElementFn';
import EventObject from './EventObject';
import EventObjectImpl from './EventObjectImpl';
import Event from './util/Event';
import DelayedTask from './util/DelayedTask';

var EventManager = function(){
    var docReadyEvent,
        docReadyProcId,
        docReadyState = false,
        DETECT_NATIVE = Ext.isGecko || Ext.isWebKit || Ext.isSafari,
        E = Ext.lib.Event,
        D = Ext.lib.Dom,
        DOC = document,
        WINDOW = window,
        DOMCONTENTLOADED = "DOMContentLoaded",
        COMPLETE = 'complete',
        propRe = /^(?:scope|delay|buffer|single|stopEvent|preventDefault|stopPropagation|normalized|args|delegate)$/,
        
        specialElCache = [];

     function getId(el){
        var id = false,
            i = 0,
            len = specialElCache.length,
            id = false,
            skip = false,
            o;
        if(el){
            if(el.getElementById || el.navigator){
                
                for(; i < len; ++i){
                    o = specialElCache[i];
                    if(o.el === el){
                        id = o.id;
                        break;
                    }
                }
                if(!id){
                    
                    id = Ext.id(el);
                    specialElCache.push({
                        id: id,
                        el: el
                    });
                    skip = true;
                }
            }else{
                id = Ext.id(el);
            }
            if(!Ext.elCache[id]){
                Element.addToCache(new Element(el), id);
                if(skip){
                    Ext.elCache[id].skipGC = true;
                }
            }
        }
        return id;
     };

    
    function addListener(el, ename, fn, task, wrap, scope){
        el = Ext.getDom(el);
        var id = getId(el),
            es = Ext.elCache[id].events,
            wfn;

        wfn = E.on(el, ename, wrap);
        es[ename] = es[ename] || [];

        
        es[ename].push([fn, wrap, scope, wfn, task]);

        
        

        
        if(el.addEventListener && ename == "mousewheel"){
            var args = ["DOMMouseScroll", wrap, false];
            el.addEventListener.apply(el, args);
            EventManager.addListener(WINDOW, 'unload', function(){
                el.removeEventListener.apply(el, args);
            });
        }

        
        if(el == DOC && ename == "mousedown"){
            EventManager.stoppedMouseDownEvent.addListener(wrap);
        }
    };

    function doScrollChk(){
        
        if(window != top){
            return false;
        }

        try{
            DOC.documentElement.doScroll('left');
        }catch(e){
             return false;
        }

        fireDocReady();
        return true;
    }
    
    function checkReadyState(e){

        if(Ext.isIE && doScrollChk()){
            return true;
        }
        if(DOC.readyState == COMPLETE){
            fireDocReady();
            return true;
        }
        docReadyState || (docReadyProcId = setTimeout(arguments.callee, 2));
        return false;
    }

    var styles;
    function checkStyleSheets(e){
        styles || (styles = Ext.query('style, link[rel=stylesheet]'));
        if(styles.length == DOC.styleSheets.length){
            fireDocReady();
            return true;
        }
        docReadyState || (docReadyProcId = setTimeout(arguments.callee, 2));
        return false;
    }

    function OperaDOMContentLoaded(e){
        DOC.removeEventListener(DOMCONTENTLOADED, arguments.callee, false);
        checkStyleSheets();
    }

    function fireDocReady(e){
        if(!docReadyState){
            docReadyState = true; 

            if(docReadyProcId){
                clearTimeout(docReadyProcId);
            }
            if(DETECT_NATIVE) {
                DOC.removeEventListener(DOMCONTENTLOADED, fireDocReady, false);
            }
            if(Ext.isIE && checkReadyState.bindIE){  
                DOC.detachEvent('onreadystatechange', checkReadyState);
            }
            E.un(WINDOW, "load", arguments.callee);
        }
        if(docReadyEvent && !Ext.isReady){
            Ext.isReady = true;
            docReadyEvent.fire();
            docReadyEvent.listeners = [];
        }

    };

    function initDocReady(){
        docReadyEvent || (docReadyEvent = new Event());
        if (DETECT_NATIVE) {
            DOC.addEventListener(DOMCONTENTLOADED, fireDocReady, false);
        }
        
        if (Ext.isIE){
            
            
            if(!checkReadyState()){
                checkReadyState.bindIE = true;
                DOC.attachEvent('onreadystatechange', checkReadyState);
            }

        }else if(Ext.isOpera ){
            

            
            (DOC.readyState == COMPLETE && checkStyleSheets()) ||
                DOC.addEventListener(DOMCONTENTLOADED, OperaDOMContentLoaded, false);

        }else if (Ext.isWebKit){
            
            checkReadyState();
        }
        
        E.on(WINDOW, "load", fireDocReady);
    };

    function createTargeted(h, o){
        return function(){
            var args = Ext.toArray(arguments);
            if(o.target == EventObject.setEvent(args[0]).target){
                h.apply(this, args);
            }
        };
    };

    function createBuffered(h, o, task){
        return function(e){
            
            task.delay(o.buffer, h, null, [new EventObjectImpl(e)]);
        };
    };

    function createSingle(h, el, ename, fn, scope){
        return function(e){
            EventManager.removeListener(el, ename, fn, scope);
            h(e);
        };
    };

    function createDelayed(h, o, fn){
        return function(e){
            var task = new DelayedTask(h);
            if(!fn.tasks) {
                fn.tasks = [];
            }
            fn.tasks.push(task);
            task.delay(o.delay || 10, h, null, [new EventObjectImpl(e)]);
        };
    };

    function listen(element, ename, opt, fn, scope){
        var o = (!opt || typeof opt == "boolean") ? {} : opt,
            el = Ext.getDom(element), task;

        fn = fn || o.fn;
        scope = scope || o.scope;

        if(!el){
            throw "Error listening for \"" + ename + '\". Element "' + element + '" doesn\'t exist.';
        }
        function h(e){
            
            if(!Ext){
                return;
            }
            e = EventObject.setEvent(e);
            var t;
            if (o.delegate) {
                if(!(t = e.getTarget(o.delegate, el))){
                    return;
                }
            } else {
                t = e.target;
            }
            if (o.stopEvent) {
                e.stopEvent();
            }
            if (o.preventDefault) {
               e.preventDefault();
            }
            if (o.stopPropagation) {
                e.stopPropagation();
            }
            if (o.normalized) {
                e = e.browserEvent;
            }

            fn.call(scope || el, e, t, o);
        };
        if(o.target){
            h = createTargeted(h, o);
        }
        if(o.delay){
            h = createDelayed(h, o, fn);
        }
        if(o.single){
            h = createSingle(h, el, ename, fn, scope);
        }
        if(o.buffer){
            task = new DelayedTask(h);
            h = createBuffered(h, o, task);
        }

        addListener(el, ename, fn, task, h, scope);
        return h;
    };

    var pub = {
        
        addListener : function(element, eventName, fn, scope, options){
            if(typeof eventName == 'object'){
                var o = eventName, e, val;
                for(e in o){
                    val = o[e];
                    if(!propRe.test(e)){
                        if(Ext.isFunction(val)){
                            
                            listen(element, e, o, val, o.scope);
                        }else{
                            
                            listen(element, e, val);
                        }
                    }
                }
            } else {
                listen(element, eventName, options, fn, scope);
            }
        },

        
        removeListener : function(el, eventName, fn, scope){
            el = Ext.getDom(el);
            var id = getId(el),
                f = el && (Ext.elCache[id].events)[eventName] || [],
                wrap, i, l, k, len, fnc;

            for (i = 0, len = f.length; i < len; i++) {

                
                if (Ext.isArray(fnc = f[i]) && fnc[0] == fn && (!scope || fnc[2] == scope)) {
                    if(fnc[4]) {
                        fnc[4].cancel();
                    }
                    k = fn.tasks && fn.tasks.length;
                    if(k) {
                        while(k--) {
                            fn.tasks[k].cancel();
                        }
                        delete fn.tasks;
                    }
                    wrap = fnc[1];
                    E.un(el, eventName, E.extAdapter ? fnc[3] : wrap);

                    
                    if(wrap && el.addEventListener && eventName == "mousewheel"){
                        el.removeEventListener("DOMMouseScroll", wrap, false);
                    }

                    
                    if(wrap && el == DOC && eventName == "mousedown"){
                        EventManager.stoppedMouseDownEvent.removeListener(wrap);
                    }

                    f.splice(i, 1);
                    if (f.length === 0) {
                        delete Ext.elCache[id].events[eventName];
                    }
                    for (k in Ext.elCache[id].events) {
                        return false;
                    }
                    Ext.elCache[id].events = {};
                    return false;
                }
            }
        },

        
        removeAll : function(el){
            el = Ext.getDom(el);
            var id = getId(el),
                ec = Ext.elCache[id] || {},
                es = ec.events || {},
                f, i, len, ename, fn, k, wrap;

            for(ename in es){
                if(es.hasOwnProperty(ename)){
                    f = es[ename];
                    
                    for (i = 0, len = f.length; i < len; i++) {
                        fn = f[i];
                        if(fn[4]) {
                            fn[4].cancel();
                        }
                        if(fn[0].tasks && (k = fn[0].tasks.length)) {
                            while(k--) {
                                fn[0].tasks[k].cancel();
                            }
                            delete fn.tasks;
                        }
                        wrap =  fn[1];
                        E.un(el, ename, E.extAdapter ? fn[3] : wrap);

                        
                        if(el.addEventListener && wrap && ename == "mousewheel"){
                            el.removeEventListener("DOMMouseScroll", wrap, false);
                        }

                        
                        if(wrap && el == DOC &&  ename == "mousedown"){
                            EventManager.stoppedMouseDownEvent.removeListener(wrap);
                        }
                    }
                }
            }
            if (Ext.elCache[id]) {
                Ext.elCache[id].events = {};
            }
        },

        getListeners : function(el, eventName) {
            el = Ext.getDom(el);
            var id = getId(el),
                ec = Ext.elCache[id] || {},
                es = ec.events || {},
                results = [];
            if (es && es[eventName]) {
                return es[eventName];
            } else {
                return null;
            }
        },

        purgeElement : function(el, recurse, eventName) {
            el = Ext.getDom(el);
            var id = getId(el),
                ec = Ext.elCache[id] || {},
                es = ec.events || {},
                i, f, len;
            if (eventName) {
                if (es && es.hasOwnProperty(eventName)) {
                    f = es[eventName];
                    for (i = 0, len = f.length; i < len; i++) {
                        EventManager.removeListener(el, eventName, f[i][0]);
                    }
                }
            } else {
                EventManager.removeAll(el);
            }
            if (recurse && el && el.childNodes) {
                for (i = 0, len = el.childNodes.length; i < len; i++) {
                    EventManager.purgeElement(el.childNodes[i], recurse, eventName);
                }
            }
        },

        _unload : function() {
            var el;
            for (el in Ext.elCache) {
                EventManager.removeAll(el);
            }
            delete Ext.elCache;
            delete Ext.Element._flyweights;

            
            var c,
                conn,
                tid,
                ajax = Ext.lib.Ajax;
            (typeof ajax.conn == 'object') ? conn = ajax.conn : conn = {};
            for (tid in conn) {
                c = conn[tid];
                if (c) {
                    ajax.abort({conn: c, tId: tid});
                }
            }
        },
        
        onDocumentReady : function(fn, scope, options){
            if(Ext.isReady){ 
                docReadyEvent || (docReadyEvent = new Event());
                docReadyEvent.addListener(fn, scope, options);
                docReadyEvent.fire();
                docReadyEvent.listeners = [];
            }else{
                if(!docReadyEvent){
                    initDocReady();
                }
                options = options || {};
                options.delay = options.delay || 1;
                docReadyEvent.addListener(fn, scope, options);
            }
        },

        
        fireDocReady  : fireDocReady
    };
     
    pub.on = pub.addListener;
    
    pub.un = pub.removeListener;

    pub.stoppedMouseDownEvent = new Event();
    return pub;
}();

Ext.apply(EventManager, function(){
   var resizeEvent,
       resizeTask,
       textEvent,
       textSize,
       D = Ext.lib.Dom,
       propRe = /^(?:scope|delay|buffer|single|stopEvent|preventDefault|stopPropagation|normalized|args|delegate)$/,
       curWidth = 0,
       curHeight = 0,
       
       
       
       useKeydown = Ext.isWebKit ?
                   Ext.num(navigator.userAgent.match(/AppleWebKit\/(\d+)/)[1]) >= 525 :
                   !((Ext.isGecko && !Ext.isWindows) || Ext.isOpera);

   return {
       
       doResizeEvent: function(){
           var h = D.getViewHeight(),
               w = D.getViewWidth();
            
            if(curHeight != h || curWidth != w){
               resizeEvent.fire(curWidth = w, curHeight = h);
            }
       },

       
       onWindowResize : function(fn, scope, options){
           if(!resizeEvent){
               resizeEvent = new Event();
               resizeTask = new DelayedTask(this.doResizeEvent);
               EventManager.on(window, "resize", this.fireWindowResize, this);
           }
           resizeEvent.addListener(fn, scope, options);
       },

       
       fireWindowResize : function(){
           if(resizeEvent){
               resizeTask.delay(100);
           }
       },

       
       onTextResize : function(fn, scope, options){
           if(!textEvent){
               textEvent = new Event();
               var textEl = new Element(document.createElement('div'));
               textEl.dom.className = 'x-text-resize';
               textEl.dom.innerHTML = 'X';
               textEl.appendTo(document.body);
               textSize = textEl.dom.offsetHeight;
               setInterval(function(){
                   if(textEl.dom.offsetHeight != textSize){
                       textEvent.fire(textSize, textSize = textEl.dom.offsetHeight);
                   }
               }, this.textResizeInterval);
           }
           textEvent.addListener(fn, scope, options);
       },

       
       removeResizeListener : function(fn, scope){
           if(resizeEvent){
               resizeEvent.removeListener(fn, scope);
           }
       },

       
       fireResize : function(){
           if(resizeEvent){
               resizeEvent.fire(D.getViewWidth(), D.getViewHeight());
           }
       },
       textResizeInterval : 50,
       ieDeferSrc : false,
       useKeydown: useKeydown
   };
}());

EventManager.on = EventManager.addListener;

//For ExtBase
Ext.EventManager = EventManager;

export default EventManager;