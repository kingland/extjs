import Ext from '../Base';
import TreeNodeUI from './TreeNodeUI';
import TreeLoader from './TreeLoader';
import Node from '../data/Node';
import NodeType from '../data/NodeType';

var TreeNode = function(attributes){
    attributes = attributes || {};
    if(Ext.isString(attributes)){
        attributes = {text: attributes};
    }
    this.childrenRendered = false;
    this.rendered = false;
    TreeNode.superclass.constructor.call(this, attributes);
    this.expanded = attributes.expanded === true;
    this.isTarget = attributes.isTarget !== false;
    this.draggable = attributes.draggable !== false && attributes.allowDrag !== false;
    this.allowChildren = attributes.allowChildren !== false && attributes.allowDrop !== false;

    
    this.text = attributes.text;
    
    this.disabled = attributes.disabled === true;
    
    this.hidden = attributes.hidden === true;

    this.addEvents(
        
        'textchange',
        
        'beforeexpand',
        
        'beforecollapse',
        
        'expand',
        
        'disabledchange',
        
        'collapse',
        
        'beforeclick',
        
        'click',
        
        'checkchange',
        
        'beforedblclick',
        
        'dblclick',
        
        'contextmenu',
        
        'beforechildrenrendered'
    );

    var uiClass = this.attributes.uiProvider || this.defaultUI || TreeNodeUI;

    
    this.ui = new uiClass(this);
};

