import Ext from '../Base';
import TreeNodeUI from './TreeNodeUI';

var RootTreeNodeUI = Ext.extend(TreeNodeUI, {
    
    render : function(){
        if(!this.rendered){
            var targetNode = this.node.ownerTree.innerCt.dom;
            this.node.expanded = true;
            targetNode.innerHTML = '<div class="x-tree-root-node"></div>';
            this.wrap = this.ctNode = targetNode.firstChild;
        }
    },
    collapse : Ext.emptyFn,
    expand : Ext.emptyFn
});

