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


    getImageSourceByObjectId: function (meta_id) {
        var me = this,
            record;

        me.each(function (r) {
            if (parseInt(r.get('ctt_object_id')) === parseInt(meta_id)) {
                record = r;
                return false;
            }
        }, me);

        if ((record) && (record.get('ctt_file_source') !== null) && (record.get('ctt_file_source') !== '')) {
            return record.get('ctt_file_source');

        } else {
            return null;
        }
    }

});
