Ext.define('Home.view.widget.Wcutout', {
    extend: 'Ext.panel.Panel',
    xtype: 'wcutout',
    layout: 'vbox',
    frame: true,
    width: 260,
    items: [{
        xtype: 'panel',
        layout: 'hbox',
        items: [{
            xtype: 'image',
            src: 'resources/cutout.png',
            width: 130,
            height: 114
        },{
            html: '<br>Create co-added or single epoch cutouts from a list of coordinates',
            // xtype: 'container',
            // text: 'testando',
            width: 128,
            // height: 134
        }]
    },{
        xtype: 'button', 
        text    : 'Cutout Server',
        width: 260,
        scale: 'large',
        disabled : true,
        handler : function() {
            window.open("/dri/apps/sky","_self")
        }
    }]
});