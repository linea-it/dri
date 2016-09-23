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
        'Home.view.pages.Home',
        'Home.view.pages.Release',
        'Home.view.pages.Template'

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
            align: 'stretch'
            // overflowHandler: 'none'
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
            scrollable : {
                direction: 'vertical'
            },
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
        items: [{
            xtype: 'pages-home'
        }]
    }],
    addMenu: function (store) {
        var me = this;
        store.each(function(record){
            console.log(record)
            var page = Ext.create('Home.view.pages.Template', {
                data: {
                    host: 'http://desportal.cosmology.illinois.edu/dri/apps/',
                    pageTitle: record.get('app_display_name'),
                    appURL: record.get('app_url'),
                    imageUrl: record.get('app_icon_src'),
                    paragrafo1: record.get('app_short_description'),
                    paragrafo2: record.get('app_long_description'),
                }
            })

            me.add({
                title: record.get('app_display_name'),
                iconCls: record.get('app_icon_cls'),
                disabled: record.get('app_disabled'),
                items: [page]
            })
            // me.items.push(record.data)          
        },this);
    },
    initComponent: function(){
        var me = this;
        var pluginExpanded = true;
        var store = Ext.create('home.store.Menu');
        
        // me.addMenu(store)
        store.load({
            callback: function (records, options, success) {
                if (success) {
                    console.log(store)
                    me.addMenu(store)
                }
            }
        });
        this.callParent();
    },

    // items: [{
    //     title: 'Home',
    //     iconCls: 'fa-home',
    //     items: [{
    //         xtype: 'pages-home'
    //     }]
    // }, {
    //     title: 'Releases',
    //     iconCls: 'fa-check',
    //     items: [{
    //         xtype: 'pages-release'
    //     }],
    //     disabled: true
    // },{
    //     title: 'Sky Viewer',
    //     iconCls: 'fa-star',
    //     items: [{
    //         xtype: 'pages-sky'
    //     }]
    // },{
    //     title: 'Tile Viewer',
    //     iconCls: 'fa-th',
    //     hidden: true,
    //     bind: {
    //         html: '{loremIpsum}'
    //     }
    // },{
    //     title: 'Target Viewer',
    //     iconCls: 'fa-dot-circle-o',
    //     items: [{
    //         xtype: 'pages-target'
    //     }],
    //     disabled: true
    // },{
    //     title: 'Sky Query',
    //     iconCls: 'fa-database',
    //     bind: {
    //         html: '{loremIpsum}'
    //     },
    //     disabled: true
    // },{
    //     title: 'Upload',
    //     iconCls: 'fa-upload',
    //     bind: {
    //         html: '{loremIpsum}'
    //     },
    //     disabled: true
    // },{
    //     title: 'Cutout Server',
    //     iconCls: 'fa-picture-o',
    //     bind: {
    //         html: '{loremIpsum}'
    //     },
    //     disabled: true
    // }
    // // {
    // //     title: 'Science Products',
    // //     iconCls: 'fa-leanpub',
    // //     bind: {
    // //         html: '{loremIpsum}'
    // //     },
    // //     disabled: true
    // // }
    // ]
});
