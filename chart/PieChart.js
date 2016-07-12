import Ext from '../Base';
import Chart from './Chart';

var PieChart = Ext.extend(Chart, {
    type: 'pie',

    onSwfReady : function(isReset){
        PieChart.superclass.onSwfReady.call(this, isReset);

        this.setDataField(this.dataField);
        this.setCategoryField(this.categoryField);
    },

    setDataField : function(field){
        this.dataField = field;
        this.swf.setDataField(field);
    },

    setCategoryField : function(field){
        this.categoryField = field;
        this.swf.setCategoryField(field);
    }
});
Ext.reg('piechart', PieChart);

export default PieChart;