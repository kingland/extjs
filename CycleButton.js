import Ext from './Base';
import SplitButton from './SplitButton';


var CycleButton = Ext.extend(SplitButton, {
    
    getItemText : function(item){
        if(item && this.showText === true){
            var text = '';
            if(this.prependText){
                text += this.prependText;
            }
            text += item.text;
            return text;
        }
        return undefined;
    },

    
    setActiveItem : function(item, suppressEvent){
        if(!Ext.isObject(item)){
            item = this.menu.getComponent(item);
        }
        if(item){
            if(!this.rendered){
                this.text = this.getItemText(item);
                this.iconCls = item.iconCls;
            }else{
                var t = this.getItemText(item);
                if(t){
                    this.setText(t);
                }
                this.setIconClass(item.iconCls);
            }
            this.activeItem = item;
            if(!item.checked){
                item.setChecked(true, false);
            }
            if(this.forceIcon){
                this.setIconClass(this.forceIcon);
            }
            if(!suppressEvent){
                this.fireEvent('change', this, item);
            }
        }
    },

    
    getActiveItem : function(){
        return this.activeItem;
    },

    
    initComponent : function(){
        this.addEvents(
            
            "change"
        );

        if(this.changeHandler){
            this.on('change', this.changeHandler, this.scope||this);
            delete this.changeHandler;
        }

        this.itemCount = this.items.length;

        this.menu = {cls:'x-cycle-menu', items:[]};
        var checked = 0;
        Ext.each(this.items, function(item, i){
            Ext.apply(item, {
                group: item.group || this.id,
                itemIndex: i,
                checkHandler: this.checkHandler,
                scope: this,
                checked: item.checked || false
            });
            this.menu.items.push(item);
            if(item.checked){
                checked = i;
            }
        }, this);
        CycleButton.superclass.initComponent.call(this);
        this.on('click', this.toggleSelected, this);
        this.setActiveItem(checked, true);
    },

    
    checkHandler : function(item, pressed){
        if(pressed){
            this.setActiveItem(item);
        }
    },

    
    toggleSelected : function(){
        var m = this.menu;
        m.render();
        
        if(!m.hasLayout){
            m.doLayout();
        }
        
        var nextIdx, checkItem;
        for (var i = 1; i < this.itemCount; i++) {
            nextIdx = (this.activeItem.itemIndex + i) % this.itemCount;
            
            checkItem = m.items.itemAt(nextIdx);
            
            if (!checkItem.disabled) {
                checkItem.setChecked(true);
                break;
            }
        }
    }
});
Ext.reg('cycle', CycleButton);

export default CycleButton;