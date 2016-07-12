import Ext from '../Base';
import ContainerLayout from './ContainerLayout';
//import Container from '../Container';

var FitLayout = Ext.extend(ContainerLayout, {
    
    monitorResize:true,

    type: 'fit',

    getLayoutTargetSize : function() {
        var target = this.container.getLayoutTarget();
        if (!target) {
            return {};
        }
        
        return target.getStyleSize();
    },

    
    onLayout : function(ct, target){
        FitLayout.superclass.onLayout.call(this, ct, target);
        if(!ct.collapsed){
            this.setItemSize(this.activeItem || ct.items.itemAt(0), this.getLayoutTargetSize());
        }
    },

    
    setItemSize : function(item, size){
        if(item && size.height > 0){ 
            item.setSize(size);
        }
    }
});

//Move To ContainnerLayout
//Container.LAYOUTS['fit'] = FitLayout;

export default FitLayout;