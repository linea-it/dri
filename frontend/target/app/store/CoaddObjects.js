Ext.define('Target.store.CoaddObjects', {
    extend: 'Ext.data.Store',

    alias: 'store.coadd-objects',

    remoteFilter: true,

    autoLoad: false,

    model: 'Target.model.CatalogObject',

    proxy: {
        type: 'ajax',
        url: '/PRJSUB/TileViewer/get_coadd_objects',
        reader: {
            type: 'json',
            rootProperty: 'data',
            totalProperty: 'totalCount'
        }
    }
});
