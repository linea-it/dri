Ext.define('Target.store.Objects', {
    extend: 'common.store.MyStore',

    requires: [
        'Target.model.Object'
    ],

    alias: 'store.targets-objects',

    remoteFilter: true,

    remoteSort: true,

    autoLoad: false,

    model: 'Target.model.Object',

    pageSize: 100,

    proxy: {
        type: 'django',
        timeout: 60000,
        api: {
            // create  : '/PRJSUB/TileViewer/setCatalogObject',
            read    : '/dri/api/target/'
            // update  : '/PRJSUB/TargetViewer/updateTargetObject'
            // destroy : '/PRJSUB/TileViewer/deleteCatalogObject'
        }
    }
});
