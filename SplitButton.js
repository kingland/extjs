import Ext from './Base';
import Button from './Button';

var SplitButton = Ext.extend( Button, {
	
    arrowSelector : 'em',
    split: true,

    
    initComponent : function(){
        SplitButton.superclass.initComponent.call(this);
        
        this.addEvents("arrowclick");
    },

    
    onRender : function(){
        SplitButton.superclass.onRender.apply(this, arguments);
        if(this.arrowTooltip){
            this.el.child(this.arrowSelector).dom[this.tooltipType] = this.arrowTooltip;
        }
    },

    
    setArrowHandler : function(handler, scope){
        this.arrowHandler = handler;
        this.scope = scope;
    },

    getMenuClass : function(){
        return 'x-btn-split' + (this.arrowAlign == 'bottom' ? '-bottom' : '');
    },

    isClickOnArrow : function(e){
	if (this.arrowAlign != 'bottom') {
	    var visBtn = this.el.child('em.x-btn-split');
	    var right = visBtn.getRegion().right - visBtn.getPadding('r');
	    return e.getPageX() > right;
	} else {
	    return e.getPageY() > this.btnEl.getRegion().bottom;
	}
    },

    
    onClick : function(e, t){
        e.preventDefault();
        if(!this.disabled){
            if(this.isClickOnArrow(e)){
                if(this.menu && !this.menu.isVisible() && !this.ignoreNextClick){
                    this.showMenu();
                }
                this.fireEvent("arrowclick", this, e);
                if(this.arrowHandler){
                    this.arrowHandler.call(this.scope || this, this, e);
                }
            }else{
                if(this.enableToggle){
                    this.toggle();
                }
                this.fireEvent("click", this, e);
                if(this.handler){
                    this.handler.call(this.scope || this, this, e);
                }
            }
        }
    },

    
    isMenuTriggerOver : function(e){
        return this.menu && e.target.tagName == this.arrowSelector;
    },

    
    isMenuTriggerOut : function(e, internal){
        return this.menu && e.target.tagName != this.arrowSelector;
    }
});

Ext.reg('splitbutton', SplitButton);

export default SplitButton;