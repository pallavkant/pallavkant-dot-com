import { useState, useEffect, useRef } from "react";
import "./styles.css";

const WEB3FORMS_ACCESS_KEY = process.env.REACT_APP_WEB3FORMS_ACCESS_KEY || "YOUR_WEB3FORMS_ACCESS_KEY";
const HCAPTCHA_SITEKEY = process.env.REACT_APP_HCAPTCHA_SITEKEY || "YOUR_HCAPTCHA_SITEKEY";
const WEB3FORMS_URL = "https://api.web3forms.com/submit";

const LANG_COLORS = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5",
  Java: "#b07219", "C#": "#178600", Go: "#00ADD8", Ruby: "#701516",
  HTML: "#e34c26", CSS: "#563d7c", Shell: "#89e051", Kotlin: "#A97BFF",
  Swift: "#F05138", Rust: "#dea584", PHP: "#4F5D95", Scala: "#c22d40",
  Vue: "#41b883", Dart: "#00B4AB",
};

const FALLBACK_POSTS = [
  { title: "The Art and Science of Prompt Engineering", link: "https://medium.com/@pallavkant/the-art-and-science-of-prompt-engineering-ec0feee3b58a", pubDate: "2025-03-06", thumbnail: null, description: "A deep dive into effective techniques for crafting prompts that get the best results from AI models." },
  { title: "Key Techniques to improve Trust in AI and Reduce Hallucinations", link: "https://medium.com/@pallavkant/key-techniques-to-improve-trust-in-ai-and-reduce-hallucinations-e4e854aa1c59", pubDate: "2025-03-02", thumbnail: "https://miro.medium.com/v2/resize:fill:320:214/1*iHIK-i3vwvdeWzTwo1HCFA.png", description: "AI systems are actively involved in decision-making processes across industries." },
  { title: "Anti-CSRF Tokens: Understanding Cross-Site Request Forgery", link: "https://medium.com/@pallavkant/anti-csrf-tokens-a6737c2307e0", pubDate: "2025-04-14", thumbnail: null, description: "Cross-Site Request Forgery is one of the most common web security vulnerabilities." },
  { title: "The Role of Reverse Proxy in Decrypting SSL/TLS Communication", link: "https://medium.com/@pallavkant/the-role-of-reverse-proxy-in-decrypting-ssl-tls-communication-ea42aa1b8f44", pubDate: "2025-03-27", thumbnail: "https://miro.medium.com/v2/resize:fill:320:214/1*yEwOVSvxw_4hBPSnkAN0_A.jpeg", description: "In today's digital landscape, securing communication between clients and servers is paramount." },
  { title: "What Are Tensors and Their Use in Training Machine Learning Models", link: "https://medium.com/@pallavkant/what-are-tensors-and-their-use-in-training-machine-learning-models-321d9fbf3cb3", pubDate: "2025-04-02", thumbnail: "https://miro.medium.com/v2/resize:fill:320:214/1*8hd3CeQjUCalMWds1U_pUw.jpeg", description: "In the world of machine learning, tensors are fundamental building blocks." },
  { title: "Differences and relationships between Foundation Models, LLMs and SLMs", link: "https://medium.com/@pallavkant/differences-and-relationships-between-foundation-models-llms-and-slms-f8ed35a251f7", pubDate: "2025-03-26", thumbnail: null, description: "Understanding the differences between foundation models, large language models, and small language models." },
];

const AI_NEWS_FALLBACK = [
  { title: "OpenAI releases GPT-5 with enhanced reasoning capabilities", source: "The Verge", link: "https://theverge.com", pubDate: "2025-05-16" },
  { title: "Google DeepMind's AlphaFold 3 accelerates drug discovery research", source: "Nature", link: "https://nature.com", pubDate: "2025-05-15" },
  { title: "Anthropic raises $2.5B to advance AI safety research", source: "TechCrunch", link: "https://techcrunch.com", pubDate: "2025-05-14" },
  { title: "Microsoft integrates Copilot AI across entire Office 365 suite", source: "Bloomberg", link: "https://bloomberg.com", pubDate: "2025-05-11" },
  { title: "AI agents now capable of autonomous multi-day coding tasks", source: "MIT Tech Review", link: "https://technologyreview.com", pubDate: "2025-05-10" },
];

