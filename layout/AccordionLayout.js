import Ext from '../Base';
import FitLayout from './FitLayout';
//import Container from '../Container';

var AccordionLayout = Ext.extend(FitLayout, {
    
    fill : true,
    
    autoWidth : true,
    
    titleCollapse : true,
    
    hideCollapseTool : false,
    
    collapseFirst : false,
    
    animate : false,
    
    sequence : false,
    
    activeOnTop : false,

    type: 'accordion',

    renderItem : function(c){
        if(this.animate === false){
            c.animCollapse = false;
        }
        c.collapsible = true;
        if(this.autoWidth){
            c.autoWidth = true;
        }
        if(this.titleCollapse){
            c.titleCollapse = true;
        }
        if(this.hideCollapseTool){
            c.hideCollapseTool = true;
        }
        if(this.collapseFirst !== undefined){
            c.collapseFirst = this.collapseFirst;
        }
        if(!this.activeItem && !c.collapsed){
            this.setActiveItem(c, true);
        }else if(this.activeItem && this.activeItem != c){
            c.collapsed = true;
        }
        AccordionLayout.superclass.renderItem.apply(this, arguments);
        c.header.addClass('x-accordion-hd');
        c.on('beforeexpand', this.beforeExpand, this);
    },

    onRemove: function(c){
        AccordionLayout.superclass.onRemove.call(this, c);
        if(c.rendered){
            c.header.removeClass('x-accordion-hd');
        }
        c.un('beforeexpand', this.beforeExpand, this);
    },

    
    beforeExpand : function(p, anim){
        var ai = this.activeItem;
        if(ai){
            if(this.sequence){
                delete this.activeItem;
                if (!ai.collapsed){
                    ai.collapse({callback:function(){
                        p.expand(anim || true);
                    }, scope: this});
                    return false;
                }
            }else{
                ai.collapse(this.animate);
            }
        }
        this.setActive(p);
        if(this.activeOnTop){
            p.el.dom.parentNode.insertBefore(p.el.dom, p.el.dom.parentNode.firstChild);
        }
        
        this.layout();
    },

    
    setItemSize : function(item, size){
        if(this.fill && item){
            var hh = 0, i, ct = this.getRenderedItems(this.container), len = ct.length, p;
            
            for (i = 0; i < len; i++) {
                if((p = ct[i]) != item && !p.hidden){
                    hh += p.header.getHeight();
                }
            };
            
            size.height -= hh;
            
            
            item.setSize(size);
        }
    },

    
    setActiveItem : function(item){
        this.setActive(item, true);
    },

    
    setActive : function(item, expand){
        var ai = this.activeItem;
        item = this.container.getComponent(item);
        if(ai != item){
            if(item.rendered && item.collapsed && expand){
                item.expand();
            }else{
                if(ai){
                   ai.fireEvent('deactivate', ai);
                }
                this.activeItem = item;
                item.fireEvent('activate', item);
            }
        }
    }
});
//Move To ContainnerLayout
//Container.LAYOUTS.accordion = AccordionLayout;

export default AccordionLayout;