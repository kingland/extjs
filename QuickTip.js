import Ext from './Base';
import ToolTip from './ToolTip';

var QuickTip = Ext.extend(ToolTip, {
    interceptTitles : false,
    tagConfig : {
        namespace : "ext",
        attribute : "qtip",
        width : "qwidth",
        target : "target",
        title : "qtitle",
        hide : "hide",
        cls : "qclass",
        align : "qalign",
        anchor : "anchor"
    },

    
    initComponent : function(){
        this.target = this.target || Ext.getDoc();
        this.targets = this.targets || {};
        QuickTip.superclass.initComponent.call(this);
    },

    
    register : function(config){
        var cs = Ext.isArray(config) ? config : arguments;
        for(var i = 0, len = cs.length; i < len; i++){
            var c = cs[i];
            var target = c.target;
            if(target){
                if(Ext.isArray(target)){
                    for(var j = 0, jlen = target.length; j < jlen; j++){
                        this.targets[Ext.id(target[j])] = c;
                    }
                } else{
                    this.targets[Ext.id(target)] = c;
                }
            }
        }
    },

    
    unregister : function(el){
        delete this.targets[Ext.id(el)];
    },
    
    
    cancelShow: function(el){
        var at = this.activeTarget;
        el = Ext.get(el).dom;
        if(this.isVisible()){
            if(at && at.el == el){
                this.hide();
            }
        }else if(at && at.el == el){
            this.clearTimer('show');
        }
    },
    
    getTipCfg: function(e) {
        var t = e.getTarget(), 
            ttp, 
            cfg;
        if(this.interceptTitles && t.title && Ext.isString(t.title)){
            ttp = t.title;
            t.qtip = ttp;
            t.removeAttribute("title");
            e.preventDefault();
        }else{
            cfg = this.tagConfig;
            ttp = t.qtip || Ext.fly(t).getAttribute(cfg.attribute, cfg.namespace);
        }
        return ttp;
    },

    
    onTargetOver : function(e){
        if(this.disabled){
            return;
        }
        this.targetXY = e.getXY();
        var t = e.getTarget();
        if(!t || t.nodeType !== 1 || t == document || t == document.body){
            return;
        }
        if(this.activeTarget && ((t == this.activeTarget.el) || Ext.fly(this.activeTarget.el).contains(t))){
            this.clearTimer('hide');
            this.show();
            return;
        }
        if(t && this.targets[t.id]){
            this.activeTarget = this.targets[t.id];
            this.activeTarget.el = t;
            this.anchor = this.activeTarget.anchor;
            if(this.anchor){
                this.anchorTarget = t;
            }
            this.delayShow();
            return;
        }
        var ttp, et = Ext.fly(t), cfg = this.tagConfig, ns = cfg.namespace;
        if(ttp = this.getTipCfg(e)){
            var autoHide = et.getAttribute(cfg.hide, ns);
            this.activeTarget = {
                el: t,
                text: ttp,
                width: et.getAttribute(cfg.width, ns),
                autoHide: autoHide != "user" && autoHide !== 'false',
                title: et.getAttribute(cfg.title, ns),
                cls: et.getAttribute(cfg.cls, ns),
                align: et.getAttribute(cfg.align, ns)
                
            };
            this.anchor = et.getAttribute(cfg.anchor, ns);
            if(this.anchor){
                this.anchorTarget = t;
            }
            this.delayShow();
        }
    },

    
    onTargetOut : function(e){

        
        if (this.activeTarget && e.within(this.activeTarget.el) && !this.getTipCfg(e)) {
            return;
        }

        this.clearTimer('show');
        if(this.autoHide !== false){
            this.delayHide();
        }
    },

    
    showAt : function(xy){
        var t = this.activeTarget;
        if(t){
            if(!this.rendered){
                this.render(Ext.getBody());
                this.activeTarget = t;
            }
            if(t.width){
                this.setWidth(t.width);
                this.body.setWidth(this.adjustBodyWidth(t.width - this.getFrameWidth()));
                this.measureWidth = false;
            } else{
                this.measureWidth = true;
            }
            this.setTitle(t.title || '');
            this.body.update(t.text);
            this.autoHide = t.autoHide;
            this.dismissDelay = t.dismissDelay || this.dismissDelay;
            if(this.lastCls){
                this.el.removeClass(this.lastCls);
                delete this.lastCls;
            }
            if(t.cls){
                this.el.addClass(t.cls);
                this.lastCls = t.cls;
            }
            if(this.anchor){
                this.constrainPosition = false;
            }else if(t.align){ 
                xy = this.el.getAlignToXY(t.el, t.align);
                this.constrainPosition = false;
            }else{
                this.constrainPosition = true;
            }
        }
        QuickTip.superclass.showAt.call(this, xy);
    },

    
    hide: function(){
        delete this.activeTarget;
        QuickTip.superclass.hide.call(this);
    }
});

Ext.reg('quicktip', QuickTip);

export default QuickTip;