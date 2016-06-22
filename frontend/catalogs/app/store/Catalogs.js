Ext.define('Catalogs.store.Catalogs', {
    extend: 'common.store.MyStore',

    alias: 'store.personnel',

    storeId: 'targetsUploaded',
    fields:[
      'prd_name'
      
      ],
    // autoLoad : true,
    remoteFilter: true,
    proxy: {
      type: 'django',
      url: '/dri/api/catalog/'
      // reader: {
      //     type: 'json',
      //     rootProperty: 'data',
      //     totalProperty: 'totalCount'
      // }     
    }
    // sorters: [{
    //   property: 'registered',
    //   direction: 'DESC'
    // }]

    // pageSize: 25,
    // remoteSort: true,
    // remoteFilter: true,
});
