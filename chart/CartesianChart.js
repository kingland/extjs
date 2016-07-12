import Ext from '../Base';
import Chart from './Chart';

var CartesianChart = Ext.extend(Chart, {
    onSwfReady : function(isReset){
        CartesianChart.superclass.onSwfReady.call(this, isReset);
        this.labelFn = [];
        if(this.xField){
            this.setXField(this.xField);
        }
        if(this.yField){
            this.setYField(this.yField);
        }
        if(this.xAxis){
            this.setXAxis(this.xAxis);
        }
        if(this.xAxes){
            this.setXAxes(this.xAxes);
        }
        if(this.yAxis){
            this.setYAxis(this.yAxis);
        }
        if(this.yAxes){
            this.setYAxes(this.yAxes);
        }
        if(Ext.isDefined(this.constrainViewport)){
            this.swf.setConstrainViewport(this.constrainViewport);
        }
    },

    setXField : function(value){
        this.xField = value;
        this.swf.setHorizontalField(value);
    },

    setYField : function(value){
        this.yField = value;
        this.swf.setVerticalField(value);
    },

    setXAxis : function(value){
        this.xAxis = this.createAxis('xAxis', value);
        this.swf.setHorizontalAxis(this.xAxis);
    },

    setXAxes : function(value){
        var axis;
        for(var i = 0; i < value.length; i++) {
            axis = this.createAxis('xAxis' + i, value[i]);
            this.swf.setHorizontalAxis(axis);
        }
    },

    setYAxis : function(value){
        this.yAxis = this.createAxis('yAxis', value);
        this.swf.setVerticalAxis(this.yAxis);
    },

    setYAxes : function(value){
        var axis;
        for(var i = 0; i < value.length; i++) {
            axis = this.createAxis('yAxis' + i, value[i]);
            this.swf.setVerticalAxis(axis);
        }
    },

    createAxis : function(axis, value){
        var o = Ext.apply({}, value),
            ref,
            old;

        if(this[axis]){
            old = this[axis].labelFunction;
            this.removeFnProxy(old);
            this.labelFn.remove(old);
        }
        if(o.labelRenderer){
            ref = this.getFunctionRef(o.labelRenderer);
            o.labelFunction = this.createFnProxy(function(v){
                return ref.fn.call(ref.scope, v);
            });
            delete o.labelRenderer;
            this.labelFn.push(o.labelFunction);
        }
        if(axis.indexOf('xAxis') > -1 && o.position == 'left'){
            o.position = 'bottom';
        }
        return o;
    },

    onDestroy : function(){
        CartesianChart.superclass.onDestroy.call(this);
        Ext.each(this.labelFn, function(fn){
            this.removeFnProxy(fn);
        }, this);
    }
});
Ext.reg('cartesianchart', CartesianChart);

export default CartesianChart;