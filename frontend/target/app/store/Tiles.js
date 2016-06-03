Ext.define('Target.store.Tiles', {
    extend: 'Ext.data.Store',

    alias: 'store.catalog-tiles',

    autoLoad: false,

    remoteFilter: true,

    remoteSort: true,

    // model: 'Portal.model.CatalogTile',

    fields: [
        {name:'tile_id', type:'int'},
        {name:'catalog_id', type:'int'},
        {name:'tilename', type:'string'},
        {name:'num_objects', type:'int'},
        {name:'releaseDisplayName', type:'string', mapping: 'display_name'},
        {name:'fieldDisplayName', type:'string', mapping: 'name'}
    ],

    proxy: {
        type: 'ajax',
        url: '/PRJSUB/TargetViewer/getCatalogTiles',
        reader: {
            type: 'json',
            rootProperty: 'data',
            totalProperty: 'totalCount'
        }
    },

    sorters: [{
        property: 'tilename',
        direction: 'ASC'
    }]

    // data: [{"num_objects":1,"tile_id":9559,"catalog_id":92,"tiletag_id":3532,"tilename":"DES0005-0124"},{"num_objects":1,"tile_id":3452,"catalog_id":92,"tiletag_id":3412,"tilename":"DES2114-0124"},{"num_objects":1,"tile_id":3515,"catalog_id":92,"tiletag_id":3420,"tilename":"DES2122-0041"},{"num_objects":1,"tile_id":11168,"catalog_id":92,"tiletag_id":3581,"tilename":"DES2148+0001"},{"num_objects":1,"tile_id":11261,"catalog_id":92,"tiletag_id":3604,"tilename":"DES2211+0001"},{"num_objects":1,"tile_id":11797,"catalog_id":92,"tiletag_id":3608,"tilename":"DES2214+0001"},{"num_objects":1,"tile_id":11799,"catalog_id":92,"tiletag_id":3609,"tilename":"DES2214+0043"},{"num_objects":1,"tile_id":6262,"catalog_id":92,"tiletag_id":3496,"tilename":"DES2314-0124"},{"num_objects":1,"tile_id":6296,"catalog_id":92,"tiletag_id":3506,"tilename":"DES2328-0124"}]
});
