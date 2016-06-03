Ext.define('Target.model.CatalogColumn', {
    extend: 'Ext.data.Model',

    fields: [
        {name:'association_id', type:'int'},
        {name:'property_id', type:'int'},
        {name:'catalog_id', type:'int'},
        {name:'property_name', type:'string'},
        {name:'catalog_column_name', type:'string'},
        {name:'mandatory', type:'boolean'},
        {name:'ucd', type:'string'},
        {name:'unit', type:'string'},
        {name:'reference', type:'string'}
    ]
});

