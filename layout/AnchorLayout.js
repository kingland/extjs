import Ext from '../Base';
import ContainerLayout from './ContainerLayout';
//import Container from '../Container';

var AnchorLayout = Ext.extend( ContainerLayout, {
    monitorResize : true,

    type : 'anchor',

    
    defaultAnchor : '100%',

    parseAnchorRE : /^(r|right|b|bottom)$/i,

    getLayoutTargetSize : function() {
        var target = this.container.getLayoutTarget();
        if (!target) {
            return {};
        }
        
        return target.getStyleSize();
    },

    
    onLayout : function(ct, target){
        AnchorLayout.superclass.onLayout.call(this, ct, target);
        var size = this.getLayoutTargetSize();

        var w = size.width, h = size.height;

        if(w < 20 && h < 20){
            return;
        }

        
        var aw, ah;
        if(ct.anchorSize){
            if(typeof ct.anchorSize == 'number'){
                aw = ct.anchorSize;
            }else{
                aw = ct.anchorSize.width;
                ah = ct.anchorSize.height;
            }
        }else{
            aw = ct.initialConfig.width;
            ah = ct.initialConfig.height;
        }

        var cs = this.getRenderedItems(ct), len = cs.length, i, c, a, cw, ch, el, vs, boxes = [];
        for(i = 0; i < len; i++){
            c = cs[i];
            el = c.getPositionEl();

            
            if (!c.anchor && c.items && !Ext.isNumber(c.width) && !(Ext.isIE6 && Ext.isStrict)){
                c.anchor = this.defaultAnchor;
            }

            if(c.anchor){
                a = c.anchorSpec;
                if(!a){ 
                    vs = c.anchor.split(' ');
                    c.anchorSpec = a = {
                        right: this.parseAnchor(vs[0], c.initialConfig.width, aw),
                        bottom: this.parseAnchor(vs[1], c.initialConfig.height, ah)
                    };
                }
                cw = a.right ? this.adjustWidthAnchor(a.right(w) - el.getMargins('lr'), c) : undefined;
                ch = a.bottom ? this.adjustHeightAnchor(a.bottom(h) - el.getMargins('tb'), c) : undefined;

                if(cw || ch){
                    boxes.push({
                        comp: c,
                        width: cw || undefined,
                        height: ch || undefined
                    });
                }
            }
        }
        for (i = 0, len = boxes.length; i < len; i++) {
            c = boxes[i];
            c.comp.setSize(c.width, c.height);
        }
    },

    
    parseAnchor : function(a, start, cstart){
        if(a && a != 'none'){
            var last;
            
            if(this.parseAnchorRE.test(a)){
                var diff = cstart - start;
                return function(v){
                    if(v !== last){
                        last = v;
                        return v - diff;
                    }
                }
            
            }else if(a.indexOf('%') != -1){
                var ratio = parseFloat(a.replace('%', ''))*.01;
                return function(v){
                    if(v !== last){
                        last = v;
                        return Math.floor(v*ratio);
                    }
                }
            
            }else{
                a = parseInt(a, 10);
                if(!isNaN(a)){
                    return function(v){
                        if(v !== last){
                            last = v;
                            return v + a;
                        }
                    }
                }
            }
        }
        return false;
    },

    
    adjustWidthAnchor : function(value, comp){
        return value;
    },

    
    adjustHeightAnchor : function(value, comp){
        return value;
    }

    
});

//Move To ContainnerLayout
//Container.LAYOUTS['anchor'] = AnchorLayout;

export default AnchorLayout;