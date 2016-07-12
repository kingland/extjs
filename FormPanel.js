import Ext from './Base';
import Panel from './Panel';
import BasicForm from './form/BasicForm';
import TaskRunner from './util/TaskRunner';

var FormPanel = Ext.extend(Panel, {
    minButtonWidth : 75,

    
    labelAlign : 'left',

    
    monitorValid : false,

    
    monitorPoll : 200,

    
    layout : 'form',

    
    initComponent : function(){
        this.form = this.createForm();
        FormPanel.superclass.initComponent.call(this);

        this.bodyCfg = {
            tag: 'form',
            cls: this.baseCls + '-body',
            method : this.method || 'POST',
            id : this.formId || Ext.id()
        };
        if(this.fileUpload) {
            this.bodyCfg.enctype = 'multipart/form-data';
        }
        this.initItems();

        this.addEvents(
            
            'clientvalidation'
        );

        this.relayEvents(this.form, ['beforeaction', 'actionfailed', 'actioncomplete']);
    },

    
    createForm : function(){
        var config = Ext.applyIf({listeners: {}}, this.initialConfig);
        return new BasicForm(null, config);
    },

    
    initFields : function(){
        var f = this.form;
        var formPanel = this;
        var fn = function(c){
            if(formPanel.isField(c)){
                f.add(c);
            }else if(c.findBy && c != formPanel){
                formPanel.applySettings(c);
                
                if(c.items && c.items.each){
                    c.items.each(fn, this);
                }
            }
        };
        this.items.each(fn, this);
    },

    
    applySettings: function(c){
        var ct = c.ownerCt;
        Ext.applyIf(c, {
            labelAlign: ct.labelAlign,
            labelWidth: ct.labelWidth,
            itemCls: ct.itemCls
        });
    },

    
    getLayoutTarget : function(){
        return this.form.el;
    },

    
    getForm : function(){
        return this.form;
    },

    
    onRender : function(ct, position){
        this.initFields();
        FormPanel.superclass.onRender.call(this, ct, position);
        this.form.initEl(this.body);
    },

    
    beforeDestroy : function(){
        this.stopMonitoring();
        this.form.destroy(true);
        FormPanel.superclass.beforeDestroy.call(this);
    },

    
    isField : function(c) {
        return !!c.setValue && !!c.getValue && !!c.markInvalid && !!c.clearInvalid;
    },

    
    initEvents : function(){
        FormPanel.superclass.initEvents.call(this);
        
        this.on({
            scope: this,
            add: this.onAddEvent,
            remove: this.onRemoveEvent
        });
        if(this.monitorValid){ 
            this.startMonitoring();
        }
    },

    
    onAdd: function(c){
        FormPanel.superclass.onAdd.call(this, c);
        this.processAdd(c);
    },

    
    onAddEvent: function(ct, c){
        if(ct !== this){
            this.processAdd(c);
        }
    },

    
    processAdd : function(c){
        
        if(this.isField(c)){
            this.form.add(c);
        
        }else if(c.findBy){
            this.applySettings(c);
            this.form.add.apply(this.form, c.findBy(this.isField));
        }
    },

    
    onRemove: function(c){
        FormPanel.superclass.onRemove.call(this, c);
        this.processRemove(c);
    },

    onRemoveEvent: function(ct, c){
        if(ct !== this){
            this.processRemove(c);
        }
    },

    
    processRemove: function(c){
        if(!this.destroying){
            
            if(this.isField(c)){
                this.form.remove(c);
            
            }else if (c.findBy){
                Ext.each(c.findBy(this.isField), this.form.remove, this.form);
                if (c.isDestroyed) {
                    this.form.cleanDestroyed();
                }
            }
        }
    },

    
    startMonitoring : function(){
        if(!this.validTask){
            this.validTask = new TaskRunner();
            this.validTask.start({
                run : this.bindHandler,
                interval : this.monitorPoll || 200,
                scope: this
            });
        }
    },

    
    stopMonitoring : function(){
        if(this.validTask){
            this.validTask.stopAll();
            this.validTask = null;
        }
    },

    
    load : function(){
        this.form.load.apply(this.form, arguments);
    },

    
    onDisable : function(){
        FormPanel.superclass.onDisable.call(this);
        if(this.form){
            this.form.items.each(function(){
                 this.disable();
            });
        }
    },

    
    onEnable : function(){
        FormPanel.superclass.onEnable.call(this);
        if(this.form){
            this.form.items.each(function(){
                 this.enable();
            });
        }
    },

    
    bindHandler : function(){
        var valid = true;
        this.form.items.each(function(f){
            if(!f.isValid(true)){
                valid = false;
                return false;
            }
        });
        if(this.fbar){
            var fitems = this.fbar.items.items;
            for(var i = 0, len = fitems.length; i < len; i++){
                var btn = fitems[i];
                if(btn.formBind === true && btn.disabled === valid){
                    btn.setDisabled(!valid);
                }
            }
        }
        this.fireEvent('clientvalidation', this, valid);
    }
});
Ext.reg('form', FormPanel);

export default FormPanel;