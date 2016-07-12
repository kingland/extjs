import Ext from '../Base';
import CartesianChart from './CartesianChart';

var StackedBarChart = Ext.extend(CartesianChart, {
    type: 'stackbar'
});
Ext.reg('stackedbarchart', StackedBarChart);

export default StackedBarChart;
