Ext.define('visiomatic.store.XrayContours', {
    extend: 'Ext.data.ArrayStore',

    alias: 'store.xray_contours',

    remoteFilter: false,

    remoteSort: false,

    autoLoad: false,

    pageSize: 10000,

    proxy: {
        type: 'django',
        timeout: 60000,
        api: {
            read: '/xray_contours/contours?filepath=res_12.pkl&cluster=spt_8'
        }
    }    
});
