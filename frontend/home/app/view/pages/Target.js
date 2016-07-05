Ext.define('Home.view.pages.Target', {
    extend: 'Home.view.pages.Template',
    xtype: 'pages-target',

    data: {
        host: 'http://desportal.cosmology.illinois.edu/dri/apps/',
        pageTitle: 'Target Viewer',
        appURL: 'target',
        imageUrl: 'resources/target.png',
        paragrafo1: 'Targets are relatively small lists of objects selected by a certain criteria and uploaded to the Science Server e.g. Galaxy Clusters, QSOs, Strong Lensing, Stellar Systems, Spectroscopic Targets, Color Outliers, Astrometric Outliers , etc. The main functionalities of the Target viewer are: ',
        paragrafo2:  '<ul class="app-paragrafo2"><li>Manage lists of targets</li> <li>Ability to upload</li> <li>Image preview</li> <li>List and Mosaic visualization</li>     <li>Ranking and reject</li>     <li>Ability to make FITS and PNG cutouts</li>     <li>SAbility to export target lists and cutouts</li> </ul>  <p class="app-paragrafo2">Target Viewer has an extension called Target Properties based on the type of target.  For instance for a Galaxy Cluster target, we can overlay a circle representing its virial radius or overlay X-Ray contours, etc.</p>'
    }
});
