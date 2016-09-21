/**
 * This class is the main view for the application. It is specified in app.js as the
 * "mainView" property. That setting automatically applies the "viewport"
 * plugin causing this view to become the body element (i.e., the viewport).
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('common.header.Toolbar', {
    extend: 'Ext.toolbar.Toolbar',

    requires: [
        'common.ToolbarController'
    ],

    xtype: 'dri-header',

    controller: 'toolbar',

    cls: 'des-portal-headerbar toolbar-btn-shadow',

    height: 52,

    layout: {
        type: 'hbox',
        align: 'middle'
    },

    viewModel: {
        data: {
            // name: '',
            home: '',
            desPortalLogo: 'resources/des-portal-logo.png',
            tooltip: 'Home page of Science Server',
            username: ''
        }
    },

    items: [
        {
            xtype: 'component',
            cls: 'des-portal-logo',
            bind: {
                html: '<a href=\"{home}\">' +
                           '<img border="0" alt="Home" src="{desPortalLogo}" title="{tooltip}">' +
                        '</a>'
            }
        }, {
            xtype: 'component',
            cls: 'des-portal-appname',
            bind: {
                html: '{name}'
            },
            flex: 1
        },
        '->',
        {
            xtype: 'button',
            iconCls: 'x-fa fa-home',
            cls: 'delete-focus-bg',
            scale: 'medium',
            handler: 'projectHome',
            tooltip: 'Home of the Science Server'
        },
        {
            xtype: 'button',
            cls: 'delete-focus-bg',
            arrowVisible: false,
            // scale: 'large',
            scale: 'medium',
            bind: {
                text: '{username}'
            },
            menu: [{
                text: 'Log out',
                iconCls: 'x-fa fa-sign-out',
                handler: 'logout'
            }]

        }
    ],

    afterRender: function () {
        var me = this,
            href = window.location.href,
            host;

        host = href.split('#')[0];
        me.getViewModel().set('home', host);

        if (window.sessionStorage.dri_username != 'undefined') {
            me.getViewModel().set('username', window.sessionStorage.dri_username);
        }

        me.callParent(arguments);
    }
});
