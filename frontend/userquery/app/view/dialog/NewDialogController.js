Ext.define('UserQuery.view.dialog.NewDialogController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.newdialog',
    
    dialog_onOpen: function(callback){
        var me = this;
        var refs = me.getReferences();

        me._release = null;
        me._callback = callback;

        refs.btnConfirm.setDisabled(true);

        me.getView().setLoading(true, 'Loading releases...');

        Api.getReleases({
            cache: true,
            proxy: function(result){
                // evita exibir o ícone "+" para cada item da lista
                result.forEach(function(item){
                    item.leaf = true;
                });                
                return Ext.create('Ext.data.TreeStore', {root: {children: result}});
            },
            response: function(error, store){
                me.getView().setLoading(false);
                
                if (error){
                    console.warn(error);
                }else{
                    refs.treelist.setStore(store);
                }
            }
        });

    },

    dialog_onClose: function(){
        if (this._callback){
            this._callback(this._release);
        }

        delete(this._callback);
        delete(this._release);
    },

    treelist_onSelectionChange: function(treelist, node){
        this._release = node[0].data;
        this.getReferences().btnConfirm.setDisabled(false);
    }
});

Api.proxy('toListStore', function(result){
    // evita exibir o ícone + para cada item da lista
    result.forEach(function(item){
        item.leaf = true;
    });
    
    return Ext.create('Ext.data.TreeStore', {
        root: {
            children: result
        }
    });
});

