Ext.define('common.model.Release', {

    extend: 'Ext.data.Model',

    fields: [
        {name:'rls_name', type:'string'},
        {name:'rls_version', type:'string'},
        {name:'rls_date', type:'date'},
        {name:'rls_description', type:'float'},
        {name:'rls_doc_url', type:'string'},
        {name:'rls_display_name', type:'string'},
        {name:'rls_default', type:'boolean'},
        {name:'tiles_count', type:'int'},
        {
            name: 'is_new',
            type: 'boolean',
            convert: function (value, record) {
                if (record.get('rls_date')) {
                    var create_date = record.get('rls_date'),
                        interval = -2,
                        sysdate = Ext.Date.add(new Date(), Ext.Date.DAY, interval);

                    return Ext.Date.between(create_date, sysdate, create_date);
                }
            }
        }
    ]
});
