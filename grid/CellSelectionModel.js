import Ext from '../Base';
import EventManager from '../EventManager';
import AbstractSelectionModel from './AbstractSelectionModel';

var CellSelectionModel = Ext.extend(AbstractSelectionModel,  {
    
    constructor : function(config){
        Ext.apply(this, config);

	    this.selection = null;
	
	    this.addEvents(
	        
	        "beforecellselect",
	        
	        "cellselect",
	        
	        "selectionchange"
	    );
	
	    CellSelectionModel.superclass.constructor.call(this);
    },

    
    initEvents : function(){
        this.grid.on('cellmousedown', this.handleMouseDown, this);
        this.grid.on(EventManager.useKeydown ? 'keydown' : 'keypress', this.handleKeyDown, this);
        this.grid.getView().on({
            scope: this,
            refresh: this.onViewChange,
            rowupdated: this.onRowUpdated,
            beforerowremoved: this.clearSelections,
            beforerowsinserted: this.clearSelections
        });
        if(this.grid.isEditor){
            this.grid.on('beforeedit', this.beforeEdit,  this);
        }
    },

	
    beforeEdit : function(e){
        this.select(e.row, e.column, false, true, e.record);
    },

	
    onRowUpdated : function(v, index, r){
        if(this.selection && this.selection.record == r){
            v.onCellSelect(index, this.selection.cell[1]);
        }
    },

	
    onViewChange : function(){
        this.clearSelections(true);
    },

	
    getSelectedCell : function(){
        return this.selection ? this.selection.cell : null;
    },

    
    clearSelections : function(preventNotify){
        var s = this.selection;
        if(s){
            if(preventNotify !== true){
                this.grid.view.onCellDeselect(s.cell[0], s.cell[1]);
            }
            this.selection = null;
            this.fireEvent("selectionchange", this, null);
        }
    },

    
    hasSelection : function(){
        return this.selection ? true : false;
    },

    
    handleMouseDown : function(g, row, cell, e){
        if(e.button !== 0 || this.isLocked()){
            return;
        }
        this.select(row, cell);
    },

    
    select : function(rowIndex, colIndex, preventViewNotify, preventFocus,  r){
        if(this.fireEvent("beforecellselect", this, rowIndex, colIndex) !== false){
            this.clearSelections();
            r = r || this.grid.store.getAt(rowIndex);
            this.selection = {
                record : r,
                cell : [rowIndex, colIndex]
            };
            if(!preventViewNotify){
                var v = this.grid.getView();
                v.onCellSelect(rowIndex, colIndex);
                if(preventFocus !== true){
                    v.focusCell(rowIndex, colIndex);
                }
            }
            this.fireEvent("cellselect", this, rowIndex, colIndex);
            this.fireEvent("selectionchange", this, this.selection);
        }
    },

	
    isSelectable : function(rowIndex, colIndex, cm){
        return !cm.isHidden(colIndex);
    },
    
    
    onEditorKey: function(field, e){
        if(e.getKey() == e.TAB){
            this.handleKeyDown(e);
        }
    },

    
    handleKeyDown : function(e){
        if(!e.isNavKeyPress()){
            return;
        }
        
        var k = e.getKey(),
            g = this.grid,
            s = this.selection,
            sm = this,
            walk = function(row, col, step){
                return g.walkCells(
                    row,
                    col,
                    step,
                    g.isEditor && g.editing ? sm.acceptsNav : sm.isSelectable, 
                    sm
                );
            },
            cell, newCell, r, c, ae;

        switch(k){
            case e.ESC:
            case e.PAGE_UP:
            case e.PAGE_DOWN:
                
                break;
            default:
                
                e.stopEvent();
                break;
        }

        if(!s){
            cell = walk(0, 0, 1); 
            if(cell){
                this.select(cell[0], cell[1]);
            }
            return;
        }

        cell = s.cell;  
        r = cell[0];    
        c = cell[1];    
        
        switch(k){
            case e.TAB:
                if(e.shiftKey){
                    newCell = walk(r, c - 1, -1);
                }else{
                    newCell = walk(r, c + 1, 1);
                }
                break;
            case e.DOWN:
                newCell = walk(r + 1, c, 1);
                break;
            case e.UP:
                newCell = walk(r - 1, c, -1);
                break;
            case e.RIGHT:
                newCell = walk(r, c + 1, 1);
                break;
            case e.LEFT:
                newCell = walk(r, c - 1, -1);
                break;
            case e.ENTER:
                if (g.isEditor && !g.editing) {
                    g.startEditing(r, c);
                    return;
                }
                break;
        }

        if(newCell){
            
            r = newCell[0];
            c = newCell[1];

            this.select(r, c); 

            if(g.isEditor && g.editing){ 
                ae = g.activeEditor;
                if(ae && ae.field.triggerBlur){
                    
                    ae.field.triggerBlur();
                }
                g.startEditing(r, c);
            }
        }
    },

    acceptsNav : function(row, col, cm){
        return !cm.isHidden(col) && cm.isCellEditable(col, row);
    }
});

export default CellSelectionModel;