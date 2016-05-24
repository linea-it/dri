Ext.define('common.model.Filter', {

    extend: 'Ext.data.Model',

    remoteFilter: false,

    fields: [
        {name:'id', type:'string'},
        {name:'project', type:'string'},
        {
            name:'filter',
            type:'string',
            convert: function (value, record) {
                return record.get('filter').toLowerCase();
            }
        },
        {name:'lambda_min', type:'float'},
        {name:'lambda_max', type:'float'},
        {name:'lambda_mean', type:'float'},

        // Este campo e para manter compatibilidade com versoes anteriores.
        {
            name:'name',
            type:'string',
            convert: function (value, record) {
                return record.get('filter');
            }
        }
    ]
});
