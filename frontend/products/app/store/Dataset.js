// Ext.define('Products.store.Dataset', {
//     extend: 'Ext.data.Store',
// 
//     alias: 'store.dataset',
// 
//     fields: [
//         'band'          
//     ],
//     data : [
//         {"display_name":"COSMOS D04"}
//         // {"catalog_id":"AK", "display_name":"Alaska"},
//         // {"catalog_id":"AZ", "display_name":"Arizona"}
//     ]
//     // autoLoad: true,
//     // remoteSort : true,
//     // remoteFilter: true,
//     // proxy: {
//     //     type: 'ajax',
//     //     url: '/PRJSUB/Monitor/getBand',
//     //     reader: {
//     //         type: 'json',
//     //         rootProperty: 'data',
//     //         // totalProperty: 'totalCount'
//     //     }
//     // }
// });


Ext.define('Products.store.Dataset', {
    extend: 'common.store.Datasets',
    alias: 'store.dataset',
    requires: [
        'common.store.Datasets'
    ]
});
