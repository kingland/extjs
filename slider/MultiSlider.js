
import Ext from '../Base';
import Vertical from './Vertical';
import Thumb from './Thumb';
import BoxComponent from '../BoxComponent';
import Format from '../util/Format';

var MultiSlider = Ext.extend(BoxComponent, {
    
    
    vertical: false,
    
    minValue: 0,
    
    maxValue: 100,
    
    decimalPrecision: 0,
    
    keyIncrement: 1,
    
    increment: 0,

    
    clickRange: [5,15],

    
    clickToChange : true,
    
    animate: true,

    
    dragging: false,

    
    constrainThumbs: true,

    
    topThumbZIndex: 10000,

    
    initComponent : function(){
        if(!Ext.isDefined(this.value)){
            this.value = this.minValue;
        }

        
        this.thumbs = [];

        MultiSlider.superclass.initComponent.call(this);

        this.keyIncrement = Math.max(this.increment, this.keyIncrement);
        this.addEvents(
            
            'beforechange',

            
            'change',

            
            'changecomplete',

            
            'dragstart',

            
            'drag',

            
            'dragend'
        );

        
        if (this.values == undefined || Ext.isEmpty(this.values)) this.values = [0];

        var values = this.values;

        for (var i=0; i < values.length; i++) {
            this.addThumb(values[i]);
        }

        if(this.vertical){
            Ext.apply(this, Vertical);
        }
    },

    
    addThumb: function(value) {
        var thumb = new Thumb({
            value    : value,
            slider   : this,
            index    : this.thumbs.length,
            constrain: this.constrainThumbs
        });
        this.thumbs.push(thumb);

        
        if (this.rendered) thumb.render();
    },

    
    promoteThumb: function(topThumb) {
        var thumbs = this.thumbs,
            zIndex, thumb;

        for (var i = 0, j = thumbs.length; i < j; i++) {
            thumb = thumbs[i];

            if (thumb == topThumb) {
                zIndex = this.topThumbZIndex;
            } else {
                zIndex = '';
            }

            thumb.el.setStyle('zIndex', zIndex);
        }
    },

    
    onRender : function() {
        this.autoEl = {
            cls: 'x-slider ' + (this.vertical ? 'x-slider-vert' : 'x-slider-horz'),
            cn : {
                cls: 'x-slider-end',
                cn : {
                    cls:'x-slider-inner',
                    cn : [{tag:'a', cls:'x-slider-focus', href:"#", tabIndex: '-1', hidefocus:'on'}]
                }
            }
        };

        MultiSlider.superclass.onRender.apply(this, arguments);

        this.endEl   = this.el.first();
        this.innerEl = this.endEl.first();
        this.focusEl = this.innerEl.child('.x-slider-focus');

        
        for (var i=0; i < this.thumbs.length; i++) {
            this.thumbs[i].render();
        }

        
        var thumb      = this.innerEl.child('.x-slider-thumb');
        this.halfThumb = (this.vertical ? thumb.getHeight() : thumb.getWidth()) / 2;

        this.initEvents();
    },

    
    initEvents : function(){
        this.mon(this.el, {
            scope    : this,
            mousedown: this.onMouseDown,
            keydown  : this.onKeyDown
        });

        this.focusEl.swallowEvent("click", true);
    },

    
    onMouseDown : function(e){
        if(this.disabled){
            return;
        }

        
        var thumbClicked = false;
        for (var i=0; i < this.thumbs.length; i++) {
            thumbClicked = thumbClicked || e.target == this.thumbs[i].el.dom;
        }

        if (this.clickToChange && !thumbClicked) {
            var local = this.innerEl.translatePoints(e.getXY());
            this.onClickChange(local);
        }
        this.focus();
    },

    
    onClickChange : function(local) {
        if (local.top > this.clickRange[0] && local.top < this.clickRange[1]) {
            
            var thumb = this.getNearest(local, 'left'),
                index = thumb.index;

            this.setValue(index, Format.round(this.reverseValue(local.left), this.decimalPrecision), undefined, true);
        }
    },

    
    getNearest: function(local, prop) {
        var localValue = prop == 'top' ? this.innerEl.getHeight() - local[prop] : local[prop],
            clickValue = this.reverseValue(localValue),
            nearestDistance = (this.maxValue - this.minValue) + 5, 
            index = 0,
            nearest = null;

        for (var i=0; i < this.thumbs.length; i++) {
            var thumb = this.thumbs[i],
                value = thumb.value,
                dist  = Math.abs(value - clickValue);

            if (Math.abs(dist <= nearestDistance)) {
                nearest = thumb;
                index = i;
                nearestDistance = dist;
            }
        }
        return nearest;
    },

    
    onKeyDown : function(e){
        
        if(this.disabled || this.thumbs.length !== 1){
            e.preventDefault();
            return;
        }
        var k = e.getKey(),
            val;
        switch(k){
            case e.UP:
            case e.RIGHT:
                e.stopEvent();
                val = e.ctrlKey ? this.maxValue : this.getValue(0) + this.keyIncrement;
                this.setValue(0, val, undefined, true);
            break;
            case e.DOWN:
            case e.LEFT:
                e.stopEvent();
                val = e.ctrlKey ? this.minValue : this.getValue(0) - this.keyIncrement;
                this.setValue(0, val, undefined, true);
            break;
            default:
                e.preventDefault();
        }
    },

    
    doSnap : function(value){
        if (!(this.increment && value)) {
            return value;
        }
        var newValue = value,
            inc = this.increment,
            m = value % inc;
        if (m != 0) {
            newValue -= m;
            if (m * 2 >= inc) {
                newValue += inc;
            } else if (m * 2 < -inc) {
                newValue -= inc;
            }
        }
        return newValue.constrain(this.minValue,  this.maxValue);
    },

    
    afterRender : function(){
        MultiSlider.superclass.afterRender.apply(this, arguments);

        for (var i=0; i < this.thumbs.length; i++) {
            var thumb = this.thumbs[i];

            if (thumb.value !== undefined) {
                var v = this.normalizeValue(thumb.value);

                if (v !== thumb.value) {
                    
                    this.setValue(i, v, false);
                } else {
                    this.moveThumb(i, this.translateValue(v), false);
                }
            }
        };
    },

    
    getRatio : function(){
        var w = this.innerEl.getWidth(),
            v = this.maxValue - this.minValue;
        return v == 0 ? w : (w/v);
    },

    
    normalizeValue : function(v){
        v = this.doSnap(v);
        v = Format.round(v, this.decimalPrecision);
        v = v.constrain(this.minValue, this.maxValue);
        return v;
    },

    
    setMinValue : function(val){
        this.minValue = val;
        var i = 0,
            thumbs = this.thumbs,
            len = thumbs.length,
            t;
            
        for(; i < len; ++i){
            t = thumbs[i];
            t.value = t.value < val ? val : t.value;
        }
        this.syncThumb();
    },

    
    setMaxValue : function(val){
        this.maxValue = val;
        var i = 0,
            thumbs = this.thumbs,
            len = thumbs.length,
            t;
            
        for(; i < len; ++i){
            t = thumbs[i];
            t.value = t.value > val ? val : t.value;
        }
        this.syncThumb();
    },

    
    setValue : function(index, v, animate, changeComplete) {
        var thumb = this.thumbs[index],
            el    = thumb.el;

        v = this.normalizeValue(v);

        if (v !== thumb.value && this.fireEvent('beforechange', this, v, thumb.value, thumb) !== false) {
            thumb.value = v;
            if(this.rendered){
                this.moveThumb(index, this.translateValue(v), animate !== false);
                this.fireEvent('change', this, v, thumb);
                if(changeComplete){
                    this.fireEvent('changecomplete', this, v, thumb);
                }
            }
        }
    },

    
    translateValue : function(v) {
        var ratio = this.getRatio();
        return (v * ratio) - (this.minValue * ratio) - this.halfThumb;
    },

    
    reverseValue : function(pos){
        var ratio = this.getRatio();
        return (pos + (this.minValue * ratio)) / ratio;
    },

    
    moveThumb: function(index, v, animate){
        var thumb = this.thumbs[index].el;

        if(!animate || this.animate === false){
            thumb.setLeft(v);
        }else{
            thumb.shift({left: v, stopFx: true, duration:.35});
        }
    },

    
    focus : function(){
        this.focusEl.focus(10);
    },

    
    onResize : function(w, h){
        var thumbs = this.thumbs,
            len = thumbs.length,
            i = 0;
            
        
        for(; i < len; ++i){
            thumbs[i].el.stopFx();    
        }
        this.innerEl.setWidth(w - (this.el.getPadding('l') + this.endEl.getPadding('r')));
        this.syncThumb();
        MultiSlider.superclass.onResize.apply(this, arguments);
    },

    
    onDisable: function(){
        MultiSlider.superclass.onDisable.call(this);

        for (var i=0; i < this.thumbs.length; i++) {
            var thumb = this.thumbs[i],
                el    = thumb.el;

            thumb.disable();

            if(Ext.isIE){
                
                
                var xy = el.getXY();
                el.hide();

                this.innerEl.addClass(this.disabledClass).dom.disabled = true;

                if (!this.thumbHolder) {
                    this.thumbHolder = this.endEl.createChild({cls: 'x-slider-thumb ' + this.disabledClass});
                }

                this.thumbHolder.show().setXY(xy);
            }
        }
    },

    
    onEnable: function(){
        MultiSlider.superclass.onEnable.call(this);

        for (var i=0; i < this.thumbs.length; i++) {
            var thumb = this.thumbs[i],
                el    = thumb.el;

            thumb.enable();

            if (Ext.isIE) {
                this.innerEl.removeClass(this.disabledClass).dom.disabled = false;

                if (this.thumbHolder) this.thumbHolder.hide();

                el.show();
                this.syncThumb();
            }
        }
    },

    
    syncThumb : function() {
        if (this.rendered) {
            for (var i=0; i < this.thumbs.length; i++) {
                this.moveThumb(i, this.translateValue(this.thumbs[i].value));
            }
        }
    },

    
    getValue : function(index) {
        return this.thumbs[index].value;
    },

    
    getValues: function() {
        var values = [];

        for (var i=0; i < this.thumbs.length; i++) {
            values.push(this.thumbs[i].value);
        }

        return values;
    },

    
    beforeDestroy : function(){
        Ext.destroyMembers(this, 'endEl', 'innerEl', 'thumb', 'halfThumb', 'focusEl', 'tracker', 'thumbHolder');
        MultiSlider.superclass.beforeDestroy.call(this);
    }
});

Ext.reg('multislider', MultiSlider);

export default MultiSlider;