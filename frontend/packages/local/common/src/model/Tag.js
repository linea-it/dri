Ext.define('common.model.Tag', {

    extend: 'Ext.data.Model',

    fields: [
        {name:'id', type:'int'},
        {name:'tag_release', type:'int'},
        {name:'tag_name', type:'string'},
        {name:'tag_display_name', type:'string'},
        {name:'tag_status', type:'boolean'},
        {name:'tag_install_date', type:'date'}

    ]
});

