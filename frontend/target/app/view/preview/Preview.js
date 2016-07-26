Ext.define('Target.view.preview.Preview', {
    extend: 'Ext.panel.Panel',

    requires: [
        'Target.view.preview.PreviewController',
        'Target.view.preview.PreviewModel',
        'Target.view.preview.Visiomatic'
    ],

    xtype: 'targets-preview',

    controller: 'preview',

    viewModel: 'preview',

    config: {
        currentRecord: null
    },

    items: [
        {
            xtype: 'targets-visiomatic',
            reference: 'visiomatic'
        }
    ],

    tbar: [
        {
            xtype: 'combobox',
            reference: 'currentDataset',
            publishes: 'id',
            width: 300,
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
        }, {
            xtype: 'tbtext',
            bind: {
                html: '{currentDataset.tli_tilename}'
            }
        }, {
            xtype: 'button',
            iconCls: 'x-fa fa-crosshairs',
            tooltip: 'Center',
            handler: 'onCenterTarget'
        }
    ],

    setCurrentRecord: function (record) {
        var me = this,
            vm = me.getViewModel();

        // Setar o currentRecord no Painel
        me.currentRecord = record;

        // Setar o currentRecord no viewModel
        vm.set('currentRecord', record);

        // disparar evento before load
        me.fireEvent('changerecord', record, me);
    }

});
