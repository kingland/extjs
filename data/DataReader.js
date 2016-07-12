import Ext from '../Base';
import Error from '../Error';
import Record from './Record';
//import JsonReader from './JsonReader';
//import XmlReader from './XmlReader';

var DataReader = function(meta, recordType){
    
    this.meta = meta;
    
    this.recordType = Ext.isArray(recordType) ?
        Record.create(recordType) : recordType;

    
    if (this.recordType){
        this.buildExtractors();
    }
};

DataReader.prototype = {
    
    
    getTotal: Ext.emptyFn,
    
    getRoot: Ext.emptyFn,
    
    getMessage: Ext.emptyFn,
    
    getSuccess: Ext.emptyFn,
    
    getId: Ext.emptyFn,
    
    buildExtractors : Ext.emptyFn,
    
    extractValues : Ext.emptyFn,

    
    realize: function(rs, data){
        if (Ext.isArray(rs)) {
            for (var i = rs.length - 1; i >= 0; i--) {
                
                if (Ext.isArray(data)) {
                    this.realize(rs.splice(i,1).shift(), data.splice(i,1).shift());
                }
                else {
                    
                    
                    this.realize(rs.splice(i,1).shift(), data);
                }
            }
        }
        else {
            
            if (Ext.isArray(data) && data.length == 1) {
                data = data.shift();
            }
            if (!this.isData(data)) {
                
                
                throw new DataReader.Error('realize', rs);
            }
            rs.phantom = false; 
            rs._phid = rs.id;  
            rs.id = this.getId(data);
            rs.data = data;

            rs.commit();
        }
    },

    
    update : function(rs, data) {
        if (Ext.isArray(rs)) {
            for (var i=rs.length-1; i >= 0; i--) {
                if (Ext.isArray(data)) {
                    this.update(rs.splice(i,1).shift(), data.splice(i,1).shift());
                }
                else {
                    
                    
                    this.update(rs.splice(i,1).shift(), data);
                }
            }
        }
        else {
            
            if (Ext.isArray(data) && data.length == 1) {
                data = data.shift();
            }
            if (this.isData(data)) {
                rs.data = Ext.apply(rs.data, data);
            }
            rs.commit();
        }
    },

    
    extractData : function(root, returnRecords) {
        //Move Code To JsonReader And XmlReader
        /*
		var rawName = (this instanceof JsonReader) ? 'json' : 'node';

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
		*/
    },

    
    isData : function(data) {
        return (data && Ext.isObject(data) && !Ext.isEmpty(this.getId(data))) ? true : false;
    },

    
    onMetaChange : function(meta){
        delete this.ef;
        this.meta = meta;
        this.recordType = Record.create(meta.fields);
        this.buildExtractors();
    }
};

DataReader.Error = Ext.extend(Error, {
    constructor : function(message, arg) {
        this.arg = arg;
        Error.call(this, message);
    },
    name: 'DataReader'
});

Ext.apply(DataReader.Error.prototype, {
    lang : {
        'update': "#update received invalid data from server.  Please see docs for DataReader#update and review your DataReader configuration.",
        'realize': "#realize was called with invalid remote-data.  Please see the docs for DataReader#realize and review your DataReader configuration.",
        'invalid-response': "#readResponse received an invalid response from the server."
    }
});

export default DataReader;