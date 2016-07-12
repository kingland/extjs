import Ext from './Base';
import Panel from './Panel';
import BoxComponent from './BoxComponent';
import Button from './Button';
import SplitButton from './SplitButton';
import Container from './Container';

var Toolbar = function(config){
    if(Ext.isArray(config)){
        config = {items: config, layout: 'toolbar'};
    } else {
        config = Ext.apply({
            layout: 'toolbar'
        }, config);
        if(config.buttons) {
            config.items = config.buttons;
        }
    }
    Toolbar.superclass.constructor.call(this, config);
};


(function(){

var T = Toolbar;

Ext.extend(T, Container, {

    defaultType: 'button',

    

    enableOverflow : false,

    
    

    trackMenus : true,
    internalDefaults: {removeMode: 'container', hideParent: true},
    toolbarCls: 'x-toolbar',

    initComponent : function(){
        T.superclass.initComponent.call(this);

        
        this.addEvents('overflowchange');
    },

    
    onRender : function(ct, position){
        if(!this.el){
            if(!this.autoCreate){
                this.autoCreate = {
                    cls: this.toolbarCls + ' x-small-editor'
                };
            }
            this.el = ct.createChild(Ext.apply({ id: this.id },this.autoCreate), position);
            Toolbar.superclass.onRender.apply(this, arguments);
        }
    },

    

    
    lookupComponent : function(c){
        if(Ext.isString(c)){
            if(c == '-'){
                c = new T.Separator();
            }else if(c == ' '){
                c = new T.Spacer();
            }else if(c == '->'){
                c = new T.Fill();
            }else{
                c = new T.TextItem(c);
            }
            this.applyDefaults(c);
        }else{
            if(c.isFormField || c.render){ 
                c = this.createComponent(c);
            }else if(c.tag){ 
                c = new T.Item({autoEl: c});
            }else if(c.tagName){ 
                c = new T.Item({el:c});
            }else if(Ext.isObject(c)){ 
                c = c.xtype ? this.createComponent(c) : this.constructButton(c);
            }
        }
        return c;
    },

    
    applyDefaults : function(c){
        if(!Ext.isString(c)){
            c = Toolbar.superclass.applyDefaults.call(this, c);
            var d = this.internalDefaults;
            if(c.events){
                Ext.applyIf(c.initialConfig, d);
                Ext.apply(c, d);
            }else{
                Ext.applyIf(c, d);
            }
        }
        return c;
    },

    
    addSeparator : function(){
        return this.add(new T.Separator());
    },

    
    addSpacer : function(){
        return this.add(new T.Spacer());
    },

    
    addFill : function(){
        this.add(new T.Fill());
    },

    
    addElement : function(el){
        return this.addItem(new T.Item({el:el}));
    },

    
    addItem : function(item){
        return this.add.apply(this, arguments);
    },

    
    addButton : function(config){
        if(Ext.isArray(config)){
            var buttons = [];
            for(var i = 0, len = config.length; i < len; i++) {
                buttons.push(this.addButton(config[i]));
            }
            return buttons;
        }
        return this.add(this.constructButton(config));
    },

    
    addText : function(text){
        return this.addItem(new T.TextItem(text));
    },

    
    addDom : function(config){
        return this.add(new T.Item({autoEl: config}));
    },

    
    addField : function(field){
        return this.add(field);
    },

    
    insertButton : function(index, item){
        if(Ext.isArray(item)){
            var buttons = [];
            for(var i = 0, len = item.length; i < len; i++) {
               buttons.push(this.insertButton(index + i, item[i]));
            }
            return buttons;
        }
        return Toolbar.superclass.insert.call(this, index, item);
    },

    
    trackMenu : function(item, remove){
        if(this.trackMenus && item.menu){
            var method = remove ? 'mun' : 'mon';
            this[method](item, 'menutriggerover', this.onButtonTriggerOver, this);
            this[method](item, 'menushow', this.onButtonMenuShow, this);
            this[method](item, 'menuhide', this.onButtonMenuHide, this);
        }
    },

    
    constructButton : function(item){
        var b = item.events ? item : this.createComponent(item, item.split ? 'splitbutton' : this.defaultType);
        return b;
    },

    
    onAdd : function(c){
        Toolbar.superclass.onAdd.call(this);
        this.trackMenu(c);
        if(this.disabled){
            c.disable();
        }
    },

    
    onRemove : function(c){
        Toolbar.superclass.onRemove.call(this);
        this.trackMenu(c, true);
    },

    
    onDisable : function(){
        this.items.each(function(item){
             if(item.disable){
                 item.disable();
             }
        });
    },

    
    onEnable : function(){
        this.items.each(function(item){
             if(item.enable){
                 item.enable();
             }
        });
    },

    
    onButtonTriggerOver : function(btn){
        if(this.activeMenuBtn && this.activeMenuBtn != btn){
            this.activeMenuBtn.hideMenu();
            btn.showMenu();
            this.activeMenuBtn = btn;
        }
    },

    
    onButtonMenuShow : function(btn){
        this.activeMenuBtn = btn;
    },

    
    onButtonMenuHide : function(btn){
        delete this.activeMenuBtn;
    }
});
Ext.reg('toolbar', Toolbar);


T.Item = Ext.extend(BoxComponent, {
    hideParent: true, 
    enable:Ext.emptyFn,
    disable:Ext.emptyFn,
    focus:Ext.emptyFn
    
});
Ext.reg('tbitem', T.Item);


T.Separator = Ext.extend(T.Item, {
    onRender : function(ct, position){
        this.el = ct.createChild({tag:'span', cls:'xtb-sep'}, position);
    }
});
Ext.reg('tbseparator', T.Separator);


T.Spacer = Ext.extend(T.Item, {
    

    onRender : function(ct, position){
        this.el = ct.createChild({tag:'div', cls:'xtb-spacer', style: this.width?'width:'+this.width+'px':''}, position);
    }
});
Ext.reg('tbspacer', T.Spacer);


T.Fill = Ext.extend(T.Item, {
    
    render : Ext.emptyFn,
    isFill : true
});
Ext.reg('tbfill', T.Fill);


T.TextItem = Ext.extend(T.Item, {
    

    constructor: function(config){
        T.TextItem.superclass.constructor.call(this, Ext.isString(config) ? {text: config} : config);
    },

    
    onRender : function(ct, position) {
        this.autoEl = {cls: 'xtb-text', html: this.text || ''};
        T.TextItem.superclass.onRender.call(this, ct, position);
    },

    
    setText : function(t) {
        if(this.rendered){
            this.el.update(t);
        }else{
            this.text = t;
        }
    }
});
Ext.reg('tbtext', T.TextItem);


T.Button = Ext.extend(Button, {});
T.SplitButton = Ext.extend(SplitButton, {});
Ext.reg('tbbutton', T.Button);
Ext.reg('tbsplit', T.SplitButton);

})();

export default Toolbar;