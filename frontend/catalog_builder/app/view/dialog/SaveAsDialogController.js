Ext.define('CatalogBuilder.view.dialog.SaveAsDialogController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.saveasdialog',
    
    dialog_onOpen: function(callback){
        this._callback = callback;
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
