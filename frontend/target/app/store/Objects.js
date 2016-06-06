Ext.define('Target.store.Objects', {
    extend: 'Ext.data.Store',

    alias: 'store.targets-objects',

    remoteFilter: true,

    remoteSort: true,

    autoLoad: false,

    fields: [{
        name: 'tilename'
    }],

    proxy: {
        type: 'ajax',
        // url: '/PRJSUB/TargetViewer/getTargets',
        api: {
            // create  : '/PRJSUB/TileViewer/setCatalogObject',
            read    : '/PRJSUB/TargetViewer/getTargets',
            update  : '/PRJSUB/TargetViewer/updateTargetObject'
            // destroy : '/PRJSUB/TileViewer/deleteCatalogObject'
        },
        reader: {
            type: 'json',
            rootProperty: 'data',
            totalProperty: 'totalCount'
        },
        writer: {
            type: 'json',
            rootProperty: 'data',
            writeAllFields: false,
            encode: true,
            allowSingle: true
        }
    },

    sorters: [{
        property: 'tilename',
        direction: 'ASC'
    }]
});
