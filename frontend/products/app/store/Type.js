Ext.define('Products.store.Type', {
    extend: 'Ext.data.Store',

    alias: 'store.type',

    fields: [
        'catalog_id', 
        'catalog_name', 
        'status_id', 
        'max' 
    ],
    data : [
        {"catalog_id":"AL", "display_name":"Target"}
        // {"catalog_id":"AK", "display_name":"Alaska"},
        // {"catalog_id":"AZ", "display_name":"Arizona"}
    ]
    // autoLoad: true,
    // remoteSort : true,
    // remoteFilter: true,
    // proxy: {
    //     type: 'ajax',
    //     url: '/PRJSUB/Monitor/getProductsType',
    //     reader: {
    //         type: 'json',
    //         rootProperty: 'data',
    //         // totalProperty: 'totalCount'
    //     }
    // }
});
