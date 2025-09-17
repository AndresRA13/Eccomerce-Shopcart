import Navbar from "../components/Navbar";
import { useState } from "react";
import "../styles/Blog.css";
import { FaRibbon, FaBirthdayCake, FaGift, FaGraduationCap, FaHeart, FaChild, FaStar, FaRegCalendarAlt, FaPalette } from "react-icons/fa";
import { MdTrendingUp, MdSchool, MdCelebration, MdArrowForward } from "react-icons/md";

export default function Blog() {
  const [selectedArticle, setSelectedArticle] = useState(null);

  const blogArticles = [
    {
      id: 1,
      title: "Moños de satén: Elegancia en cada detalle",
      summary: "Descubre por qué los moños de satén son perfectos para ocasiones especiales.",
      icon: <FaRibbon size={80} color="#ff6b6b" />,
      content: (
        <>
          <p>Los moños de satén son una de las opciones más elegantes para cualquier ocasión especial. Su brillo característico y textura suave los convierten en el accesorio perfecto para eventos formales como bodas, graduaciones o fiestas de gala.</p>
          <p>En nuestra colección encontrarás moños de satén en una amplia gama de colores, desde los clásicos negro y blanco hasta tonos pastel y vibrantes que añadirán un toque de color a cualquier conjunto.</p>
          
          <div className="color-palette">
            <div className="color-sample" style={{backgroundColor: "#000000"}}>Negro</div>
            <div className="color-sample" style={{backgroundColor: "#ffffff", color: "#333"}}>Blanco</div>
            <div className="color-sample" style={{backgroundColor: "#ff6b6b"}}>Coral</div>
            <div className="color-sample" style={{backgroundColor: "#48dbfb"}}>Azul cielo</div>
            <div className="color-sample" style={{backgroundColor: "#1dd1a1"}}>Menta</div>
          </div>
          
          <h3>Cómo cuidar tus moños de satén</h3>
          <ul>
            <li>Guárdalos en un lugar seco y protegido del polvo</li>
            <li>Evita el contacto con perfumes o productos químicos</li>
            <li>Si necesitas plancharlos, hazlo a baja temperatura</li>
            <li>Para manchas leves, limpia con un paño húmedo y jabón neutro</li>
            <li>Deja secar al aire libre, evitando la exposición directa al sol</li>
          </ul>
          
          <p>¿Sabías que el satén fue originalmente fabricado con seda pura? Hoy en día, nuestros moños de satén combinan fibras naturales y sintéticas para ofrecer durabilidad sin sacrificar la elegancia.</p>
          
          <h3>Ocasiones perfectas para moños de satén</h3>
          <div className="occasion-icons">
            <div className="occasion-item">
              <FaGraduationCap size={30} />
              <span>Graduaciones</span>
            </div>
            <div className="occasion-item">
              <MdCelebration size={30} />
              <span>Bodas</span>
            </div>
            <div className="occasion-item">
              <FaBirthdayCake size={30} />
              <span>Cumpleaños</span>
            </div>
          </div>
        </>
      ),
    },
    {
      id: 2,
      title: "Moños de organza: Ligereza y volumen",
      summary: "La organza es perfecta para crear moños voluminosos y llamativos.",
      icon: <FaRibbon size={80} color="#48dbfb" />,
      content: (
        <>
          <p>La organza es un tejido ligero y transparente que permite crear moños con mucho volumen y un aspecto etéreo. Es ideal para decoraciones de eventos, regalos especiales o como complemento en peinados infantiles.</p>
          <p>Nuestros moños de organza están disponibles en colores pastel, neón y multicolor, perfectos para añadir un toque de fantasía a cualquier ocasión.</p>
          
          <div className="color-palette">
            <div className="color-sample" style={{backgroundColor: "#ff9ff3"}}>Rosa pastel</div>
            <div className="color-sample" style={{backgroundColor: "#feca57"}}>Amarillo</div>
            <div className="color-sample" style={{backgroundColor: "#54a0ff"}}>Azul</div>
            <div className="color-sample" style={{backgroundColor: "#ff6b6b"}}>Coral</div>
            <div className="color-sample" style={{backgroundColor: "#1dd1a1"}}>Menta</div>
          </div>
          
          <h3>Ventajas de los moños de organza</h3>
          <ul>
            <li>Mantienen su forma y volumen durante más tiempo</li>
            <li>Son ligeros y no añaden peso al cabello</li>
            <li>Permiten crear diseños más elaborados y fantasiosos</li>
            <li>Disponibles en acabados brillantes o mate</li>
            <li>Ideales para combinar con otros materiales</li>
          </ul>
          
          <p>La organza es uno de los materiales más versátiles para la creación de moños, permitiendo desde diseños delicados hasta extravagantes creaciones multicolor.</p>
          
          <h3>Usos populares de moños de organza</h3>
          <div className="occasion-icons">
            <div className="occasion-item">
              <FaGift size={30} />
              <span>Decoración de regalos</span>
            </div>
            <div className="occasion-item">
              <FaChild size={30} />
              <span>Accesorios infantiles</span>
            </div>
            <div className="occasion-item">
              <FaHeart size={30} />
              <span>Decoración de bodas</span>
            </div>
          </div>
        </>
      ),
    },
    {
      id: 3,
      title: "Moños de terciopelo: Lujo y calidez",
      summary: "El terciopelo aporta textura y sofisticación a nuestros moños de temporada.",
      icon: <FaRibbon size={80} color="#8e44ad" />,
      content: (
        <>
          <p>Los moños de terciopelo son sinónimo de lujo y calidez, perfectos para la temporada otoño-invierno. Su textura suave y aspecto aterciopelado los convierte en un accesorio sofisticado para cualquier ocasión.</p>
          <p>Nuestra colección de moños de terciopelo incluye tonos joya como burdeos, esmeralda y zafiro, así como clásicos como negro y azul marino que combinan con cualquier atuendo.</p>
          
          <div className="color-palette">
            <div className="color-sample" style={{backgroundColor: "#8e44ad"}}>Púrpura</div>
            <div className="color-sample" style={{backgroundColor: "#c0392b"}}>Burdeos</div>
            <div className="color-sample" style={{backgroundColor: "#27ae60"}}>Esmeralda</div>
            <div className="color-sample" style={{backgroundColor: "#2c3e50"}}>Azul marino</div>
            <div className="color-sample" style={{backgroundColor: "#000000"}}>Negro</div>
          </div>
          
          <h3>Ocasiones ideales para moños de terciopelo</h3>
          <ul>
            <li>Celebraciones navideñas y de fin de año</li>
            <li>Eventos formales durante el invierno</li>
            <li>Como complemento para peinados de fiesta</li>
            <li>Ceremonias de premiación y galas</li>
            <li>Eventos de temporada otoño-invierno</li>
          </ul>
          
          <p>El terciopelo es un material atemporal que nunca pasa de moda, por lo que un moño de terciopelo es una inversión que podrás utilizar durante muchas temporadas.</p>
          
          <h3>Combinaciones perfectas</h3>
          <p>Los moños de terciopelo combinan perfectamente con:</p>
          <div className="occasion-icons">
            <div className="occasion-item">
              <FaStar size={30} />
              <span>Vestidos de noche</span>
            </div>
            <div className="occasion-item">
              <FaRegCalendarAlt size={30} />
              <span>Eventos de gala</span>
            </div>
            <div className="occasion-item">
              <FaPalette size={30} />
              <span>Atuendos monocromáticos</span>
            </div>
          </div>
        </>
      ),
    },
    {
      id: 4,
      title: "Moños para ocasiones especiales: Guía completa",
      summary: "Aprende a elegir el moño perfecto según la ocasión y tu estilo personal.",
      icon: <MdCelebration size={80} color="#ff6b6b" />,
      content: (
        <>
          <p>Elegir el moño adecuado para cada ocasión puede marcar la diferencia en tu look. En esta guía te ofrecemos consejos para seleccionar el material, color y tamaño perfectos según el evento y tu estilo personal.</p>
          
          <h3>Bodas y eventos formales</h3>
          <p>Para bodas y eventos formales, recomendamos moños de satén o encaje en tonos que complementen tu atuendo. Los moños pequeños o medianos son más elegantes y sofisticados.</p>
          <div className="recommendation-box">
            <h4>Recomendaciones para eventos formales:</h4>
            <ul>
              <li>Moños de satén en tonos metálicos (plata, oro, champagne)</li>
              <li>Moños de encaje que combinen con el vestido</li>
              <li>Moños con detalles de pedrería para ocasiones muy especiales</li>
              <li>Tamaños medianos que no compitan con el resto del atuendo</li>
            </ul>
          </div>
          
          <h3>Eventos casuales</h3>
          <p>Para el día a día o eventos casuales, los moños de algodón o cintas de grosgrain en colores vivos son perfectos. Puedes optar por diseños más grandes y llamativos.</p>
          <div className="recommendation-box">
            <h4>Recomendaciones para eventos casuales:</h4>
            <ul>
              <li>Moños de algodón estampado (lunares, rayas, flores)</li>
              <li>Moños de grosgrain en colores vibrantes</li>
              <li>Moños con temáticas divertidas según la ocasión</li>
              <li>Tamaños más grandes y llamativos</li>
            </ul>
          </div>
          
          <h3>Eventos infantiles</h3>
          <p>Para las más pequeñas, los moños de organza multicolor o con estampados divertidos son ideales. También puedes considerar moños con adornos como lentejuelas o pequeños apliques.</p>
          <div className="recommendation-box">
            <h4>Recomendaciones para niñas:</h4>
            <ul>
              <li>Moños de organza en colores pastel o multicolor</li>
              <li>Moños con personajes infantiles o temáticas divertidas</li>
              <li>Moños con apliques de flores, estrellas o corazones</li>
              <li>Sets de moños pequeños en diferentes colores</li>
            </ul>
          </div>
          
          <p>Recuerda que lo más importante es que el moño refleje tu personalidad y te haga sentir cómoda y segura.</p>
        </>
      ),
    },
    {
      id: 5,
      title: "Tendencias en moños para esta temporada",
      summary: "Descubre los colores, materiales y estilos que están marcando tendencia.",
      icon: <MdTrendingUp size={80} color="#ff6b6b" />,
      content: (
        <>
          <p>Las tendencias en moños cambian cada temporada, y estar al día te ayudará a mantener tu look fresco y actual. Este año, estamos viendo un regreso a los materiales naturales y sostenibles.</p>
          
          <h3>Colores tendencia</h3>
          <p>Los tonos tierra como terracota, ocre y marrón están dominando las colecciones de esta temporada, junto con el siempre elegante verde oliva y el azul índigo.</p>
          <div className="color-palette">
            <div className="color-sample" style={{backgroundColor: "#d35400"}}>Terracota</div>
            <div className="color-sample" style={{backgroundColor: "#f39c12"}}>Ocre</div>
            <div className="color-sample" style={{backgroundColor: "#795548"}}>Marrón</div>
            <div className="color-sample" style={{backgroundColor: "#556b2f"}}>Verde oliva</div>
            <div className="color-sample" style={{backgroundColor: "#3498db"}}>Azul índigo</div>
          </div>
          
          <h3>Materiales innovadores</h3>
          <p>Los moños fabricados con materiales reciclados o sostenibles están ganando popularidad. También vemos un aumento en el uso de materiales con textura como el lino y el cáñamo.</p>
          <div className="material-gallery">
            <div className="material-item">
              <div className="material-icon" style={{backgroundColor: "#dfe6e9"}}></div>
              <span>Lino</span>
            </div>
            <div className="material-item">
              <div className="material-icon" style={{backgroundColor: "#c7ecee"}}></div>
              <span>Algodón orgánico</span>
            </div>
            <div className="material-item">
              <div className="material-icon" style={{backgroundColor: "#fab1a0"}}></div>
              <span>Cáñamo</span>
            </div>
            <div className="material-item">
              <div className="material-icon" style={{backgroundColor: "#ffeaa7"}}></div>
              <span>Materiales reciclados</span>
            </div>
          </div>
          
          <h3>Estilos destacados</h3>
          <p>Los moños oversized continúan siendo tendencia, especialmente para eventos casuales. Para ocasiones formales, los moños minimalistas con detalles metálicos están captando todas las miradas.</p>
          <p>Nuestra nueva colección incorpora todas estas tendencias, permitiéndote estar a la vanguardia de la moda en accesorios.</p>
        </>
      ),
    },
    {
      id: 6,
      title: "Moños para eventos escolares y académicos",
      summary: "Descubre los mejores moños para uniformes y eventos educativos.",
      icon: <MdSchool size={80} color="#3498db" />,
      content: (
        <>
          <p>Los moños son un complemento clásico para uniformes escolares y eventos académicos. En este artículo te presentamos opciones elegantes y prácticas para el entorno educativo.</p>
          
          <h3>Moños para uniformes escolares</h3>
          <p>Los moños para uniformes escolares deben ser prácticos, duraderos y fáciles de colocar. Recomendamos opciones en colores clásicos como azul marino, burdeos, verde oscuro o negro, que combinan con la mayoría de los uniformes.</p>
          
          <div className="color-palette">
            <div className="color-sample" style={{backgroundColor: "#2c3e50"}}>Azul marino</div>
            <div className="color-sample" style={{backgroundColor: "#c0392b"}}>Burdeos</div>
            <div className="color-sample" style={{backgroundColor: "#27ae60"}}>Verde oscuro</div>
            <div className="color-sample" style={{backgroundColor: "#000000"}}>Negro</div>
            <div className="color-sample" style={{backgroundColor: "#7f8c8d"}}>Gris</div>
          </div>
          
          <h3>Características ideales</h3>
          <ul>
            <li>Fabricados con materiales resistentes como grosgrain o poliéster</li>
            <li>Con clip o elástico para fácil colocación</li>
            <li>Diseños clásicos que cumplan con las normas escolares</li>
            <li>Resistentes al lavado frecuente</li>
            <li>Disponibles en packs de varios colores para alternar</li>
          </ul>
          
          <h3>Para eventos académicos especiales</h3>
          <p>Para graduaciones, premiaciones o eventos académicos especiales, recomendamos moños más elaborados que mantengan la elegancia y formalidad:</p>
          <div className="recommendation-box">
            <h4>Recomendaciones para eventos académicos:</h4>
            <ul>
              <li>Moños de satén en colores institucionales</li>
              <li>Moños con pequeños detalles metálicos</li>
              <li>Moños con bordes en colores contrastantes</li>
              <li>Sets coordinados para grupos o equipos</li>
            </ul>
          </div>
          
          <p>Nuestra colección escolar incluye opciones para todas las edades, desde preescolar hasta universidad, siempre manteniendo la calidad y durabilidad que caracteriza a nuestros productos.</p>
        </>
      ),
    },
    {
      id: 7,
      title: "Cómo hacer tus propios moños: Tutorial paso a paso",
      summary: "Aprende a crear moños personalizados con materiales que tienes en casa.",
      icon: <FaGift size={80} color="#2ecc71" />,
      content: (
        <>
          <p>Crear tus propios moños es una actividad divertida y creativa que te permite personalizar tus accesorios. En este tutorial te enseñamos cómo hacer moños básicos con materiales sencillos.</p>
          
          <h3>Materiales necesarios</h3>
          <ul>
            <li>Cinta del material de tu preferencia (satén, grosgrain, organza)</li>
            <li>Tijeras</li>
            <li>Aguja e hilo o pistola de silicona</li>
            <li>Clip para el cabello, diadema o elástico</li>
            <li>Encendedor (opcional, para sellar bordes)</li>
            <li>Adornos adicionales (opcional: pedrería, botones, apliques)</li>
          </ul>
          
          <h3>Paso a paso: Moño básico</h3>
          <ol>
            <li><strong>Corta la cinta:</strong> Para un moño mediano, corta aproximadamente 30 cm de cinta.</li>
            <li><strong>Dobla en forma de lazo:</strong> Forma un lazo con la cinta, dejando los extremos iguales.</li>
            <li><strong>Asegura el centro:</strong> Pellizca el centro del lazo y asegúralo con hilo, creando la forma característica del moño.</li>
            <li><strong>Cubre el centro:</strong> Corta un pequeño trozo de cinta y envuélvelo alrededor del centro para darle un acabado profesional.</li>
            <li><strong>Añade el soporte:</strong> Cose o pega el clip, diadema o elástico en la parte posterior del moño.</li>
            <li><strong>Decora (opcional):</strong> Añade pedrería, lentejuelas o cualquier adorno que desees para personalizar tu creación.</li>
          </ol>
          
          <h3>Variaciones creativas</h3>
          <p>Una vez que domines la técnica básica, puedes experimentar con estas variaciones:</p>
          <ul>
            <li><strong>Moño doble:</strong> Superpón dos lazos de diferentes tamaños o colores.</li>
            <li><strong>Moño en capas:</strong> Utiliza varias capas de cinta para crear volumen.</li>
            <li><strong>Moño con cola:</strong> Deja extremos largos para crear un efecto cascada.</li>
            <li><strong>Moño con centro decorativo:</strong> Utiliza un botón, perla o aplique como centro del moño.</li>
          </ul>
          
          <p>Recuerda que la práctica hace al maestro. ¡No te desanimes si tus primeros intentos no quedan perfectos! Con el tiempo mejorarás tu técnica y podrás crear diseños cada vez más elaborados.</p>
        </>
      ),
    },
  ];

  return (
    <>
      <Navbar />
      <div className="blog-container">
        <div className="blog-header">
          <h1>Blog de Lazos para el Cabello</h1>
          <p>Consejos, tendencias y tutoriales para lucir lazos perfectos a cualquier edad</p>
        </div>

        {selectedArticle ? (
          <div className="article-detail">
            <button className="back-button" onClick={() => setSelectedArticle(null)}>
              ← Volver
            </button>
            <h2>{blogArticles.find(article => article.id === selectedArticle).title}</h2>
            <div className="article-icon-large">
              {blogArticles.find(article => article.id === selectedArticle).icon}
            </div>
            <div className="article-content">
              {blogArticles.find(article => article.id === selectedArticle).content}
            </div>
          </div>
        ) : (
          <div className="articles-grid">
            {blogArticles.map((article) => (
              <div key={article.id} className="article-card">
                <div className="article-icon">{article.icon}</div>
                <h3>{article.title}</h3>
                <p>{article.summary}</p>
                
                <div className="content-preview">
                  {article.title.includes("Satén") && (
                    <>
                      <strong>Colores populares:</strong> Rosa pastel, Azul cielo, Blanco perla
                    </>
                  )}
                  {article.title.includes("Organza") && (
                    <>
                      <strong>Ideal para:</strong> Eventos formales, Bodas, Ceremonias
                    </>
                  )}
                  {article.title.includes("Terciopelo") && (
                    <>
                      <strong>Temporada:</strong> Otoño-Invierno, Eventos nocturnos
                    </>
                  )}
                  {article.title.includes("Ocasiones") && (
                    <>
                      <strong>Eventos:</strong> Cumpleaños, Graduaciones, Fiestas temáticas
                    </>
                  )}
                  {article.title.includes("Tendencias") && (
                    <>
                      <strong>Destacados:</strong> Lazos XL, Diseños geométricos, Tonos metálicos
                    </>
                  )}
                  {article.title.includes("Escolares") && (
                    <>
                      <strong>Estilos:</strong> Clásicos, Uniformes, Colores institucionales
                    </>
                  )}
                  {article.title.includes("Tutorial") && (
                    <>
                      <strong>Dificultad:</strong> Media, 20 minutos aprox., Materiales básicos
                    </>
                  )}
                </div>
                
                <button className="read-more" onClick={() => setSelectedArticle(article.id)}>
                  Ver artículo completo <MdArrowForward style={{ marginLeft: '5px' }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
