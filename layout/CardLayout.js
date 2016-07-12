import Ext from '../Base';
import FitLayout from './FitLayout';
//import Container from '../Container';

var CardLayout = Ext.extend(FitLayout, {    
    deferredRender : false,
    layoutOnCardChange : false,
    renderHidden : true,
    type: 'card',
    setActiveItem : function(item){
        var ai = this.activeItem,
            ct = this.container;
        item = ct.getComponent(item);

        
        if(item && ai != item){

            
            if(ai){
                ai.hide();
                if (ai.hidden !== true) {
                    return false;
                }
                ai.fireEvent('deactivate', ai);
            }

            var layout = item.doLayout && (this.layoutOnCardChange || !item.rendered);

            
            this.activeItem = item;

            
            
            delete item.deferLayout;

            
            item.show();

            this.layout();

            if(layout){
                item.doLayout();
            }
            item.fireEvent('activate', item);
        }
    },

    
    renderAll : function(ct, target){
        if(this.deferredRender){
            this.renderItem(this.activeItem, undefined, target);
        }else{
            CardLayout.superclass.renderAll.call(this, ct, target);
        }
    }
});

//Move To ContainnerLayout
//Container.LAYOUTS['card'] = CardLayout;

export default CardLayout;