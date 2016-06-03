/**
 * This class is the main view for the application. It is specified in app.js as the
 * "mainView" property. That setting automatically applies the "viewport"
 * plugin causing this view to become the body element (i.e., the viewport).
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('Target.view.main.Main', {
    extend: 'Ext.container.Container',
    xtype: 'app-main',

    requires: [
        'Ext.plugin.Viewport',
        'Ext.window.MessageBox',

        'Target.view.main.MainController',
        'Target.view.main.MainModel',
        'Target.view.home.Home'

    ],

    controller: 'main',
    viewModel: 'main',

    plugins: 'viewport',

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
        },
        {
            xtype: 'container',
            flex: 1,
            reference: 'mainCardPanel',
            margin: '1 0 0 0',
            layout: {
                type: 'card',
                anchor: '100%'
            }
        }
    ]
});
