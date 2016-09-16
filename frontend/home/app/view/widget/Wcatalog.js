Ext.define('Home.view.widget.Wcatalog', {
    extend: 'Ext.panel.Panel',
    xtype: 'wcatalog',
    layout: 'vbox',
    frame: true,
    width: 260,
    items: [{
        xtype: 'panel',
        layout: 'hbox',
        items: [{
            xtype: 'image',
            src: 'resources/catalog.png',
            width: 130,
            height: 114
        },{
            html: '<br>Serve catalogs created by the collaboration',
            // xtype: 'container',
            // text: 'testando',
            width: 128
            // height: 134
        }]
    },{
        xtype: 'button',
        text    : 'Science Products',
        width: 260,
        scale: 'large',
        disabled : true,
        handler : function () {
            window.open('/dri/apps/products','_self');
        }
    }]
});
