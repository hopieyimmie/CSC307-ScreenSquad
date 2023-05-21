import React, {useState, useEffect} from 'react'
import axios from 'axios'
import {useNavigate} from 'react-router-dom'
function TableHeader(props)  {
    return (
      <thead>
        <tr>
          <th>{props.headers[0]}</th>
          <th>{props.headers[1]}</th>
          <th>{props.headers[2]}</th>
          <th>{props.headers[3]}</th>
        </tr>
      </thead>
    );
}




function TableBody(props) {
  const [users, setUsers] = useState([]);
  const [editedUsers, setEditedUsers] = useState({});
  const navigate = useNavigate();
  useEffect(() => {
    setUsers(props.tableData);
  })

  
  const handleInputChange = (event, userId) => {
    const { name, value } = event.target;
    console.log('name', name);
    console.log('value', value);
    console.log('isAdmin value', editedUsers[userId]?.isAdmin);
    if(name === 'isAdmin'){
      let booleanForAdmin = false;
      if(editedUsers[userId]?.isAdmin === undefined || editedUsers[userId]?.isAdmin === false){
        booleanForAdmin = true;
      }
      setEditedUsers((prevState) => ({
        ...prevState,
        [userId]: {
          ...prevState[userId],
          [name]: booleanForAdmin,
        },
      }));
    }
    else{
      setEditedUsers((prevState) => ({
        ...prevState,
        [userId]: {
          ...prevState[userId],
          [name]: value,
        },
      }));
    }
    
    
  };

  const updateUser = async (userId) => {
    try {
      const response = await axios.put(`http://localhost:8000/users/${userId}`, editedUsers[userId]);
      console.log(`http://localhost:8000/users/${userId}`)
      const responseUser = await axios.get(`http://localhost:8000/users/${userId}`);
      if(localStorage.getItem('id') == userId){
        localStorage.setItem('name', responseUser.data.name);
        localStorage.setItem('email', responseUser.data.email);
        localStorage.setItem('isAdmin', responseUser.data.isAdmin);
      }
      navigate('/admin')
      // Handle the response as needed
      console.log(response.data);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  function isChecked(user1, user2){
    let checked = user1;
    if(user1 === undefined){
      checked = user2
    }
    if(checked === true){
      return true
    }
    return false
  }

  function checkAttribute(firstAttribute, secondAttribute){
    if(firstAttribute == undefined){
      return secondAttribute
    }
    return firstAttribute
  }
  return (
    <tbody>
      {users.map((user) => (
      <tr key={user._id}>
        <td>
          <input
            type="text"
            name="name"
            className="form-control mt-1"
            value={checkAttribute(editedUsers[user._id]?.name, user.name)}
            onChange={(event) => handleInputChange(event, user._id)}
          />
        </td>
        
        <td>
          <input
            type="text"
            name="email"
            className="form-control mt-1"
            value={checkAttribute(editedUsers[user._id]?.email, user.email)}
            onChange={(event) => handleInputChange(event, user._id)}
          />
        </td>
        <td>
          <input
              type="checkbox"
              name="isAdmin"
              checked={isChecked(editedUsers[user._id]?.isAdmin, user.isAdmin)}
              onChange={(event) => handleInputChange(event, user._id)}
            />
        </td>
        <td><button onClick={() => updateUser(user._id)}>Update</button></td>
        <td><button onClick={() => updateUser(user._id)}>Delete</button></td>
      </tr>
      ))}
    </tbody>
  );
}

function Table(props) {
    return (
      <table style = {{height: '100%'}}>
        <TableHeader headers={props.tableHeaders}/>
        <TableBody tableData={props.tableData} removeUser={props.removeFunction} valuesChanged={props.changedFunction}/>
      </table>
    );
} 

export default Table
  
  
  
  