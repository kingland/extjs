import Ext from '../Base';
import Menu from './Menu';
import ColorPalette from '../ColorPalette';

var ColorMenu = Ext.extend(Menu, {
    
    enableScrolling : false,
    
    hideOnClick : true,
    
    cls : 'x-color-menu',
    
    
    paletteId : null,
    
    initComponent : function(){
        Ext.apply(this, {
            plain: true,
            showSeparator: false,
            items: this.palette = new ColorPalette(Ext.applyIf({
                id: this.paletteId
            }, this.initialConfig))
        });
        this.palette.purgeListeners();
        ColorMenu.superclass.initComponent.call(this);
        
        this.relayEvents(this.palette, ['select']);
        this.on('select', this.menuHide, this);
        if(this.handler){
            this.on('select', this.handler, this.scope || this);
        }
    },

    menuHide : function(){
        if(this.hideOnClick){
            this.hide(true);
        }
    }
});
Ext.reg('colormenu', ColorMenu);

export default ColorMenu;