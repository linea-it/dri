/**
 * This class is the main view for the application. It is specified in app.js as the
 * "mainView" property. That setting automatically applies the "viewport"
 * plugin causing this view to become the body element (i.e., the viewport).
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('Explorer.view.main.Main', {
    extend: 'Ext.container.Container',
    xtype: 'app-main',

    requires: [
        'Ext.plugin.Viewport',
        'Ext.window.MessageBox',

        'Explorer.view.main.MainController',
        'Explorer.view.main.MainModel',

        'common.header.Toolbar',
        'common.footer.Footer',

        'Explorer.view.coadd.Coadd',
        'Explorer.view.system.System',
        'Explorer.view.star_cluster.StarCluster'
    ],

    controller: 'main',
    viewModel: 'main',

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    items: [
        {
            xtype: 'dri-header'
        },
        {
            xtype: 'container',
            flex: 1,
            reference: 'mainCardPanel',
            layout: {
                type: 'card',
                anchor: '100%'
            }
        },
        {
            xtype: 'dri-footer'
        }
    ]
});
