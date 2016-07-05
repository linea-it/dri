/**
 * This class is the main view for the application. It is specified in app.js as the
 * "mainView" property. That setting automatically applies the "viewport"
 * plugin causing this view to become the body element (i.e., the viewport).
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('Home.view.main.Main', {
    extend: 'Ext.tab.Panel',
    xtype: 'app-main',

    requires: [
        'Ext.plugin.Viewport',
        'Ext.window.MessageBox',

        'Home.view.main.MainController',
        'Home.view.main.MainModel',
        'Home.view.pages.Sky',
        'Home.view.pages.Target',

    ],

    controller: 'main',
    viewModel: 'main',

    ui: 'navigation',

    tabBarHeaderPosition: 1,
    titleRotation: 0,
    tabRotation: 0,

    header: {
        layout: {
            align: 'stretchmax'
        },
        title: {
            bind: {
                text: '{name}'
            },
            flex: 0
        },
        iconCls: 'des-portal-logo-icon'
    },

    tabBar: {
        flex: 1,
        layout: {
            align: 'stretch',
            overflowHandler: 'none'
        }
    },

    responsiveConfig: {
        tall: {
            headerPosition: 'top'
        },
        wide: {
            headerPosition: 'left'
        }
    },

    defaults: {
        bodyPadding: 20,
        tabConfig: {
            plugins: 'responsive',
            responsiveConfig: {
                wide: {
                    iconAlign: 'left',
                    textAlign: 'left'
                },
                tall: {
                    iconAlign: 'top',
                    textAlign: 'center',
                    width: 250
                }
            }
        }
    },

    items: [{
        title: 'Home',
        iconCls: 'fa-home',
    }, {
        title: 'Sky Viewer',
        iconCls: 'fa-star',
        items: [{
            xtype: 'pages-sky'
        }]
    }, {
        title: 'Release Validation',
        iconCls: 'fa-eye',        
        items: [{
            xtype: 'pages-release'
        }]
    }, {
        title: 'Tile Viewer',
        iconCls: 'fa-th',
        bind: {
            html: '{loremIpsum}'
        }
    },{
        title: 'Target Viewer',
        iconCls: 'fa-dot-circle-o',
        items: [{
            xtype: 'pages-target'
        }]
    },{
        title: 'Sky Query',
        iconCls: 'fa-database',
        bind: {
            html: '{loremIpsum}'
        }
    },{
        title: 'Upload',
        iconCls: 'fa-upload',
        bind: {
            html: '{loremIpsum}'
        }
    },{
        title: 'Cutout Server',
        iconCls: 'fa-picture-o',
        bind: {
            html: '{loremIpsum}'
        }
    },{
        title: 'Catalogs',
        iconCls: 'fa-leanpub',
        bind: {
            html: '{loremIpsum}'
        }
    }]
});
