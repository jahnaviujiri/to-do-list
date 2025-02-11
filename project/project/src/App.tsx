import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle2, Circle, Clock, Plus, Trash2, X, Edit2, Save, Calendar } from 'lucide-react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  reminderTime?: string;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTodo, setNewTodo] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editReminderTime, setEditReminderTime] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }

    const interval = setInterval(() => {
      const now = new Date();
      todos.forEach(todo => {
        if (todo.reminderTime && !todo.completed) {
          const reminderDate = new Date(todo.reminderTime);
          if (now >= reminderDate && Math.abs(now.getTime() - reminderDate.getTime()) < 60000) {
            if (audioRef.current) {
              audioRef.current.play().catch(error => {
                console.log('Audio playback failed:', error);
              });
            }

            new Notification('Todo Reminder', {
              body: todo.text,
              icon: '/reminder-icon.png'
            });
          }
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [todos]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const todo: Todo = {
      id: crypto.randomUUID(),
      text: newTodo,
      completed: false,
      reminderTime: reminderTime || undefined
    };

    setTodos([...todos, todo]);
    setNewTodo('');
    setReminderTime('');
    setShowForm(false);
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
    setEditReminderTime(todo.reminderTime || '');
  };

  const saveEdit = (id: string) => {
    if (!editText.trim()) return;

    setTodos(todos.map(todo =>
      todo.id === id
        ? { ...todo, text: editText, reminderTime: editReminderTime || undefined }
        : todo
    ));
    setEditingId(null);
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const stopAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <audio ref={audioRef} loop>
        <source src="https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3" type="audio/mpeg" />
      </audio>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-indigo-50">
          <div className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-serif text-white">Elegant Tasks</h1>
                <p className="text-indigo-100 mt-2">Organize your day with grace</p>
              </div>
              <button
                onClick={stopAlarm}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-105"
                title="Stop Alarm"
              >
                <Bell size={24} />
              </button>
            </div>
          </div>

          <div className="p-8">
            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full py-4 px-6 border-2 border-dashed border-indigo-200 rounded-xl text-indigo-500 hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-300 flex items-center justify-center gap-3 font-medium"
              >
                <Plus size={20} />
                Add New Task
              </button>
            ) : (
              <form onSubmit={addTodo} className="space-y-4 mb-6 bg-white p-6 rounded-xl shadow-sm">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Task Description</label>
                  <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="What needs to be done?"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Calendar size={16} />
                    Reminder Time
                  </label>
                  <div className="flex gap-4">
                    <input
                      type="datetime-local"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                    <button
                      type="submit"
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all hover:scale-105 flex items-center gap-2"
                    >
                      <Plus size={20} />
                      Add Task
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="space-y-4 mt-6">
              {todos.map(todo => (
                <div
                  key={todo.id}
                  className={`group p-4 rounded-xl ${
                    todo.completed ? 'bg-gray-50' : 'bg-white'
                  } border border-gray-200 hover:border-indigo-200 transition-all hover:shadow-md`}
                >
                  {editingId === todo.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      />
                      <div className="flex gap-3">
                        <input
                          type="datetime-local"
                          value={editReminderTime}
                          onChange={(e) => setEditReminderTime(e.target.value)}
                          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        />
                        <button
                          onClick={() => saveEdit(todo.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
                        >
                          <Save size={20} />
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <button
                          onClick={() => toggleTodo(todo.id)}
                          className={`text-2xl ${
                            todo.completed ? 'text-green-500' : 'text-gray-400 hover:text-indigo-500'
                          } transition-colors`}
                        >
                          {todo.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                        </button>
                        <span className={`flex-1 ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                          {todo.text}
                        </span>
                        {todo.reminderTime && (
                          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                            <Clock size={16} />
                            {new Date(todo.reminderTime).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEditing(todo)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        >
                          <Edit2 size={20} />
                        </button>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;