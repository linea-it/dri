Ext.define('Products.store.Products', {
    extend: 'Ext.data.Store',

    alias: 'store.personnel',

    viewConfig: { 
        deferEmptyText: false
    },
    fields: [
        'catalog_id', 
        'catalog_name', 
        'status_id', 
        'max' 
    ],
    // autoLoad: true,
    remoteSort : true,
    remoteFilter: true,
    proxy: {
        type: 'ajax',
        url: '/PRJSUB/Monitor/getProducts',
        reader: {
            type: 'json',
            rootProperty: 'data',
            totalProperty: 'totalCount'
        }
    }
});
