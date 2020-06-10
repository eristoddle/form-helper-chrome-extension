import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal, Form } from 'react-bootstrap';
import { CSVLink } from 'react-csv';
import { getProfileType, importProfiles } from '../lib/js/storage';

class ImportProfileModal extends Component {
  state = {
    profileTypes: [],
    profileType: '',
    profileTypeLabels: [],
    importTemplate: '',
    rawProfiles: null,
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible && nextProps.form) {
      this.setState({
        profileTypes: nextProps.form.profileTypes,
      });
    } else {
      this.setState({ profileTypes: [] });
    }
  }

  getProfileFields() {
    getProfileType(this.state.profileType).then((data) => {
      const { labels } = data;
      this.setState({
        profileTypeLabels: labels,
        importTemplate: [[...['label'], ...labels]],
      });
    });
  }

  handleProfileTypeChange = (event) => {
    this.setState({ profileType: event.target.value }, this.getProfileFields);
  }

  handleFileChange = (event) => {
    const fileReader = new FileReader();
    const file = event.target.files[0];
    fileReader.readAsText(file);
    fileReader.onloadend = (event) => {
      const text = event.target.result;
      this.setState({
        rawProfiles: text,
        profileType: file.name
          .replace('_', ' ')
          .replace('-import.csv', ''),
      });
    };
  }

  importProfiles = () => {
    const { rawProfiles, profileType } = this.state;
    const profiles = rawProfiles.replace(/\r/g, '')
      .replace(/"/g, '')
      .split('\n');
    const labels = profiles.shift().split(',');
    const data = profiles.map((x) => {
      const row = x.split(',');
      const label = row[labels.indexOf('label')];
      const values = labels.reduce((a, c) => {
        if (c == 'label') {
          return a;
        }
        const value = row[labels.indexOf(c)];
        return [...a, ...[{
          'profileLabel': c,
          value
        }]];
      }, []);
      return { profileType, label, values };
    });
    importProfiles(data).then(() => {
      this.props.close();
    });
  }

  render() {
    return (
      <Modal show={this.props.visible} onHide={this.props.close}>
        <Modal.Header closeButton>
          <Modal.Title>Import Profiles</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Profile Type</Form.Label>
              <Form.Control
                as='select'
                value={this.state.profileType}
                onChange={this.handleProfileTypeChange}
              >
                <option>Choose...</option>
                {this.props.profileTypes.length && this.props.profileTypes.map((x) => {
                  return <option key={x.name}>{x.name}</option>;
                })}
              </Form.Control>
            </Form.Group>

            <CSVLink
              data={this.state.importTemplate}
              filename={`${this.state.profileType.replace(' ', '_')}-import.csv`}
            >
              Download Import Template
            </CSVLink>

            <Form.Group>
              <Form.Label>Import File</Form.Label>
              <Form.File
                id='custom-file'
                label='Custom file input'
                custom
                onChange={this.handleFileChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={this.props.close}>
            Close
          </Button>
          <Button variant='primary' onClick={this.importProfiles}>
            Import Profiles
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default ImportProfileModal;
