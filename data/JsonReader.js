import Ext from '../Base';
import Error from '../Error';
import DataReader from './DataReader';
import Api from './Api';
import Response from './Response';


var JsonReader = function(meta, recordType){
    meta = meta || {};
    Ext.applyIf(meta, {
        idProperty: 'id',
        successProperty: 'success',
        totalProperty: 'total'
    });

    JsonReader.superclass.constructor.call(this, meta, recordType || meta.fields);
};

Ext.extend(JsonReader, DataReader, {
    
    
    read : function(response){
        var json = response.responseText;
        var o = Ext.decode(json);
        if(!o) {
            throw {message: 'JsonReader.read: Json object not found'};
        }
        return this.readRecords(o);
    },

    
    
    readResponse : function(action, response) {
        var o = (response.responseText !== undefined) ? Ext.decode(response.responseText) : response;
        if(!o) {
            throw new JsonReader.Error('response');
        }

        var root = this.getRoot(o);
        if (action === Api.actions.create) {
            var def = Ext.isDefined(root);
            if (def && Ext.isEmpty(root)) {
                throw new JsonReader.Error('root-empty', this.meta.root);
            }
            else if (!def) {
                throw new JsonReader.Error('root-undefined-response', this.meta.root);
            }
        }

        
        var res = new Response({
            action: action,
            success: this.getSuccess(o),
            data: (root) ? this.extractData(root, false) : [],
            message: this.getMessage(o),
            raw: o
        });

        
        if (Ext.isEmpty(res.success)) {
            throw new JsonReader.Error('successProperty-response', this.meta.successProperty);
        }
        return res;
    },

    
    readRecords : function(o){
        
        this.jsonData = o;
        if(o.metaData){
            this.onMetaChange(o.metaData);
        }
        var s = this.meta, Record = this.recordType,
            f = Record.prototype.fields, fi = f.items, fl = f.length, v;

        var root = this.getRoot(o), c = root.length, totalRecords = c, success = true;
        if(s.totalProperty){
            v = parseInt(this.getTotal(o), 10);
            if(!isNaN(v)){
                totalRecords = v;
            }
        }
        if(s.successProperty){
            v = this.getSuccess(o);
            if(v === false || v === 'false'){
                success = false;
            }
        }

        
        return {
            success : success,
            records : this.extractData(root, true), 
            totalRecords : totalRecords
        };
    },

    
    buildExtractors : function() {
        if(this.ef){
            return;
        }
        var s = this.meta, Record = this.recordType,
            f = Record.prototype.fields, fi = f.items, fl = f.length;

        if(s.totalProperty) {
            this.getTotal = this.createAccessor(s.totalProperty);
        }
        if(s.successProperty) {
            this.getSuccess = this.createAccessor(s.successProperty);
        }
        if (s.messageProperty) {
            this.getMessage = this.createAccessor(s.messageProperty);
        }
        this.getRoot = s.root ? this.createAccessor(s.root) : function(p){return p;};
        if (s.id || s.idProperty) {
            var g = this.createAccessor(s.id || s.idProperty);
            this.getId = function(rec) {
                var r = g(rec);
                return (r === undefined || r === '') ? null : r;
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

    
    simpleAccess : function(obj, subsc) {
        return obj[subsc];
    },

    
    createAccessor : function(){
        var re = /[\[\.]/;
        return function(expr) {
            if(Ext.isEmpty(expr)){
                return Ext.emptyFn;
            }
            if(Ext.isFunction(expr)){
                return expr;
            }
            var i = String(expr).search(re);
            if(i >= 0){
                return new Function('obj', 'return obj' + (i > 0 ? '.' : '') + expr);
            }
            return function(obj){
                return obj[expr];
            };

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
		var rawName = (this instanceof JsonReader) ? 'json' : 'node';

        var rs = [];
		
		if (this.isData(root) /*&& !(this instanceof XmlReader)*/) {
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

JsonReader.Error = Ext.extend(Error, {
    constructor : function(message, arg) {
        this.arg = arg;
        Error.call(this, message);
    },
    name : 'JsonReader'
});
Ext.apply(JsonReader.Error.prototype, {
    lang: {
        'response': 'An error occurred while json-decoding your server response',
        'successProperty-response': 'Could not locate your "successProperty" in your server response.  Please review your JsonReader config to ensure the config-property "successProperty" matches the property in your server-response.  See the JsonReader docs.',
        'root-undefined-config': 'Your JsonReader was configured without a "root" property.  Please review your JsonReader config and make sure to define the root property.  See the JsonReader docs.',
        'idProperty-undefined' : 'Your JsonReader was configured without an "idProperty"  Please review your JsonReader configuration and ensure the "idProperty" is set (e.g.: "id").  See the JsonReader docs.',
        'root-empty': 'Data was expected to be returned by the server in the "root" property of the response.  Please review your JsonReader configuration to ensure the "root" property matches that returned in the server-response.  See JsonReader docs.'
    }
});

export default JsonReader;