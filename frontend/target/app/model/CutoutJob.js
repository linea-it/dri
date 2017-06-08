Ext.define('Target.model.CutoutJob', {
    extend: 'Ext.data.Model',

    fields: [
        {name:'id', type:'int', persist: false},
        {name:'cjb_product', type:'int'},
        {name:'cjb_display_name', type: 'string'},
        {name:'cjb_xsize', type: 'float'},
        {name:'cjb_ysize', type: 'float'},
        {name:'cjb_job_type', type: 'string'},
        {name:'cjb_tag', type: 'string'},
        {name:'cjb_band', type: 'string'},
        {name:'cjb_Blacklist', type: 'boolean', default: false},

        {name:'cjb_label_position', type: 'string'},
        {name:'cjb_label_properties', type: 'string'},

        {name:'cjb_status', type: 'string', default: 'st'},
        {name:'cjb_job_id', type: 'string', persist: false},

        {name:'owner', type: 'string', persist: false},

        {
            name: 'ready_to_download',
            type: 'boolean',
            default: false,
            persist: false,
            convert: function (value, record) {
                // tem que estar com status done
                if (record.get('cjb_status') === 'ok') {
                    return true;

                } else {
                    return false;
                }

            }
        },
        {
            name: 'status',
            type: 'string',
            persist: false,
            convert: function (value, record) {
                var status = '';
                switch (record.get('cjb_status')) {
                    case 'st':
                        status = 'Start';
                        break;
                    case 'bs':
                        status = 'Submit Job';
                        break;
                    case 'rn':
                        status = 'Running';
                        break;
                    case 'ok':
                        status = 'Done';
                        break;
                    case 'er':
                        status = 'Error';
                        break;
                    case 'je':
                        status = 'Job Error';
                        break;
                    case 'dl':
                        status = 'Deleted';
                        break;
                }
                return status;
            }
        }
    ]

});
