Ext.define('common.contact.ContactController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.contact',

    onFormCancel: function () {
        this.getView().lookupReference('windowForm').getForm().reset();
        this.getView().close();
    },

    onFormSubmit: function () {
        var view = this.getView(),
            formPanel = view.lookupReference('windowForm'),
            form = formPanel.getForm(),
            data = form.getValues();

        // Dados Tecnicos
        data.current_url = window.location.href;
        data.current_user = window.sessionStorage.dri_username;

        if (form.isValid()) {

            Ext.Ajax.request({
                url: '/dri/api/contact/',
                method: 'POST',
                params: data,
                success: function () {

                    view.close();

                    Ext.MessageBox.alert(
                        'Thank you!',
                        'Your inquiry has been sent. We will respond as soon as possible.'
                    );
                },
                failure: function (response, opts) {
                    Ext.MessageBox.show({
                        title: response.status + ' - ' + response.statusText,
                        msg: 'Sorry, message was not sent.',
                        buttons: Ext.MessageBox.OK,
                        icon: Ext.MessageBox.WARNING,
                        scope: this
                    });
                }
            });
        }
    }

});
