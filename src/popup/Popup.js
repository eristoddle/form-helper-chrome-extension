import React from 'react';
import './Popup.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as browser from 'webextension-polyfill';
import { Container, Button, ButtonGroup, Card, Form, Col, Row } from 'react-bootstrap';
import { storeForm, getDomainFromUrl, getForm, getProfileTypes, getProfileType } from '../lib/js/storage';


class Popup extends React.Component {
  state = {
    url: null,
    forms: [],
    selectedForm: null,
    selectedFields: [],
    step: 'form',
    existingForm: null,
    profileTypes: [],
    profileType: null,
    mapping: [],
    profileTypeLabels: [],
    combinedFields: [],
  };

  componentDidMount() {
    browser.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) => {
        const tab = tabs[0];
        const { url } = tab;
        const domain = getDomainFromUrl(url);
        this.setState({ url: domain });
        return getForm(domain);
      })
      .then((existingForm) => {
        if (existingForm) {
          this.setState({
            existingForm,
            profileType: existingForm.profileType,
            mapping: existingForm.mapping,
          });
          if ('fields' in existingForm) {
            this.mergeFields(existingForm.fields);
          }
        }
        return getProfileTypes();
      })
      .then((profileTypes) => {
        this.setState({ profileTypes });
        this.getProfileFields();
      });
  }

  gotoOptions() {
    if (browser.runtime.openOptionsPage) {
      browser.runtime.openOptionsPage();
    } else {
      window.open(browser.runtime.getURL('options.html'));
    }
  }

  mergeFields = (fields) => {
    const { combinedFields } = this.state;
    const newCombined = [...fields, ...combinedFields];
    const labels = [];
    const finalCombined = newCombined.reduce((a, c) => {
      if (labels.includes(c.label)) {
        return a;
      } else {
        labels.push(c.label);
        return [...a, ...[c]];
      }
    }, []);
    this.setState({ combinedFields: finalCombined });
  };

  grabForms = (data) => {
    const { url, forms } = data;
    this.setState({
      url: getDomainFromUrl(url),
      forms,
      step: 'fields',
    });
  };

  sendMessage = () => {
    browser.tabs
      .query({
        active: true,
        currentWindow: true,
      })
      .then((tabs) => {
        const port = browser.tabs.connect(tabs[0].id);
        port.onMessage.addListener(this.grabForms);
        port.postMessage({ text: 'grab_forms' });
      });
  };

  saveForm = () => {
    storeForm({
      url: this.state.url,
      label: this.state.selectedForm.label,
      fields: this.state.combinedFields,
      profileType: this.state.profileType,
      mapping: this.state.mapping,
    });
    this.setState({
      step: 'saved',
      selectedForm: null
    });
  };

  toggleCheckbox = (field) => {
    const hasField = this.state.selectedFields.find(
      (x) => x.label == field.label
    );
    if (hasField) {
      this.setState({
        selectedFields: this.state.selectedFields.filter(
          (x) => x.label != field.label
        ),
      });
    } else {
      this.setState({
        selectedFields: [...this.state.selectedFields, ...[field]],
      });
    }
  };

  isFieldChecked = (field) => {
    const { existingForm } = this.state;
    if (existingForm) {
      const { fields } = existingForm;
      return fields.find((x) => x.label === field.label);
    }
  };

  handleProfileTypeChange = (event) => {
    this.setState({ profileType: event.target.value }, this.getProfileFields);
  };

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
      key:
        (field.label && 'name') ||
        (field.ngModel && 'ng-model') ||
        (field.classes && 'class'),
    };
    if (this.getFieldMapping(field.label)) {
      this.setState({
        mapping: mapping.map((x) => {
          if (x.fieldLabel === field.label) {
            return newMapping;
          }
          return x;
        }),
      });
    } else {
      this.setState({ mapping: [...mapping, ...[newMapping]] });
    }
  }

  getProfileFields() {
    getProfileType(this.state.profileType).then((data) => {
      if (data && 'labels' in data) {
        const { labels } = data;
        this.setState({ profileTypeLabels: labels });
      }
    });
  }

  selectForm = (selectedForm) => {
    this.setState({ selectedForm, step: 'store' });
    this.mergeFields(selectedForm.fields);
  };

  render() {
    console.log('state', this.state);
    const { forms, selectedForm, step, profileType, profileTypes, combinedFields } = this.state;

    return (
      <Container fluid>
        <Card className='popup'>
          <Card.Body>
            <Card.Title>Form Helper</Card.Title>
            {step == 'form' && (
              <Button id='grabForms' onClick={this.sendMessage}>
                Grab Forms
              </Button>
            )}

            {step == 'fields' && forms.length > 0 && (
              <div id='forms'>
                <h6>Choose Form to Save</h6>
                <ButtonGroup vertical>
                  {forms.map((x) => {
                    return (
                      <Button
                        key={x.label}
                        onClick={() => this.selectForm(x)}>
                        {x.label}
                      </Button>
                    );
                  })}
                </ButtonGroup>
              </div>
            )}

            {step == 'fields' && forms.length === 0 && (
              <h6>No Forms Found</h6>
            )}

            {selectedForm && (
              <Container fluid id='selected' className='selected'>
                <h6>Choose Fields to Store and Profile Type</h6>
                <Form.Group>
                  <Form.Label>Profile Type</Form.Label>
                  <Form.Control
                    as='select'
                    value={profileType}
                    onChange={this.handleProfileTypeChange}
                  >
                    <option>Choose...</option>
                    {profileTypes.length &&
                      profileTypes.map((x) => {
                        return <option key={x.name}>{x.name}</option>;
                      })}
                  </Form.Control>
                </Form.Group>
                {combinedFields.map((x) => {
                  return (
                    <Row key={x.label}>
                      <Col>
                        <Form.Check>
                          <Form.Check.Input
                            type='checkbox'
                            checked={this.isFieldChecked(x)}
                            onChange={() => this.toggleCheckbox(x)}
                          />
                          <Form.Check.Label>
                            {x.label || x.ngModel || x.classes}
                          </Form.Check.Label>
                        </Form.Check>
                      </Col>
                      <Col>
                        {profileType && (
                          <Form.Control
                            as='select'
                            value={this.getFieldMapping(
                              x.label || x.ngModel || x.classes
                            )}
                            onChange={(e) =>
                              this.handleFieldMappingChange(e, x)
                            }
                          >
                            <option>Choose...</option>
                            {this.state.profileTypeLabels.map((x) => {
                              return <option key={x}>{x}</option>;
                            })}
                          </Form.Control>
                        )}
                      </Col>
                    </Row>
                  );
                })}
                <hr />
                <Button id='saveForm' onClick={this.saveForm}>
                  Save Form
                </Button>
              </Container>
            )}
            {step == 'saved' && !selectedForm && (
              <h6>Form Saved!</h6>
            )}
          </Card.Body>
        </Card>
      </Container>
    );
  }
}

export default Popup;
