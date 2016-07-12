import Ext from '../Base';
import Field from './Field';

var Checkbox = Ext.extend(Field,  {
    
    focusClass : undefined,
    
    fieldClass : 'x-form-field',
    
    checked : false,
    
    boxLabel: '&#160;',
    
    defaultAutoCreate : { tag: 'input', type: 'checkbox', autocomplete: 'off'},
    
    
    
    

    
    actionMode : 'wrap',

	
    initComponent : function(){
        Checkbox.superclass.initComponent.call(this);
        this.addEvents(
            
            'check'
        );
    },

    
    onResize : function(){
        Checkbox.superclass.onResize.apply(this, arguments);
        if(!this.boxLabel && !this.fieldLabel){
            this.el.alignTo(this.wrap, 'c-c');
        }
    },

    
    initEvents : function(){
        Checkbox.superclass.initEvents.call(this);
        this.mon(this.el, {
            scope: this,
            click: this.onClick,
            change: this.onClick
        });
    },

    
    markInvalid : Ext.emptyFn,
    
    clearInvalid : Ext.emptyFn,

    
    onRender : function(ct, position){
        Checkbox.superclass.onRender.call(this, ct, position);
        if(this.inputValue !== undefined){
            this.el.dom.value = this.inputValue;
        }
        this.wrap = this.el.wrap({cls: 'x-form-check-wrap'});
        if(this.boxLabel){
            this.wrap.createChild({tag: 'label', htmlFor: this.el.id, cls: 'x-form-cb-label', html: this.boxLabel});
        }
        if(this.checked){
            this.setValue(true);
        }else{
            this.checked = this.el.dom.checked;
        }
        
        if(Ext.isIE){
            this.wrap.repaint();
        }
        this.resizeEl = this.positionEl = this.wrap;
    },

    
    onDestroy : function(){
        Ext.destroy(this.wrap);
        Checkbox.superclass.onDestroy.call(this);
    },

    
    initValue : function() {
        this.originalValue = this.getValue();
    },

    
    getValue : function(){
        if(this.rendered){
            return this.el.dom.checked;
        }
        return this.checked;
    },

	
    onClick : function(){
        if(this.el.dom.checked != this.checked){
            this.setValue(this.el.dom.checked);
        }
    },

    
    setValue : function(v){
        var checked = this.checked ;
        this.checked = (v === true || v === 'true' || v == '1' || String(v).toLowerCase() == 'on');
        if(this.rendered){
            this.el.dom.checked = this.checked;
            this.el.dom.defaultChecked = this.checked;
        }
        if(checked != this.checked){
            this.fireEvent('check', this, this.checked);
            if(this.handler){
                this.handler.call(this.scope || this, this, this.checked);
            }
        }
        return this;
    }
});
Ext.reg('checkbox', Checkbox);

export default Checkbox;