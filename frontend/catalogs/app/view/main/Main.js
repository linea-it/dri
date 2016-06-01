/**
 * This class is the main view for the application. It is specified in app.js as the
 * "mainView" property. That setting automatically applies the "viewport"
 * plugin causing this view to become the body element (i.e., the viewport).
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('Catalogs.view.main.Main', {
    extend: 'Ext.panel.Panel',
    xtype: 'app-main',

    requires: [
        'Ext.plugin.Viewport',
        'Ext.window.MessageBox',

        'Catalogs.view.main.MainController',
        'Catalogs.view.main.MainModel',
        'Catalogs.view.main.List'
    ],
    controller: 'main',
    viewModel: 'main',
    // width: 1000,
    height: 500,
    layout: 'hbox',

    items: [{
        width: 250,
        margin: '0 2 0 0',
        title: '&nbsp;',
        // collapsible : true,        
        reference: 'treelista',        
        xtype: 'maintree'        
    },{
        region: 'center',
        // width: 500,
        flex: true,
        frame: true,
        height: '100%',      
        reference: 'catalogs',
        xtype: 'mainlist'        
    }
 
    ]
});
