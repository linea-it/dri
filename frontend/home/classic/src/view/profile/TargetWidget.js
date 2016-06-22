Ext.define('Admin.view.profile.TargetWidget', {
    extend: 'Ext.panel.Panel',
    xtype: 'targetwidget',

    requires: [
        'Ext.button.Button',
        'Ext.container.Container',
        'Ext.layout.container.VBox'
    ],

    height: 190,
    width: 310,
    bodyPadding: 10,

    layout: {
        type: 'vbox',
        align: 'middle'
    },

    cls: 'social-panel shadow-panel',

    items: [
        {
            xtype: 'panel',
            layout: 'hbox',
            width: 300,
            items: [
            {
                xtype: 'image',
                height: 120,
                width: 150,
                alt: 'profile-picture',
                src: '/dri/apps/home/resources/images/placeholder_250x200.jpg'
            },{
                xtype: 'component',
                height: '',
                html: '<br><br>Lorem ipsum dolor sit amet, est accumsan aenean scelerisque aenean, sed dapibus. Et etiam mauris, dui orci proin.'
            }]
        },
        {
            xtype: 'button',
            scale: 'large',
            width: 280,
            text: 'Target Viewer',
            handler : function () {
                window.open('/dri/apps/target/#home', '_self');
            }
        }
    ]
});
