import Ext from '../Base';
import TextField from './TextField';

var TriggerField = Ext.extend(TextField,  {
    defaultAutoCreate : {tag: "input", type: "text", size: "16", autocomplete: "off"},
    
    hideTrigger:false,
    
    editable: true,
    
    readOnly: false,
    
    wrapFocusClass: 'x-trigger-wrap-focus',
    
    autoSize: Ext.emptyFn,
    
    monitorTab : true,
    
    deferHeight : true,
    
    mimicing : false,

    actionMode: 'wrap',

    defaultTriggerWidth: 17,

    
    onResize : function(w, h){
        TriggerField.superclass.onResize.call(this, w, h);
        var tw = this.getTriggerWidth();
        if(Ext.isNumber(w)){
            this.el.setWidth(w - tw);
        }
        this.wrap.setWidth(this.el.getWidth() + tw);
    },

    getTriggerWidth: function(){
        var tw = this.trigger.getWidth();
        if(!this.hideTrigger && !this.readOnly && tw === 0){
            tw = this.defaultTriggerWidth;
        }
        return tw;
    },

    
    alignErrorIcon : function(){
        if(this.wrap){
            this.errorIcon.alignTo(this.wrap, 'tl-tr', [2, 0]);
        }
    },

    
    onRender : function(ct, position){
        this.doc = Ext.isIE ? Ext.getBody() : Ext.getDoc();
        TriggerField.superclass.onRender.call(this, ct, position);

        this.wrap = this.el.wrap({cls: 'x-form-field-wrap x-form-field-trigger-wrap'});
        this.trigger = this.wrap.createChild(this.triggerConfig ||
                {tag: "img", src: Ext.BLANK_IMAGE_URL, cls: "x-form-trigger " + this.triggerClass});
        this.initTrigger();
        if(!this.width){
            this.wrap.setWidth(this.el.getWidth()+this.trigger.getWidth());
        }
        this.resizeEl = this.positionEl = this.wrap;
    },

    getWidth: function() {
        return(this.el.getWidth() + this.trigger.getWidth());
    },

    updateEditState: function(){
        if(this.rendered){
            if (this.readOnly) {
                this.el.dom.readOnly = true;
                this.el.addClass('x-trigger-noedit');
                this.mun(this.el, 'click', this.onTriggerClick, this);
                this.trigger.setDisplayed(false);
            } else {
                if (!this.editable) {
                    this.el.dom.readOnly = true;
                    this.el.addClass('x-trigger-noedit');
                    this.mon(this.el, 'click', this.onTriggerClick, this);
                } else {
                    this.el.dom.readOnly = false;
                    this.el.removeClass('x-trigger-noedit');
                    this.mun(this.el, 'click', this.onTriggerClick, this);
                }
                this.trigger.setDisplayed(!this.hideTrigger);
            }
            this.onResize(this.width || this.wrap.getWidth());
        }
    },

    setHideTrigger: function(hideTrigger){
        if(hideTrigger != this.hideTrigger){
            this.hideTrigger = hideTrigger;
            this.updateEditState();
        }
    },

    
    setEditable: function(editable){
        if(editable != this.editable){
            this.editable = editable;
            this.updateEditState();
        }
    },

    
    setReadOnly: function(readOnly){
        if(readOnly != this.readOnly){
            this.readOnly = readOnly;
            this.updateEditState();
        }
    },

    afterRender : function(){
        TriggerField.superclass.afterRender.call(this);
        this.updateEditState();
    },

    
    initTrigger : function(){
        this.mon(this.trigger, 'click', this.onTriggerClick, this, {preventDefault:true});
        this.trigger.addClassOnOver('x-form-trigger-over');
        this.trigger.addClassOnClick('x-form-trigger-click');
    },

    
    onDestroy : function(){
        Ext.destroy(this.trigger, this.wrap);
        if (this.mimicing){
            this.doc.un('mousedown', this.mimicBlur, this);
        }
        delete this.doc;
        TriggerField.superclass.onDestroy.call(this);
    },

    
    onFocus : function(){
        TriggerField.superclass.onFocus.call(this);
        if(!this.mimicing){
            this.wrap.addClass(this.wrapFocusClass);
            this.mimicing = true;
            this.doc.on('mousedown', this.mimicBlur, this, {delay: 10});
            if(this.monitorTab){
                this.on('specialkey', this.checkTab, this);
            }
        }
    },

    
    checkTab : function(me, e){
        if(e.getKey() == e.TAB){
            this.triggerBlur();
        }
    },

    
    onBlur : Ext.emptyFn,

    
    mimicBlur : function(e){
        if(!this.isDestroyed && !this.wrap.contains(e.target) && this.validateBlur(e)){
            this.triggerBlur();
        }
    },

    
    triggerBlur : function(){
        this.mimicing = false;
        this.doc.un('mousedown', this.mimicBlur, this);
        if(this.monitorTab && this.el){
            this.un('specialkey', this.checkTab, this);
        }
        TriggerField.superclass.onBlur.call(this);
        if(this.wrap){
            this.wrap.removeClass(this.wrapFocusClass);
        }
    },

    beforeBlur : Ext.emptyFn,

    
    
    validateBlur : function(e){
        return true;
    },
    onTriggerClick : Ext.emptyFn
    
});

export default TriggerField;