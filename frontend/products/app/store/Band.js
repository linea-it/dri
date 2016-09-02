Ext.define('Products.store.Band', {
    extend: 'Ext.data.Store',

    alias: 'store.band',

    fields: [
        'band'          
    ],
    data : [
        {"band":"---"}
        // {"catalog_id":"AK", "display_name":"Alaska"},
        // {"catalog_id":"AZ", "display_name":"Arizona"}
    ]
    // autoLoad: true,
    // remoteSort : true,
    // remoteFilter: true,
    // proxy: {
    //     type: 'ajax',
    //     url: '/PRJSUB/Monitor/getBand',
    //     reader: {
    //         type: 'json',
    //         rootProperty: 'data',
    //         // totalProperty: 'totalCount'
    //     }
    // }
});
