import Ext from '../Base';
import Field from './Field';
import MixedCollection from '../util/MixedCollection';
import Container from '../Container';


var CheckboxGroup = Ext.extend(Field, {
    columns : 'auto',
    
    vertical : false,
    
    allowBlank : true,
    
    blankText : "You must select at least one item in this group",

    
    defaultType : 'checkbox',

    
    groupCls : 'x-form-check-group',

    
    initComponent: function(){
        this.addEvents(
            
            'change'
        );
        this.on('change', this.validate, this);
        CheckboxGroup.superclass.initComponent.call(this);
    },

    
    onRender : function(ct, position){
        if(!this.el){
            var panelCfg = {
                autoEl: {
                    id: this.id
                },
                cls: this.groupCls,
                layout: 'column',
                renderTo: ct,
                bufferResize: false 
            };
            var colCfg = {
                xtype: 'container',
                defaultType: this.defaultType,
                layout: 'form',
                defaults: {
                    hideLabel: true,
                    anchor: '100%'
                }
            };

            if(this.items[0].items){

                

                Ext.apply(panelCfg, {
                    layoutConfig: {columns: this.items.length},
                    defaults: this.defaults,
                    items: this.items
                });
                for(var i=0, len=this.items.length; i<len; i++){
                    Ext.applyIf(this.items[i], colCfg);
                }

            }else{

                
                

                var numCols, cols = [];

                if(typeof this.columns == 'string'){ 
                    this.columns = this.items.length;
                }
                if(!Ext.isArray(this.columns)){
                    var cs = [];
                    for(var i=0; i<this.columns; i++){
                        cs.push((100/this.columns)*.01); 
                    }
                    this.columns = cs;
                }

                numCols = this.columns.length;

                
                for(var i=0; i<numCols; i++){
                    var cc = Ext.apply({items:[]}, colCfg);
                    cc[this.columns[i] <= 1 ? 'columnWidth' : 'width'] = this.columns[i];
                    if(this.defaults){
                        cc.defaults = Ext.apply(cc.defaults || {}, this.defaults);
                    }
                    cols.push(cc);
                };

                
                if(this.vertical){
                    var rows = Math.ceil(this.items.length / numCols), ri = 0;
                    for(var i=0, len=this.items.length; i<len; i++){
                        if(i>0 && i%rows==0){
                            ri++;
                        }
                        if(this.items[i].fieldLabel){
                            this.items[i].hideLabel = false;
                        }
                        cols[ri].items.push(this.items[i]);
                    };
                }else{
                    for(var i=0, len=this.items.length; i<len; i++){
                        var ci = i % numCols;
                        if(this.items[i].fieldLabel){
                            this.items[i].hideLabel = false;
                        }
                        cols[ci].items.push(this.items[i]);
                    };
                }

                Ext.apply(panelCfg, {
                    layoutConfig: {columns: numCols},
                    items: cols
                });
            }

            this.panel = new Container(panelCfg);
            this.panel.ownerCt = this;
            this.el = this.panel.getEl();

            if(this.forId && this.itemCls){
                var l = this.el.up(this.itemCls).child('label', true);
                if(l){
                    l.setAttribute('htmlFor', this.forId);
                }
            }

            var fields = this.panel.findBy(function(c){
                return c.isFormField;
            }, this);

            this.items = new MixedCollection();
            this.items.addAll(fields);
        }
        CheckboxGroup.superclass.onRender.call(this, ct, position);
    },

    initValue : function(){
        if(this.value){
            this.setValue.apply(this, this.buffered ? this.value : [this.value]);
            delete this.buffered;
            delete this.value;
        }
    },

    afterRender : function(){
        CheckboxGroup.superclass.afterRender.call(this);
        this.eachItem(function(item){
            item.on('check', this.fireChecked, this);
            item.inGroup = true;
        });
    },

    
    doLayout: function(){
        
        if(this.rendered){
            this.panel.forceLayout = this.ownerCt.forceLayout;
            this.panel.doLayout();
        }
    },

    
    fireChecked: function(){
        var arr = [];
        this.eachItem(function(item){
            if(item.checked){
                arr.push(item);
            }
        });
        this.fireEvent('change', this, arr);
    },
    
    
    getErrors: function() {
        var errors = CheckboxGroup.superclass.getErrors.apply(this, arguments);
        
        if (!this.allowBlank) {
            var blank = true;
            
            this.eachItem(function(f){
                if (f.checked) {
                    return (blank = false);
                }
            });
            
            if (blank) errors.push(this.blankText);
        }
        
        return errors;
    },

    
    isDirty: function(){
        
        if (this.disabled || !this.rendered) {
            return false;
        }

        var dirty = false;
        
        this.eachItem(function(item){
            if(item.isDirty()){
                dirty = true;
                return false;
            }
        });
        
        return dirty;
    },

    
    setReadOnly : function(readOnly){
        if(this.rendered){
            this.eachItem(function(item){
                item.setReadOnly(readOnly);
            });
        }
        this.readOnly = readOnly;
    },

    
    onDisable : function(){
        this.eachItem(function(item){
            item.disable();
        });
    },

    
    onEnable : function(){
        this.eachItem(function(item){
            item.enable();
        });
    },

    
    onResize : function(w, h){
        this.panel.setSize(w, h);
        this.panel.doLayout();
    },

    
    reset : function(){
        if (this.originalValue) {
            
            this.eachItem(function(c){
                if(c.setValue){
                    c.setValue(false);
                    c.originalValue = c.getValue();
                }
            });
            
            
            this.resetOriginal = true;
            this.setValue(this.originalValue);
            delete this.resetOriginal;
        } else {
            this.eachItem(function(c){
                if(c.reset){
                    c.reset();
                }
            });
        }
        
        
        (function() {
            this.clearInvalid();
        }).defer(50, this);
    },

    
    setValue: function(){
        if(this.rendered){
            this.onSetValue.apply(this, arguments);
        }else{
            this.buffered = true;
            this.value = arguments;
        }
        return this;
    },

    
    onSetValue: function(id, value){
        if(arguments.length == 1){
            if(Ext.isArray(id)){
                Ext.each(id, function(val, idx){
                    if (Ext.isObject(val) && val.setValue){ 
                        val.setValue(true);
                        if (this.resetOriginal === true) {
                            val.originalValue = val.getValue();
                        }
                    } else { 
                        var item = this.items.itemAt(idx);
                        if(item){
                            item.setValue(val);
                        }
                    }
                }, this);
            }else if(Ext.isObject(id)){
                
                for(var i in id){
                    var f = this.getBox(i);
                    if(f){
                        f.setValue(id[i]);
                    }
                }
            }else{
                this.setValueForItem(id);
            }
        }else{
            var f = this.getBox(id);
            if(f){
                f.setValue(value);
            }
        }
    },

    
    beforeDestroy: function(){
        Ext.destroy(this.panel);
        CheckboxGroup.superclass.beforeDestroy.call(this);

    },

    setValueForItem : function(val){
        val = String(val).split(',');
        this.eachItem(function(item){
            if(val.indexOf(item.inputValue)> -1){
                item.setValue(true);
            }
        });
    },

    
    getBox : function(id){
        var box = null;
        this.eachItem(function(f){
            if(id == f || f.dataIndex == id || f.id == id || f.getName() == id){
                box = f;
                return false;
            }
        });
        return box;
    },

    
    getValue : function(){
        var out = [];
        this.eachItem(function(item){
            if(item.checked){
                out.push(item);
            }
        });
        return out;
    },

    
    eachItem: function(fn, scope) {
        if(this.items && this.items.each){
            this.items.each(fn, scope || this);
        }
    },

    

    
    getRawValue : Ext.emptyFn,

    
    setRawValue : Ext.emptyFn

});

Ext.reg('checkboxgroup', CheckboxGroup);

export default CheckboxGroup;