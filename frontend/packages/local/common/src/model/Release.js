Ext.define('common.model.Release', {

    extend: 'Ext.data.Model',

    fields: [

        {name:'rls_name', type:'string'},
        {name:'rls_name', type:'string'},
        {name:'rls_version', type:'string'},
        {name:'rls_date', type:'date'},
        {name:'rls_description', type:'float'},
        {name:'rls_doc_url', type:'string'},
        {name:'rls_display_name', type:'string'},
        {name:'rls_default', type:'boolean'}

    ]
});