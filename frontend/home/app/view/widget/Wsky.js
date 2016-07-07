Ext.define('Home.view.widget.Wsky', {
    extend: 'Ext.panel.Panel',
    xtype: 'wsky',
    layout: 'vbox',
    frame: true,
    width: 260,
    items: [{
        xtype: 'panel',
        layout: 'hbox',
        items: [{
            xtype: 'image',
            src: 'resources/star.png',
            width: 130,
            height: 114
        },{
            html: '<br>All-sky visualization of DES releases in grizY and RGB with overlay of tile grid and objects',
            // xtype: 'container',
            // text: 'testando',
            width: 128,
            // height: 134
        }]
    },{
        xtype: 'button', 
        text    : 'Sky Viewer',
        width: 260,
        scale: 'large',
        handler : function() {
            window.open("/dri/apps/sky","_self")
        }
    }]
});