// Ext.define('Products.store.Products', {
//     extend: 'Ext.data.Store',
// 
//     alias: 'store.personnel',
// 
//     viewConfig: { 
//         deferEmptyText: false
//     },
//     fields: [
//         'catalog_id', 
//         'catalog_name', 
//         'status_id', 
//         'max' 
//     ],
//     // autoLoad: true,
//     remoteSort : true,
//     remoteFilter: true,
//     proxy: {
//         type: 'ajax',
//         url: '/PRJSUB/Monitor/getProducts',
//         reader: {
//             type: 'json',
//             rootProperty: 'data',
//             totalProperty: 'totalCount'
//         }
//     }
// });

Ext.define('Products.store.Products', {
    extend: 'common.store.Tiles',

    /**
     * @requires common.model.Dataset
     */
    

    alias: 'store.personnel',

    // model: 'common.model.Dataset',

    remoteFilter: true,

    // remoteSort: true,

    // pageSize: 100,

    proxy: {
        type: 'django',
        url: '/dri/api/product/'
    }

});
