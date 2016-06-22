/**
 * This view is an example list of people.
 */
Ext.define('Catalogs.view.main.List', {
    extend: 'Ext.grid.Panel',
    xtype: 'mainlist',
    title: 'Catalog Server',

    initComponent: function(){
        this.width = 760;
        var pluginExpanded = true;
        var store = Ext.create('Catalogs.store.Catalogs');
        Ext.apply(this, {
            store: store,            
            columns: [
                // { 
                //   text: 'Status', 
                //   dataIndex: 'status_id',
                //   align: 'center',
                //   // filter: 'list',
                //   renderer: function(value, metaData, record, rowIndex, colIndex, store, view){            
                //       catalog = 'catalog'
                //       if (value == 1){
                //         metaData.tdAttr = 'data-qtip=' + "OK";               
                //         return '<img src="/static/images/status-valid.png" />';
                //       }else if(value == 2){
                //         metaData.tdAttr = 'data-qtip=' + "Pending";
                //         return '<img src="/static/images/status-pending.png" />';
                //       }else if(value == 3){
                //         metaData.tdAttr = 'data-qtip=' + "Warning";
                //         return '<img src="/static/images/status-warning.png" />';
                //       }else{
                //         metaData.tdAttr = 'data-qtip=' + "Do&nbsp;not&nbsp;use";
                //         return '<img src="/static/images/status-invalid.png" />';
                //       }              
                //   }          
                // },
                { 
                  text: 'Name', 
                  dataIndex: 'prd_display_name',
                  flex: 1,
                  filter: {
                    type: 'string',
                    itemDefaults: {
                        emptyText: 'Search for...'
                    }
                  }
                },
                // { 
                //   text: 'ID', 
                //   dataIndex: 'catalog_id',
                //   flex: 1,
                //   filter: {
                //     type: 'string',
                //     itemDefaults: {
                //         emptyText: 'Search for...'
                //     }
                //   }
                // },        
                { 
                  text: 'Type', 
                  dataIndex: 'pcl_display_name',
                  flex: 1,
                  filter: {
                    type: 'string',
                    itemDefaults: {
                        emptyText: 'Search for...'
                    }
                  }
                },
                // { 
                //   text: 'Version', 
                //   dataIndex: 'version',
                //   filter: {
                //     type: 'string',
                //     itemDefaults: {
                //         emptyText: 'Search for...'
                //     }
                //   }
                // },
                { text: 'Process ID', dataIndex: 'process_id', filter: 'number' },
                { 
                  text: 'Owner', 
                  dataIndex: 'display_name',
                  flex: 1,
                  filter: {
                    type: 'string',
                    itemDefaults: {
                        emptyText: 'Search for...'
                    }
                  }
                },
                { 
                  text: 'Creation', 
                  flex: 1, 
                  dataIndex: 'creation_date',  
                  filter: 'date'
                  // renderer: function(value, metaData, record, rowIndex, colIndex, store, view){            
                  //   catalog = 'catalog'
                  //   tree = treePanel.getSelectionModel().getSelection()
                  //   if (tree[0].data.type_id == 3){
                  //     selected = grid.getStore().getAt(rowIndex);
                  //     return selected.get('ingestion_date')
                  //   }else{
                  //     return value
                  //   }
                  // }
                },
                { 
                  text: 'Publish', 
                  dataIndex: 'registered', 
                  filter: 'date',
                  flex: 1, 
                  renderer: function(value, metaData, record, rowIndex, colIndex, store, view){            
                    if (value != null){
                      tree = treePanel.getSelectionModel().getSelection()
                      if (tree[0].data.type_id == 3){
                        selected = grid.getStore().getAt(rowIndex);
                        return selected.get('creation_date')
                      }else{
                        return value.substring(0,10)
                      }
                    }else{
                      return '---'
                    }
                  }
                },
                {
                    xtype: 'actioncolumn',
                    width: 30,
                    sortable: false,
                    menuDisabled: true,
                    items: [{
                        iconCls:'download-icon',
                        tooltip: 'Download',
                        scope: this,
                        handler: function(grid, rowIndex, colIndex){
                          //teste()
                          selected = grid.getStore().getAt(rowIndex);
                          console.log(selected.get('catalog_id'))
                          download_csv(selected.get('catalog_id'))                  
                        }
                    }]
                }
            ],

            bbar: Ext.create('Ext.PagingToolbar', {
                  store: store,
                  displayInfo: true,
                  emptyMsg: "No topics to display"
                  
              })
            
            // tbar: Ext.create('Ext.toolbar.Toolbar', {
            //     // renderTo: document.body,
            //     // width   : 500,
            //     items: [{
            //       minWidth: 80,
            //       text: 'Clear filters',
            //       handler: function() {
            //         grid.filters.clearFilters()
            //       }
            //   },{
            //       minWidth: 80,
            //       text: 'twitter',
            //       disabled: true
            //   },{
            //       //minWidth: 15,
            //       text: 'Delete',
            //       // iconCls: 'icon-purge',
            //       // tooltip: 'Remove Catalog',  
            //       handler: 'remove_targets_upload'
            //   },{
            //       //minWidth: 80,
            //       text: 'share',
            //       // iconCls: 'icon-share',
            //       // tooltip: 'Share',
            //       handler: function() {
            //         selected = grid.getSelectionModel().getSelection();
            //         if (selected.length > 0) {
            //           lista = []
            //           for(i=0; i<selected.length;i++){
            //             //console.log(selected[i].get('catalog_id'));
            //             lista.push(selected[i].get('process_id'))
            //           }
            //           mySharedProcess(lista)
            //         }else{
            //           Ext.Msg.alert("", 'Please select catalog to be shared.');
            //         }
            //       }
            //   },{          
            //     // iconCls:'icon-readme',
            //     // tooltip: 'Readme',
            //     text: 'Readme',
            //     handler: function() {
            //       selected = grid.getSelectionModel().getSelection();            
            //       if (selected.length == 1) {                            
            //         page = null
            //         tree = treePanel.getSelectionModel().getSelection()
            //         if (tree.length > 0){                   
            //           page = tree[0].data.text
            //         }
            //         get_readme_of_catalog(selected[0].get('catalog_name'),selected[0].get('catalog_id'),selected[0].get('class_id'), page)
            //       }else if (selected.length > 1){
            //         Ext.Msg.alert("", 'Please select just one catalog.');
            //       }else if(selected.length == 0){
            //         Ext.Msg.alert("", 'Please select one catalog.');              
            //       }
            //     }
            //   },{
            //     text: 'View',        
            //     // iconCls:'View',
            //     tooltip: 'View', 
            //     handler: function() {
            //       selected = grid.getSelectionModel().getSelection();            
            //       if (selected.length == 1) {                            
            //         page = null
            //         tree = treePanel.getSelectionModel().getSelection()
            //         if (tree.length > 0){                   
            //           page = tree[0].data.text
            //         }
            //         selectView(page, selected[0].get('rd_path'), selected[0].get('catalog_id'))
            //       }else if (selected.length > 1){
            //         Ext.Msg.alert("", 'Please select just one catalog.');
            //       }else if(selected.length == 0){
            //         Ext.Msg.alert("", 'Please select one catalog.');              
            //       }
            //     }
            //   },
              
            //   {
            //     //minWidth: 80,
            //     // text: 'share',
            //     // iconCls: 'icon-share',
            //     text: 'Provenance',
            //     tooltip: 'Provenance',
            //     handler: function() {
            //       selected = grid.getSelectionModel().getSelection();            
            //       if (selected.length == 1) {              
            //         provenance(selected[0].get('process_id'))              
                   
            //       }else if (selected.length > 1){
            //         Ext.Msg.alert("", 'Please select just one catalog.');
            //       }else if(selected.length == 0){
            //         Ext.Msg.alert("", 'Please select one catalog.');              
            //       }
            //     }
            //   },{          
            //     text: 'Product log',
            //     tooltip: 'Product log',
            //     handler: 'productLog'
            //   }
             
            //   // {
            //   //     //minWidth: 80,
            //   //     iconCls: 'icon-readme',
            //   //     tooltip: 'Readme'
            //   // }
            //   ]
            // })
        });
        this.callParent();
    }


    

    // listeners: {
    //     select: 'onItemSelected'
    // }
});
