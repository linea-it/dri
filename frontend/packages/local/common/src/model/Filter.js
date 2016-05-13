Ext.define('common.model.Filter', {

    extend: 'Ext.data.Model',

    remoteFilter: false,

    fields: [
        {name:'filter', type:'string'},
        {name:'name', type:'string'}
    ]
});
