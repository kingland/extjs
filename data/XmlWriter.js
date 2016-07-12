import Ext from '../Base';
import DataWriter from './DataWriter';

var XmlWriter = function(params) {
    XmlWriter.superclass.constructor.apply(this, arguments);    
    this.tpl = (typeof(this.tpl) === 'string') ? new Ext.XTemplate(this.tpl).compile() : this.tpl.compile();
};

Ext.extend(XmlWriter, DataWriter, {
    
    documentRoot: 'xrequest',
    
    forceDocumentRoot: false,
    
    root: 'records',
    
    xmlVersion : '1.0',
    
    xmlEncoding: 'ISO-8859-15',
    
    
    tpl: '<tpl for="."><\u003fxml version="{version}" encoding="{encoding}"\u003f><tpl if="documentRoot"><{documentRoot}><tpl for="baseParams"><tpl for="."><{name}>{value}</{name}</tpl></tpl></tpl><tpl if="records.length&gt;1"><{root}></tpl><tpl for="records"><{parent.record}><tpl for="."><{name}>{value}</{name}></tpl></{parent.record}></tpl><tpl if="records.length&gt;1"></{root}></tpl><tpl if="documentRoot"></{documentRoot}></tpl></tpl>',


    
    render : function(params, baseParams, data) {
        baseParams = this.toArray(baseParams);
        params.xmlData = this.tpl.applyTemplate({
            version: this.xmlVersion,
            encoding: this.xmlEncoding,
            documentRoot: (baseParams.length > 0 || this.forceDocumentRoot === true) ? this.documentRoot : false,
            record: this.meta.record,
            root: this.root,
            baseParams: baseParams,
            records: (Ext.isArray(data[0])) ? data : [data]
        });
    },

    
    createRecord : function(rec) {
        return this.toArray(this.toHash(rec));
    },

    
    updateRecord : function(rec) {
        return this.toArray(this.toHash(rec));

    },
    
    destroyRecord : function(rec) {
        var data = {};
        data[this.meta.idProperty] = rec.id;
        return this.toArray(data);
    }
});

export default XmlWriter;