import Ext from '../Base';
import XTemplate from '../XTemplate';
import Format from '../util/Format';
import GridView from './GridView';

var GroupingView = Ext.extend(GridView, {

    
    groupByText : 'Group By This Field',
    
    showGroupsText : 'Show in Groups',
    
    hideGroupedColumn : false,
    
    showGroupName : true,
    
    startCollapsed : false,
    
    enableGrouping : true,
    
    enableGroupingMenu : true,
    
    enableNoGroups : true,
    
    emptyGroupText : '(None)',
    
    ignoreAdd : false,
    
    groupTextTpl : '{text}',

    
    groupMode: 'value',

    

    
    initTemplates : function(){
        GroupingView.superclass.initTemplates.call(this);
        this.state = {};

        var sm = this.grid.getSelectionModel();
        sm.on(sm.selectRow ? 'beforerowselect' : 'beforecellselect',
                this.onBeforeRowSelect, this);

        if(!this.startGroup){
            this.startGroup = new XTemplate(
                '<div id="{groupId}" class="x-grid-group {cls}">',
                    '<div id="{groupId}-hd" class="x-grid-group-hd" style="{style}"><div class="x-grid-group-title">', this.groupTextTpl ,'</div></div>',
                    '<div id="{groupId}-bd" class="x-grid-group-body">'
            );
        }
        this.startGroup.compile();

        if (!this.endGroup) {
            this.endGroup = '</div></div>';
        }
    },

    
    findGroup : function(el){
        return Ext.fly(el).up('.x-grid-group', this.mainBody.dom);
    },

    
    getGroups : function(){
        return this.hasRows() ? this.mainBody.dom.childNodes : [];
    },

    
    onAdd : function(ds, records, index) {
        if (this.canGroup() && !this.ignoreAdd) {
            var ss = this.getScrollState();
            this.fireEvent('beforerowsinserted', ds, index, index + (records.length-1));
            this.refresh();
            this.restoreScroll(ss);
            this.fireEvent('rowsinserted', ds, index, index + (records.length-1));
        } else if (!this.canGroup()) {
            GroupingView.superclass.onAdd.apply(this, arguments);
        }
    },

    
    onRemove : function(ds, record, index, isUpdate){
        GroupingView.superclass.onRemove.apply(this, arguments);
        var g = document.getElementById(record._groupId);
        if(g && g.childNodes[1].childNodes.length < 1){
            Ext.removeNode(g);
        }
        this.applyEmptyText();
    },

    
    refreshRow : function(record){
        if(this.ds.getCount()==1){
            this.refresh();
        }else{
            this.isUpdating = true;
            GroupingView.superclass.refreshRow.apply(this, arguments);
            this.isUpdating = false;
        }
    },

    
    beforeMenuShow : function(){
        var item, items = this.hmenu.items, disabled = this.cm.config[this.hdCtxIndex].groupable === false;
        if((item = items.get('groupBy'))){
            item.setDisabled(disabled);
        }
        if((item = items.get('showGroups'))){
            item.setDisabled(disabled);
            item.setChecked(this.enableGrouping, true);
        }
    },

    
    renderUI : function(){
        GroupingView.superclass.renderUI.call(this);
        this.mainBody.on('mousedown', this.interceptMouse, this);

        if(this.enableGroupingMenu && this.hmenu){
            this.hmenu.add('-',{
                itemId:'groupBy',
                text: this.groupByText,
                handler: this.onGroupByClick,
                scope: this,
                iconCls:'x-group-by-icon'
            });
            if(this.enableNoGroups){
                this.hmenu.add({
                    itemId:'showGroups',
                    text: this.showGroupsText,
                    checked: true,
                    checkHandler: this.onShowGroupsClick,
                    scope: this
                });
            }
            this.hmenu.on('beforeshow', this.beforeMenuShow, this);
        }
    },

    processEvent: function(name, e){
        GroupingView.superclass.processEvent.call(this, name, e);
        var hd = e.getTarget('.x-grid-group-hd', this.mainBody);
        if(hd){
            
            var field = this.getGroupField(),
                prefix = this.getPrefix(field),
                groupValue = hd.id.substring(prefix.length);

            
            groupValue = groupValue.substr(0, groupValue.length - 3);
            if(groupValue){
                this.grid.fireEvent('group' + name, this.grid, field, groupValue, e);
            }
        }

    },

    
    onGroupByClick : function(){
        this.enableGrouping = true;
        this.grid.store.groupBy(this.cm.getDataIndex(this.hdCtxIndex));
        this.grid.fireEvent('groupchange', this, this.grid.store.getGroupState());
        this.beforeMenuShow(); 
        this.refresh();
    },

    
    onShowGroupsClick : function(mi, checked){
        this.enableGrouping = checked;
        if(checked){
            this.onGroupByClick();
        }else{
            this.grid.store.clearGrouping();
            this.grid.fireEvent('groupchange', this, null);
        }
    },

    
    toggleRowIndex : function(rowIndex, expanded){
        if(!this.canGroup()){
            return;
        }
        var row = this.getRow(rowIndex);
        if(row){
            this.toggleGroup(this.findGroup(row), expanded);
        }
    },

    
    toggleGroup : function(group, expanded){
        var gel = Ext.get(group);
        expanded = Ext.isDefined(expanded) ? expanded : gel.hasClass('x-grid-group-collapsed');
        if(this.state[gel.id] !== expanded){
            this.grid.stopEditing(true);
            this.state[gel.id] = expanded;
            gel[expanded ? 'removeClass' : 'addClass']('x-grid-group-collapsed');
        }
    },

    
    toggleAllGroups : function(expanded){
        var groups = this.getGroups();
        for(var i = 0, len = groups.length; i < len; i++){
            this.toggleGroup(groups[i], expanded);
        }
    },

    
    expandAllGroups : function(){
        this.toggleAllGroups(true);
    },

    
    collapseAllGroups : function(){
        this.toggleAllGroups(false);
    },

    
    interceptMouse : function(e){
        var hd = e.getTarget('.x-grid-group-hd', this.mainBody);
        if(hd){
            e.stopEvent();
            this.toggleGroup(hd.parentNode);
        }
    },

    
    getGroup : function(v, r, groupRenderer, rowIndex, colIndex, ds){
        var g = groupRenderer ? groupRenderer(v, {}, r, rowIndex, colIndex, ds) : String(v);
        if(g === '' || g === '&#160;'){
            g = this.cm.config[colIndex].emptyGroupText || this.emptyGroupText;
        }
        return g;
    },

    
    getGroupField : function(){
        return this.grid.store.getGroupState();
    },

    
    afterRender : function(){
        if(!this.ds || !this.cm){
            return;
        }
        GroupingView.superclass.afterRender.call(this);
        if(this.grid.deferRowRender){
            this.updateGroupWidths();
        }
    },

    
    renderRows : function(){
        var groupField = this.getGroupField();
        var eg = !!groupField;
        
        if(this.hideGroupedColumn) {
            var colIndex = this.cm.findColumnIndex(groupField),
                hasLastGroupField = Ext.isDefined(this.lastGroupField);
            if(!eg && hasLastGroupField){
                this.mainBody.update('');
                this.cm.setHidden(this.cm.findColumnIndex(this.lastGroupField), false);
                delete this.lastGroupField;
            }else if (eg && !hasLastGroupField){
                this.lastGroupField = groupField;
                this.cm.setHidden(colIndex, true);
            }else if (eg && hasLastGroupField && groupField !== this.lastGroupField) {
                this.mainBody.update('');
                var oldIndex = this.cm.findColumnIndex(this.lastGroupField);
                this.cm.setHidden(oldIndex, false);
                this.lastGroupField = groupField;
                this.cm.setHidden(colIndex, true);
            }
        }
        return GroupingView.superclass.renderRows.apply(
                    this, arguments);
    },

    
    doRender : function(cs, rs, ds, startRow, colCount, stripe){
        if(rs.length < 1){
            return '';
        }

        if(!this.canGroup() || this.isUpdating){
            return GroupingView.superclass.doRender.apply(this, arguments);
        }

        var groupField = this.getGroupField(),
            colIndex = this.cm.findColumnIndex(groupField),
            g,
            gstyle = 'width:' + this.getTotalWidth() + ';',
            cfg = this.cm.config[colIndex],
            groupRenderer = cfg.groupRenderer || cfg.renderer,
            prefix = this.showGroupName ? (cfg.groupName || cfg.header)+': ' : '',
            groups = [],
            curGroup, i, len, gid;

        for(i = 0, len = rs.length; i < len; i++){
            var rowIndex = startRow + i,
                r = rs[i],
                gvalue = r.data[groupField];

                g = this.getGroup(gvalue, r, groupRenderer, rowIndex, colIndex, ds);
            if(!curGroup || curGroup.group != g){
                gid = this.constructId(gvalue, groupField, colIndex);
                
                
                this.state[gid] = !(Ext.isDefined(this.state[gid]) ? !this.state[gid] : this.startCollapsed);
                curGroup = {
                    group: g,
                    gvalue: gvalue,
                    text: prefix + g,
                    groupId: gid,
                    startRow: rowIndex,
                    rs: [r],
                    cls: this.state[gid] ? '' : 'x-grid-group-collapsed',
                    style: gstyle
                };
                groups.push(curGroup);
            }else{
                curGroup.rs.push(r);
            }
            r._groupId = gid;
        }

        var buf = [];
        for(i = 0, len = groups.length; i < len; i++){
            g = groups[i];
            this.doGroupStart(buf, g, cs, ds, colCount);
            buf[buf.length] = GroupingView.superclass.doRender.call(
                    this, cs, g.rs, ds, g.startRow, colCount, stripe);

            this.doGroupEnd(buf, g, cs, ds, colCount);
        }
        return buf.join('');
    },

    
    getGroupId : function(value){
        var field = this.getGroupField();
        return this.constructId(value, field, this.cm.findColumnIndex(field));
    },

    
    constructId : function(value, field, idx){
        var cfg = this.cm.config[idx],
            groupRenderer = cfg.groupRenderer || cfg.renderer,
            val = (this.groupMode == 'value') ? value : this.getGroup(value, {data:{}}, groupRenderer, 0, idx, this.ds);

        return this.getPrefix(field) + Format.htmlEncode(val);
    },

    
    canGroup  : function(){
        return this.enableGrouping && !!this.getGroupField();
    },

    
    getPrefix: function(field){
        return this.grid.getGridEl().id + '-gp-' + field + '-';
    },

    
    doGroupStart : function(buf, g, cs, ds, colCount){
        buf[buf.length] = this.startGroup.apply(g);
    },

    
    doGroupEnd : function(buf, g, cs, ds, colCount){
        buf[buf.length] = this.endGroup;
    },

    
    getRows : function(){
        if(!this.canGroup()){
            return GroupingView.superclass.getRows.call(this);
        }
        var r = [],
            gs = this.getGroups(),
            g,
            i = 0,
            len = gs.length,
            j,
            jlen;
        for(; i < len; ++i){
            g = gs[i].childNodes[1];
            if(g){
                g = g.childNodes;
                for(j = 0, jlen = g.length; j < jlen; ++j){
                    r[r.length] = g[j];
                }
            }
        }
        return r;
    },

    
    updateGroupWidths : function(){
        if(!this.canGroup() || !this.hasRows()){
            return;
        }
        var tw = Math.max(this.cm.getTotalWidth(), this.el.dom.offsetWidth-this.getScrollOffset()) +'px';
        var gs = this.getGroups();
        for(var i = 0, len = gs.length; i < len; i++){
            gs[i].firstChild.style.width = tw;
        }
    },

    
    onColumnWidthUpdated : function(col, w, tw){
        GroupingView.superclass.onColumnWidthUpdated.call(this, col, w, tw);
        this.updateGroupWidths();
    },

    
    onAllColumnWidthsUpdated : function(ws, tw){
        GroupingView.superclass.onAllColumnWidthsUpdated.call(this, ws, tw);
        this.updateGroupWidths();
    },

    
    onColumnHiddenUpdated : function(col, hidden, tw){
        GroupingView.superclass.onColumnHiddenUpdated.call(this, col, hidden, tw);
        this.updateGroupWidths();
    },

    
    onLayout : function(){
        this.updateGroupWidths();
    },

    
    onBeforeRowSelect : function(sm, rowIndex){
        this.toggleRowIndex(rowIndex, true);
    }
});

GroupingView.GROUP_ID = 1000;

export default GroupingView;