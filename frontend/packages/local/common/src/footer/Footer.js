/**
 * This class is the main view for the application. It is specified in app.js as the
 * "mainView" property. That setting automatically applies the "viewport"
 * plugin causing this view to become the body element (i.e., the viewport).
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('common.footer.Footer', {
    extend: 'Ext.toolbar.Toolbar',

    requires: [
        'common.footer.FooterController',
        'common.contact.Contact'
    ],

    xtype: 'dri-footer',

    controller: 'footer',

    cls: 'des-portal-footer',

    height: 28,

    // layout: {
    //     type: 'hbox',
    //     align: 'middle'
    // },
    layout: {
        pack: 'center',
        align: 'middle'
    },

    viewModel: {
        data: {
            // about: 'http://www.linea.gov.br'
        }
    },

    items: [
        // {
        //     xtype: 'tbtext',
        //     html: 'Science Server',
        //     cls: 'des-portal-footer-text'
        // },
        {
            xtype: 'tbtext',
            html: 'Powered by LIneA | Dark Energy Survey',
            cls: 'des-portal-footer-text'
        }
        // '->',
        // {
        //     xtype: 'button',
        //     text: 'About LIneA',
        //     cls: 'delete-focus-bg',
        //     ui: 'footer-white-toolbar',
        //     bind: {
        //         href: '{about}'
        //     }
        // }
        // {
        //     xtype: 'button',
        //     text: 'Contact',
        //     cls: 'delete-focus-bg',
        //     ui: 'footer-white-toolbar',
        //     handler: 'onClickContact'
        // }
    ]

    // afterRender: function () {
    //     var me = this,
    //         href = window.location.href,
    //         host;

    //     host = href.split('#')[0];
    //     me.getViewModel().set('home', host);

    //     if (window.sessionStorage.dri_username != 'undefined') {
    //         me.getViewModel().set('username', window.sessionStorage.dri_username);
    //     }

    //     me.callParent(arguments);
    // }
});
