import Ext from '../Base';
import BoxLayout from './BoxLayout';
//import Container from '../Container';

var VBoxLayout = Ext.extend(BoxLayout, {
    
    align : 'left', 
    type: 'vbox',

    
    updateInnerCtSize: function(tSize, calcs) {
        var innerCtHeight = tSize.height,
            innerCtWidth  = calcs.meta.maxWidth + this.padding.left + this.padding.right;

        if (this.align == 'stretch') {
            innerCtWidth = tSize.width;
        } else if (this.align == 'center') {
            innerCtWidth = Math.max(tSize.width, innerCtWidth);
        }

        
        
        this.innerCt.setSize(innerCtWidth || undefined, innerCtHeight || undefined);
    },

    
    calculateChildBoxes: function(visibleItems, targetSize) {
        var visibleCount = visibleItems.length,

            padding      = this.padding,
            topOffset    = padding.top,
            leftOffset   = padding.left,
            paddingVert  = topOffset  + padding.bottom,
            paddingHoriz = leftOffset + padding.right,

            width        = targetSize.width - this.scrollOffset,
            height       = targetSize.height,
            availWidth   = Math.max(0, width - paddingHoriz),

            isStart      = this.pack == 'start',
            isCenter     = this.pack == 'center',
            isEnd        = this.pack == 'end',

            nonFlexHeight= 0,
            maxWidth     = 0,
            totalFlex    = 0,

            
            boxes        = [],

            
            child, childWidth, childHeight, childSize, childMargins, canLayout, i, calcs, flexedHeight, horizMargins, stretchWidth;

            
            for (i = 0; i < visibleCount; i++) {
                child = visibleItems[i];
                childHeight = child.height;
                childWidth  = child.width;
                canLayout   = !child.hasLayout && Ext.isFunction(child.doLayout);


                
                if (!Ext.isNumber(childHeight)) {

                    
                    if (child.flex && !childHeight) {
                        totalFlex += child.flex;

                    
                    } else {
                        
                        
                        if (!childHeight && canLayout) {
                            child.doLayout();
                        }

                        childSize = child.getSize();
                        childWidth = childSize.width;
                        childHeight = childSize.height;
                    }
                }

                childMargins = child.margins;

                nonFlexHeight += (childHeight || 0) + childMargins.top + childMargins.bottom;

                
                if (!Ext.isNumber(childWidth)) {
                    if (canLayout) {
                        child.doLayout();
                    }
                    childWidth = child.getWidth();
                }

                maxWidth = Math.max(maxWidth, childWidth + childMargins.left + childMargins.right);

                
                boxes.push({
                    component: child,
                    height   : childHeight || undefined,
                    width    : childWidth || undefined
                });
            }

            
            var availableHeight = Math.max(0, (height - nonFlexHeight - paddingVert));

            if (isCenter) {
                topOffset += availableHeight / 2;
            } else if (isEnd) {
                topOffset += availableHeight;
            }

            
            var remainingHeight = availableHeight,
                remainingFlex   = totalFlex;

            
            for (i = 0; i < visibleCount; i++) {
                child = visibleItems[i];
                calcs = boxes[i];

                childMargins = child.margins;
                horizMargins = childMargins.left + childMargins.right;

                topOffset   += childMargins.top;

                if (isStart && child.flex && !child.height) {
                    flexedHeight     = Math.ceil((child.flex / remainingFlex) * remainingHeight);
                    remainingHeight -= flexedHeight;
                    remainingFlex   -= child.flex;

                    calcs.height = flexedHeight;
                    calcs.dirtySize = true;
                }

                calcs.left = leftOffset + childMargins.left;
                calcs.top  = topOffset;

                switch (this.align) {
                    case 'stretch':
                        stretchWidth = availWidth - horizMargins;
                        calcs.width  = stretchWidth.constrain(child.minWidth || 0, child.maxWidth || 1000000);
                        calcs.dirtySize = true;
                        break;
                    case 'stretchmax':
                        stretchWidth = maxWidth - horizMargins;
                        calcs.width  = stretchWidth.constrain(child.minWidth || 0, child.maxWidth || 1000000);
                        calcs.dirtySize = true;
                        break;
                    case 'center':
                        var diff = availWidth - calcs.width - horizMargins;
                        if (diff > 0) {
                            calcs.left = leftOffset + horizMargins + (diff / 2);
                        }
                }

                topOffset += calcs.height + childMargins.bottom;
            }

        return {
            boxes: boxes,
            meta : {
                maxWidth: maxWidth
            }
        };
    }
});

//Move To ContainnerLayout
//Container.LAYOUTS.vbox = VBoxLayout;

export default VBoxLayout;