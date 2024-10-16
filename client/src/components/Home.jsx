import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faPen, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import './Home.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [toDo, setToDo] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [updateData, setUpdateData] = useState('');
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const [date, setDate] = useState('');
  const [currDate, setCurrDate] = useState(new Date());
  const [numOfDays, setNumOfDays] = useState(0);

  axios.defaults.withCredentials = true;
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/home', { withCredentials: true });
        if (response.data.valid) {
          navigate('/');
        } else {
          navigate('/auth');
        }
      } catch (err) {
        setError(err.response?.data || 'Error fetching user data');
      }
    };

    fetchUserData();
    getData();
  }, []);

  console.log('User=>', name);

  // fetch data
  async function getData() {
    try {
      const response = await axios.get('http://localhost:3000/content');
      const tasks = response.data.rows.map((data) => ({
        id: data.id,
        title: data.title,
        status: data.status, // Ensure 0 or false are handled correctly
      }));
      setToDo(tasks); // Update the toDo state with the new list of tasks
    } catch (err) {
      console.error('Error in fetching the data on the client side: ', err);
    }
  }

  // Add task 
  const addTask = async () => {
    if (newTask && date) {
      let num = toDo.length + 1;
      let newEntry = { id: num, title: newTask, status: false, date: date };
      setToDo([...toDo, newEntry]);
      setNewTask('');
      setDate('');
      try {
        await axios.post('http://localhost:3000/add', { newEntry });
      } catch (error) {
        console.error('Error in adding the task (client): ', error);
      }
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    let newTasks = toDo.filter((task) => task.id !== id);
    setToDo(newTasks);
    try {
      await axios.delete('http://localhost:3000/delete', { data: { id } });
    } catch (error) {
      console.error('Error in deleting the task (client): ', error);
    }
  };

  // Mark task as done or completed
  const markDone = async (id) => {
    const newTasks = toDo.map((task) => {
      if (task.id === id) {
        return { ...task, status: !task.status };
      }
      return task;
    });
    setToDo(newTasks);
    try {
      await axios.patch('http://localhost:3000/mark', { id });
    } catch (error) {
      console.error('Error in marking the task (client): ', error);
    }
  };

  // Cancel update
  const cancelUpdate = () => {
    setUpdateData('');
  };

  // Change task for update
  const changeTask = (e) => {
    let newEntry = {
      id: updateData.id,
      title: e.target.value,
      status: updateData.status ? true : false,
    };
    setUpdateData(newEntry);
  };

  const updateTask = async () => {
    let filterRecords = [...toDo].filter((task) => task.id !== updateData.id);
    let updatedObject = [...filterRecords, updateData]; 
    setToDo(updatedObject);
    setUpdateData('');
    try {
      await axios.patch('http://localhost:3000/update', {
        id: updateData.id,
        title: updateData.title,
      });
    } catch (error) {
      console.error('Error in updating the task (client):', error);
    }
  };

  // Handle selected date
  const handleSelectedDate = (e) => {
    const selectedDate = new Date(e.target.value);
    setDate(e.target.value);
    const currentDate = new Date();
    setCurrDate(currentDate.toISOString().slice(0, 10));

    const timeDiff = selectedDate - currentDate;
    const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    setNumOfDays(dayDiff);
  };

  return (
    <div className="OuterBody">
      <h2 className='Heading'>To Do List App </h2>
      <div className='container' >
      {updateData ? (
        <>
          <div className="row">
            <div className="col">
              <input
                value={updateData.title}
                onChange={(e) => changeTask(e)}
                className="form-control form-control-lg"
              />
            </div>
            <div className="col-auto">
              <button className="btn btn-lg btn-success" onClick={updateTask}>
                Update
              </button>
              <button className="btn btn-lg btn-warning" onClick={cancelUpdate}>
                Cancel
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="row">
            <div className="col">
              <input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="form-control form-control-lg"
              />
              <input type="date" value={date} onChange={handleSelectedDate} />
            </div>
            <div className="col-auto">
              <button className="btn btn-lg btn-success" onClick={addTask}>
                Add Task
              </button>
            </div>
          </div>
        </>
      )}

      {toDo && toDo.length ? '' : 'No tasks...'}

      {toDo &&
        toDo
          .sort((a, b) => (a.id > b.id ? 1 : -1))
          .map((task, index) => {
            return (
              <React.Fragment key={task.id}>
                <div className="col taskBg">
                  <div className={task.status ? 'done' : ''}>
                    <span className="taskNumber">{index + 1}</span>
                    <span className="taskText">{task.title}</span>
                  </div>
                  <span className='alert'>
                        {numOfDays === 0
                        ? 'Due today'
                        : numOfDays > 0
                        ? `${numOfDays} days left`
                        : `${Math.abs(numOfDays)} days overdue`}
                    </span>
                  <div className="iconsWrap">
                    <span onClick={() => markDone(task.id)} title="Completed / Not Completed">
                      <FontAwesomeIcon icon={faCircleCheck} />
                    </span>
                    {task.status ? null : (
                      <span
                        title="Edit"
                        onClick={() =>
                          setUpdateData({ id: task.id, title: task.title, status: task.status })
                        }
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </span>
                    )}
                    <span onClick={() => deleteTask(task.id)} title="Delete">
                      <FontAwesomeIcon icon={faTrashCan} />
                    </span>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
          </div>
    </div>
  );
}

export default Home;
