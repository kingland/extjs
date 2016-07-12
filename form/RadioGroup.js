import Ext from '../Base';
import CheckboxGroup from './CheckboxGroup';
import DelayedTask from '../util/DelayedTask';

var RadioGroup = Ext.extend(CheckboxGroup, {
    
    
    allowBlank : true,
    
    blankText : 'You must select one item in this group',
    
    
    defaultType : 'radio',
    
    
    groupCls : 'x-form-radio-group',
    
    
    
    
    getValue : function(){
        var out = null;
        this.eachItem(function(item){
            if(item.checked){
                out = item;
                return false;
            }
        });
        return out;
    },
    
    
    onSetValue : function(id, value){
        if(arguments.length > 1){
            var f = this.getBox(id);
            if(f){
                f.setValue(value);
                if(f.checked){
                    this.eachItem(function(item){
                        if (item !== f){
                            item.setValue(false);
                        }
                    });
                }
            }
        }else{
            this.setValueForItem(id);
        }
    },
    
    setValueForItem : function(val){
        val = String(val).split(',')[0];
        this.eachItem(function(item){
            item.setValue(val == item.inputValue);
        });
    },
    
    
    fireChecked : function(){
        if(!this.checkTask){
            this.checkTask = new DelayedTask(this.bufferChecked, this);
        }
        this.checkTask.delay(10);
    },
    
    
    bufferChecked : function(){
        var out = null;
        this.eachItem(function(item){
            if(item.checked){
                out = item;
                return false;
            }
        });
        this.fireEvent('change', this, out);
    },
    
    onDestroy : function(){
        if(this.checkTask){
            this.checkTask.cancel();
            this.checkTask = null;
        }
        RadioGroup.superclass.onDestroy.call(this);
    }

});

Ext.reg('radiogroup', RadioGroup);

export default RadioGroup;