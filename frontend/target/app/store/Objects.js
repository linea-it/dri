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
            read    : '/dri/api/catalogobjects/',
            // update  : '/PRJSUB/TargetViewer/updateTargetObject'
            // destroy : '/PRJSUB/TileViewer/deleteCatalogObject'
        },
        // reader: {
        //     type: 'json',
        //     rootProperty: 'data',
        //     totalProperty: 'totalCount'
        // },
        // writer: {
        //     type: 'json',
        //     rootProperty: 'data',
        //     writeAllFields: false,
        //     encode: true,
        //     allowSingle: true
        // }
    },

    sorters: [{
        property: 'tilename',
        direction: 'ASC'
    }]
});
