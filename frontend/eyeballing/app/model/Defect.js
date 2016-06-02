Ext.define('Eyeballing.model.Defect', {
    extend: 'Ext.data.Model',

    fields: [
        {name:'id', type:'int'},
        {name:'dfc_dataset', type:'int'},
        {name:'dfc_filter', type:'int'},
        {name:'dfc_feature', type:'int'},
        {name:'dfc_ra', type:'float'},
        {name:'dfc_dec', type:'float'},

        // Nome da feature associada ao defeito
        // esse campo nao vem do backend e adicionado pela interface.
        {name:'ftr_name', type:'string'}
    ]

});
