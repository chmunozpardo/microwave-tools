import React from 'react';
import * as d3 from 'd3';
import {Row, Col, Container} from 'react-bootstrap';

class Test extends React.Component{
  
  myRef = React.createRef();

  componentDidMount(){
    d3.select(this.myRef.current);

    var svg = d3.select(this.myRef.current).append("svg");

    svg.append("circle")
      .attr("r", 100)
      .attr("cx", 200)
      .attr("cy", 200);
  }
  
  render(){
    return (
      <Container>
        <Row>
          <Col xs={{span: 6, offset: 2}} ref={this.myRef}/>
          <Col xs={4}/>
        </Row>
      </Container>
    )
  }
}

export default Test;