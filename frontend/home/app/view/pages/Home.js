Ext.define('Home.view.pages.Home', {
    extend: 'Ext.panel.Panel',
    xtype: 'pages-home',
    requires: [
        'Home.view.widget.Wsky',
        'Home.view.widget.Wrelease'
    ],
    layout: 'column',
    items: [{
        xtype: 'wsky',
        margin: '0 10 10 0'
    },{
        xtype: 'wrelease',
        margin: '0 10 10 0'
    },{
        xtype: 'wtarget',
        margin: '0 10 10 0'
    }]
});
