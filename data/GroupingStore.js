import Ext from '../Base';
import Store from './Store';

var GroupingStore = Ext.extend(Store, {
    constructor: function(config) {
        config = config || {};
        this.hasMultiSort  = true;
        this.multiSortInfo = this.multiSortInfo || {sorters: []};

        var sorters    = this.multiSortInfo.sorters,
            groupField = config.groupField || this.groupField,
            sortInfo   = config.sortInfo || this.sortInfo,
            groupDir   = config.groupDir || this.groupDir;

        
        if(groupField){
            sorters.push({
                field    : groupField,
                direction: groupDir
            });
        }

        
        if (sortInfo) {
            sorters.push(sortInfo);
        }

        GroupingStore.superclass.constructor.call(this, config);

        this.addEvents(
          
          'groupchange'
        );

        this.applyGroupField();
    },

    
    
    remoteGroup : false,
    
    groupOnSort:false,

    groupDir : 'ASC',

    
    clearGrouping : function(){
        this.groupField = false;

        if(this.remoteGroup){
            if(this.baseParams){
                delete this.baseParams.groupBy;
                delete this.baseParams.groupDir;
            }
            var lo = this.lastOptions;
            if(lo && lo.params){
                delete lo.params.groupBy;
                delete lo.params.groupDir;
            }

            this.reload();
        }else{
            this.sort();
            this.fireEvent('datachanged', this);
        }
    },

    
    groupBy : function(field, forceRegroup, direction) {
        direction = direction ? (String(direction).toUpperCase() == 'DESC' ? 'DESC' : 'ASC') : this.groupDir;

        if (this.groupField == field && this.groupDir == direction && !forceRegroup) {
            return; 
        }

        
        
        sorters = this.multiSortInfo.sorters;
        if (sorters.length > 0 && sorters[0].field == this.groupField) {
            sorters.shift();
        }

        this.groupField = field;
        this.groupDir = direction;
        this.applyGroupField();

        var fireGroupEvent = function() {
            this.fireEvent('groupchange', this, this.getGroupState());
        };

        if (this.groupOnSort) {
            this.sort(field, direction);
            fireGroupEvent.call(this);
            return;
        }

        if (this.remoteGroup) {
            this.on('load', fireGroupEvent, this, {single: true});
            this.reload();
        } else {
            this.sort(sorters);
            fireGroupEvent.call(this);
        }
    },

    
    
    sort : function(fieldName, dir) {
        if (this.remoteSort) {
            return GroupingStore.superclass.sort.call(this, fieldName, dir);
        }

        var sorters = [];

        
        if (Ext.isArray(arguments[0])) {
            sorters = arguments[0];
        } else if (fieldName == undefined) {
            
            
            sorters = this.sortInfo ? [this.sortInfo] : [];
        } else {
            
            
            var field = this.fields.get(fieldName);
            if (!field) return false;

            var name       = field.name,
                sortInfo   = this.sortInfo || null,
                sortToggle = this.sortToggle ? this.sortToggle[name] : null;

            if (!dir) {
                if (sortInfo && sortInfo.field == name) { 
                    dir = (this.sortToggle[name] || 'ASC').toggle('ASC', 'DESC');
                } else {
                    dir = field.sortDir;
                }
            }

            this.sortToggle[name] = dir;
            this.sortInfo = {field: name, direction: dir};

            sorters = [this.sortInfo];
        }

        
        if (this.groupField) {
            sorters.unshift({direction: this.groupDir, field: this.groupField});
        }

        return this.multiSort.call(this, sorters, dir);
    },

    
    applyGroupField: function(){
        if (this.remoteGroup) {
            if(!this.baseParams){
                this.baseParams = {};
            }

            Ext.apply(this.baseParams, {
                groupBy : this.groupField,
                groupDir: this.groupDir
            });

            var lo = this.lastOptions;
            if (lo && lo.params) {
                lo.params.groupDir = this.groupDir;

                
                delete lo.params.groupBy;
            }
        }
    },

    
    applyGrouping : function(alwaysFireChange){
        if(this.groupField !== false){
            this.groupBy(this.groupField, true, this.groupDir);
            return true;
        }else{
            if(alwaysFireChange === true){
                this.fireEvent('datachanged', this);
            }
            return false;
        }
    },

    
    getGroupState : function(){
        return this.groupOnSort && this.groupField !== false ?
               (this.sortInfo ? this.sortInfo.field : undefined) : this.groupField;
    }
});
Ext.reg('groupingstore', GroupingStore);

export default GroupingStore;