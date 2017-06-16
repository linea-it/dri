Ext.define('common.footer.FooterController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.footer',

    onClickContact: function () {

        if (this.wincontact) {
            this.wincontact = null;
        }

        this.wincontact = Ext.create('common.contact.Contact', {});

        this.wincontact.show();

    }

});
