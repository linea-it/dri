Ext.define('Target.model.CatalogColumn', {
    extend: 'Ext.data.Model',

    fields: [
        {name:'id', type:'int'},
        {name:'pcl_product_id', type:'int'},
        {name:'pcl_column_name', type:'string'},

        // {name:'association_id', type:'int'},
        // {name:'property_id', type:'int'},
        // {name:'catalog_id', type:'int'},
        // {name:'catalog_column_name', type:'string'},
        // {name:'mandatory', type:'boolean'},
        // {name:'ucd', type:'string'},

        // {name:'reference', type:'string'}
        //
        // Campos genericos para ser usado pela grid de objetos.
        {name:'ucd', type:'string'},
        {name:'reference', type:'string'},
        {name:'unit', type:'string'},
        {
            name:'property_name',
            type:'string',
            convert: function (value, record) {
                // Valor default temporario para o display name da coluna
                return record.get('pcl_column_name');
            }
        },
        {
            name:'property_display_name',
            type:'string',
            convert: function (value, record) {
                // Valor default temporario para o display name da coluna
                return record.get('pcl_column_name');
            }
        }
    ]
});

