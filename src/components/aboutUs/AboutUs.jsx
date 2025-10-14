
import { motion } from "framer-motion";
// import { Link, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const DigitalAgency = () => {
  const navigate = useNavigate()
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="font-sans text-yellow-500 min-h-screen">
      <motion.section
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.2 } }
        }}
        className="container mx-auto px-6 py-15 md:py-10 text-center"
      >
        <motion.h1
          variants={fadeIn}
          className="text-4xl md:text-6xl font-bold mt-15 mb-8 leading-tight"
        >
          Born from <span className="text-yellow-600">Vision</span><br />
          Built for <span className="text-yellow-600">Tomorrow</span>
        </motion.h1>

        <motion.p
          variants={fadeIn}
          className="text-lg md:text-xl max-w-3xl mx-auto mb-10 text-yellow-500"
        >
          We bridge the gap between cutting-edge technology & human-centric digital experiences.
        </motion.p>

        <motion.div variants={fadeIn}
          className="my-12"
        >
          <Link to='/Get_A_Quote' state={{ formTitle: "Start Your Journey" }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-full text-sm font-medium mr-4 transition-all duration-300 ease-out"
            >
              Start Your Journey
            </motion.button>
          </Link>

          <Link to='/portfolio'>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border border-white hover:border-yellow-600 hover:text-yellow-600 text-white px-8 py-3 rounded-full text-sm font-medium transition-all duration-400 linear"
            >
              Learn More
            </motion.button>
          </Link>
        </motion.div>
      </motion.section>

      {/* About Section */}
      <section id="about" className="container mx-auto px-6 py-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.2 } }
          }}
          className="max-w-5xl mx-auto"
        >
          <motion.h2 variants={fadeIn} className="text-3xl md:text-4xl font-bold mb-6">
            Our Vision & Ambition
          </motion.h2>

          <motion.p variants={fadeIn} className="text-lg text-yellow-500 mb-8">
            At our Digital Agency, we aspire to lead not follow. As your trusted ally in navigating today's fast-evolving digital landscape, from AI-powered analytics to seamless e-commerce solutions, we combine innovation with practical expertise to drive growth for businesses of all sizes.
          </motion.p>

          <motion.div variants={fadeIn} className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-[#e8e4d7] p-4 rounded-xl">
              <div className="border-2 border-yellow-500 p-4 rounded-xl hover:border-yellow-600 transition-all duration-150 ease-in">
                <h3 className="text-xl font-bold mb-3">Empower</h3>
                <p className="text-yellow-500 font-bold">
                  To empower businesses through innovative digital tools.
                </p>
              </div></div>

            <div className="bg-[#e8e4d7] bg-opacity-50 p-4 rounded-xl">
              <div className="border-2 border-yellow-500 p-4 rounded-xl hover:border-yellow-600 transition-all duration-150 ease-in">
                <h3 className="text-xl font-bold mb-3">Scale</h3>
                <p className="text-yellow-500 font-bold">
                  To scale alongside you as you grow.
                </p>
              </div></div>

            <div className="bg-[#e8e4d7] bg-opacity-50 p-4 rounded-xl">
              <div className="border-2 border-yellow-500 p-1 rounded-xl hover:border-yellow-600 transition-all duration-150 ease-in">
                <h3 className="text-xl font-bold mb-3">Innovate</h3>
                <p className="text-yellow-500 font-bold">
                  To stay ahead of trends by continuously exploring cutting-edge tools.
                </p>
              </div>
            </div>

          </motion.div>
          <motion.div variants={fadeIn} className="bg-[#e8e4d7] bg-opacity-70 p-6 rounded-xl border-l-4 border-yellow-500 mt-8 mb-6">
            <p className="text-xl italic mb-2">
              "We're not just keeping up with trends—we're setting them."
            </p>
          </motion.div>
        </motion.div>
      </section>

      <section id="services" className="container mx-auto px-6 py-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.2 } }
          }}
        >
          <motion.h2 variants={fadeIn} className="text-3xl md:text-4xl font-bold mb-2 text-center transition-all duration-300 linear">
            Core Services
          </motion.h2>
          <motion.p variants={fadeIn} className="text-lg text-yellow-500 mb-12 text-center max-w-3xl mx-auto">
            Designed for Modern Success
          </motion.p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              variants={fadeIn}
              whileHover={{ y: -10 }}
              className="bg-[#e8e4d7] bg-opacity-50 p-6 rounded-xl"
            >
              <h3 className="text-xl text-yellow-500 font-bold mb-3">Web & App Development</h3>
              <p className="text-yellow-500 font-bold">
                Modern tech stacks (React, Flutter), rapid prototyping, and user-first design.
              </p>
            </motion.div>

            <motion.div
              variants={fadeIn}
              whileHover={{ y: -10 }}
              className="bg-[#e8e4d7] bg-opacity-50 p-6 rounded-xl"
            >
              <h3 className="text-xl font-bold text-yellow-500 mb-3">Digital Marketing</h3>
              <p className="text-yellow-500 font-bold">
                Data-driven strategies meet creativity with AI-powered analytics.
              </p>
            </motion.div>

            <motion.div
              variants={fadeIn}
              whileHover={{ y: -10 }}
              className="bg-[#e8e4d7] bg-opacity-50 p-6 rounded-xl"
            >
              <h3 className="text-xl text-yellow-500 font-bold mb-3">Digital Marketing Outsourcing</h3>
              <p className="text-yellow-500 font-bold">
                Cost-effective, flexible solutions for startups and SMEs.
              </p>
            </motion.div>

            <motion.div
              variants={fadeIn}
              whileHover={{ y: -10 }}
              className="bg-[#e8e4d7] bg-opacity-50 p-6 rounded-xl"
            >
              <h3 className="text-xl font-bold text-yellow-500 mb-3">Graphic Design</h3>
              <p className="text-yellow-500 font-bold">
                Creativity meets storytelling with strategic visuals that elevate your brand.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <section className="container mx-auto px-6 py-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.2 } }
          }}
          className="max-w-5xl mx-auto"
        >
          <motion.h2 variants={fadeIn} className="text-3xl md:text-4xl font-bold mb-6 text-center">
            Why Choose Us?
          </motion.h2>
          <motion.p variants={fadeIn} className="text-lg text-yellow-500 mb-12 text-center">
            Modern Solutions, Proven Expertise
          </motion.p>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <motion.div variants={fadeIn} className="bg-[#e8e4d7] bg-opacity-50 p-6 rounded-xl hover:transform hover:scale-101 border-blue-500 hover:border-l-2 hover:border-r-2 transition-all duration-300 ease-in-out">
              <h3 className="text-xl font-bold mb-3">Rapid Response</h3>
              <p className="text-yellow-500 font-bold">
                We prioritize speed without compromise. From iterative development to real-time collaboration.
              </p>
            </motion.div>
            <motion.div variants={fadeIn} className="bg-[#e8e4d7] bg-opacity-50 p-6 rounded-xl hover:transform hover:scale-101 border-blue-500 hover:border-l-2 hover:border-r-2 transition-all duration-300 ease-in-out">
              <h3 className="text-xl font-bold mb-3">Transparent Partnerships</h3>
              <p className="text-yellow-500 font-bold">
                No surprises—ever. Clear pricing, collaborative workflows, and open communication.
              </p>
            </motion.div>
            <motion.div variants={fadeIn} className="bg-[#e8e4d7] bg-opacity-50 p-6 rounded-xl hover:transform hover:scale-101 border-blue-500 hover:border-l-2 hover:border-r-2 transition-all duration-300 ease-in-out">
              <h3 className="text-xl font-bold mb-3">Adaptive Technology</h3>
              <p className="text-yellow-500 font-bold">
                Cutting-edge tools tailored to your goals, ensuring secure, scalable solutions.
              </p>
            </motion.div>
          </div>

          <motion.div variants={fadeIn} className="bg-[#e8e4d7] bg-opacity-70 p-6 rounded-xl border-l-4 border-yellow-500 mb-8">
            <p className="text-xl italic mb-4">
              "We're not just a team, we're your dedicated growth partners, focused on your success."
            </p>
          </motion.div>
        </motion.div>
      </section>

      <section className="container mx-auto px-6 py-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.2 } }
          }}
          className="max-w-5xl mx-auto"
        >
          {/*Collaborative Success Class */}
          <motion.div variants={fadeIn} className="mb-20 bg-[#e8e4d7] bg-opacity-70 p-6 rounded-xl border-l-4 border-r-4 border-yellow-500 hover:border-yellow-300 transition-all duration-300 ease">
            <motion.h2 variants={fadeIn} className="text-3xl md:text-4xl font-bold mb-6">
              Collaborative Success
            </motion.h2>
            <motion.p variants={fadeIn} className="text-lg text-yellow-500 mb-6">
              Trust is earned through results. Our team combines expertise from diverse industries with a relentless focus on your goals:
            </motion.p>
            <motion.ul variants={fadeIn} className="list-disc pl-6 space-y-3 text-yellow-500">
              <li><span className="font-semibold text-yellow-600">Technical Excellence:</span> Led by developers and strategists with experience scaling products for global brands and high-growth ventures.</li>
              <li><span className="font-semibold text-yellow-600">Marketing Impact:</span> Data-driven campaigns designed to maximize visibility and conversions, refined through years of hands-on expertise.</li>
              <li><span className="font-semibold text-yellow-600">Creative Innovation:</span> Award-winning design principles that blend aesthetics with user-centric functionality.</li>
            </motion.ul>
          </motion.div>

          {/* Momentum & Client Wins section */}
          <motion.div
            variants={fadeIn}
            className="mt-15 mb-10"
          >
            {/* Momentum & Cient Wins Section */}
            <div className="bg-[#e8e4d7] bg-opacity-50 text-center rounded-full mb-2 border-4 border-gray-800">
              <h3 className="text-3xl font-bold mb-3 text-yellow-500">Momentum & Client Wins</h3>
              <p className="text-yellow-500 font-bold mb-2">
                While agile, we're laser focused on delivering value
              </p>
            </div>

            {/* Cards Grid */}
            <div className="grid md:grid-cols-3 gap-2">
              {/* Card 1 */}
              <motion.div
                className="bg-[#e8e4d7] text-center bg-opacity-50 p-6 rounded-full border-4 border-[#e8e4d7] hover:bg-[#e8e4d7] transition-all duration-500 easeOut"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <h3 className="text-xl text-yellow-600 font-bold mb-3">Performance-Driven Results</h3>
                <p className="text-yellow-500 font-bold">
                  Clients see measurable growth through tailored strategies.
                </p>
              </motion.div>

              {/* Card 2 */}
              <motion.div
                className="bg-[#e8e4d7] text-center bg-opacity-50 p-6 rounded-full border-4 border-[#e8e4d7] hover:bg-[#e8e4d7] transition-all duration-500 easeOut"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <h3 className="text-xl font-bold text-yellow-600 mb-3">Rapid Deployment</h3>
                <p className="text-yellow-500 font-bold">
                  Launched scalable solutions in record timelines for businesses across industries.
                </p>
              </motion.div>

              {/* Card 3 */}
              <motion.div
                className="bg-[#e8e4d7] text-center bg-opacity-50 p-6 rounded-full border-4 border-[#e8e4d7] hover:bg-[#e8e4d7] transition-all duration-500 easeOut"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <h3 className="text-xl font-bold text-yellow-600 mb-3">Growth Partnerships</h3>
                <p className="text-yellow-500 font-bold">
                  Helped early-stage companies scale revenue and streamline operations.
                </p>
              </motion.div>
            </div>

          </motion.div>

          <motion.div variants={fadeIn}
            className="bg-[#e8e4d7] bg-opacity-70 p-2 mb-25 rounded-xl border-l-4 border-yellow-500">
            <h5 className="text-1xl font-bold mb-1">Security First</h5>
            <p className="text-base text-gray-400 border-1-4 border-yellow-500">
              Your trust is non-negotiable. We prioritize secure infrastructure and compliance standards, ensuring your data and workflows are protected at every stage.
            </p>
          </motion.div>


          <motion.div variants={fadeIn} className="mb-20 border-t-4 border-b-4 rounded-xl p-10 border-yellow-500 bg-[#e8e4d7] bg-opacity-70">
            <motion.h2 variants={fadeIn} className="text-3xl md:text-4xl font-bold mb-6">
              Client Centric Approach
            </motion.h2>
            <motion.p variants={fadeIn} className="text-lg text-yellow-500 mb-6">
              You're not just a client—you're a co-creator in our journey. Here's how we work together:
            </motion.p>
            <motion.ul variants={fadeIn}
              className="list-disc pl-6 space-y-3 text-yellow-500">

              <li className="hover:text-yellow-700"><span className="font-semibold hover:text-yellow-600">Free Strategy Session:</span> Start with a no-obligation audit to align with your goals.</li>
              <li className="hover:text-yellow-700"><span className="font-semibold hover:text-yellow-600">Tailored Onboarding:</span> Every partnership begins with a personalized roadmap.</li>
              <li className="hover:text-yellow-700"><span className="font-semibold hover:text-yellow-600">Collaborative Workflow:</span> Remote-first operations ensure smooth communication, whether you're in Jeddah, Berlin, New York, Karachi, Mumbai, Shanghai or Sydney.</li>
            </motion.ul>
          </motion.div>

          <motion.div variants={fadeIn} className="mb-20">
            <motion.h2 variants={fadeIn} className="text-3xl md:text-4xl font-bold mb-6">
              Global Mindset, Local Expertise
            </motion.h2>
            <motion.p variants={fadeIn} className="text-lg text-yellow-500">
              With multilingual capabilities and cultural adaptability, we serve clients worldwide—from Silicon Valley to Singapore. Our remote-first model ensures seamless collaboration across time zones, so distance never limits possibility.
            </motion.p>
          </motion.div>

          {/* Innovation Build Section */}
          <motion.div
            variants={fadeIn}
            className="mt-8"
          >
            {/* Momentum & Cient Wins Section */}
            <div className="bg-yellow-00 bg-opacity-50 p-6 rounded-xl mb-8">
              <h3 className="text-3xl font-bold mb-3 text-[#e8e4d7]">Innovation Built for Your Needs</h3>
              <p className="text-[#e8e4d7] font-bold mb-4">
                We believe progress thrives on curiosity. That's why we continuously explore emerging technologies and methodologies to refine our toolkit, ensuring your solutions stay ahead of the curve. Our focus:
              </p>


              {/* Cards Grid */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Card 1 */}
                <motion.div
                  className="bg-[#e8e4d7] bg-opacity-50 p-6 rounded-xl"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ ease: "easeInOut", duration: 0.4 }}
                >
                  <h3 className="text-xl font-bold mb-3">Adapting Emerging Trends</h3>
                  <p className="text-yellow-500 font-bold">
                    Experimenting with new frameworks and tools to solve real-world challenges.
                  </p>
                </motion.div>

                {/* Card 2 */}
                <motion.div
                  className="bg-[#e8e4d7] bg-opacity-50 p-6 rounded-xl"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ ease: "easeInOut", duration: 0.4 }}
                >
                  <h3 className="text-xl font-bold mb-3">Future-Ready Foundations</h3>
                  <p className="text-yellow-500 font-bold">
                    Building scalable systems designed to evolve with technological advancements.
                  </p>
                </motion.div>

                {/* Card 3 */}
                <motion.div
                  className="bg-[#e8e4d7] bg-opacity-50 p-6 rounded-xl"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ ease: "easeInOut", duration: 0.4 }}
                >
                  <h3 className="text-xl font-bold mb-3">Client-Centric Prototyping</h3>
                  <p className="text-yellow-500 font-bold">
                    Developing custom solutions through iterative testing and feedback loops.
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
          <motion.div variants={fadeIn} className="bg-[#e8e4d7] bg-opacity-70 p-6 rounded-xl border-l-4 border-yellow-500 mb-4">
            <p className="text-xl italic">
              "We don't just adopt innovation—we help shape it through curiosity and collaboration."
            </p>
          </motion.div>

        </motion.div>
      </section>
      <section id="contact" className="container mx-auto px-6 py-5">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.2 } }
          }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.h2 variants={fadeIn} className="text-3xl md:text-4xl font-bold mb-6">
            Join Us on This Journey
          </motion.h2>
          <motion.p variants={fadeIn} className="text-lg text-yellow-500 mb-10">
            Ready to redefine your digital presence? Take the first step risk-free.
          </motion.p>

          <motion.div variants={fadeIn}>
            <Link to='/Get_A_Quote' state={{ formTitle: "Leave A Message" }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate('/Get_A_Quote')}
                whileTap={{ scale: 0.95 }}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-2 mb-20 rounded-full text-lg font-medium transition-all duration-300 ease-in-out"
              >
                Leave a Message
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default DigitalAgency;
