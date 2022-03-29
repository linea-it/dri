Ext.define('common.account.AccountController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.account',




    newApiToken: function (product) {
        var me = this,
            txtToken = me.lookup('txtToken'),
            btnCopy = me.lookup('btnCopy');

        // Faz a requisição do token
        Ext.Ajax.request({
            method: 'Post',
            url: Ext.manifest.apiBaseUrl + '/dri/api/get_token',
            success: function (response) {
                var data = JSON.parse(response.responseText);

                txtToken.setValue(data.token)
                btnCopy.enable()
            },
            failure: function (response, opts) {
                // console.log(response)
                Ext.MessageBox.show({
                    title: 'Unable to create the Token',
                    msg: 'Please try again and if the problem persists, contact the helpdesk.',
                    buttons: Ext.MessageBox.OK,
                });
            }
        });

    },

    copyToken: function () {
        var me = this,
            token = me.lookup('txtToken').getValue();

        if (token !== '') {
            me.copyTextToClipboard(token)
        }
    },

    copyTextToClipboard: function (text) {
        var me = this;

        if (!navigator.clipboard) {
            me.fallbackCopyTextToClipboard(text);
            return;
        }
        navigator.clipboard.writeText(text).then(function () {
            // console.log('Async: Copying to clipboard was successful!');

            Ext.toast({ html: 'Copied!', align: 't' });
        }, function (err) {
            console.error('Async: Could not copy text: ', err);
        });
    },

    fallbackCopyTextToClipboard: function (text) {
        var textArea = document.createElement("textarea");
        textArea.value = text;

        // Avoid scrolling to bottom
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';

            // console.log('Fallback: Copying text command was ' + msg);
            Ext.toast({ html: 'Copied!', align: 't' });

        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }

        document.body.removeChild(textArea);
    },

});
