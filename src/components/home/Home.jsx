import { Link } from "react-router-dom";
import "./Home.css";
import logo from "../../assets/Boost-White.png";
import marca from "../../assets/boost-mark-white.png";

const INSTAGRAM_URL = "https://www.instagram.com/boostyourenglish__/";

const AULAS = [
    {
        titulo: "Aulas individuais",
        texto:
            "Uma aula pensada para o seu objetivo: conversação, trabalho, viagem ou provas. O ritmo e o conteúdo acompanham você.",
        icone: (
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
        ),
    },
    {
        titulo: "Aulas em grupo",
        texto:
            "Aprenda junto com outras pessoas e pratique conversação em um ambiente colaborativo, com mais tempo de fala e troca.",
        icone: (
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        ),
    },
    {
        titulo: "De onde você estiver",
        texto:
            "Aulas 100% online. Você precisa apenas de internet e vontade de aprender, sem deslocamento e sem tempo perdido no trânsito.",
        icone: (
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        ),
    },
];

/* Rola suavemente até a seção. Feito em JS porque o hash puro não repete
   a rolagem quando o usuário clica duas vezes no mesmo item do menu. */
function rolarAteSecao(event) {
    const id = event.currentTarget.getAttribute("href").slice(1);
    const alvo = document.getElementById(id);
    if (!alvo) return;

    event.preventDefault();
    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    alvo.scrollIntoView({ behavior: reduzido ? "auto" : "smooth", block: "start" });
}

function Icone({ children }) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {children}
        </svg>
    );
}

function Home() {
    return (
        <div className="home">
            <header className="home-header">
                <div className="home-shell">
                    <a className="home-brand" href="#top" onClick={rolarAteSecao}>
                        <img src={marca} alt="Boost" />
                        <span>Boost</span>
                    </a>

                    <nav className="home-nav">
                        <a href="#sobre" onClick={rolarAteSecao}>
                            Sobre
                        </a>
                        <a href="#aulas" onClick={rolarAteSecao}>
                            Aulas
                        </a>
                        <a href="#contato" onClick={rolarAteSecao}>
                            Contato
                        </a>
                    </nav>

                    <Link className="home-login" to="/login">
                        Acesso do professor
                    </Link>
                </div>
            </header>

            <main id="top">
                <section className="home-hero">
                    <div className="home-shell">
                        <div>
                            <p className="hero-eyebrow">Aulas de inglês online</p>

                            <h1>
                                Inglês de onde <em>você estiver</em>.
                            </h1>

                            <p className="hero-text">
                                Aulas individuais ou em grupo com um professor que ensina há mais de
                                uma década. Do primeiro contato com o idioma à fluência na
                                conversação, no seu ritmo e no seu horário.
                            </p>

                            <div className="hero-actions">
                                <a
                                    className="btn btn-primary"
                                    href={INSTAGRAM_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Quero começar
                                </a>
                                <a className="btn btn-ghost" href="#aulas" onClick={rolarAteSecao}>
                                    Como funciona
                                </a>
                            </div>

                            <div className="hero-stats">
                                <div>
                                    <strong>10+</strong>
                                    <span>anos de experiência</span>
                                </div>
                                <div>
                                    <strong>100%</strong>
                                    <span>online</span>
                                </div>
                                <div>
                                    <strong>1:1</strong>
                                    <span>ou em grupo</span>
                                </div>
                            </div>
                        </div>

                        <div className="hero-logo">
                            <img src={logo} alt="" />
                        </div>
                    </div>
                </section>

                <section className="home-section" id="sobre">
                    <div className="home-shell">
                        <div className="section-head">
                            <h2>Quem ensina</h2>
                            <p>
                                Um professor, uma metodologia direta e a certeza de que aprender
                                inglês cabe na sua rotina.
                            </p>
                        </div>

                        <div className="about">
                            <div className="about-card">
                                <img src={marca} alt="" />
                                <h3>Igor Miura</h3>
                                <p>Professor de inglês há uma década</p>
                            </div>

                            <div className="about-body">
                                <p>
                                    O Boost nasceu da ideia de que ninguém deveria deixar o inglês
                                    para depois por falta de tempo ou de oportunidade. Por isso as
                                    aulas são online e pensadas para acompanhar a rotina de quem
                                    estuda, trabalha ou viaja.
                                </p>
                                <p>
                                    São mais de dez anos ensinando pessoas de níveis e objetivos
                                    diferentes, e cada plano de aula parte do que você precisa
                                    alcançar.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="home-section alt" id="aulas">
                    <div className="home-shell">
                        <div className="section-head">
                            <h2>Como funcionam as aulas</h2>
                            <p>
                                Escolha o formato que combina com o seu momento. Em todos eles, o
                                foco é fazer você falar desde a primeira aula.
                            </p>
                        </div>

                        <div className="cards">
                            {AULAS.map((aula) => (
                                <article className="card-item" key={aula.titulo}>
                                    <div className="card-icon">
                                        <Icone>{aula.icone}</Icone>
                                    </div>
                                    <h3>{aula.titulo}</h3>
                                    <p>{aula.texto}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="home-cta" id="contato">
                    <div className="home-shell">
                        <h2>Seja nosso aluno em 2026</h2>
                        <p>
                            Fale com a gente no Instagram para conhecer os horários disponíveis e
                            montar o seu plano de aulas.
                        </p>

                        <div className="hero-actions">
                            <a
                                className="btn btn-primary"
                                href={INSTAGRAM_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                @boostyourenglish__
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="home-footer">
                <div className="home-shell">
                    <span>© {new Date().getFullYear()} Boost</span>

                    <div className="footer-links">
                        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                            Instagram
                        </a>
                        <Link to="/login">Acesso do professor</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Home;
