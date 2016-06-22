/**
 * This class is the main view for the application. It is specified in app.js as the
 * "mainView" property. That setting automatically applies the "viewport"
 * plugin causing this view to become the body element (i.e., the viewport).
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('common.header.Toolbar', {
    extend: 'Ext.toolbar.Toolbar',
    xtype: 'dri-header',

    cls: 'des-portal-headerbar toolbar-btn-shadow',

    height: 52,

    viewModel: {
        data: {
            // name: '',
            home: '',
            desPortalLogo: 'resources/des-portal-logo.png'
        }
    },

    items: [
        {
            xtype: 'component',
            cls: 'des-portal-logo',
            bind: {
                html: '<a href=\"{home}\">' +
                           '<img border="0" alt="Home" src="{desPortalLogo}">' +
                        '</a>'
            }
        }, {
            xtype: 'component',
            cls: 'des-portal-appname',
            bind: {
                html: '<div>{name}</div>'
            }
        }
    ],

    afterRender: function () {
        var me = this,
            host = window.location.host,
            home;

        home = Ext.String.format('http://{0}', host);

        me.getViewModel().set('home', home);

        me.callParent(arguments);
    }

});
