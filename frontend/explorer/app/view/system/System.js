Ext.define('Explorer.view.system.System', {
    extend: 'Ext.panel.Panel',

    xtype: 'system',

    requires: [
        'Explorer.view.system.SystemController',
        'Explorer.view.system.SystemModel',
        'Explorer.view.system.Form',
        'Explorer.view.system.Properties',
        'Explorer.view.system.Visiomatic',
        'Explorer.view.system.Aladin',
        'Explorer.view.system.MembersGrid',
        'Explorer.view.system.SpacialDistribution',
        'Explorer.view.system.ZMagDistribution'
    ],

    controller: 'system',

    viewModel: 'system',

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
                    width: 300,
                    margin: '0 10 0 0',
                    split: true,
                    reference: 'detailPanel',
                    layout: {
                        type: 'vbox',
                        pack: 'start',
                        align: 'stretch'
                    },
                    items:[
                        // Superior Esquerdo
                        {
                            xtype: 'system-form',
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
                                }
                                // {
                                //     xtype: 'button',
                                //     text: 'VizieR',
                                //     handler: 'onClickVizier'
                                // }
                            ]
                        },
                        // Inferior Esquerdo
                        {
                            xtype: 'system-properties',
                            reference: 'properties-grid',
                            split: true,
                            flex: 1
                        }
                    ]
                },
                // Painel Direito
                {
                    xtype: 'panel',
                    flex: 1,
                    split: true,
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
                            height: 300,
                            split: true,
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
                                    xtype: 'system-visiomatic',
                                    reference: 'visiomatic',
                                    margin: '0 10 0 0',
                                    split: true,
                                    flex: 1
                                },
                                {
                                    xtype: 'system-aladin',
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
                            xtype: 'tabpanel',
                            flex: 1,
                            split: true,
                            items: [
                                {
                                    xtype: 'system-members-grid',
                                    title: 'System Members',
                                    reference: 'members-grid',
                                    bind: {
                                        store: '{members}'
                                    },
                                    listeners: {
                                        select: 'onSelectSystemMember'
                                    }
                                },
                                {
                                    // xtype: 'system-spacial-distribution',
                                    xtype: 'system-zmag-distribution',
                                    title: 'z and Mag Distribution',
                                    bind: {
                                        store: "{members}",
                                        disabled: "{!have_members}"
                                    }
                                },
                                {
                                    xtype: 'system-spacial-distribution',
                                    title: 'Spacial Distribution',
                                    bind: {
                                        // store: "{members}",
                                        disabled: "{!have_members}"
                                    }
                                },
                                {
                                    // xtype: 'system-spacial-distribution',
                                    xtype: 'panel',
                                    title: 'CMD',
                                    bind: {
                                        // store: "{members}",
                                        disabled: "{!have_members}"
                                    }
                                },
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
