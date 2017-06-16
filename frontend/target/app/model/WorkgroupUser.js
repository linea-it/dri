Ext.define('Target.model.WorkgroupUser', {
    extend: 'Ext.data.Model',

    fields: [
        {name:'id', type:'int', persist: false},
        {name:'wgu_workgroup', type:'int'},
        {name:'wgu_user', type:'int'},
        {name:'username', persist: false}
    ]

});
