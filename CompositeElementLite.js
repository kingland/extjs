import Ext from './Base';
import Element from './Element';
import EventManager from './EventManager';

var CompositeElementLite = function(els, root){
    
    this.elements = [];
    this.add(els, root);
    this.el = new Element.Flyweight();
};

CompositeElementLite.prototype = {
    isComposite: true,

    
    getElement : function(el){
        
        var e = this.el;
        e.dom = el;
        e.id = el.id;
        return e;
    },

    
    transformElement : function(el){
        return Ext.getDom(el);
    },

    
    getCount : function(){
        return this.elements.length;
    },
    
    add : function(els, root){
        var me = this,
            elements = me.elements;
        if(!els){
            return this;
        }
        if(typeof els == "string"){
            els = Element.selectorFunction(els, root);
        }else if(els.isComposite){
            els = els.elements;
        }else if(!Ext.isIterable(els)){
            els = [els];
        }

        for(var i = 0, len = els.length; i < len; ++i){
            elements.push(me.transformElement(els[i]));
        }
        return me;
    },

    invoke : function(fn, args){
        var me = this,
            els = me.elements,
            len = els.length,
            e,
            i;

        for(i = 0; i < len; i++) {
            e = els[i];
            if(e){
                Element.prototype[fn].apply(me.getElement(e), args);
            }
        }
        return me;
    },
    
    item : function(index){
        var me = this,
            el = me.elements[index],
            out = null;

        if(el){
            out = me.getElement(el);
        }
        return out;
    },

    
    addListener : function(eventName, handler, scope, opt){
        var els = this.elements,
            len = els.length,
            i, e;

        for(i = 0; i<len; i++) {
            e = els[i];
            if(e) {
                EventManager.on(e, eventName, handler, scope || e, opt);
            }
        }
        return this;
    },
    
    each : function(fn, scope){
        var me = this,
            els = me.elements,
            len = els.length,
            i, e;

        for(i = 0; i<len; i++) {
            e = els[i];
            if(e){
                e = this.getElement(e);
                if(fn.call(scope || e, e, me, i) === false){
                    break;
                }
            }
        }
        return me;
    },

    
    fill : function(els){
        var me = this;
        me.elements = [];
        me.add(els);
        return me;
    },

    
    filter : function(selector){
        var els = [],
            me = this,
            elements = me.elements,
            fn = Ext.isFunction(selector) ? selector
                : function(el){
                    return el.is(selector);
                };


        me.each(function(el, self, i){
            if(fn(el, i) !== false){
                els[els.length] = me.transformElement(el);
            }
        });
        me.elements = els;
        return me;
    },

    
    indexOf : function(el){
        return this.elements.indexOf(this.transformElement(el));
    },

    
    replaceElement : function(el, replacement, domReplace){
        var index = !isNaN(el) ? el : this.indexOf(el),
            d;
        if(index > -1){
            replacement = Ext.getDom(replacement);
            if(domReplace){
                d = this.elements[index];
                d.parentNode.insertBefore(replacement, d);
                Ext.removeNode(d);
            }
            this.elements.splice(index, 1, replacement);
        }
        return this;
    },

    
    clear : function(){
        this.elements = [];
    }
};

CompositeElementLite.prototype.on = CompositeElementLite.prototype.addListener;

(function(){
var fnName,
    ElProto = Element.prototype,
    CelProto = CompositeElementLite.prototype;

for(fnName in ElProto){
    if(Ext.isFunction(ElProto[fnName])){
        (function(fnName){
            CelProto[fnName] = CelProto[fnName] || function(){
                return this.invoke(fnName, arguments);
            };
        }).call(CelProto, fnName);

    }
}
})();

Ext.apply(CompositeElementLite.prototype, {
    addElements : function(els, root){
        if(!els){
            return this;
        }
        if(typeof els == "string"){
            els = Element.selectorFunction(els, root);
        }
        var yels = this.elements;
        Ext.each(els, function(e) {
            yels.push(Ext.get(e));
        });
        return this;
    },

    
    first : function(){
        return this.item(0);
    },

    
    last : function(){
        return this.item(this.getCount()-1);
    },

    
    contains : function(el){
        return this.indexOf(el) != -1;
    },

    
    removeElement : function(keys, removeDom){
        var me = this,
            els = this.elements,
            el;
        Ext.each(keys, function(val){
            if ((el = (els[val] || els[val = me.indexOf(val)]))) {
                if(removeDom){
                    if(el.dom){
                        el.remove();
                    }else{
                        Ext.removeNode(el);
                    }
                }
                els.splice(val, 1);
            }
        });
        return this;
    }
});

Element.select = function(selector, root){
    var els;
    if(typeof selector == "string"){
        els = Element.selectorFunction(selector, root);
    }else if(selector.length !== undefined){
        els = selector;
    }else{
        throw "Invalid selector";
    }
    return new CompositeElementLite(els);
};

Ext.select = Element.select;
export default CompositeElementLite;