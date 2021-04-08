Ext.define('Target.model.Cutout', {
    extend: 'Ext.data.Model',

    fields: [
        { name: 'id', type: 'int', persist: false },
        { name: 'cjb_cutout_job', type: 'int' },
        { name: 'ctt_object_id', type: 'int' },
        { name: 'ctt_object_ra', type: 'float' },
        { name: 'ctt_object_dec', type: 'float' },
        { name: 'ctt_img_format', type: 'int' },
        { name: 'ctt_img_color', type: 'int' },
        { name: 'ctt_file_name', type: 'string' },
        { name: 'ctt_file_type', type: 'string' },
        { name: 'ctt_file_size', type: 'string' },
        { name: 'ctt_file_source', type: 'string' },
    ],

});