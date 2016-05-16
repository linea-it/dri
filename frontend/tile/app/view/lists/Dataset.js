Ext.define('Tile.view.lists.Dataset', {
    extend: 'Ext.grid.Panel',

    xtype: 'tile-lists-dataset',

    requires: [
        'Ext.PagingToolbar',
        'Ext.grid.RowNumberer'
    ],

    layout: 'fit',

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            columns: [
                Ext.create('Ext.grid.RowNumberer'),
                {
                    text: 'Tilename',
                    dataIndex: 'tli_tilename',
                    sortable: false,
                    width: 160
                },
                {
                    text: 'RA (deg)',
                    dataIndex: 'tli_ra',
                    sortable: false
                },
                {
                    text: 'Dec (deg)',
                    dataIndex: 'tli_dec',
                    sortable: false
                },
                {
                    text: 'l (deg)',
                    dataIndex: 'tli_l',
                    sortable: false
                },
                {
                    text: 'b (deg)',
                    dataIndex: 'tli_b',
                    sortable: false
                },
                {
                    text: 'Dataset',
                    dataIndex: 'tag',
                    sortable: false,
                    renderer: function (value, metaData, record) {
                        return Ext.data.StoreManager.lookup('AllTags')
                                    .getById(value).get('tag_display_name');                      

                    },
                    flex: 1
                }
            ]

        });

        me.callParent(arguments);
    }

});
