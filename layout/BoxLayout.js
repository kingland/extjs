import Ext from '../Base';
import ContainerLayout from './ContainerLayout';

var BoxLayout = Ext.extend(ContainerLayout, {
    
    defaultMargins : {left:0,top:0,right:0,bottom:0},
    
    padding : '0',
    
    pack : 'start',

    
    monitorResize : true,
    type: 'box',
    scrollOffset : 0,
    extraCls : 'x-box-item',
    targetCls : 'x-box-layout-ct',
    innerCls : 'x-box-inner',

    constructor : function(config){
        BoxLayout.superclass.constructor.call(this, config);

        if (Ext.isString(this.defaultMargins)) {
            this.defaultMargins = this.parseMargins(this.defaultMargins);
        }
    },

    
    onLayout: function(container, target) {
        BoxLayout.superclass.onLayout.call(this, container, target);

        var items = this.getVisibleItems(container),
            tSize = this.getLayoutTargetSize();

        
        this.layoutTargetLastSize = tSize;

        
        this.childBoxCache = this.calculateChildBoxes(items, tSize);

        this.updateInnerCtSize(tSize, this.childBoxCache);
        this.updateChildBoxes(this.childBoxCache.boxes);

        
        this.handleTargetOverflow(tSize, container, target);
    },

    
    updateChildBoxes: function(boxes) {
        for (var i = 0, length = boxes.length; i < length; i++) {
            var box  = boxes[i],
                comp = box.component;

            if (box.dirtySize) {
                comp.setSize(box.width, box.height);
            }
            
            if (isNaN(box.left) || isNaN(box.top)) {
                continue;
            }
            comp.setPosition(box.left, box.top);
        }
    },

    
    updateInnerCtSize: Ext.emptyFn,

    
    handleTargetOverflow: function(previousTargetSize, container, target) {
        var overflow = target.getStyle('overflow');

        if (overflow && overflow != 'hidden' &&!this.adjustmentPass) {
            var newTargetSize = this.getLayoutTargetSize();
            if (newTargetSize.width != previousTargetSize.width || newTargetSize.height != previousTargetSize.height){
                this.adjustmentPass = true;
                this.onLayout(container, target);
            }
        }

        delete this.adjustmentPass;
    },

    
    isValidParent : function(c, target){
        return this.innerCt && c.getPositionEl().dom.parentNode == this.innerCt.dom;
    },

    
    getVisibleItems: function(ct) {
        var ct  = ct || this.container,
            t   = ct.getLayoutTarget(),
            cti = ct.items.items,
            len = cti.length,

            i, c, items = [];

        for (i = 0; i < len; i++) {
            if((c = cti[i]).rendered && this.isValidParent(c, t) && c.hidden !== true  && c.collapsed !== true){
                items.push(c);
            }
        }

        return items;
    },

    
    renderAll : function(ct, target){
        if(!this.innerCt){
            
            
            this.innerCt = target.createChild({cls:this.innerCls});
            this.padding = this.parseMargins(this.padding);
        }
        BoxLayout.superclass.renderAll.call(this, ct, this.innerCt);
    },

    getLayoutTargetSize : function(){
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

    
    renderItem : function(c){
        if(Ext.isString(c.margins)){
            c.margins = this.parseMargins(c.margins);
        }else if(!c.margins){
            c.margins = this.defaultMargins;
        }
        BoxLayout.superclass.renderItem.apply(this, arguments);
    }
});

export default BoxLayout;