import React from "react";
import PropTypes from "prop-types";
import Moment from "react-moment";
import { connect } from "react-redux";
import { deleteEduction } from "../../actions/profile";

const Education = ({ education,deleteEduction }) => {
  const educations = education.map(edu => (
    <tr key={edu._id}>
      <td>{edu.school}</td>
      <td className='hide-sm'>{edu.degree} </td>
      <td>
        <Moment format='YYYY/MM/DD'>{edu.from}</Moment>-
        {edu.to === null ? (
          " Now"
        ) : (
          <Moment format='YYYY/MM/DD'>{edu.to}</Moment>
        )}
      </td>
      <td>
        <button className='btn btn-danger'
        onClick={()=>deleteEduction(edu._id)}>Delete</button>
      </td>
    </tr>
  ));
  return (
    <React.Fragment>
      <h2 className='my-2'>Education Credentials</h2>
      <table className='table'>
        <thead>
          <tr>
            <th>School</th>
            <th className='hide-sm'>Degree</th>
            <th className='hide-sm'>Years</th>
            <th />
          </tr>
        </thead>
        <tbody>{educations}</tbody>
      </table>
    </React.Fragment>
  );
};

Education.propTypes = {
  education: PropTypes.array.isRequired,
  deleteEduction:PropTypes.func.isRequired,
};

export default connect(null,{deleteEduction})(Education);
