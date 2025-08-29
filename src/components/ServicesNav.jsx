// client/src/components/ServicesNav.jsx

import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const ServicesNav = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const services = [
    {
      title: "Web & App Development",
      subtitle: "Build. Engage. Convert.",
      description: "Your website is your digital storefront—make it unforgettable. We craft responsive, SEO optimized platforms that marry stunning design with seamless functionality. Whether you need an e-commerce powerhouse, a dynamic app or a high-converting landing page, we engineer solutions that turn visitors into loyal customers.",
      imgsrc: "/images/development.png",
    },
    {
      title: "Digital Marketing",
      subtitle: "Amplify Your Reach, Maximize Results",
      description: "Cut through the noise with campaigns that resonate. Our data-driven strategies spanning SEO, social media and content marketing ensure your brand dominates search rankings, sparks engagement and delivers measurable ROI.",
      imgsrc: "/images/digital-marketing.png",
    },
    {
      title: "Design & Development",
      subtitle: "Bring Your Brand to Life with Visual Storytelling",
      description: "From logos that define your identity to animations that captivate your audience, we create visual experiences that elevate your brand. Our team blends artistic flair with technical expertise to deliver designs and motion graphics that resonate, engage, and inspire action.",
      imgsrc: "/images/graphic.png",
    },
    {
      title: "Digital Marketing Outsourcing",
      subtitle: "Scale Smarter, Grow Faster",
      description: "Focus on your core business while we handle the rest. Our end-to-end outsourcing solutions from campaign management to analytics—free your team to innovate while we drive your digital growth with precision and expertise.",
      imgsrc: "/images/development.png",
    }
  ];

  return (
    <div className="b-900 text-white py-30 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="mb-20 text-center"
        >
          <motion.h2 variants={fadeIn} className="text-4xl md:text-6xl font-bold mb-2 leading-tight">
            Where <span className="text-yellow-500">Art</span> Meets <span className="text-yellow-500">Technology</span>
          </motion.h2>

          <motion.p variants={fadeIn} className="text-lg md:text-lg font-medium mb-12">
            Crafting Digital Masterpieces: Where Innovation Fueled by Impact
          </motion.p>

          <motion.h3 variants={fadeIn} className="max-w-3xl px-6 bg-[#e8e4d8] bg-opacity-70 py-0.4 rounded-xl border-l-1 border-r-1 border-yellow-500 mb-8 justify-self-center hover:px-6 transition-all">
            <div className="text-center text-2xl md:text-3xl text-yellow-500 font-semibold mb-8">Transform Your Vision into a Future-Ready Reality</div>

          </motion.h3>

          <motion.p variants={fadeIn} className="text-lg md:text-xl max-w-4xl mx-auto text-gray-300">
            In a world driven by digital evolution, technology isn't just a tool—it's an art form. At Marketist, we blend cutting-edge tech with creative brilliance to design solutions that captivate audiences, drive growth, and redefine industries. From sleek web experiences to data-driven marketing strategies, we turn your ideas into immersive digital realities.
          </motion.p>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="mb-20"
        >
          <motion.h2 variants={fadeIn} className="text-3xl md:text-4xl font-bold mb-12 text-center">
            Elevating Brands via <span className="text-yellow-500">Tech & Creativity</span>
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                whileHover={{ y: -10 }}
                className="bg-cover bg-center bg-gray-800 bg-opacity-50 p-6 rounded-xl border border-gray-700 hover:border-yellow-500 transition-all relative overflow-hidden"
                style={{
                  backgroundImage: `url(${service.imgsrc})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Overlay for better readability */}
                <div className="absolute inset-0"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.75)" }} // Black with 50% opacity
                ></div>
                <div className="relative z-10">
                  {/* <div className="text-yellow-500 text-4xl mb-4">{service.icon}</div> */}
                  <h3 className="text-2xl font-bold mb-2">{service.title}</h3>
                  <h4 className="text-xl text-yellow-500 font-medium mb-4">{service.subtitle}</h4>
                  <p className="text-gray-300">{service.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="mb-20"
        >
          <motion.h2 variants={fadeIn} className="text-3xl md:text-4xl font-bold mb-8 text-center">
            Why <span className="text-yellow-500">Marketist</span>?
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <motion.div variants={fadeIn} className="bg-gray-100 bg-opacity-50 p-6 rounded-xl hover:transform transition-transform hover:scale-101 border-yellow-500 hover:border-l-2 hover:border-r-2">
              <h3 className="text-xl font-bold mb-3 text-yellow-500 hover:text-yellow-500">Tech Meets Artistry</h3>
              <p className="text-gray-700">We don't just code—we create. Every project is a blend of innovation, aesthetics and strategy.</p>
            </motion.div>

            <motion.div variants={fadeIn} className="bg-gray-100 bg-opacity-50 p-6 rounded-xl hover:transform transition-transform hover:scale-101 border-yellow-500 hover:border-l-2 hover:border-r-2">
              <h3 className="text-xl font-bold mb-3 text-yellow-500 hover:text-yellow-500">Tailored Solutions</h3>
              <p className="text-gray-700">No templates, no shortcuts. Your brand deserves a custom-built digital ecosystem.</p>
            </motion.div>

            <motion.div variants={fadeIn} className="bg-gray-100 bg-opacity-50 p-6 rounded-xl hover:transform transition-transform hover:scale-101 border-yellow-500 hover:border-l-2 hover:border-r-2">
              <h3 className="text-xl font-bold mb-3 text-yellow-500 hover:text-yellow-500">Results-Driven</h3>
              <p className="text-gray-700">From boosting sales to skyrocketing engagement, we measure success by your growth.</p>
            </motion.div>
          </div>

          <motion.div variants={fadeIn} className="bg-gray-100 bg-opacity-70 p-8 rounded-xl border-l-4 border-yellow-500">
            <p className="text-xl italic text-center text-yellow-500 font-bold">
              "Marketist: Where every line of code is a stroke of genius, and every strategy is a masterpiece in the making."
            </p>
          </motion.div>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center"
        >
          <motion.h2 variants={fadeIn} className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Redefine Your <span className="text-yellow-500">Digital Presence</span>?
          </motion.h2>

          <motion.p variants={fadeIn} className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Let's collaborate to build technology that inspires and strategies that deliver. Your journey to digital excellence starts here.
          </motion.p>

          <motion.div variants={fadeIn}>
            <Link to='/Get_A_Quote' state={{ formTitle: "Start Your Journey" }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-4 rounded-full text-lg font-medium"
              >
                Start Your Journey
              </motion.button>
            </Link>

          </motion.div>
        </motion.section>
      </div>
    </div>
  );
};

export default ServicesNav;