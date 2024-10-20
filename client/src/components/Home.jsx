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
  const [error, setError] = useState('');
  const [date, setDate] = useState('');
  const navigate = useNavigate();

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

  // Fetch tasks data from the server
  async function getData() {
    try {
      const response = await axios.get('http://localhost:3000/content');
      console.log("data received: ",response.data);
      const tasks = response.data.rows.map((data) => ({
        id: data.id,
        title: data.title,
        status: data.status,
        date: data.date
      }));
      setToDo(tasks);
    } catch (err) {
      console.error('Error fetching tasks data:', err);
    }
  }

  // Add a new task
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
        console.error('Error adding the task:', error);
      }
    }
  };

  // Delete a task
  const deleteTask = async (id) => {
    let newTasks = toDo.filter((task) => task.id !== id);
    setToDo(newTasks);
    try {
      await axios.delete('http://localhost:3000/delete', { data: { id } });
    } catch (error) {
      console.error('Error deleting the task:', error);
    }
  };

  // Mark a task as done or undone
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
      console.error('Error marking the task:', error);
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
      status: updateData.status,
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
      console.error('Error updating the task:', error);
    }
  };

  // Calculate days difference between task date and current date
  const calculateDaysDifference = (taskDate) => {
    const currentDate = new Date();
    const dueDate = new Date(taskDate);
    const timeDiff = dueDate.getTime() - currentDate.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    console.log("date-diff: ",dayDiff);
    return dayDiff;
  };

  return (
    <div className="OuterBody">
      <h2 className="Heading">To Do List App</h2>
      <div className="container">
        {updateData ? (
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
        ) : (
          <div className="row">
            <div className="col">
              <input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="form-control form-control-lg"
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-control"
              />
            </div>
            <div className="col-auto">
              <button className="btn btn-lg btn-success" onClick={addTask}>
                Add Task
              </button>
            </div>
          </div>
        )}

        {toDo && toDo.length ? '' : 'No tasks...'}

        {toDo &&
          toDo
            .sort((a, b) => (a.id > b.id ? 1 : -1))
            .map((task, index) => {
              console.log("task.date: ",task.date);
              const numOfDays = calculateDaysDifference(task.date);

              return (
                <React.Fragment key={task.id}>
                  <div className="col taskBg">
                    <div className={task.status ? 'done' : ''}>
                      <span className="taskNumber">{index + 1}</span>
                      <span className="taskText">{task.title}</span>
                    </div>

                    <span className="alert">
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
                            setUpdateData({
                              id: task.id,
                              title: task.title,
                              status: task.status,
                            })
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
