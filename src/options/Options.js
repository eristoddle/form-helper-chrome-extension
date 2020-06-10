import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Card, Button, Pagination, Tab, Tabs } from 'react-bootstrap';
import { getForms, getProfileTypes, getProfiles, getSubmissions, deleteSubmissions, download } from '../lib/js/storage';
import Navigation from './Navigation';
import ProfileTypeModal from './ProfileTypeModal';
import FormModal from './FormModal';
import ProfileModal from './ProfileModal';
import ImportProfilesModal from './ImportProfilesModal';

class Options extends Component {
  state = {
    perPage: 10,
    forms: [],
    formsPage: 1,
    showEditForm: false,
    form: null,
    profileTypes: [],
    profileTypesPage: 1,
    showAddProfileType: false,
    profileType: null,
    profiles: [],
    profilesPage: 1,
    profile: null,
    showAddProfile: false,
    showImportProfile: false,
    submissions: [],
    submissionsPage: 1,
    activeTab: 'Forms',
  };

  componentDidMount() {
    this.getData();
  }

  getData() {
    getForms().then((forms) => {
      this.setState({ forms });
    });

    getProfileTypes().then((profileTypes) => {
      this.setState({ profileTypes });
    });

    getProfiles().then((profiles) => {
      this.setState({ profiles });
    });

    getSubmissions().then((submissions) => {
      this.setState({ submissions });
    });
  }

  addProfileType = () => {
    this.setState({ profileType: null, showAddProfileType: true });
  };

  editProfileType(profileType) {
    this.setState({ profileType, showAddProfileType: true });
  }

  editForm(form) {
    this.setState({ form, showEditForm: true });
  }

  addProfile = () => {
    this.setState({ showAddProfile: true });
  };

  importProfile = () => {
    this.setState({ showImportProfile: true });
  };

  editProfile(profile) {
    this.setState({ profile, showAddProfile: true });
  }

  exportSubmissions = () => {
    const data = this.state.submissions.reduce((a, c) => {
      return `${a}\n${Object.values(c).join(',')}`;
    }, '');
    download(data, 'submissions.csv', 'text/plain');
  };

  deleteSubmissions = () => {
    deleteSubmissions().then(this.getData());
  };

  onPageClick(stateKey, page) {
    this.setState({ [`${stateKey}Page`]: page });
  }

  getPages = (stateKey) => {
    const items = this.state[stateKey];
    const active = this.state[`${stateKey}Page`];
    const count = Math.ceil(items.length / this.state.perPage) + 1;
    const tabs = Array.from(Array(count).keys());
    tabs.shift();
    return tabs.map((x) => (
      <Pagination.Item
        key={x}
        active={x === active}
        onClick={() => {
          this.onPageClick(stateKey, x);
        }}
      >
        {x}
      </Pagination.Item>
    ));
  }

