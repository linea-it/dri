Ext.define('Target.model.Cutout', {
    extend: 'Ext.data.Model',

    fields: [
        {name:'id', type:'int', persist: false},
        {name:'cjb_cutout_job', type:'int'},
        {name:'ctt_object_id', type:'int'},
        {name:'ctt_object_ra', type:'float'},
        {name:'ctt_object_dec', type:'float'},
        {name:'ctt_filter', type:'int'},
        {name:'ctt_thumbname', type:'string'},
        {name:'ctt_file_path', type:'string'},
        {name:'ctt_file_name', type:'string'},
        {name:'ctt_file_type', type:'string'},
        {name:'ctt_file_size', type:'string'},
        {name:'ctt_download_start_time', type:'date'},
        {name:'ctt_download_finish_time', type:'date'},
        {name:'ctt_file_source', type:'string'},
        {name:'timestamp', type:'string'},
    ],

    getImageSource: function(timestamp) {
        var me = this;

        if (timestamp) {
            return Ext.String.format('{0}?_dc={1}', me.get('ctt_file_source'), me.get('timestamp'));

        } else {
            return me.get('ctt_file_source')
        }

    }

});