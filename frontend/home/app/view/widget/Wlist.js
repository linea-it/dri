Ext.define('Home.view.widget.Wlist', {
    extend: 'Ext.panel.Panel',
    xtype: 'wlist',
    layout: 'vbox',
    frame: true,
    width: 260,
    items: [{
        xtype: 'panel',
        layout: 'hbox',
        items: [{
            xtype: 'image',
            src: 'resources/list.png',
            width: 130,
            height: 114
        },{
            html: '<br>',
            // xtype: 'container',
            // text: 'testando',
            width: 128,
            // height: 134
        }]
    },{
        xtype: 'button', 
        text    : 'SL Candidates',
        width: 260,
        scale: 'large',
        // disabled : true,
        handler : function() {
            window.open("http://desportal.cosmology.illinois.edu:8088/","_self")
        }
    }]
});