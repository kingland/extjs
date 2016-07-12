import Ext from '../Base';
import BoxLayout from './BoxLayout';

var HBoxLayout = Ext.extend(BoxLayout, {
    
    align: 'top', 

    type : 'hbox',

    
    updateInnerCtSize: function(tSize, calcs) {
        var innerCtWidth  = tSize.width,
            innerCtHeight = calcs.meta.maxHeight + this.padding.top + this.padding.bottom;

        if (this.align == 'stretch') {
            innerCtHeight = tSize.height;
        } else if (this.align == 'middle') {
            innerCtHeight = Math.max(tSize.height, innerCtHeight);
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
            availHeight  = Math.max(0, height - paddingVert),

            isStart      = this.pack == 'start',
            isCenter     = this.pack == 'center',
            isEnd        = this.pack == 'end',
            

            nonFlexWidth = 0,
            maxHeight    = 0,
            totalFlex    = 0,

            
            boxes        = [],

            
            child, childWidth, childHeight, childSize, childMargins, canLayout, i, calcs, flexedWidth, vertMargins, stretchHeight;

            
            for (i = 0; i < visibleCount; i++) {
                child       = visibleItems[i];
                childHeight = child.height;
                childWidth  = child.width;
                canLayout   = !child.hasLayout && Ext.isFunction(child.doLayout);

                
                if (!Ext.isNumber(childWidth)) {

                    
                    if (child.flex && !childWidth) {
                        totalFlex += child.flex;

                    
                    } else {
                        
                        
                        if (!childWidth && canLayout) {
                            child.doLayout();
                        }

                        childSize   = child.getSize();
                        childWidth  = childSize.width;
                        childHeight = childSize.height;
                    }
                }

                childMargins = child.margins;

                nonFlexWidth += (childWidth || 0) + childMargins.left + childMargins.right;

                
                if (!Ext.isNumber(childHeight)) {
                    if (canLayout) {
                        child.doLayout();
                    }
                    childHeight = child.getHeight();
                }

                maxHeight = Math.max(maxHeight, childHeight + childMargins.top + childMargins.bottom);

                
                boxes.push({
                    component: child,
                    height   : childHeight || undefined,
                    width    : childWidth || undefined
                });
            }

            
            var availableWidth = Math.max(0, (width - nonFlexWidth - paddingHoriz));

            if (isCenter) {
                leftOffset += availableWidth / 2;
            } else if (isEnd) {
                leftOffset += availableWidth;
            }

            
            var remainingWidth = availableWidth,
                remainingFlex  = totalFlex;

            
            for (i = 0; i < visibleCount; i++) {
                child = visibleItems[i];
                calcs = boxes[i];

                childMargins = child.margins;
                vertMargins  = childMargins.top + childMargins.bottom;

                leftOffset  += childMargins.left;

                if (isStart && child.flex && !child.width) {
                    flexedWidth     = Math.ceil((child.flex / remainingFlex) * remainingWidth);
                    remainingWidth -= flexedWidth;
                    remainingFlex  -= child.flex;

                    calcs.width = flexedWidth;
                    calcs.dirtySize = true;
                }

                calcs.left = leftOffset;
                calcs.top  = topOffset + childMargins.top;

                switch (this.align) {
                    case 'stretch':
                        stretchHeight = availHeight - vertMargins;
                        calcs.height  = stretchHeight.constrain(child.minHeight || 0, child.maxHeight || 1000000);
                        calcs.dirtySize = true;
                        break;
                    case 'stretchmax':
                        stretchHeight = maxHeight - vertMargins;
                        calcs.height  = stretchHeight.constrain(child.minHeight || 0, child.maxHeight || 1000000);
                        calcs.dirtySize = true;
                        break;
                    case 'middle':
                        var diff = availHeight - calcs.height - vertMargins;
                        if (diff > 0) {
                            calcs.top = topOffset + vertMargins + (diff / 2);
                        }
                }
                leftOffset += calcs.width + childMargins.right;
            }

        return {
            boxes: boxes,
            meta : {
                maxHeight: maxHeight
            }
        };
    }
});

//Move To ContainnerLayout
//Container.LAYOUTS.hbox = HBoxLayout;

export default HBoxLayout;