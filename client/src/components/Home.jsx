import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faCircleCheck, faPen, faTrashCan 
} from '@fortawesome/free-solid-svg-icons'
import './Home.css';
import React,{ useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Home() {

  // Tasks (ToDo List) State
  const [toDo, setToDo] = useState([]);

  // Temp State
  const [newTask, setNewTask] = useState('');
  const [updateData, setUpdateData] = useState('');
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState('');
    const [name,setName]=useState('');
    const navigate=useNavigate();
    axios.defaults.withCredentials=true;
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get('http://localhost:3000/home', { withCredentials: true });
                // console.log("home res->",response);
                if(response.data.valid){
                    // setName(response.data.username);
                    navigate('/');
                }else{
                    navigate('/auth');
                }
            } catch (err) {
                setError(err.response?.data || "Error fetching user data");
            }
        };

        fetchUserData();
        getData();
    }, []);

    console.log("User=>",name);

  // fetch data
  async function getData() {
    try {
      const response = await axios.get('http://localhost:3000/content');
      console.log("Received data: ", response.data.rows);
      const tasks = response.data.rows.map((data) => ({
        id: data.id,
        title: data.title,
        status: data.status // Ensure 0 or false are handled correctly
      }));
      setToDo(tasks); // Update the toDo state with the new list of tasks
    } catch (err) {
      console.error("Error in fetching the data on the client side: ", err);
    }
  }
  

  

  // Add task 
  ////////////////////////////////////////// 
  const addTask = async () => {
    if(newTask) {
      let num = toDo.length + 1; 
      let newEntry = {id: num, title: newTask, status: false}
      setToDo([...toDo, newEntry]);
      setNewTask('');
      try{
        await axios.post('http://localhost:3000/add',{
          newEntry
        });
      }catch(error){
        console.error("Error in adding the task (client): ",error)
      }
    }
  }

  // Delete task 
  ////////////////////////////////////////// 
  const deleteTask = async (id) => {
    console.log("delete id: ", id);
    let newTasks = toDo.filter((task) => task.id !== id);
    setToDo(newTasks);
    try {
        await axios.delete('http://localhost:3000/delete', {
            data: { id } // Wrap id in the `data` field
        });
    } catch (error) {
        console.error("Error in deleting the task (client): ", error);
    }
}


  // mark task as done or completed
  ////////////////////////////////////////// 
  const markDone = async(id) => {
    const newTasks = toDo.map((task) => {
      if (task.id === id){
        return ({ ...task, status: !task.status })
      }
      return task;
    });
    setToDo(newTasks);
    try{
      await axios.patch('http://localhost:3000/mark',{
        id
      });
    }catch(error){
      console.error("Error in marking the task (client): ", error);
    }
  }

  // cancel update
  ////////////////////////////////////////// 
  const cancelUpdate = () => {
    setUpdateData('');
  }

  // Change task for update
  ////////////////////////////////////////// 
  const changeTask = async (e) => {
    let newEntry = {
      id: updateData.id,
      title: e.target.value,
      status: updateData.status ? true : false
    }
    setUpdateData(newEntry);
  }

  const updateTask = async () => {
    // Filtering out the task being updated and creating a new array
    let filterRecords = [...toDo].filter(task => task.id !== updateData.id);
    let updatedObject = [...filterRecords, updateData]; // Including the updated task
    setToDo(updatedObject);
    setUpdateData(''); // Clear the update data after setting the new state
  
    try {
      await axios.patch('http://localhost:3000/update', {
        id: updateData.id, // Use updateData.id for the ID
        title: updateData.title // Use updateData.title for the title
      });
    } catch (error) {
      console.error("Error in updating the task (client):", error);
    }
  }
  

  
  return (
    <div className="container App">
      
      <br /><br />

      <h2>To Do List App (ReactJS)</h2>

      <br /><br />
      

      {updateData && updateData ? (
        <>
          <div className="row">
            <div className="col">
              <input 
                value={updateData && updateData.title} 
                onChange={ (e) => changeTask(e) } 
                className="form-control form-control-lg" 
              />
            </div>
            <div className="col-auto">
              <button 
                className="btn btn-lg btn-success mr-20" 
                onClick={updateTask}
              >Update</button>
              <button 
                className="btn btn-lg btn-warning" 
                onClick={cancelUpdate}
              >Cancel</button>
            </div>
          </div>
          <br />
        </>
      ) : (
        <>
          <div className="row">
            <div className="col">
              <input 
                value={newTask} 
                onChange={e => setNewTask(e.target.value)} 
                className="form-control form-control-lg" 
              />
            </div>
            <div className="col-auto">
              <button 
                className="btn btn-lg btn-success" 
                onClick={addTask}
              >Add Task</button>
            </div>
          </div>
          <br />
        </>
      )}


      {/* If there are no to dos in state, display a message   */}
      {toDo && toDo.length ? '' : 'No tasks...'}
      
      {/* Show to dos   */}
      {toDo && toDo
        .sort((a, b) => a.id > b.id ? 1 : -1)
        .map( (task, index) => {
        return(
          <React.Fragment key={task.id}>
          
            <div className="col taskBg">
              
              <div 
                // if task status is true, add class to this div named as done
                className={ task.status ? 'done' : '' }
              >
                {/* Show number of task */}
                <span className="taskNumber">{index + 1}</span> 
                <span className="taskText">{task.title}</span>
              </div>

              <div className="iconsWrap">
                <span 
                  onClick={(e) => markDone(task.id)}
                  title="Completed / Not Completed"
                >
                  <FontAwesomeIcon icon={faCircleCheck} />
                </span>
                
                {task.status ? null : (
                  <span 
                    title="Edit"
                    onClick={ () => setUpdateData({ id: task.id, title: task.title, satus: task.status ? true : false }) }
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </span>
                )}

                <span 
                  onClick={() => deleteTask(task.id)}
                  title="Delete"
                >
                  <FontAwesomeIcon icon={faTrashCan} />
                </span>
              </div>

            </div>
                     
        </React.Fragment>
        );
      })}
    </div>
  );
}

export default Home;
