import Ext from './Base';
import StoreMgr from './StoreMgr';
import ArrayStore from './data/ArrayStore';

Ext.apply(StoreMgr, {
	lookup : function(id){
        if(Ext.isArray(id)){
            var fields = ['field1'], expand = !Ext.isArray(id[0]);
            if(!expand){
                for(var i = 2, len = id[0].length; i <= len; ++i){
                    fields.push('field' + i);
                }
            }
            return new ArrayStore({
                fields: fields,
                data: id,
                expandData: expand,
                autoDestroy: true,
                autoCreated: true

            });
        }
        return Ext.isObject(id) ? (id.events ? id : Ext.create(id, 'store')) : this.get(id);
    }
});

export default StoreMgr;