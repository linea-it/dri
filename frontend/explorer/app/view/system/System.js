Ext.define('Explorer.view.system.System', {
    extend: 'Ext.panel.Panel',

    xtype: 'system',

    requires: [
        'Ext.layout.container.Border',
        'Explorer.view.system.SystemController',
        'Explorer.view.system.SystemModel',
        'Explorer.view.system.Form',
        'Explorer.view.system.Properties',
        'Explorer.view.system.Visiomatic',
        'Explorer.view.system.Aladin',
        'Explorer.view.system.MembersGrid',
        'Explorer.view.system.VacGrid',
        'Explorer.view.system.SpatialDistribution',
        'Explorer.view.system.ZDistribution',
        'Explorer.view.system.MagDistribution',
        'Explorer.view.system.cmd.CmdTab'
    ],

    controller: 'system',

    viewModel: 'system',

    layout: 'fit',

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            layout: 'border',
            defaults: {
                frame: true
            },
            items: [
                // Painel Esquerdo
                {
                    xtype: 'panel',
                    region: 'west',
                    width: 300,
                    margin: '0 10 0 0',
                    // split: true,
                    collapsible: true,
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
                    region: 'center',
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
                            flex:1,
                            split: true,
                            layout: {
                                type: 'hbox',
                                pack: 'start',
                                align: 'stretch'
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
                                        store: '{members}',
                                        selection: '{selected_member}'
                                    },
                                    listeners: {
                                        select: 'onSelectSystemMember'
                                    }
                                },
                                {
                                    xtype: 'system-vac-grid',
                                    title: 'VAC',
                                    reference: 'vac-grid',
                                    bind: {
                                        store: '{vacObjects}',
                                        inputVac: '{vacCluster}'
                                    },
                                    listeners: {
                                        select: 'onSelectVacObject'
                                    }
                                },
                                // {
                                //     xtype: 'system-vac-grid',
                                //     title: 'VAC',
                                //     reference: 'vac-grid',
                                //     bind: {
                                //         store: '{vacObjects}',
                                //     },
                                //     listeners: {
                                //         select: 'onSelectVacObject'
                                //     }
                                // },
                                {
                                    xtype: 'panel',
                                    title: 'Properties Distribution',
                                    layout: {
                                        type: 'hbox',
                                        pack: 'start',
                                        align: 'stretch'
                                    },
                                    bind: {
                                        disabled: "{!have_members}"
                                    },
                                    items: [
                                        {
                                            xtype: 'system-z-distribution',
                                            flex: 1,
                                            bind: {
                                                store: "{members}",
                                            }
                                        },
                                        {
                                            xtype: 'system-mag-distribution',
                                            flex: 1,
                                            bind: {
                                                store: "{members}",
                                            }
                                        }
                                    ]
                                },
                                {
                                    xtype: 'panel',
                                    title: 'Spatial Distribution',
                                    layout: 'center',
                                    bind: {
                                        disabled: "{!have_vac}"
                                    },
                                    items: [
                                        {
                                            xtype: 'system-spatial-distribution',
                                            width: 600,
                                            height: '100%',
                                            reference: "densityMap"
                                        }
                                    ],
                                    listeners: {
                                        activate: 'onActiveSpatialTab',
                                    }
                                },
                                {
                                    xtype: 'cmd-tab',
                                    title: 'CMD',
                                    reference: 'CmdTab',
                                    flex: 1,
                                    scrollable: true,
                                    bind: {
                                        disabled: "{!have_members}"
                                    },
                                    listeners: {
                                        activate: 'onActiveCmdTab',
                                        clickpoint: 'onCmdClickPoint'
                                    }
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
