import Ext from '../Base';
import Observable from '../util/Observable';

var Node = function(attributes){
    
    this.attributes = attributes || {};
    this.leaf = this.attributes.leaf;
    
    this.id = this.attributes.id;
    if(!this.id){
        this.id = Ext.id(null, "xnode-");
        this.attributes.id = this.id;
    }
    
    this.childNodes = [];
    if(!this.childNodes.indexOf){ 
        this.childNodes.indexOf = function(o){
            for(var i = 0, len = this.length; i < len; i++){
                if(this[i] == o){
                    return i;
                }
            }
            return -1;
        };
    }
    
    this.parentNode = null;
    
    this.firstChild = null;
    
    this.lastChild = null;
    
    this.previousSibling = null;
    
    this.nextSibling = null;

    this.addEvents({
       
       "append" : true,
       
       "remove" : true,
       
       "move" : true,
       
       "insert" : true,
       
       "beforeappend" : true,
       
       "beforeremove" : true,
       
       "beforemove" : true,
       
       "beforeinsert" : true
   });
    this.listeners = this.attributes.listeners;
    Node.superclass.constructor.call(this);
};



Ext.extend(Node, Observable, {
    
    fireEvent : function(evtName){
        
        if(Node.superclass.fireEvent.apply(this, arguments) === false){
            return false;
        }
        
        var ot = this.getOwnerTree();
        if(ot){
            if(ot.proxyNodeEvent.apply(ot, arguments) === false){
                return false;
            }
        }
        return true;
    },

    
    isLeaf : function(){
        return this.leaf === true;
    },

    
    setFirstChild : function(node){
        this.firstChild = node;
    },

    
    setLastChild : function(node){
        this.lastChild = node;
    },


    
    isLast : function(){
       return (!this.parentNode ? true : this.parentNode.lastChild == this);
    },

    
    isFirst : function(){
       return (!this.parentNode ? true : this.parentNode.firstChild == this);
    },

    
    hasChildNodes : function(){		
        return !this.isLeaf() && this.childNodes.length > 0;
    },

    
    isExpandable : function(){
        return this.attributes.expandable || this.hasChildNodes();
    },

    
    appendChild : function(node){
        var multi = false;
        if(Ext.isArray(node)){
            multi = node;
        }else if(arguments.length > 1){
            multi = arguments;
        }
        
        if(multi){
            for(var i = 0, len = multi.length; i < len; i++) {
                this.appendChild(multi[i]);
            }
        }else{
            if(this.fireEvent("beforeappend", this.ownerTree, this, node) === false){
                return false;
            }
            var index = this.childNodes.length;
            var oldParent = node.parentNode;
            
            if(oldParent){
                if(node.fireEvent("beforemove", node.getOwnerTree(), node, oldParent, this, index) === false){
                    return false;
                }
                oldParent.removeChild(node);
            }
            index = this.childNodes.length;
            if(index === 0){
                this.setFirstChild(node);
            }
            this.childNodes.push(node);
            node.parentNode = this;
            var ps = this.childNodes[index-1];
            if(ps){
                node.previousSibling = ps;
                ps.nextSibling = node;
            }else{
                node.previousSibling = null;
            }
            node.nextSibling = null;
            this.setLastChild(node);
            node.setOwnerTree(this.getOwnerTree());
            this.fireEvent("append", this.ownerTree, this, node, index);
            if(oldParent){
                node.fireEvent("move", this.ownerTree, node, oldParent, this, index);
            }
            return node;
        }
    },

    
    removeChild : function(node, destroy){
        var index = this.childNodes.indexOf(node);
        if(index == -1){
            return false;
        }
        if(this.fireEvent("beforeremove", this.ownerTree, this, node) === false){
            return false;
        }

        
        this.childNodes.splice(index, 1);

        
        if(node.previousSibling){
            node.previousSibling.nextSibling = node.nextSibling;
        }
        if(node.nextSibling){
            node.nextSibling.previousSibling = node.previousSibling;
        }

        
        if(this.firstChild == node){
            this.setFirstChild(node.nextSibling);
        }
        if(this.lastChild == node){
            this.setLastChild(node.previousSibling);
        }

        this.fireEvent("remove", this.ownerTree, this, node);
        if(destroy){
            node.destroy(true);
        }else{
            node.clear();
        }
        return node;
    },

    
    clear : function(destroy){
        
        this.setOwnerTree(null, destroy);
        this.parentNode = this.previousSibling = this.nextSibling = null;
        if(destroy){
            this.firstChild = this.lastChild = null;
        }
    },

    
    destroy : function( silent){
        
        if(silent === true){
            this.purgeListeners();
            this.clear(true);
            Ext.each(this.childNodes, function(n){
                n.destroy(true);
            });
            this.childNodes = null;
        }else{
            this.remove(true);
        }
    },

    
    insertBefore : function(node, refNode){
        if(!refNode){ 
            return this.appendChild(node);
        }
        
        if(node == refNode){
            return false;
        }

        if(this.fireEvent("beforeinsert", this.ownerTree, this, node, refNode) === false){
            return false;
        }
        var index = this.childNodes.indexOf(refNode);
        var oldParent = node.parentNode;
        var refIndex = index;

        
        if(oldParent == this && this.childNodes.indexOf(node) < index){
            refIndex--;
        }

        
        if(oldParent){
            if(node.fireEvent("beforemove", node.getOwnerTree(), node, oldParent, this, index, refNode) === false){
                return false;
            }
            oldParent.removeChild(node);
        }
        if(refIndex === 0){
            this.setFirstChild(node);
        }
        this.childNodes.splice(refIndex, 0, node);
        node.parentNode = this;
        var ps = this.childNodes[refIndex-1];
        if(ps){
            node.previousSibling = ps;
            ps.nextSibling = node;
        }else{
            node.previousSibling = null;
        }
        node.nextSibling = refNode;
        refNode.previousSibling = node;
        node.setOwnerTree(this.getOwnerTree());
        this.fireEvent("insert", this.ownerTree, this, node, refNode);
        if(oldParent){
            node.fireEvent("move", this.ownerTree, node, oldParent, this, refIndex, refNode);
        }
        return node;
    },

    
    remove : function(destroy){
        if (this.parentNode) {
            this.parentNode.removeChild(this, destroy);
        }
        return this;
    },

    
    removeAll : function(destroy){
        var cn = this.childNodes,
            n;
        while((n = cn[0])){
            this.removeChild(n, destroy);
        }
        return this;
    },

    
    item : function(index){
        return this.childNodes[index];
    },

    
    replaceChild : function(newChild, oldChild){
        var s = oldChild ? oldChild.nextSibling : null;
        this.removeChild(oldChild);
        this.insertBefore(newChild, s);
        return oldChild;
    },

    
    indexOf : function(child){
        return this.childNodes.indexOf(child);
    },

    
    getOwnerTree : function(){
        
        if(!this.ownerTree){
            var p = this;
            while(p){
                if(p.ownerTree){
                    this.ownerTree = p.ownerTree;
                    break;
                }
                p = p.parentNode;
            }
        }
        return this.ownerTree;
    },

    
    getDepth : function(){
        var depth = 0;
        var p = this;
        while(p.parentNode){
            ++depth;
            p = p.parentNode;
        }
        return depth;
    },

    
    setOwnerTree : function(tree, destroy){
        
        if(tree != this.ownerTree){
            if(this.ownerTree){
                this.ownerTree.unregisterNode(this);
            }
            this.ownerTree = tree;
            
            if(destroy !== true){
                Ext.each(this.childNodes, function(n){
                    n.setOwnerTree(tree);
                });
            }
            if(tree){
                tree.registerNode(this);
            }
        }
    },

    
    setId: function(id){
        if(id !== this.id){
            var t = this.ownerTree;
            if(t){
                t.unregisterNode(this);
            }
            this.id = this.attributes.id = id;
            if(t){
                t.registerNode(this);
            }
            this.onIdChange(id);
        }
    },

    
    onIdChange: Ext.emptyFn,

    
    getPath : function(attr){
        attr = attr || "id";
        var p = this.parentNode;
        var b = [this.attributes[attr]];
        while(p){
            b.unshift(p.attributes[attr]);
            p = p.parentNode;
        }
        var sep = this.getOwnerTree().pathSeparator;
        return sep + b.join(sep);
    },

    
    bubble : function(fn, scope, args){
        var p = this;
        while(p){
            if(fn.apply(scope || p, args || [p]) === false){
                break;
            }
            p = p.parentNode;
        }
    },

    
    cascade : function(fn, scope, args){
        if(fn.apply(scope || this, args || [this]) !== false){
            var cs = this.childNodes;
            for(var i = 0, len = cs.length; i < len; i++) {
                cs[i].cascade(fn, scope, args);
            }
        }
    },

    
    eachChild : function(fn, scope, args){
        var cs = this.childNodes;
        for(var i = 0, len = cs.length; i < len; i++) {
            if(fn.apply(scope || this, args || [cs[i]]) === false){
                break;
            }
        }
    },

    
    findChild : function(attribute, value, deep){
        return this.findChildBy(function(){
            return this.attributes[attribute] == value;
        }, null, deep);
    },

    
    findChildBy : function(fn, scope, deep){
        var cs = this.childNodes,
            len = cs.length,
            i = 0,
            n,
            res;
        for(; i < len; i++){
            n = cs[i];
            if(fn.call(scope || n, n) === true){
                return n;
            }else if (deep){
                res = n.findChildBy(fn, scope, deep);
                if(res != null){
                    return res;
                }
            }
            
        }
        return null;
    },

    
    sort : function(fn, scope){
        var cs = this.childNodes;
        var len = cs.length;
        if(len > 0){
            var sortFn = scope ? function(){fn.apply(scope, arguments);} : fn;
            cs.sort(sortFn);
            for(var i = 0; i < len; i++){
                var n = cs[i];
                n.previousSibling = cs[i-1];
                n.nextSibling = cs[i+1];
                if(i === 0){
                    this.setFirstChild(n);
                }
                if(i == len-1){
                    this.setLastChild(n);
                }
            }
        }
    },

    
    contains : function(node){
        return node.isAncestor(this);
    },

    
    isAncestor : function(node){
        var p = this.parentNode;
        while(p){
            if(p == node){
                return true;
            }
            p = p.parentNode;
        }
        return false;
    },

    toString : function(){
        return "[Node"+(this.id?" "+this.id:"")+"]";
    }
});

export default Node;