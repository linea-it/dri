Ext.define('home.store.Menu', {
    extend: 'common.store.MyStore',

    alias: 'store.menu',

    remoteFilter: true,

    remoteSort: true,

    pageSize: 100,

    proxy: {
         type: 'django',
         url: '/dri/api/application/'
    }
    
    // data : [
    //     {title: 'Home', iconCls: 'fa-home', items: [{ xtype: 'pages-home' }], disabled: false}, 
    //     {title: 'Releases', iconCls: 'fa-check', items: [{xtype: 'pages-release'}], disabled: true},
    //     {title: 'Sky Viewer', iconCls: 'fa-star', items: [{xtype: 'pages-sky'}], disabled: false},
    //     {title: 'Tile Viewer', iconCls: 'fa-th', hidden: true, bind: {html: '{loremIpsum}'}, disabled: false},
    //     {title: 'Target Viewer', iconCls: 'fa-dot-circle-o', items: [{ xtype: 'pages-target'}], disabled: true},
    //     {title: 'Sky Query', iconCls: 'fa-database', bind: {html: '{loremIpsum}'}, disabled: true},
    //     {title: 'Upload', iconCls: 'fa-upload', bind: { html: '{loremIpsum}' }, disabled: true},
    //     {title: 'Cutout Server', iconCls: 'fa-picture-o', bind: { html: '{loremIpsum}'}, disabled: true}
    // ]

});