import Ext from '../Base';
import Format from '../util/Format';
import DragTracker from '../dd/DragTracker';

var Thumb = Ext.extend(Object, {

    
    constructor: function(config) {
        
        Ext.apply(this, config || {}, {
            cls: 'x-slider-thumb',

            
            constrain: false
        });

        Thumb.superclass.constructor.call(this, config);

        if (this.slider.vertical) {
            Ext.apply(this, Thumb.Vertical);
        }
    },

    
    render: function() {
        this.el = this.slider.innerEl.insertFirst({cls: this.cls});

        this.initEvents();
    },

    
    enable: function() {
        this.disabled = false;
        this.el.removeClass(this.slider.disabledClass);
    },

    
    disable: function() {
        this.disabled = true;
        this.el.addClass(this.slider.disabledClass);
    },

    
    initEvents: function() {
        var el = this.el;

        el.addClassOnOver('x-slider-thumb-over');

        this.tracker = new DragTracker({
            onBeforeStart: this.onBeforeDragStart.createDelegate(this),
            onStart      : this.onDragStart.createDelegate(this),
            onDrag       : this.onDrag.createDelegate(this),
            onEnd        : this.onDragEnd.createDelegate(this),
            tolerance    : 3,
            autoStart    : 300
        });

        this.tracker.initEl(el);
    },

    
    onBeforeDragStart : function(e) {
        if (this.disabled) {
            return false;
        } else {
            this.slider.promoteThumb(this);
            return true;
        }
    },

    
    onDragStart: function(e){
        this.el.addClass('x-slider-thumb-drag');
        this.dragging = true;
        this.dragStartValue = this.value;

        this.slider.fireEvent('dragstart', this.slider, e, this);
    },

    
    onDrag: function(e) {
        var slider   = this.slider,
            index    = this.index,
            newValue = this.getNewValue();

        if (this.constrain) {
            var above = slider.thumbs[index + 1],
                below = slider.thumbs[index - 1];

            if (below != undefined && newValue <= below.value) newValue = below.value;
            if (above != undefined && newValue >= above.value) newValue = above.value;
        }

        slider.setValue(index, newValue, false);
        slider.fireEvent('drag', slider, e, this);
    },

    getNewValue: function() {
        var slider   = this.slider,
            pos      = slider.innerEl.translatePoints(this.tracker.getXY());

        return Format.round(slider.reverseValue(pos.left), slider.decimalPrecision);
    },

    
    onDragEnd: function(e) {
        var slider = this.slider,
            value  = this.value;

        this.el.removeClass('x-slider-thumb-drag');

        this.dragging = false;
        slider.fireEvent('dragend', slider, e);

        if (this.dragStartValue != value) {
            slider.fireEvent('changecomplete', slider, value, this);
        }
    }
});

Thumb.Vertical = {
    getNewValue: function() {
        var slider   = this.slider,
            innerEl  = slider.innerEl,
            pos      = innerEl.translatePoints(this.tracker.getXY()),
            bottom   = innerEl.getHeight() - pos.top;

        return slider.minValue + Format.round(bottom / slider.getRatio(), slider.decimalPrecision);
    }
};

export default Thumb;