import Ext from '../Base';
import Axis from './Axis';

var TimeAxis = Ext.extend(Axis, {
    type: "time",

    
    minimum: null,

    
    maximum: null,

    
    majorUnit: NaN,

    
    majorTimeUnit: null,

    
    minorUnit: NaN,

    
    minorTimeUnit: null,

    
    snapToUnits: true,

    
    stackingEnabled: false,

    
    calculateByLabelSize: true

});

export default TimeAxis;