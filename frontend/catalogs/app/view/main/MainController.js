/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('Catalogs.view.main.MainController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.main',

    onItemSelected: function (sender, record) {

        var refs = this.getReferences()
            gridCatalogs = refs.catalogs,
            storeCatalogs = gridCatalogs.getStore();

        storeCatalogs.clearFilter(true);

        filters = [
          {'property':'catalog.flag_removed', 'value':'false'}
        ]
        if (record.get('type_id') == 1) {
        filters.push({'property':'product_type.type_name', 'value':'value_added_catalogs'})//,{'property':'processes.flag_published', 'value':'true'})
        }
        if (record.get('type_id') == 2) {
        filters.push({'property':'product_type.type_name', 'value':'value_added_catalogs'}, {'property':'product_class.class_name','value':'Survey'})//,{'property':'processes.flag_published', 'value':'true'})
        }
        if (record.get('type_id') == 3) {
        filters.push({'property':'product_type.type_name', 'value':'targets'}, {'property':'upload_catalog.catalog_id','value':'null', 'operator':'is'})//,{'property':'processes.flag_published', 'value':'true'})
        }
        if (record.get('type_id') == 4) {
        filters.push({'property':'product_type.type_name', 'value':'targets'}, {'property':'upload_catalog.catalog_id','value':'null', 'operator':'is not'})//,{'property':'processes.flag_published', 'value':'true'})
        }
        if (record.get('type_id') == 5) {
        filters.push({'property':'product_type.type_name', 'value':'external_catalogs'})//,{'property':'processes.flag_published', 'value':'true'})
        }
        if (record.get('type_id') == 6) {
        filters.push({'property':'product_type.type_name', 'value':'simulations'})//,{'property':'processes.flag_published', 'value':'true'})        
        }
      
        
        storeCatalogs.filter(filters)
    },


    remove_targets_upload: function(){
        var refs = this.getReferences()
            gridCatalogs = refs.catalogs,
            storeCatalogs = gridCatalogs.getStore();
        selected = gridCatalogs.getSelectionModel().getSelection();
        
        if (selected.length > 0) {
            listaCatalog = []
            listaProcess = []
            for(i=0; i<selected.length;i++){
                if (selected[i].get('catalog_id') == null){
                    listaCatalog.push(selected[i].get('catalogcatalog_id'))
                }else{
                    listaCatalog.push(selected[i].get('catalog_id'))
                }                      
                    listaProcess.push(selected[i].get('process_id'))
            }
            console.log(listaCatalog)              
        }else{
            Ext.Msg.alert("", 'Please select catalogs to be removed.');
        }
    

        result = false
      
          // var result = confirm("The Catalogs will be removed. Do you want continue?");
        Ext.MessageBox.confirm('Delete', 'Are you sure ?', function(btn){
            if(btn === 'yes'){
              result = true
            }
            else{
              result = false
            }              
            if (result == true) {        
                
                console.log(listaCatalog)
                console.log(listaProcess)
                Ext.Ajax.request({
                    url: "/PRJSUB/TargetViewer/removeCatalogByUser",
                    params: {
                        "catalog_id": listaCatalog, 
                        "process_id": listaProcess
                    },
                    success: function(response) {
                        var obj = Ext.decode(response.responseText);                
                        storeCatalogs.remove(selected);
                    },
                    failure: function(response, opts) {
                        var obj = Ext.decode(response.responseText);
                        store.remove(selected);
                        Ext.Msg.alert('Delete', obj.msg);                       
                    }
                })
            }
        });
    },

    productLog: function() {
        var refs = this.getReferences()
            gridCatalogs = refs.catalogs,
            selected = gridCatalogs.getSelectionModel().getSelection();
        if (selected.length == 1) {                            
            window.open("/VP/getViewProcessCon?process_id="+selected[0].get('process_id') , width=800,height=800);
        }else if (selected.length > 1){
            Ext.Msg.alert("", 'Please select just one catalog.');
        }else if(selected.length == 0){
            Ext.Msg.alert("", 'Please select one catalog.');
        }
    },

        onConfirm: function (choice) {
        if (choice === 'yes') {
            //
        }
    }
});
