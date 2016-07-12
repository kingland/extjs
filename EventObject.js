import Ext from './Base';
import EventObjectImpl from './EventObjectImpl';

var EventObject = function(){
	return new EventObjectImpl();
}();

export default EventObject;