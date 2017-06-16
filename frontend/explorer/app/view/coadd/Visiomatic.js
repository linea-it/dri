Ext.define('Explorer.view.coadd.Visiomatic', {
    extend: 'visiomatic.Visiomatic',

    requires: [
        'visiomatic.Visiomatic'
    ],

    xtype: 'coadd-visiomatic',

    // controller: 'coadd',

    // viewModel: 'coadd',

    enableTools: false,

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            tbar: [
                {
                    xtype: 'combobox',
                    reference: 'cmbCurrentDataset',
                    publishes: 'id',
                    width: 250,
                    displayField: 'release_tag',
                    bind: {
                        store: '{datasets}',
                        disabled: '{!coadd.COADD_OBJECT_ID}',
                        selection: '{!currentDataset}'
                    },
                    queryMode: 'local',
                    listConfig: {
                        itemTpl: [
                            '<div data-qtip="{release_display_name} - {tag_display_name}">{release_display_name} - {tag_display_name}</div>'
                        ]
                    },
                    listeners: {
                        scope: this,
                        change: 'changeDataset'
                    }
                },
                {
                    xtype: 'textfield',
                    width: 120,
                    readOnly: true,
                    bind: {
                        value: '{currentDataset.tli_tilename}'
                    }
                }
            ]
        });

        me.callParent(arguments);
    },

    changeDataset: function (combo) {
        this.fireEvent('changedataset', combo.getSelectedRecord(), this);

    }

});
