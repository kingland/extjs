import Ext from '../Base';
import CartesianChart from './CartesianChart';

var LineChart = Ext.extend(CartesianChart, {
    type: 'line'
});
Ext.reg('linechart', LineChart);

export default LineChart;