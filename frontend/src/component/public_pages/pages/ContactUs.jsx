import React from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";

const Contact = () => {
  return (
    <div className="pt-32 pb-20 px-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-slate-900">Get in Touch</h1>
          <p className="text-slate-600 mt-4 italic">Fostering lifelong professional connections.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Info Side */}
          <div className="space-y-8">
            <ContactInfo 
              icon={<MapPin className="text-red-600" />} 
              title="Location" 
              content="ADYP School of Engineering, Pune " 
            />
            <ContactInfo 
              icon={<Mail className="text-red-600" />} 
              title="Email" 
              content="renuka.gavli@adypsoe.edu " 
            />
            <ContactInfo 
              icon={<Phone className="text-red-600" />} 
              title="Academic Office" 
              content="+91 20 6707 7922" 
            />
          </div>

          {/* Form Side */}
          <div className="lg:col-span-2 bg-white p-10 rounded-3xl shadow-xl shadow-slate-200">
            <form className="grid md:grid-cols-2 gap-6">
              <InputField label="Full Name" placeholder="Your Name" />
              <InputField label="User Role" placeholder="Student / Alumni / Admin " />
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
                <textarea 
                  rows="4" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  placeholder="How can we help you?"
                ></textarea>
              </div>
              <button className="md:col-span-2 bg-red-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-200">
                Send Message <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactInfo = ({ icon, title, content }) => (
  <div className="flex gap-6 items-start">
    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div>
      <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
      <p className="text-slate-600">{content}</p>
    </div>
  </div>
);

const InputField = ({ label, placeholder }) => (
  <div>
    <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
    <input 
      type="text" 
      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
      placeholder={placeholder}
    />
  </div>
);

export default Contact;