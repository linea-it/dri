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
    // fields: [
    //     {name: '_meta_id'},
    //     {name: '_meta_catalog_id', type:'int'},
    //     {name: '_meta_is_system', type:'boolean'},
    //     {name: '_meta_ra', type:'float'},
    //     {name: '_meta_dec', type:'float'},
    //     {name: '_meta_radius', type:'float'},
    //     {name: '_meta_rating_id', type:'int'},
    //     // {name: '_meta_rating', type:'int', default: null},
    //     {name: '_meta_reject_id', type:'int'},
    //     {name: '_meta_reject', type:'boolean', default: false}

    // ],

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
    //     property: 'id_auto',
    //     direction: 'ASC'
    // }]
});
