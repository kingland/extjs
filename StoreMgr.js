import Ext from './Base';
import MixedCollection from './util/MixedCollection';
//import ArrayStore from './data/ArrayStore';

var StoreMgr = Ext.apply(new MixedCollection(), {
    
    register : function(){
        for(var i = 0, s; (s = arguments[i]); i++){
            this.add(s);
        }
    },

    
    unregister : function(){
        for(var i = 0, s; (s = arguments[i]); i++){
            this.remove(this.lookup(s));
        }
    },

    //Move To StoreMgrFn
    /*lookup : function(id){
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
    },*/

    
    getKey : function(o){
         return o.storeId;
    }
});

export default StoreMgr;