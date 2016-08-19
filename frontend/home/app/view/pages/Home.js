Ext.define('Home.view.pages.Home', {
    extend: 'Ext.panel.Panel',
    xtype: 'pages-home',
    requires: [
        'Home.view.widget.Wsky',
        'Home.view.widget.Wrelease',
        'Home.view.widget.Wtile',
        'Home.view.widget.Wtarget',
        'Home.view.widget.Wsquery',
        'Home.view.widget.Wupload',
        'Home.view.widget.Wcutout',
        'Home.view.widget.Wcatalog',
        'Home.view.widget.Wlist',
    ],
    layout: 'column',
    items: [{
        xtype: 'wrelease',
        margin: '0 10 10 0'
    },{
        xtype: 'wsky',
        margin: '0 10 10 0'
    },{
        xtype: 'wtile',
        margin: '0 10 10 0',
        hidden: true
    },{
        xtype: 'wtarget',
        margin: '0 10 10 0'
    },{
        xtype: 'wsquery',
        margin: '0 10 10 0'
    },{
        xtype: 'wupload',
        margin: '0 10 10 0'
    },{
        xtype: 'wcutout',
        margin: '0 10 10 0'
    },{
        xtype: 'wcatalog',
        margin: '0 10 10 0'
    },{
        xtype: 'wlist',
        margin: '0 10 10 0'
    }]
});
