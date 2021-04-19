import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Home from '../pages/Home';
import AboutUs from '../pages/AboutUs';
import Help from '../pages/Help';
import Tutorials from '../pages/Tutorials';
import Contact from '../pages/Contact';
import OracleEasyAccess from '../pages/OracleEasyAccess';
import LineaSignUp from '../pages/LineaSignUp'
import Notfound from '../pages/NotFound';

function Router() {
  return (
    <BrowserRouter>
      <Header />
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/about-us" component={AboutUs} />
        <Route path="/help" component={Help} />
        <Route path="/tutorials" component={Tutorials} />
        <Route path="/contact-us" component={Contact} />
        <Route path="/oracle-easy-access" component={OracleEasyAccess} />
        <Route path="/linea-sign-up" component={LineaSignUp} />
        <Route component={Notfound} />
      </Switch>
      <Footer />
    </BrowserRouter>
  );
}

export default Router;
