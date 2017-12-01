Ext.define('Explorer.view.system.Visiomatic', {
    extend: 'visiomatic.Visiomatic',

    requires: [
        'visiomatic.Visiomatic'
    ],

    xtype: 'system-visiomatic',

    enableTools: true,

    enableLink: false,

    enableShift: false,

    showCrosshair: true,

    mapOptions: {
        fullscreenControl: true,
        zoom: 1,
        enableLineaOverlay: false
    },

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            auxTools:[
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
                },
                {
                    xtype: 'button',
                    iconCls: 'x-fa fa-crosshairs',
                    tooltip: 'Show/Hide Crosshair',
                    enableToggle: true,
                    pressed: true,
                    scope: this,
                    toggleHandler: 'onShowHideCrosshair'
                }
            ]
        });

        me.callParent(arguments);
    },

    changeDataset: function (combo) {
        this.fireEvent('changedataset', combo.getSelectedRecord(), this);

    },

    onShowHideCrosshair: function (btn, state) {
        var me = this;

        me.setShowCrosshair(state);
    }

});
