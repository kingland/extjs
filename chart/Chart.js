import Ext from '../Base';
import FlashComponent from '../FlashComponent';
import StoreMgr from '../StoreMgr';
import DelayedTask from '../util/DelayedTask';

var Chart = Ext.extend(FlashComponent, {
    refreshBuffer: 100,
    
    chartStyle: {
        padding: 10,
        animationEnabled: true,
        font: {
            name: 'Tahoma',
            color: 0x444444,
            size: 11
        },
        dataTip: {
            padding: 5,
            border: {
                color: 0x99bbe8,
                size:1
            },
            background: {
                color: 0xDAE7F6,
                alpha: .9
            },
            font: {
                name: 'Tahoma',
                color: 0x15428B,
                size: 10,
                bold: true
            }
        }
    },

    

    
    extraStyle: null,

    
    seriesStyles: null,

    
    disableCaching: Ext.isIE || Ext.isOpera,
    disableCacheParam: '_dc',

    initComponent : function(){
        Chart.superclass.initComponent.call(this);
        if(!this.url){
            this.url = Chart.CHART_URL;
        }
        if(this.disableCaching){
            this.url = Ext.urlAppend(this.url, String.format('{0}={1}', this.disableCacheParam, new Date().getTime()));
        }
        this.addEvents(
            'itemmouseover',
            'itemmouseout',
            'itemclick',
            'itemdoubleclick',
            'itemdragstart',
            'itemdrag',
            'itemdragend',
            
            'beforerefresh',
            
            'refresh'
        );
        this.store = StoreMgr.lookup(this.store);
    },

    
     setStyle: function(name, value){
         this.swf.setStyle(name, Ext.encode(value));
     },

    
    setStyles: function(styles){
        this.swf.setStyles(Ext.encode(styles));
    },

    
    setSeriesStyles: function(styles){
        this.seriesStyles = styles;
        var s = [];
        Ext.each(styles, function(style){
            s.push(Ext.encode(style));
        });
        this.swf.setSeriesStyles(s);
    },

    setCategoryNames : function(names){
        this.swf.setCategoryNames(names);
    },

    setLegendRenderer : function(fn, scope){
        var chart = this;
        scope = scope || chart;
        chart.removeFnProxy(chart.legendFnName);
        chart.legendFnName = chart.createFnProxy(function(name){
            return fn.call(scope, name);
        });
        chart.swf.setLegendLabelFunction(chart.legendFnName);
    },

    setTipRenderer : function(fn, scope){
        var chart = this;
        scope = scope || chart;
        chart.removeFnProxy(chart.tipFnName);
        chart.tipFnName = chart.createFnProxy(function(item, index, series){
            var record = chart.store.getAt(index);
            return fn.call(scope, chart, record, index, series);
        });
        chart.swf.setDataTipFunction(chart.tipFnName);
    },

    setSeries : function(series){
        this.series = series;
        this.refresh();
    },

    
    bindStore : function(store, initial){
        if(!initial && this.store){
            if(store !== this.store && this.store.autoDestroy){
                this.store.destroy();
            }else{
                this.store.un("datachanged", this.refresh, this);
                this.store.un("add", this.delayRefresh, this);
                this.store.un("remove", this.delayRefresh, this);
                this.store.un("update", this.delayRefresh, this);
                this.store.un("clear", this.refresh, this);
            }
        }
        if(store){
            store = StoreMgr.lookup(store);
            store.on({
                scope: this,
                datachanged: this.refresh,
                add: this.delayRefresh,
                remove: this.delayRefresh,
                update: this.delayRefresh,
                clear: this.refresh
            });
        }
        this.store = store;
        if(store && !initial){
            this.refresh();
        }
    },

    onSwfReady : function(isReset){
        Chart.superclass.onSwfReady.call(this, isReset);
        var ref;
        this.swf.setType(this.type);

        if(this.chartStyle){
            this.setStyles(Ext.apply({}, this.extraStyle, this.chartStyle));
        }

        if(this.categoryNames){
            this.setCategoryNames(this.categoryNames);
        }

        if(this.tipRenderer){
            ref = this.getFunctionRef(this.tipRenderer);
            this.setTipRenderer(ref.fn, ref.scope);
        }
        if(this.legendRenderer){
            ref = this.getFunctionRef(this.legendRenderer);
            this.setLegendRenderer(ref.fn, ref.scope);
        }
        if(!isReset){
            this.bindStore(this.store, true);
        }
        this.refresh.defer(10, this);
    },

    delayRefresh : function(){
        if(!this.refreshTask){
            this.refreshTask = new DelayedTask(this.refresh, this);
        }
        this.refreshTask.delay(this.refreshBuffer);
    },

    refresh : function(){
        if(this.fireEvent('beforerefresh', this) !== false){
            var styleChanged = false;
            
            var data = [], rs = this.store.data.items;
            for(var j = 0, len = rs.length; j < len; j++){
                data[j] = rs[j].data;
            }
            
            
            var dataProvider = [];
            var seriesCount = 0;
            var currentSeries = null;
            var i = 0;
            if(this.series){
                seriesCount = this.series.length;
                for(i = 0; i < seriesCount; i++){
                    currentSeries = this.series[i];
                    var clonedSeries = {};
                    for(var prop in currentSeries){
                        if(prop == "style" && currentSeries.style !== null){
                            clonedSeries.style = Ext.encode(currentSeries.style);
                            styleChanged = true;
                            
                            
                            
                            
                        } else{
                            clonedSeries[prop] = currentSeries[prop];
                        }
                    }
                    dataProvider.push(clonedSeries);
                }
            }

            if(seriesCount > 0){
                for(i = 0; i < seriesCount; i++){
                    currentSeries = dataProvider[i];
                    if(!currentSeries.type){
                        currentSeries.type = this.type;
                    }
                    currentSeries.dataProvider = data;
                }
            } else{
                dataProvider.push({type: this.type, dataProvider: data});
            }
            this.swf.setDataProvider(dataProvider);
            if(this.seriesStyles){
                this.setSeriesStyles(this.seriesStyles);
            }
            this.fireEvent('refresh', this);
        }
    },

    
    createFnProxy : function(fn){
        var fnName = 'extFnProxy' + (++Chart.PROXY_FN_ID);
        Chart.proxyFunction[fnName] = fn;
        return 'Chart.proxyFunction.' + fnName;
    },

    
    removeFnProxy : function(fn){
        if(!Ext.isEmpty(fn)){
            fn = fn.replace('Chart.proxyFunction.', '');
            delete Chart.proxyFunction[fn];
        }
    },

    
    getFunctionRef : function(val){
        if(Ext.isFunction(val)){
            return {
                fn: val,
                scope: this
            };
        }else{
            return {
                fn: val.fn,
                scope: val.scope || this
            }
        }
    },

    
    onDestroy: function(){
        if (this.refreshTask && this.refreshTask.cancel){
            this.refreshTask.cancel();
        }
        Chart.superclass.onDestroy.call(this);
        this.bindStore(null);
        this.removeFnProxy(this.tipFnName);
        this.removeFnProxy(this.legendFnName);
    }
});
Ext.reg('chart', Chart);
Chart.PROXY_FN_ID = 0;
Chart.proxyFunction = {};
Chart.CHART_URL = 'http:/' + '/yui.yahooapis.com/2.8.0/build/charts/assets/charts.swf';

export default Chart;