Ext.define('Target.model.Catalog', {
    extend: 'Ext.data.Model',

    fields: [
        {name:'id'},
        {name:'prd_name', type:'string'},
        {name:'prd_display_name', type:'string'},
        {name:'prd_flag_removed', type:'boolean'},
        {name:'prd_class', type:'int'},
        {name:'pcl_display_name', type:'string'},
        {name:'pcl_is_system', type:'boolean'},
        {name:'pgr_group', type:'int'},
        {name:'pgr_display_name', type:'string'},

        {name:'ctl_num_columns', type:'int'},
        {name:'ctl_num_tiles', type:'int'},
        {name:'ctl_num_objects', type:'int'},

        {name:'editable', type:'boolean', defaultValue: false},
        {name:'markable', type:'boolean', defaultValue: false}

    ]
});

