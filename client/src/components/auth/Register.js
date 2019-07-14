import React, { useState } from "react";
import { Link ,Redirect} from "react-router-dom";
import { connect } from "react-redux";
import { setAlert } from "../../actions/alert";
import {register} from '../../actions/auth'
import PropTypes from "prop-types";
const Register = ({ setAlert,register,isAuthenticated }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password2: ""
  });

  const onChange = e =>
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  const onSubmit = async e => {
    e.preventDefault();
    if (password !== password2) {
      setAlert("passwords does not Match", "danger");
    } else {
      register({name,email,password})
    }
  };
  //Redirect 
  if(isAuthenticated){
    return <Redirect to='/login' />
  }
  const { name, email, password, password2 } = formData;
  return (
    <React.Fragment>
      <h1 className='large text-primary'>Sign Up</h1>
      <p className='lead'>
        <i className='fas fa-user' /> Create Your Account
      </p>
      <form className='form' onSubmit={e => onSubmit(e)}>
        <div className='form-group'>
          <input
            type='text'
            placeholder='Name'
            value={name}
            onChange={e => onChange(e)}
            name='name'
            
          />
        </div>
        <div className='form-group'>
          <input
            type='email'
            placeholder='Email Address'
            value={email}
            onChange={e => onChange(e)}
            name='email'
          />
          <small className='form-text'>
            This site uses Gravatar so if you want a profile image, use a
            Gravatar email
          </small>
        </div>
        <div className='form-group'>
          <input
            type='password'
            value={password}
            onChange={e => onChange(e)}
            placeholder='Password'
            name='password'
            minLength='6'
          />
        </div>
        <div className='form-group'>
          <input
            type='password'
            value={password2}
            onChange={e => onChange(e)}
            placeholder='Confirm Password'
            name='password2'
            minLength='6'
          />
        </div>
        <input type='submit' className='btn btn-primary' value='Register' />
      </form>
      <p className='my-1'>
        Already have an account? <Link to='/login'>Sign In</Link>
      </p>
    </React.Fragment>
  );
};
Register.propTypes={
  setAlert:PropTypes.func.isRequired,
  register:PropTypes.func.isRequired,
  isAuthenticated:PropTypes.bool,
}

const mapStateToProps=state=>({
  isAuthenticated:state.auth.isAuthenticated
})
export default connect(
  mapStateToProps,
  { setAlert,register }
)(Register);
