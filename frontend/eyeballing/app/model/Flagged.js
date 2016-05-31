Ext.define('Eyeballing.model.Flagged', {
    extend: 'Ext.data.Model',

    fields: [
        {name:'id', type:'int'},
        {name:'flg_dataset', type:'int'},
        {name:'flg_flagged', type:'boolean'}
    ]

});
