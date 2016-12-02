Ext.define('Explorer.view.coadd.Coadd', {
    extend: 'Ext.panel.Panel',

    xtype: 'coadd-objects',

    requires: [
        'Explorer.view.coadd.CoaddController',
        'Explorer.view.coadd.CoaddModel',
        'Explorer.view.coadd.Properties',
        'Explorer.view.coadd.Visiomatic',
        'Explorer.view.coadd.Aladin'
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
                    xtype: 'coadd-properties',
                    reference: 'properties-grid',
                    width: 400,
                    margin: '0 10 0 0'
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
                            height: 400,
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
                                    // width: 500,
                                    margin: '0 10 0 0',
                                    split: true,
                                    flex: 1
                                },
                                {
                                    xtype: 'coadd-aladin',
                                    reference: 'aladin',
                                    // width: 500,
                                    split: true,
                                    flex: 1
                                }
                            ]
                        },
                        // Painel Direito Inferior
                        {
                            xtype: 'panel',
                            title: 'Inferior',
                            flex: 1
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
