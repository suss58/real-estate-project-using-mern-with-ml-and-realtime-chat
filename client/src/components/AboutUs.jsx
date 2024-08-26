import React from 'react';
import { Link } from 'react-router-dom';

const AboutUs = () => {
  return (
    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold tracking-wide uppercase">About GHARKHOJI</h2>
          <p className="mt-2 text-4xl leading-10 font-extrabold tracking-tight">
            Your AI-Driven Real Estate Solution
          </p>
          <p className="mt-4 max-w-2xl text-xl lg:mx-auto">
            At GHARKHOJI, we aim to revolutionize the real estate market with advanced AI technology that provides accurate home valuations and a seamless user experience.
          </p>
        </div>

        <div className="mt-12 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex justify-center">
              <img 
                className="h-80 w-full object-cover rounded-lg shadow-2xl transform hover:scale-105 transition duration-500"
                src="https://cdn.pixabay.com/photo/2024/03/09/12/50/house-8622593_1280.jpg"
                alt="Real estate"
              />
            </div>
            <div className="flex justify-center">
              <img 
                className="h-80 w-full object-cover rounded-lg shadow-2xl transform hover:scale-105 transition duration-500"
                src="https://images.unsplash.com/photo-1557804506-669a67965ba0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDR8fHJlYWwlMjBlc3RhdGV8fDB8fHx8MTYwOTk2NTgyNA&ixlib=rb-1.2.1&q=80&w=1080"
                alt="Modern house"
              />
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white bg-opacity-50 backdrop-filter backdrop-blur-md p-10 rounded-lg shadow-2xl transform hover:scale-105 transition duration-500">
              <h3 className="text-2xl font-extrabold text-indigo-600">Our Vision</h3>
              <p className="mt-4 text-lg text-gray-900">
                We envision a world where technology simplifies real estate transactions, making them more transparent, efficient, and accessible to everyone.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12">
          <Link to={'/team'} >
          <div className="flex flex-col justify-center text-center md:text-left">
            <h3 className="text-2xl font-extrabold">Meet the Team</h3>
            <p className="mt-4 text-lg">
              Our team of engineers, data scientists, and real estate experts are committed to delivering innovative solutions that make your real estate experience better.
              <br/>
              want to know more about the the team? CLICK ME
              <br/>
              <br/>
            </p>
          </div>
          <div className="flex justify-center md:justify-end">
            <img 
              className="h-80 w-full object-cover rounded-lg shadow-2xl transform hover:scale-105 transition duration-500"
              src="https://cdn.pixabay.com/photo/2015/10/30/10/47/tug-of-war-1013740_640.jpg"
              alt="Teamwork"
            />
          </div>
          </Link>
        </div>
        
      </div>
    </div>
  );
};

export default AboutUs;
