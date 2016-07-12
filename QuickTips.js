import Ext from './Base';
import QuickTip from './QuickTip';

var QuickTips = function(){
    var tip, locks = [];
    return {
        
        init : function(autoRender){
            if(!tip){
                if(!Ext.isReady){
                    Ext.onReady(function(){
                        QuickTips.init(autoRender);
                    });
                    return;
                }
                tip = new QuickTip({elements:'header,body'});
                if(autoRender !== false){
                    tip.render(Ext.getBody());
                }
            }
        },

        
        enable : function(){
            if(tip){
                locks.pop();
                if(locks.length < 1){
                    tip.enable();
                }
            }
        },

        
        disable : function(){
            if(tip){
                tip.disable();
            }
            locks.push(1);
        },

        
        isEnabled : function(){
            return tip !== undefined && !tip.disabled;
        },

        
        getQuickTip : function(){
            return tip;
        },

        
        register : function(){
            tip.register.apply(tip, arguments);
        },

        
        unregister : function(){
            tip.unregister.apply(tip, arguments);
        },

        
        tips :function(){
            tip.register.apply(tip, arguments);
        }
    }
}();

export default QuickTips;