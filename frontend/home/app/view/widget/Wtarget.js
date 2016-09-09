Ext.define('Home.view.widget.Wtarget', {
    extend: 'Ext.panel.Panel',
    xtype: 'wtarget',
    layout: 'vbox',
    frame: true,
    width: 260,
    items: [{
        xtype: 'panel',
        layout: 'hbox',
        items: [{
            xtype: 'image',
            src: 'resources/target.png',
            width: 130,
            height: 114
        },{
            html: '<br>Manage lists of targets with image display, cutouts, ranking and reject functionalities.',
            // xtype: 'container',
            // text: 'testando',
            width: 128
            // height: 134
        }]
    },{
        xtype: 'button',
        text    : 'Target Viewer',
        width: 260,
        scale: 'large',
        // disabled: true,
        handler : function () {
            window.open('/dri/apps/target','_self');
        }
    }]
});
