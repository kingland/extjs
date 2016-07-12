import Ext from '../Base';
import TextField from './TextField';
import DomHelper from '../DomHelper';
import Format from '../util/Format';

var TextArea = Ext.extend(TextField,  {
    
    growMin : 60,
    
    growMax: 1000,
    growAppend : '&#160;\n&#160;',

    enterIsSpecial : false,

    
    preventScrollbars: false,
    

    
    onRender : function(ct, position){
        if(!this.el){
            this.defaultAutoCreate = {
                tag: "textarea",
                style:"width:100px;height:60px;",
                autocomplete: "off"
            };
        }
        TextArea.superclass.onRender.call(this, ct, position);
        if(this.grow){
            this.textSizeEl = DomHelper.append(document.body, {
                tag: "pre", cls: "x-form-grow-sizer"
            });
            if(this.preventScrollbars){
                this.el.setStyle("overflow", "hidden");
            }
            this.el.setHeight(this.growMin);
        }
    },

    onDestroy : function(){
        Ext.removeNode(this.textSizeEl);
        TextArea.superclass.onDestroy.call(this);
    },

    fireKey : function(e){
        if(e.isSpecialKey() && (this.enterIsSpecial || (e.getKey() != e.ENTER || e.hasModifier()))){
            this.fireEvent("specialkey", this, e);
        }
    },
    
    
    doAutoSize : function(e){
        return !e.isNavKeyPress() || e.getKey() == e.ENTER;
    },

    
    autoSize: function(){
        if(!this.grow || !this.textSizeEl){
            return;
        }
        var el = this.el,
            v = Format.htmlEncode(el.dom.value),
            ts = this.textSizeEl,
            h;
            
        Ext.fly(ts).setWidth(this.el.getWidth());
        if(v.length < 1){
            v = "&#160;&#160;";
        }else{
            v += this.growAppend;
            if(Ext.isIE){
                v = v.replace(/\n/g, '&#160;<br />');
            }
        }
        ts.innerHTML = v;
        h = Math.min(this.growMax, Math.max(ts.offsetHeight, this.growMin));
        if(h != this.lastHeight){
            this.lastHeight = h;
            this.el.setHeight(h);
            this.fireEvent("autosize", this, h);
        }
    }
});
Ext.reg('textarea', TextArea);

export default TextArea;