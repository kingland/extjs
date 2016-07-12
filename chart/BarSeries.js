import Ext from '../Base';
import CartesianSeries from './CartesianSeries';

var BarSeries = Ext.extend(CartesianSeries, {
    type: "bar"
});

export default BarSeries;