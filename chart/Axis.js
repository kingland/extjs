import Ext from '../Base';


var Axis = function(config){
    Ext.apply(this, config);
};

Axis.prototype ={
    
    type: null,

    
    orientation: "horizontal",

    
    reverse: false,

    
    labelFunction: null,

    
    hideOverlappingLabels: true,

    
    labelSpacing: 2
};

export default Axis;