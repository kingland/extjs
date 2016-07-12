import Ext from '../Base';
import CartesianSeries from './CartesianSeries';

var ColumnSeries = Ext.extend(CartesianSeries, {
    type: "column"
});

export default ColumnSeries;