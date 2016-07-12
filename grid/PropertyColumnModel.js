import Ext from '../Base';
import DateField from '../from/DateField';
import TextField from '../from/TextField';
import NumberField from '../from/NumberField';
import Format from '../util/Format';
import GridEditor from './GridEditor';
import ColumnModel from './ColumnModel';

var PropertyColumnModel = Ext.extend(ColumnModel, {
    
    nameText : 'Name',
    valueText : 'Value',
    dateFormat : 'm/j/Y',
    trueText: 'true',
    falseText: 'false',
    
    constructor : function(grid, store){
        /*var g = Ext.grid,
	        f = Ext.form;*/
	        
	    this.grid = grid;
		PropertyColumnModel.superclass.constructor.call(this, [
	        {header: this.nameText, width:50, sortable: true, dataIndex:'name', id: 'name', menuDisabled:true},
	        {header: this.valueText, width:50, resizable:false, dataIndex: 'value', id: 'value', menuDisabled:true}
	    ]);
	    this.store = store;
	
	    var bfield = new Field({
	        autoCreate: {tag: 'select', children: [
	            {tag: 'option', value: 'true', html: this.trueText},
	            {tag: 'option', value: 'false', html: this.falseText}
	        ]},
	        getValue : function(){
	            return this.el.dom.value == 'true';
	        }
	    });
	    this.editors = {
	        'date' : new GridEditor(new DateField({selectOnFocus:true})),
	        'string' : new GridEditor(new TextField({selectOnFocus:true})),
	        'number' : new GridEditor(new NumberField({selectOnFocus:true, style:'text-align:left;'})),
	        'boolean' : new GridEditor(bfield, {
	            autoSize: 'both'
	        })
	    };
	    this.renderCellDelegate = this.renderCell.createDelegate(this);
	    this.renderPropDelegate = this.renderProp.createDelegate(this);
    },

    
    renderDate : function(dateVal){
        return dateVal.dateFormat(this.dateFormat);
    },

    
    renderBool : function(bVal){
        return this[bVal ? 'trueText' : 'falseText'];
    },

    
    isCellEditable : function(colIndex, rowIndex){
        return colIndex == 1;
    },

    
    getRenderer : function(col){
        return col == 1 ?
            this.renderCellDelegate : this.renderPropDelegate;
    },

    
    renderProp : function(v){
        return this.getPropertyName(v);
    },

    
    renderCell : function(val, meta, rec){
        var renderer = this.grid.customRenderers[rec.get('name')];
        if(renderer){
            return renderer.apply(this, arguments);
        }
        var rv = val;
        if(Ext.isDate(val)){
            rv = this.renderDate(val);
        }else if(typeof val == 'boolean'){
            rv = this.renderBool(val);
        }
        return Format.htmlEncode(rv);
    },

    
    getPropertyName : function(name){
        var pn = this.grid.propertyNames;
        return pn && pn[name] ? pn[name] : name;
    },

    
    getCellEditor : function(colIndex, rowIndex){
        var p = this.store.getProperty(rowIndex),
            n = p.data.name, 
            val = p.data.value;
        if(this.grid.customEditors[n]){
            return this.grid.customEditors[n];
        }
        if(Ext.isDate(val)){
            return this.editors.date;
        }else if(typeof val == 'number'){
            return this.editors.number;
        }else if(typeof val == 'boolean'){
            return this.editors['boolean'];
        }else{
            return this.editors.string;
        }
    },

    
    destroy : function(){
        PropertyColumnModel.superclass.destroy.call(this);
        for(var ed in this.editors){
            Ext.destroy(this.editors[ed]);
        }
    }
});

export default PropertyColumnModel;