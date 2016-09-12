Ext.define('Sky.view.dataset.Compare', {
    extend: 'visiomatic.Visiomatic',

    xtype: 'sky-compare',

    requires: [
        'visiomatic.Visiomatic'
    ],

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            // enableShift: false,
            // enableLink: false,
            enableTools: false
            // auxTools: [
            //     {
            //         xtype: 'combobox',
            //         // reference: 'currentDataset',
            //         publishes: 'id',
            //         width: 250,
            //         displayField: 'release_tag',
            //         bind: {
            //             store: '{compare}'
            //             // disabled: '{!currentRecord._meta_id}',
            //             // selection: '{!currentDataset}'
            //         },
            //         queryMode: 'local',
            //         listConfig: {
            //             itemTpl: [
            //                 '<div data-qtip="{release_display_name} - {tag_display_name}">{release_display_name} - {tag_display_name}</div>'
            //             ]
            //         }
            //         // listeners: {
            //         //     change: 'onChangeDataset'
            //         // }
            //     }
            // ]
        });

        me.callParent(arguments);
    }

});
