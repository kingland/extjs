import Ext from '../Base';
import Panel from '../Panel';
import ColumnModel from './ColumnModel';
import RowSelectionModel from './RowSelectionModel';
import GridView from './GridView';
import LoadMask from '../LoadMask';
import StoreMgr from '../StoreMgr';
import DelayedTask  from '../util/DelayedTask';

var GridPanel = Ext.extend(Panel, {
    
    autoExpandColumn : false,
    
    autoExpandMax : 1000,
    
    autoExpandMin : 50,
    
    columnLines : false,
    
    ddText : '{0} selected row{1}',
    
    deferRowRender : true,

    enableColumnHide : true,
    
    enableColumnMove : true,
    
    enableDragDrop : false,
    
    enableHdMenu : true,
    
    loadMask : false,
    
    minColumnWidth : 25,
    
    stripeRows : false,
    
    trackMouseOver : true,
    
    stateEvents : ['columnmove', 'columnresize', 'sortchange', 'groupchange'],
    
    view : null,
    
    bubbleEvents: [],
    
    rendered : false,
    
    viewReady : false,

    
    initComponent : function(){
        GridPanel.superclass.initComponent.call(this);

        if(this.columnLines){
            this.cls = (this.cls || '') + ' x-grid-with-col-lines';
        }
        
        
        this.autoScroll = false;
        this.autoWidth = false;

        if(Ext.isArray(this.columns)){
            this.colModel = new ColumnModel(this.columns);
            delete this.columns;
        }

        
        if(this.ds){
            this.store = this.ds;
            delete this.ds;
        }
        if(this.cm){
            this.colModel = this.cm;
            delete this.cm;
        }
        if(this.sm){
            this.selModel = this.sm;
            delete this.sm;
        }
        this.store = StoreMgr.lookup(this.store);

        this.addEvents(
            
            
            'click',
            
            'dblclick',
            
            'contextmenu',
            
            'mousedown',
            
            'mouseup',
            
            'mouseover',
            
            'mouseout',
            
            'keypress',
            
            'keydown',

            
            
            'cellmousedown',
            
            'rowmousedown',
            
            'headermousedown',

            
            'groupmousedown',

            
            'rowbodymousedown',

            
            'containermousedown',

            
            'cellclick',
            
            'celldblclick',
            
            'rowclick',
            
            'rowdblclick',
            
            'headerclick',
            
            'headerdblclick',
            
            'groupclick',
            
            'groupdblclick',
            
            'containerclick',
            
            'containerdblclick',

            
            'rowbodyclick',
            
            'rowbodydblclick',

            
            'rowcontextmenu',
            
            'cellcontextmenu',
            
            'headercontextmenu',
            
            'groupcontextmenu',
            
            'containercontextmenu',
            
            'rowbodycontextmenu',
            
            'bodyscroll',
            
            'columnresize',
            
            'columnmove',
            
            'sortchange',
            
            'groupchange',
            
            'reconfigure',
            
            'viewready'
        );
    },

    
    onRender : function(ct, position){
        GridPanel.superclass.onRender.apply(this, arguments);

        var c = this.getGridEl();

        this.el.addClass('x-grid-panel');

        this.mon(c, {
            scope: this,
            mousedown: this.onMouseDown,
            click: this.onClick,
            dblclick: this.onDblClick,
            contextmenu: this.onContextMenu
        });

        this.relayEvents(c, ['mousedown','mouseup','mouseover','mouseout','keypress', 'keydown']);

        var view = this.getView();
        view.init(this);
        view.render();
        this.getSelectionModel().init(this);
    },

    
    initEvents : function(){
        GridPanel.superclass.initEvents.call(this);

        if(this.loadMask){
            this.loadMask = new LoadMask(this.bwrap,
                    Ext.apply({store:this.store}, this.loadMask));
        }
    },

    initStateEvents : function(){
        GridPanel.superclass.initStateEvents.call(this);
        this.mon(this.colModel, 'hiddenchange', this.saveState, this, {delay: 100});
    },

    applyState : function(state){
        var cm = this.colModel,
            cs = state.columns,
            store = this.store,
            s,
            c,
            oldIndex;

        if(cs){
            for(var i = 0, len = cs.length; i < len; i++){
                s = cs[i];
                c = cm.getColumnById(s.id);
                if(c){
                    c.hidden = s.hidden;
                    c.width = s.width;
                    oldIndex = cm.getIndexById(s.id);
                    if(oldIndex != i){
                        cm.moveColumn(oldIndex, i);
                    }
                }
            }
        }
        if(store){
            s = state.sort;
            if(s){
                store[store.remoteSort ? 'setDefaultSort' : 'sort'](s.field, s.direction);
            }
            s = state.group;
            if(store.groupBy){
                if(s){
                    store.groupBy(s);
                }else{
                    store.clearGrouping();
                }
            }

        }
        var o = Ext.apply({}, state);
        delete o.columns;
        delete o.sort;
        GridPanel.superclass.applyState.call(this, o);
    },

    getState : function(){
        var o = {columns: []},
            store = this.store,
            ss,
            gs;

        for(var i = 0, c; (c = this.colModel.config[i]); i++){
            o.columns[i] = {
                id: c.id,
                width: c.width
            };
            if(c.hidden){
                o.columns[i].hidden = true;
            }
        }
        if(store){
            ss = store.getSortState();
            if(ss){
                o.sort = ss;
            }
            if(store.getGroupState){
                gs = store.getGroupState();
                if(gs){
                    o.group = gs;
                }
            }
        }
        return o;
    },

    
    afterRender : function(){
        GridPanel.superclass.afterRender.call(this);
        var v = this.view;
        this.on('bodyresize', v.layout, v);
        v.layout();
        if(this.deferRowRender){
            if (!this.deferRowRenderTask){
                this.deferRowRenderTask = new DelayedTask(v.afterRender, this.view);
            }
            this.deferRowRenderTask.delay(10);
        }else{
            v.afterRender();
        }
        this.viewReady = true;
    },

    
    reconfigure : function(store, colModel){
        var rendered = this.rendered;
        if(rendered){
            if(this.loadMask){
                this.loadMask.destroy();
                this.loadMask = new LoadMask(this.bwrap,
                        Ext.apply({}, {store:store}, this.initialConfig.loadMask));
            }
        }
        if(this.view){
            this.view.initData(store, colModel);
        }
        this.store = store;
        this.colModel = colModel;
        if(rendered){
            this.view.refresh(true);
        }
        this.fireEvent('reconfigure', this, store, colModel);
    },

    
    onDestroy : function(){
        if (this.deferRowRenderTask && this.deferRowRenderTask.cancel){
            this.deferRowRenderTask.cancel();
        }
        if(this.rendered){
            Ext.destroy(this.view, this.loadMask);
        }else if(this.store && this.store.autoDestroy){
            this.store.destroy();
        }
        Ext.destroy(this.colModel, this.selModel);
        this.store = this.selModel = this.colModel = this.view = this.loadMask = null;
        GridPanel.superclass.onDestroy.call(this);
    },

    
    processEvent : function(name, e){
        this.view.processEvent(name, e);
    },

    
    onClick : function(e){
        this.processEvent('click', e);
    },

    
    onMouseDown : function(e){
        this.processEvent('mousedown', e);
    },

    
    onContextMenu : function(e, t){
        this.processEvent('contextmenu', e);
    },

    
    onDblClick : function(e){
        this.processEvent('dblclick', e);
    },

    
    walkCells : function(row, col, step, fn, scope){
        var cm    = this.colModel,
            clen  = cm.getColumnCount(),
            ds    = this.store,
            rlen  = ds.getCount(),
            first = true;

        if(step < 0){
            if(col < 0){
                row--;
                first = false;
            }
            while(row >= 0){
                if(!first){
                    col = clen-1;
                }
                first = false;
                while(col >= 0){
                    if(fn.call(scope || this, row, col, cm) === true){
                        return [row, col];
                    }
                    col--;
                }
                row--;
            }
        } else {
            if(col >= clen){
                row++;
                first = false;
            }
            while(row < rlen){
                if(!first){
                    col = 0;
                }
                first = false;
                while(col < clen){
                    if(fn.call(scope || this, row, col, cm) === true){
                        return [row, col];
                    }
                    col++;
                }
                row++;
            }
        }
        return null;
    },

    
    getGridEl : function(){
        return this.body;
    },

    
    stopEditing : Ext.emptyFn,

    
    getSelectionModel : function(){
        if(!this.selModel){
            this.selModel = new RowSelectionModel(
                    this.disableSelection ? {selectRow: Ext.emptyFn} : null);
        }
        return this.selModel;
    },

    
    getStore : function(){
        return this.store;
    },

    
    getColumnModel : function(){
        return this.colModel;
    },

    
    getView : function(){
        if(!this.view){
            this.view = new GridView(this.viewConfig);
        }
        return this.view;
    },
    
    getDragDropText : function(){
        var count = this.selModel.getCount();
        return String.format(this.ddText, count, count == 1 ? '' : 's');
    }
    
});
Ext.reg('grid', GridPanel);

export default GridPanel;