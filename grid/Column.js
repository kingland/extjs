import Ext from '../Base';
import Format from '../util/Format';
import GridEditor from './GridEditor';

var Column = Ext.extend(Object, {
    
    isColumn : true,

    constructor : function(config){
        Ext.apply(this, config);

        if(Ext.isString(this.renderer)){
            this.renderer = Format[this.renderer];
        }else if(Ext.isObject(this.renderer)){
            this.scope = this.renderer.scope;
            this.renderer = this.renderer.fn;
        }
        if(!this.scope){
            this.scope = this;
        }

        var ed = this.editor;
        delete this.editor;
        this.setEditor(ed);
    },

    
    renderer : function(value){
        if(Ext.isString(value) && value.length < 1){
            return '&#160;';
        }
        return value;
    },

    
    getEditor: function(rowIndex){
        return this.editable !== false ? this.editor : null;
    },

    
    setEditor : function(editor){
        var ed = this.editor;
        if(ed){
            if(ed.gridEditor){
                ed.gridEditor.destroy();
                delete ed.gridEditor;
            }else{
                ed.destroy();
            }
        }
        this.editor = null;
        if(editor){
            
            if(!editor.isXType){
                editor = Ext.create(editor, 'textfield');
            }
            this.editor = editor;
        }
    },

    
    getCellEditor: function(rowIndex){
        var ed = this.getEditor(rowIndex);
        if(ed){
            if(!ed.startEdit){
                if(!ed.gridEditor){
                    ed.gridEditor = new GridEditor(ed);
                }
                ed = ed.gridEditor;
            }
        }
        return ed;
    }
});

export default Column;