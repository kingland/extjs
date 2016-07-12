import Ext from '../Base';
import Observable from '../util/Observable';

var DefaultSelectionModel = Ext.extend( Observable, {
    
    constructor : function(config){
        this.selNode = null;
   
        this.addEvents(
            
            'selectionchange',

            
            'beforeselect'
        );

        Ext.apply(this, config);
        DefaultSelectionModel.superclass.constructor.call(this);    
    },
    
    init : function(tree){
        this.tree = tree;
        tree.mon(tree.getTreeEl(), 'keydown', this.onKeyDown, this);
        tree.on('click', this.onNodeClick, this);
    },
    
    onNodeClick : function(node, e){
        this.select(node);
    },
    
    
    select : function(node,  selectNextNode){
        
        if (!Ext.fly(node.ui.wrap).isVisible() && selectNextNode) {
            return selectNextNode.call(this, node);
        }
        var last = this.selNode;
        if(node == last){
            node.ui.onSelectedChange(true);
        }else if(this.fireEvent('beforeselect', this, node, last) !== false){
            if(last && last.ui){
                last.ui.onSelectedChange(false);
            }
            this.selNode = node;
            node.ui.onSelectedChange(true);
            this.fireEvent('selectionchange', this, node, last);
        }
        return node;
    },
    
    
    unselect : function(node, silent){
        if(this.selNode == node){
            this.clearSelections(silent);
        }    
    },
    
    
    clearSelections : function(silent){
        var n = this.selNode;
        if(n){
            n.ui.onSelectedChange(false);
            this.selNode = null;
            if(silent !== true){
                this.fireEvent('selectionchange', this, null);
            }
        }
        return n;
    },
    
    
    getSelectedNode : function(){
        return this.selNode;    
    },
    
    
    isSelected : function(node){
        return this.selNode == node;  
    },

    
    selectPrevious : function( s){
        if(!(s = s || this.selNode || this.lastSelNode)){
            return null;
        }
        
        var ps = s.previousSibling;
        if(ps){
            if(!ps.isExpanded() || ps.childNodes.length < 1){
                return this.select(ps, this.selectPrevious);
            } else{
                var lc = ps.lastChild;
                while(lc && lc.isExpanded() && Ext.fly(lc.ui.wrap).isVisible() && lc.childNodes.length > 0){
                    lc = lc.lastChild;
                }
                return this.select(lc, this.selectPrevious);
            }
        } else if(s.parentNode && (this.tree.rootVisible || !s.parentNode.isRoot)){
            return this.select(s.parentNode, this.selectPrevious);
        }
        return null;
    },

    
    selectNext : function( s){
        if(!(s = s || this.selNode || this.lastSelNode)){
            return null;
        }
        
        if(s.firstChild && s.isExpanded() && Ext.fly(s.ui.wrap).isVisible()){
             return this.select(s.firstChild, this.selectNext);
         }else if(s.nextSibling){
             return this.select(s.nextSibling, this.selectNext);
         }else if(s.parentNode){
            var newS = null;
            s.parentNode.bubble(function(){
                if(this.nextSibling){
                    newS = this.getOwnerTree().selModel.select(this.nextSibling, this.selectNext);
                    return false;
                }
            });
            return newS;
         }
        return null;
    },

    onKeyDown : function(e){
        var s = this.selNode || this.lastSelNode;
        
        var sm = this;
        if(!s){
            return;
        }
        var k = e.getKey();
        switch(k){
             case e.DOWN:
                 e.stopEvent();
                 this.selectNext();
             break;
             case e.UP:
                 e.stopEvent();
                 this.selectPrevious();
             break;
             case e.RIGHT:
                 e.preventDefault();
                 if(s.hasChildNodes()){
                     if(!s.isExpanded()){
                         s.expand();
                     }else if(s.firstChild){
                         this.select(s.firstChild, e);
                     }
                 }
             break;
             case e.LEFT:
                 e.preventDefault();
                 if(s.hasChildNodes() && s.isExpanded()){
                     s.collapse();
                 }else if(s.parentNode && (this.tree.rootVisible || s.parentNode != this.tree.getRootNode())){
                     this.select(s.parentNode, e);
                 }
             break;
        };
    }
});

export default DefaultSelectionModel;