Ext.define('Target.model.CatalogColumn', {
    extend: 'Ext.data.Model',

    fields: [
        {name:'id', type:'int'},
        {name:'pcn_product_id', type:'int'},
        {name:'pcn_column_name', type:'string'},

        {name:'pca_product', type:'int'},
        {name:'pca_class_content', type:'int'},
        {name:'pca_product_content', type:'int'},
        {name:'pcc_category', type:'string'},
        {name:'pcc_display_name', type:'string'},
        {name:'pcc_ucd', type:'string'},
        {name:'pcc_unit', type:'string'},
        {name:'pcc_reference', type:'string'},
        {name:'pcc_mandatory', type:'string'},

        // Campos genericos para ser usado pela grid de objetos.
        {
            name:'ucd',
            type:'string',
            convert: function (value, record) {
                // Valor default temporario para o ucd da coluna
                return record.get('pcc_ucd');
            }
        },
        {name:'reference', type:'string'},
        {name:'unit', type:'string'},
        {
            name:'property_name',
            type:'string',
            convert: function (value, record) {
                // Valor default temporario para o display name da coluna
                return record.get('pcn_column_name');
            }
        },
        {
            name:'property_display_name',
            type:'string',
            convert: function (value, record) {
                if (record.get('pcc_display_name') != '') {
                    return record.get('pcc_display_name');
                } else {
                    return record.get('pcn_column_name');
                }

            }
        }
    ]
});

