// ## EXEMPLO DE GOOGLE ANALYTICS ##
// To enable Google Analytics in one of the environments.
// Create a new file called google-analytics.js copy and paste the template below, replace the ID G-XXXXXXXXXX with the Google Analitcs key.
// In the compose docker mount the file in order to overwrite the template in the /var/www/ga directory.

// GA ID for Colaboration enviroment: G-EEW8XVF479
// GA ID for Public enviroment: G-2JMWE98YJD

// Global site tag(gtag.js) - Google Analytics
// NOTE: Uncomment the script below

// function loadGoogleAnalytics() {
//     var ga = document.createElement('script');
//     ga.type = 'text/javascript';
//     ga.async = true;
//     ga.src = 'https://www.googletagmanager.com/gtag/js?id=G-EEW8XVF479';
//     var s = document.getElementsByTagName('script')[0];
//     s.parentNode.insertBefore(ga, s);
// }

// loadGoogleAnalytics(); 

// window.dataLayer = window.dataLayer || [];
// function gtag() { dataLayer.push(arguments); }
// gtag('js', new Date());
// gtag('config', 'G-EEW8XVF479');