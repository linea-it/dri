Ext.define('common.model.Map', {
    extend: 'Ext.data.Model',

    fields: [
        {name:'id', type:'int'},
        {name:'prd_name', type:'string'},
        {name:'prd_display_name', type:'string'},
        {name:'prd_user_display_name', type:'string'},
        {name:'prd_class', type:'int'},
        {name:'prd_is_public', type:'boolean'},
        {name:'pcl_display_name', type:'string'},
        {name:'pcl_is_system', type:'boolean'},
        {name:'pgr_group', type:'int'},
        {name:'pgr_display_name', type:'string'},
        {name:'epr_original_id', type:'string'},
        {name:'prd_filter', type:'string'},
        {name:'prl_related', type:'string'},
        {name:'prl_cross_identification', type:'string'},
        {name:'prl_cross_property', type:'string'},
        {name:'tablename', type:'string'},
        {name:'mpa_nside', type:'int'},
        {name:'mpa_ordering', type:'string'}
    ]
});
