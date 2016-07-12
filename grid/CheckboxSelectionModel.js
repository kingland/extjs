import Ext from '../Base';
import RowSelectionModel from './RowSelectionModel';

var CheckboxSelectionModel = Ext.extend(RowSelectionModel, {
    
    header : '<div class="x-grid3-hd-checker">&#160;</div>',
    
    width : 20,
    
    sortable : false,

    
    menuDisabled : true,
    fixed : true,
    hideable: false,
    dataIndex : '',
    id : 'checker',

    constructor : function(){
        CheckboxSelectionModel.superclass.constructor.apply(this, arguments);

        if(this.checkOnly){
            this.handleMouseDown = Ext.emptyFn;
        }
    },

    
    initEvents : function(){
        CheckboxSelectionModel.superclass.initEvents.call(this);
        this.grid.on('render', function(){
            var view = this.grid.getView();
            view.mainBody.on('mousedown', this.onMouseDown, this);
            Ext.fly(view.innerHd).on('mousedown', this.onHdMouseDown, this);

        }, this);
    },

    
    
    handleMouseDown : function() {
        CheckboxSelectionModel.superclass.handleMouseDown.apply(this, arguments);
        this.mouseHandled = true;
    },

    
    onMouseDown : function(e, t){
        if(e.button === 0 && t.className == 'x-grid3-row-checker'){ 
            e.stopEvent();
            var row = e.getTarget('.x-grid3-row');

            
            if(!this.mouseHandled && row){
                var index = row.rowIndex;
                if(this.isSelected(index)){
                    this.deselectRow(index);
                }else{
                    this.selectRow(index, true);
                    this.grid.getView().focusRow(index);
                }
            }
        }
        this.mouseHandled = false;
    },

    
    onHdMouseDown : function(e, t){
        if(t.className == 'x-grid3-hd-checker'){
            e.stopEvent();
            var hd = Ext.fly(t.parentNode);
            var isChecked = hd.hasClass('x-grid3-hd-checker-on');
            if(isChecked){
                hd.removeClass('x-grid3-hd-checker-on');
                this.clearSelections();
            }else{
                hd.addClass('x-grid3-hd-checker-on');
                this.selectAll();
            }
        }
    },

    
    renderer : function(v, p, record){
        return '<div class="x-grid3-row-checker">&#160;</div>';
    }
});

export default CheckboxSelectionModel;