import Ext from '../Base';
import CartesianChart from './CartesianChart';

var BarChart = Ext.extend(CartesianChart, {
    type: 'bar'
});
Ext.reg('barchart', BarChart);

export default BarChart;