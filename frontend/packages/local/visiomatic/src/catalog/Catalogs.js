Ext.define('visiomatic.catalog.Catalogs', {
    extend: 'Ext.tree.Panel',

    xtype: 'visiomatic-catalogs-tree',

    initComponent: function () {
        var me = this;
        Ext.apply(this, {
            emptyText: 'No data to dysplay.',
            columns: [
                {
                    xtype: 'treecolumn',
                    text: 'Name',
                    flex: 2,
                    sortable: true,
                    dataIndex: 'text'
                },
                {
                    text: 'Owner',
                    flex: 1,
                    dataIndex: 'owner',
                    sortable: true,
                    filter: {
                        type: 'string'
                    }
                }
            ]

        });

        me.callParent(arguments);
    },
});
