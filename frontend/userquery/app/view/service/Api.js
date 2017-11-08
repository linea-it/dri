Ext.define('UserQuery.view.service.Api', {
    extend: 'UserQuery.view.service.ApiBase',
    singleton: true,
    alternateClassName: 'Api',

    URL: {
        doLogin: '/dri/api/api-auth/login/next=',
        getUser: '/dri/api/logged/get_logged/?format=json',
        getReleases: '/dri/api/releases/',
        getTables: '/dri/api/catalog/',
        getFields: '/dri/api/productcontent/' // ?pcn_product_id=25
        // http://dri.com/dri/api/catalog/get_class_tree_by_group/?external_catalog=true&group__in=objects_catalog,targets,value_added_catalogs,external_catalogs&node=root

    },

    getUser: function(definition){
        this.send('GET', this.URL.getUser, definition);
    },

    getReleases: function(definition){
        this.send('GET', this.URL.getReleases, definition);
    },

    getRelease: function(definition){
        var responseCallback = definition.response;

        definition.params = definition.params || {};

        definition.response = function(error, result){
            var releaseData = error ? null : result.find(function(item){return item.id==definition.params.id})
            responseCallback (error, releaseData);
        }

        this.send('GET', this.URL.getReleases, definition);
    },

    getTables: function(definition){
        this.send('GET', this.URL.getTables, definition);
    },

    getFields: function(definition){
        this.send('GET', this.URL.getFields, definition);
    },

    getQueries: function(definition){
        var me = this;

        setTimeout(function(){
            me.responseAnalyse( null, getQueriesTest(), definition );
        }, 2000);
    },

    getJobs: function(definition){
        var me = this;

        setTimeout(function(){
            me.responseAnalyse( null, getJobsTest(), definition );
        }, 2000);
    },

    startJob: function(definition){
        var me = this;
        var jobs = getJobsTest();

        jobs.push(definition.data);
        sessionStorage.setItem('jobs', JSON.stringify(jobs));

        setTimeout(function(){
            me.responseAnalyse( null, definition, definition );
        }, 2000);
    },

    doLogin: function(){
        var protocol = window.location.protocol;
        var pathname = window.location.pathname;
        var hostname = window.location.host;

        window.location.assign(`${protocol}//${hostname}${this.URL.doLogin}${pathname}`);
    }
});

function getQueriesTest(){
    return {
        my_queries: [
            { id:'query1', text: 'Query 01', releaseText:'NCSA Y3', name:'Query 01', description:'query 01 description', sql:'select * from table1'},
            { id:'query2', text: 'Query 02', releaseText:'NCSA Y1 Wide Survey',name:'Query 02', description:'query 02 description', sql:'select * from table2 order by 0'}
        ],
        samples: [
            { text: 'Sample 01', description:'sample 01 description', sql:'select * from table_of_sample_01'},
            { text: 'Sample 02', description:'sample 02 description', sql:'select field1, field2 from table_of_sample_02'}
        ]
    };
}

function getReleasesTest(){
    return [
         {text: 'Y3 DEEP'},
         {text: 'Y3'},
         {text: 'Y1 Supplemental D04'},
         {text: 'Y1 Supplemental D10'},
         {text: 'Y1 Supplemental DFULL'},
         {text: 'Y1 Wide Survey'},
    ];
}

function getJobsTest(){
    var jobs;

    try{
        jobs = JSON.parse(sessionStorage.getItem('jobs'));
    }catch(e){
        jobs = [];
    }
}

function hash(str) {
    var hash = 0;
    if (str.length == 0) return hash;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

// limite de tempo de execução e limite de linhas

// http://dri.com/dri/api/productcontent/?pcn_product_id=25
//  [
//     {
//         "id": 1323,
//         "pcn_product_id": 25,
//         "pcn_column_name": "SEQNR" //nome da tabela
//     }
//  ]

// https://github.com/linea-it/dri/blob/develop/frontend/packages/local/common/src/store/MyStore.js
// https://github.com/linea-it/dri/blob/develop/frontend/target/app/view/settings/PermissionController.js#L127
// https://github.com/linea-it/dri/blob/develop/frontend/target/app/store/CutoutJobs.js

// var store = new GetUser();

// store.load(function(records, operation, success) {
//     console.log(records, operation, success);
// });
