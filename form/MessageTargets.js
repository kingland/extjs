import Ext from '../Base';
import Field from './Field';
import QuickTips from '../QuickTips';

var MessageTargets = {
    'qtip' : {
        mark: function(field, msg){
            field.el.addClass(field.invalidClass);
            field.el.dom.qtip = msg;
            field.el.dom.qclass = 'x-form-invalid-tip';
            if(QuickTips){ 
                QuickTips.enable();
            }
        },
        clear: function(field){
            field.el.removeClass(field.invalidClass);
            field.el.dom.qtip = '';
        }
    },
    'title' : {
        mark: function(field, msg){
            field.el.addClass(field.invalidClass);
            field.el.dom.title = msg;
        },
        clear: function(field){
            field.el.dom.title = '';
        }
    },
    'under' : {
        mark: function(field, msg){
            field.el.addClass(field.invalidClass);
            if(!field.errorEl){
                var elp = field.getErrorCt();
                if(!elp){ 
                    field.el.dom.title = msg;
                    return;
                }
                field.errorEl = elp.createChild({cls:'x-form-invalid-msg'});
                field.on('resize', field.alignErrorEl, field);
                field.on('destroy', function(){
                    Ext.destroy(this.errorEl);
                }, field);
            }
            field.alignErrorEl();
            field.errorEl.update(msg);
            Field.msgFx[field.msgFx].show(field.errorEl, field);
        },
        clear: function(field){
            field.el.removeClass(field.invalidClass);
            if(field.errorEl){
                Field.msgFx[field.msgFx].hide(field.errorEl, field);
            }else{
                field.el.dom.title = '';
            }
        }
    },
    'side' : {
        mark: function(field, msg){
            field.el.addClass(field.invalidClass);
            if(!field.errorIcon){
                var elp = field.getErrorCt();
                
                if(!elp){
                    field.el.dom.title = msg;
                    return;
                }
                field.errorIcon = elp.createChild({cls:'x-form-invalid-icon'});
                if (field.ownerCt) {
                    field.ownerCt.on('afterlayout', field.alignErrorIcon, field);
                    field.ownerCt.on('expand', field.alignErrorIcon, field);
                }
                field.on('resize', field.alignErrorIcon, field);
                field.on('destroy', function(){
                    Ext.destroy(this.errorIcon);
                }, field);
            }
            field.alignErrorIcon();
            field.errorIcon.dom.qtip = msg;
            field.errorIcon.dom.qclass = 'x-form-invalid-tip';
            field.errorIcon.show();
        },
        clear: function(field){
            field.el.removeClass(field.invalidClass);
            if(field.errorIcon){
                field.errorIcon.dom.qtip = '';
                field.errorIcon.hide();
            }else{
                field.el.dom.title = '';
            }
        }
    }
};

export default MessageTargets;