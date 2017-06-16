Ext.define('Target.model.Workgroup', {
    extend: 'Ext.data.Model',

    fields: [
        {name:'id', type:'int', persist: false},
        {name:'wgp_workgroup', type:'string'},
        {name:'owner', persist: false}
    ]

});
