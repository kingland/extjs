import Ext from '../Base';
import PropertyStore from './PropertyStore';
import PropertyColumnModel from './PropertyColumnModel';
import EditorGridPanel from './EditorGridPanel';

var PropertyGrid = Ext.extend(EditorGridPanel, {
    enableColumnMove:false,
    stripeRows:false,
    trackMouseOver: false,
    clicksToEdit:1,
    enableHdMenu : false,
    viewConfig : {
        forceFit:true
    },

    
    initComponent : function(){
        this.customRenderers = this.customRenderers || {};
        this.customEditors = this.customEditors || {};
        this.lastEditRow = null;
        var store = new PropertyStore(this);
        this.propStore = store;
        var cm = new PropertyColumnModel(this, store);
        store.store.sort('name', 'ASC');
        this.addEvents(
            
            'beforepropertychange',
            
            'propertychange'
        );
        this.cm = cm;
        this.ds = store.store;
        PropertyGrid.superclass.initComponent.call(this);

		this.mon(this.selModel, 'beforecellselect', function(sm, rowIndex, colIndex){
            if(colIndex === 0){
                this.startEditing.defer(200, this, [rowIndex, 1]);
                return false;
            }
        }, this);
    },

    
    onRender : function(){
        PropertyGrid.superclass.onRender.apply(this, arguments);

        this.getGridEl().addClass('x-props-grid');
    },

    
    afterRender: function(){
        PropertyGrid.superclass.afterRender.apply(this, arguments);
        if(this.source){
            this.setSource(this.source);
        }
    },

    
    setSource : function(source){
        this.propStore.setSource(source);
    },

    
    getSource : function(){
        return this.propStore.getSource();
    },
    
    
    setProperty : function(prop, value, create){
        this.propStore.setValue(prop, value, create);    
    },
    
    
    removeProperty : function(prop){
        this.propStore.remove(prop);
    }

});
Ext.reg("propertygrid", PropertyGrid);

export default PropertyGrid;