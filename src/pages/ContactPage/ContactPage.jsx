// src/pages/ContactPage/ContactPage.jsx
import React from "react";
import Header from "@/components/main/Header/Header";
import Footer from "@/components/main/Footer/Footer";
import "@/pages/ContactPage/ContactPage.css";
import Contacts from "@/components/contact/Contacts/Contacts";

const ContactPage = () => {
    return (
        <div className="contact-page-container">
            <Header />
            <div className="contact-content">
                <Contacts />
            </div>
            <Footer />
        </div>
    );
};

export default ContactPage;
