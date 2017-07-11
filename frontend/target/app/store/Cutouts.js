Ext.define('Target.store.Cutouts', {
    extend: 'common.store.MyStore',

    alias: 'store.cutouts',

    requires: [
        'Target.model.Cutout'
    ],

    model: 'Target.model.Cutout',

    remoteFilter: true,

    pageSize: 0,

    proxy: {
        url: '/dri/api/cutouts/'
    },


    getImageSourceByObjectId: function (meta_id, fileFormat, timestamp) {
        var me = this,
            record;

        if (!fileFormat) {
            fileFormat = 'png';
        }

        me.each(function(r){

            if (parseInt(r.get('ctt_object_id')) === parseInt(meta_id)) {

                if (r.get('ctt_file_type').toLowerCase() === fileFormat.toLowerCase()) {
                    record = r;
                    return false;
                }
            }
        }, me);

       if ((record) && (record.get('ctt_file_source') !== null) && (record.get('ctt_file_source') !== '')) {
           return record.getImageSource(timestamp);

        } else {
            return null;
        }
    }

});
