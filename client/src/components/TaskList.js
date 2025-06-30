import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  List, ListItem, ListItemText, Checkbox, IconButton, 
  Typography, TextField, Button, Select, MenuItem, 
  FormControl, InputLabel, Paper, Box, TextareaAutosize,
  Snackbar, Alert
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    status: 'pending' 
  });
  const [filter, setFilter] = useState('all');
  const [editingTask, setEditingTask] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      const url = filter === 'all' ? '/api/tasks' : `/api/tasks?status=${filter}`;
      const response = await axios.get(url);
      setTasks(response.data);
    } catch (err) {
      setError(`Failed to fetch tasks: ${err.message}`);
      console.error('Error fetching tasks:', err);
    }
  }, [filter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask({ ...newTask, [name]: value });
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      setError('Task title cannot be empty');
      return;
    }
    
    try {
      await axios.post('/api/tasks', newTask);
      setNewTask({ title: '', description: '', status: 'pending' });
      await fetchTasks();
      setSuccess('Task added successfully');
    } catch (err) {
      setError(`Failed to add task: ${err.message}`);
      console.error('Error adding task:', err);
    }
  };

  const handleUpdateStatus = async (taskId, currentStatus) => {
    try {
      await axios.patch(`/api/tasks/${taskId}`, { 
        status: currentStatus === 'completed' ? 'pending' : 'completed' 
      });
      await fetchTasks();
      setSuccess('Task status updated');
    } catch (err) {
      setError(`Failed to update status: ${err.message}`);
      console.error('Error updating status:', err);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      status: task.status
    });
  };

  const handleUpdateTask = async () => {
    if (!newTask.title.trim()) {
      setError('Task title cannot be empty');
      return;
    }
    
    try {
      await axios.patch(`/api/tasks/${editingTask._id}`, newTask);
      setEditingTask(null);
      setNewTask({ title: '', description: '', status: 'pending' });
      await fetchTasks();
      setSuccess('Task updated successfully');
    } catch (err) {
      setError(`Failed to update task: ${err.message}`);
      console.error('Error updating task:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      await fetchTasks();
      setSuccess('Task deleted successfully');
    } catch (err) {
      setError(`Failed to delete task: ${err.message}`);
      console.error('Error deleting task:', err);
    }
  };

  const handleCloseAlert = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <Paper elevation={3} style={{ padding: '20px', maxWidth: '800px', margin: '20px auto' }}>
      <Typography variant="h4" align="center" gutterBottom>
        Task Tracker
      </Typography>

      {/* Error/Success Alerts */}
      {error && (
        <Snackbar open autoHideDuration={6000} onClose={handleCloseAlert}>
          <Alert severity="error" onClose={handleCloseAlert}>
            {error}
          </Alert>
        </Snackbar>
      )}
      {success && (
        <Snackbar open autoHideDuration={3000} onClose={handleCloseAlert}>
          <Alert severity="success" onClose={handleCloseAlert}>
            {success}
          </Alert>
        </Snackbar>
      )}

      {/* Task Input Form */}
      <Box display="flex" alignItems="center" mb={2}>
        <TextField
          label="Task Title"
          name="title"
          value={newTask.title}
          onChange={handleInputChange}
          fullWidth
          style={{ marginRight: '10px' }}
          required
        />
        <FormControl style={{ minWidth: '150px', marginRight: '10px' }}>
          <InputLabel>Status</InputLabel>
          <Select
            name="status"
            value={newTask.status}
            onChange={handleInputChange}
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
        </FormControl>
        {editingTask ? (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleUpdateTask}
          >
            Update Task
          </Button>
        ) : (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleAddTask}
          >
            Add Task
          </Button>
        )}
      </Box>
      
      <TextareaAutosize
        aria-label="Task Description"
        minRows={3}
        placeholder="Description"
        name="description"
        value={newTask.description}
        onChange={handleInputChange}
        style={{ width: '100%', marginBottom: '20px', padding: '10px' }}
      />
      
      {/* Filter Controls */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          {filter === 'all' ? 'All Tasks' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Tasks`}
        </Typography>
        <FormControl style={{ minWidth: '150px' }}>
          <InputLabel>Filter</InputLabel>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {/* Tasks List */}
      <List>
        {tasks.map((task) => (
          <ListItem 
            key={task._id} 
            divider
            style={{ 
              backgroundColor: task.status === 'completed' ? '#f5f5f5' : 'white',
              opacity: task.status === 'completed' ? 0.8 : 1
            }}
          >
            <Checkbox
              checked={task.status === 'completed'}
              onChange={() => handleUpdateStatus(task._id, task.status)}
              color="primary"
            />
            <ListItemText
              primary={task.title}
              secondary={
                <>
                  <Typography
                    component="span"
                    variant="body2"
                    color="textPrimary"
                    style={{ display: 'block' }}
                  >
                    {task.description}
                  </Typography>
                  <Typography
                    component="span"
                    variant="caption"
                    color={task.status === 'completed' ? 'primary' : 'textSecondary'}
                    style={{ 
                      fontWeight: 'bold',
                      textTransform: 'capitalize'
                    }}
                  >
                    {task.status}
                  </Typography>
                </>
              }
            />
            <IconButton onClick={() => handleEditTask(task)}>
              <Edit color="primary" />
            </IconButton>
            <IconButton onClick={() => handleDeleteTask(task._id)}>
              <Delete color="error" />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default TaskList;