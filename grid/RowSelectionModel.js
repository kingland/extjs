﻿import Ext from '../Base';
import KeyNav from '../KeyNav';
import MixedCollection from '../util/MixedCollection';
import AbstractSelectionModel from './AbstractSelectionModel';

var RowSelectionModel = Ext.extend(AbstractSelectionModel,  {
    singleSelect : false,
    
    constructor : function(config){
        Ext.apply(this, config);
        this.selections = new MixedCollection(false, function(o){
            return o.id;
        });

        this.last = false;
        this.lastActive = false;

        this.addEvents(
	        
	        'selectionchange',
	        
	        'beforerowselect',
	        
	        'rowselect',
	        
	        'rowdeselect'
        );
        RowSelectionModel.superclass.constructor.call(this);
    },
    
    initEvents : function(){

        if(!this.grid.enableDragDrop && !this.grid.enableDrag){
            this.grid.on('rowmousedown', this.handleMouseDown, this);
        }

        this.rowNav = new KeyNav(this.grid.getGridEl(), {
            'up' : function(e){
                if(!e.shiftKey || this.singleSelect){
                    this.selectPrevious(false);
                }else if(this.last !== false && this.lastActive !== false){
                    var last = this.last;
                    this.selectRange(this.last,  this.lastActive-1);
                    this.grid.getView().focusRow(this.lastActive);
                    if(last !== false){
                        this.last = last;
                    }
                }else{
                    this.selectFirstRow();
                }
            },
            'down' : function(e){
                if(!e.shiftKey || this.singleSelect){
                    this.selectNext(false);
                }else if(this.last !== false && this.lastActive !== false){
                    var last = this.last;
                    this.selectRange(this.last,  this.lastActive+1);
                    this.grid.getView().focusRow(this.lastActive);
                    if(last !== false){
                        this.last = last;
                    }
                }else{
                    this.selectFirstRow();
                }
            },
            scope: this
        });

        this.grid.getView().on({
            scope: this,
            refresh: this.onRefresh,
            rowupdated: this.onRowUpdated,
            rowremoved: this.onRemove
        });
    },

    
    onRefresh : function(){
        var ds = this.grid.store, index;
        var s = this.getSelections();
        this.clearSelections(true);
        for(var i = 0, len = s.length; i < len; i++){
            var r = s[i];
            if((index = ds.indexOfId(r.id)) != -1){
                this.selectRow(index, true);
            }
        }
        if(s.length != this.selections.getCount()){
            this.fireEvent('selectionchange', this);
        }
    },

    
    onRemove : function(v, index, r){
        if(this.selections.remove(r) !== false){
            this.fireEvent('selectionchange', this);
        }
    },

    
    onRowUpdated : function(v, index, r){
        if(this.isSelected(r)){
            v.onRowSelect(index);
        }
    },

    
    selectRecords : function(records, keepExisting){
        if(!keepExisting){
            this.clearSelections();
        }
        var ds = this.grid.store;
        for(var i = 0, len = records.length; i < len; i++){
            this.selectRow(ds.indexOf(records[i]), true);
        }
    },

    
    getCount : function(){
        return this.selections.length;
    },

    
    selectFirstRow : function(){
        this.selectRow(0);
    },

    
    selectLastRow : function(keepExisting){
        this.selectRow(this.grid.store.getCount() - 1, keepExisting);
    },

    
    selectNext : function(keepExisting){
        if(this.hasNext()){
            this.selectRow(this.last+1, keepExisting);
            this.grid.getView().focusRow(this.last);
            return true;
        }
        return false;
    },

    
    selectPrevious : function(keepExisting){
        if(this.hasPrevious()){
            this.selectRow(this.last-1, keepExisting);
            this.grid.getView().focusRow(this.last);
            return true;
        }
        return false;
    },

    
    hasNext : function(){
        return this.last !== false && (this.last+1) < this.grid.store.getCount();
    },

    
    hasPrevious : function(){
        return !!this.last;
    },


    
    getSelections : function(){
        return [].concat(this.selections.items);
    },

    
    getSelected : function(){
        return this.selections.itemAt(0);
    },

    
    each : function(fn, scope){
        var s = this.getSelections();
        for(var i = 0, len = s.length; i < len; i++){
            if(fn.call(scope || this, s[i], i) === false){
                return false;
            }
        }
        return true;
    },

    
    clearSelections : function(fast){
        if(this.isLocked()){
            return;
        }
        if(fast !== true){
            var ds = this.grid.store;
            var s = this.selections;
            s.each(function(r){
                this.deselectRow(ds.indexOfId(r.id));
            }, this);
            s.clear();
        }else{
            this.selections.clear();
        }
        this.last = false;
    },


    
    selectAll : function(){
        if(this.isLocked()){
            return;
        }
        this.selections.clear();
        for(var i = 0, len = this.grid.store.getCount(); i < len; i++){
            this.selectRow(i, true);
        }
    },

    
    hasSelection : function(){
        return this.selections.length > 0;
    },

    
    isSelected : function(index){
        var r = Ext.isNumber(index) ? this.grid.store.getAt(index) : index;
        return (r && this.selections.key(r.id) ? true : false);
    },

    
    isIdSelected : function(id){
        return (this.selections.key(id) ? true : false);
    },

    
    handleMouseDown : function(g, rowIndex, e){
        if(e.button !== 0 || this.isLocked()){
            return;
        }
        var view = this.grid.getView();
        if(e.shiftKey && !this.singleSelect && this.last !== false){
            var last = this.last;
            this.selectRange(last, rowIndex, e.ctrlKey);
            this.last = last; 
            view.focusRow(rowIndex);
        }else{
            var isSelected = this.isSelected(rowIndex);
            if(e.ctrlKey && isSelected){
                this.deselectRow(rowIndex);
            }else if(!isSelected || this.getCount() > 1){
                this.selectRow(rowIndex, e.ctrlKey || e.shiftKey);
                view.focusRow(rowIndex);
            }
        }
    },

    
    selectRows : function(rows, keepExisting){
        if(!keepExisting){
            this.clearSelections();
        }
        for(var i = 0, len = rows.length; i < len; i++){
            this.selectRow(rows[i], true);
        }
    },

    
    selectRange : function(startRow, endRow, keepExisting){
        var i;
        if(this.isLocked()){
            return;
        }
        if(!keepExisting){
            this.clearSelections();
        }
        if(startRow <= endRow){
            for(i = startRow; i <= endRow; i++){
                this.selectRow(i, true);
            }
        }else{
            for(i = startRow; i >= endRow; i--){
                this.selectRow(i, true);
            }
        }
    },

    
    deselectRange : function(startRow, endRow, preventViewNotify){
        if(this.isLocked()){
            return;
        }
        for(var i = startRow; i <= endRow; i++){
            this.deselectRow(i, preventViewNotify);
        }
    },

    
    selectRow : function(index, keepExisting, preventViewNotify){
        if(this.isLocked() || (index < 0 || index >= this.grid.store.getCount()) || (keepExisting && this.isSelected(index))){
            return;
        }
        var r = this.grid.store.getAt(index);
        if(r && this.fireEvent('beforerowselect', this, index, keepExisting, r) !== false){
            if(!keepExisting || this.singleSelect){
                this.clearSelections();
            }
            this.selections.add(r);
            this.last = this.lastActive = index;
            if(!preventViewNotify){
                this.grid.getView().onRowSelect(index);
            }
            this.fireEvent('rowselect', this, index, r);
            this.fireEvent('selectionchange', this);
        }
    },

    
    deselectRow : function(index, preventViewNotify){
        if(this.isLocked()){
            return;
        }
        if(this.last == index){
            this.last = false;
        }
        if(this.lastActive == index){
            this.lastActive = false;
        }
        var r = this.grid.store.getAt(index);
        if(r){
            this.selections.remove(r);
            if(!preventViewNotify){
                this.grid.getView().onRowDeselect(index);
            }
            this.fireEvent('rowdeselect', this, index, r);
            this.fireEvent('selectionchange', this);
        }
    },

    
    restoreLast : function(){
        if(this._last){
            this.last = this._last;
        }
    },

    
    acceptsNav : function(row, col, cm){
        return !cm.isHidden(col) && cm.isCellEditable(col, row);
    },

    
    onEditorKey : function(field, e){
        var k = e.getKey(), 
            newCell, 
            g = this.grid, 
            last = g.lastEdit,
            ed = g.activeEditor,
            ae, last, r, c;
        var shift = e.shiftKey;
        if(k == e.TAB){
            e.stopEvent();
            ed.completeEdit();
            if(shift){
                newCell = g.walkCells(ed.row, ed.col-1, -1, this.acceptsNav, this);
            }else{
                newCell = g.walkCells(ed.row, ed.col+1, 1, this.acceptsNav, this);
            }
        }else if(k == e.ENTER){
            if(this.moveEditorOnEnter !== false){
                if(shift){
                    newCell = g.walkCells(last.row - 1, last.col, -1, this.acceptsNav, this);
                }else{
                    newCell = g.walkCells(last.row + 1, last.col, 1, this.acceptsNav, this);
                }
            }
        }
        if(newCell){
            r = newCell[0];
            c = newCell[1];

            if(last.row != r){
                this.selectRow(r); 
            }

            if(g.isEditor && g.editing){ 
                ae = g.activeEditor;
                if(ae && ae.field.triggerBlur){
                    
                    ae.field.triggerBlur();
                }
            }
            g.startEditing(r, c);
        }
    },
    
    destroy : function(){
        if(this.rowNav){
            this.rowNav.disable();
            this.rowNav = null;
        }
        RowSelectionModel.superclass.destroy.call(this);
    }
});

export default RowSelectionModel;