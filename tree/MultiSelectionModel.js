import Ext from '../Base';
import Observable from '../util/Observable';
import DefaultSelectionModel from './DefaultSelectionModel';

var MultiSelectionModel = Ext.extend(Observable, {
    
    constructor : function(config){
        this.selNodes = [];
        this.selMap = {};
        this.addEvents(
            
            'selectionchange'
        );
        Ext.apply(this, config);
        MultiSelectionModel.superclass.constructor.call(this);    
    },
    
    init : function(tree){
        this.tree = tree;
        tree.mon(tree.getTreeEl(), 'keydown', this.onKeyDown, this);
        tree.on('click', this.onNodeClick, this);
    },
    
    onNodeClick : function(node, e){
        if(e.ctrlKey && this.isSelected(node)){
            this.unselect(node);
        }else{
            this.select(node, e, e.ctrlKey);
        }
    },
    
    
    select : function(node, e, keepExisting){
        if(keepExisting !== true){
            this.clearSelections(true);
        }
        if(this.isSelected(node)){
            this.lastSelNode = node;
            return node;
        }
        this.selNodes.push(node);
        this.selMap[node.id] = node;
        this.lastSelNode = node;
        node.ui.onSelectedChange(true);
        this.fireEvent('selectionchange', this, this.selNodes);
        return node;
    },
    
    
    unselect : function(node){
        if(this.selMap[node.id]){
            node.ui.onSelectedChange(false);
            var sn = this.selNodes;
            var index = sn.indexOf(node);
            if(index != -1){
                this.selNodes.splice(index, 1);
            }
            delete this.selMap[node.id];
            this.fireEvent('selectionchange', this, this.selNodes);
        }
    },
    
    
    clearSelections : function(suppressEvent){
        var sn = this.selNodes;
        if(sn.length > 0){
            for(var i = 0, len = sn.length; i < len; i++){
                sn[i].ui.onSelectedChange(false);
            }
            this.selNodes = [];
            this.selMap = {};
            if(suppressEvent !== true){
                this.fireEvent('selectionchange', this, this.selNodes);
            }
        }
    },
    
    
    isSelected : function(node){
        return this.selMap[node.id] ? true : false;  
    },
    
    
    getSelectedNodes : function(){
        return this.selNodes.concat([]);
    },

    onKeyDown : DefaultSelectionModel.prototype.onKeyDown,

    selectNext : DefaultSelectionModel.prototype.selectNext,

    selectPrevious : DefaultSelectionModel.prototype.selectPrevious
});

export default MultiSelectionModel;