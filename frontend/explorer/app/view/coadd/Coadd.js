Ext.define('Explorer.view.coadd.Coadd', {
    extend: 'Ext.panel.Panel',

    xtype: 'coadd-objects',

    requires: [
        'Explorer.view.coadd.CoaddController',
        'Explorer.view.coadd.CoaddModel',
        'Explorer.view.coadd.Form',
        'Explorer.view.coadd.Properties',
        'Explorer.view.coadd.Visiomatic',
        'Explorer.view.coadd.Aladin',
        'Explorer.view.coadd.SpectralDistribution',
        'Ext.window.MessageBox'
    ],

    controller: 'coadd',

    viewModel: 'coadd',

    layout: 'fit',

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            layout: {
                type: 'hbox',
                pack: 'start',
                align: 'stretch'
            },
            defaults: {
                frame: true
            },
            items: [
                // Painel Esquerdo
                {
                    xtype: 'panel',
                    reference: 'detailPanel',
                    width: 300,
                    margin: '0 10 0 0',
                    layout: {
                        type: 'vbox',
                        pack: 'start',
                        align: 'stretch'
                    },
                    items: [
                        // Superior Esquerdo
                        {
                            xtype: 'coadd-form',
                            reference: 'properties-form',
                            split: true,
                            bbar: [
                                {
                                    xtype: 'button',
                                    text: 'SIMBAD',
                                    handler: 'onClickSimbad'
                                },
                                {
                                    xtype: 'button',
                                    text: 'NED',
                                    handler: 'onClickNed'
                                },
                                {
                                    xtype: 'button',
                                    text: 'VizieR',
                                    handler: 'onClickVizier'
                                }
                            ]
                        },
                        // Inferior Esquerdo
                        {
                            xtype: 'coadd-properties',
                            reference: 'properties-grid',
                            split: true,
                            flex: 1
                        }
                    ],
                },
                // Painel Direito
                {
                    xtype: 'panel',
                    flex: 1,
                    layout: {
                        type: 'vbox',
                        pack: 'start',
                        align: 'stretch'
                    },
                    margin: '0 0 10 0',
                    defaults: {
                        frame: true
                    },
                    items: [
                        // Painel Direito Superior
                        {
                            xtype: 'panel',
                            // title: 'Superior',
                            flex: 1,
                            //height: 500,
                            layout: {
                                type: 'hbox',
                                pack: 'start',
                                align: 'stretch'
                            },
                            defaults: {
                                frame: true
                            },
                            items: [
                                {
                                    xtype: 'coadd-visiomatic',
                                    reference: 'visiomatic',
                                    margin: '0 10 0 0',
                                    split: true,
                                    flex: 1
                                },
                                {
                                    xtype: 'coadd-aladin',
                                    reference: 'aladin',
                                    split: true,
                                    flex: 1,
                                    bind: {
                                        storeSurveys: '{surveys}',
                                        storeTags: '{tags}',
                                        storeTiles: '{tiles}'
                                    },
                                }
                            ]
                        },
                        // Painel Direito Inferior
                        {
                            xtype: 'panel',
                            flex: 1,
                            layout: {
                                type: 'hbox',
                                pack: 'start',
                                align: 'stretch'
                            },
                            items: [
                                {
                                    xtype: 'coadd-spectral-distribution',
                                    reference: 'SpectralChart',
                                    flex: 1,
                                    bind: {
                                        store: '{spectral}'
                                    }
                                },
                                {
                                    xtype: 'panel',
                                    flex: 1
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        me.callParent(arguments);
    },

    loadPanel: function (arguments) {
        var me = this,
            vm = me.getViewModel(),
            source = arguments[1],
            object_id = arguments[2];

        vm.set('source', source);

        vm.set('object_id', object_id);

        me.fireEvent('loadpanel', source, object_id, me);

    },

    updatePanel: function (arguments) {

    }

});
