import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = import.meta.env.VITE_API_BASE;

function App() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/api/articles`)
      .then(res => setArticles(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="loading">Loading articles...</p>;

  return (
    <div className="container">
      <h1>Beyond Articles</h1>

      {articles.length === 0 && <p>No articles found.</p>}

      <div className="grid">
        {articles.map(article => (
          <div className="card" key={article.id}>
            <h3>{article.title}</h3>

            <span className={article.is_updated ? "badge updated" : "badge original"}>
              {article.is_updated ? "Updated" : "Original"}
            </span>

            <p>{article.content.slice(0, 200)}...</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
