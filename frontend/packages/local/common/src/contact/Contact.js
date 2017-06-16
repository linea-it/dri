Ext.define('common.contact.Contact', {
    extend: 'Ext.window.Window',

    requires: [
        'common.contact.ContactController'
    ],

    xtype: 'form-contact-window',

    reference: 'contactWindow',

    title: 'Contact Us',

    controller: 'contact',

    width: 400,
    height: 500,
    minWidth: 300,
    minHeight: 380,
    layout: 'fit',
    resizable: true,
    modal: true,
    defaultFocus: 'firstName',
    closeAction: 'destroy',

    items: [{
        xtype: 'form',
        // url: 'http://dri.com/dri/api/contact/',
        // method: 'POST',
        reference: 'windowForm',
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        border: false,
        bodyPadding: 10,

        fieldDefaults: {
            msgTarget: 'side',
            labelAlign: 'top',
            labelWidth: 100,
            labelStyle: 'font-weight:bold'
        },

        items: [
            {
                margin: '0 0 20 0',
                xtype: 'component',
                html: [
                    'Thank you for visiting our site! We welcome your feedback; ',
                    'please click the button below to send us a message. We will ',
                    'respond to your inquiry as quickly as possible.'
                ]
            },
            {
                xtype: 'textfield',
                fieldLabel: 'Name',
                name: 'name',
                allowBlank: false
            },
            {
                xtype: 'textfield',
                fieldLabel: 'Your Email Address',
                vtype: 'email',
                name: 'from',
                allowBlank: false
            },
            {
                xtype: 'textfield',
                fieldLabel: 'Subject',
                name: 'subject',
                allowBlank: false
            },
            {
                xtype: 'textareafield',
                fieldLabel: 'How can we help?',
                labelAlign: 'top',
                flex: 1,
                margin: '0',
                name: 'message',
                allowBlank: false,
                emptyText: 'Describe the problem or share your ideas.'
            }
        ],

        buttons: [{
            text: 'Cancel',
            handler: 'onFormCancel'
        }, {
            text: 'Send',
            handler: 'onFormSubmit'
        }]
    }]

});
