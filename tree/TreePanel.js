import Ext from '../Base';
import Panel from '../Panel';
import TreeNode from './TreeNode';
import AsyncTreeNode from './AsyncTreeNode';
import TreeEventModel from './TreeEventModel';
import TreeLoader from './TreeLoader';
import RootTreeNodeUI from './RootTreeNodeUI';
import DefaultSelectionModel from './DefaultSelectionModel';
import TreeDropZone from './TreeDropZone';
import TreeDragZone from './TreeDragZone';
import ScrollManager from '../dd/ScrollManager';

var TreePanel = Ext.extend( Panel, {
    rootVisible : true,
    animate : Ext.enableFx,
    lines : true,
    enableDD : false,
    hlDrop : Ext.enableFx,
    pathSeparator : '/',
    bubbleEvents : [],
    initComponent : function(){
        TreePanel.superclass.initComponent.call(this);

        if(!this.eventModel){
            this.eventModel = new TreeEventModel(this);
        }

        
        var l = this.loader;
        if(!l){
            l = new TreeLoader({
                dataUrl: this.dataUrl,
                requestMethod: this.requestMethod
            });
        }else if(Ext.isObject(l) && !l.load){
            l = new TreeLoader(l);
        }
        this.loader = l;

        this.nodeHash = {};

        
        if(this.root){
            var r = this.root;
            delete this.root;
            this.setRootNode(r);
        }


        this.addEvents(

            
           'append',
           
           'remove',
           
           'movenode',
           
           'insert',
           
           'beforeappend',
           
           'beforeremove',
           
           'beforemovenode',
           
            'beforeinsert',

            
            'beforeload',
            
            'load',
            
            'textchange',
            
            'beforeexpandnode',
            
            'beforecollapsenode',
            
            'expandnode',
            
            'disabledchange',
            
            'collapsenode',
            
            'beforeclick',
            
            'click',
            
            'containerclick',
            
            'checkchange',
            
            'beforedblclick',
            
            'dblclick',
            
            'containerdblclick',
            
            'contextmenu',
            
            'containercontextmenu',
            
            'beforechildrenrendered',
           
            'startdrag',
            
            'enddrag',
            
            'dragdrop',
            
            'beforenodedrop',
            
            'nodedrop',
             
            'nodedragover'
        );
        if(this.singleExpand){
            this.on('beforeexpandnode', this.restrictExpand, this);
        }
    },

    
    proxyNodeEvent : function(ename, a1, a2, a3, a4, a5, a6){
        if(ename == 'collapse' || ename == 'expand' || ename == 'beforecollapse' || ename == 'beforeexpand' || ename == 'move' || ename == 'beforemove'){
            ename = ename+'node';
        }
        
        return this.fireEvent(ename, a1, a2, a3, a4, a5, a6);
    },


    
    getRootNode : function(){
        return this.root;
    },

    
    setRootNode : function(node){
        this.destroyRoot();
        if(!node.render){ 
            node = this.loader.createNode(node);
        }
        this.root = node;
        node.ownerTree = this;
        node.isRoot = true;
        this.registerNode(node);
        if(!this.rootVisible){
            var uiP = node.attributes.uiProvider;
            node.ui = uiP ? new uiP(node) : new RootTreeNodeUI(node);
        }
        if(this.innerCt){
            this.clearInnerCt();
            this.renderRoot();
        }
        return node;
    },
    
    clearInnerCt : function(){
        this.innerCt.update('');    
    },
    
    
    renderRoot : function(){
        this.root.render();
        if(!this.rootVisible){
            this.root.renderChildren();
        }
    },

    
    getNodeById : function(id){
        return this.nodeHash[id];
    },

    
    registerNode : function(node){
        this.nodeHash[node.id] = node;
    },

    
    unregisterNode : function(node){
        delete this.nodeHash[node.id];
    },

    
    toString : function(){
        return '[Tree'+(this.id?' '+this.id:'')+']';
    },

    
    restrictExpand : function(node){
        var p = node.parentNode;
        if(p){
            if(p.expandedChild && p.expandedChild.parentNode == p){
                p.expandedChild.collapse();
            }
            p.expandedChild = node;
        }
    },

    
    getChecked : function(a, startNode){
        startNode = startNode || this.root;
        var r = [];
        var f = function(){
            if(this.attributes.checked){
                r.push(!a ? this : (a == 'id' ? this.id : this.attributes[a]));
            }
        };
        startNode.cascade(f);
        return r;
    },

    
    getLoader : function(){
        return this.loader;
    },

    
    expandAll : function(){
        this.root.expand(true);
    },

    
    collapseAll : function(){
        this.root.collapse(true);
    },

    
    getSelectionModel : function(){
        if(!this.selModel){
            this.selModel = new DefaultSelectionModel();
        }
        return this.selModel;
    },

    
    expandPath : function(path, attr, callback){
        attr = attr || 'id';
        var keys = path.split(this.pathSeparator);
        var curNode = this.root;
        if(curNode.attributes[attr] != keys[1]){ 
            if(callback){
                callback(false, null);
            }
            return;
        }
        var index = 1;
        var f = function(){
            if(++index == keys.length){
                if(callback){
                    callback(true, curNode);
                }
                return;
            }
            var c = curNode.findChild(attr, keys[index]);
            if(!c){
                if(callback){
                    callback(false, curNode);
                }
                return;
            }
            curNode = c;
            c.expand(false, false, f);
        };
        curNode.expand(false, false, f);
    },

    
    selectPath : function(path, attr, callback){
        attr = attr || 'id';
        var keys = path.split(this.pathSeparator),
            v = keys.pop();
        if(keys.length > 1){
            var f = function(success, node){
                if(success && node){
                    var n = node.findChild(attr, v);
                    if(n){
                        n.select();
                        if(callback){
                            callback(true, n);
                        }
                    }else if(callback){
                        callback(false, n);
                    }
                }else{
                    if(callback){
                        callback(false, n);
                    }
                }
            };
            this.expandPath(keys.join(this.pathSeparator), attr, f);
        }else{
            this.root.select();
            if(callback){
                callback(true, this.root);
            }
        }
    },

    
    getTreeEl : function(){
        return this.body;
    },

    
    onRender : function(ct, position){
        TreePanel.superclass.onRender.call(this, ct, position);
        this.el.addClass('x-tree');
        this.innerCt = this.body.createChild({tag:'ul',
               cls:'x-tree-root-ct ' +
               (this.useArrows ? 'x-tree-arrows' : this.lines ? 'x-tree-lines' : 'x-tree-no-lines')});
    },

    
    initEvents : function(){
        TreePanel.superclass.initEvents.call(this);

        if(this.containerScroll){
            ScrollManager.register(this.body);
        }
        if((this.enableDD || this.enableDrop) && !this.dropZone){
           
             this.dropZone = new TreeDropZone(this, this.dropConfig || {
               ddGroup: this.ddGroup || 'TreeDD', appendOnly: this.ddAppendOnly === true
           });
        }
        if((this.enableDD || this.enableDrag) && !this.dragZone){
           
            this.dragZone = new TreeDragZone(this, this.dragConfig || {
               ddGroup: this.ddGroup || 'TreeDD',
               scroll: this.ddScroll
           });
        }
        this.getSelectionModel().init(this);
    },

    
    afterRender : function(){
        TreePanel.superclass.afterRender.call(this);
        this.renderRoot();
    },

    beforeDestroy : function(){
        if(this.rendered){
            ScrollManager.unregister(this.body);
            Ext.destroy(this.dropZone, this.dragZone);
        }
        this.destroyRoot();
        Ext.destroy(this.loader);
        this.nodeHash = this.root = this.loader = null;
        TreePanel.superclass.beforeDestroy.call(this);
    },
    
    
    destroyRoot : function(){
        if(this.root && this.root.destroy){
            this.root.destroy(true);
        }
    }
    
});

//Move to NodeType
//TreePanel.nodeTypes = {};
//TreePanel.nodeTypes.node = TreeNode;
//TreePanel.nodeTypes.async = AsyncTreeNode;

Ext.reg('treepanel', TreePanel);

export default TreePanel;