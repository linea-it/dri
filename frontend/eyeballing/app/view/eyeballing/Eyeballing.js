Ext.define('Eyeballing.view.eyeballing.Eyeballing', {
    extend: 'Ext.panel.Panel',

    xtype: 'eyeballing',

    requires: [
        'Eyeballing.view.eyeballing.EyeballingController',
        'Eyeballing.view.eyeballing.EyeballingModel',
        'Eyeballing.view.eyeballing.Aladin',
        'Eyeballing.view.eyeballing.Thumb',
        'Eyeballing.view.eyeballing.Defects'
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
                            store: Ext.create('Eyeballing.store.Features', {
                                listeners: {
                                    scope: me.getController(),
                                    update: 'onUpdateDefectGrid'
                                }
                            }),
                            tbar: [
                                {
                                    xtype: 'button',
                                    iconCls: 'x-fa fa-exclamation-triangle',
                                    width: 80,
                                    // text: 'Flag',
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
                            xtype: 'panel',
                            layout: 'center',
                            resizable: true,
                            region: 'south',
                            height: 190,
                            items: [
                                {
                                    xtype: 'eyeballing-thumb',
                                    reference: 'thumb',
                                    width: '75%',
                                    bind: {
                                        dataset: '{currentDataset}'
                                    },
                                    listeners: {
                                        changefilter: 'onClickThumb'
                                    }

                                }
                            ]
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
