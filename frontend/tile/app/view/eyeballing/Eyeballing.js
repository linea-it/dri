Ext.define('Tile.view.eyeballing.Eyeballing', {
    extend: 'Ext.panel.Panel',

    xtype: 'eyeballing',

    requires: [
        'Tile.view.eyeballing.EyeballingController',
        'Tile.view.eyeballing.EyeballingModel',
        'Tile.view.eyeballing.Aladin',
        'Tile.view.eyeballing.Thumb',
        'Tile.view.eyeballing.Defects'
    ],

    controller: 'eyeballing',

    viewModel: 'eyeballing',

    config: {
        /**
         * Id release
         * @type {integer}
         */
        release: null
    },

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            items: [
                {
                    xtype: 'panel',
                    layout: 'border',
                    items: [
                        {
                            xtype: 'eyeballing-aladin',
                            reference: 'aladin',
                            region: 'center',
                            bind: {
                                storeSurveys: '{surveys}',
                                storeTags: '{tags}',
                                storeTiles: '{tiles}'
                            }
                        },
                        {
                            xtype: 'eyeballing-defects',
                            reference: 'defects',
                            region: 'east',
                            width: 220,
                            store: Ext.create('Tile.store.Features', {
                                listeners: {
                                    scope: me.getController(),
                                    update: 'onUpdateDefectGrid'
                                }
                            }),
                            tbar: [
                                {
                                    xtype: 'button',
                                    iconCls: 'x-fa fa-exclamation-triangle',
                                    text: 'Flag',
                                    tooltip: 'Flag/Unflag',
                                    enableToggle: true,
                                    toggleHandler: 'onFlagDataset',
                                    bind: {
                                        pressed: '{flagged.flg_flagged}'
                                    }
                                }
                            ]
                        },
                        {
                            xtype: 'eyeballing-thumb',
                            reference: 'thumb',
                            // region: 'east',
                            // width: 180,
                            resizable: true,
                            region: 'south',
                            height: 190,
                            bind: {
                                dataset: '{currentDataset}'
                            },
                            listeners: {
                                changefilter: 'onClickThumb'
                            }

                        }
                    ]
                }
            ],
            dockedItems: [
                {
                    xtype: 'toolbar',
                    dock: 'top',
                    layout: {
                        type:'hbox',
                        align:'stretch'
                    },
                    items:[

                    ]
                }
            ]

        });

        me.callParent(arguments);
    },

    loadPanel: function () {
        this.fireEvent('loadpanel', this);

    },

    updatePanel: function () {
        this.fireEvent('updatePanel', this);

    },

    setRelease: function (release) {
        var me = this,
            vm = me.getViewModel();

        if (release > 0) {
            me.release = release;

            vm.set('release', release);

            me.fireEvent('changerelease', release, me);
        }
    }

});