/* ─── Helpers ────────────────────────────────────────────────── */
function fmtDate(d) {
  try { return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); }
  catch { return d; }
}
function fmtDateShort(d) {
  try { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
  catch { return d; }
}
function extractSource(url) {
  try { return new URL(url).hostname.replace("www.", "").split(".")[0].toUpperCase(); }
  catch { return "NEWS"; }
}
function stripHtml(h) {
  const t = document.createElement("div"); t.innerHTML = h;
  return (t.textContent || t.innerText || "").replace(/\s+/g, " ").trim();
}

/* ─── useFadeIn hook ─────────────────────────────────────────── */
function useFadeIn() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("visible"); obs.unobserve(el); } }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ─── Sub-components ─────────────────────────────────────────── */

function ArrowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function GitHubIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

/* NAV */
function Nav({ scrollTo }) {
  const [open, setOpen] = useState(false);
  const links = ["home", "ainews", "articles", "repos", "contact"];
  const labels = { home: "Home", ainews: "AI News", articles: "My Articles", repos: "My Repos", contact: "Contact" };

  const handleNav = (id) => { scrollTo(id); setOpen(false); };

  return (
    <nav className="pk-nav">
      <a className="nav-logo" onClick={() => handleNav("home")} style={{ cursor: "pointer" }}>
        Pallav Kant
      </a>
      <button className={`nav-toggle${open ? " open" : ""}`} onClick={() => setOpen(o => !o)} aria-label="Toggle menu">
        <span /><span /><span />
      </button>
      <ul className={`nav-links${open ? " open" : ""}`}>
        {links.map(id => (
          <li key={id}>
            <a onClick={() => handleNav(id)}>{labels[id]}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* HERO */
function Hero({ scrollTo }) {
  const nameRef = useFadeIn();
  const bodyRef = useFadeIn();
  const tags = [
    "Software Engineering", "Strategic Leadership", "Roadmaps & Delivery Excellence",
    "Generative AI and Agentic Systems", "Microservices", "Event-Driven Architectures",
    "Organizational Transformation", "Coding", "Architecture", "DevOps",
    "QA Automation", "Handyman", "Community",
  ];
  return (
    <section id="home" className="pk-section" style={{ minHeight: "calc(100vh - var(--nav-h))", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div className="section-inner">
        <h1 className="hero-name fade-in" ref={nameRef} style={{ transitionDelay: "0.08s" }}>Pallav Kant</h1>
        <div className="about-tags">
          {tags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>
        <div className="about-body fade-in" ref={bodyRef}>
          <p>I am a software programmer and a success‑driven engineering leader with more than 20 years of hands‑on experience building modern web applications. Throughout my career, I've led high‑performing teams across software development, architecture, QA automation, and DevOps, always driven by a commitment to excellence, innovation, and continuous improvement.</p>
          <p>Recently, I've developed a deep passion for artificial intelligence and its potential to transform how people interact with technology. Exploring this space has reignited my curiosity and expanded the way I think about building future‑ready solutions.</p>
          <p>Outside of work, I enjoy reading, learning new things (both tech and non-tech), and spending quality time with my family. I also actively volunteer at our community temple, supporting events, operations, and cultural programs. Beyond the temple, I contribute to broader community initiatives, helping wherever I can to strengthen and uplift the people around me.</p>
        </div>
      </div>
    </section>
  );
}

/* AI NEWS */
function NewsSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="news-item" style={{ borderBottom: i < 4 ? "1px solid var(--border)" : "none" }}>
          <div className="skeleton-block" style={{ width: 28, height: 28, borderRadius: 4, flexShrink: 0 }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            <div className="skeleton-block skeleton-line w-60" />
            <div className="skeleton-block skeleton-title w-90" />
            <div className="skeleton-block skeleton-line w-40" />
          </div>
        </div>
      ))}
    </div>
  );
}

function AINews() {
  const [items, setItems] = useState(null);
  const headerRef = useFadeIn();

  useEffect(() => {
    const AI_RSS = "https://news.google.com/rss/search?q=artificial+intelligence+AI&hl=en-US&gl=US&ceid=US:en";
    const API = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(AI_RSS)}`;
    fetch(API)
      .then(r => r.json())
      .then(data => {
        if (data.status === "ok" && data.items?.length) {
          setItems(data.items.slice(0, 5).map(item => ({
            title: stripHtml(item.title),
            source: item.author || extractSource(item.link),
            link: item.link,
            pubDate: item.pubDate,
          })));
        } else setItems(AI_NEWS_FALLBACK);
      })
      .catch(() => setItems(AI_NEWS_FALLBACK));
  }, []);

  return (
    <section id="ainews" className="pk-section bg-surface">
      <div className="section-inner">
        <div className="section-header fade-in" ref={headerRef}>
          <div><h2 className="section-title">AI News</h2></div>
          <a className="section-more-link" href="https://news.google.com/search?q=artificial+intelligence" target="_blank" rel="noopener">
            More AI news <ArrowIcon />
          </a>
        </div>
        {!items ? <NewsSkeleton /> : (
          <div className="news-list">
            {items.map((item, i) => (
              <NewsItem key={i} item={item} index={i} total={items.length} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function NewsItem({ item, index, total }) {
  const ref = useFadeIn();
  return (
    <a className="news-item fade-in" ref={ref} href={item.link} target="_blank" rel="noopener"
      style={{ transitionDelay: `${index * 0.04}s`, borderBottom: index < total - 1 ? "1px solid var(--border)" : "none" }}>
      <div className="news-num">{String(index + 1).padStart(2, "0")}</div>
      <div className="news-body">
        <div className="news-source">{item.source}</div>
        <div className="news-title">{item.title}</div>
        {item.pubDate && <div className="news-date">{fmtDateShort(item.pubDate)}</div>}
      </div>
    </a>
  );
}

/* ARTICLES */
function BlogSkeleton() {
  return (
    <div className="blog-grid">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="blog-card" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <div className="skeleton-block skeleton-thumb" />
          <div className="skeleton-body">
            <div className="skeleton-block skeleton-line w-40" />
            <div className="skeleton-block skeleton-title w-80" />
            <div className="skeleton-block skeleton-title w-90" />
            <div className="skeleton-block skeleton-line w-60" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Articles() {
  const [posts, setPosts] = useState(null);
  const headerRef = useFadeIn();

  useEffect(() => {
    const API = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent("https://medium.com/feed/@pallavkant")}`;
    fetch(API)
      .then(r => r.json())
      .then(data => {
        if (data.status === "ok" && data.items?.length) setPosts(data.items.slice(0, 6));
        else setPosts(FALLBACK_POSTS);
      })
      .catch(() => setPosts(FALLBACK_POSTS));
  }, []);

  return (
    <section id="articles" className="pk-section bg-bg">
      <div className="section-inner">
        <div className="section-header fade-in" ref={headerRef}>
          <div><h2 className="section-title">My Articles</h2></div>
          <a className="section-more-link" href="https://medium.com/@pallavkant" target="_blank" rel="noopener">
            View all on Medium <ArrowIcon />
          </a>
        </div>
        {!posts ? <BlogSkeleton /> : (
          <div className="blog-grid">
            {posts.map((post, i) => <BlogCard key={i} post={post} index={i} />)}
          </div>
        )}
      </div>
    </section>
  );
}

function BlogCard({ post, index }) {
  const ref = useFadeIn();
  const thumb = post.thumbnail?.startsWith("http") ? post.thumbnail : null;
  const snippet = stripHtml(post.description || post.content || "").slice(0, 155) + "…";
  return (
    <a className="blog-card fade-in" ref={ref} href={post.link || "#"} target="_blank" rel="noopener"
      style={{ transitionDelay: `${index * 0.07}s` }}>
      {thumb
        ? <img className="blog-card-thumb" src={thumb} alt="" loading="lazy" />
        : <div className="blog-card-thumb-placeholder">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" opacity="0.4"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
          </div>
      }
      <div className="blog-card-body">
        <p className="blog-card-date">{fmtDate(post.pubDate || "")}</p>
        <h3 className="blog-card-title">{post.title || "Untitled"}</h3>
        <p className="blog-card-snippet">{snippet}</p>
      </div>
    </a>
  );
}

/* REPOS */
function RepoSkeleton() {
  return (
    <div className="repo-grid">
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1.2rem 1.3rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          <div className="skeleton-block skeleton-line w-60" />
          <div className="skeleton-block skeleton-line w-90" />
          <div className="skeleton-block skeleton-line w-80" />
          <div className="skeleton-block skeleton-line w-40" />
        </div>
      ))}
    </div>
  );
}

