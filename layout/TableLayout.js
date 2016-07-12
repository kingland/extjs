import Ext from '../Base';
import ContainerLayout from './ContainerLayout';
//import Container from '../Container';

var TableLayout = Ext.extend(ContainerLayout, {
    monitorResize:false,

    type: 'table',

    targetCls: 'x-table-layout-ct',
    
    tableAttrs:null,

    setContainer : function(ct){
        TableLayout.superclass.setContainer.call(this, ct);

        this.currentRow = 0;
        this.currentColumn = 0;
        this.cells = [];
    },
    
    
    onLayout : function(ct, target){
        var cs = ct.items.items, len = cs.length, c, i;

        if(!this.table){
            target.addClass('x-table-layout-ct');

            this.table = target.createChild(
                Ext.apply({tag:'table', cls:'x-table-layout', cellspacing: 0, cn: {tag: 'tbody'}}, this.tableAttrs), null, true);
        }
        this.renderAll(ct, target);
    },

    
    getRow : function(index){
        var row = this.table.tBodies[0].childNodes[index];
        if(!row){
            row = document.createElement('tr');
            this.table.tBodies[0].appendChild(row);
        }
        return row;
    },

    
    getNextCell : function(c){
        var cell = this.getNextNonSpan(this.currentColumn, this.currentRow);
        var curCol = this.currentColumn = cell[0], curRow = this.currentRow = cell[1];
        for(var rowIndex = curRow; rowIndex < curRow + (c.rowspan || 1); rowIndex++){
            if(!this.cells[rowIndex]){
                this.cells[rowIndex] = [];
            }
            for(var colIndex = curCol; colIndex < curCol + (c.colspan || 1); colIndex++){
                this.cells[rowIndex][colIndex] = true;
            }
        }
        var td = document.createElement('td');
        if(c.cellId){
            td.id = c.cellId;
        }
        var cls = 'x-table-layout-cell';
        if(c.cellCls){
            cls += ' ' + c.cellCls;
        }
        td.className = cls;
        if(c.colspan){
            td.colSpan = c.colspan;
        }
        if(c.rowspan){
            td.rowSpan = c.rowspan;
        }
        this.getRow(curRow).appendChild(td);
        return td;
    },

    
    getNextNonSpan: function(colIndex, rowIndex){
        var cols = this.columns;
        while((cols && colIndex >= cols) || (this.cells[rowIndex] && this.cells[rowIndex][colIndex])) {
            if(cols && colIndex >= cols){
                rowIndex++;
                colIndex = 0;
            }else{
                colIndex++;
            }
        }
        return [colIndex, rowIndex];
    },

    
    renderItem : function(c, position, target){
        
        if(!this.table){
            this.table = target.createChild(
                Ext.apply({tag:'table', cls:'x-table-layout', cellspacing: 0, cn: {tag: 'tbody'}}, this.tableAttrs), null, true);
        }
        if(c && !c.rendered){
            c.render(this.getNextCell(c));
            this.configureItem(c, position);
        }else if(c && !this.isValidParent(c, target)){
            var container = this.getNextCell(c);
            container.insertBefore(c.getPositionEl().dom, null);
            c.container = Ext.get(container);
            this.configureItem(c, position);
        }
    },

    
    isValidParent : function(c, target){
        return c.getPositionEl().up('table', 5).dom.parentNode === (target.dom || target);
    }

    
});

//Move To ContainnerLayout
//Container.LAYOUTS['table'] = TableLayout;

export default TableLayout;