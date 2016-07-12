import Ext from '../Base';
import CartesianChart from './CartesianChart';

var StackedColumnChart = Ext.extend(CartesianChart, {
    type: 'stackcolumn'
});
Ext.reg('stackedcolumnchart', StackedColumnChart);

export default StackedColumnChart;