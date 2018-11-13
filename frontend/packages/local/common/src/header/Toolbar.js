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
        'common.data.proxy.Django',
        'common.ToolbarController',
        'common.contact.Contact',
        'common.help.Tutorials'
    ],

    xtype: 'dri-header',

    controller: 'toolbar',

    cls: 'des-portal-headerbar toolbar-btn-shadow',

    layout: {
        type: 'hbox',
        align: 'middle'
    },

    viewModel: {
        data: {
            // name: '', app Display name
            // internal_name: '', app internal name in Django application model
            home: '',
            desPortalLogo: 'resources/des-portal-logo.png',
            tooltip: 'Home',
            username: ''
        },
        stores: {
            tutorials: {
                fields: ['id', 'application', 'application_display_name', 'ttr_title', 'ttr_src', 'ttr_description'],
                remoteSort: true,
                remoteFilter: true,
                autoLoad: false,
                pageSize: 0,
                proxy: {
                    type: 'django',
                    url: '/dri/api/tutorial/'
                }
            }
        }
    },

    viewItems: function(){
        return [
            {
                xtype: 'component',
                cls: 'des-portal-logo',
                bind: {
                    html: '<a href=\"{home}\">' +
                            '<img border="0" alt="Home" src="{desPortalLogo}" title="{tooltip}">' +
                            '</a>'
                }
            },
            {
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
                cls: 'delete-focus-bg',
                ui: 'white-toolbar',
                scale: 'medium',
                itemId: 'btnusername',
                bind: {
                    text: '{username}'
                }
            },
            {
                xtype: 'button',
                iconCls: 'x-fa fa-home',
                ui: 'white-toolbar',
                cls: 'delete-focus-bg',
                scale: 'medium',
                handler: 'projectHome',
                tooltip: 'Home of the Science Server'

            },
            {
                xtype: 'button',
                reference: 'headermenu',
                iconCls: 'x-fa fa-bars',
                cls: 'delete-focus-bg',
                ui: 'white-toolbar',
                scale: 'medium',
                arrowVisible: false,
                menu: [
                    {
                        text: 'About LIneA',
                        handler: 'about'
                    },
                    {
                        text: 'Contact Us',
                        handler: 'contact'
                    },
                    {
                        text: 'Tutorials',
                        iconCls: 'x-fa fa-question-circle',
                        reference: 'headermenututorials',
                        disabled: true,
                        handler: 'tutorials'
                    },
                    {
                        text: 'Help',
                        iconCls: 'x-fa fa-question',
                        reference: 'headermenuhelp',
                        handler: 'onClickHelp'
                    },
                    '-',
                    {
                        text: 'Log out',
                        iconCls: 'x-fa fa-sign-out',
                        handler: 'logout'
                    }
                ]
            }
        ];
    },

    initComponent: function() {
        this.items = this.viewItems();
        this.callParent();
    },

    afterRender: function () {
        var me = this,
            href = window.location.href,
            host;

        host = href.split('#')[0];
        me.getViewModel().set('home', host);

        // if (window.sessionStorage.dri_username != 'undefined') {
        //     me.getViewModel().set('username', window.sessionStorage.dri_username);
        //     // me.down('#btnusername').setText(window.sessionStorage.dri_username);
        // }

        me.callParent(arguments);
    }
});
