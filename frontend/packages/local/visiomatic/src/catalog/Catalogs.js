Ext.define('visiomatic.catalog.Catalogs', {
    extend: 'Ext.tree.Panel',

    xtype: 'visiomatic-catalogs-tree',

    initComponent: function () {
        var me = this;
        Ext.apply(this, {
            emptyText: 'No data to display.',
            hideHeaders: true,
            rootVisible: false,
            useArrows: true,
            selModel: {
                mode: 'SINGLE'
            },
            columns: [
                {
                    xtype: 'treecolumn',
                    text: 'Name',
                    flex: 2,
                    sortable: true,
                    dataIndex: 'text'
                }
//                {
//                    text: 'Owner',
//                    flex: 1,
//                    dataIndex: 'owner',
//                    sortable: true,
//                    filter: {
//                        type: 'string'
//                    }
//                }
            ],

            tbar: [
                {
                    xtype: 'textfield',
                    emptyText: 'Search by name',
                    flex: 1,
                    triggers: {
                        clear: {
                            cls: 'x-form-clear-trigger',
//                            handler: this.cancelFilter,
                            hidden: true
                        },
                        search: {
                            cls: ' x-form-search-trigger'
                        }
                    },
//                    listeners: {
//                        change: me.filterByname,
//                        buffer: 500
//                    }
                },

            ]

        });

        me.callParent(arguments);
    },
});
