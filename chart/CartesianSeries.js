import Ext from '../Base';
import Series from './Series';

var CartesianSeries = Ext.extend(Series, {
    
    xField: null,

    
    yField: null,

    
    showInLegend: true,

    
    axis: 'primary'
});

export default CartesianSeries;