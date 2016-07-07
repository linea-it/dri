Ext.define('Home.view.widget.Wrelease', {
    extend: 'Ext.panel.Panel',
    xtype: 'wrelease',
    layout: 'vbox',
    frame: true,
    width: 260,
    items: [{
        xtype: 'panel',
        layout: 'hbox',
        items: [{
            xtype: 'image',
            src: 'resources/release.png',
            width: 130,
            height: 114
        },{
            html: '<br>Validation of coadd images using Aladin Lite.',
            // xtype: 'container',
            // text: 'testando',
            width: 130,
            // height: 134
        }]
    },{
        xtype: 'button', 
        text    : 'Release Validation',
        width: 260,
        scale: 'large',
        handler : function() {
            window.open("/dri/apps/eyeballing","_self")
        }
    }]
});