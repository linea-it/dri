Ext.define('Target.model.Catalog', {
    extend: 'Ext.data.Model',

    fields: [
        {name:'catalog_id', type:'int'},
        {name:'catalog_name', type:'string'},
        {name:'version', type:'string'},
        {name:'ingestion_datetime', type:'date'},
        {name:'ingestion_date', type:'date'},
        {name:'num_tiles', type:'int'},
        {name:'num_objects', type:'int'},
        {name:'num_columns', type:'int'},
        {name:'visibility', type:'int'},
        {name:'description', type:'string'},
        {name:'schema_name', type:'string'},
        {name:'table_name', type:'string'},
        {name:'type_id', type:'int'},
        {name:'type_name', type:'string'},
        {name:'class_id', type:'int'},
        {name:'class_name', type:'string'},
        {name:'class_display_name', type:'string'},
        {name:'flag_removed', type:'boolean'},
        {name:'process_id', type:'int', defaultValue: ''},
        {name:'process_flag_removed', type:'boolean'},
        {name:'product_field_id', type:'int'},
        {name:'product_tag_id', type:'int'},
        {name:'product_flag_removed', type:'boolean'},
        {name:'product_id', type:'int'},
        {name:'user_id', type:'int'},
        {name:'owner', type:'string'},
        {name:'status_id', type:'int'},
        {name:'status_name', type:'string'},
        {name:'status_description', type:'string'},
        {name:'pipeline_display_name', type:'string'},
        {name:'field_display_name', type:'string'},
        {name:'release_display_name', type:'string'},

        {name:'dachs', type:'string'},
        {name:'editable', type:'boolean', defaultValue: false},
        {name:'markable', type:'boolean', defaultValue: false}
    ]
});

