import Ext from '../Base';
import AnchorLayout from './AnchorLayout';
//import Container from '../Container';

var AbsoluteLayout = Ext.extend(AnchorLayout, {

    extraCls: 'x-abs-layout-item',

    type: 'absolute',

    onLayout : function(ct, target){
        target.position();
        this.paddingLeft = target.getPadding('l');
        this.paddingTop = target.getPadding('t');
        AbsoluteLayout.superclass.onLayout.call(this, ct, target);
    },

    
    adjustWidthAnchor : function(value, comp){
        return value ? value - comp.getPosition(true)[0] + this.paddingLeft : value;
    },

    
    adjustHeightAnchor : function(value, comp){
        return  value ? value - comp.getPosition(true)[1] + this.paddingTop : value;
    }
    
});
//Move To ContainnerLayout
//Container.LAYOUTS['absolute'] = AbsoluteLayout;

export default AbsoluteLayout;