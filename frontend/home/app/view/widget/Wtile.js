Ext.define('Home.view.widget.Wtile', {
    extend: 'Ext.panel.Panel',
    xtype: 'wtile',
    layout: 'vbox',
    frame: true,
    width: 260,
    items: [{
        xtype: 'panel',
        layout: 'hbox',
        items: [{
            xtype: 'image',
            src: 'resources/tiles.png',
            width: 130,
            height: 114
        },{
            html: '<br>Inspect DES tiles using visiOmatic tools',
            // xtype: 'container',
            // text: 'testando',
            width: 128,
            // height: 134
        }]
    },{
        xtype: 'button', 
        text    : 'Tile Viewer',
        width: 260,
        scale: 'large',
        disabled : true,
        handler : function() {
            window.open("/dri/apps/sky","_self")
        }
    }]
});