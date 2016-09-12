Ext.define('Sky.view.dataset.Visiomatic', {
    extend: 'visiomatic.Visiomatic',

    xtype: 'sky-visiomatic',

    requires: [
        'visiomatic.Visiomatic'
    ],

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            auxTools: [{
                xtype: 'button',
                tooltip: 'Compare images between releases.',
                iconCls: 'x-fa fa-object-ungroup ',
                text: 'Compare',
                scope: me,
                handler: 'compareImages',
                bind: {
                    disabled: '{disablecompare}'
                },
                menu: [
                    {
                        text: 'Blabla'
                    }
                ]
            }
            // {
            //     xtype: 'combobox',
            //     // reference: 'currentDataset',
            //     publishes: 'id',
            //     width: 250,
            //     displayField: 'release_tag',
            //     bind: {
            //         store: '{compare}'
            //         // disabled: '{!currentRecord._meta_id}',
            //         // selection: '{!currentDataset}'
            //     },
            //     queryMode: 'local',
            //     listConfig: {
            //         itemTpl: [
            //             '<div data-qtip="{release_display_name} - {tag_display_name}">{release_display_name} - {tag_display_name}</div>'
            //         ]
            //     }
            //     // listeners: {
            //     //     change: 'onChangeDataset'
            //     // }
            // }
            ]
        });

        me.callParent(arguments);
    },

    compareImages: function () {
        console.log('compareImages');

        this.fireEvent('compare', this);

    }

});
