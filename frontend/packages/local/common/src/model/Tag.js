Ext.define('common.model.Tag', {

    extend: 'Ext.data.Model',

    fields: [
        {name:'id', type:'int'},
        {name:'tag_release', type:'int'},
        {name:'tag_name', type:'string'},
        {name:'tag_display_name', type:'string'},
        {name:'tag_status', type:'boolean'},
        {name:'tag_install_date', type:'date'},
        {
            name: 'is_new',
            type: 'boolean',
            convert: function (value, record) {
                if (record.get('tag_install_date')) {
                    var create_date = record.get('tag_install_date'),
                        interval = -2,
                        sysdate = Ext.Date.add(new Date(), Ext.Date.DAY, interval);

                    return Ext.Date.between(create_date, sysdate, create_date);
                }
            }
        }
    ]
});

