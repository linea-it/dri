Ext.define('Explorer.view.star_cluster.StarCluster', {
    extend: 'Ext.panel.Panel',

    xtype: 'star_cluster',

    requires: [
        'Ext.layout.container.Border',
        'Explorer.view.star_cluster.StarClusterController',
        'Explorer.view.star_cluster.StarClusterModel',
        'Explorer.view.star_cluster.Form',
        'Explorer.view.star_cluster.Properties',
        'Explorer.view.star_cluster.Visiomatic',
        'Explorer.view.star_cluster.Aladin',
        'Explorer.view.star_cluster.MembersGrid',
        'Explorer.view.star_cluster.SpatialDistribution',
        'Explorer.view.star_cluster.ZDistribution',
        'Explorer.view.star_cluster.MagDistribution',
        'Explorer.view.star_cluster.cmd.CmdTab'
    ],

    controller: 'star_cluster',

    viewModel: 'star_cluster',

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
                    items: [
                        // Superior Esquerdo
                        {
                            xtype: 'star_cluster-form',
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
                            xtype: 'star_cluster-properties',
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
                            flex: 1,
                            split: true,
                            layout: {
                                type: 'hbox',
                                pack: 'start',
                                align: 'stretch'
                            },
                            items: [
                                {
                                    xtype: 'star_cluster-visiomatic',
                                    reference: 'visiomatic',
                                    margin: '0 10 0 0',
                                    split: true,
                                    flex: 1
                                },
                                {
                                    xtype: 'star_cluster-aladin',
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
                                    xtype: 'panel',
                                    title: 'Plots',
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
                                            xtype: 'star_cluster-z-distribution',
                                            flex: 1,
                                            bind: {
                                                store: "{members}",
                                            }
                                        },
                                        {
                                            xtype: 'star_cluster-mag-distribution',
                                            flex: 1,
                                            bind: {
                                                store: "{members}",
                                            }
                                        }
                                    ]
                                },
                                {
                                    xtype: 'star_cluster-members-grid',
                                    title: 'Cluster Members',
                                    reference: 'members-grid',
                                    bind: {
                                        store: '{members}',
                                        selection: '{selected_member}'
                                    },
                                    listeners: {
                                        select: 'onSelectstar_clusterMember'
                                    }
                                },
                                // {
                                //     xtype: 'panel',
                                //     title: 'Spatial Distribution',
                                //     layout: 'center',
                                //     bind: {
                                //         disabled: "{!have_vac}"
                                //     },
                                //     items: [
                                //         {
                                //             xtype: 'star_cluster-spatial-distribution',
                                //             width: 600,
                                //             height: '100%',
                                //             reference: "densityMap"
                                //         }
                                //     ],
                                //     listeners: {
                                //         activate: 'onActiveSpatialTab',
                                //     }
                                // },
                                // {
                                //     xtype: 'star_cluster-cmd-tab',
                                //     title: 'CMD',
                                //     reference: 'CmdTab',
                                //     flex: 1,
                                //     scrollable: true,
                                //     bind: {
                                //         disabled: "{!have_members}"
                                //     },
                                //     listeners: {
                                //         activate: 'onActiveCmdTab',
                                //         clickpoint: 'onCmdClickPoint'
                                //     }
                                // }
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
