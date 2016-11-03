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
    extend: 'common.store.Tiles',

    /**
     * @requires common.model.Dataset
     */
    

    alias: 'store.dataset',

    // model: 'common.model.Dataset',

    remoteFilter: true,

    remoteSort: true,
    autoLoad: false,
    pageSize: 100,
    listeners: {
        load: {
            fn: function(store){
                store.insert(0, {
                    id: 10000,
                    tag_display_name: "All"
                })
            }
        },
        exception: function(misc) {
            alert("exception!");
        }
    },

    proxy: {
        type: 'django',
        url: '/dri/api/tags/'
    }

});
