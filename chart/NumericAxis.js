import Ext from '../Base';
import Axis from './Axis';

var NumericAxis = Ext.extend(Axis, {
    type: "numeric",

    
    minimum: NaN,

    
    maximum: NaN,

    
    majorUnit: NaN,

    
    minorUnit: NaN,

    
    snapToUnits: true,

    
    alwaysShowZero: true,

    
    scale: "linear",

    
    roundMajorUnit: true,

    
    calculateByLabelSize: true,

    
    position: 'left',

    
    adjustMaximumByMajorUnit: true,

    
    adjustMinimumByMajorUnit: true

});

export default NumericAxis;