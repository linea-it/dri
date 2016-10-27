Ext.define('Target.model.ContentSetting', {
    extend: 'Ext.data.Model',

    fields: [
        {name:'id', type:'int'},
        {name:'pcs_content', type:'int'},
        {name:'pcs_setting', type:'int'},
        {name:'pcs_is_visible', type:'boolean'},
        {name:'pcs_order', type:'int'}
    ]
});

