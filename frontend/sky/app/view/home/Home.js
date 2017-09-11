Ext.define('Sky.view.home.Home', {
    extend: 'Ext.grid.Panel',
    xtype: 'home',

    requires: [
      'Sky.view.home.HomeController',
      'Sky.view.home.HomeModel',
      'Sky.store.Releases',
      'Ext.PagingToolbar'
    ],

    title: 'Releases',

    controller: 'home',
    viewModel: 'home',

    bind: {
        store: '{releases}'
    },

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            columns: [
              {
                text: 'Name',
                dataIndex: 'rls_display_name',
                flex: 1,
                renderer: function (value, cell, record) {
                    if (record.get('is_new')) {
                        return value + '    <spam style="color:#e67e22;">New</spam>';
                        // return '<spam style="color:#e67e22;">New</spam>    ' + value;
                    }
                    return value;
                }
            },
              {
                xtype: 'datecolumn',
                text: 'Date',
                dataIndex: 'rls_date',
                format: 'Y-m-d',
                flex: 1
            },
              {text: 'Datasets', dataIndex: 'tags_count', flex: 1, sortable: false},
              {text: 'Tiles', dataIndex: 'tiles_count', flex: 1, sortable: false}
            ],
            dockedItems: [
              {
                xtype: 'toolbar',
                dock: 'top',
                items: [
                  {
                    xtype: 'textfield',
                    emptyText: 'Search by name',
                    reference: 'txtSearch',
                    width: 250,
                    triggers: {
                        clear: {
                            cls: 'x-form-clear-trigger',
                            handler: 'cancelFilter',
                            hidden: true
                        },
                        search: {
                            handler: 'filterByname',
                            cls: ' x-form-search-trigger'
                        }
                    },
                    listeners: {
                        change: 'filterByname',
                        buffer: 500
                    }
                },
                  {
                    tooltip: 'Refresh and Clear filters',
                    iconCls: 'x-fa fa-refresh',
                    handler: 'refreshAndClear'
                }
                ]
            }
            ]
        });

        Ext.GlobalEvents.fireEvent('eventregister', 'SkyViewer - initHome');

        me.callParent(arguments);
    },

    listeners: {
        rowdblclick: 'onRowDblClick'
    },

    loadPanel: function () {
        this.fireEvent('loadpanel', this);
    },

    updatePanel: function () {
        this.fireEvent('updatepanel', this);
    }
});
