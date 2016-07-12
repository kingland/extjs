import Ext from '../Base';
import TreeNode from './TreeNode';
import NodeType from '../data/NodeType';

var AsyncTreeNode = function(config){
    this.loaded = config && config.loaded === true;
    this.loading = false;
   AsyncTreeNode.superclass.constructor.apply(this, arguments);
    
    this.addEvents('beforeload', 'load');
    
    
};

Ext.extend(AsyncTreeNode, TreeNode, {
    expand : function(deep, anim, callback, scope){
        if(this.loading){ 
            var timer;
            var f = function(){
                if(!this.loading){ 
                    clearInterval(timer);
                    this.expand(deep, anim, callback, scope);
                }
            }.createDelegate(this);
            timer = setInterval(f, 200);
            return;
        }
        if(!this.loaded){
            if(this.fireEvent("beforeload", this) === false){
                return;
            }
            this.loading = true;
            this.ui.beforeLoad(this);
            var loader = this.loader || this.attributes.loader || this.getOwnerTree().getLoader();
            if(loader){
                loader.load(this, this.loadComplete.createDelegate(this, [deep, anim, callback, scope]), this);
                return;
            }
        }
        AsyncTreeNode.superclass.expand.call(this, deep, anim, callback, scope);
    },
    
    
    isLoading : function(){
        return this.loading;  
    },
    
    loadComplete : function(deep, anim, callback, scope){
        this.loading = false;
        this.loaded = true;
        this.ui.afterLoad(this);
        this.fireEvent("load", this);
        this.expand(deep, anim, callback, scope);
    },
    
    
    isLoaded : function(){
        return this.loaded;
    },
    
    hasChildNodes : function(){
        if(!this.isLeaf() && !this.loaded){
            return true;
        }else{
            return AsyncTreeNode.superclass.hasChildNodes.call(this);
        }
    },

    
    reload : function(callback, scope){
        this.collapse(false, false);
        while(this.firstChild){
            this.removeChild(this.firstChild).destroy();
        }
        this.childrenRendered = false;
        this.loaded = false;
        if(this.isHiddenRoot()){
            this.expanded = false;
        }
        this.expand(false, false, callback, scope);
    }
});

NodeType.async = AsyncTreeNode;

export default AsyncTreeNode;