Ext.extend(TreeNode, Node, {
    preventHScroll : true,
    
    isExpanded : function(){
        return this.expanded;
    },


    getUI : function(){
        return this.ui;
    },

    getLoader : function(){
        var owner;
        return this.loader || ((owner = this.getOwnerTree()) && owner.loader ? owner.loader : (this.loader = new TreeLoader()));
    },

    
    setFirstChild : function(node){
        var of = this.firstChild;
        TreeNode.superclass.setFirstChild.call(this, node);
        if(this.childrenRendered && of && node != of){
            of.renderIndent(true, true);
        }
        if(this.rendered){
            this.renderIndent(true, true);
        }
    },

    
    setLastChild : function(node){
        var ol = this.lastChild;
        TreeNode.superclass.setLastChild.call(this, node);
        if(this.childrenRendered && ol && node != ol){
            ol.renderIndent(true, true);
        }
        if(this.rendered){
            this.renderIndent(true, true);
        }
    },

    
    
    appendChild : function(n){
        if(!n.render && !Ext.isArray(n)){
            n = this.getLoader().createNode(n);
        }
        var node = TreeNode.superclass.appendChild.call(this, n);
        if(node && this.childrenRendered){
            node.render();
        }
        this.ui.updateExpandIcon();
        return node;
    },

    
    removeChild : function(node, destroy){
        this.ownerTree.getSelectionModel().unselect(node);
        TreeNode.superclass.removeChild.apply(this, arguments);
        
        if(!destroy){
            
            if(node.ui.rendered){
                node.ui.remove();
            }
            if(this.childNodes.length < 1){
                this.collapse(false, false);
            }else{
                this.ui.updateExpandIcon();
            }
            if(!this.firstChild && !this.isHiddenRoot()){
                this.childrenRendered = false;
            }
        }
        return node;
    },

    
    insertBefore : function(node, refNode){
        if(!node.render){
            node = this.getLoader().createNode(node);
        }
        var newNode = TreeNode.superclass.insertBefore.call(this, node, refNode);
        if(newNode && refNode && this.childrenRendered){
            node.render();
        }
        this.ui.updateExpandIcon();
        return newNode;
    },

    
    setText : function(text){
        var oldText = this.text;
        this.text = this.attributes.text = text;
        if(this.rendered){ 
            this.ui.onTextChange(this, text, oldText);
        }
        this.fireEvent('textchange', this, text, oldText);
    },

    
    select : function(){
        var t = this.getOwnerTree();
        if(t){
            t.getSelectionModel().select(this);
        }
    },

    
    unselect : function(silent){
        var t = this.getOwnerTree();
        if(t){
            t.getSelectionModel().unselect(this, silent);
        }
    },

    
    isSelected : function(){
        var t = this.getOwnerTree();
        return t ? t.getSelectionModel().isSelected(this) : false;
    },

    
    expand : function(deep, anim, callback, scope){
        if(!this.expanded){
            if(this.fireEvent('beforeexpand', this, deep, anim) === false){
                return;
            }
            if(!this.childrenRendered){
                this.renderChildren();
            }
            this.expanded = true;
            if(!this.isHiddenRoot() && (this.getOwnerTree().animate && anim !== false) || anim){
                this.ui.animExpand(function(){
                    this.fireEvent('expand', this);
                    this.runCallback(callback, scope || this, [this]);
                    if(deep === true){
                        this.expandChildNodes(true);
                    }
                }.createDelegate(this));
                return;
            }else{
                this.ui.expand();
                this.fireEvent('expand', this);
                this.runCallback(callback, scope || this, [this]);
            }
        }else{
           this.runCallback(callback, scope || this, [this]);
        }
        if(deep === true){
            this.expandChildNodes(true);
        }
    },

    runCallback : function(cb, scope, args){
        if(Ext.isFunction(cb)){
            cb.apply(scope, args);
        }
    },

    isHiddenRoot : function(){
        return this.isRoot && !this.getOwnerTree().rootVisible;
    },

    
    collapse : function(deep, anim, callback, scope){
        if(this.expanded && !this.isHiddenRoot()){
            if(this.fireEvent('beforecollapse', this, deep, anim) === false){
                return;
            }
            this.expanded = false;
            if((this.getOwnerTree().animate && anim !== false) || anim){
                this.ui.animCollapse(function(){
                    this.fireEvent('collapse', this);
                    this.runCallback(callback, scope || this, [this]);
                    if(deep === true){
                        this.collapseChildNodes(true);
                    }
                }.createDelegate(this));
                return;
            }else{
                this.ui.collapse();
                this.fireEvent('collapse', this);
                this.runCallback(callback, scope || this, [this]);
            }
        }else if(!this.expanded){
            this.runCallback(callback, scope || this, [this]);
        }
        if(deep === true){
            var cs = this.childNodes;
            for(var i = 0, len = cs.length; i < len; i++) {
            	cs[i].collapse(true, false);
            }
        }
    },

    
    delayedExpand : function(delay){
        if(!this.expandProcId){
            this.expandProcId = this.expand.defer(delay, this);
        }
    },

    
    cancelExpand : function(){
        if(this.expandProcId){
            clearTimeout(this.expandProcId);
        }
        this.expandProcId = false;
    },

    
    toggle : function(){
        if(this.expanded){
            this.collapse();
        }else{
            this.expand();
        }
    },

    
    ensureVisible : function(callback, scope){
        var tree = this.getOwnerTree();
        tree.expandPath(this.parentNode ? this.parentNode.getPath() : this.getPath(), false, function(){
            var node = tree.getNodeById(this.id);  
            tree.getTreeEl().scrollChildIntoView(node.ui.anchor);
            this.runCallback(callback, scope || this, [this]);
        }.createDelegate(this));
    },

    
    expandChildNodes : function(deep){
        var cs = this.childNodes;
        for(var i = 0, len = cs.length; i < len; i++) {
        	cs[i].expand(deep);
        }
    },

    
    collapseChildNodes : function(deep){
        var cs = this.childNodes;
        for(var i = 0, len = cs.length; i < len; i++) {
        	cs[i].collapse(deep);
        }
    },

    
    disable : function(){
        this.disabled = true;
        this.unselect();
        if(this.rendered && this.ui.onDisableChange){ 
            this.ui.onDisableChange(this, true);
        }
        this.fireEvent('disabledchange', this, true);
    },

    
    enable : function(){
        this.disabled = false;
        if(this.rendered && this.ui.onDisableChange){ 
            this.ui.onDisableChange(this, false);
        }
        this.fireEvent('disabledchange', this, false);
    },

    
    renderChildren : function(suppressEvent){
        if(suppressEvent !== false){
            this.fireEvent('beforechildrenrendered', this);
        }
        var cs = this.childNodes;
        for(var i = 0, len = cs.length; i < len; i++){
            cs[i].render(true);
        }
        this.childrenRendered = true;
    },

    
    sort : function(fn, scope){
        TreeNode.superclass.sort.apply(this, arguments);
        if(this.childrenRendered){
            var cs = this.childNodes;
            for(var i = 0, len = cs.length; i < len; i++){
                cs[i].render(true);
            }
        }
    },

    
    render : function(bulkRender, targetDom){
        this.ui.render(bulkRender, targetDom);
        if(!this.rendered){
            
            this.getOwnerTree().registerNode(this);
            this.rendered = true;
            if(this.expanded){
                this.expanded = false;
                this.expand(false, false);
            }
        }
    },

    
    renderIndent : function(deep, refresh){
        if(refresh){
            this.ui.childIndent = null;
        }
        this.ui.renderIndent();
        if(deep === true && this.childrenRendered){
            var cs = this.childNodes;
            for(var i = 0, len = cs.length; i < len; i++){
                cs[i].renderIndent(true, refresh);
            }
        }
    },

    beginUpdate : function(){
        this.childrenRendered = false;
    },

    endUpdate : function(){
        if(this.expanded && this.rendered){
            this.renderChildren();
        }
    },

    
    destroy : function(silent){
        if(silent === true){
            this.unselect(true);
        }
        TreeNode.superclass.destroy.call(this, silent);
        Ext.destroy(this.ui, this.loader);
        this.ui = this.loader = null;
    },

    
    onIdChange : function(id){
        this.ui.onIdChange(id);
    }
});

//NodeType
NodeType.node = TreeNode;

export default TreeNode;