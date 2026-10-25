import SectionHead from "../components/SectionHead";
import { ArrowUpRight } from "../components/Icons";
import { useSiteData } from "../hooks/useSiteData";

const Credentials = () => {
  const { certificates, achievements } = useSiteData();

  return (
    <section id="credentials" className="section" aria-labelledby="credentials-title">
      <div className="container">
        <SectionHead
          index="05"
          label="Credentials"
          id="credentials-title"
          title={
            <>
              Certified, and <span className="serif">recognised</span>
            </>
          }
        />

        <div className="creds" data-fx="0.55">
          <div className="creds-col">
            <p className="eyebrow creds-label">Certifications · {certificates.length}</p>
            <ul className="cred-list">
              {certificates.map((c) => {
                const body = (
                  <>
                    <span className="cred-logo" aria-hidden="true">
                      {c.image && <img src={c.image} alt="" loading="lazy" />}
                    </span>
                    <span className="cred-text">
                      <strong>{c.name}</strong>
                      <span>{c.organization}</span>
                    </span>
                    <span className="cred-date mono">{c.issueDate}</span>
                    {c.credentialUrl && <ArrowUpRight className="cred-go" />}
                  </>
                );
                return (
                  <li key={c.id}>
                    {c.credentialUrl ? (
                      <a href={c.credentialUrl} target="_blank" rel="noopener noreferrer" className="cred" aria-label={`${c.name} — verify credential`}>
                        {body}
                      </a>
                    ) : (
                      <div className="cred">{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="creds-col">
            <p className="eyebrow creds-label">Awards · {achievements.length}</p>
            <ul className="award-list">
              {achievements.map((a) => (
                <li key={a.id} className="award">
                  <span className="award-year mono">{a.year}</span>
                  <div>
                    <strong>
                      {a.link ? (
                        <a href={a.link} target="_blank" rel="noopener noreferrer" className="link-u">
                          {a.title}
                        </a>
                      ) : (
                        a.title
                      )}
                    </strong>
                    <span className="award-org">{a.category}</span>
                    {a.description && <p>{a.description}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Credentials;
