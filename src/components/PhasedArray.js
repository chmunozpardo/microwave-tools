import React, { createRef } from 'react'
import { Row, Col, Form, Container } from 'react-bootstrap';
import * as d3 from 'd3';
import {arrayFactor} from '../utils/PhasedArray.js'
import {textGridHelp, plotRings, plotLabels} from '../utils/Plots.js'

export class PhasedArray extends React.Component{
  svgRef = createRef(null);
  svgGraph = {};
  parametersRef = createRef(null);
  maxElements = 20;
  width = 0;
  height = 0;
  svgContainer = null;
  distance = .5;
  svgMargin = 20;
  graphWidth  = 0;
  graphHeight = 0;
  ringsN = 8;
  linesN = 8;
  maxLog = 0;
  minLog = -40;
  maxLin = 1;
  minLin = 0;
  min_val = this.minLog;
  max_val = this.maxLog;

  lineFunction = d3.line()
                   .x(function(d){
                     return d.x;
                   })
                   .y(function(d){
                     return d.y;
                   })
                   .curve(d3.curveLinearClosed);

  state = {
    elements: 2,
    logEnabled: true,
    arrayElements: [
      {
        amplitude: 1.0,
        phase: 0.0,
        position: [0.0, 0.0]
      },
      {
        amplitude: 1.0,
        phase: 0.0,
        position: [this.distance, 0.0]
      }
    ]
  };

  elementsOnChange = (e) => {
    let numberInput = Number(e.target.value);
    let oldInput = this.state.elements;
    if (numberInput < 2) {
      numberInput = 2;
    } else if (numberInput > this.maxElements) {
      numberInput = this.maxElements;
    }
    let tempElements = this.state.arrayElements;
    let diff = numberInput - oldInput;
    if(diff > 0){
      for(let i = 0; i < diff; i++){
        tempElements.push({
          amplitude: 1.0,
          phase: 0.0,
          position: [
            (oldInput + i)*this.distance,
            0.0
          ]
        });
      }
    }
    if(diff < 0){
      for(let i = 0; i < -diff; i++){
        tempElements.pop();
      }
    }
    this.setState({
      elements: numberInput,
      arrayElements: tempElements
    },
    this.plot);
  }

  componentDidMount(){
    this.svgContainer = d3.select(this.svgRef.current);
    let width = parseFloat(this.svgContainer.style('width'));
    let height = parseFloat(this.svgContainer.style('height'));
    let svgMargin = 20;
    let graphWidth = width - 2*svgMargin;
    let graphHeight = height - 2*svgMargin;
    let minVal = this.min_val;
    let maxVal = this.max_val;
    let svg = this.svgContainer.append('svg')
                               .attr('width' , width)
                               .attr('height', height);
    this.svgGraph = {
      logEnabled: this.state.logEnabled,
      svg,
      width,
      height,
      graphWidth,
      graphHeight,
      minVal,
      maxVal,
      rings: 8,
      lines: 16,
    }
    plotRings(this.svgGraph);
    this.plot();
  };

  plot = () => {
    let lineData = arrayFactor(
      this.state.arrayElements,
      this.svgGraph
    );
    let svg = this.svgContainer.select('svg');
    svg.select('#path_phased').remove();
    svg.append('path')
       .attr('id', 'path_phased')
       .attr('d', this.lineFunction(lineData))
       .attr('stroke', 'black')
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
    } else if(stringID === "posX"){
      singleElement.position[0] = Number(event.target.value);
    } else if(stringID === "posY"){
      singleElement.position[1] = Number(event.target.value);
    }
    arrayElements[elementID] = singleElement;
    this.setState(
      {arrayElements},
      this.plot
    );
  }

  generateParameters = () => {
    var rows = [];
    for(let i = 0; i < this.state.elements; i++){
        rows.push(
          <Row key={i} className='box-2 mt-2'>
            <Col xs={12}>
              Element Number {i+1}
            </Col>
            <Col xs={6}>
                <Form.Group controlId={"amplitude_" + i} xs={6}>
                  <Form.Label>Amplitude</Form.Label>
                  <Form.Control
                    onChange={this.updateElement}
                    type="number"
                    placeholder="Amplitude"
                    value={this.state.arrayElements && this.state.arrayElements[i].amplitude}
                    step="0.02"
                    min="-10"
                    max="10" />
                  <Form.Text
                    className="text-muted">
                    Linear amplitude of the {i + 1} element
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
                    value={this.state.arrayElements && this.state.arrayElements[i].phase}
                    step="0.1"
                    min="-180.0"
                    max="180.0"/>
                  <Form.Text
                    className="text-muted">
                    Linear phase of the {i + 1} element
                  </Form.Text>
                </Form.Group>
              </Col><Col xs={6}>
                <Form.Group controlId={"posX_" + i} xs={6}>
                  <Form.Label>Position X</Form.Label>
                  <Form.Control
                    onChange={this.updateElement}
                    type="number"
                    placeholder="Position X"
                    value={this.state.arrayElements && this.state.arrayElements[i].position[0]}
                    step="0.001"
                    min="-10"
                    max="10" />
                  <Form.Text
                    className="text-muted">
                    X position of the {i + 1} element
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col xs={6}>
                <Form.Group controlId={"posY_" + i} xs={6}>
                  <Form.Label>Position Y</Form.Label>
                  <Form.Control
                    onChange={this.updateElement}
                    type="number"
                    placeholder="Position Y"
                    value={this.state.arrayElements && this.state.arrayElements[i].position[1]}
                    step="0.001"
                    min="-10.0"
                    max="10.0"/>
                  <Form.Text
                    className="text-muted">
                    Y position of the {i + 1} element
                  </Form.Text>
                </Form.Group>
              </Col>
          </Row>
        );
    }
    return(rows);
  }

  changePlotType = (event) => {
    let logEnabled = !this.state.logEnabled;
    this.svgGraph.minVal = logEnabled ? this.minLog : this.minLin;;
    this.svgGraph.maxVal = logEnabled ? this.maxLog : this.maxLin;
    this.svgGraph.logEnabled = logEnabled;
    plotLabels(this.svgGraph);
    this.setState(
      {logEnabled},
      this.plot
    )
  }

  render() {
    return (
      <Container fluid className='mw-100 h-100'>
        <Row className='h-100'>
          <Col
            className='border-box p-0'
            xs={{span: 8, offset: 1}}
            ref={this.svgRef}>
          </Col>
          <Col xs= {3} className='scrollable mt-3'>
            <Form>
              <Container>
                <Row className='mt-1 box-2'>
                  <Col xs={6}>
                    <Form.Group controlId="formElem" xs={6}>
                      <Form.Label>Elements</Form.Label>
                      <Form.Control
                        onChange={this.elementsOnChange}
                        type="number"
                        value={this.state.elements}
                        min="2"
                        max={this.maxElements}/>
                      <Form.Text
                        className="text-muted">
                        Number of elements used in the array.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col xs={6}>
                    <Form.Group controlId="formLog">
                      <Form.Check
                        onChange={this.changePlotType}
                        checked={this.state.logEnabled}
                        type="checkbox"
                        label="Logarithmic plot" />
                    </Form.Group>
                  </Col>
                </Row>
              </Container>
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
