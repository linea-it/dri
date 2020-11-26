Ext.define('Target.model.CutoutJob', {
    extend: 'Ext.data.Model',
    requires: [
        'common.data.proxy.Django'
    ],
    proxy: {
        type: 'django',
        url: '/dri/api/filterset/'
    },

    fields: [
        { name: 'id', type: 'int', persist: false },
        { name: 'cjb_product', type: 'int' },
        { name: 'cjb_display_name', type: 'string' },
        { name: 'cjb_tag', type: 'string' },

        { name: 'cjb_xsize', type: 'float' },
        { name: 'cjb_ysize', type: 'float' },
        { name: 'cjb_make_fits', type: 'boolean', default: false },
        { name: 'cjb_fits_colors', type: 'string' },
        { name: 'cjb_make_stiff', type: 'boolean', default: false },
        { name: 'cjb_stiff_colors', type: 'string' },
        { name: 'cjb_make_lupton', type: 'boolean', default: false },
        { name: 'cjb_lupton_colors', type: 'string' },

        { name: 'cjb_label_position', type: 'string' },
        { name: 'cjb_label_colors', type: 'string', default: '#2eadf5' },
        { name: 'cjb_label_properties', type: 'string' },
        { name: 'cjb_label_font_size', type: 'int' },

        { name: 'cjb_start_time', type: 'date' },
        { name: 'cjb_finish_time', type: 'date' },

        { name: 'cjb_description', type: 'string' },

        { name: 'cjb_files', type: 'int', persist: false },
        { name: 'cjb_file_size', type: 'int', persist: false },

        { name: 'cjb_status', type: 'string', default: 'st' },
        { name: 'status_name', type: 'string', persist: false },
        { name: 'cjb_error', type: 'string', persist: false },

        { name: 'owner', type: 'string', persist: false },
        { name: 'is_owner', type: 'boolean', persist: false },
        { name: 'execution_time', type: 'string', persist: false },
        { name: 'h_file_sizes', type: 'string', persist: false },
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
        }
    ]

});
