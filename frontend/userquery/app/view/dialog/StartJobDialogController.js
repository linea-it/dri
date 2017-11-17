Ext.require('UserQuery.view.service.Api');

Ext.define('UserQuery.view.dialog.StartJobDialogController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.startjobdialog',
    
    dialog_onOpen: function(data, callback){
        // TODO
        // verifica se o job já está em andamento
        
        var me = this;
        var refs = me.getReferences();
        
        refs.frmForm.getForm().setValues({
            display_name: 'job ' + data.name,
            table_name: data.name.replace(/\W+/g, "_")
        });

        me._query = null;
        me._callback = callback;

        return

        refs.btnConfirm.setDisabled(true);

        // define os dados da treeview
        me.getView().setLoading(true, 'Loading queries...');
        Api.getQueries({
            proxy: 'toTreeStore',
            response: function(error, store){
                me.getView().setLoading(false);
                
                if (error){
                    console.log(error);
                }else{
                    refs.treepanel.setStore(store);
                }
            }
        });
        
        refs.treepanel.getSelectionModel().on('select', function(sm, node, index) {
            me._query = node.data.isgroup ? null : node.data;
            refs.btnConfirm.setDisabled(node.data.isgroup);
        });
    },

    dialog_onClose: function(){
        delete(this._callback);
    },

    dialog_onConfirm: function(){
        var data;
        var refs = this.getReferences();

        if (this._callback){
            data = refs.frmForm.getForm().getValues();
            this._callback(data);    
        }
    }
});

// Api.proxy('toTreeStore', function(result){
//     result.my_queries.forEach(function(item){
//         item.leaf = true;
//     });
//     result.samples.forEach(function(item){
//         item.leaf = true;
//     });

//     return Ext.create('Ext.data.TreeStore', {
//         root: {
//             expanded: true,
//             children: [
//                 {text: 'My Queries', expanded: true, isgroup:true, children:result.my_queries},
//                 {text: 'Samples', expanded: true, isgroup:true, children:result.samples}
//             ]
//         }
//     });
// });
