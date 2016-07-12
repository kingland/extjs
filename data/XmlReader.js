import Ext from '../Base';
import DataReader from './DataReader';
import Response from './Response';
import Api from './Api';
import JsonReader from './JsonReader';

var XmlReader = function(meta, recordType){
    meta = meta || {};

    
    Ext.applyIf(meta, {
        idProperty: meta.idProperty || meta.idPath || meta.id,
        successProperty: meta.successProperty || meta.success
    });

    XmlReader.superclass.constructor.call(this, meta, recordType || meta.fields);
};

Ext.extend(XmlReader, DataReader, {
    
    read : function(response){
        var doc = response.responseXML;
        if(!doc) {
            throw {message: "XmlReader.read: XML Document not available"};
        }
        return this.readRecords(doc);
    },

    
    readRecords : function(doc){
        
        this.xmlData = doc;

        var root    = doc.documentElement || doc,
            q       = Ext.DomQuery,
            totalRecords = 0,
            success = true;

        if(this.meta.totalProperty){
            totalRecords = this.getTotal(root, 0);
        }
        if(this.meta.successProperty){
            success = this.getSuccess(root);
        }

        var records = this.extractData(q.select(this.meta.record, root), true); 

        
        return {
            success : success,
            records : records,
            totalRecords : totalRecords || records.length
        };
    },

    
    readResponse : function(action, response) {
        var q   = Ext.DomQuery,
        doc     = response.responseXML;

        
        var res = new Response({
            action: action,
            success : this.getSuccess(doc),
            message: this.getMessage(doc),
            data: this.extractData(q.select(this.meta.record, doc) || q.select(this.meta.root, doc), false),
            raw: doc
        });

        if (Ext.isEmpty(res.success)) {
            throw new DataReader.Error('successProperty-response', this.meta.successProperty);
        }

        
        if (action === Api.actions.create) {
            var def = Ext.isDefined(res.data);
            if (def && Ext.isEmpty(res.data)) {
                throw new JsonReader.Error('root-empty', this.meta.root);
            }
            else if (!def) {
                throw new JsonReader.Error('root-undefined-response', this.meta.root);
            }
        }
        return res;
    },

    getSuccess : function() {
        return true;
    },

    
    buildExtractors : function() {
        if(this.ef){
            return;
        }
        var s       = this.meta,
            Record  = this.recordType,
            f       = Record.prototype.fields,
            fi      = f.items,
            fl      = f.length;

        if(s.totalProperty) {
            this.getTotal = this.createAccessor(s.totalProperty);
        }
        if(s.successProperty) {
            this.getSuccess = this.createAccessor(s.successProperty);
        }
        if (s.messageProperty) {
            this.getMessage = this.createAccessor(s.messageProperty);
        }
        this.getRoot = function(res) {
            return (!Ext.isEmpty(res[this.meta.record])) ? res[this.meta.record] : res[this.meta.root];
        };
        if (s.idPath || s.idProperty) {
            var g = this.createAccessor(s.idPath || s.idProperty);
            this.getId = function(rec) {
                var id = g(rec) || rec.id;
                return (id === undefined || id === '') ? null : id;
            };
        } else {
            this.getId = function(){return null;};
        }
        var ef = [];
        for(var i = 0; i < fl; i++){
            f = fi[i];
            var map = (f.mapping !== undefined && f.mapping !== null) ? f.mapping : f.name;
            ef.push(this.createAccessor(map));
        }
        this.ef = ef;
    },

    
    createAccessor : function(){
        var q = Ext.DomQuery;
        return function(key) {
            switch(key) {
                case this.meta.totalProperty:
                    return function(root, def){
                        return q.selectNumber(key, root, def);
                    };
                    break;
                case this.meta.successProperty:
                    return function(root, def) {
                        var sv = q.selectValue(key, root, true);
                        var success = sv !== false && sv !== 'false';
                        return success;
                    };
                    break;
                default:
                    return function(root, def) {
                        return q.selectValue(key, root, def);
                    };
                    break;
            }
        };
    }(),

    
    extractValues : function(data, items, len) {
        var f, values = {};
        for(var j = 0; j < len; j++){
            f = items[j];
            var v = this.ef[j](data);
            values[f.name] = f.convert((v !== undefined) ? v : f.defaultValue, data);
        }
        return values;
    },
	
	extractData : function(root, returnRecords) {
		//var rawName = (this instanceof JsonReader) ? 'json' : 'node';
		var rawName = (this instanceof XmlReader) ? 'node' : 'json';

        var rs = [];
		
		if (this.isData(root) && !(this instanceof XmlReader)) {
            root = [root];
        }
		
		var f       = this.recordType.prototype.fields,
            fi      = f.items,
            fl      = f.length,
            rs      = [];
        if (returnRecords === true) {
            var Record = this.recordType;
            for (var i = 0; i < root.length; i++) {
                var n = root[i];
                var record = new Record(this.extractValues(n, fi, fl), this.getId(n));
                record[rawName] = n;    
                rs.push(record);
            }
        }
        else {
            for (var i = 0; i < root.length; i++) {
                var data = this.extractValues(root[i], fi, fl);
                data[this.meta.idProperty] = this.getId(root[i]);
                rs.push(data);
            }
        }
        return rs;
	}
});

export default XmlReader;