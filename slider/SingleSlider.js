import Ext from '../Base';
import MultiSlider from './MultiSlider';

var SingleSlider = Ext.extend(MultiSlider, {
    constructor: function(config) {
      config = config || {};

      Ext.applyIf(config, {
          values: [config.value || 0]
      });

      SingleSlider.superclass.constructor.call(this, config);
    },

    
    getValue: function() {
        
        return SingleSlider.superclass.getValue.call(this, 0);
    },

    
    setValue: function(value, animate) {
        var args = Ext.toArray(arguments),
            len  = args.length;

        
        
        
        if (len == 1 || (len <= 3 && typeof arguments[1] != 'number')) {
            args.unshift(0);
        }

        return SingleSlider.superclass.setValue.apply(this, args);
    },

    
    syncThumb : function() {
        return SingleSlider.superclass.syncThumb.apply(this, [0].concat(arguments));
    },
    
    
    getNearest : function(){
        
        return this.thumbs[0];    
    }
});

Ext.reg('slider', SingleSlider);

export default SingleSlider;