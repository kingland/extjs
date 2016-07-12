﻿import Ext from './Base';
import Panel from './Panel';
import DD from './dd/DD';

var Tip = Ext.extend(Panel, {
    minWidth : 40,
    maxWidth : 300,
    shadow : "sides",
    defaultAlign : "tl-bl?",
    autoRender: true,
    quickShowInterval : 250,
    frame:true,
    hidden:true,
    baseCls: 'x-tip',
    floating:{shadow:true,shim:true,useDisplay:true,constrain:false},
    autoHeight:true,

    closeAction: 'hide',

    
    initComponent : function(){
        Tip.superclass.initComponent.call(this);
        if(this.closable && !this.title){
            this.elements += ',header';
        }
    },

    
    afterRender : function(){
        Tip.superclass.afterRender.call(this);
        if(this.closable){
            this.addTool({
                id: 'close',
                handler: this[this.closeAction],
                scope: this
            });
        }
    },

    
    showAt : function(xy){
        Tip.superclass.show.call(this);
        if(this.measureWidth !== false && (!this.initialConfig || typeof this.initialConfig.width != 'number')){
            this.doAutoWidth();
        }
        if(this.constrainPosition){
            xy = this.el.adjustForConstraints(xy);
        }
        this.setPagePosition(xy[0], xy[1]);
    },

    
    doAutoWidth : function(adjust){
        adjust = adjust || 0;
        var bw = this.body.getTextWidth();
        if(this.title){
            bw = Math.max(bw, this.header.child('span').getTextWidth(this.title));
        }
        bw += this.getFrameWidth() + (this.closable ? 20 : 0) + this.body.getPadding("lr") + adjust;
        this.setWidth(bw.constrain(this.minWidth, this.maxWidth));
        
        
        if(Ext.isIE7 && !this.repainted){
            this.el.repaint();
            this.repainted = true;
        }
    },

    
    showBy : function(el, pos){
        if(!this.rendered){
            this.render(Ext.getBody());
        }
        this.showAt(this.el.getAlignToXY(el, pos || this.defaultAlign));
    },

    initDraggable : function(){
        this.dd = new Tip.DD(this, typeof this.draggable == 'boolean' ? null : this.draggable);
        this.header.addClass('x-tip-draggable');
    }
});

Ext.reg('tip', Tip);

Tip.DD = function(tip, config){
    Ext.apply(this, config);
    this.tip = tip;
    Tip.DD.superclass.constructor.call(this, tip.el.id, 'WindowDD-'+tip.id);
    this.setHandleElId(tip.header.id);
    this.scroll = false;
};

Ext.extend(Tip.DD, DD, {
    moveOnly:true,
    scroll:false,
    headerOffsets:[100, 25],
    startDrag : function(){
        this.tip.el.disableShadow();
    },
    endDrag : function(e){
        this.tip.el.enableShadow(true);
    }
});

export default Tip;