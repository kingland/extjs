import Ext from '../Base';
import HttpProxy from './HttpProxy';
import DataWriter from './DataWriter';
import Api from './Api';
import JsonWriter from './JsonWriter';
import XmlWriter from './XmlWriter';
import Record from './Record';
import Observable from '../util/Observable';
import MixedCollection from '../util/MixedCollection';
import StoreMgr from '../StoreMgr';
import Error from '../Error';
import Format from '../util/Format';

var Store = Ext.extend( Observable, {
    writer : undefined,
    
    remoteSort : false,

    
    autoDestroy : false,

    
    pruneModifiedRecords : false,

    
    lastOptions : null,

    
    autoSave : true,

    
    batch : true,

    
    restful: false,

    
    paramNames : undefined,

    
    defaultParamNames : {
        start : 'start',
        limit : 'limit',
        sort : 'sort',
        dir : 'dir'
    },

    
    isDestroyed: false,

    
    hasMultiSort: false,

    
    batchKey : '_ext_batch_',

    constructor : function(config){
        this.data = new MixedCollection(false);
        this.data.getKey = function(o){
            return o.id;
        };


        
        this.removed = [];

        if(config && config.data){
            this.inlineData = config.data;
            delete config.data;
        }

        Ext.apply(this, config);

        
        this.baseParams = Ext.isObject(this.baseParams) ? this.baseParams : {};

        this.paramNames = Ext.applyIf(this.paramNames || {}, this.defaultParamNames);

        if((this.url || this.api) && !this.proxy){
            this.proxy = new HttpProxy({url: this.url, api: this.api});
        }
        
        if (this.restful === true && this.proxy) {
            
            
            this.batch = false;
            Api.restify(this.proxy);
        }

        if(this.reader){ 
            if(!this.recordType){
                this.recordType = this.reader.recordType;
            }
            if(this.reader.onMetaChange){
                this.reader.onMetaChange = this.reader.onMetaChange.createSequence(this.onMetaChange, this);
            }
            if (this.writer) { 
                if (this.writer instanceof(DataWriter) === false) {    
                    this.writer = this.buildWriter(this.writer);
                }
                this.writer.meta = this.reader.meta;
                this.pruneModifiedRecords = true;
            }
        }

        

        if(this.recordType){
            
            this.fields = this.recordType.prototype.fields;
        }
        this.modified = [];

        this.addEvents(
            
            'datachanged',
            
            'metachange',
            
            'add',
            
            'remove',
            
            'update',
            
            'clear',
            
            'exception',
            
            'beforeload',
            
            'load',
            
            'loadexception',
            
            'beforewrite',
            
            'write',
            
            'beforesave',
            
            'save'

        );

        if(this.proxy){
            
            this.relayEvents(this.proxy,  ['loadexception', 'exception']);
        }
        
        if (this.writer) {
            this.on({
                scope: this,
                add: this.createRecords,
                remove: this.destroyRecord,
                update: this.updateRecord,
                clear: this.onClear
            });
        }

        this.sortToggle = {};
        if(this.sortField){
            this.setDefaultSort(this.sortField, this.sortDir);
        }else if(this.sortInfo){
            this.setDefaultSort(this.sortInfo.field, this.sortInfo.direction);
        }

        Store.superclass.constructor.call(this);

        if(this.id){
            this.storeId = this.id;
            delete this.id;
        }
        if(this.storeId){
            StoreMgr.register(this);
        }
        if(this.inlineData){
            this.loadData(this.inlineData);
            delete this.inlineData;
        }else if(this.autoLoad){
            this.load.defer(10, this, [
                typeof this.autoLoad == 'object' ?
                    this.autoLoad : undefined]);
        }
        
        this.batchCounter = 0;
        this.batches = {};
    },

    
    buildWriter : function(config) {
        var klass = undefined,
            type = (config.format || 'json').toLowerCase();
        switch (type) {
            case 'json':
                klass = JsonWriter;
                break;
            case 'xml':
                klass = XmlWriter;
                break;
            default:
                klass = JsonWriter;
        }
        return new klass(config);
    },

    
    destroy : function(){
        if(!this.isDestroyed){
            if(this.storeId){
                StoreMgr.unregister(this);
            }
            this.clearData();
            this.data = null;
            Ext.destroy(this.proxy);
            this.reader = this.writer = null;
            this.purgeListeners();
            this.isDestroyed = true;
        }
    },

    
    add : function(records){
        records = [].concat(records);
        if(records.length < 1){
            return;
        }
        for(var i = 0, len = records.length; i < len; i++){
            records[i].join(this);
        }
        var index = this.data.length;
        this.data.addAll(records);
        if(this.snapshot){
            this.snapshot.addAll(records);
        }
        this.fireEvent('add', this, records, index);
    },

    
    addSorted : function(record){
        var index = this.findInsertIndex(record);
        this.insert(index, record);
    },

    
    remove : function(record){
        if(Ext.isArray(record)){
            Ext.each(record, function(r){
                this.remove(r);
            }, this);
            return;
        }
        var index = this.data.indexOf(record);
        if(index > -1){
            record.join(null);
            this.data.removeAt(index);
        }
        if(this.pruneModifiedRecords){
            this.modified.remove(record);
        }
        if(this.snapshot){
            this.snapshot.remove(record);
        }
        if(index > -1){
            this.fireEvent('remove', this, record, index);
        }
    },

    
    removeAt : function(index){
        this.remove(this.getAt(index));
    },

    
    removeAll : function(silent){
        var items = [];
        this.each(function(rec){
            items.push(rec);
        });
        this.clearData();
        if(this.snapshot){
            this.snapshot.clear();
        }
        if(this.pruneModifiedRecords){
            this.modified = [];
        }
        if (silent !== true) {  
            this.fireEvent('clear', this, items);
        }
    },

    
    onClear: function(store, records){
        Ext.each(records, function(rec, index){
            this.destroyRecord(this, rec, index);
        }, this);
    },

    
    insert : function(index, records){
        records = [].concat(records);
        for(var i = 0, len = records.length; i < len; i++){
            this.data.insert(index, records[i]);
            records[i].join(this);
        }
        if(this.snapshot){
            this.snapshot.addAll(records);
        }
        this.fireEvent('add', this, records, index);
    },

    
    indexOf : function(record){
        return this.data.indexOf(record);
    },

    
    indexOfId : function(id){
        return this.data.indexOfKey(id);
    },

    
    getById : function(id){
        return (this.snapshot || this.data).key(id);
    },

    
    getAt : function(index){
        return this.data.itemAt(index);
    },

    
    getRange : function(start, end){
        return this.data.getRange(start, end);
    },

    
    storeOptions : function(o){
        o = Ext.apply({}, o);
        delete o.callback;
        delete o.scope;
        this.lastOptions = o;
    },

    
    clearData: function(){
        this.data.each(function(rec) {
            rec.join(null);
        });
        this.data.clear();
    },

    
    load : function(options) {
        options = Ext.apply({}, options);
        this.storeOptions(options);
        if(this.sortInfo && this.remoteSort){
            var pn = this.paramNames;
            options.params = Ext.apply({}, options.params);
            options.params[pn.sort] = this.sortInfo.field;
            options.params[pn.dir] = this.sortInfo.direction;
        }
        try {
            return this.execute('read', null, options); 
        } catch(e) {
            this.handleException(e);
            return false;
        }
    },

    
    updateRecord : function(store, record, action) {
        if (action == Record.EDIT && this.autoSave === true && (!record.phantom || (record.phantom && record.isValid()))) {
            this.save();
        }
    },

    
    createRecords : function(store, rs, index) {
        for (var i = 0, len = rs.length; i < len; i++) {
            if (rs[i].phantom && rs[i].isValid()) {
                rs[i].markDirty();  
                this.modified.push(rs[i]);  
            }
        }
        if (this.autoSave === true) {
            this.save();
        }
    },

    
    destroyRecord : function(store, record, index) {
        if (this.modified.indexOf(record) != -1) {  
            this.modified.remove(record);
        }
        if (!record.phantom) {
            this.removed.push(record);

            
            
            
            record.lastIndex = index;

            if (this.autoSave === true) {
                this.save();
            }
        }
    },

    
    execute : function(action, rs, options,  batch) {
        
        if (!Api.isAction(action)) {
            throw new Api.Error('execute', action);
        }
        
        options = Ext.applyIf(options||{}, {
            params: {}
        });
        if(batch !== undefined){
            this.addToBatch(batch);
        }
        
        
        var doRequest = true;

        if (action === 'read') {
            doRequest = this.fireEvent('beforeload', this, options);
            Ext.applyIf(options.params, this.baseParams);
        }
        else {
            
            
            if (this.writer.listful === true && this.restful !== true) {
                rs = (Ext.isArray(rs)) ? rs : [rs];
            }
            
            else if (Ext.isArray(rs) && rs.length == 1) {
                rs = rs.shift();
            }
            
            if ((doRequest = this.fireEvent('beforewrite', this, action, rs, options)) !== false) {
                this.writer.apply(options.params, this.baseParams, action, rs);
            }
        }
        if (doRequest !== false) {
            
            if (this.writer && this.proxy.url && !this.proxy.restful && !Api.hasUniqueUrl(this.proxy, action)) {
                options.params.xaction = action;    
            }
            
            
            
            
            
            this.proxy.request(Api.actions[action], rs, options.params, this.reader, this.createCallback(action, rs, batch), this, options);
        }
        return doRequest;
    },

    
    save : function() {
        if (!this.writer) {
            throw new Store.Error('writer-undefined');
        }

        var queue = [],
            len,
            trans,
            batch,
            data = {};
        
        if(this.removed.length){
            queue.push(['destroy', this.removed]);
        }

        
        var rs = [].concat(this.getModifiedRecords());
        if(rs.length){
            
            var phantoms = [];
            for(var i = rs.length-1; i >= 0; i--){
                if(rs[i].phantom === true){
                    var rec = rs.splice(i, 1).shift();
                    if(rec.isValid()){
                        phantoms.push(rec);
                    }
                }else if(!rs[i].isValid()){ 
                    rs.splice(i,1);
                }
            }
            
            if(phantoms.length){
                queue.push(['create', phantoms]);
            }

            
            if(rs.length){
                queue.push(['update', rs]);
            }
        }
        len = queue.length;
        if(len){
            batch = ++this.batchCounter;
            for(var i = 0; i < len; ++i){
                trans = queue[i];
                data[trans[0]] = trans[1];
            }
            if(this.fireEvent('beforesave', this, data) !== false){
                for(var i = 0; i < len; ++i){
                    trans = queue[i];
                    this.doTransaction(trans[0], trans[1], batch);
                }
                return batch;
            }
        }
        return -1;
    },

    
    doTransaction : function(action, rs, batch) {
        function transaction(records) {
            try{
                this.execute(action, records, undefined, batch);
            }catch (e){
                this.handleException(e);
            }
        }
        if(this.batch === false){
            for(var i = 0, len = rs.length; i < len; i++){
                transaction.call(this, rs[i]);
            }
        }else{
            transaction.call(this, rs);
        }
    },

    
    addToBatch : function(batch){
        var b = this.batches,
            key = this.batchKey + batch,
            o = b[key];

        if(!o){
            b[key] = o = {
                id: batch,
                count: 0,
                data: {}
            };
        }
        ++o.count;
    },

    removeFromBatch : function(batch, action, data){
        var b = this.batches,
            key = this.batchKey + batch,
            o = b[key],
            data,
            arr;


        if(o){
            arr = o.data[action] || [];
            o.data[action] = arr.concat(data);
            if(o.count === 1){
                data = o.data;
                delete b[key];
                this.fireEvent('save', this, batch, data);
            }else{
                --o.count;
            }
        }
    },

    
    
    createCallback : function(action, rs, batch) {
        var actions = Api.actions;
        return (action == 'read') ? this.loadRecords : function(data, response, success) {
            
            this['on' + Format.capitalize(action) + 'Records'](success, rs, [].concat(data));
            
            if (success === true) {
                this.fireEvent('write', this, action, data, response, rs);
            }
            this.removeFromBatch(batch, action, data);
        };
    },

    
    
    
    clearModified : function(rs) {
        if (Ext.isArray(rs)) {
            for (var n=rs.length-1;n>=0;n--) {
                this.modified.splice(this.modified.indexOf(rs[n]), 1);
            }
        } else {
            this.modified.splice(this.modified.indexOf(rs), 1);
        }
    },

    
    reMap : function(record) {
        if (Ext.isArray(record)) {
            for (var i = 0, len = record.length; i < len; i++) {
                this.reMap(record[i]);
            }
        } else {
            delete this.data.map[record._phid];
            this.data.map[record.id] = record;
            var index = this.data.keys.indexOf(record._phid);
            this.data.keys.splice(index, 1, record.id);
            delete record._phid;
        }
    },

    
    onCreateRecords : function(success, rs, data) {
        if (success === true) {
            try {
                this.reader.realize(rs, data);
                this.reMap(rs);
            }
            catch (e) {
                this.handleException(e);
                if (Ext.isArray(rs)) {
                    
                    this.onCreateRecords(success, rs, data);
                }
            }
        }
    },

    
    onUpdateRecords : function(success, rs, data) {
        if (success === true) {
            try {
                this.reader.update(rs, data);
            } catch (e) {
                this.handleException(e);
                if (Ext.isArray(rs)) {
                    
                    this.onUpdateRecords(success, rs, data);
                }
            }
        }
    },

    
    onDestroyRecords : function(success, rs, data) {
        
        rs = (rs instanceof Record) ? [rs] : [].concat(rs);
        for (var i=0,len=rs.length;i<len;i++) {
            this.removed.splice(this.removed.indexOf(rs[i]), 1);
        }
        if (success === false) {
            
            
            for (i=rs.length-1;i>=0;i--) {
                this.insert(rs[i].lastIndex, rs[i]);    
            }
        }
    },

    
    handleException : function(e) {
        
        Ext.handleError(e);
    },

    
    reload : function(options){
        this.load(Ext.applyIf(options||{}, this.lastOptions));
    },

    
    
    loadRecords : function(o, options, success){
        if (this.isDestroyed === true) {
            return;
        }
        if(!o || success === false){
            if(success !== false){
                this.fireEvent('load', this, [], options);
            }
            if(options.callback){
                options.callback.call(options.scope || this, [], options, false, o);
            }
            return;
        }
        var r = o.records, t = o.totalRecords || r.length;
        if(!options || options.add !== true){
            if(this.pruneModifiedRecords){
                this.modified = [];
            }
            for(var i = 0, len = r.length; i < len; i++){
                r[i].join(this);
            }
            if(this.snapshot){
                this.data = this.snapshot;
                delete this.snapshot;
            }
            this.clearData();
            this.data.addAll(r);
            this.totalLength = t;
            this.applySort();
            this.fireEvent('datachanged', this);
        }else{
            this.totalLength = Math.max(t, this.data.length+r.length);
            this.add(r);
        }
        this.fireEvent('load', this, r, options);
        if(options.callback){
            options.callback.call(options.scope || this, r, options, true);
        }
    },

    
    loadData : function(o, append){
        var r = this.reader.readRecords(o);
        this.loadRecords(r, {add: append}, true);
    },

    
    getCount : function(){
        return this.data.length || 0;
    },

    
    getTotalCount : function(){
        return this.totalLength || 0;
    },

    
    getSortState : function(){
        return this.sortInfo;
    },

    
    applySort : function(){
        if ((this.sortInfo || this.multiSortInfo) && !this.remoteSort) {
            this.sortData();
        }
    },

    
    sortData : function() {
        var sortInfo  = this.hasMultiSort ? this.multiSortInfo : this.sortInfo,
            direction = sortInfo.direction || "ASC",
            sorters   = sortInfo.sorters,
            sortFns   = [];

        
        if (!this.hasMultiSort) {
            sorters = [{direction: direction, field: sortInfo.field}];
        }

        
        for (var i=0, j = sorters.length; i < j; i++) {
            sortFns.push(this.createSortFunction(sorters[i].field, sorters[i].direction));
        }
        
        if (sortFns.length == 0) {
            return;
        }

        
        
        var directionModifier = direction.toUpperCase() == "DESC" ? -1 : 1;

        
        var fn = function(r1, r2) {
          var result = sortFns[0].call(this, r1, r2);

          
          if (sortFns.length > 1) {
              for (var i=1, j = sortFns.length; i < j; i++) {
                  result = result || sortFns[i].call(this, r1, r2);
              }
          }

          return directionModifier * result;
        };

        
        this.data.sort(direction, fn);
        if (this.snapshot && this.snapshot != this.data) {
            this.snapshot.sort(direction, fn);
        }
    },

    
    createSortFunction: function(field, direction) {
        direction = direction || "ASC";
        var directionModifier = direction.toUpperCase() == "DESC" ? -1 : 1;

        var sortType = this.fields.get(field).sortType;

        
        
        return function(r1, r2) {
            var v1 = sortType(r1.data[field]),
                v2 = sortType(r2.data[field]);

            return directionModifier * (v1 > v2 ? 1 : (v1 < v2 ? -1 : 0));
        };
    },

    
    setDefaultSort : function(field, dir) {
        dir = dir ? dir.toUpperCase() : 'ASC';
        this.sortInfo = {field: field, direction: dir};
        this.sortToggle[field] = dir;
    },

    
    sort : function(fieldName, dir) {
        if (Ext.isArray(arguments[0])) {
            return this.multiSort.call(this, fieldName, dir);
        } else {
            return this.singleSort(fieldName, dir);
        }
    },

    
    singleSort: function(fieldName, dir) {
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
        this.hasMultiSort = false;

        if (this.remoteSort) {
            if (!this.load(this.lastOptions)) {
                if (sortToggle) {
                    this.sortToggle[name] = sortToggle;
                }
                if (sortInfo) {
                    this.sortInfo = sortInfo;
                }
            }
        } else {
            this.applySort();
            this.fireEvent('datachanged', this);
        }
    },

    
    multiSort: function(sorters, direction) {
        this.hasMultiSort = true;
        direction = direction || "ASC";

        
        if (this.multiSortInfo && direction == this.multiSortInfo.direction) {
            direction = direction.toggle("ASC", "DESC");
        }

        
        this.multiSortInfo = {
            sorters  : sorters,
            direction: direction
        };
        
        if (this.remoteSort) {
            this.singleSort(sorters[0].field, sorters[0].direction);

        } else {
            this.applySort();
            this.fireEvent('datachanged', this);
        }
    },

    
    each : function(fn, scope){
        this.data.each(fn, scope);
    },

    
    getModifiedRecords : function(){
        return this.modified;
    },

    
    sum : function(property, start, end){
        var rs = this.data.items, v = 0;
        start = start || 0;
        end = (end || end === 0) ? end : rs.length-1;

        for(var i = start; i <= end; i++){
            v += (rs[i].data[property] || 0);
        }
        return v;
    },

    
    createFilterFn : function(property, value, anyMatch, caseSensitive, exactMatch){
        if(Ext.isEmpty(value, false)){
            return false;
        }
        value = this.data.createValueMatcher(value, anyMatch, caseSensitive, exactMatch);
        return function(r) {
            return value.test(r.data[property]);
        };
    },

    
    createMultipleFilterFn: function(filters) {
        return function(record) {
            var isMatch = true;

            for (var i=0, j = filters.length; i < j; i++) {
                var filter = filters[i],
                    fn     = filter.fn,
                    scope  = filter.scope;

                isMatch = isMatch && fn.call(scope, record);
            }

            return isMatch;
        };
    },

    
    filter : function(property, value, anyMatch, caseSensitive, exactMatch){
        
        if (Ext.isObject(property)) {
            property = [property];
        }

        if (Ext.isArray(property)) {
            var filters = [];

            
            for (var i=0, j = property.length; i < j; i++) {
                var filter = property[i],
                    func   = filter.fn,
                    scope  = filter.scope || this;

                
                if (!Ext.isFunction(func)) {
                    func = this.createFilterFn(filter.property, filter.value, filter.anyMatch, filter.caseSensitive, filter.exactMatch);
                }

                filters.push({fn: func, scope: scope});
            }

            var fn = this.createMultipleFilterFn(filters);
        } else {
            
            var fn = this.createFilterFn(property, value, anyMatch, caseSensitive, exactMatch);
        }

        return fn ? this.filterBy(fn) : this.clearFilter();
    },

    
    filterBy : function(fn, scope){
        this.snapshot = this.snapshot || this.data;
        this.data = this.queryBy(fn, scope||this);
        this.fireEvent('datachanged', this);
    },

    
    clearFilter : function(suppressEvent){
        if(this.isFiltered()){
            this.data = this.snapshot;
            delete this.snapshot;
            if(suppressEvent !== true){
                this.fireEvent('datachanged', this);
            }
        }
    },

    
    isFiltered : function(){
        return !!this.snapshot && this.snapshot != this.data;
    },

    
    query : function(property, value, anyMatch, caseSensitive){
        var fn = this.createFilterFn(property, value, anyMatch, caseSensitive);
        return fn ? this.queryBy(fn) : this.data.clone();
    },

    
    queryBy : function(fn, scope){
        var data = this.snapshot || this.data;
        return data.filterBy(fn, scope||this);
    },

    
    find : function(property, value, start, anyMatch, caseSensitive){
        var fn = this.createFilterFn(property, value, anyMatch, caseSensitive);
        return fn ? this.data.findIndexBy(fn, null, start) : -1;
    },

    
    findExact: function(property, value, start){
        return this.data.findIndexBy(function(rec){
            return rec.get(property) === value;
        }, this, start);
    },

    
    findBy : function(fn, scope, start){
        return this.data.findIndexBy(fn, scope, start);
    },

    
    collect : function(dataIndex, allowNull, bypassFilter){
        var d = (bypassFilter === true && this.snapshot) ?
                this.snapshot.items : this.data.items;
        var v, sv, r = [], l = {};
        for(var i = 0, len = d.length; i < len; i++){
            v = d[i].data[dataIndex];
            sv = String(v);
            if((allowNull || !Ext.isEmpty(v)) && !l[sv]){
                l[sv] = true;
                r[r.length] = v;
            }
        }
        return r;
    },

    
    afterEdit : function(record){
        if(this.modified.indexOf(record) == -1){
            this.modified.push(record);
        }
        this.fireEvent('update', this, record, Record.EDIT);
    },

    
    afterReject : function(record){
        this.modified.remove(record);
        this.fireEvent('update', this, record, Record.REJECT);
    },

    
    afterCommit : function(record){
        this.modified.remove(record);
        this.fireEvent('update', this, record, Record.COMMIT);
    },

    
    commitChanges : function(){
        var m = this.modified.slice(0);
        this.modified = [];
        for(var i = 0, len = m.length; i < len; i++){
            m[i].commit();
        }
    },

    
    rejectChanges : function(){
        var m = this.modified.slice(0);
        this.modified = [];
        for(var i = 0, len = m.length; i < len; i++){
            m[i].reject();
        }
        var m = this.removed.slice(0).reverse();
        this.removed = [];
        for(var i = 0, len = m.length; i < len; i++){
            this.insert(m[i].lastIndex||0, m[i]);
            m[i].reject();
        }
    },

    
    onMetaChange : function(meta){
        this.recordType = this.reader.recordType;
        this.fields = this.recordType.prototype.fields;
        delete this.snapshot;
        if(this.reader.meta.sortInfo){
            this.sortInfo = this.reader.meta.sortInfo;
        }else if(this.sortInfo  && !this.fields.get(this.sortInfo.field)){
            delete this.sortInfo;
        }
        if(this.writer){
            this.writer.meta = this.reader.meta;
        }
        this.modified = [];
        this.fireEvent('metachange', this, this.reader.meta);
    },

    
    findInsertIndex : function(record){
        this.suspendEvents();
        var data = this.data.clone();
        this.data.add(record);
        this.applySort();
        var index = this.data.indexOf(record);
        this.data = data;
        this.resumeEvents();
        return index;
    },

    
    setBaseParam : function (name, value){
        this.baseParams = this.baseParams || {};
        this.baseParams[name] = value;
    }
});

Ext.reg('store', Store);


Store.Error = Ext.extend(Error, {
    name: 'Store'
});
Ext.apply(Store.Error.prototype, {
    lang: {
        'writer-undefined' : 'Attempted to execute a write-action without a DataWriter installed.'
    }
});

export default Store;