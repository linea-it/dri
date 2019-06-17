Ext.define('Eyeballing.model.Feature', {
    extend: 'Ext.data.Model',

    fields: [
        {name:'id', type:'int'},
        {name:'ftr_name', type:'string'},
        {name:'checked', type:'boolean'},
        {name:'ftr_defect', type:'int'}
    ]

});
