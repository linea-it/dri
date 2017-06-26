Ext.define('visiomatic.model.Object', {
    extend: 'Ext.data.Model',

    idProperty: '_meta_id',

    fields: [
        {name: '_meta_id'},
        {name: '_meta_catalog_id', type:'int'},
        {name: '_meta_is_system', type:'boolean'},
        {name: '_meta_ra', type:'float'},
        {name: '_meta_dec', type:'float'},
        {name: '_meta_radius', type:'float'},
    ]

});

