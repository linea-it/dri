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
                    dataIndex: 'text',
                    renderer: me.getTooltipName
                }
            ],

            tbar: [
                {
                    xtype: 'textfield',
                    emptyText: 'Search by name',
                    reference: 'SearchField',
                    flex: 1,
                    triggers: {
                        clear: {
                            cls: 'x-form-clear-trigger',
                            handler: 'cancelFilter',
                            hidden: true
                        },
                        search: {
                            cls: ' x-form-search-trigger'
                        }
                    },
                    listeners: {
                        change: 'filterCatalogByname',
                        buffer: 500
                    }
                }
            ]

        });

        me.callParent(arguments);
    },

    getTooltipName: function (value, meta, record) {
        var me = this,
            tpl, tooltip;
        if (record.get('leaf')) {
            tpl = new Ext.XTemplate(
                '<div>',
                    '<spam><b>{prd_display_name}</b></spam>',
                    '<tpl if=\'description != ""\'>',
                        '<p></br>{description}</p>',
                    '</tpl>',
                '</div>'
            );

            tooltip = tpl.apply(record.data);


            meta.tdAttr = 'data-qtip=\"' + tooltip + '\"';
        }

        return value;
    }
});