function Repos() {
  const [repos, setRepos] = useState(null);
  const [error, setError] = useState(false);
  const headerRef = useFadeIn();

  useEffect(() => {
    fetch("https://api.github.com/users/pallavkant/repos?sort=updated&per_page=30&type=public", {
      headers: { Accept: "application/vnd.github.v3+json" },
    })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => {
        const sorted = data
          .filter(r => !r.fork)
          .sort((a, b) => (b.stargazers_count - a.stargazers_count) || (new Date(b.updated_at) - new Date(a.updated_at)))
          .slice(0, 9);
        setRepos(sorted);
      })
      .catch(() => setError(true));
  }, []);

  return (
    <section id="repos" className="pk-section bg-surface">
      <div className="section-inner">
        <div className="section-header fade-in" ref={headerRef}>
          <div><h2 className="section-title">My GitHub Repos</h2></div>
          <a className="section-more-link" href="https://github.com/pallavkant" target="_blank" rel="noopener">
            View all repos <ArrowIcon />
          </a>
        </div>
        {error ? (
          <p style={{ color: "var(--ink-muted)", textAlign: "center", padding: "2rem" }}>
            Couldn't load repositories — <a href="https://github.com/pallavkant" target="_blank" rel="noopener" style={{ color: "var(--accent)" }}>view on GitHub</a>.
          </p>
        ) : !repos ? <RepoSkeleton /> : repos.length === 0 ? (
          <p style={{ color: "var(--ink-muted)", textAlign: "center", padding: "2rem" }}>No public repositories found.</p>
        ) : (
          <div className="repo-grid">
            {repos.map((repo, i) => <RepoCard key={repo.id} repo={repo} index={i} />)}
          </div>
        )}
      </div>
    </section>
  );
}

