Ext.define('common.model.Survey', {

    extend: 'Ext.data.Model',

    fields: [
        {name:'id', type:'int'},
        {name:'srv_release', type:'int'},
        {name:'srv_filter', type:'int'},
        {name:'filter', type:'string'},
        {name:'srv_project', type:'string'},
        {name:'srv_display_name', type:'string'},
        {name:'srv_url', type:'string'},
        {name:'srv_target', type:'string'},
        {name:'srv_fov', type:'string'}
    ]
});
