Ext.define('Admin.view.dashboard.Todos', {
    extend: 'Ext.panel.Panel',
    xtype: 'dashboardtodospanel',

    requires: [
        'Ext.button.Button',
        'Ext.container.Container',
        'Ext.layout.container.VBox'
    ],

    height: 250,
    width: 430,
    bodyPadding: 10,

    layout: {
        type: 'vbox',
        align: 'middle'
    },

    cls: 'social-panel shadow-panel',

    items: [
        {
            xtype: 'component',
            cls: 'userProfileName',
            height: '',
            html: '<b>Description</b>',
            margin: '10 10 10 10'
        },
        {
            xtype: 'label',
            scrollable : true,
            text: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? ',
            // cls: 'userProfilePic',
            height: 150,
            width: 400,
            // alt: 'profile-picture',
            // src: 'resources/images/destiles.png'
        },
        // {
        //     xtype: 'component',
        //     cls: 'userProfileName',
        //     height: '',
        //     html: 'Sky Viewer'
        // },
        // {
        //     xtype: 'component',
        //     cls: 'userProfileDesc',
        //     html: 'CO-FOUNDER, CEO'
        // },
        // {
        //     xtype: 'container',
        //     layout: 'hbox',
        //     defaults: {
        //         xtype: 'button',
        //         margin: 5
        //     },
        //     margin: 5,
        //     items: [
        //         {
        //             ui: 'blue',
        //             iconCls: 'x-fa fa-facebook'
        //         },
        //         {
        //             ui: 'soft-cyan',
        //             iconCls: 'x-fa fa-twitter'
        //         },
        //         {
        //             ui: 'soft-red',
        //             iconCls: 'x-fa fa-google-plus'
        //         },
        //         {
        //             ui: 'soft-purple',
        //             iconCls: 'x-fa fa-envelope'
        //         }
        //     ]
        // },
        {
            xtype: 'button',
            scale: 'large',
            width: 400,
            text: 'Sky Viewer'
        }
    ]
});
