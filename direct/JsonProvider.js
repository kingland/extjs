import Ext from '../Base';
import Provider from './Provider';
import Direct from '../Direct';

var JsonProvider = Ext.extend(Provider, {
    parseResponse: function(xhr){
        if(!Ext.isEmpty(xhr.responseText)){
            if(typeof xhr.responseText == 'object'){
                return xhr.responseText;
            }
            return Ext.decode(xhr.responseText);
        }
        return null;
    },

    getEvents: function(xhr){
        var data = null;
        try{
            data = this.parseResponse(xhr);
        }catch(e){
            var event = new Direct.ExceptionEvent({
                data: e,
                xhr: xhr,
                code: Direct.exceptions.PARSE,
                message: 'Error parsing json response: \n\n ' + data
            });
            return [event];
        }
        var events = [];
        if(Ext.isArray(data)){
            for(var i = 0, len = data.length; i < len; i++){
                events.push(Direct.createEvent(data[i]));
            }
        }else{
            events.push(Direct.createEvent(data));
        }
        return events;
    }
});

export default JsonProvider;