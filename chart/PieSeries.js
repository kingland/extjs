import Ext from '../Base';
import Series from './Series';

var PieSeries = Ext.extend(Series, {
    type: "pie",
    dataField: null,
    categoryField: null
});

export default PieSeries;