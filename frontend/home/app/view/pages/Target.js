Ext.define('Home.view.pages.Target', {
    extend: 'Home.view.pages.Template',
    xtype: 'pages-target',

    data: {
        host: '',
        pageTitle: 'Target Viewer',
        appURL: 'target',
        imageUrl: 'resources/target.png',
        paragrafo1: 'Targets are relatively small lists of objects selected by a certain criteria and uploaded to the Science Server e.g. Galaxy Clusters, QSOs, Strong Lensing, Stellar Systems, Spectroscopic Targets, Color Outliers, Astrometric Outliers , etc.',
        paragrafo2: 'The main functionalities are:'
    }
});
