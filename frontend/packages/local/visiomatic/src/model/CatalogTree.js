Ext.define('visiomatic.model.CatalogTree', {
    extend: 'Ext.data.Model',

    fields: [
        {name:'id'},
        {name:'prd_name', type:'string'},
        {name:'prd_display_name', type:'string'},
        {name:'prd_class', type:'int'},
        {name:'pcl_display_name', type:'string'},
        {name:'pcl_is_system', type:'boolean'},
        {name:'pgr_group', type:'int'},
        {name:'pgr_display_name', type:'string'},
        {name:'epr_original_id', type:'string'},
        {name:'epr_name', type:'string'},
        {name:'epr_username', type:'string'},
        {name:'epr_start_date', type:'date'},
        {name:'epr_end_date', type:'date'},
        {name:'epr_readme', type:'string'},
        {name:'epr_comment', type:'string'},

        {name:'ctl_num_columns', type:'int'},
        {name:'ctl_num_tiles', type:'int'},
        {name:'ctl_num_objects', type:'int'},

        {name:'cds_source', type:'string'},
        {name:'cds_fieldnames', type:'string'},

        {name:'editable', type:'boolean', defaultValue: false},
        {name:'markable', type:'boolean', defaultValue: false},
        {name:'release_display_name', type:'string'},
        {name:'external_catalog', type:'boolean', defaultValue: false},
    ]

});
