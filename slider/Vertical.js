//import Ext from '../Base';
import Format from '../util/Format';

var Vertical = {
    onResize : function(w, h){
        this.innerEl.setHeight(h - (this.el.getPadding('t') + this.endEl.getPadding('b')));
        this.syncThumb();
    },

    getRatio : function(){
        var h = this.innerEl.getHeight(),
            v = this.maxValue - this.minValue;
        return h/v;
    },

    moveThumb: function(index, v, animate) {
        var thumb = this.thumbs[index],
            el    = thumb.el;

        if (!animate || this.animate === false) {
            el.setBottom(v);
        } else {
            el.shift({bottom: v, stopFx: true, duration:.35});
        }
    },

    onClickChange : function(local) {
        if (local.left > this.clickRange[0] && local.left < this.clickRange[1]) {
            var thumb = this.getNearest(local, 'top'),
                index = thumb.index,
                value = this.minValue + this.reverseValue(this.innerEl.getHeight() - local.top);

            this.setValue(index, Format.round(value, this.decimalPrecision), undefined, true);
        }
    }
};

export default Vertical;