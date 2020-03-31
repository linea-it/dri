import React from 'react';
import Container from '@material-ui/core/Container';
import Stars from '../../components/Stars';
import Banner from '../../components/Banner';
import Interfaces from './partials/Interfaces';
import Supporters from './partials/Supporters';


function Main() {
  return (
    <div>
      <Stars />
      <Banner />
      <Container>
        <Interfaces />
        <Supporters />
      </Container>
    </div>
  );
}

export default Main;
