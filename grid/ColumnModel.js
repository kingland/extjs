import Ext from '../Base';
import Observable from '../util/Observable';
//Column.Type
//import Column from './Column';
//import ColumnModel from './ColumnModel';
import Column from './Column';
import BooleanColumn from './BooleanColumn';
import NumberColumn from './NumberColumn';
import DateColumn from './DateColumn';
import TemplateColumn from './TemplateColumn';

//Column.types = {
var CTYPES = {
    gridcolumn : Column,
    booleancolumn: BooleanColumn,
    numbercolumn: NumberColumn,
    datecolumn: DateColumn,
    templatecolumn: TemplateColumn
};

var ColumnModel = Ext.extend(Observable, {
    
    defaultWidth: 100,
    
    defaultSortable: false,

    constructor : function(config){
        
	    if(config.columns){
	        Ext.apply(this, config);
	        this.setConfig(config.columns, true);
	    }else{
	        this.setConfig(config, true);
	    }
	    this.addEvents(
	        
	        "widthchange",
	        
	        "headerchange",
	        
	        "hiddenchange",
	        
	        "columnmoved",
	        
	        "configchange"
	    );
	    ColumnModel.superclass.constructor.call(this);
    },

    
    getColumnId : function(index){
        return this.config[index].id;
    },

    getColumnAt : function(index){
        return this.config[index];
    },

    
    setConfig : function(config, initial){
        var i, c, len;
        if(!initial){ 
            delete this.totalWidth;
            for(i = 0, len = this.config.length; i < len; i++){
                c = this.config[i];
                if(c.setEditor){
                    
                    c.setEditor(null);
                }
            }
        }

        
        this.defaults = Ext.apply({
            width: this.defaultWidth,
            sortable: this.defaultSortable
        }, this.defaults);

        this.config = config;
        this.lookup = {};

        for(i = 0, len = config.length; i < len; i++){
            c = Ext.applyIf(config[i], this.defaults);
            
            if(Ext.isEmpty(c.id)){
                c.id = i;
            }
            if(!c.isColumn){
                //var Cls = Column.types[c.xtype || 'gridcolumn'];
				var Cls = CTYPES[c.xtype || 'gridcolumn'];
                c = new Cls(c);
                config[i] = c;
            }
            this.lookup[c.id] = c;
        }
        if(!initial){
            this.fireEvent('configchange', this);
        }
    },

    
    getColumnById : function(id){
        return this.lookup[id];
    },

    
    getIndexById : function(id){
        for(var i = 0, len = this.config.length; i < len; i++){
            if(this.config[i].id == id){
                return i;
            }
        }
        return -1;
    },

    
    moveColumn : function(oldIndex, newIndex){
        var c = this.config[oldIndex];
        this.config.splice(oldIndex, 1);
        this.config.splice(newIndex, 0, c);
        this.dataMap = null;
        this.fireEvent("columnmoved", this, oldIndex, newIndex);
    },

    
    getColumnCount : function(visibleOnly){
        if(visibleOnly === true){
            var c = 0;
            for(var i = 0, len = this.config.length; i < len; i++){
                if(!this.isHidden(i)){
                    c++;
                }
            }
            return c;
        }
        return this.config.length;
    },

    
    getColumnsBy : function(fn, scope){
        var r = [];
        for(var i = 0, len = this.config.length; i < len; i++){
            var c = this.config[i];
            if(fn.call(scope||this, c, i) === true){
                r[r.length] = c;
            }
        }
        return r;
    },

    
    isSortable : function(col){
        return !!this.config[col].sortable;
    },

    
    isMenuDisabled : function(col){
        return !!this.config[col].menuDisabled;
    },

    
    getRenderer : function(col){
        if(!this.config[col].renderer){
            return ColumnModel.defaultRenderer;
        }
        return this.config[col].renderer;
    },

    getRendererScope : function(col){
        return this.config[col].scope;
    },

    
    setRenderer : function(col, fn){
        this.config[col].renderer = fn;
    },

    
    getColumnWidth : function(col){
        return this.config[col].width;
    },

    
    setColumnWidth : function(col, width, suppressEvent){
        this.config[col].width = width;
        this.totalWidth = null;
        if(!suppressEvent){
             this.fireEvent("widthchange", this, col, width);
        }
    },

    
    getTotalWidth : function(includeHidden){
        if(!this.totalWidth){
            this.totalWidth = 0;
            for(var i = 0, len = this.config.length; i < len; i++){
                if(includeHidden || !this.isHidden(i)){
                    this.totalWidth += this.getColumnWidth(i);
                }
            }
        }
        return this.totalWidth;
    },

    
    getColumnHeader : function(col){
        return this.config[col].header;
    },

    
    setColumnHeader : function(col, header){
        this.config[col].header = header;
        this.fireEvent("headerchange", this, col, header);
    },

    
    getColumnTooltip : function(col){
            return this.config[col].tooltip;
    },
    
    setColumnTooltip : function(col, tooltip){
            this.config[col].tooltip = tooltip;
    },

    
    getDataIndex : function(col){
        return this.config[col].dataIndex;
    },

    
    setDataIndex : function(col, dataIndex){
        this.config[col].dataIndex = dataIndex;
    },

    
    findColumnIndex : function(dataIndex){
        var c = this.config;
        for(var i = 0, len = c.length; i < len; i++){
            if(c[i].dataIndex == dataIndex){
                return i;
            }
        }
        return -1;
    },

    
    isCellEditable : function(colIndex, rowIndex){
        var c = this.config[colIndex],
            ed = c.editable;

        
        return !!(ed || (!Ext.isDefined(ed) && c.editor));
    },

    
    getCellEditor : function(colIndex, rowIndex){
        return this.config[colIndex].getCellEditor(rowIndex);
    },

    
    setEditable : function(col, editable){
        this.config[col].editable = editable;
    },

    
    isHidden : function(colIndex){
        return !!this.config[colIndex].hidden; 
    },

    
    isFixed : function(colIndex){
        return !!this.config[colIndex].fixed;
    },

    
    isResizable : function(colIndex){
        return colIndex >= 0 && this.config[colIndex].resizable !== false && this.config[colIndex].fixed !== true;
    },
    
    setHidden : function(colIndex, hidden){
        var c = this.config[colIndex];
        if(c.hidden !== hidden){
            c.hidden = hidden;
            this.totalWidth = null;
            this.fireEvent("hiddenchange", this, colIndex, hidden);
        }
    },

    
    setEditor : function(col, editor){
        this.config[col].setEditor(editor);
    },

    
    destroy : function(){
        var c;
        for(var i = 0, len = this.config.length; i < len; i++){
            c = this.config[i];
            if(c.setEditor){
                c.setEditor(null);
            }
        }
        this.purgeListeners();
    }
});

ColumnModel.defaultRenderer = function(value){
    if(typeof value == "string" && value.length < 1){
        return "&#160;";
    }
    return value;
};

export default ColumnModel;