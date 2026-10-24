import SectionHead from "../components/SectionHead";
import { ArrowUpRight } from "../components/Icons";
import { linkByLabel, useSiteData } from "../hooks/useSiteData";

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
};

const Writing = () => {
  const { posts, postsLoading, links } = useSiteData();
  const medium = linkByLabel(links, /medium/i);
  const latest = posts.slice(0, 4);

  return (
    <section id="writing" className="section section-alt" aria-labelledby="writing-title">
      <div className="container">
        <SectionHead
          index="06"
          label="Writing"
          id="writing-title"
          title={
            <>
              Notes from <span className="serif">the work</span>
            </>
          }
          aside={
            medium && (
              <a href={medium.href} target="_blank" rel="noopener noreferrer" className="link-u arrow-link">
                All posts on Medium <ArrowUpRight />
              </a>
            )
          }
        />

        {postsLoading ? (
          <div className="posts">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton" style={{ height: 72 }} />
            ))}
          </div>
        ) : latest.length ? (
          <ul className="posts">
            {latest.map((post) => (
              <li key={post.link} data-reveal>
                <a href={post.link} target="_blank" rel="noopener noreferrer" className="post">
                  <span className="post-date mono">{formatDate(post.pubDate)}</span>
                  <span className="post-title">{post.title}</span>
                  <span className="post-tags mono">{post.tags.slice(0, 3).join(" · ")}</span>
                  <ArrowUpRight className="post-go" />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="posts-empty" data-reveal>
            Posts load from Medium.{" "}
            {medium && (
              <a href={medium.href} target="_blank" rel="noopener noreferrer" className="link-u">
                Read them there
              </a>
            )}
          </p>
        )}
      </div>
    </section>
  );
};

export default Writing;
