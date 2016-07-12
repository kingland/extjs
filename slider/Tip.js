import Ext from '../Base';
import Tip from '../Tip';

var STip = Ext.extend( Tip, {
    minWidth: 10,
    offsets : [0, -10],
    
    init: function(slider) {
        slider.on({
            scope    : this,
            dragstart: this.onSlide,
            drag     : this.onSlide,
            dragend  : this.hide,
            destroy  : this.destroy
        });
    },
    
    
    onSlide : function(slider, e, thumb) {
        this.show();
        this.body.update(this.getText(thumb));
        this.doAutoWidth();
        this.el.alignTo(thumb.el, 'b-t?', this.offsets);
    },

    
    getText : function(thumb) {
        return String(thumb.value);
    }
});

export default STip;