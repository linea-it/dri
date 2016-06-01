Ext.define('Catalogs.store.Personnel', {
    extend: 'Ext.data.Store',

    alias: 'store.personnel',

    storeId: 'targetsUploaded',
    fields:[
      'user_name', 
      'catalogcatalog_id', 
      'catalog_id',
      'rd_path',
      'editable', 
      'release', 
      'status_id', 
      'catalog_name', 
      'productclass_name', 
      'version', 
      'process_id', 
      'display_name', 
      'creation_date', 
      'registered',
      'view'
      ],
    pageSize: 25,
    remoteSort: true,
    remoteFilter: true,
    proxy: {
      type: 'ajax',
      url: '/PRJSUB/PUBPROD/get_catalog_server',
      reader: {
          type: 'json',
          rootProperty: 'data',
          totalProperty: 'totalCount'
      }
     
    },   
    sorters: [{
      property: 'registered',
      direction: 'DESC'
    }]
});
