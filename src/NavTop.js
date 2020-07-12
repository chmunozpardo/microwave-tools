import React, { Component } from 'react'
import { Navbar, Nav } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export class NavTop extends Component {
  render() {
    return (
      <div>
         <Navbar bg="primary" variant="dark">
          <Navbar.Brand>Microwave Tools</Navbar.Brand>
          <Nav className="w-100" fill justify>
            <Nav.Item>
              <Nav.Link as={Link} to="/impedance">Impedance</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Link} to="/phased_array">Phased array</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Link} to="/">Home</Nav.Link>
            </Nav.Item>
          </Nav>
          <Nav className="mr-auto">
            <Nav.Item>
              <Nav.Link as={Link} to="/contact">Contact</Nav.Link>
            </Nav.Item>
          </Nav>
        </Navbar>
      </div>
    )
  }
}

export default NavTop
