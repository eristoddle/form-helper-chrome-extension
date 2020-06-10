import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { storeForm, getProfileType } from '../lib/js/storage';

class FormModal extends Component {
  state = {
    label: '',
    fields: [],
    url: '',
    profileType: '',
    profileTypeLabels: [],
    mapping:[],
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible && nextProps.form) {
      this.setState({
        label: nextProps.form.label,
        fields: nextProps.form.fields,
        url: nextProps.form.url,
        profileType: nextProps.form.profileType,
        mapping: nextProps.form.mapping,
      }, this.getProfileFields);
    } else {
      this.setState({
        label: '',
        fields: [],
        url: '',
        profileType: '',
        profileTypeLabels: [],
        mapping: [],
      });
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

  getFieldMapping(label) {
    const mapping = this.state.mapping.find((x) => x.fieldLabel === label);
    if (mapping) {
      return mapping.profileLabel;
    }
    return null;
  }

  handleFieldMappingChange(e, field) {
    const { mapping } = this.state;
    const newMapping = {
      fieldLabel: field.label || field.ngModel || field.classes,
      profileLabel: e.target.value,
      key: (field.label && 'name') || (field.ngModel && 'ng-model') || (field.classes && 'class'),
    };
    if (this.getFieldMapping(field.label)) {
      this.setState({ mapping: mapping.map((x) => {
        if (x.fieldLabel === field.label){
          return newMapping;
        }
        return x;
      })});
    } else {
      this.setState({ mapping: [...mapping, ...[newMapping]] });
    }
  }

  editForm = () => {
    storeForm({
      label: this.state.label,
      fields: this.state.fields,
      url: this.state.url,
      profileType: this.state.profileType,
      mapping: this.state.mapping,
    }).then(() => {
      this.props.close();
    });
  }

  render() {
    return (
      <Modal show={this.props.visible} onHide={this.props.close}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Form</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>{this.state.url}</Form.Label>
          </Form.Group>
          <Form>
            <Form.Group>
              <Form.Label>Label</Form.Label>
              <Form.Control type='text' value={this.state.label} />
            </Form.Group>

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
              <h6>Field Mapping</h6>
              {this.state.fields.map((field, idx) => {
                return (
                  <Row key={idx} >
                    <Col>{field.label || field.ngModel || field.classes}</Col>
                    <Col>
                      <Form.Control
                        as='select'
                        value={this.getFieldMapping(field.label || field.ngModel || field.classes)}
                        onChange={(e) => this.handleFieldMappingChange(e, field)}
                      >
                        <option>Choose...</option>
                        {this.state.profileTypeLabels.map((x) => {
                          const key = `${idx}-${x.name}`;
                          return <option key={key}>{x}</option>;
                        })}
                      </Form.Control>
                    </Col>
                  </Row>
                );
              })}
            </Form.Group>

          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={this.props.close}>
            Close
          </Button>
          <Button variant='primary' onClick={this.editForm}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default FormModal;
