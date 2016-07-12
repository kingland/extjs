import Ext from '../Base';
import Observable from '../util/Observable';

var Tree = function(root){
   this.nodeHash = {};
   
   this.root = null;
   if(root){
       this.setRootNode(root);
   }
   this.addEvents(
       
       "append",
       
       "remove",
       
       "move",
       
       "insert",
       
       "beforeappend",
       
       "beforeremove",
       
       "beforemove",
       
       "beforeinsert"
   );

    Tree.superclass.constructor.call(this);
};


Ext.extend(Tree, Observable, {
    
    pathSeparator: "/",

    
    proxyNodeEvent : function(){
        return this.fireEvent.apply(this, arguments);
    },

    
    getRootNode : function(){
        return this.root;
    },

    
    setRootNode : function(node){
        this.root = node;
        node.ownerTree = this;
        node.isRoot = true;
        this.registerNode(node);
        return node;
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
        return "[Tree"+(this.id?" "+this.id:"")+"]";
    }
});

export default Tree;