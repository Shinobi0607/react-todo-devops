import { useState } from "react";
import "./App.css";

function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: "Set up Docker container", done: true },
    { id: 2, text: "Configure Kubernetes cluster", done: true },
    { id: 3, text: "Set up GitHub Actions CI/CD", done: false },
    { id: 4, text: "Deploy with ArgoCD", done: false },
  ]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState("all");

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos([...todos, { id: Date.now(), text: input.trim(), done: false }]);
    setInput("");
  };

  const toggleTodo = (id) =>
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const deleteTodo = (id) => setTodos(todos.filter((t) => t.id !== id));

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "done") return t.done;
    return true;
  });

  const doneCount = todos.filter((t) => t.done).length;

  return (
    <div className="app">
      <div className="card">
        <header>
          <div className="logo">✓</div>
          <h1>TaskFlow</h1>
          <p className="subtitle">
            {doneCount}/{todos.length} completed
          </p>
        </header>

        <div className="input-row">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="Add a new task..."
          />
          <button className="add-btn" onClick={addTodo}>
            +
          </button>
        </div>

        <div className="filters">
          {["all", "active", "done"].map((f) => (
            <button
              key={f}
              className={filter === f ? "active" : ""}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <ul className="todo-list">
          {filtered.length === 0 && (
            <li className="empty">No tasks here!</li>
          )}
          {filtered.map((todo) => (
            <li key={todo.id} className={todo.done ? "done" : ""}>
              <button className="check" onClick={() => toggleTodo(todo.id)}>
                {todo.done ? "✓" : ""}
              </button>
              <span>{todo.text}</span>
              <button className="delete" onClick={() => deleteTodo(todo.id)}>
                ×
              </button>
            </li>
          ))}
        </ul>

        <footer>
          <span>{todos.filter((t) => !t.done).length} tasks remaining</span>
          <button
            className="clear"
            onClick={() => setTodos(todos.filter((t) => !t.done))}
          >
            Clear done
          </button>
        </footer>
      </div>
    </div>
  );
}

export default App;
