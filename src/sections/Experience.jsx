import { useEffect, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { getProfessionalExperience } from "../api/api";
import TitleHeader from "../components/TitleHeader";
import GlowCard from "../components/GlowCard";

gsap.registerPlugin(ScrollTrigger);

const Experience = () => {
  const [experiences, setExperiences] = useState([]);

  useEffect(() => {
    let active = true;
    getProfessionalExperience()
      .then((data) => {
        if (active) setExperiences(data);
      })
      .catch(() => {
        if (active) setExperiences([]);
      });
    return () => {
      active = false;
    };
  }, []);

  useGSAP(() => {
    gsap.utils.toArray(".timeline-card").forEach((card) => {
      gsap.fromTo(
        card,
        { x: -55, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 82%",
          },
        }
      );
    });

    gsap.utils.toArray(".timeline-wrapper").forEach((wrapper) => {
      const line = wrapper.querySelector(".gradient-line");
      if (!line) return;

      gsap.to(line, {
        scaleY: 1,
        transformOrigin: "top top",
        ease: "none",
        scrollTrigger: {
          trigger: wrapper,
          start: "top 85%",
          end: "bottom 60%",
          scrub: true,
        },
      });
    });

    gsap.utils.toArray(".expText").forEach((text) => {
      gsap.fromTo(
        text,
        { x: 40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: text,
            start: "top 82%",
          },
        }
      );
    });
  }, { dependencies: [experiences] });

  return (
    <section
      id="experience"
      className="flex-center md:mt-40 mt-20 section-padding xl:px-0"
    >
      <div className="w-full h-full md:px-20 px-5">
        <TitleHeader
          title="Academic & Professional Journey"
          sub="🎓💼 From campus to career milestones"
        />

        <div className="mt-32 relative">
          <div className="relative z-50 xl:space-y-32 space-y-10">
            {experiences.map((card, index) => (
              <div key={card.id} className="exp-card-wrapper">
                <div className="xl:w-2/6">
                  <GlowCard index={index}>
                    {card.bannerImage ? (
                      <div>
                        <img src={card.bannerImage} alt={`${card.company} banner`} />
                      </div>
                    ) : (
                      <div className="exp-company-plate">
                        <span className="exp-company-name">{card.company}</span>
                        <span className="exp-company-role">{card.title}</span>
                      </div>
                    )}
                  </GlowCard>
                </div>
                <div className="xl:w-4/6">
                  <div className="flex items-start">
                    <div className="timeline-wrapper">
                      <div className="timeline" />
                      <div className="gradient-line w-1 h-full" />
                    </div>
                    <div className="expText flex xl:gap-20 md:gap-10 gap-5 relative z-20">
                      {card.logo && (
                        <div className="timeline-logo">
                          <img src={card.logo} alt={`${card.company} logo`} />
                        </div>
                      )}
                      <div>
                        <h1 className="font-semibold text-3xl">{card.title}</h1>
                        {card.company && (
                          <>
                          <p className="mt-2 text-lg text-white-50">
                            {card.company}  🗓️&nbsp;{card.date}
                          </p>
                          <p className="my-5 text-white-50"></p>
                          </>
                        )}
                        
                        <p className="text-[#839CB5] italic">Responsibilities</p>
                        <ul className="list-disc ms-5 mt-5 flex flex-col gap-5 text-white-50">
                          {card.responsibilities.map((responsibility, i) => (
                            <li key={i} className="text-lg">
                              {responsibility}
                            </li>
                          ))}
                        </ul>
                        {card.recognition.length > 0 && (
                          <>
                            <p className="text-[#839CB5] italic mt-8">
                              Recognition
                            </p>
                            <ul className="list-disc ms-5 mt-5 flex flex-col gap-5 text-white-50">
                              {card.recognition.map((item, i) => (
                                <li key={i} className="text-lg">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
