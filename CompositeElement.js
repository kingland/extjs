import Ext from './Base';
import Element from './Element';
import CompositeElementLite from './CompositeElementLite';

var CompositeElement = Ext.extend(CompositeElementLite, {
    
    constructor : function(els, root){
        this.elements = [];
        this.add(els, root);
    },
    
    
    getElement : function(el){
        
        return el;
    },
    
    
    transformElement : function(el){
        return Ext.get(el);
    }
    
});

Element.select = function(selector, unique, root){
    var els;
    if(typeof selector == "string"){
        els = Element.selectorFunction(selector, root);
    }else if(selector.length !== undefined){
        els = selector;
    }else{
        throw "Invalid selector";
    }

    return (unique === true) ? new CompositeElement(els) : new CompositeElementLite(els);
};

Ext.select = Element.select;

export default CompositeElement;