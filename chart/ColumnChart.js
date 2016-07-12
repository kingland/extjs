import Ext from '../Base';
import CartesianChart from './CartesianChart';

var ColumnChart = Ext.extend(CartesianChart, {
    type: 'column'
});
Ext.reg('columnchart', ColumnChart);

export default ColumnChart;