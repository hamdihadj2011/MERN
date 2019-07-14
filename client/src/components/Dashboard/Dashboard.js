import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {Link} from 'react-router-dom'
import DashbordActions from './DashboardActions'
import { getCurrentProfile, deleteAccount } from "../../actions/profile";

import Spinner from "../layout/Spinner";
import Expericence from './Experience'
import Education from './Education'

const Dashboard = ({
  getCurrentProfile,
  deleteAccount,
  auth:{user},
  profile: { profile, loading }
}) => {
  useEffect(() => {
    getCurrentProfile();
  }, [getCurrentProfile]);
  return loading && profile === null ? (
    <Spinner />
  ) : (
    <React.Fragment>
      <h1 className='large text-primary'>Dashboard</h1>
      <p className="lead">
        <i className="fas fa-user">Welcom { user && user.name}</i>
      </p>
      {
        profile !==null ? 
        <React.Fragment>
          <DashbordActions />
          <Expericence 
          experience={profile.experience}
          />
          <Education 
          education={profile.education}
          />
          <div className="my-">
            <button className="btn btn-danger"
            onClick={()=>deleteAccount()}
            >
              <i className="fas fa-user-minus">Delete My Account</i>
            </button>
          </div>
        </React.Fragment>
        :
        <React.Fragment>
          <p>You have not setup a profile,please add some info </p>
          <Link to='/create-profile' className='btn btn-primary my-1'>Create profile </Link>
        </React.Fragment>
      }
    </React.Fragment>
  );
};

Dashboard.propTypes = {
  getCurrentProfile: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  profile: PropTypes.object.isRequired,
  deleteAccount:PropTypes.func.isRequired,
};
const mapStateToProps = state => ({
  auth: state.auth,
  profile: state.profile
});

export default connect(
  mapStateToProps,
  { getCurrentProfile,deleteAccount }
)(Dashboard);
