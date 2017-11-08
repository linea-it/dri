Ext.require('UserQuery.view.service.Api');

Ext.define('UserQuery.view.dialog.OpenDialogController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.opendialog',
    
    dialog_onOpen: function(callback){
        var me = this;
        var refs = me.getReferences();

        me._query = null;
        me._callback = callback;

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
        if (this._callback){
            this._callback(this._query);    
        }

        delete(this._callback);
        delete(this._query);
    }
});

Api.proxy('toTreeStore', function(result){
    result.my_queries.forEach(function(item){
        item.leaf = true;
    });
    result.samples.forEach(function(item){
        item.leaf = true;
    });

    return Ext.create('Ext.data.TreeStore', {
        root: {
            expanded: true,
            children: [
                {text: 'My Queries', expanded: true, isgroup:true, children:result.my_queries},
                {text: 'Samples', expanded: true, isgroup:true, children:result.samples}
            ]
        }
    });
});
