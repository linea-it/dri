Ext.define('Home.view.widget.Wupload', {
    extend: 'Ext.panel.Panel',
    xtype: 'wupload',
    layout: 'vbox',
    frame: true,
    width: 260,
    items: [{
        xtype: 'panel',
        layout: 'hbox',
        items: [{
            xtype: 'image',
            src: 'resources/upload.png',
            width: 130,
            height: 114
        },{
            html: '<br>Upload external data to the Science Server',
            // xtype: 'container',
            // text: 'testando',
            width: 128,
            // height: 134
        }]
    },{
        xtype: 'button', 
        text    : 'Upload',
        width: 260,
        scale: 'large',
        disabled : true,
        handler : function() {
            window.open("/dri/apps/sky","_self")
        }
    }]
});