import Ext from '../Base';
import BoxComponent from '../BoxComponent';
import Format from '../util/Format';

var Label = Ext.extend(BoxComponent, {
    
    onRender : function(ct, position){
        if(!this.el){
            this.el = document.createElement('label');
            this.el.id = this.getId();
            this.el.innerHTML = this.text ? Format.htmlEncode(this.text) : (this.html || '');
            if(this.forId){
                this.el.setAttribute('for', this.forId);
            }
        }
        Label.superclass.onRender.call(this, ct, position);
    },

    
    setText : function(t, encode){
        var e = encode === false;
        this[!e ? 'text' : 'html'] = t;
        delete this[e ? 'text' : 'html'];
        if(this.rendered){
            this.el.dom.innerHTML = encode !== false ? Format.htmlEncode(t) : t;
        }
        return this;
    }
});

Ext.reg('label', Label);

export default Label;