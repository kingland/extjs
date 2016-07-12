import Ext from './Base';
import BoxComponent from './BoxComponent';

var Spacer = Ext.extend(Ext.BoxComponent, {
    autoEl:'div'
});

Ext.reg('spacer', Spacer);

export default Spacer;