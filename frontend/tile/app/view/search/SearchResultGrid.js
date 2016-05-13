/**
 *
 */

Ext.define('Tile.view.search.SearchResultGrid',{
    extend:'Ext.grid.Panel',

    requires:[
        'Ext.PagingToolbar'
    ],

    xtype: 'tile-search-resultgrid',

    controller: 'search',

    initComponent: function () {
        var me = this;

        me.columns = [
            // Linhas Numeradas
            Ext.create('Ext.grid.RowNumberer'),
            {
                text: 'Data Release ',
                dataIndex: 'name',
                flex:1,
                renderer: function (value, metaData, record) {
                    return Ext.data.StoreManager.lookup('search-releases').getById(record.get('release')).get('rls_display_name');
                }
            },{
                text: 'Field Name',
                dataIndex: 'tag_display_name',
                flex:1,
                renderer: function (value, metaData, record) {

                    return Ext.data.StoreManager.lookup('search-tags').getById(record.get('tag')).get('tag_display_name');

                    //var store = Ext.data.StoreManager.lookup('search-fields'),
                    //    tag = store.getById(record.get('tag'));
                    //return tag.get('tag_display_name')
                }
            },
            {
                text: 'Tile Name',
                dataIndex: 'tli_tilename',
                renderer: function (value, metaData, record) {
                    return record.getTile().get('tli_tilename');
                },
                flex:1
            }
        ];

        me.callParent(arguments);
    }
});
