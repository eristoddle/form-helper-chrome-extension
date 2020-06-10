import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Nav, NavDropdown, Modal, Form, Button } from 'react-bootstrap';
import { exportData, download, importData } from '../lib/js/storage';


class Navigation extends Component {

  state = {
    visible: false,
    data: null,
  }

  exportData = () => {
    exportData().then((x) => {
      download(JSON.stringify(x), 'form-helper.data.json', 'text/plain');
    });
  }

  handleFileChange = (event) => {
    const fileReader = new FileReader();
    const file = event.target.files[0];
    fileReader.readAsText(file);
    fileReader.onloadend = (event) => {
      const data = JSON.parse(event.target.result);
      this.setState({ data });
    };
  }

  importData = () => {
    const { data } = this.state;
    importData(data).then(() => this.props.reload());
  }

  render() {
    return <>
        <Navbar bg='light' expand='lg'>
          <Navbar.Brand href='#home'>Form Helper Options</Navbar.Brand>
          <Navbar.Toggle aria-controls='basic-navbar-nav' />
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav className='mr-auto'>
              <NavDropdown title='Import/Export' id='basic-nav-dropdown'>
                <NavDropdown.Item href='#action/3.2' onClick={() => this.setState({ visible: true })}>
                  Import All Data
                </NavDropdown.Item>
                <NavDropdown.Item href='#action/3.4' onClick={this.exportData}>
                  Export All Data
                </NavDropdown.Item>
              </NavDropdown>
              <Nav.Link href='https://stephanmiller.com?referer=chrome' target='_blank'>My Blog</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>

        <Modal show={this.state.visible} onHide={() => this.setState({ visible: false })}>
          <Modal.Header closeButton>
            <Modal.Title>Import Profiles</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group>
                <Form.Label>Import File</Form.Label>
                <Form.File id='custom-file' label='Custom file input' custom onChange={this.handleFileChange} />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant='secondary' onClick={() => this.setState({ visible: false })}>
              Close
            </Button>
            <Button variant='primary' onClick={this.importData}>
              Import Data
            </Button>
          </Modal.Footer>
        </Modal>
      </>;
  }
}

export default Navigation;