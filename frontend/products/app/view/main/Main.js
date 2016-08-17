/**
 * This class is the main view for the application. It is specified in app.js as the
 * "mainView" property. That setting automatically applies the "viewport"
 * plugin causing this view to become the body element (i.e., the viewport).
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('Products.view.main.Main', {
    extend: 'Ext.container.Container',
    xtype: 'app-main',

    requires: [
        'Products.view.main.ComboType',
        'Products.view.main.MainController',
        'Products.view.main.MainModel',
        'Products.view.main.Products',
        'Products.view.main.ComboBand',
        'Products.view.main.ComboBand'
    ],
    controller: 'main',
    viewModel: 'main',
    layout: {
        type: 'vbox',
        align: 'stretch'
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
            xtype: 'panel',
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items:[{
                xtype: 'comboRelease',
                reference: 'releasefield'
                // listeners: {
                //     select: 'onSelectReleaseField'
                //     //deselect: 'onDeselectReleaseField'
                // }
            },{
                xtype: 'comboDataset',
                reference: 'releasefield',
                margin: '0 0 0 20'
                // listeners: {
                //     select: 'onSelectReleaseField'
                //     //deselect: 'onDeselectReleaseField'
                // }
            },{
                xtype: 'comboType',
                margin: '0 0 0 20',
                reference: 'type'
                // listeners: {
                //     select: 'onSelectType'
                //     //deselect: 'onDeselectReleaseField'
                // }
            },{
                xtype: 'comboBand',
                margin: '0 0 0 20',
                reference: 'bands'
                // listeners: {
                //     select: 'onSelectBand'
                //     //deselect: 'onDeselectReleaseField'
                // }
            },{
                xtype: 'button',
                margin: '0 10 0 10',
                text: 'Clear Filters',
                handler : 'clearFilters'
            }]
            
            
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
                        type: 'vbox',
                        align: 'stretch'
                    },
                items: [{
                    // region: 'center',
                    // width: 500,
                    flex: true,
                    frame: true,
                    // height: '100%',
                    reference: 'catalogs',
                    xtype: 'mainlist'        
                }
                // ,{
                //     // region: 'center',
                //     // width: 500,
                //     flex: true,
                //     frame: true,
                //     // height: '100%',
                //     reference: 'provenance',
                //     xtype: 'provenancepanel'        
                // }
                ]
            }]
        }
    ]

});

