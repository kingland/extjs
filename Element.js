import Ext from './Base';

const DOC = document;
//const unitPattern = /\d+(px|em|%|en|ex|pt|in|cm|mm|pc)$/i;
//var docEl;

var Element = function(element, forceNew){
    var dom = typeof element == "string" ?
              DOC.getElementById(element) : element,
        id;

    if(!dom) return null;

    id = dom.id;

    if(!forceNew && id && Ext.elCache[id]){ 
        return Ext.elCache[id].el;
    }

    
    this.dom = dom;

    
    this.id = id || Ext.id(dom);
};

//For ExtBase
Ext.Element = Element;

export default Element;