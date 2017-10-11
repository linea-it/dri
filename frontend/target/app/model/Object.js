Ext.define('Target.model.Object', {
    extend: 'Ext.data.Model',

    idProperty: '_meta_id',

    fields: [
        {name: '_meta_id', type:'string'},
        {name: '_meta_catalog_id', type:'int'},
        {name: '_meta_is_system', type:'boolean'},
        {name: '_meta_ra', type:'float'},
        {name: '_meta_dec', type:'float'},
        {name: '_meta_radius', type:'float'},
        {name: '_meta_rating_id', type:'int'},
        // {name: '_meta_rating', type:'int', default: null},
        {name: '_meta_reject_id', type:'int'}
        // {name: '_meta_reject', type:'boolean', default: false}

    ]

});
