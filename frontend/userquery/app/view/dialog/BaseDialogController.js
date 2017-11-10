Ext.define('UserQuery.view.dialog.OpenDialogController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.basedialog',

    setLoading: function(state, text){
        if (!this.loadingMask){
            this.loadingMask = new Ext.LoadMask({
                msg    : 'Please wait...',
                target : this.getView()
            });
        }

        //this.loadingMask.useMsg = text ? true : false;
        this.loadingMask.msg = text || 'Loading...';
        this.loadingMask[state ? 'show' : "hide"]();
    }
});
