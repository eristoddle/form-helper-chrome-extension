import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal, Form } from 'react-bootstrap';
import { storeProfileType } from '../lib/js/storage';

class ProfileTypeModal extends Component {
  state = {
    profileTypeName: '',
    fieldNames: [],
  };

  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible && nextProps.profileType) {
      this.setState({
        profileTypeName: nextProps.profileType.name,
        fieldNames: nextProps.profileType.labels
      });
    } else {
      this.setState({
        profileTypeName: '',
        fieldNames: [],
      });
    }
  }

  handleProfileTypeNameChange = event => {
    this.setState({ profileTypeName: event.target.value });
  };

  addFieldName = () => {
    this.setState({
      fieldNames: [...this.state.fieldNames, ...['']]
    });
  };

  handleFieldNameChange(i, event) {
    const values = [...this.state.fieldNames];
    values[i] = event.target.value;
    this.setState({ fieldNames: values });
  }

  handleRemoveFieldName(i) {
    const values = [...this.state.fieldNames];
    values.splice(i, 1);
    this.setState({ fieldNames: values });
  }

  addProfileType = () => {
    storeProfileType({
      name: this.state.profileTypeName,
      labels: this.state.fieldNames,
    }).then(() => {
      this.props.close();
    });
  }

  render() {
    return (
      <Modal show={this.props.visible} onHide={this.props.close}>
        <Modal.Header closeButton>
          <Modal.Title>Add Profile Type</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter name for profile type'
                value={this.state.profileTypeName}
                onChange={this.handleProfileTypeNameChange}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Field Labels</Form.Label>
              {this.state.fieldNames.map((field, idx) => {
                return (
                  <div key={idx}>
                    <input
                      type='text'
                      placeholder='Enter field name'
                      value={field}
                      onChange={e => this.handleFieldNameChange(idx, e)}
                    />
                    <button
                      type='button'
                      onClick={() => this.handleRemoveFieldName(idx)}
                    >
                      X
                    </button>
                  </div>
                );
              })}
            </Form.Group>

            <Button variant='primary' onClick={this.addFieldName}>
              Add Field Label
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={this.props.close}>
            Close
          </Button>
          <Button variant='primary' onClick={this.addProfileType}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default ProfileTypeModal;