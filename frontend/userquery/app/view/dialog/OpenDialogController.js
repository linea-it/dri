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

        // busca lista que queries
        Api.getQueries({
            cache: false,
            proxy: 'toTreeStore',
            request: function(){
                me.getView().setLoading(true, 'Loading queries...');
            },
            response: function(error, store){
                me.getView().setLoading(false);
                
                if (!error){
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
    result.forEach(function(item){
        item.text = item.name;
        item.leaf = true;
    });

    return Ext.create('Ext.data.TreeStore', {
        root: {
            expanded: true,
            children: [
                {text: 'My Queries', expanded: true, isgroup:true, children:result},
                {text: 'Samples', expanded: true, isgroup:true, children:[]}
            ]
        }
    });
});
