import React, { createRef } from 'react'
import { Row, Col, Form, Container } from 'react-bootstrap';
import * as d3 from 'd3';

export class PhasedArray extends React.Component{
  svgRef = createRef(null);
  parametersRef = createRef(null);
  maxElements = 10;
  width = 0;
  height = 0;
  svgContainer = null;

  state = {
    elements: 1,
    arrayElements: []
  };

  elementsOnChange = (e) => {
    let numberInput = Number(e.target.value);
    if(numberInput < 1) {
      numberInput = 1;
    } else if (numberInput > this.maxElements) {
      numberInput = this.maxElements;
    }
    this.setState({
      elements: numberInput
    });
  }

  componentDidMount(){
    this.svgContainer = d3.select(this.svgRef.current);
    this.width = parseFloat(this.svgContainer.style('width'));
    this.height = parseFloat(this.svgContainer.style('height'));
    this.svgContainer.append('svg')
                .attr('width', this.width)
                .attr('height', this.height);
    var arrayElements = [];
    for(let i = 0; i < this.maxElements; i++){
      arrayElements.push({
        amplitude: 1,
        phase: 1
      });
    }
    this.setState({
      arrayElements: arrayElements
    })
  };

  plot = () => {
    var svgMargin = 0;
    var width = this.width;
    var height = this.height;
    var graphWidth  = width - svgMargin*2;
    var graphHeight = height - svgMargin*2;
    var N = 50;
    var xRange = 720;
    let lineData = [];
    let A = this.state.arrayElements[0].amplitude;
    let phi = this.state.arrayElements[0].phase;
    for(let i = 0; i < N; i++){
      let x = xRange*i/N;
      let y = A*Math.sin((x + phi)*Math.PI/180.0);
      lineData.push({'x': x*graphWidth/xRange + svgMargin, 'y': y*graphHeight/2 + graphHeight/2 + svgMargin})
    }
    var svg = this.svgContainer.select('svg');

    var lineFunction = d3.line()
                             .x(function(d){
                                return d.x;
                              })
                             .y(function(d){
                               return d.y;
                              })
                             .curve(d3.curveNatural);

    svg.selectAll('path').remove();
    svg.append('path')
       .attr('d', lineFunction(lineData))
       .attr('stroke', 'blue')
       .attr('stroke-width', 2)
       .attr('fill', 'none');
  }

  asdf = (event) => {
    event.preventDefault();
  }

  updateElement = (event) => {
    let splitID = event.target.id.split("_");
    let stringID = splitID[0];
    let elementID = splitID[1];
    let arrayElements = [...this.state.arrayElements];
    let singleElement = {...arrayElements[elementID]};
    if(stringID === "amplitude"){
      singleElement.amplitude = Number(event.target.value);
    } else if(stringID === "phase"){
      singleElement.phase = Number(event.target.value);
    }
    arrayElements[elementID] = singleElement;
    this.setState(
      {arrayElements},
      () => {
        this.plot();
      }
    );
  }

  calculateArrayFactor = () => {
  }

  generateParameters = () => {
    var rows = [];
    for(let i = 0; i < this.state.elements; i++){
        rows.push(
          <Row key={i}>
            <Col xs={6}>
                <Form.Group controlId={"amplitude_" + i} xs={6}>
                  <Form.Label>Amplitude</Form.Label>
                  <Form.Control
                    onChange={this.updateElement}
                    type="number"
                    placeholder="Amplitude"
                    value={this.arrayElements && this.arrayElements[i].amplitude}
                    step="0.02"
                    min="-2"
                    max="2" />
                  <Form.Text
                    className="text-muted">
                    Linear amplitude of the {i+1} element
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col xs={6}>
                <Form.Group controlId={"phase_" + i} xs={6}>
                  <Form.Label>Phase</Form.Label>
                  <Form.Control
                    onChange={this.updateElement}
                    type="number"
                    placeholder="Phase"
                    value={this.arrayElements && this.arrayElements[i].phase}
                    min="1"
                    max="360"/>
                  <Form.Text
                    className="text-muted">
                    Linear phase of the {i+1} element
                  </Form.Text>
                </Form.Group>
              </Col>
          </Row>
        );
    }
    return(rows);
  }

  render() {
    return (
      <Container className='mw-100'>
        <Row className='flex'>
          <Col xs={{span: 8, offset: 1}} ref={this.svgRef}>
          </Col>
          <Col xs= {3}>
            <Form onSubmit={this.asdf}>
              <Row>
                <Col xs={6}>
                  <Form.Group controlId="formElem" xs={6}>
                    <Form.Label>Elements</Form.Label>
                    <Form.Control
                      onChange={this.elementsOnChange}
                      type="number"
                      value={this.state.elements}
                      min="1"
                      max="10"/>
                    <Form.Text
                      className="text-muted">
                      Number of elements used in the array.
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col xs={6}>
                </Col>
              </Row>
              <Container ref={this.parametersRef}>
                {this.generateParameters()}
              </Container>
            </Form>
          </Col>
        </Row>
      </Container>
    )
  }
}

export default PhasedArray;
