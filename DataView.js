import Ext from './Base';
import BoxComponent from './BoxComponent';
import XTemplate from './XTemplate';
import StoreMgr from './StoreMgr';
import CompositeElementLite from './CompositeElementLite';
import Record from './data/Record';

var DataView = Ext.extend(BoxComponent, {
    
    selectedClass : "x-view-selected",
    
    emptyText : "",
    
    deferEmptyText: true,
    
    trackOver: false,
    
    
    blockRefresh: false,

    
    last: false,

    
    initComponent : function(){
        DataView.superclass.initComponent.call(this);
        if(Ext.isString(this.tpl) || Ext.isArray(this.tpl)){
            this.tpl = new XTemplate(this.tpl);
        }

        this.addEvents(
            
            "beforeclick",
            
            "click",
            
            "mouseenter",
            
            "mouseleave",
            
            "containerclick",
            
            "dblclick",
            
            "contextmenu",
            
            "containercontextmenu",
            
            "selectionchange",

            
            "beforeselect"
        );

        this.store = StoreMgr.lookup(this.store);
        this.all = new CompositeElementLite();
        this.selected = new CompositeElementLite();
    },

    
    afterRender : function(){
        DataView.superclass.afterRender.call(this);

		this.mon(this.getTemplateTarget(), {
            "click": this.onClick,
            "dblclick": this.onDblClick,
            "contextmenu": this.onContextMenu,
            scope:this
        });

        if(this.overClass || this.trackOver){
            this.mon(this.getTemplateTarget(), {
                "mouseover": this.onMouseOver,
                "mouseout": this.onMouseOut,
                scope:this
            });
        }

        if(this.store){
            this.bindStore(this.store, true);
        }
    },

    
    refresh : function() {
        this.clearSelections(false, true);
        var el = this.getTemplateTarget();
        el.update("");
        var records = this.store.getRange();
        if(records.length < 1){
            if(!this.deferEmptyText || this.hasSkippedEmptyText){
                el.update(this.emptyText);
            }
            this.all.clear();
        }else{
            this.tpl.overwrite(el, this.collectData(records, 0));
            this.all.fill(Ext.query(this.itemSelector, el.dom));
            this.updateIndexes(0);
        }
        this.hasSkippedEmptyText = true;
    },

    getTemplateTarget: function(){
        return this.el;
    },

    
    prepareData : function(data){
        return data;
    },

    
    collectData : function(records, startIndex){
        var r = [];
        for(var i = 0, len = records.length; i < len; i++){
            r[r.length] = this.prepareData(records[i].data, startIndex+i, records[i]);
        }
        return r;
    },

    
    bufferRender : function(records){
        var div = document.createElement('div');
        this.tpl.overwrite(div, this.collectData(records));
        return Ext.query(this.itemSelector, div);
    },

    
    onUpdate : function(ds, record){
        var index = this.store.indexOf(record);
        if(index > -1){
            var sel = this.isSelected(index);
            var original = this.all.elements[index];
            var node = this.bufferRender([record], index)[0];

            this.all.replaceElement(index, node, true);
            if(sel){
                this.selected.replaceElement(original, node);
                this.all.item(index).addClass(this.selectedClass);
            }
            this.updateIndexes(index, index);
        }
    },

    
    onAdd : function(ds, records, index){
        if(this.all.getCount() === 0){
            this.refresh();
            return;
        }
        var nodes = this.bufferRender(records, index), n, a = this.all.elements;
        if(index < this.all.getCount()){
            n = this.all.item(index).insertSibling(nodes, 'before', true);
            a.splice.apply(a, [index, 0].concat(nodes));
        }else{
            n = this.all.last().insertSibling(nodes, 'after', true);
            a.push.apply(a, nodes);
        }
        this.updateIndexes(index);
    },

    
    onRemove : function(ds, record, index){
        this.deselect(index);
        this.all.removeElement(index, true);
        this.updateIndexes(index);
        if (this.store.getCount() === 0){
            this.refresh();
        }
    },

    
    refreshNode : function(index){
        this.onUpdate(this.store, this.store.getAt(index));
    },

    
    updateIndexes : function(startIndex, endIndex){
        var ns = this.all.elements;
        startIndex = startIndex || 0;
        endIndex = endIndex || ((endIndex === 0) ? 0 : (ns.length - 1));
        for(var i = startIndex; i <= endIndex; i++){
            ns[i].viewIndex = i;
        }
    },
    
    
    getStore : function(){
        return this.store;
    },

    
    bindStore : function(store, initial){
        if(!initial && this.store){
            if(store !== this.store && this.store.autoDestroy){
                this.store.destroy();
            }else{
                this.store.un("beforeload", this.onBeforeLoad, this);
                this.store.un("datachanged", this.onDataChanged, this);
                this.store.un("add", this.onAdd, this);
                this.store.un("remove", this.onRemove, this);
                this.store.un("update", this.onUpdate, this);
                this.store.un("clear", this.refresh, this);
            }
            if(!store){
                this.store = null;
            }
        }
        if(store){
            store = StoreMgr.lookup(store);
            store.on({
                scope: this,
                beforeload: this.onBeforeLoad,
                datachanged: this.onDataChanged,
                add: this.onAdd,
                remove: this.onRemove,
                update: this.onUpdate,
                clear: this.refresh
            });
        }
        this.store = store;
        if(store){
            this.refresh();
        }
    },
    
    
    onDataChanged: function() {
        if (this.blockRefresh !== true) {
            this.refresh.apply(this, arguments);
        }
    },

    
    findItemFromChild : function(node){
        return Ext.fly(node).findParent(this.itemSelector, this.getTemplateTarget());
    },

    
    onClick : function(e){
        var item = e.getTarget(this.itemSelector, this.getTemplateTarget());
        if(item){
            var index = this.indexOf(item);
            if(this.onItemClick(item, index, e) !== false){
                this.fireEvent("click", this, index, item, e);
            }
        }else{
            if(this.fireEvent("containerclick", this, e) !== false){
                this.onContainerClick(e);
            }
        }
    },

    onContainerClick : function(e){
        this.clearSelections();
    },

    
    onContextMenu : function(e){
        var item = e.getTarget(this.itemSelector, this.getTemplateTarget());
        if(item){
            this.fireEvent("contextmenu", this, this.indexOf(item), item, e);
        }else{
            this.fireEvent("containercontextmenu", this, e);
        }
    },

    
    onDblClick : function(e){
        var item = e.getTarget(this.itemSelector, this.getTemplateTarget());
        if(item){
            this.fireEvent("dblclick", this, this.indexOf(item), item, e);
        }
    },

    
    onMouseOver : function(e){
        var item = e.getTarget(this.itemSelector, this.getTemplateTarget());
        if(item && item !== this.lastItem){
            this.lastItem = item;
            Ext.fly(item).addClass(this.overClass);
            this.fireEvent("mouseenter", this, this.indexOf(item), item, e);
        }
    },

    
    onMouseOut : function(e){
        if(this.lastItem){
            if(!e.within(this.lastItem, true, true)){
                Ext.fly(this.lastItem).removeClass(this.overClass);
                this.fireEvent("mouseleave", this, this.indexOf(this.lastItem), this.lastItem, e);
                delete this.lastItem;
            }
        }
    },

    
    onItemClick : function(item, index, e){
        if(this.fireEvent("beforeclick", this, index, item, e) === false){
            return false;
        }
        if(this.multiSelect){
            this.doMultiSelection(item, index, e);
            e.preventDefault();
        }else if(this.singleSelect){
            this.doSingleSelection(item, index, e);
            e.preventDefault();
        }
        return true;
    },

    
    doSingleSelection : function(item, index, e){
        if(e.ctrlKey && this.isSelected(index)){
            this.deselect(index);
        }else{
            this.select(index, false);
        }
    },

    
    doMultiSelection : function(item, index, e){
        if(e.shiftKey && this.last !== false){
            var last = this.last;
            this.selectRange(last, index, e.ctrlKey);
            this.last = last; 
        }else{
            if((e.ctrlKey||this.simpleSelect) && this.isSelected(index)){
                this.deselect(index);
            }else{
                this.select(index, e.ctrlKey || e.shiftKey || this.simpleSelect);
            }
        }
    },

    
    getSelectionCount : function(){
        return this.selected.getCount();
    },

    
    getSelectedNodes : function(){
        return this.selected.elements;
    },

    
    getSelectedIndexes : function(){
        var indexes = [], s = this.selected.elements;
        for(var i = 0, len = s.length; i < len; i++){
            indexes.push(s[i].viewIndex);
        }
        return indexes;
    },

    
    getSelectedRecords : function(){
        var r = [], s = this.selected.elements;
        for(var i = 0, len = s.length; i < len; i++){
            r[r.length] = this.store.getAt(s[i].viewIndex);
        }
        return r;
    },

    
    getRecords : function(nodes){
        var r = [], s = nodes;
        for(var i = 0, len = s.length; i < len; i++){
            r[r.length] = this.store.getAt(s[i].viewIndex);
        }
        return r;
    },

    
    getRecord : function(node){
        return this.store.getAt(node.viewIndex);
    },

    
    clearSelections : function(suppressEvent, skipUpdate){
        if((this.multiSelect || this.singleSelect) && this.selected.getCount() > 0){
            if(!skipUpdate){
                this.selected.removeClass(this.selectedClass);
            }
            this.selected.clear();
            this.last = false;
            if(!suppressEvent){
                this.fireEvent("selectionchange", this, this.selected.elements);
            }
        }
    },

    
    isSelected : function(node){
        return this.selected.contains(this.getNode(node));
    },

    
    deselect : function(node){
        if(this.isSelected(node)){
            node = this.getNode(node);
            this.selected.removeElement(node);
            if(this.last == node.viewIndex){
                this.last = false;
            }
            Ext.fly(node).removeClass(this.selectedClass);
            this.fireEvent("selectionchange", this, this.selected.elements);
        }
    },

    
    select : function(nodeInfo, keepExisting, suppressEvent){
        if(Ext.isArray(nodeInfo)){
            if(!keepExisting){
                this.clearSelections(true);
            }
            for(var i = 0, len = nodeInfo.length; i < len; i++){
                this.select(nodeInfo[i], true, true);
            }
            if(!suppressEvent){
                this.fireEvent("selectionchange", this, this.selected.elements);
            }
        } else{
            var node = this.getNode(nodeInfo);
            if(!keepExisting){
                this.clearSelections(true);
            }
            if(node && !this.isSelected(node)){
                if(this.fireEvent("beforeselect", this, node, this.selected.elements) !== false){
                    Ext.fly(node).addClass(this.selectedClass);
                    this.selected.add(node);
                    this.last = node.viewIndex;
                    if(!suppressEvent){
                        this.fireEvent("selectionchange", this, this.selected.elements);
                    }
                }
            }
        }
    },

    
    selectRange : function(start, end, keepExisting){
        if(!keepExisting){
            this.clearSelections(true);
        }
        this.select(this.getNodes(start, end), true);
    },

    
    getNode : function(nodeInfo){
        if(Ext.isString(nodeInfo)){
            return document.getElementById(nodeInfo);
        }else if(Ext.isNumber(nodeInfo)){
            return this.all.elements[nodeInfo];
        }else if(nodeInfo instanceof Record){
            var idx = this.store.indexOf(nodeInfo);
            return this.all.elements[idx];
        }
        return nodeInfo;
    },

    
    getNodes : function(start, end){
        var ns = this.all.elements;
        start = start || 0;
        end = !Ext.isDefined(end) ? Math.max(ns.length - 1, 0) : end;
        var nodes = [], i;
        if(start <= end){
            for(i = start; i <= end && ns[i]; i++){
                nodes.push(ns[i]);
            }
        } else{
            for(i = start; i >= end && ns[i]; i--){
                nodes.push(ns[i]);
            }
        }
        return nodes;
    },

    
    indexOf : function(node){
        node = this.getNode(node);
        if(Ext.isNumber(node.viewIndex)){
            return node.viewIndex;
        }
        return this.all.indexOf(node);
    },

    
    onBeforeLoad : function(){
        if(this.loadingText){
            this.clearSelections(false, true);
            this.getTemplateTarget().update('<div class="loading-indicator">'+this.loadingText+'</div>');
            this.all.clear();
        }
    },

    onDestroy : function(){
        this.all.clear();
        this.selected.clear();
        DataView.superclass.onDestroy.call(this);
        this.bindStore(null);
    }
});


DataView.prototype.setStore = DataView.prototype.bindStore;

Ext.reg('dataview', DataView);

export default DataView;
