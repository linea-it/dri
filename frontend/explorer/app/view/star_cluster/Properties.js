Ext.define('Explorer.view.star_cluster.Properties', {
    extend: 'Ext.grid.Panel',

    xtype: 'star_cluster-properties',

    requires: [
        'common.SearchField'
    ],

    // controller: 'coadd',

    // viewModel: 'coadd',

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            columns: [
                { text: 'Property', dataIndex: 'property', flex: 1 },
                { text: 'Value', dataIndex: 'value', renderer: this.formatNumber, flex: 1 }
            ],
            tbar: [
                {
                    xtype: 'common-searchfield',
                    minSearch: 1,
                    listeners: {
                        'search': 'onSearch',
                        'cancel': 'onSearchCancel'
                    },
                    flex: 1
                }
            ]
        });

        me.callParent(arguments);
    },

    formatNumber: function (value) {
        if (typeof (value) === 'number') {
            if (!isNaN(value) && value.toString().indexOf('.') != -1) {

                value = value.toFixed(4);
            }
        }

        return value;
    }

});
