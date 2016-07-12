import Ext from '../Base';
import ContainerLayout from './ContainerLayout';
//import Container from '../Container';

var ColumnLayout = Ext.extend(ContainerLayout, {
    
    monitorResize:true,

    type: 'column',

    extraCls: 'x-column',

    scrollOffset : 0,

    

    targetCls: 'x-column-layout-ct',

    isValidParent : function(c, target){
        return this.innerCt && c.getPositionEl().dom.parentNode == this.innerCt.dom;
    },

    getLayoutTargetSize : function() {
        var target = this.container.getLayoutTarget(), ret;
        if (target) {
            ret = target.getViewSize();

            
            
            
            if (Ext.isIE && Ext.isStrict && ret.width == 0){
                ret =  target.getStyleSize();
            }

            ret.width -= target.getPadding('lr');
            ret.height -= target.getPadding('tb');
        }
        return ret;
    },

    renderAll : function(ct, target) {
        if(!this.innerCt){
            
            
            this.innerCt = target.createChild({cls:'x-column-inner'});
            this.innerCt.createChild({cls:'x-clear'});
        }
        ColumnLayout.superclass.renderAll.call(this, ct, this.innerCt);
    },

    
    onLayout : function(ct, target){
        var cs = ct.items.items,
            len = cs.length,
            c,
            i,
            m,
            margins = [];

        this.renderAll(ct, target);

        var size = this.getLayoutTargetSize();

        if(size.width < 1 && size.height < 1){ 
            return;
        }

        var w = size.width - this.scrollOffset,
            h = size.height,
            pw = w;

        this.innerCt.setWidth(w);

        
        

        for(i = 0; i < len; i++){
            c = cs[i];
            m = c.getPositionEl().getMargins('lr');
            margins[i] = m;
            if(!c.columnWidth){
                pw -= (c.getWidth() + m);
            }
        }

        pw = pw < 0 ? 0 : pw;

        for(i = 0; i < len; i++){
            c = cs[i];
            m = margins[i];
            if(c.columnWidth){
                c.setSize(Math.floor(c.columnWidth * pw) - m);
            }
        }

        
        
        if (Ext.isIE) {
            if (i = target.getStyle('overflow') && i != 'hidden' && !this.adjustmentPass) {
                var ts = this.getLayoutTargetSize();
                if (ts.width != size.width){
                    this.adjustmentPass = true;
                    this.onLayout(ct, target);
                }
            }
        }
        delete this.adjustmentPass;
    }

    
});

//Move To ContainnerLayout
//Container.LAYOUTS['column'] = ColumnLayout;

export default ColumnLayout;