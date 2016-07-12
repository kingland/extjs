import Ext from '../Base';
import Axis from './Axis';

var CategoryAxis = Ext.extend(Axis, {
    type: "category",

    
    categoryNames: null,

    
    calculateCategoryCount: false

});

export default CategoryAxis;