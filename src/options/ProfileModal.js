import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal, Form } from 'react-bootstrap';
import { getProfileType, storeProfile } from '../lib/js/storage';

class ProfileModal extends Component {
  state = {
    profileTypes: [],
    profileType: '',
    profileTypeLabels: [],
    values: [],
    label: '',
    uuid: null,
  };

  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible) {
      this.setState({
        profileTypes: nextProps.profileTypes,
      });
      if (nextProps.profile) {
        this.setState({
          profileType: nextProps.profile.profileType,
          label: nextProps.profile.label,
          values: nextProps.profile.values,
          uuid: nextProps.profile.uuid,
        }, this.getProfileFields);
      }
    } else {
      this.setState({ profileTypes: [] });
    }
  }

  getProfileFields() {
    getProfileType(this.state.profileType).then((data) => {
      const { labels } = data;
      this.setState({ profileTypeLabels: labels });
    });
  }

  handleProfileTypeChange = (event) => {
    this.setState({ profileType: event.target.value }, this.getProfileFields);
  }

  handleLabelChange = (event) => {
    this.setState({ label: event.target.value });
  }

  getValue(label) {
    const value = this.state.values.find((x) => x.profileLabel === label);
    if (value) {
      return value.value;
    }
    return null;
  }

  handleValueChange(e, label) {
    const { values } = this.state;
    const newValue = { profileLabel: label, value: e.target.value };
    if (this.getValue(label)) {
      this.setState({
        values: values.map((x) => {
          if (x.profileLabel === label) {
            return newValue;
          }
          return x;
        }),
      });
    } else {
      this.setState({ values: [...values, ...[newValue]] });
    }
  }

  saveProfile = () => {
    const { profileType, values, label, uuid } = this.state;
    storeProfile({
      profileType,
      label,
      values,
      uuid,
    }).then(() =>{
      this.props.close();
    });
  }

  render() {
    return (
      <Modal show={this.props.visible} onHide={this.props.close}>
        <Modal.Header closeButton>
          <Modal.Title>Add Profile</Modal.Title>
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

            <Form.Group>
              <Form.Label>Profile Label</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter label to identify'
                required
                value={this.state.label}
                onChange={this.handleLabelChange}
              />
            </Form.Group>

            <h4>Enter Values</h4>
            {this.state.profileTypeLabels.map((x) => {
              return (
                <Form.Group key={x}>
                  <Form.Label>{x}</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter value'
                    value={this.getValue(x)}
                    onChange={(e) => this.handleValueChange(e, x)}
                  />
                </Form.Group>
              );
            })}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={this.props.close}>
            Close
          </Button>
          <Button variant='primary' onClick={this.saveProfile}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default ProfileModal;
