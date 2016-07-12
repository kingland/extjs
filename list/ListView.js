import Ext from '../Base';
import DataView from '../DataView';
import ColumnResizer from './ColumnResizer';
import Sorter from './Sorter';
import XTemplate from '../XTemplate';

var ListView = Ext.extend(DataView, {
    itemSelector: 'dl',
    
    selectedClass:'x-list-selected',
    
    overClass:'x-list-over',
    
    
    scrollOffset : undefined,
    
    columnResize: true,
    
    
    columnSort: true,
    
    maxWidth: Ext.isIE ? 99 : 100,

    initComponent : function(){
        if(this.columnResize){
            this.colResizer = new ColumnResizer(this.colResizer);
            this.colResizer.init(this);
        }
        if(this.columnSort){
            this.colSorter = new Sorter(this.columnSort);
            this.colSorter.init(this);
        }
        if(!this.internalTpl){
            this.internalTpl = new XTemplate(
                '<div class="x-list-header"><div class="x-list-header-inner">',
                    '<tpl for="columns">',
                    '<div style="width:{[values.width*100]}%;text-align:{align};"><em unselectable="on" id="',this.id, '-xlhd-{#}">',
                        '{header}',
                    '</em></div>',
                    '</tpl>',
                    '<div class="x-clear"></div>',
                '</div></div>',
                '<div class="x-list-body"><div class="x-list-body-inner">',
                '</div></div>'
            );
        }
        if(!this.tpl){
            this.tpl = new XTemplate(
                '<tpl for="rows">',
                    '<dl>',
                        '<tpl for="parent.columns">',
                        '<dt style="width:{[values.width*100]}%;text-align:{align};">',
                        '<em unselectable="on"<tpl if="cls"> class="{cls}</tpl>">',
                            '{[values.tpl.apply(parent)]}',
                        '</em></dt>',
                        '</tpl>',
                        '<div class="x-clear"></div>',
                    '</dl>',
                '</tpl>'
            );
        };

        var cs = this.columns,
            allocatedWidth = 0,
            colsWithWidth = 0,
            len = cs.length,
            columns = [];

        for(var i = 0; i < len; i++){
            var c = cs[i];
            if(!c.isColumn) {
                c.xtype = c.xtype ? (/^lv/.test(c.xtype) ? c.xtype : 'lv' + c.xtype) : 'lvcolumn';
                c = Ext.create(c);
            }
            if(c.width) {
                allocatedWidth += c.width*100;
                colsWithWidth++;
            }
            columns.push(c);
        }

        cs = this.columns = columns;

        
        if(colsWithWidth < len){
            var remaining = len - colsWithWidth;
            if(allocatedWidth < this.maxWidth){
                var perCol = ((this.maxWidth-allocatedWidth) / remaining)/100;
                for(var j = 0; j < len; j++){
                    var c = cs[j];
                    if(!c.width){
                        c.width = perCol;
                    }
                }
            }
        }
        ListView.superclass.initComponent.call(this);
    },

    onRender : function(){
        this.autoEl = {
            cls: 'x-list-wrap'
        };
        ListView.superclass.onRender.apply(this, arguments);

        this.internalTpl.overwrite(this.el, {columns: this.columns});

        this.innerBody = Ext.get(this.el.dom.childNodes[1].firstChild);
        this.innerHd = Ext.get(this.el.dom.firstChild.firstChild);

        if(this.hideHeaders){
            this.el.dom.firstChild.style.display = 'none';
        }
    },

    getTemplateTarget : function(){
        return this.innerBody;
    },

    
    collectData : function(){
        var rs = ListView.superclass.collectData.apply(this, arguments);
        return {
            columns: this.columns,
            rows: rs
        }
    },

    verifyInternalSize : function(){
        if(this.lastSize){
            this.onResize(this.lastSize.width, this.lastSize.height);
        }
    },

    
    onResize : function(w, h){
        var bd = this.innerBody.dom;
        var hd = this.innerHd.dom;
        if(!bd){
            return;
        }
        var bdp = bd.parentNode;
        if(Ext.isNumber(w)){
            var sw = w - Ext.num(this.scrollOffset, Ext.getScrollBarWidth());
            if(this.reserveScrollOffset || ((bdp.offsetWidth - bdp.clientWidth) > 10)){
                bd.style.width = sw + 'px';
                hd.style.width = sw + 'px';
            }else{
                bd.style.width = w + 'px';
                hd.style.width = w + 'px';
                setTimeout(function(){
                    if((bdp.offsetWidth - bdp.clientWidth) > 10){
                        bd.style.width = sw + 'px';
                        hd.style.width = sw + 'px';
                    }
                }, 10);
            }
        }
        if(Ext.isNumber(h)){
            bdp.style.height = (h - hd.parentNode.offsetHeight) + 'px';
        }
    },

    updateIndexes : function(){
        ListView.superclass.updateIndexes.apply(this, arguments);
        this.verifyInternalSize();
    },

    findHeaderIndex : function(hd){
        hd = hd.dom || hd;
        var pn = hd.parentNode, cs = pn.parentNode.childNodes;
        for(var i = 0, c; c = cs[i]; i++){
            if(c == pn){
                return i;
            }
        }
        return -1;
    },

    setHdWidths : function(){
        var els = this.innerHd.dom.getElementsByTagName('div');
        for(var i = 0, cs = this.columns, len = cs.length; i < len; i++){
            els[i].style.width = (cs[i].width*100) + '%';
        }
    }
});

Ext.reg('listview', ListView);

export default ListView;