//client/src/components/contact/careers.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { logNotification } from '../../utils/Notifications';

const CareersPage = () => {
  const [openAccordion, setOpenAccordion] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    customPosition: '',
    salaryExpectations: '',
    currentlyEmployed: '',
    portfolioLink: '',
    resume: null,
    message: '',
  });
  const [resumeDetails, setResumeDetails] = useState({
    name: '',
    type: '',
    size: 0,
    base64: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isPositionDropdownOpen, setIsPositionDropdownOpen] = useState(false);

  const positionOptions = [
    'Frontend Developer',
    'Backend Developer',
    'App Developer',
    'Game Developer',
    'Functional Consultant',
    'Project Manager',
    'UI/UX Designer',
    'Graphic Designer',
    'Video Designer',
    'Content Creator',
    'Digital Marketer -Social Media',
    'Digital Marketer - Ads Manager',
    'SEO Specialist',
    'Cyber Security Specialist',
    'Data Analyst',
    'International Sales Executive',
    'Business Development Executive',
    'Interns',
    'Others'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      customPosition: name === 'position' && value !== 'Others' ? '' : prev.customPosition,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData({
      ...formData,
      resume: file,
    });

    const reader = new FileReader();
    reader.onload = (event) => {
      setResumeDetails({
        name: file.name,
        type: file.type,
        size: file.size,
        base64: event.target.result,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      if (resumeDetails.base64 && resumeDetails.size > 750000) {
        setSubmitMessage('Resume file is too large. Please upload a file smaller than 750KB.');
        setIsSubmitting(false);
        return;
      }

      const positionToSave = formData.position === 'Others' ? formData.customPosition : formData.position;

      const docRef = await addDoc(collection(db, 'applications'), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        position: positionToSave,
                isRead: false,

        
        salaryExpectations: formData.salaryExpectations,
        currentlyEmployed: formData.currentlyEmployed,
        portfolioLink: formData.portfolioLink,
        resume: {
          name: resumeDetails.name,
          type: resumeDetails.type,
          size: resumeDetails.size,
          data: resumeDetails.base64,
        },
        message: formData.message,
        submittedAt: new Date(),
        
        shortListed:'No',
        Rejected:'No'
      });

      console.log('Document written with ID: ', docRef.id);
      setSubmitMessage('Your application has been submitted successfully!');
   try {
      await logNotification({
        subject: "Career Applicant",
        message: `New Application for ${positionToSave}`,
        additionalData: {
          applicantName: formData.name,
          applicantEmail: formData.email,
          position: positionToSave,
          applicationId: docRef.id,
          page: 'Career'
        }
      });
    } catch (notificationError) {
      console.error('Notification failed (non-critical):', notificationError);
    }
      setFormData({
        name: '',
        email: '',
        phone: '',
        position: '',
        customPosition: '',
        salaryExpectations: '',
        currentlyEmployed: '',
        portfolioLink: '',
        resume: null,
        message: '',
      });
      setResumeDetails({
        name: '',
        type: '',
        size: 0,
        base64: '',
      });

      const fileInput = document.getElementById('resume');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Error submitting application: ', error);
      setSubmitMessage('There was an error submitting your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="relative w-full h-[40vh] max-h-[400px] mt-16">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat h-full z-[-1]"
          style={{
            backgroundImage: `url('https://talent.koredigital.com.pk/wp-content/uploads/2023/10/silhouette-confident-businesspeople.webp')`,
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        </div>
        <div className="relative h-full flex items-center justify-center">
          <motion.h1
            className="text-4xl md:text-6xl font-bold text-white text-center px-4 text-yellow-600 hover:text-yellow-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Join Our Team
          </motion.h1>
        </div>
      </div>

      <section className="py-16 px-4 md:px-8 bg-gray-900">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 hover:text-gray-400">How We Work</h2>
              <p className="text-gray-300 text-lg mb-4 leading-relaxed">
                At our company, we foster an inclusive and innovative environment where every team member thrives. Collaboration, creativity, and continuous learning are at the core of our culture.
              </p>
              <p className="text-gray-300 text-lg mb-4 leading-relaxed">
                Our flexible work model supports a healthy work-life balance while upholding professional excellence. We encourage open communication and value diverse perspectives.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                Through team-building activities, professional development, and a supportive community, we create a workplace where you can grow personally and professionally.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="rounded-xl overflow-hidden shadow-2xl"
            >
              <img
                src="https://talent.koredigital.com.pk/wp-content/uploads/2023/10/businessman-looking-stock-chart-wall.webp"
                alt="Team working together"
                className="w-full h-[300px] md:h-[400px] object-cover"
                loading="lazy"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 md:px-8 bg-gray-800 w-full">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-yellow-500">Are You the One We’re Looking For ?</h2>
            <div className="space-y-8 text-gray-200 text-lg leading-relaxed">
              <p className="hover:bg-gray-700 hover:rounded-xl border-blue-600 hover:border-b-1">
                We’re seeking passionate, talented individuals who excel in innovation and problem-solving. Our ideal team members thrive in collaborative settings and bring fresh perspectives.
              </p>
              <p className="hover:bg-gray-700 hover:rounded-xl border-blue-600 hover:border-b-1">
                Diversity in backgrounds and experiences is what drives us. If you’re committed to growth, love tackling challenges, and want to make an impact, we’d love to hear from you.
              </p>
              <p className="hover:bg-gray-700 hover:rounded-xl border-blue-600 hover:border-b-1">
                Whether you’re a seasoned professional or just starting out, if you’re driven to contribute to our vision, you could be the perfect fit. Explore our openings or reach out today.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-8 bg-yellow-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-yellow-700 transition-colors duration-300"
            >
              <a href="#apply-form">Apply Now</a>
            </motion.button>
          </motion.div>
        </div>
      </section>

      <section id="apply-form" className="py-16 px-4 md:px-8 bg-gray-900">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gray-800 rounded-xl shadow-2xl p-8 md:p-10"
          >
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Apply Now</h2>
            {submitMessage && (
              <div
                className={`mb-6 p-4 rounded-lg text-center ${
                  submitMessage.includes('error') || submitMessage.includes('too large')
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {submitMessage}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-gray-200 font-medium mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-600 placeholder-gray-300 transition-colors duration-300 hover:bg-gray-600"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-gray-200 font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-600 placeholder-gray-300 transition-colors duration-300 hover:bg-gray-600"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-gray-200 font-medium mb-2">
                  Contact Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-600 placeholder-gray-300 transition-colors duration-300 hover:bg-gray-600"
                />
              </div>

              <div className="relative">
  <select
    value={formData.position}
    onChange={handleInputChange}
    onFocus={() => setIsPositionDropdownOpen(true)}
    onBlur={() => setIsPositionDropdownOpen(false)}
    name="position"
    className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-600 appearance-none pr-10"
  >
    <option value="">Select your position</option>
    {positionOptions.map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
  
  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
    <svg 
      className={`w-5 h-5 text-gray-300 transform transition-transform duration-200 ${
        isPositionDropdownOpen ? 'rotate-180' : ''
      }`}
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path strokeLinecap="round" color='yellow' strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </div>
</div>

{formData.position === 'Others' && (
  <div className="mt-4">
    <label htmlFor="customPosition" className="block text-gray-200 font-medium mb-2">
      Specify Position
    </label>
    <input
      type="text"
      id="customPosition"
      name="customPosition"
      value={formData.customPosition}
      onChange={handleInputChange}
      className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-600 placeholder-gray-300 transition-colors duration-300 hover:bg-gray-600"
      placeholder="Enter your position"
      required
    />
  </div>
)}
              <div>
                <label htmlFor="salaryExpectations" className="block text-gray-200 font-medium mb-2">
                  Salary Expectations
                </label>
                <input
                  type="text"
                  id="salaryExpectations"
                  name="salaryExpectations"
                  value={formData.salaryExpectations}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-600 placeholder-gray-300 transition-colors duration-300 hover:bg-gray-600"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-200 font-medium mb-2">Are you currently employed?</label>
                <div className="flex gap-6">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="employed-yes"
                      name="currentlyEmployed"
                      value="Yes"
                      checked={formData.currentlyEmployed === 'Yes'}
                      onChange={handleInputChange}
                      className="mr-2 text-yellow-600 focus:ring-yellow-600"
                      required
                    />
                    <label htmlFor="employed-yes" className="text-gray-200">
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="employed-no"
                      name="currentlyEmployed"
                      value="No"
                      checked={formData.currentlyEmployed === 'No'}
                      onChange={handleInputChange}
                      className="mr-2 text-yellow-600 focus:ring-yellow-600"
                    />
                    <label htmlFor="employed-no" className="text-gray-200">
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="portfolioLink" className="block text-gray-200 font-medium mb-2">
                  Portfolio Link
                </label>
                <input
                  type="url"
                  id="portfolioLink"
                  name="portfolioLink"
                  value={formData.portfolioLink}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-600 placeholder-gray-300 transition-colors duration-300 hover:bg-gray-600"
                />
              </div>

              <div>
                <label htmlFor="resume" className="block text-gray-200 font-medium mb-2">
                  Upload Your Resume
                </label>
                <input
                  type="file"
                  id="resume"
                  name="resume"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-600 file:bg-yellow-600 file:text-white file:border-none file:px-4 file:py-2 file:rounded-lg file:cursor-pointer transition-colors duration-300 hover:bg-gray-600"
                  accept=".pdf,.doc,.docx"
                  required
                />
                {formData.resume && (
                  <p className="mt-2 text-sm text-gray-300">
                    File: {formData.resume.name} ({Math.round(formData.resume.size / 1024)} KB)
                    {formData.resume.size > 750000 && (
                      <span className="text-red-500 ml-2">File size exceeds 7.50MB limit</span>
                    )}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="message" className="block text-gray-200 font-medium mb-2">
                  Additional Information
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="5"
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-600 placeholder-gray-300 transition-colors duration-300 hover:bg-gray-600"
                />
              </div>

              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isSubmitting || (formData.resume && formData.resume.size > 750000)}
                  className="bg-yellow-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-yellow-700 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>
        
    </div>
  );
};

export default CareersPage;