Ext.define('Target.model.CatalogTree', {
    extend: 'Ext.data.Model',

    fields: [
        {name:'id'},
        {name:'prd_name', type:'string'},
        {name:'prd_display_name', type:'string'},
        {name:'prd_class', type:'int'},
        {name:'prd_date', type:'date'},
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

        {name:'description', type:'string'},

        {name:'ctl_num_columns', type:'int'},
        {name:'ctl_num_tiles', type:'int'},
        {name:'ctl_num_objects', type:'int'},

        {name:'editable', type:'boolean', defaultValue: false},
        {name:'markable', type:'boolean', defaultValue: false},
        {name:'tableExist', type:'boolean', defaultValue: false},
        {name:'release_display_name', type:'string'},

        {name:'tbl_size', type:'int', convert: function (value, record) {
            // Tamanho da tabela de catalogos converter bytes para kb ou mb
            if (value > 0) {
                return Ext.util.Format.fileSize(value);
            }
            else {
                return null;
            }
        }},
        {name: 'tbl_rows', type: 'int'},
        {name: 'tbl_num_columns', type: 'int'}

    ]

});
