Ext.define('Products.store.Release', {
    extend: 'Ext.data.Store',

    alias: 'store.release',

    fields: [
        'display_name'          
    ],
    data : [
        {"display_name":"Y1A1"}
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
