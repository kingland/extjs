import Ext from '../Base';
import Observable from '../util/Observable';
import HeaderDropZone from './HeaderDropZone';
import HeaderDragZone from './HeaderDragZone';
import GridDragZone from './GridDragZone';
import Template from '../Template';
import Element from '../Element';
import DomHelper from '../DomHelper';
import EventManager from '../EventManager';
import DelayedTask from '../util/DelayedTask';
import Menu from '../menu/Menu';
import MenuMgr from '../menu/MenuMgr';
import CheckItem from '../menu/CheckItem';
import DDM from '../dd/DragDropMgr';
import DDProxy from '../dd/DDProxy';

var GridView = Ext.extend( Observable, {
    
    deferEmptyText : true,

    
    scrollOffset : undefined,

    
    autoFill : false,

    
    forceFit : false,

    
    sortClasses : ['sort-asc', 'sort-desc'],

    
    sortAscText : 'Sort Ascending',

    
    sortDescText : 'Sort Descending',

    
    columnsText : 'Columns',

    
    selectedRowClass : 'x-grid3-row-selected',

    
    borderWidth : 2,
    tdClass : 'x-grid3-cell',
    hdCls : 'x-grid3-hd',
    markDirty : true,

    
    cellSelectorDepth : 4,
    
    rowSelectorDepth : 10,

    
    rowBodySelectorDepth : 10,

    
    cellSelector : 'td.x-grid3-cell',
    
    rowSelector : 'div.x-grid3-row',

    
    rowBodySelector : 'div.x-grid3-row-body',

    
    firstRowCls: 'x-grid3-row-first',
    lastRowCls: 'x-grid3-row-last',
    rowClsRe: /(?:^|\s+)x-grid3-row-(first|last|alt)(?:\s+|$)/g,

    constructor : function(config){
        Ext.apply(this, config);
        
        this.addEvents(
            
            'beforerowremoved',
            
            'beforerowsinserted',
            
            'beforerefresh',
            
            'rowremoved',
            
            'rowsinserted',
            
            'rowupdated',
            
            'refresh'
        );
        GridView.superclass.constructor.call(this);
    },

    

    
    initTemplates : function(){
        var ts = this.templates || {};
        if(!ts.master){
            ts.master = new Template(
                '<div class="x-grid3" hidefocus="true">',
                    '<div class="x-grid3-viewport">',
                        '<div class="x-grid3-header"><div class="x-grid3-header-inner"><div class="x-grid3-header-offset" style="{ostyle}">{header}</div></div><div class="x-clear"></div></div>',
                        '<div class="x-grid3-scroller"><div class="x-grid3-body" style="{bstyle}">{body}</div><a href="#" class="x-grid3-focus" tabIndex="-1"></a></div>',
                    '</div>',
                    '<div class="x-grid3-resize-marker">&#160;</div>',
                    '<div class="x-grid3-resize-proxy">&#160;</div>',
                '</div>'
            );
        }

        if(!ts.header){
            ts.header = new Template(
                '<table border="0" cellspacing="0" cellpadding="0" style="{tstyle}">',
                '<thead><tr class="x-grid3-hd-row">{cells}</tr></thead>',
                '</table>'
            );
        }

        if(!ts.hcell){
            ts.hcell = new Template(
                '<td class="x-grid3-hd x-grid3-cell x-grid3-td-{id} {css}" style="{style}"><div {tooltip} {attr} class="x-grid3-hd-inner x-grid3-hd-{id}" unselectable="on" style="{istyle}">', this.grid.enableHdMenu ? '<a class="x-grid3-hd-btn" href="#"></a>' : '',
                '{value}<img class="x-grid3-sort-icon" src="', Ext.BLANK_IMAGE_URL, '" />',
                '</div></td>'
            );
        }

        if(!ts.body){
            ts.body = new Template('{rows}');
        }

        if(!ts.row){
            ts.row = new Template(
                '<div class="x-grid3-row {alt}" style="{tstyle}"><table class="x-grid3-row-table" border="0" cellspacing="0" cellpadding="0" style="{tstyle}">',
                '<tbody><tr>{cells}</tr>',
                (this.enableRowBody ? '<tr class="x-grid3-row-body-tr" style="{bodyStyle}"><td colspan="{cols}" class="x-grid3-body-cell" tabIndex="0" hidefocus="on"><div class="x-grid3-row-body">{body}</div></td></tr>' : ''),
                '</tbody></table></div>'
            );
        }

        if(!ts.cell){
            ts.cell = new Template(
                    '<td class="x-grid3-col x-grid3-cell x-grid3-td-{id} {css}" style="{style}" tabIndex="0" {cellAttr}>',
                    '<div class="x-grid3-cell-inner x-grid3-col-{id}" unselectable="on" {attr}>{value}</div>',
                    '</td>'
                    );
        }

        for(var k in ts){
            var t = ts[k];
            if(t && Ext.isFunction(t.compile) && !t.compiled){
                t.disableFormats = true;
                t.compile();
            }
        }

        this.templates = ts;
        this.colRe = new RegExp('x-grid3-td-([^\\s]+)', '');
    },

    
    fly : function(el){
        if(!this._flyweight){
            this._flyweight = new Element.Flyweight(document.body);
        }
        this._flyweight.dom = el;
        return this._flyweight;
    },

    
    getEditorParent : function(){
        return this.scroller.dom;
    },

    
    initElements : function(){
        var E = Element;

        var el = this.grid.getGridEl().dom.firstChild;
        var cs = el.childNodes;

        this.el = new E(el);

        this.mainWrap = new E(cs[0]);
        this.mainHd = new E(this.mainWrap.dom.firstChild);

        if(this.grid.hideHeaders){
            this.mainHd.setDisplayed(false);
        }

        this.innerHd = this.mainHd.dom.firstChild;
        this.scroller = new E(this.mainWrap.dom.childNodes[1]);
        if(this.forceFit){
            this.scroller.setStyle('overflow-x', 'hidden');
        }
        
        this.mainBody = new E(this.scroller.dom.firstChild);

        this.focusEl = new E(this.scroller.dom.childNodes[1]);
        this.focusEl.swallowEvent('click', true);

        this.resizeMarker = new E(cs[1]);
        this.resizeProxy = new E(cs[2]);
    },

    
    getRows : function(){
        return this.hasRows() ? this.mainBody.dom.childNodes : [];
    },

    

    
    findCell : function(el){
        if(!el){
            return false;
        }
        return this.fly(el).findParent(this.cellSelector, this.cellSelectorDepth);
    },

    
    findCellIndex : function(el, requiredCls){
        var cell = this.findCell(el);
        if(cell && (!requiredCls || this.fly(cell).hasClass(requiredCls))){
            return this.getCellIndex(cell);
        }
        return false;
    },

    
    getCellIndex : function(el){
        if(el){
            var m = el.className.match(this.colRe);
            if(m && m[1]){
                return this.cm.getIndexById(m[1]);
            }
        }
        return false;
    },

    
    findHeaderCell : function(el){
        var cell = this.findCell(el);
        return cell && this.fly(cell).hasClass(this.hdCls) ? cell : null;
    },

    
    findHeaderIndex : function(el){
        return this.findCellIndex(el, this.hdCls);
    },

    
    findRow : function(el){
        if(!el){
            return false;
        }
        return this.fly(el).findParent(this.rowSelector, this.rowSelectorDepth);
    },

    
    findRowIndex : function(el){
        var r = this.findRow(el);
        return r ? r.rowIndex : false;
    },

    
    findRowBody : function(el){
        if(!el){
            return false;
        }
        return this.fly(el).findParent(this.rowBodySelector, this.rowBodySelectorDepth);
    },

    

    
    getRow : function(row){
        return this.getRows()[row];
    },

    
    getCell : function(row, col){
        return this.getRow(row).getElementsByTagName('td')[col];
    },

    
    getHeaderCell : function(index){
        return this.mainHd.dom.getElementsByTagName('td')[index];
    },

    

    
    addRowClass : function(row, cls){
        var r = this.getRow(row);
        if(r){
            this.fly(r).addClass(cls);
        }
    },

    
    removeRowClass : function(row, cls){
        var r = this.getRow(row);
        if(r){
            this.fly(r).removeClass(cls);
        }
    },

    
    removeRow : function(row){
        Ext.removeNode(this.getRow(row));
        this.syncFocusEl(row);
    },

    
    removeRows : function(firstRow, lastRow){
        var bd = this.mainBody.dom;
        for(var rowIndex = firstRow; rowIndex <= lastRow; rowIndex++){
            Ext.removeNode(bd.childNodes[firstRow]);
        }
        this.syncFocusEl(firstRow);
    },

    

    
    getScrollState : function(){
        var sb = this.scroller.dom;
        return {left: sb.scrollLeft, top: sb.scrollTop};
    },

    
    restoreScroll : function(state){
        var sb = this.scroller.dom;
        sb.scrollLeft = state.left;
        sb.scrollTop = state.top;
    },

    
    scrollToTop : function(){
        this.scroller.dom.scrollTop = 0;
        this.scroller.dom.scrollLeft = 0;
    },

    
    syncScroll : function(){
        this.syncHeaderScroll();
        var mb = this.scroller.dom;
        this.grid.fireEvent('bodyscroll', mb.scrollLeft, mb.scrollTop);
    },

    
    syncHeaderScroll : function(){
        var mb = this.scroller.dom;
        this.innerHd.scrollLeft = mb.scrollLeft;
        this.innerHd.scrollLeft = mb.scrollLeft; 
    },

    
    updateSortIcon : function(col, dir){
        var sc = this.sortClasses;
        var hds = this.mainHd.select('td').removeClass(sc);
        hds.item(col).addClass(sc[dir == 'DESC' ? 1 : 0]);
    },

    
    updateAllColumnWidths : function(){
        var tw   = this.getTotalWidth(),
            clen = this.cm.getColumnCount(),
            ws   = [],
            len,
            i;

        for(i = 0; i < clen; i++){
            ws[i] = this.getColumnWidth(i);
        }

        this.innerHd.firstChild.style.width = this.getOffsetWidth();
        this.innerHd.firstChild.firstChild.style.width = tw;
        this.mainBody.dom.style.width = tw;

        for(i = 0; i < clen; i++){
            var hd = this.getHeaderCell(i);
            hd.style.width = ws[i];
        }

        var ns = this.getRows(), row, trow;
        for(i = 0, len = ns.length; i < len; i++){
            row = ns[i];
            row.style.width = tw;
            if(row.firstChild){
                row.firstChild.style.width = tw;
                trow = row.firstChild.rows[0];
                for (var j = 0; j < clen; j++) {
                   trow.childNodes[j].style.width = ws[j];
                }
            }
        }

        this.onAllColumnWidthsUpdated(ws, tw);
    },

    
    updateColumnWidth : function(col, width){
        var w = this.getColumnWidth(col);
        var tw = this.getTotalWidth();
        this.innerHd.firstChild.style.width = this.getOffsetWidth();
        this.innerHd.firstChild.firstChild.style.width = tw;
        this.mainBody.dom.style.width = tw;
        var hd = this.getHeaderCell(col);
        hd.style.width = w;

        var ns = this.getRows(), row;
        for(var i = 0, len = ns.length; i < len; i++){
            row = ns[i];
            row.style.width = tw;
            if(row.firstChild){
                row.firstChild.style.width = tw;
                row.firstChild.rows[0].childNodes[col].style.width = w;
            }
        }

        this.onColumnWidthUpdated(col, w, tw);
    },

    
    updateColumnHidden : function(col, hidden){
        var tw = this.getTotalWidth();
        this.innerHd.firstChild.style.width = this.getOffsetWidth();
        this.innerHd.firstChild.firstChild.style.width = tw;
        this.mainBody.dom.style.width = tw;
        var display = hidden ? 'none' : '';

        var hd = this.getHeaderCell(col);
        hd.style.display = display;

        var ns = this.getRows(), row;
        for(var i = 0, len = ns.length; i < len; i++){
            row = ns[i];
            row.style.width = tw;
            if(row.firstChild){
                row.firstChild.style.width = tw;
                row.firstChild.rows[0].childNodes[col].style.display = display;
            }
        }

        this.onColumnHiddenUpdated(col, hidden, tw);
        delete this.lastViewWidth; 
        this.layout();
    },

    
    doRender : function(columns, records, store, startRow, colCount, stripe) {
        var templates    = this.templates,
            cellTemplate = templates.cell,
            rowTemplate  = templates.row,
            last         = colCount - 1;

        var tstyle = 'width:' + this.getTotalWidth() + ';';

        
        var rowBuffer = [],
            colBuffer = [],
            rowParams = {tstyle: tstyle},
            meta      = {},
            column,
            record;

        
        for (var j = 0, len = records.length; j < len; j++) {
            record    = records[j];
            colBuffer = [];

            var rowIndex = j + startRow;

            
            for (var i = 0; i < colCount; i++) {
                column = columns[i];

                meta.id    = column.id;
                meta.css   = i === 0 ? 'x-grid3-cell-first ' : (i == last ? 'x-grid3-cell-last ' : '');
                meta.attr  = meta.cellAttr = '';
                meta.style = column.style;
                meta.value = column.renderer.call(column.scope, record.data[column.name], meta, record, rowIndex, i, store);

                if (Ext.isEmpty(meta.value)) {
                    meta.value = '&#160;';
                }

                if (this.markDirty && record.dirty && Ext.isDefined(record.modified[column.name])) {
                    meta.css += ' x-grid3-dirty-cell';
                }

                colBuffer[colBuffer.length] = cellTemplate.apply(meta);
            }

            
            var alt = [];

            if (stripe && ((rowIndex + 1) % 2 === 0)) {
                alt[0] = 'x-grid3-row-alt';
            }

            if (record.dirty) {
                alt[1] = ' x-grid3-dirty-row';
            }

            rowParams.cols = colCount;

            if (this.getRowClass) {
                alt[2] = this.getRowClass(record, rowIndex, rowParams, store);
            }

            rowParams.alt   = alt.join(' ');
            rowParams.cells = colBuffer.join('');

            rowBuffer[rowBuffer.length] = rowTemplate.apply(rowParams);
        }

        return rowBuffer.join('');
    },

    
    processRows : function(startRow, skipStripe) {
        if (!this.ds || this.ds.getCount() < 1) {
            return;
        }

        var rows = this.getRows(),
            len  = rows.length,
            i, r;

        skipStripe = skipStripe || !this.grid.stripeRows;
        startRow   = startRow   || 0;

        for (i = 0; i<len; i++) {
            r = rows[i];
            if (r) {
                r.rowIndex = i;
                if (!skipStripe) {
                    r.className = r.className.replace(this.rowClsRe, ' ');
                    if ((i + 1) % 2 === 0){
                        r.className += ' x-grid3-row-alt';
                    }
                }
            }
        }

        
        if (startRow === 0) {
            Ext.fly(rows[0]).addClass(this.firstRowCls);
        }

        Ext.fly(rows[rows.length - 1]).addClass(this.lastRowCls);
    },

    afterRender : function(){
        if(!this.ds || !this.cm){
            return;
        }
        this.mainBody.dom.innerHTML = this.renderRows() || '&#160;';
        this.processRows(0, true);

        if(this.deferEmptyText !== true){
            this.applyEmptyText();
        }
        this.grid.fireEvent('viewready', this.grid);
    },

    
    renderUI : function() {
        var templates = this.templates,
            header    = this.renderHeaders(),
            body      = templates.body.apply({rows:'&#160;'});

        var html = templates.master.apply({
            body  : body,
            header: header,
            ostyle: 'width:' + this.getOffsetWidth() + ';',
            bstyle: 'width:' + this.getTotalWidth()  + ';'
        });

        var g = this.grid;

        g.getGridEl().dom.innerHTML = html;

        this.initElements();

        
        Ext.fly(this.innerHd).on('click', this.handleHdDown, this);

        this.mainHd.on({
            scope    : this,
            mouseover: this.handleHdOver,
            mouseout : this.handleHdOut,
            mousemove: this.handleHdMove
        });

        this.scroller.on('scroll', this.syncScroll,  this);
        if (g.enableColumnResize !== false) {
            this.splitZone = new GridView.SplitDragZone(g, this.mainHd.dom);
        }

        if (g.enableColumnMove) {
            this.columnDrag = new GridView.ColumnDragZone(g, this.innerHd);
            this.columnDrop = new HeaderDropZone(g, this.mainHd.dom);
        }

        if (g.enableHdMenu !== false) {
            this.hmenu = new Menu({id: g.id + '-hctx'});
            this.hmenu.add(
                {itemId:'asc',  text: this.sortAscText,  cls: 'xg-hmenu-sort-asc'},
                {itemId:'desc', text: this.sortDescText, cls: 'xg-hmenu-sort-desc'}
            );

            if (g.enableColumnHide !== false) {
                this.colMenu = new Menu({id:g.id + '-hcols-menu'});
                this.colMenu.on({
                    scope     : this,
                    beforeshow: this.beforeColMenuShow,
                    itemclick : this.handleHdMenuClick
                });
                this.hmenu.add('-', {
                    itemId:'columns',
                    hideOnClick: false,
                    text: this.columnsText,
                    menu: this.colMenu,
                    iconCls: 'x-cols-icon'
                });
            }

            this.hmenu.on('itemclick', this.handleHdMenuClick, this);
        }

        if (g.trackMouseOver) {
            this.mainBody.on({
                scope    : this,
                mouseover: this.onRowOver,
                mouseout : this.onRowOut
            });
        }

        if (g.enableDragDrop || g.enableDrag) {
            this.dragZone = new GridDragZone(g, {
                ddGroup : g.ddGroup || 'GridDD'
            });
        }

        this.updateHeaderSortState();
    },

    
    processEvent : function(name, e) {
        var t = e.getTarget(),
            g = this.grid,
            header = this.findHeaderIndex(t);
        g.fireEvent(name, e);
        if (header !== false) {
            g.fireEvent('header' + name, g, header, e);
        } else {
            var row = this.findRowIndex(t),
                cell,
                body;
            if (row !== false) {
                g.fireEvent('row' + name, g, row, e);
                cell = this.findCellIndex(t);
                if (cell !== false) {
                    g.fireEvent('cell' + name, g, row, cell, e);
                } else {
                    body = this.findRowBody(t);
                    if (body) {
                        g.fireEvent('rowbody' + name, g, row, e);
                    }
                }
            } else {
                g.fireEvent('container' + name, g, e);
            }
        }
    },

    
    layout : function() {
        if(!this.mainBody){
            return; 
        }
        var g = this.grid;
        var c = g.getGridEl();
        var csize = c.getSize(true);
        var vw = csize.width;

        if(!g.hideHeaders && (vw < 20 || csize.height < 20)){ 
            return;
        }

        if(g.autoHeight){
            this.scroller.dom.style.overflow = 'visible';
            if(Ext.isWebKit){
                this.scroller.dom.style.position = 'static';
            }
        }else{
            this.el.setSize(csize.width, csize.height);

            var hdHeight = this.mainHd.getHeight();
            var vh = csize.height - (hdHeight);

            this.scroller.setSize(vw, vh);
            if(this.innerHd){
                this.innerHd.style.width = (vw)+'px';
            }
        }
        if(this.forceFit){
            if(this.lastViewWidth != vw){
                this.fitColumns(false, false);
                this.lastViewWidth = vw;
            }
        }else {
            this.autoExpand();
            this.syncHeaderScroll();
        }
        this.onLayout(vw, vh);
    },

    
    
    onLayout : function(vw, vh){
        
    },

    onColumnWidthUpdated : function(col, w, tw){
        
    },

    onAllColumnWidthsUpdated : function(ws, tw){
        
    },

    onColumnHiddenUpdated : function(col, hidden, tw){
        
    },

    updateColumnText : function(col, text){
        
    },

    afterMove : function(colIndex){
        
    },

    
    
    init : function(grid){
        this.grid = grid;

        this.initTemplates();
        this.initData(grid.store, grid.colModel);
        this.initUI(grid);
    },

    
    getColumnId : function(index){
      return this.cm.getColumnId(index);
    },

    
    getOffsetWidth : function() {
        return (this.cm.getTotalWidth() + this.getScrollOffset()) + 'px';
    },

    getScrollOffset: function(){
        return Ext.num(this.scrollOffset, Ext.getScrollBarWidth());
    },

    
    renderHeaders : function() {
        var cm   = this.cm,
            ts   = this.templates,
            ct   = ts.hcell,
            cb   = [],
            p    = {},
            len  = cm.getColumnCount(),
            last = len - 1;

        for (var i = 0; i < len; i++) {
            p.id = cm.getColumnId(i);
            p.value = cm.getColumnHeader(i) || '';
            p.style = this.getColumnStyle(i, true);
            p.tooltip = this.getColumnTooltip(i);
            p.css = i === 0 ? 'x-grid3-cell-first ' : (i == last ? 'x-grid3-cell-last ' : '');

            if (cm.config[i].align == 'right') {
                p.istyle = 'padding-right:16px';
            } else {
                delete p.istyle;
            }
            cb[cb.length] = ct.apply(p);
        }
        return ts.header.apply({cells: cb.join(''), tstyle:'width:'+this.getTotalWidth()+';'});
    },

    
    getColumnTooltip : function(i){
        var tt = this.cm.getColumnTooltip(i);
        if(tt){
            if(Ext.QuickTips.isEnabled()){
                return 'ext:qtip="'+tt+'"';
            }else{
                return 'title="'+tt+'"';
            }
        }
        return '';
    },

    
    beforeUpdate : function(){
        this.grid.stopEditing(true);
    },

    
    updateHeaders : function(){
        this.innerHd.firstChild.innerHTML = this.renderHeaders();
        this.innerHd.firstChild.style.width = this.getOffsetWidth();
        this.innerHd.firstChild.firstChild.style.width = this.getTotalWidth();
    },

    
    focusRow : function(row){
        this.focusCell(row, 0, false);
    },

    
    focusCell : function(row, col, hscroll){
        this.syncFocusEl(this.ensureVisible(row, col, hscroll));
        if(Ext.isGecko){
            this.focusEl.focus();
        }else{
            this.focusEl.focus.defer(1, this.focusEl);
        }
    },

    resolveCell : function(row, col, hscroll){
        if(!Ext.isNumber(row)){
            row = row.rowIndex;
        }
        if(!this.ds){
            return null;
        }
        if(row < 0 || row >= this.ds.getCount()){
            return null;
        }
        col = (col !== undefined ? col : 0);

        var rowEl = this.getRow(row),
            cm = this.cm,
            colCount = cm.getColumnCount(),
            cellEl;
        if(!(hscroll === false && col === 0)){
            while(col < colCount && cm.isHidden(col)){
                col++;
            }
            cellEl = this.getCell(row, col);
        }

        return {row: rowEl, cell: cellEl};
    },

    getResolvedXY : function(resolved){
        if(!resolved){
            return null;
        }
        var s = this.scroller.dom, c = resolved.cell, r = resolved.row;
        return c ? Ext.fly(c).getXY() : [this.el.getX(), Ext.fly(r).getY()];
    },

    syncFocusEl : function(row, col, hscroll){
        var xy = row;
        if(!Ext.isArray(xy)){
            row = Math.min(row, Math.max(0, this.getRows().length-1));
            if (isNaN(row)) {
                return;
            }
            xy = this.getResolvedXY(this.resolveCell(row, col, hscroll));
        }
        this.focusEl.setXY(xy||this.scroller.getXY());
    },

    ensureVisible : function(row, col, hscroll){
        var resolved = this.resolveCell(row, col, hscroll);
        if(!resolved || !resolved.row){
            return;
        }

        var rowEl = resolved.row,
            cellEl = resolved.cell,
            c = this.scroller.dom,
            ctop = 0,
            p = rowEl,
            stop = this.el.dom;

        while(p && p != stop){
            ctop += p.offsetTop;
            p = p.offsetParent;
        }

        ctop -= this.mainHd.dom.offsetHeight;
        stop = parseInt(c.scrollTop, 10);

        var cbot = ctop + rowEl.offsetHeight,
            ch = c.clientHeight,
            sbot = stop + ch;


        if(ctop < stop){
          c.scrollTop = ctop;
        }else if(cbot > sbot){
            c.scrollTop = cbot-ch;
        }

        if(hscroll !== false){
            var cleft = parseInt(cellEl.offsetLeft, 10);
            var cright = cleft + cellEl.offsetWidth;

            var sleft = parseInt(c.scrollLeft, 10);
            var sright = sleft + c.clientWidth;
            if(cleft < sleft){
                c.scrollLeft = cleft;
            }else if(cright > sright){
                c.scrollLeft = cright-c.clientWidth;
            }
        }
        return this.getResolvedXY(resolved);
    },

    
    insertRows : function(dm, firstRow, lastRow, isUpdate) {
        var last = dm.getCount() - 1;
        if( !isUpdate && firstRow === 0 && lastRow >= last) {
            this.fireEvent('beforerowsinserted', this, firstRow, lastRow);
                this.refresh();
            this.fireEvent('rowsinserted', this, firstRow, lastRow);
        } else {
            if (!isUpdate) {
                this.fireEvent('beforerowsinserted', this, firstRow, lastRow);
            }
            var html = this.renderRows(firstRow, lastRow),
                before = this.getRow(firstRow);
            if (before) {
                if(firstRow === 0){
                    Ext.fly(this.getRow(0)).removeClass(this.firstRowCls);
                }
                DomHelper.insertHtml('beforeBegin', before, html);
            } else {
                var r = this.getRow(last - 1);
                if(r){
                    Ext.fly(r).removeClass(this.lastRowCls);
                }
                DomHelper.insertHtml('beforeEnd', this.mainBody.dom, html);
            }
            if (!isUpdate) {
                this.fireEvent('rowsinserted', this, firstRow, lastRow);
                this.processRows(firstRow);
            } else if (firstRow === 0 || firstRow >= last) {
                
                Ext.fly(this.getRow(firstRow)).addClass(firstRow === 0 ? this.firstRowCls : this.lastRowCls);
            }
        }
        this.syncFocusEl(firstRow);
    },

    
    deleteRows : function(dm, firstRow, lastRow){
        if(dm.getRowCount()<1){
            this.refresh();
        }else{
            this.fireEvent('beforerowsdeleted', this, firstRow, lastRow);

            this.removeRows(firstRow, lastRow);

            this.processRows(firstRow);
            this.fireEvent('rowsdeleted', this, firstRow, lastRow);
        }
    },

    
    getColumnStyle : function(col, isHeader){
        var style = !isHeader ? (this.cm.config[col].css || '') : '';
        style += 'width:'+this.getColumnWidth(col)+';';
        if(this.cm.isHidden(col)){
            style += 'display:none;';
        }
        var align = this.cm.config[col].align;
        if(align){
            style += 'text-align:'+align+';';
        }
        return style;
    },

    
    getColumnWidth : function(col){
        var w = this.cm.getColumnWidth(col);
        if(Ext.isNumber(w)){
            return (Ext.isBorderBox || (Ext.isWebKit && !Ext.isSafari2) ? w : (w - this.borderWidth > 0 ? w - this.borderWidth : 0)) + 'px';
        }
        return w;
    },

    
    getTotalWidth : function(){
        return this.cm.getTotalWidth()+'px';
    },

    
    fitColumns : function(preventRefresh, onlyExpand, omitColumn){
        var cm = this.cm, i;
        var tw = cm.getTotalWidth(false);
        var aw = this.grid.getGridEl().getWidth(true)-this.getScrollOffset();

        if(aw < 20){ 
            return;
        }
        var extra = aw - tw;

        if(extra === 0){
            return false;
        }

        var vc = cm.getColumnCount(true);
        var ac = vc-(Ext.isNumber(omitColumn) ? 1 : 0);
        if(ac === 0){
            ac = 1;
            omitColumn = undefined;
        }
        var colCount = cm.getColumnCount();
        var cols = [];
        var extraCol = 0;
        var width = 0;
        var w;
        for (i = 0; i < colCount; i++){
            if(!cm.isHidden(i) && !cm.isFixed(i) && i !== omitColumn){
                w = cm.getColumnWidth(i);
                cols.push(i);
                extraCol = i;
                cols.push(w);
                width += w;
            }
        }
        var frac = (aw - cm.getTotalWidth())/width;
        while (cols.length){
            w = cols.pop();
            i = cols.pop();
            cm.setColumnWidth(i, Math.max(this.grid.minColumnWidth, Math.floor(w + w*frac)), true);
        }

        if((tw = cm.getTotalWidth(false)) > aw){
            var adjustCol = ac != vc ? omitColumn : extraCol;
             cm.setColumnWidth(adjustCol, Math.max(1,
                     cm.getColumnWidth(adjustCol)- (tw-aw)), true);
        }

        if(preventRefresh !== true){
            this.updateAllColumnWidths();
        }


        return true;
    },

    
    autoExpand : function(preventUpdate){
        var g = this.grid, cm = this.cm;
        if(!this.userResized && g.autoExpandColumn){
            var tw = cm.getTotalWidth(false);
            var aw = this.grid.getGridEl().getWidth(true)-this.getScrollOffset();
            if(tw != aw){
                var ci = cm.getIndexById(g.autoExpandColumn);
                var currentWidth = cm.getColumnWidth(ci);
                var cw = Math.min(Math.max(((aw-tw)+currentWidth), g.autoExpandMin), g.autoExpandMax);
                if(cw != currentWidth){
                    cm.setColumnWidth(ci, cw, true);
                    if(preventUpdate !== true){
                        this.updateColumnWidth(ci, cw);
                    }
                }
            }
        }
    },

    
    getColumnData : function(){
        
        var cs       = [],
            cm       = this.cm,
            colCount = cm.getColumnCount();

        for (var i = 0; i < colCount; i++) {
            var name = cm.getDataIndex(i);

            cs[i] = {
                name    : (!Ext.isDefined(name) ? this.ds.fields.get(i).name : name),
                renderer: cm.getRenderer(i),
                scope   : cm.getRendererScope(i),
                id      : cm.getColumnId(i),
                style   : this.getColumnStyle(i)
            };
        }

        return cs;
    },

    
    renderRows : function(startRow, endRow){
        
        var g = this.grid, cm = g.colModel, ds = g.store, stripe = g.stripeRows;
        var colCount = cm.getColumnCount();

        if(ds.getCount() < 1){
            return '';
        }

        var cs = this.getColumnData();

        startRow = startRow || 0;
        endRow = !Ext.isDefined(endRow) ? ds.getCount()-1 : endRow;

        
        var rs = ds.getRange(startRow, endRow);

        return this.doRender(cs, rs, ds, startRow, colCount, stripe);
    },

    
    renderBody : function(){
        var markup = this.renderRows() || '&#160;';
        return this.templates.body.apply({rows: markup});
    },

    
    refreshRow : function(record){
        var ds = this.ds, index;
        if(Ext.isNumber(record)){
            index = record;
            record = ds.getAt(index);
            if(!record){
                return;
            }
        }else{
            index = ds.indexOf(record);
            if(index < 0){
                return;
            }
        }
        this.insertRows(ds, index, index, true);
        this.getRow(index).rowIndex = index;
        this.onRemove(ds, record, index+1, true);
        this.fireEvent('rowupdated', this, index, record);
    },

    
    refresh : function(headersToo){
        this.fireEvent('beforerefresh', this);
        this.grid.stopEditing(true);

        var result = this.renderBody();
        this.mainBody.update(result).setWidth(this.getTotalWidth());
        if(headersToo === true){
            this.updateHeaders();
            this.updateHeaderSortState();
        }
        this.processRows(0, true);
        this.layout();
        this.applyEmptyText();
        this.fireEvent('refresh', this);
    },

    
    applyEmptyText : function(){
        if(this.emptyText && !this.hasRows()){
            this.mainBody.update('<div class="x-grid-empty">' + this.emptyText + '</div>');
        }
    },

    
    updateHeaderSortState : function(){
        var state = this.ds.getSortState();
        if (!state) {
            return;
        }

        if (!this.sortState || (this.sortState.field != state.field || this.sortState.direction != state.direction)) {
            this.grid.fireEvent('sortchange', this.grid, state);
        }

        this.sortState = state;

        var sortColumn = this.cm.findColumnIndex(state.field);
        if (sortColumn != -1){
            var sortDir = state.direction;
            this.updateSortIcon(sortColumn, sortDir);
        }
    },

    
    clearHeaderSortState : function(){
        if (!this.sortState) {
            return;
        }
        this.grid.fireEvent('sortchange', this.grid, null);
        this.mainHd.select('td').removeClass(this.sortClasses);
        delete this.sortState;
    },

    
    destroy : function(){
        if (this.scrollToTopTask && this.scrollToTopTask.cancel){
            this.scrollToTopTask.cancel();
        }
        if(this.colMenu){
            MenuMgr.unregister(this.colMenu);
            this.colMenu.destroy();
            delete this.colMenu;
        }
        if(this.hmenu){
            MenuMgr.unregister(this.hmenu);
            this.hmenu.destroy();
            delete this.hmenu;
        }

        this.initData(null, null);
        this.purgeListeners();
        Ext.fly(this.innerHd).un("click", this.handleHdDown, this);

        if(this.grid.enableColumnMove){
            Ext.destroy(
                this.columnDrag.el,
                this.columnDrag.proxy.ghost,
                this.columnDrag.proxy.el,
                this.columnDrop.el,
                this.columnDrop.proxyTop,
                this.columnDrop.proxyBottom,
                this.columnDrag.dragData.ddel,
                this.columnDrag.dragData.header
            );
            if (this.columnDrag.proxy.anim) {
                Ext.destroy(this.columnDrag.proxy.anim);
            }
            delete this.columnDrag.proxy.ghost;
            delete this.columnDrag.dragData.ddel;
            delete this.columnDrag.dragData.header;
            this.columnDrag.destroy();
            delete DDM.locationCache[this.columnDrag.id];
            delete this.columnDrag._domRef;

            delete this.columnDrop.proxyTop;
            delete this.columnDrop.proxyBottom;
            this.columnDrop.destroy();
            delete DDM.locationCache["gridHeader" + this.grid.getGridEl().id];
            delete this.columnDrop._domRef;
            delete DDM.ids[this.columnDrop.ddGroup];
        }

        if (this.splitZone){ 
            this.splitZone.destroy();
            delete this.splitZone._domRef;
            delete DDM.ids["gridSplitters" + this.grid.getGridEl().id];
        }

        Ext.fly(this.innerHd).removeAllListeners();
        Ext.removeNode(this.innerHd);
        delete this.innerHd;

        Ext.destroy(
            this.el,
            this.mainWrap,
            this.mainHd,
            this.scroller,
            this.mainBody,
            this.focusEl,
            this.resizeMarker,
            this.resizeProxy,
            this.activeHdBtn,
            this.dragZone,
            this.splitZone,
            this._flyweight
        );

        delete this.grid.container;

        if(this.dragZone){
            this.dragZone.destroy();
        }

        DDM.currentTarget = null;
        delete DDM.locationCache[this.grid.getGridEl().id];

        EventManager.removeResizeListener(this.onWindowResize, this);
    },

    
    onDenyColumnHide : function(){

    },

    
    render : function(){
        if(this.autoFill){
            var ct = this.grid.ownerCt;
            if (ct && ct.getLayout()){
                ct.on('afterlayout', function(){
                    this.fitColumns(true, true);
                    this.updateHeaders();
                }, this, {single: true});
            }else{
                this.fitColumns(true, true);
            }
        }else if(this.forceFit){
            this.fitColumns(true, false);
        }else if(this.grid.autoExpandColumn){
            this.autoExpand(true);
        }

        this.renderUI();
    },

    
    
    initData : function(ds, cm){
        if(this.ds){
            this.ds.un('load', this.onLoad, this);
            this.ds.un('datachanged', this.onDataChange, this);
            this.ds.un('add', this.onAdd, this);
            this.ds.un('remove', this.onRemove, this);
            this.ds.un('update', this.onUpdate, this);
            this.ds.un('clear', this.onClear, this);
            if(this.ds !== ds && this.ds.autoDestroy){
                this.ds.destroy();
            }
        }
        if(ds){
            ds.on({
                scope: this,
                load: this.onLoad,
                datachanged: this.onDataChange,
                add: this.onAdd,
                remove: this.onRemove,
                update: this.onUpdate,
                clear: this.onClear
            });
        }
        this.ds = ds;

        if(this.cm){
            this.cm.un('configchange', this.onColConfigChange, this);
            this.cm.un('widthchange', this.onColWidthChange, this);
            this.cm.un('headerchange', this.onHeaderChange, this);
            this.cm.un('hiddenchange', this.onHiddenChange, this);
            this.cm.un('columnmoved', this.onColumnMove, this);
        }
        if(cm){
            delete this.lastViewWidth;
            cm.on({
                scope: this,
                configchange: this.onColConfigChange,
                widthchange: this.onColWidthChange,
                headerchange: this.onHeaderChange,
                hiddenchange: this.onHiddenChange,
                columnmoved: this.onColumnMove
            });
        }
        this.cm = cm;
    },

    
    onDataChange : function(){
        this.refresh();
        this.updateHeaderSortState();
        this.syncFocusEl(0);
    },

    
    onClear : function(){
        this.refresh();
        this.syncFocusEl(0);
    },

    
    onUpdate : function(ds, record){
        this.refreshRow(record);
    },

    
    onAdd : function(ds, records, index){
        this.insertRows(ds, index, index + (records.length-1));
    },

    
    onRemove : function(ds, record, index, isUpdate){
        if(isUpdate !== true){
            this.fireEvent('beforerowremoved', this, index, record);
        }
        this.removeRow(index);
        if(isUpdate !== true){
            this.processRows(index);
            this.applyEmptyText();
            this.fireEvent('rowremoved', this, index, record);
        }
    },

    
    onLoad : function(){
        if (Ext.isGecko){
            if (!this.scrollToTopTask) {
                this.scrollToTopTask = new DelayedTask(this.scrollToTop, this);
            }
            this.scrollToTopTask.delay(1);
        }else{
            this.scrollToTop();
        }
    },

    
    onColWidthChange : function(cm, col, width){
        this.updateColumnWidth(col, width);
    },

    
    onHeaderChange : function(cm, col, text){
        this.updateHeaders();
    },

    
    onHiddenChange : function(cm, col, hidden){
        this.updateColumnHidden(col, hidden);
    },

    
    onColumnMove : function(cm, oldIndex, newIndex){
        this.indexMap = null;
        var s = this.getScrollState();
        this.refresh(true);
        this.restoreScroll(s);
        this.afterMove(newIndex);
        this.grid.fireEvent('columnmove', oldIndex, newIndex);
    },

    
    onColConfigChange : function(){
        delete this.lastViewWidth;
        this.indexMap = null;
        this.refresh(true);
    },

    
    
    initUI : function(grid){
        grid.on('headerclick', this.onHeaderClick, this);
    },

    
    initEvents : function(){
    },

    
    onHeaderClick : function(g, index){
        if(this.headersDisabled || !this.cm.isSortable(index)){
            return;
        }
        g.stopEditing(true);
        g.store.sort(this.cm.getDataIndex(index));
    },

    
    onRowOver : function(e, t){
        var row;
        if((row = this.findRowIndex(t)) !== false){
            this.addRowClass(row, 'x-grid3-row-over');
        }
    },

    
    onRowOut : function(e, t){
        var row;
        if((row = this.findRowIndex(t)) !== false && !e.within(this.getRow(row), true)){
            this.removeRowClass(row, 'x-grid3-row-over');
        }
    },

    
    handleWheel : function(e){
        e.stopPropagation();
    },

    
    onRowSelect : function(row){
        this.addRowClass(row, this.selectedRowClass);
    },

    
    onRowDeselect : function(row){
        this.removeRowClass(row, this.selectedRowClass);
    },

    
    onCellSelect : function(row, col){
        var cell = this.getCell(row, col);
        if(cell){
            this.fly(cell).addClass('x-grid3-cell-selected');
        }
    },

    
    onCellDeselect : function(row, col){
        var cell = this.getCell(row, col);
        if(cell){
            this.fly(cell).removeClass('x-grid3-cell-selected');
        }
    },

    
    onColumnSplitterMoved : function(i, w){
        this.userResized = true;
        var cm = this.grid.colModel;
        cm.setColumnWidth(i, w, true);

        if(this.forceFit){
            this.fitColumns(true, false, i);
            this.updateAllColumnWidths();
        }else{
            this.updateColumnWidth(i, w);
            this.syncHeaderScroll();
        }

        this.grid.fireEvent('columnresize', i, w);
    },

    
    handleHdMenuClick : function(item){
        var index = this.hdCtxIndex,
            cm = this.cm,
            ds = this.ds,
            id = item.getItemId();
        switch(id){
            case 'asc':
                ds.sort(cm.getDataIndex(index), 'ASC');
                break;
            case 'desc':
                ds.sort(cm.getDataIndex(index), 'DESC');
                break;
            default:
                index = cm.getIndexById(id.substr(4));
                if(index != -1){
                    if(item.checked && cm.getColumnsBy(this.isHideableColumn, this).length <= 1){
                        this.onDenyColumnHide();
                        return false;
                    }
                    cm.setHidden(index, item.checked);
                }
        }
        return true;
    },

    
    isHideableColumn : function(c){
        return !c.hidden;
    },

    
    beforeColMenuShow : function(){
        var cm = this.cm,  colCount = cm.getColumnCount();
        this.colMenu.removeAll();
        for(var i = 0; i < colCount; i++){
            if(cm.config[i].hideable !== false){
                this.colMenu.add(new CheckItem({
                    itemId: 'col-'+cm.getColumnId(i),
                    text: cm.getColumnHeader(i),
                    checked: !cm.isHidden(i),
                    hideOnClick:false,
                    disabled: cm.config[i].hideable === false
                }));
            }
        }
    },

    
    handleHdDown : function(e, t){
        if(Ext.fly(t).hasClass('x-grid3-hd-btn')){
            e.stopEvent();
            var hd = this.findHeaderCell(t);
            Ext.fly(hd).addClass('x-grid3-hd-menu-open');
            var index = this.getCellIndex(hd);
            this.hdCtxIndex = index;
            var ms = this.hmenu.items, cm = this.cm;
            ms.get('asc').setDisabled(!cm.isSortable(index));
            ms.get('desc').setDisabled(!cm.isSortable(index));
            this.hmenu.on('hide', function(){
                Ext.fly(hd).removeClass('x-grid3-hd-menu-open');
            }, this, {single:true});
            this.hmenu.show(t, 'tl-bl?');
        }
    },

    
    handleHdOver : function(e, t){
        var hd = this.findHeaderCell(t);
        if(hd && !this.headersDisabled){
            this.activeHdRef = t;
            this.activeHdIndex = this.getCellIndex(hd);
            var fly = this.fly(hd);
            this.activeHdRegion = fly.getRegion();
            if(!this.cm.isMenuDisabled(this.activeHdIndex)){
                fly.addClass('x-grid3-hd-over');
                this.activeHdBtn = fly.child('.x-grid3-hd-btn');
                if(this.activeHdBtn){
                    this.activeHdBtn.dom.style.height = (hd.firstChild.offsetHeight-1)+'px';
                }
            }
        }
    },

    
    handleHdMove : function(e, t){
        var hd = this.findHeaderCell(this.activeHdRef);
        if(hd && !this.headersDisabled){
            var hw = this.splitHandleWidth || 5,
                r = this.activeHdRegion,
                x = e.getPageX(),
                ss = hd.style,
                cur = '';
            if(this.grid.enableColumnResize !== false){
                if(x - r.left <= hw && this.cm.isResizable(this.activeHdIndex-1)){
                    cur = Ext.isAir ? 'move' : Ext.isWebKit ? 'e-resize' : 'col-resize'; 
                }else if(r.right - x <= (!this.activeHdBtn ? hw : 2) && this.cm.isResizable(this.activeHdIndex)){
                    cur = Ext.isAir ? 'move' : Ext.isWebKit ? 'w-resize' : 'col-resize';
                }
            }
            ss.cursor = cur;
        }
    },

    
    handleHdOut : function(e, t){
        var hd = this.findHeaderCell(t);
        if(hd && (!Ext.isIE || !e.within(hd, true))){
            this.activeHdRef = null;
            this.fly(hd).removeClass('x-grid3-hd-over');
            hd.style.cursor = '';
        }
    },

    
    hasRows : function(){
        var fc = this.mainBody.dom.firstChild;
        return fc && fc.nodeType == 1 && fc.className != 'x-grid-empty';
    },

    
    bind : function(d, c){
        this.initData(d, c);
    }
});


