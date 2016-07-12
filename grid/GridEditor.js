import Ext from '../Base';
import Editor from '../Editor';

var GridEditor = function(field, config){
    GridEditor.superclass.constructor.call(this, field, config);
    field.monitorTab = false;
};


Ext.extend(GridEditor, Editor, {
    alignment: "tl-tl",
    autoSize: "width",
    hideEl : false,
    cls: "x-small-editor x-grid-editor",
    shim:false,
    shadow:false
});

export default GridEditor;