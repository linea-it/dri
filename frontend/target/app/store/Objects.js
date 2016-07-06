Ext.define('Target.store.Objects', {
    extend: 'common.store.MyStore',

    alias: 'store.targets-objects',

    remoteFilter: true,

    remoteSort: true,

    autoLoad: false,

    fields: [{
        name: 'tilename'
    }],

    proxy: {
        type: 'django',
        api: {
            // create  : '/PRJSUB/TileViewer/setCatalogObject',
            read    : '/dri/api/target/'
            // update  : '/PRJSUB/TargetViewer/updateTargetObject'
            // destroy : '/PRJSUB/TileViewer/deleteCatalogObject'
        }
    }

    // sorters: [{
    //     property: 'tilename',
    //     direction: 'ASC'
    // }]
});
