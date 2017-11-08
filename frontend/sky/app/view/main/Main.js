/**
 * This class is the main view for the application. It is specified in app.js as the
 * "mainView" property. That setting automatically applies the "viewport"
 * plugin causing this view to become the body element (i.e., the viewport).
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('Sky.view.main.Main', {
    extend: 'Ext.container.Container',
    xtype: 'app-main',

    requires: [
        'Ext.plugin.Viewport',
        'Ext.window.MessageBox',
        'Ext.layout.container.Card',
        'Ext.layout.container.Border',
        'Sky.view.main.MainController',
        'Sky.view.main.MainModel',
        'Sky.view.search.SearchField',
        'common.header.Toolbar',
        'common.footer.Footer'
    ],

    controller: 'main',

    viewModel: 'main',

    plugins: 'viewport',

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    items: [
        {
            xtype: 'dri-header-sky',
            reference: 'driHeaderSky',
            listeners: {
                dosearch: 'doSearch',
                changeCoordinateSystem: 'changeCoordinateSystem'
            }
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
