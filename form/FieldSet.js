import Ext from '../Base';
import Panel from '../Panel';

var FieldSet = Ext.extend(Panel, {
    baseCls : 'x-fieldset',
    
    layout : 'form',
    
    animCollapse : false,

    
    onRender : function(ct, position){
        if(!this.el){
            this.el = document.createElement('fieldset');
            this.el.id = this.id;
            if (this.title || this.header || this.checkboxToggle) {
                this.el.appendChild(document.createElement('legend')).className = this.baseCls + '-header';
            }
        }

        FieldSet.superclass.onRender.call(this, ct, position);

        if(this.checkboxToggle){
            var o = typeof this.checkboxToggle == 'object' ?
                    this.checkboxToggle :
                    {tag: 'input', type: 'checkbox', name: this.checkboxName || this.id+'-checkbox'};
            this.checkbox = this.header.insertFirst(o);
            this.checkbox.dom.checked = !this.collapsed;
            this.mon(this.checkbox, 'click', this.onCheckClick, this);
        }
    },

    
    onCollapse : function(doAnim, animArg){
        if(this.checkbox){
            this.checkbox.dom.checked = false;
        }
        FieldSet.superclass.onCollapse.call(this, doAnim, animArg);

    },

    
    onExpand : function(doAnim, animArg){
        if(this.checkbox){
            this.checkbox.dom.checked = true;
        }
        FieldSet.superclass.onExpand.call(this, doAnim, animArg);
    },

    
    onCheckClick : function(){
        this[this.checkbox.dom.checked ? 'expand' : 'collapse']();
    }
});
Ext.reg('fieldset', FieldSet);

export default FieldSet;