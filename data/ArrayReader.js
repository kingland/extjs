import Ext from '../Base';
import JsonReader from './JsonReader';

var ArrayReader = Ext.extend(JsonReader, {
    readRecords : function(o){
        this.arrayData = o;
        var s = this.meta,
            sid = s ? Ext.num(s.idIndex, s.id) : null,
            recordType = this.recordType,
            fields = recordType.prototype.fields,
            records = [],
            success = true,
            v;

        var root = this.getRoot(o);

        for(var i = 0, len = root.length; i < len; i++) {
            var n = root[i],
                values = {},
                id = ((sid || sid === 0) && n[sid] !== undefined && n[sid] !== "" ? n[sid] : null);
            for(var j = 0, jlen = fields.length; j < jlen; j++) {
                var f = fields.items[j],
                    k = f.mapping !== undefined && f.mapping !== null ? f.mapping : j;
                v = n[k] !== undefined ? n[k] : f.defaultValue;
                v = f.convert(v, n);
                values[f.name] = v;
            }
            var record = new recordType(values, id);
            record.json = n;
            records[records.length] = record;
        }

        var totalRecords = records.length;

        if(s.totalProperty) {
            v = parseInt(this.getTotal(o), 10);
            if(!isNaN(v)) {
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
            records : records,
            totalRecords : totalRecords
        };
    }
});

export default ArrayReader;