Ext.require('UserQuery.view.service.Api');

Ext.define('UserQuery.view.dialog.DownloadDialogController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.downloaddialog',
    
    dialog_onOpen: function(data, callback){
        var me = this;
        var refs = me.getReferences();
        
        me._query = null;
        me._callback = callback;
        
        // busca lista que queries
        Api.getFields({
            cache: true,
            params: data,
            request: function(){
                me.getView().setLoading(true, 'Loading fields...');
            },
            response: function(error, result){
                me.getView().setLoading(false);
                
                if (!error){
                    result.columns.forEach(function(item){
                        item.selected = true;
                    });
                    
                    refs.grdFields.getStore().loadData(result.columns);
                }
            }
        });

    },

    dialog_onCancel: function(){
        // this._query = null;
    },

    dialog_onClose: function(){
        delete(this._callback);
    },

    dialog_onConfirm: function(){
        var refs = this.getReferences();
        var store= refs.grdFields.getStore();
        var columns = [];
        
        store.data.items.forEach(function(item){
            if (item.data.selected){
                columns.push(item.data.column_name.toLowerCase());
                // columns.push({
                //     column_name: item.data.column_name,
                //     display_name: item.data.display_name
                // });
            }
        });

        if (this._callback){
            this._callback(columns);
        }
    }
});
