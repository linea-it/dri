/**
 * This view is an example list of people.
 */
Ext.define('Products.view.main.Products', {
    extend: 'Ext.grid.Panel',
    
    xtype: 'mainlist',
    // plugins: 'gridfilters',
    emptyText: 'No data to dysplay.',
    initComponent: function(){
        var pluginExpanded = true;
        var store = Ext.create('Products.store.Products');
        Ext.apply(this, {
            store: store,            
            columns: [
                {
                    xtype: 'rownumberer'
                },
                { 
                  text: 'Type', 
                  dataIndex: 'pgr_display_name',
                  width: 150,
                   
                  filter: {
                    type: 'string',
                    itemDefaults: {
                        emptyText: 'Search for...'
                    }
                  }
                },
                { 
                  text: 'Name', 
                  dataIndex: 'prd_display_name',
                  width: 150,
                   
                  filter: {
                    type: 'string',
                    itemDefaults: {
                        emptyText: 'Search for...'
                    }
                  }
                },
                { 
                  text: 'Class', 
                  dataIndex: 'pcl_display_name',
                  width: 150,
                   
                  filter: {
                    type: 'string',
                    itemDefaults: {
                        emptyText: 'Search for...'
                    }
                  }
                },
                { 
                    text: 'Process ID', 
                    dataIndex: 'epr_original_id',
                    renderer: function(value, metaData, record, rowIndex, colIndex, store, view){
                        return     value    
                    },
                    filter: 'number' 
                },
                { 
                    text: 'Owner', 
                    dataIndex: 'epr_username',
                    renderer: function(value, metaData, record, rowIndex, colIndex, store, view){
                        return     value    
                    },
                      filter: {
                        type: 'string',
                        itemDefaults: {
                            emptyText: 'Search for...'
                        }
                      }
                },
                { 
                    text: 'Band', 
                    dataIndex: 'prd_filter',
                    renderer: function(value, metaData, record, rowIndex, colIndex, store, view){
                        if (value == null){
                            return     '---'    
                        }else{
                            return     value    
                        }
                        
                    },
                      filter: {
                        type: 'string',
                        itemDefaults: {
                            emptyText: 'Search for...'
                        }
                      }
                },
                // { 
                //   text: 'Release', 
                //   dataIndex: 'release_display_name',
                //   renderer: function(value, metaData, record, rowIndex, colIndex, store, view){
                //     return     value    
                //   },
                //   filter: {
                //     type: 'string',
                //     itemDefaults: {
                //         emptyText: 'Search for...'
                //     }
                //   }
                // },
                // { 
                //   text: 'Field', 
                //   dataIndex: 'display_name',
                //   width: 150,
                //   renderer: function(value, metaData, record, rowIndex, colIndex, store, view){
                //     return     value    
                //   },
                //   filter: {
                //     type: 'string',
                //     itemDefaults: {
                //         emptyText: 'Search for...'
                //     }
                //   }
                // },
                { 
                  text: 'Date', 
                  dataIndex: 'epr_end_date',
                  width: 150,
                  renderer: function(value, metaData, record, rowIndex, colIndex, store, view){
                    return     value.substring(0,10)    
                  },
                  filter: {
                    type: 'string',
                    itemDefaults: {
                        emptyText: 'Search for...'
                    }
                  }
                },
                // { 
                //   text: 'Tablename', 
                //   dataIndex: 'prd_table_ptr',
                //   width: 250,
                  
                //   filter: {
                //     type: 'string',
                //     itemDefaults: {
                //         emptyText: 'Search for...'
                //     }
                //   }
                // },
                
                // { 
                //   text: 'Start Time', 
                //   dataIndex: 'start_time',
                //   width: 150,
                //   renderer: function(value, metaData, record, rowIndex, colIndex, store, view){
                //     return     value    
                //   },
                //   filter: {
                //     type: 'string',
                //     itemDefaults: {
                //         emptyText: 'Search for...'
                //     }
                //   }
                // },
                // { 
                //   text: 'Creation', 
                    
                //   dataIndex: 'creation_date',  
                //   filter: 'date'
                //   // renderer: function(value, metaData, record, rowIndex, colIndex, store, view){            
                //   //   catalog = 'catalog'
                //   //   tree = treePanel.getSelectionModel().getSelection()
                //   //   if (tree[0].data.type_id == 3){
                //   //     selected = grid.getStore().getAt(rowIndex);
                //   //     return selected.get('ingestion_date')
                //   //   }else{
                //   //     return value
                //   //   }
                //   // }
                // },
                // { 
                //   text: 'Publish', 
                //   dataIndex: 'registered', 
                //   filter: 'date',
                    
                //   renderer: function(value, metaData, record, rowIndex, colIndex, store, view){            
                //     if (value != null){
                //       tree = treePanel.getSelectionModel().getSelection()
                //       if (tree[0].data.type_id == 3){
                //         selected = grid.getStore().getAt(rowIndex);
                //         return selected.get('creation_date')
                //       }else{
                //         return value.substring(0,10)
                //       }
                //     }else{
                //       return '---'
                //     }
                //   }
                // },
                {
                    xtype: 'actioncolumn',
                    width: 30,
                    sortable: false,
                    menuDisabled: true,
                    // flex:true,
                    items: [{
                        iconCls:'x-fa fa-download ',
                        tooltip: 'Download',
                        scope: this,
                            //handler: function(grid, rowIndex, colIndex){
                            //  //teste()
                            //  selected = grid.getStore().getAt(rowIndex);
                            //  console.log(selected)
                            //  Ext.MessageBox.confirm('Download', 'Are you sure ?', function(btn){
                            //    if(btn === 'yes'){
                            //      Ext.Msg.alert("Download", 'The creation of the file will be made in backgound, when finished you will receive an email containing the link to download.');
                            //      // console.log(selected.get('process_id'))
                            //      // console.log(selected.get('schema_name'))
                            //      // console.log(selected.get('table_name'))
                            //      Ext.Ajax.request({
                            //        url: "/PRJSUB/Monitor/downloadCatalog",
                            //        params: {
                            //            'process_id': selected.get('process_id'),
                            //            'pruduct_class_name': selected.get('class_display_name'),
                            //            'product_id': null                
                            //        },
                            //        success: function(response) {
                            //            // Recuperar a resposta e fazer o decode no json.
                            //            var obj = Ext.decode(response.responseText);
                            //            console.log(obj)
                            //            if (obj.data == true) {
                            //              console.log('true')                      
                            //            }else{
                            //              Ext.Msg.alert("Erro")
                            //            };
                            //        }
                            //      })
                            //    }
                            //    else{
                            //      result = false
                            //    }
                            //  })
                            //  
                            //  // console.log(selected.get('catalog_id'))
                            //  // download_csv(selected.get('catalog_id'))                  
                            //}
                    }]
                },{
                    xtype: 'actioncolumn',
                    width: 30,
                    sortable: false,
                    menuDisabled: true,
                    // flex:true,
                    items: [{
                        iconCls:'x-fa fa-info ',
                        tooltip: 'Product information',
                        handler : 'productInfo'
                    }]
                }
                // {
                //     xtype: 'actioncolumn',
                //     width: 30,
                //     sortable: false,
                //     menuDisabled: true,
                //     // flex:true,
                //     items: [{
                //         iconCls:'x-fa fa-minus-circle',
                //         tooltip: 'Delete',
                //         handler: 'purgeWindow'
                //     }]
                // },{
                //     xtype: 'actioncolumn',
                //     width: 30,
                //     sortable: false,
                //     menuDisabled: true,
                //     items: [{
                //         iconCls:'x-fa fa-sitemap',
                //         tooltip: 'Provenance',
                //         handler: 'provenance'
                //     }]
                // },{
                //     xtype: 'actioncolumn',
                //     width: 30,
                //     sortable: false,
                //     menuDisabled: true,
                //     // flex:true,
                //     items: [{
                //         iconCls:'x-fa fa-link',
                //         tooltip: 'Product log',
                //         handler: function(grid, rowIndex, colIndex){
                //             process_id = grid.getStore().getAt(rowIndex).get('process_id');
                //             window.open("/VP/getViewProcessCon?process_id=" process_id);
                //         }
                //     }]
                // },{
                //     xtype: 'actioncolumn',
                //     width: 30,
                //     sortable: false,
                //     menuDisabled: true,
                //     flex:true,
                //     items: [{
                //         iconCls:'x-fa fa-share',
                //         tooltip: 'Export',
                //         handler: 'validExport'
                //     }]
                // }
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
            //           for(i=0; i<selected.length;i  ){
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

