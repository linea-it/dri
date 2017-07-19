Ext.define('Target.view.preview.Preview', {
    extend: 'Ext.panel.Panel',

    requires: [
        'Target.view.preview.PreviewController',
        'Target.view.preview.PreviewModel',
        'Target.view.preview.Visiomatic',
        'Ext.ux.rating.Picker'
    ],

    xtype: 'targets-preview',

    controller: 'preview',

    viewModel: 'preview',

    config: {
        currentRecord: null
    },

    layout: 'fit',

    items: [
        {
            xtype: 'targets-visiomatic',
            reference: 'visiomatic',
            bind: {
                showCrosshair: '{BtnCrosshair.pressed}'
            },
            listeners: {
                objectMenuItemClick: 'onObjectMenuItemClickVisiomatic',
                imageMenuItemClick : 'onImageMenuItemClickVisiomatic'
            }
        }
    ],
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'top',
        items: [
            {
                xtype: 'combobox',
                reference: 'currentDataset',
                publishes: 'id',
                width: 250,
                displayField: 'release_tag',
                bind: {
                    store: '{datasets}',
                    disabled: '{!currentRecord._meta_id}',
                    selection: '{!currentDataset}'
                },
                queryMode: 'local',
                listConfig: {
                    itemTpl: [
                        '<div data-qtip="{release_display_name} - {tag_display_name}">{release_display_name} - {tag_display_name}</div>'
                    ]
                },
                listeners: {
                    change: 'onChangeDataset'
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
    },
    {
        xtype: 'toolbar',
        dock: 'top',
        items: [
            {
                xtype: 'checkboxfield',
                reference: 'btnReject',
                hideLabel: true,
                boxLabel: 'Reject',
                bind: {
                    value: '{currentRecord._meta_reject}',
                    disabled: '{!currentRecord._meta_id}'
                }
            },
            {
                xtype: 'tbtext',
                html: 'Rating'
            },
            {
                xtype: 'numberfield',
                maxValue: 5,
                minValue: 0,
                width: 50,
                bind: {
                    value: '{currentRecord._meta_rating}'
                }
            },
            {
                xtype: 'button',
                text: 'Explorer',
                tooltip: 'See more information about this object in Explorer app',
                ui: 'soft-blue',
                iconCls: 'x-fa fa-info-circle',
                handler: 'onExplorer'
            },
            /*{
                xtype: 'button',
                iconCls: 'x-fa fa-comments',
                bind: {
                    disabled: '{!currentRecord._meta_id}'
                },
                handler: 'onComment'
            },*/

            '-',
            {
                xtype: 'button',
                iconCls: 'x-fa fa-arrows',
                tooltip: 'Center',
                handler: 'onCenterTarget'
            },
            {
                xtype: 'button',
                iconCls: 'x-fa fa-crosshairs',
                tooltip: 'Show/Hide Crosshair',
                enableToggle: true,
                pressed: true,
                reference: 'BtnCrosshair'
            },
            {
                xtype: 'button',
                reference: 'btnComments',
                iconCls: 'x-fa fa-comments',
                enableToggle: true,
                toggleHandler: 'showHideComments',
                tooltip: 'Show/Hide Comments',
                pressed: true,
                hidden: true
            },
            '-',
            {
                xtype: 'button',
                reference: 'btnRadius',
                iconCls: 'x-fa fa-circle-o',
                tooltip: 'Show System Radius',
                enableToggle: true,
                toggleHandler: 'showHideRadius',
                pressed: true,
                hidden: true
            },
            {
                xtype: 'button',
                reference: 'btnMembers',
                iconCls: 'x-fa fa-dot-circle-o',
                tooltip: 'Show System Members',
                enableToggle: true,
                toggleHandler: 'showHideMembers',
                pressed: true,
                hidden: true
            }
        ]
    }],

    setCurrentRecord: function (record, catalog) {
        var me = this,
            vm = me.getViewModel();

        // Setar o currentRecord no Painel
        me.currentRecord = record;

        // Setar o currentRecord no viewModel
        vm.set('currentRecord', record);

        // Setar o catalogo
        vm.set('currentCatalog', catalog);

        // Declarando se o Catalogo exibe single objects ou sistemas.
        vm.set('is_system', catalog.get('pcl_is_system'));

        // disparar evento before load
        me.fireEvent('changerecord', record, me);
    }

});
