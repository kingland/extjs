import Ext from '../Base';
import Element from '../Element';


var TextMetrics = function(){
    var shared;
    return {
        
        measure : function(el, text, fixedWidth){
            if(!shared){
                shared = TextMetrics.Instance(el, fixedWidth);
            }
            shared.bind(el);
            shared.setFixedWidth(fixedWidth || 'auto');
            return shared.getSize(text);
        },

        
        createInstance : function(el, fixedWidth){
            return TextMetrics.Instance(el, fixedWidth);
        }
    };
}();

TextMetrics.Instance = function(bindTo, fixedWidth){
    var ml = new Element(document.createElement('div'));
    document.body.appendChild(ml.dom);
    ml.position('absolute');
    ml.setLeftTop(-1000, -1000);
    ml.hide();

    if(fixedWidth){
        ml.setWidth(fixedWidth);
    }

    var instance = {
        
        getSize : function(text){
            ml.update(text);
            var s = ml.getSize();
            ml.update('');
            return s;
        },

        
        bind : function(el){
            ml.setStyle(
                Ext.fly(el).getStyles('font-size','font-style', 'font-weight', 'font-family','line-height', 'text-transform', 'letter-spacing')
            );
        },

        
        setFixedWidth : function(width){
            ml.setWidth(width);
        },

        
        getWidth : function(text){
            ml.dom.style.width = 'auto';
            return this.getSize(text).width;
        },

        
        getHeight : function(text){
            return this.getSize(text).height;
        }
    };

    instance.bind(bindTo);

    return instance;
};

export default TextMetrics;