function RepoCard({ repo, index }) {
  const ref = useFadeIn();
  const lc = LANG_COLORS[repo.language] || "#8b8b8b";
  const ud = new Date(repo.updated_at).toLocaleDateString("en-US", { year: "numeric", month: "short" });
  return (
    <a className="repo-card fade-in" ref={ref} href={repo.html_url} target="_blank" rel="noopener"
      style={{ transitionDelay: `${index * 0.05}s` }}>
      <div className="repo-card-header">
        <GitHubIcon size={15} />
        <span className="repo-name">{repo.name}</span>
      </div>
      <p className="repo-desc">{repo.description || "No description provided."}</p>
      <div className="repo-meta">
        {repo.language && (
          <span className="repo-meta-item">
            <span className="repo-lang-dot" style={{ background: lc }} />
            {repo.language}
          </span>
        )}
        <span className="repo-meta-item">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          {repo.stargazers_count}
        </span>
        <span className="repo-meta-item">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>
          {repo.forks_count}
        </span>
        <span className="repo-meta-item" style={{ marginLeft: "auto" }}>{ud}</span>
      </div>
    </a>
  );
}

/* CONTACT */
function Contact() {
  const leftRef = useFadeIn();
  const rightRef = useFadeIn();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(null); // null | 'success' | 'error' | 'config'
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const captchaRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    if (!captchaRef.current) return;

    const renderCaptcha = () => {
      if (!window.hcaptcha || widgetIdRef.current !== null) return;
      widgetIdRef.current = window.hcaptcha.render(captchaRef.current, {
        sitekey: HCAPTCHA_SITEKEY,
        size: "normal",
        callback: setCaptchaToken,
        "error-callback": () => setCaptchaToken(""),
        "expired-callback": () => setCaptchaToken(""),
      });
    };

    if (window.hcaptcha) {
      renderCaptcha();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://hcaptcha.com/1/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = renderCaptcha;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setStatus("error");
      setErrorMessage("Please fill in your name and email.");
      return;
    }

    if (WEB3FORMS_ACCESS_KEY === "YOUR_WEB3FORMS_ACCESS_KEY") {
      setStatus("config");
      setErrorMessage("Please set REACT_APP_WEB3FORMS_ACCESS_KEY in your .env file.");
      return;
    }

    if (HCAPTCHA_SITEKEY === "YOUR_HCAPTCHA_SITEKEY") {
      setStatus("config");
      setErrorMessage("Please set REACT_APP_HCAPTCHA_SITEKEY in your .env file.");
      return;
    }

    if (!captchaToken) {
      setStatus("error");
      setErrorMessage("Please complete the captcha.");
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const payload = {
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `Message from ${form.name} via pallavkant.com`,
        name: form.name,
        email: form.email,
        message: form.message,
        "h-captcha-response": captchaToken,
      };

      const response = await fetch(WEB3FORMS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Submit failed");

      setStatus("success");
      setForm({ name: "", email: "", message: "" });
      setCaptchaToken("");
      if (window.hcaptcha && widgetIdRef.current !== null) {
        window.hcaptcha.reset(widgetIdRef.current);
      }
    } catch (error) {
      setStatus("error");
      setErrorMessage("There was a problem sending the message. Please try again.");
      console.error("Web3Forms send error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="pk-section bg-bg">
      <div className="section-inner">
        <div className="contact-grid">
          <div className="fade-in" ref={leftRef}>
            <h2 className="section-title">Get in Touch</h2>
            <p className="contact-intro">Feel free to reach out whether it's about software, leadership, AI, or just a friendly hello. I'm always happy to connect.</p>
            <div className="social-links">
              <a className="social-link" href="https://www.linkedin.com/in/pallavkant" target="_blank" rel="noopener">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                LinkedIn
              </a>
              <a className="social-link" href="https://github.com/pallavkant" target="_blank" rel="noopener">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                GitHub
              </a>
              <a className="social-link" href="https://medium.com/@pallavkant" target="_blank" rel="noopener">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/></svg>
                Medium
              </a>
            </div>
          </div>

          <div className="fade-in" ref={rightRef}>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name <span style={{ color: "#f87171" }}>*</span></label>
                <input type="text" placeholder="Your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Email <span style={{ color: "#f87171" }}>*</span></label>
                <input type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea placeholder="What's on your mind?" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
              </div>
              <div className="form-group">
                <div ref={captchaRef} className="hcaptcha-widget" />
              </div>
              {status === "success" && <div className="form-status success">✨ Thank you for your message!</div>}
              {(status === "error" || status === "config") && <div className="form-status error">{errorMessage}</div>}
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Sending…" : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

/* FOOTER */
function Footer() {
  return (
    <footer>
      <p>© Pallav Kant 2012–2026. All rights reserved.</p>
    </footer>
  );
}

/* ─── App ────────────────────────────────────────────────────── */
export default function App() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Nav scrollTo={scrollTo} />
      <Hero scrollTo={scrollTo} />
      <AINews />
      <Articles />
      <Repos />
      <Contact />
      <Footer />
    </>
  );
}
