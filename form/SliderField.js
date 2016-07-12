import Ext from '../Base';
import Field from './Field';
import Tip  from '../slider/Tip';
import Slider from '../Slider';

var SliderField = Ext.extend(Field, {
    
    
    useTips : true,
    
    
    tipText : null,
    
    
    actionMode: 'wrap',
    
    
    initComponent : function() {
        var cfg = Ext.copyTo({
            id: this.id + '-slider'
        }, this.initialConfig, ['vertical', 'minValue', 'maxValue', 'decimalPrecision', 'keyIncrement', 'increment', 'clickToChange', 'animate']);
        
        
        if (this.useTips) {
            var plug = this.tipText ? {getText: this.tipText} : {};
            cfg.plugins = [new Tip(plug)];
        }
        this.slider = new Slider(cfg);
        SliderField.superclass.initComponent.call(this);
    },    
    
    
    onRender : function(ct, position){
        this.autoCreate = {
            id: this.id,
            name: this.name,
            type: 'hidden',
            tag: 'input'    
        };
        SliderField.superclass.onRender.call(this, ct, position);
        this.wrap = this.el.wrap({cls: 'x-form-field-wrap'});
        this.resizeEl = this.positionEl = this.wrap;
        this.slider.render(this.wrap);
    },
    
    
    onResize : function(w, h, aw, ah){
        SliderField.superclass.onResize.call(this, w, h, aw, ah);
        this.slider.setSize(w, h);    
    },
    
    
    initEvents : function(){
        SliderField.superclass.initEvents.call(this);
        this.slider.on('change', this.onChange, this);   
    },
    
    
    onChange : function(slider, v){
        this.setValue(v, undefined, true);
    },
    
    
    onEnable : function(){
        SliderField.superclass.onEnable.call(this);
        this.slider.enable();
    },
    
    
    onDisable : function(){
        SliderField.superclass.onDisable.call(this);
        this.slider.disable();    
    },
    
    
    beforeDestroy : function(){
        Ext.destroy(this.slider);
        SliderField.superclass.beforeDestroy.call(this);
    },
    
    
    alignErrorIcon : function(){
        this.errorIcon.alignTo(this.slider.el, 'tl-tr', [2, 0]);
    },
    
    
    setMinValue : function(v){
        this.slider.setMinValue(v);
        return this;    
    },
    
    
    setMaxValue : function(v){
        this.slider.setMaxValue(v);
        return this;    
    },
    
    
    setValue : function(v, animate,  silent){
        
        
        if(!silent){
            this.slider.setValue(v, animate);
        }
        return SliderField.superclass.setValue.call(this, this.slider.getValue());
    },
    
    
    getValue : function(){
        return this.slider.getValue();    
    }
});

Ext.reg('sliderfield', SliderField);

export default SliderField;