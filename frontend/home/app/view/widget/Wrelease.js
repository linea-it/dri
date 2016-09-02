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
            html: '<br>Summary information of DES releases and validation',
            // xtype: 'container',
            // text: 'testando',
            width: 130
            // height: 134
        }]
    },{
        xtype: 'button',
        text    : 'Releases',
        width: 260,
        scale: 'large',
        handler : function () {
            window.open('/dri/apps/eyeballing','_self');
        },
        disabled: true
    }]
});
