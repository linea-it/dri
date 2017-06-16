Ext.define('Target.model.PermissionWorkgroup', {
    extend: 'Ext.data.Model',

    fields: [
        {name:'id', type:'int', persist: false},
        {name:'wgu_workgroup', type:'int'},
        {name:'wgu_user', type:'int'},
        {name:'workgroup', type:'string', persist: false},
        {name:'username', type:'string', persist: false}
    ]

});
