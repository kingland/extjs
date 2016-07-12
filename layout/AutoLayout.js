import Ext from '../Base';
import ContainerLayout from './ContainerLayout';
//import Container from '../Container';

var AutoLayout = Ext.extend(ContainerLayout, {
    type: 'auto',

    monitorResize: true,

    onLayout : function(ct, target){
        AutoLayout.superclass.onLayout.call(this, ct, target);
        var cs = this.getRenderedItems(ct), len = cs.length, i, c;
        for(i = 0; i < len; i++){
            c = cs[i];
            if (c.doLayout){
                
                c.doLayout(true);
            }
        }
    }
});

//Move To ContainnerLayout
//Container.LAYOUTS['auto'] = AutoLayout;

export default AutoLayout;