import React, { createRef } from 'react'
import { Row, Col, Form, Container } from 'react-bootstrap';
import * as d3 from 'd3';

export class PhasedArray extends React.Component{
  svgRef = createRef(null);
  parametersRef = createRef(null);
  maxElements = 20;
  width = 0;
  height = 0;
  svgContainer = null;
  distance = .25;
  svgMargin = 20;
  graphWidth  = 0;
  graphHeight = 0;
  ringsN = 10;
  linesN = 8;
  maxLog = 0;
  minLog = -100;
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

  textGridHelp = (j) => {
      let x = (1 - j/this.ringsN);
      let m = (this.min_val - this.max_val)/(this.ringsN);
      return j*m+this.max_val;
  }

  componentDidMount(){
    this.svgContainer = d3.select(this.svgRef.current);
    this.width = parseFloat(this.svgContainer.style('width'));
    this.height = parseFloat(this.svgContainer.style('height'));
    this.graphWidth = this.width - 2*this.svgMargin;
    this.graphHeight = this.height - 2*this.svgMargin;
    this.svgContainer.append('svg')
                .attr('width', this.width)
                .attr('height', this.height);
    let svg = this.svgContainer.select('svg');
    for(let i = 0; i < this.ringsN; i++){
      svg.append('circle')
         .attr('r', (this.graphHeight*(i+1)/this.ringsN)/2)
         .attr('cx', this.width/2)
         .attr('cy', this.height/2)
         .attr('fill', 'none')
         .attr('stroke', 'lightgray')
         .attr('stroke-width', 2)
         .attr('stroke-dasharray', 5)
    }
    for(let i = 0; i < this.linesN; i++){
      let r = (this.graphHeight)/2;
      svg.append('line')
         .attr('x1', this.width/2)
         .attr('y1', this.height/2)
         .attr('x2', this.width/2 + r*Math.cos((2*Math.PI)*i/this.linesN))
         .attr('y2', this.height/2 + r*Math.sin((2*Math.PI)*i/this.linesN))
         .attr('stroke', 'lightgray')
         .attr('stroke-width', 2)
      for(let j = 0; j < this.ringsN; j++){
          svg.append('text')
              .attr('id', 'gridText')
              .attr('x', this.width/2 + r*(this.ringsN-j)/this.ringsN*Math.cos((2*Math.PI)*i/this.linesN))
              .attr('y', this.height/2 + r*(this.ringsN-j)/this.ringsN*Math.sin((2*Math.PI)*i/this.linesN))
              .attr('fill', 'gray')
              .attr('font-size', '14px')
              .text(this.textGridHelp(j));
      }
    }
    this.plot();
  };

  plot = () => {
    let svgMargin = this.svgMargin;
    let width = this.width;
    let height = this.height;
    let graphWidth  = width - svgMargin*2;
    let graphHeight = height - svgMargin*2;
    let N = 256;
    let xRange = 360.0;
    let lambda = 1.0;
    let K_val = 2*Math.PI/lambda;
    let lineData = [];
    let A = [];
    let p = [];
    let elements_pos = [];
    for(let i = 0; i < this.state.arrayElements.length; i++){
      A.push(this.state.arrayElements[i].amplitude);
      p.push(this.state.arrayElements[i].phase);
      elements_pos.push(this.state.arrayElements[i].position);
    }
    let min_val = this.state.logEnabled ? -100 : 0;
    let max_val = -1000;
    for(let i = 0; i < N; i++){
      let x = xRange*i/N;
      let out_real = 0;
      let out_imag = 0;
      for(let j = 0; j < elements_pos.length; j++){
        let r_vec = [
          Math.cos(x*Math.PI/180.0),
          Math.sin(x*Math.PI/180.0)
        ];
        let k_vec = [
          elements_pos[j][0],
          elements_pos[j][1]
        ];
        let prod = K_val*(r_vec[0]*k_vec[0] + r_vec[1]*k_vec[1]);
        out_real += A[j]*Math.cos(-prod - p[j]*Math.PI/180.0);
        out_imag += A[j]*Math.sin(-prod - p[j]*Math.PI/180.0);
      }
      let y;
      if(this.state.logEnabled){
        y = 20*Math.log(out_real**2+out_imag**2+1e-6);
        if(y < min_val) y = min_val;

      } else {
        y = Math.sqrt(out_real**2+out_imag**2);
      }
      if(y > max_val) max_val = y;
      lineData.push({
        'x': x,
        'y': y
      })
    }
    let lineDataFinal = [];

    for(let i = 0; i < N; i++){
      let tmp_x = lineData[i].x
      let tmp_y = lineData[i].y
      let tmp_r = ((tmp_y - min_val)/(max_val - min_val)*graphHeight/2);
      lineDataFinal.push({
        'x': tmp_r*Math.cos(tmp_x*Math.PI/180.0) + width/2,
        'y': tmp_r*Math.sin(tmp_x*Math.PI/180.0) + height/2,
      })
    }
    let svg = this.svgContainer.select('svg');
    svg.select('#path_phased').remove();
    svg.append('path')
       .attr('id', 'path_phased')
       .attr('d', this.lineFunction(lineDataFinal))
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
    this.min_val = logEnabled ? this.minLog : this.minLin;
    this.max_val = logEnabled ? this.maxLog : this.maxLin;
    let svg = this.svgContainer.select('svg');
    svg.selectAll('#gridText').remove();
    for(let i = 0; i < this.linesN; i++){
      let r = (this.graphHeight)/2;
      for(let j = 0; j < this.ringsN; j++){
          svg.append('text')
              .attr('id', 'gridText')
              .attr('x', this.width/2 + r*(this.ringsN-j)/this.ringsN*Math.cos((2*Math.PI)*i/this.linesN))
              .attr('y', this.height/2 + r*(this.ringsN-j)/this.ringsN*Math.sin((2*Math.PI)*i/this.linesN))
              .attr('fill', 'gray')
              .attr('font-size', '14px')
              .text(this.textGridHelp(j));
      }
    }
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
            <Form onSubmit={this.asdf}>
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
