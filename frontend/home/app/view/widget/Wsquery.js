Ext.define('Home.view.widget.Wsquery', {
    extend: 'Ext.panel.Panel',
    xtype: 'wsquery',
    layout: 'vbox',
    frame: true,
    width: 260,
    items: [{
        xtype: 'panel',
        layout: 'hbox',
        items: [{
            xtype: 'image',
            src: 'resources/sq.png',
            width: 130,
            height: 114
        },{
            html: '<br>Query catalogs using sample queries or keep your own query library',
            // xtype: 'container',
            // text: 'testando',
            width: 128,
            // height: 134
        }]
    },{
        xtype: 'button', 
        text    : 'Sky Query',
        width: 260,
        scale: 'large',
        disabled : true,
        handler : function() {
            window.open("/dri/apps/sky","_self")
        }
    }]
});