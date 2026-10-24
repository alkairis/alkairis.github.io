import { profile } from "../content/profile";
import { useAssistantStore } from "../stores/useAssistantStore";

const Footer = () => {
  const openMenu = useAssistantStore((s) => s.openMenu);
  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p>
          © {new Date().getFullYear()} {profile.name}. Built with React and a FastAPI CMS, in {profile.location}.
        </p>
        <p className="footer-tools">
          <button type="button" className="footer-ask" onClick={() => openMenu()}>
            Ask the ghost <kbd>{isMac ? "⌘" : "Ctrl"}</kbd>
            <kbd>K</kbd>
          </button>
          <a href={profile.repoUrl} target="_blank" rel="noopener noreferrer" className="link-u">
            Source
          </a>
          <a href="#top" className="link-u">
            Back to top ↑
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
