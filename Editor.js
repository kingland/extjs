import Ext from './Base';
import Component from './Component';
import Layer from './Layer';

var Editor = function(field, config){
    if(field.field){
        this.field = Ext.create(field.field, 'textfield');
        config = Ext.apply({}, field); 
        delete config.field;
    }else{
        this.field = field;
    }
    Ext.Editor.superclass.constructor.call(this, config);
};

Ext.extend(Editor, Component, {
    allowBlur: true,
    
    value : "",
    
    alignment: "c-c?",
    
    offsets: [0, 0],
    
    shadow : "frame",
    
    constrain : false,
    
    swallowKeys : true,
    
    completeOnEnter : true,
    
    cancelOnEsc : true,
    
    updateEl : false,

    initComponent : function(){
        Editor.superclass.initComponent.call(this);
        this.addEvents(
            
            "beforestartedit",
            
            "startedit",
            
            "beforecomplete",
            
            "complete",
            
            "canceledit",
            
            "specialkey"
        );
    },

    
    onRender : function(ct, position){
        this.el = new Layer({
            shadow: this.shadow,
            cls: "x-editor",
            parentEl : ct,
            shim : this.shim,
            shadowOffset: this.shadowOffset || 4,
            id: this.id,
            constrain: this.constrain
        });
        if(this.zIndex){
            this.el.setZIndex(this.zIndex);
        }
        this.el.setStyle("overflow", Ext.isGecko ? "auto" : "hidden");
        if(this.field.msgTarget != 'title'){
            this.field.msgTarget = 'qtip';
        }
        this.field.inEditor = true;
        this.mon(this.field, {
            scope: this,
            blur: this.onBlur,
            specialkey: this.onSpecialKey
        });
        if(this.field.grow){
            this.mon(this.field, "autosize", this.el.sync,  this.el, {delay:1});
        }
        this.field.render(this.el).show();
        this.field.getEl().dom.name = '';
        if(this.swallowKeys){
            this.field.el.swallowEvent([
                'keypress', 
                'keydown'   
            ]);
        }
    },

    
    onSpecialKey : function(field, e){
        var key = e.getKey(),
            complete = this.completeOnEnter && key == e.ENTER,
            cancel = this.cancelOnEsc && key == e.ESC;
        if(complete || cancel){
            e.stopEvent();
            if(complete){
                this.completeEdit();
            }else{
                this.cancelEdit();
            }
            if(field.triggerBlur){
                field.triggerBlur();
            }
        }
        this.fireEvent('specialkey', field, e);
    },

    
    startEdit : function(el, value){
        if(this.editing){
            this.completeEdit();
        }
        this.boundEl = Ext.get(el);
        var v = value !== undefined ? value : this.boundEl.dom.innerHTML;
        if(!this.rendered){
            this.render(this.parentEl || document.body);
        }
        if(this.fireEvent("beforestartedit", this, this.boundEl, v) !== false){
            this.startValue = v;
            this.field.reset();
            this.field.setValue(v);
            this.realign(true);
            this.editing = true;
            this.show();
        }
    },

    
    doAutoSize : function(){
        if(this.autoSize){
            var sz = this.boundEl.getSize(),
                fs = this.field.getSize();

            switch(this.autoSize){
                case "width":
                    this.setSize(sz.width, fs.height);
                    break;
                case "height":
                    this.setSize(fs.width, sz.height);
                    break;
                case "none":
                    this.setSize(fs.width, fs.height);
                    break;
                default:
                    this.setSize(sz.width, sz.height);
            }
        }
    },

    
    setSize : function(w, h){
        delete this.field.lastSize;
        this.field.setSize(w, h);
        if(this.el){
            if(Ext.isGecko2 || Ext.isOpera){
                
                this.el.setSize(w, h);
            }
            this.el.sync();
        }
    },

    
    realign : function(autoSize){
        if(autoSize === true){
            this.doAutoSize();
        }
        this.el.alignTo(this.boundEl, this.alignment, this.offsets);
    },

    
    completeEdit : function(remainVisible){
        if(!this.editing){
            return;
        }
        
        if (this.field.assertValue) {
            this.field.assertValue();
        }
        var v = this.getValue();
        if(!this.field.isValid()){
            if(this.revertInvalid !== false){
                this.cancelEdit(remainVisible);
            }
            return;
        }
        if(String(v) === String(this.startValue) && this.ignoreNoChange){
            this.hideEdit(remainVisible);
            return;
        }
        if(this.fireEvent("beforecomplete", this, v, this.startValue) !== false){
            v = this.getValue();
            if(this.updateEl && this.boundEl){
                this.boundEl.update(v);
            }
            this.hideEdit(remainVisible);
            this.fireEvent("complete", this, v, this.startValue);
        }
    },

    
    onShow : function(){
        this.el.show();
        if(this.hideEl !== false){
            this.boundEl.hide();
        }
        this.field.show().focus(false, true);
        this.fireEvent("startedit", this.boundEl, this.startValue);
    },

    
    cancelEdit : function(remainVisible){
        if(this.editing){
            var v = this.getValue();
            this.setValue(this.startValue);
            this.hideEdit(remainVisible);
            this.fireEvent("canceledit", this, v, this.startValue);
        }
    },

    
    hideEdit: function(remainVisible){
        if(remainVisible !== true){
            this.editing = false;
            this.hide();
        }
    },

    
    onBlur : function(){
        
        if(this.allowBlur === true && this.editing && this.selectSameEditor !== true){
            this.completeEdit();
        }
    },

    
    onHide : function(){
        if(this.editing){
            this.completeEdit();
            return;
        }
        this.field.blur();
        if(this.field.collapse){
            this.field.collapse();
        }
        this.el.hide();
        if(this.hideEl !== false){
            this.boundEl.show();
        }
    },

    
    setValue : function(v){
        this.field.setValue(v);
    },

    
    getValue : function(){
        return this.field.getValue();
    },

    beforeDestroy : function(){
        Ext.destroyMembers(this, 'field');

        delete this.parentEl;
        delete this.boundEl;
    }
});
Ext.reg('editor', Editor);

export default Editor;