GridView.SplitDragZone = Ext.extend(DDProxy, {
    
    constructor: function(grid, hd){
        this.grid = grid;
        this.view = grid.getView();
        this.marker = this.view.resizeMarker;
        this.proxy = this.view.resizeProxy;
        GridView.SplitDragZone.superclass.constructor.call(this, hd,
            'gridSplitters' + this.grid.getGridEl().id, {
            dragElId : Ext.id(this.proxy.dom), resizeFrame:false
        });
        this.scroll = false;
        this.hw = this.view.splitHandleWidth || 5;
    },

    b4StartDrag : function(x, y){
        this.dragHeadersDisabled = this.view.headersDisabled;
        this.view.headersDisabled = true;
        var h = this.view.mainWrap.getHeight();
        this.marker.setHeight(h);
        this.marker.show();
        this.marker.alignTo(this.view.getHeaderCell(this.cellIndex), 'tl-tl', [-2, 0]);
        this.proxy.setHeight(h);
        var w = this.cm.getColumnWidth(this.cellIndex),
            minw = Math.max(w-this.grid.minColumnWidth, 0);
        this.resetConstraints();
        this.setXConstraint(minw, 1000);
        this.setYConstraint(0, 0);
        this.minX = x - minw;
        this.maxX = x + 1000;
        this.startPos = x;
        DDProxy.prototype.b4StartDrag.call(this, x, y);
    },

    allowHeaderDrag : function(e){
        return true;
    },

    handleMouseDown : function(e){
        var t = this.view.findHeaderCell(e.getTarget());
        if(t && this.allowHeaderDrag(e)){
            var xy = this.view.fly(t).getXY(), 
                x = xy[0], 
                y = xy[1],
                exy = e.getXY(), ex = exy[0],
                w = t.offsetWidth, adjust = false;
                
            if((ex - x) <= this.hw){
                adjust = -1;
            }else if((x+w) - ex <= this.hw){
                adjust = 0;
            }
            if(adjust !== false){
                this.cm = this.grid.colModel;
                var ci = this.view.getCellIndex(t);
                if(adjust == -1){
                  if (ci + adjust < 0) {
                    return;
                  }
                    while(this.cm.isHidden(ci+adjust)){
                        --adjust;
                        if(ci+adjust < 0){
                            return;
                        }
                    }
                }
                this.cellIndex = ci+adjust;
                this.split = t.dom;
                if(this.cm.isResizable(this.cellIndex) && !this.cm.isFixed(this.cellIndex)){
                    GridView.SplitDragZone.superclass.handleMouseDown.apply(this, arguments);
                }
            }else if(this.view.columnDrag){
                this.view.columnDrag.callHandleMouseDown(e);
            }
        }
    },

    endDrag : function(e){
        this.marker.hide();
        var v = this.view,
            endX = Math.max(this.minX, e.getPageX()),
            diff = endX - this.startPos,
            disabled = this.dragHeadersDisabled;
            
        v.onColumnSplitterMoved(this.cellIndex, this.cm.getColumnWidth(this.cellIndex)+diff);
        setTimeout(function(){
            v.headersDisabled = disabled;
        }, 50);
    },

    autoOffset : function(){
        this.setDelta(0,0);
    }
});

GridView.ColumnDragZone = Ext.extend(HeaderDragZone, {
    
    constructor : function(grid, hd){
        GridView.ColumnDragZone.superclass.constructor.call(this, grid, hd, null);
        this.proxy.el.addClass('x-grid3-col-dd');
    },
    
    handleMouseDown : function(e){
    },

    callHandleMouseDown : function(e){
        GridView.ColumnDragZone.superclass.handleMouseDown.call(this, e);
    }
});

export default GridView;