import React, { Component } from 'react';
import styled from 'styled-components';
import { Route, Switch, withRouter } from 'react-router-dom';
import Impedance from './components/Impedance';
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { Container, Row } from 'react-bootstrap';
import { PhasedArray } from './components/PhasedArray';

class LocalRouter extends Component {
  render() {
    return (
      <Wrapper className='h-100'>
        <TransitionGroup className='transition-group'>
          <CSSTransition
              key={this.props.location.key}
              timeout={{ enter: 500, exit: 500 }}
              classNames={'fade'}>
             <Switch>
                <Route path="/phased_array">
                  <PhasedArray />
                </Route>
              </Switch>
          </CSSTransition>
        </TransitionGroup>
      </Wrapper>
    )
  }
}

export default withRouter(LocalRouter);

const Wrapper = styled.div`
    .fade-enter {
        opacity: 0.01;
    }
    .fade-enter.fade-enter-active {
        opacity: 1;
        transition: opacity 300ms ease-in;
    }
    .fade-exit {
        opacity: 1;
    }
    .fade-exit.fade-exit-active {
        opacity: 0.01;
        transition: opacity 300ms ease-in;
    }
    div.transition-group {
      position: relative;
      height: 100%;
    }
    section.route-section {
      position: absolute;
      width: 100%;
      flex: 1;
      top: 0;
      left: 0;
    }
`;