  render() {
    const {
      perPage,
      forms,
      formsPage,
      profiles,
      profilesPage,
      profileTypes,
      profileTypesPage,
      submissions,
      submissionsPage,
      activeTab,
    } = this.state;
    return (
      <Container fluid>
        <Navigation reload={() => this.getData()} />
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => this.setState({activeTab: k})}
        >

          <Tab eventKey="Forms" title="Forms">
            <Card className='m-4'>
              <Card.Body>
                <Row>
                  <Col>Url</Col>
                  <Col>Profile Type</Col>
                </Row>
                <hr />
                {forms.length &&
                  forms.slice((formsPage - 1) * perPage, formsPage * perPage).map((x) => {
                    return (
                      <Row key={x.url} onClick={() => this.editForm(x)}>
                        <Col>{x.url}</Col>
                        <Col>{x.profileType}</Col>
                      </Row>
                    );
                  })}
                <hr />
                <Pagination>
                  {forms.length > perPage && this.getPages('forms')}
                </Pagination>
              </Card.Body>
            </Card>
          </Tab>

          <Tab eventKey="ProfileTypes" title="Profile Types">
            <Card className='m-4'>
              <Card.Body>
                <Row>
                  <Col>Name</Col>
                  <Col>Labels</Col>
                </Row>
                <hr />
                {profileTypes.length &&
                  profileTypes
                    .slice((profileTypesPage - 1) * perPage, profileTypesPage * perPage)
                    .map((x) => {
                      return (
                        <Row key={x.name} onClick={() => this.editProfileType(x)}>
                          <Col>{x.name}</Col>
                          <Col>{x.labels.join(',')}</Col>
                        </Row>
                      );
                    })}
                <hr />
                <Pagination>
                  {profileTypes.length > perPage && this.getPages('profileTypes')}
                </Pagination>
                <hr />
                <Button variant='primary' onClick={this.addProfileType}>
                  Add Profile Type
                </Button>
              </Card.Body>
            </Card>
          </Tab>

          <Tab eventKey="Profiles" title="Profiles">
            <Card className='m-4'>
              <Card.Body>
                <Row>
                  <Col>Profile Type</Col>
                  <Col>Label</Col>
                  <Col>Values</Col>
                </Row>
                <hr />
                {profiles.length &&
                  profiles
                    .slice((profilesPage - 1) * perPage, profilesPage * perPage)
                    .map((x) => {
                      return (
                        <Row key={x.uuid} onClick={() => this.editProfile(x)}>
                          <Col>{x.profileType}</Col>
                          <Col>{x.label}</Col>
                          <Col>{JSON.stringify(x.values)}</Col>
                        </Row>
                      );
                    })}
                <hr />
                <Pagination>
                  {profiles.length > perPage && this.getPages('profiles')}
                </Pagination>
                <hr />
                <Button variant='primary' onClick={this.addProfile}>
                  Add Profile
                </Button>
                <Button variant='primary' onClick={this.importProfile}>
                  Import Profiles
                </Button>
              </Card.Body>
            </Card>
          </Tab>

          <Tab eventKey="Submissions" title="Submissions">
            <Card className='m-4'>
              <Card.Body>
                <Row>
                  <Col>Profile</Col>
                  <Col>Date</Col>
                  <Col>Url</Col>
                </Row>
                <hr />
                {submissions.length &&
                  submissions
                    .slice((submissionsPage - 1) * perPage, submissionsPage * perPage)
                    .map((x) => {
                      return (
                        <Row key={x.uuid}>
                          <Col>{x.profile}</Col>
                          <Col>{x.date}</Col>
                          <Col>{x.url}</Col>
                        </Row>
                      );
                    })}
                <hr />
                <Pagination>
                  {submissions.length > perPage && this.getPages('submissions')}
                </Pagination>
                <hr />
                <Button variant='primary' onClick={this.deleteSubmissions}>
                  Delete Submissions
                </Button>
                <Button variant='primary' onClick={this.exportSubmissions}>
                  Export Submissions
                </Button>
              </Card.Body>
            </Card>
          </Tab>

        </Tabs>

        <ProfileTypeModal
          visible={this.state.showAddProfileType}
          close={() =>
            this.setState({ showAddProfileType: false }, this.getData)
          }
          profileType={this.state.profileType}
        />

        <FormModal
          visible={this.state.showEditForm}
          close={() =>
            this.setState({ showEditForm: false }, this.getData)
          }
          form={this.state.form}
          profileTypes={this.state.profileTypes}
        />

        <ProfileModal
          visible={this.state.showAddProfile}
          close={() =>
            this.setState({ showAddProfile: false }, this.getData)
          }
          profileTypes={this.state.profileTypes}
          profile={this.state.profile}
        />

        <ImportProfilesModal
          visible={this.state.showImportProfile}
          close={() =>
            this.setState({ showImportProfile: false }, this.getData)
          }
          profileTypes={this.state.profileTypes}
        />

      </Container>
    );
  }
}

export default Options;
