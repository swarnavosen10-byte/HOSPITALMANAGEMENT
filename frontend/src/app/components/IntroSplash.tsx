const introLetters = "MEDISYNC".split("");
const particles = Array.from({ length: 18 }, (_, index) => index);

type IntroSplashProps = {
  isLeaving?: boolean;
};

export default function IntroSplash({ isLeaving = false }: IntroSplashProps) {
  return (
    <div className={`intro-splash ${isLeaving ? "intro-splash--leaving" : ""}`} aria-label="Medisync opening animation">
      <div className="intro-splash__particles" aria-hidden="true">
        {particles.map((particle) => (
          <span
            key={particle}
            className="intro-splash__particle"
            style={{
              left: `${(particle * 11) % 100}%`,
              top: `${(particle * 17) % 100}%`,
              animationDelay: `${particle * 140}ms`,
            }}
          />
        ))}
      </div>

      <div className="intro-splash__aurora intro-splash__aurora--one" />
      <div className="intro-splash__aurora intro-splash__aurora--two" />
      <div className="intro-splash__aurora intro-splash__aurora--three" />
      <div className="intro-splash__scanlines" aria-hidden="true" />

      <div className="intro-splash__frame">
        <p className="intro-splash__eyebrow">Hospital Suite</p>

        <div className="intro-splash__orbit" aria-hidden="true">
          <span className="intro-splash__orbit-ring" />
          <span className="intro-splash__orbit-ring intro-splash__orbit-ring--inner" />
          <span className="intro-splash__core">
            <span className="intro-splash__core-mark">M</span>
          </span>
          <span className="intro-splash__ring-flare" />
        </div>

        <div className="intro-splash__logo" aria-hidden="true">
          <span className="intro-splash__sweep" />
          {introLetters.map((letter, index) => (
            <span
              key={letter + index}
              className="intro-splash__letter"
              style={{ animationDelay: `${index * 110}ms` }}
            >
              {letter}
            </span>
          ))}
        </div>

        <p className="intro-splash__subtitle">Centralized hospital operations across Kolkata</p>

        <p className="intro-splash__microcopy">Loading patient workflows, revenue analytics, and live operations</p>

        <div className="intro-splash__status" aria-hidden="true">
          <span className="intro-splash__status-dot" />
          <span>Initializing secure Medisync workspace</span>
        </div>

        <div className="intro-splash__loader" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}