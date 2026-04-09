"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";
import axios from "axios";
import logo from "../assets/bizfull.png";

export default function HelpCenter() {
    const [formData, setFormData] = useState({
        email: "",
        subject: "",
        message: "",
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                subject: `jciamravati - ${formData.subject}`,
            };
            await axios.post("https://media.bizonance.in/mail/v1/system/help-center", payload);
            setIsSubmitted(true);
            setFormData({ email: "", subject: "", message: "" });
            setTimeout(() => setIsSubmitted(false), 3000);
        } catch (error) {
            console.error("Failed to send email:", error);
        }
    };

    return (
        <div className="h-screen bg-gradient-to-br flex items-start justify-center overflow-y-auto mb-4" style={{ height: "calc(100vh - 140px)" }}>
            <main className=" rounded-lg max-w-4xl w-full p-4 mt-10">
                <div className="flex flex-col items-center mb-8">
                    <img
                        src={logo}
                        alt="Company Logo"
                        className="h-[90px] object-contain"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 ">
                    {/* Contact Information Section */}
                    <div className="space-y-6">
                        <h3 className="text-md font-semibold">Contact Information</h3>
                        <ContactDetail icon={<Mail />} title="Email" text="info@bizonance.in" />
                        <ContactDetail icon={<Phone />} title="Phone" text="+918956727311" />
                        {/* <ContactDetail
                            icon={<MapPin />}
                            title="Address"
                            text={
                                "2nd Floor, Opp. Vyankatesh Lawn,\nShilangan Road, Saturna,\nAmaravati, Maharashtra 444607."
                            }
                        /> */}
                    </div>

                    {/* Contact Form Section */}
                    <div>
                        <h3 className="text-md font-semibold mb-4">Write your query to us</h3>
                        {isSubmitted && (
                            <div className="bg-green-100 text-green-800 p-3 rounded-md mb-4 flex items-center">
                                <CheckCircle className="w-5 h-5 mr-2" />
                                <span>Thank you for your message! We'll get back to you soon.</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <InputField
                                label="Email Address"
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <InputField
                                label="Subject"
                                id="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                            />
                            <TextAreaField
                                label="Message"
                                id="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                            />

                            <button
                                type="submit"
                                className="w-full bg-blue-400/30 hover:bg-blue-400/40 text-sm text-blue-900 py-3 px-4 rounded-md hover:bg-cyan-700 transition duration-200 ease-in-out transform hover:scale-105 flex items-center justify-center"
                            >
                                <Send className="w-5 h-5 mr-2" /> Send Request
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}

// Reusable ContactDetail Component
function ContactDetail({ icon, title, text }) {
    return (
        <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full">
                {icon}
            </div>
            <div>
                <h4 className="text-sm font-medium">{title}</h4>
                <p className="text-gray-600 whitespace-pre-line">{text}</p>
            </div>
        </div>
    );
}

// Reusable InputField Component
function InputField({ label, id, type = "text", value, onChange, required }) {
    return (
        <div>
            <label htmlFor={id} className="block text-gray-700 font-medium mb-2 text-sm">
                {label}
            </label>
            <input
                type={type}
                id={id}
                name={id}
                value={value}
                onChange={onChange}
                className="w-full text-sm border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required={required}
            />
        </div>
    );
}

// Reusable TextAreaField Component
function TextAreaField({ label, id, value, onChange, required }) {
    return (
        <div>
            <label htmlFor={id} className="block text-gray-700 font-medium mb-2 text-sm">
                {label}
            </label>
            <textarea
                id={id}
                name={id}
                value={value}
                onChange={onChange}
                rows={2}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required={required}
            ></textarea>
        </div>
    );
}
