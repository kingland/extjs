import Ext from './Base';
import BoxComponent from './BoxComponent';
import EventManager from './EventManager';
import ComponentMgr from './ComponentMgr';
//import AutoLayout from './layout/AutoLayout';
import MixedCollection from './util/MixedCollection';

var Container = Ext.extend(BoxComponent, {
    
    bufferResize: 50,

    autoDestroy : true,

    
    forceLayout: false,
    
    defaultType : 'panel',

    
    resizeEvent: 'resize',

    
    bubbleEvents: ['add', 'remove'],

    
    initComponent : function(){
        Container.superclass.initComponent.call(this);

        this.addEvents(
            
            'afterlayout',
            
            'beforeadd',
            
            'beforeremove',
            
            'add',
            
            'remove'
        );

        
        var items = this.items;
        if(items){
            delete this.items;
            this.add(items);
        }
    },

    
    initItems : function(){
        if(!this.items){
            this.items = new MixedCollection(false, this.getComponentId);
            this.getLayout(); 
        }
    },

    
    setLayout : function(layout){
        if(this.layout && this.layout != layout){
            this.layout.setContainer(null);
        }
        this.layout = layout;
        this.initItems();
        layout.setContainer(this);
    },

    afterRender: function(){
        
        
        Container.superclass.afterRender.call(this);
        if(!this.layout){
            this.layout = 'auto';
        }
        if(Ext.isObject(this.layout) && !this.layout.layout){
            this.layoutConfig = this.layout;
            this.layout = this.layoutConfig.type;
        }
        if(Ext.isString(this.layout)){
            this.layout = new Container.LAYOUTS[this.layout.toLowerCase()](this.layoutConfig);
        }
        this.setLayout(this.layout);

        
        if(this.activeItem !== undefined){
            var item = this.activeItem;
            delete this.activeItem;
            this.layout.setActiveItem(item);
        }

        
        if(!this.ownerCt){
            this.doLayout(false, true);
        }

        
        
        if(this.monitorResize === true){
            EventManager.onWindowResize(this.doLayout, this, [false]);
        }
    },

    
    getLayoutTarget : function(){
        return this.el;
    },

    
    getComponentId : function(comp){
        return comp.getItemId();
    },

    
    add : function(comp){
        this.initItems();
        var args = arguments.length > 1;
        if(args || Ext.isArray(comp)){
            var result = [];
            Ext.each(args ? arguments : comp, function(c){
                result.push(this.add(c));
            }, this);
            return result;
        }
        var c = this.lookupComponent(this.applyDefaults(comp));
        var index = this.items.length;
        if(this.fireEvent('beforeadd', this, c, index) !== false && this.onBeforeAdd(c) !== false){
            this.items.add(c);
            
            c.onAdded(this, index);
            this.onAdd(c);
            this.fireEvent('add', this, c, index);
        }
        return c;
    },

    onAdd : function(c){
        
    },

    
    onAdded : function(container, pos) {
        
        this.ownerCt = container;
        this.initRef();
        
        this.cascade(function(c){
            c.initRef();
        });
        this.fireEvent('added', this, container, pos);
    },

    
    insert : function(index, comp){
        this.initItems();
        var a = arguments, len = a.length;
        if(len > 2){
            var result = [];
            for(var i = len-1; i >= 1; --i) {
                result.push(this.insert(index, a[i]));
            }
            return result;
        }
        var c = this.lookupComponent(this.applyDefaults(comp));
        index = Math.min(index, this.items.length);
        if(this.fireEvent('beforeadd', this, c, index) !== false && this.onBeforeAdd(c) !== false){
            if(c.ownerCt == this){
                this.items.remove(c);
            }
            this.items.insert(index, c);
            c.onAdded(this, index);
            this.onAdd(c);
            this.fireEvent('add', this, c, index);
        }
        return c;
    },

    
    applyDefaults : function(c){
        var d = this.defaults;
        if(d){
            if(Ext.isFunction(d)){
                d = d.call(this, c);
            }
            if(Ext.isString(c)){
                c = ComponentMgr.get(c);
                Ext.apply(c, d);
            }else if(!c.events){
                Ext.applyIf(c, d);
            }else{
                Ext.apply(c, d);
            }
        }
        return c;
    },

    
    onBeforeAdd : function(item){
        if(item.ownerCt){
            item.ownerCt.remove(item, false);
        }
        if(this.hideBorders === true){
            item.border = (item.border === true);
        }
    },

    
    remove : function(comp, autoDestroy){
        this.initItems();
        var c = this.getComponent(comp);
        if(c && this.fireEvent('beforeremove', this, c) !== false){
            this.doRemove(c, autoDestroy);
            this.fireEvent('remove', this, c);
        }
        return c;
    },

    onRemove: function(c){
        
    },

    
    doRemove: function(c, autoDestroy){
        var l = this.layout,
            hasLayout = l && this.rendered;

        if(hasLayout){
            l.onRemove(c);
        }
        this.items.remove(c);
        c.onRemoved();
        this.onRemove(c);
        if(autoDestroy === true || (autoDestroy !== false && this.autoDestroy)){
            c.destroy();
        }
        if(hasLayout){
            l.afterRemove(c);
        }
    },

    
    removeAll: function(autoDestroy){
        this.initItems();
        var item, rem = [], items = [];
        this.items.each(function(i){
            rem.push(i);
        });
        for (var i = 0, len = rem.length; i < len; ++i){
            item = rem[i];
            this.remove(item, autoDestroy);
            if(item.ownerCt !== this){
                items.push(item);
            }
        }
        return items;
    },

    
    getComponent : function(comp){
        if(Ext.isObject(comp)){
            comp = comp.getItemId();
        }
        return this.items.get(comp);
    },

    
    lookupComponent : function(comp){
        if(Ext.isString(comp)){
            return ComponentMgr.get(comp);
        }else if(!comp.events){
            return this.createComponent(comp);
        }
        return comp;
    },

    
    createComponent : function(config, defaultType){
        if (config.render) {
            return config;
        }
        
        
        var c = Ext.create(Ext.apply({
            ownerCt: this
        }, config), defaultType || this.defaultType);
        delete c.initialConfig.ownerCt;
        delete c.ownerCt;
        return c;
    },

    
    canLayout : function() {
        var el = this.getVisibilityEl();
        return el && el.dom && !el.isStyle("display", "none");
    },

    

    doLayout : function(shallow, force){
        var rendered = this.rendered,
            forceLayout = force || this.forceLayout;

        if(this.collapsed || !this.canLayout()){
            this.deferLayout = this.deferLayout || !shallow;
            if(!forceLayout){
                return;
            }
            shallow = shallow && !this.deferLayout;
        } else {
            delete this.deferLayout;
        }
        if(rendered && this.layout){
            this.layout.layout();
        }
        if(shallow !== true && this.items){
            var cs = this.items.items;
            for(var i = 0, len = cs.length; i < len; i++){
                var c = cs[i];
                if(c.doLayout){
                    c.doLayout(false, forceLayout);
                }
            }
        }
        if(rendered){
            this.onLayout(shallow, forceLayout);
        }
        
        this.hasLayout = true;
        delete this.forceLayout;
    },

    onLayout : Ext.emptyFn,

    
    shouldBufferLayout: function(){
        
        var hl = this.hasLayout;
        if(this.ownerCt){
            
            return hl ? !this.hasLayoutPending() : false;
        }
        
        return hl;
    },

    
    hasLayoutPending: function(){
        
        var pending = false;
        this.ownerCt.bubble(function(c){
            if(c.layoutPending){
                pending = true;
                return false;
            }
        });
        return pending;
    },

    onShow : function(){
        
        Container.superclass.onShow.call(this);
        
        if(Ext.isDefined(this.deferLayout)){
            delete this.deferLayout;
            this.doLayout(true);
        }
    },

    
    getLayout : function(){
        if(!this.layout){
            //var layout = new AutoLayout(this.layoutConfig);
			var layout = new (Container.LAYOUTS['auto'])(this.layoutConfig);	        
            this.setLayout(layout);
        }
        return this.layout;
    },

    
    beforeDestroy : function(){
        var c;
        if(this.items){
            while(c = this.items.first()){
                this.doRemove(c, true);
            }
        }
        if(this.monitorResize){
            EventManager.removeResizeListener(this.doLayout, this);
        }
        Ext.destroy(this.layout);
        Container.superclass.beforeDestroy.call(this);
    },

    
    bubble : function(fn, scope, args){
        var p = this;
        while(p){
            if(fn.apply(scope || p, args || [p]) === false){
                break;
            }
            p = p.ownerCt;
        }
        return this;
    },

    
    cascade : function(fn, scope, args){
        if(fn.apply(scope || this, args || [this]) !== false){
            if(this.items){
                var cs = this.items.items;
                for(var i = 0, len = cs.length; i < len; i++){
                    if(cs[i].cascade){
                        cs[i].cascade(fn, scope, args);
                    }else{
                        fn.apply(scope || cs[i], args || [cs[i]]);
                    }
                }
            }
        }
        return this;
    },

    
    findById : function(id){
        var m, ct = this;
        this.cascade(function(c){
            if(ct != c && c.id === id){
                m = c;
                return false;
            }
        });
        return m || null;
    },

    
    findByType : function(xtype, shallow){
        return this.findBy(function(c){
            return c.isXType(xtype, shallow);
        });
    },

    
    find : function(prop, value){
        return this.findBy(function(c){
            return c[prop] === value;
        });
    },

    
    findBy : function(fn, scope){
        var m = [], ct = this;
        this.cascade(function(c){
            if(ct != c && fn.call(scope || c, c, ct) === true){
                m.push(c);
            }
        });
        return m;
    },

    
    get : function(key){
        return this.items.get(key);
    }
});

Container.LAYOUTS = {};
Ext.reg('container', Container);

export default Container;
