import Ext from '../Base';
import Checkbox from './Checkbox';

var Radio = Ext.extend(Checkbox, {
    inputType: 'radio',

    
    markInvalid : Ext.emptyFn,
    
    clearInvalid : Ext.emptyFn,

    
    getGroupValue : function(){
    	var p = this.el.up('form') || Ext.getBody();
        var c = p.child('input[name='+this.el.dom.name+']:checked', true);
        return c ? c.value : null;
    },

    
    onClick : function(){
    	if(this.el.dom.checked != this.checked){
			var els = this.getCheckEl().select('input[name=' + this.el.dom.name + ']');
			els.each(function(el){
				if(el.dom.id == this.id){
					this.setValue(true);
				}else{
					Ext.getCmp(el.dom.id).setValue(false);
				}
			}, this);
		}
    },

    
    setValue : function(v){
    	if (typeof v == 'boolean') {
            Radio.superclass.setValue.call(this, v);
        } else if (this.rendered) {
            var r = this.getCheckEl().child('input[name=' + this.el.dom.name + '][value=' + v + ']', true);
            if(r){
                Ext.getCmp(r.id).setValue(true);
            }
        }
        return this;
    },

    
    getCheckEl: function(){
        if(this.inGroup){
            return this.el.up('.x-form-radio-group')
        }
        return this.el.up('form') || Ext.getBody();
    }
});
Ext.reg('radio', Radio);

export default Radio;
