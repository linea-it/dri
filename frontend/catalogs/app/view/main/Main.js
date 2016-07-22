/**
 * This class is the main view for the application. It is specified in app.js as the
 * "mainView" property. That setting automatically applies the "viewport"
 * plugin causing this view to become the body element (i.e., the viewport).
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('Catalogs.view.main.Main', {
    // extend: 'Ext.panel.Panel',
    extend: 'Ext.container.Container',
    xtype: 'app-main',

    requires: [
        'Ext.plugin.Viewport',
        'Ext.window.MessageBox',

        'Catalogs.view.main.MainController',
        'Catalogs.view.main.MainModel',
        'Catalogs.view.main.List',
        'Catalogs.view.main.tree'
    ],
    controller: 'main',
    viewModel: 'main',
    plugins: 'viewport',
    // width: 1000,
    // height: 500,
    // layout: 'hbox',
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    listeners:{
        afterRender: 'teste'
    },
    items: [
        {
            xtype: 'toolbar',
            cls: 'des-portal-headerbar toolbar-btn-shadow',
            height: 52,
            itemId: 'headerBar',
            items: [
                {
                    xtype: 'component',
                    cls: 'des-portal-logo',
                    bind: {
                        html: '<div class="main-logo"><img src="{desPortalLogo}">{name}</div>'
                    }
                }
            ]
        },{
            xtype: 'container',
            flex: 1,
            reference: 'mainCardPanel',
            layout: {
                type: 'card',
                anchor: '100%'
            },
            items : [{
                xtype: 'panel',
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    },
                items: [{
                    width: 250,
                    margin: '0 2 0 0',
                    // title: '&nbsp;',
                    collapsible : true,
                    collapseDirection : 'left',        
                    reference: 'treelista',        
                    xtype: 'maintree',
                    split: true,
                    resizable : true,
                    layout: 'fit'

                       
                },{
                    // region: 'center',
                    // width: 500,
                    flex: true,
                    frame: true,
                    // height: '100%',
                    reference: 'catalogs',
                    xtype: 'mainlist'        
                }]
            }]
        }
    ]
    
});
